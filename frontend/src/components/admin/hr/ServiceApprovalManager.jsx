import { useState, useEffect } from 'react';
import { 
    CheckCircle2, 
    XCircle, 
    Search, 
    Activity, 
    User, 
    AlertCircle, 
    Clock, 
    DollarSign,
    Scissors,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import AnimatedCounter from '../../common/AnimatedCounter';

export default function ServiceApprovalManager() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const response = await api.get('/bookings');
            const all = response.data?.data || response.data?.results || [];
            const payload = Array.isArray(all) ? all.filter(b => b.status === 'pending') : [];
            setBookings(Array.isArray(payload) ? payload : []);
        } catch (error) {
            console.error('[ServiceApproval] Fetch error:', error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id) => {
        try {
            setProcessingId(id);
            await api.patch(`/bookings/${id}/status`, { status: 'confirmed' });
            toast.success('Service Authorized. Commission Credited.');
            // Remove from list
            setBookings(prev => Array.isArray(prev) ? prev.filter(b => b._id !== id) : []);
        } catch (error) {
            console.error('[ServiceApproval] Action error:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const bookingsList = Array.isArray(bookings) ? bookings : [];

    const filtered = bookingsList.filter(b => {
        const staffName = b.staffId?.name || '';
        const clientName = b.clientId?.name || '';
        const serviceName = b.serviceId?.name || '';
        const s = searchTerm.toLowerCase();
        return staffName.toLowerCase().includes(s) || 
               clientName.toLowerCase().includes(s) || 
               serviceName.toLowerCase().includes(s);
    });

    if (loading && bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Activity className="w-12 h-12 text-primary animate-spin" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Loading pending services...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-left selection:bg-primary/30">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { 
                        label: 'Services to Approve', value: bookings.length, sub: 'Pending Verification', icon: Clock, trend: '',
                        iconColorClass: '!text-[#EA580C] dark:!text-[#FB923C]',
                        iconBgClass: '!bg-[#FFEDD5] dark:!bg-[#EA580C]/20',
                        cardBgClass: '!bg-[#FFF7ED] dark:!bg-[#EA580C]/5',
                        cardBorderClass: '!border-[#FFEDD5] dark:!border-[#EA580C]/15 hover:!border-[#FDBA74] dark:hover:!border-[#FB923C]/50',
                    },
                    { 
                        label: 'Approval Status', value: 'ACTIVE', sub: 'System Health', icon: CheckCircle2, trend: '',
                        iconColorClass: '!text-[#059669] dark:!text-[#34D399]',
                        iconBgClass: '!bg-[#D1FAE5] dark:!bg-[#059669]/20',
                        cardBgClass: '!bg-[#F0FDF4] dark:!bg-[#059669]/5',
                        cardBorderClass: '!border-[#DCFCE7] dark:!border-[#059669]/15 hover:!border-[#86EFAC] dark:hover:!border-[#34D399]/50',
                    },
                    { 
                        label: 'Current Branch', value: 'Main Outlet', sub: 'Active Location', icon: User, trend: '',
                        iconColorClass: '!text-[#2563EB] dark:!text-[#60A5FA]',
                        iconBgClass: '!bg-[#DBEAFE] dark:!bg-[#2563EB]/20',
                        cardBgClass: '!bg-[#EFF6FF] dark:!bg-[#2563EB]/5',
                        cardBorderClass: '!border-[#DBEAFE] dark:!border-[#2563EB]/15 hover:!border-[#93C5FD] dark:hover:!border-[#60A5FA]/50',
                    },
                ].map((s, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={s.label} 
                        className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md ${s.cardBgClass} ${s.cardBorderClass}`}
                    >
                        <div className="flex !items-start gap-3 !text-left">
                            <div className={`w-9 h-9 flex items-center justify-center shrink-0 !rounded-[12px] ${s.iconBgClass}`}>
                                <s.icon className={`w-4 h-4 ${s.iconColorClass}`} strokeWidth={2} />
                            </div>

                            <div className="flex flex-col !items-start !text-left">
                                <span
                                    style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }}
                                    className="uppercase text-slate-500 dark:text-slate-455 leading-none mb-1.5 !text-left"
                                >
                                    {s.label}
                                </span>
                                <h3
                                    style={{ fontSize: '24px', fontWeight: 850 }}
                                    className="text-slate-800 dark:text-slate-55 leading-none tracking-tight !text-left flex items-baseline"
                                >
                                    {s.label === 'Services to Approve' ? <AnimatedCounter value={s.value} /> : s.value}
                                </h3>
                                <span
                                    style={{ fontSize: '12px', fontWeight: 500 }}
                                    className="text-slate-500 dark:text-slate-400 mt-1.5 !text-left"
                                >
                                    {s.sub}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-surface p-5 border border-border flex flex-col md:flex-row items-center justify-between gap-6 !rounded-[16px]">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search by stylist, client, or service..."
                        className="w-full pl-12 pr-4 py-3 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all !rounded-[16px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={fetchPending}
                    className="px-6 py-3 bg-surface-alt border border-border text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all flex items-center gap-2 !rounded-[16px]"
                >
                    <Activity className="w-4 h-4 text-white" />
                    Refresh List
                </button>
            </div>

            {/* Matrix List */}
            <div className="bg-surface border border-border overflow-hidden shadow-2xl shadow-primary/5 !rounded-[16px]">
                <div className="px-4 py-2.5 border-b border-border/20 bg-background/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-primary" />
                        <h2 className="text-[10px] font-black text-text uppercase tracking-[0.3em]">Pending Service Approvals</h2>
                    </div>
                    <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 border border-primary/20">Action Required</span>
                </div>
                
                <div className="divide-y divide-border/10">
                    <AnimatePresence mode="popLayout">
                        {filtered.length > 0 ? filtered.map((b) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                key={b._id} 
                                className="p-3.5 flex flex-col md:flex-row items-center justify-between hover:bg-surface-alt/30 transition-all group relative overflow-hidden"
                            >
                                {/* Hover background effect */}
                                <div className="absolute top-0 left-0 w-[2px] h-0 bg-primary transition-all duration-500 group-hover:h-full" />

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-10 h-10 flex items-center justify-center bg-background border border-border text-primary shrink-0 relative group-hover:border-primary transition-colors !rounded-[12px]">
                                        <Scissors className="w-5 h-5" />
                                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 border border-surface animate-pulse !rounded-full" />
                                    </div>
                                    <div className="space-y-0.5 text-left">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors">{b.staffId?.name || 'Staff Member'}</p>
                                            <span className="text-[8px] px-1.5 py-0.5 bg-surface-alt border border-border text-text-muted font-black tracking-widest uppercase italic">Service Provider</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{b.serviceId?.name || 'Service Not Specified'}</p>
                                            <ArrowRight className="w-2.5 h-2.5 text-text-muted opacity-30" />
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">₹{b.price?.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-[9px] text-text-muted font-bold tracking-widest uppercase mt-1">
                                            <span className="flex items-center gap-1"><User className="w-3 h-3 opacity-50" /> {b.clientId?.name || 'Guest Client'}</span>
                                            <span className="opacity-20">|</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 opacity-50" /> {new Date(b.appointmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} {b.time}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0 w-full md:w-auto justify-end">
                                    <button
                                        disabled={processingId === b._id}
                                        onClick={() => handleApprove(b._id)}
                                        className={`group/btn flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all active:scale-95 whitespace-nowrap flex items-center gap-2 disabled:opacity-50 !rounded-[12px] ${processingId === b._id ? 'animate-pulse' : ''}`}
                                    >
                                        {processingId === b._id ? (
                                            <>
                                                <Activity className="w-3.5 h-3.5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-125" />
                                                Approve Service
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="p-24 text-center">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-block p-6 bg-primary/5 border border-primary/10 mb-6 !rounded-[16px]"
                                >
                                    <CheckCircle2 className="w-12 h-12 text-primary opacity-30 mx-auto" />
                                </motion.div>
                                <p className="text-[10px] font-black text-text uppercase tracking-[0.3em]">No Pending Approvals</p>
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-2 overflow-hidden whitespace-nowrap opacity-40">System Status: Optimal | All commissions synchronized</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Alert */}
            <div className="bg-primary/5 border border-primary/20 p-6 flex items-center gap-4 group !rounded-[16px]">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all !rounded-[16px]">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-[9px] font-black text-text uppercase tracking-[0.2em] mb-1">Important Notice</p>
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] leading-relaxed opacity-70 italic">
                        Confirming a service will calculate staff commissions and update performance records. This action cannot be reversed.
                    </p>
                </div>
            </div>
        </div>
    );
}
