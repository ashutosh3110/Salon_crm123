import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Search, Filter, Shield, Activity, ChevronRight, User, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';

export default function LeaveApprovalManager() {
    const [requests, setRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await api.get('/hr/leaves');
            const data = res.data?.data || [];
            const mapped = data.map(req => ({
                id: req._id,
                staffName: req.staffId?.name || 'Unknown',
                type: req.type,
                dates: `${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}`,
                reason: req.reason,
                status: req.status.toUpperCase(),
                appliedOn: new Date(req.createdAt).toLocaleDateString()
            }));
            setRequests(mapped);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchLeaves();
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleAction = async (id, newStatus) => {
        try {
            await api.put(`/hr/leaves/${id}`, { status: newStatus.toLowerCase() });
            showToast(`Protocol: ${newStatus === 'APPROVED' ? 'AUTHORIZED' : 'TERMINATED'}`);
            await fetchLeaves();
        } catch (e) {
            showToast('Action failed');
        }
    };

    const filtered = requests.filter(req => {
        const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
        const matchesSearch = (req.staffName || 'STYLIST_01').toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.type.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statusStyles = {
        'APPROVED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'PENDING': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'REJECTED': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };

    return (
        <div className="space-y-6 font-black text-left">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Pending_Verification', value: requests.filter(r => r.status === 'PENDING').length, color: 'text-amber-500' },
                    { label: 'Total_Authorized', value: requests.filter(r => r.status === 'APPROVED').length, color: 'text-emerald-500' },
                    { label: 'System_Log_Entries', value: requests.length, color: 'text-primary' },
                ].map((s) => (
                    <div key={s.label} className="bg-surface border border-border p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -translate-y-8 translate-x-8 rotate-45" />
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{s.label}</p>
                        <p className={`text-4xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-surface p-5 border border-border flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="SEARCH_BY_STAFF_OR_TYPE..."
                        className="w-full pl-12 pr-4 py-3 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === f ? 'bg-primary text-white border-primary' : 'text-text-muted hover:text-text border-border'}`}
                        >
                            {f === 'ALL' ? 'ALL_REQUESTS' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Matrix List */}
            <div className="bg-surface border border-border overflow-hidden">
                <div className="px-8 py-4 border-b border-border/20 bg-background/50 flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-text uppercase tracking-[0.3em]">Leave_Approval_Matrix</h2>
                    <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 border border-primary/20">Operational_Control</span>
                </div>
                <div className="divide-y divide-border/10">
                    {filtered.length > 0 ? filtered.map((req) => (
                        <div key={req.id} className="p-8 flex flex-col md:flex-row items-center justify-between hover:bg-surface-alt/30 transition-all group">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="w-12 h-12 flex items-center justify-center bg-background border border-border text-primary shrink-0">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="space-y-1 text-left">
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm font-black text-text uppercase tracking-tight">{req.staffName || 'STYLIST_01'}</p>
                                        <span className="text-[8px] px-2 py-0.5 bg-surface-alt border border-border text-text-muted font-black tracking-widest">RANK_04</span>
                                    </div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">{req.type}</p>
                                    <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase italic">
                                        [{req.dates}] <span className="mx-2 opacity-30">|</span> APPLIED_{req.appliedOn}
                                    </p>
                                    <p className="text-[9px] text-text-muted font-medium uppercase mt-2 italic max-w-sm">Reason: {req.reason}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-6 sm:mt-8 md:mt-0 w-full md:w-auto justify-end">
                                {req.status === 'PENDING' ? (
                                    <>
                                        <button
                                            onClick={() => handleAction(req.id, 'REJECTED')}
                                            className="flex-1 sm:flex-none px-6 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all active:scale-95 whitespace-nowrap"
                                        >
                                            Terminate
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, 'APPROVED')}
                                            className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all active:scale-95 whitespace-nowrap"
                                        >
                                            Authorize
                                        </button>
                                    </>
                                ) : (
                                    <div className={`w-full sm:w-auto px-6 py-2.5 border text-[9px] font-black uppercase tracking-[0.2em] text-center ${statusStyles[req.status]}`}>
                                        {req.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center">
                            <Activity className="w-12 h-12 text-border mx-auto mb-4 animate-pulse" />
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">No_Pending_Protocols_Detected</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Notification Loop */}
            <div className="bg-primary/5 border border-primary/20 p-6 flex items-center gap-4">
                <AlertCircle className="w-5 h-5 text-primary" />
                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] italic">
                    All decisions are cryptographically logged with root authorized bypass. Synchronizing with Stylist_Panel...
                </p>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
