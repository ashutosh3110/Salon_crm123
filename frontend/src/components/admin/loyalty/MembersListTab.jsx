import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    Settings,
    ShieldCheck,
    Clock,
    AlertCircle,
    Download,
    Eye,
    X,
    Star
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { maskPhone } from '../../../utils/phoneUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusiness } from '../../../contexts/BusinessContext';
import api from '../../../services/api';

export default function MembersListTab() {
    const { customers, outlets, activeOutletId, setActiveOutletId } = useBusiness();
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
    const [selectedMember, setSelectedMember] = useState(null);

    // Assignment Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [plans, setPlans] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [searchCustomerTerm, setSearchCustomerTerm] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const loadMembers = async () => {
            setLoading(true);
            try {
                const res = await api.get('/loyalty/members', {
                    params: {
                        page,
                        limit: 20,
                        search: searchTerm || undefined,
                        status: filter,
                        outletId: activeOutletId || undefined
                    },
                });
                const rows = res?.data?.data || [];
                setMembers(Array.isArray(rows) ? rows : []);
                setMeta(res?.data?.meta || { page: 1, totalPages: 1, total: rows.length, limit: 20 });
            } catch {
                setMembers([]);
            } finally {
                setLoading(false);
            }
        };
        loadMembers();
    }, [page, searchTerm, filter, activeOutletId]);

    // Load membership plans when assignment modal is shown
    useEffect(() => {
        if (showAssignModal) {
            const fetchPlans = async () => {
                try {
                    const res = await api.get('/loyalty/membership-plans');
                    setPlans(res.data?.data || []);
                } catch (err) {
                    console.error('Failed to fetch membership plans', err);
                }
            };
            fetchPlans();
        }
    }, [showAssignModal]);

    const handleAssignMembership = async (e) => {
        e.preventDefault();
        if (!selectedCustomerId || !selectedPlanId) {
            setErrorMessage('Please select both a customer and a plan.');
            return;
        }
        setAssigning(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const res = await api.post('/loyalty/membership/assign', {
                customerId: selectedCustomerId,
                planId: selectedPlanId
            });
            if (res.data?.success) {
                setSuccessMessage('Membership plan assigned successfully!');
                // Reload list
                setPage(1);
                setTimeout(() => {
                    setShowAssignModal(false);
                    setSelectedCustomerId('');
                    setSelectedPlanId('');
                    setSearchCustomerTerm('');
                    setSuccessMessage('');
                }, 1500);
            } else {
                setErrorMessage(res.data?.message || 'Failed to assign membership.');
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Server error occurred.');
        } finally {
            setAssigning(false);
        }
    };

    const downloadCsv = () => {
        const header = ['Name', 'Phone', 'Plan', 'Status', 'Joined', 'Expiry', 'Points'];
        const rows = members.map((m) => [
            m.name || 'Unknown',
            m.phone || '',
            m.loyaltyPlan || 'Standard',
            m.loyaltyStatus || 'active',
            m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : '',
            m.loyaltyExpiry ? new Date(m.loyaltyExpiry).toLocaleDateString('en-IN') : '',
            Number(m.totalPoints || 0),
        ]);
        const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `active-members-page-${page}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 italic">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="relative w-full lg:w-96 group text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Members / Phone / Plan..."
                        value={searchTerm}
                        onChange={e => { setPage(1); setSearchTerm(e.target.value); }}
                        className="w-full h-14 bg-surface border border-border/60 pl-12 pr-4 text-sm font-bold text-foreground focus:border-primary outline-none transition-all shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                    {['all', 'active', 'expired'].map((f) => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-6 py-3 border font-black text-[9px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filter === f
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'text-text-muted border-border/40 hover:bg-surface-alt'
                                }`}
                        >
                            {f} Members
                        </button>
                    ))}
                    
                    {/* Outlet Filter */}
                    <div className="flex items-center gap-2 ml-2 border-l border-border/40 pl-4">
                        <Filter className="w-3.5 h-3.5 text-text-muted" />
                        <select
                            value={activeOutletId || ''}
                            onChange={(e) => setActiveOutletId(e.target.value || null)}
                            className="bg-surface border border-border/40 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all min-w-[160px]"
                        >
                            <option value="">All Outlets</option>
                            {outlets.map(o => (
                                <option key={o._id || o.id} value={o._id || o.id}>
                                    {o.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button onClick={downloadCsv} className="p-3.5 border border-border/40 text-text-muted hover:text-primary hover:bg-primary/5 hover:border-primary/40 transition-all shadow-sm">
                        <Download size={18} />
                    </button>
                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="px-6 py-3.5 bg-primary text-white border border-primary font-black text-[9px] uppercase tracking-[0.2em] transition-all whitespace-nowrap hover:bg-primary-dark hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Assign Plan
                    </button>
                </div>
            </div>

            <div className="bg-surface border border-border/40 overflow-hidden text-left">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface-alt border-b border-border/40">
                            <tr>
                                <Th>Customer Identity</Th>
                                <Th>Subscription Tier</Th>
                                <Th>Protocol Status</Th>
                                <Th>Join Cycle</Th>
                                <Th>Expiry Timeline</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-sm font-bold text-text-muted">Loading active members...</td></tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-surface-alt/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic">
                                                    {(member.name || 'U')[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-foreground italic tracking-tight">{member.name || 'Unknown'}</div>
                                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mt-1">{maskPhone(member.phone || '', user?.role)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-black text-foreground uppercase italic tracking-tighter">{member.loyaltyPlan || 'Standard'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5"><StatusBadge status={member.loyaltyStatus || 'active'} /></td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground opacity-80">{new Date(member.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mt-1 italic">Initiated</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 italic">
                                                <Clock className="w-3 h-3 text-text-muted" />
                                                <span className="text-xs font-bold">{member.loyaltyExpiry || 'NEVER'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setSelectedMember(member)}
                                                    className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all">
                                                    <Settings size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Member Details Modal */}
            <AnimatePresence>
                {selectedMember && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-surface border border-border w-full max-w-lg overflow-hidden shadow-2xl rounded-none font-sans"
                        >
                            {/* Modal Header */}
                            <div className="bg-surface-alt border-b border-border/40 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    <h3 className="text-sm font-black uppercase tracking-widest italic">Member Protocol Details</h3>
                                </div>
                                <button onClick={() => setSelectedMember(null)} className="text-text-muted hover:text-primary transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 space-y-8">
                                {/* Profile Header */}
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-2xl font-black italic shadow-inner">
                                        {(selectedMember.name || 'U')[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-foreground italic tracking-tight leading-none">
                                            {selectedMember.name || 'Unknown Client'}
                                        </h4>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-2">
                                            {maskPhone(selectedMember.phone || '', user?.role)}
                                        </p>
                                    </div>
                                </div>

                                {/* Subscription Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-surface-alt border border-border/40 group hover:border-primary/30 transition-all">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1.5">Current Tier</span>
                                        <span className="text-sm font-black text-primary uppercase italic">{selectedMember.loyaltyPlan || 'STANDARD'}</span>
                                    </div>
                                    <div className="p-4 bg-surface-alt border border-border/40 group hover:border-emerald-500/30 transition-all">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1.5">Protocol Status</span>
                                        <StatusBadge status={selectedMember.loyaltyStatus || 'active'} />
                                    </div>
                                    <div className="p-4 bg-surface-alt border border-border/40 group hover:border-text/30 transition-all">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1.5">Activation Date</span>
                                        <span className="text-sm font-black text-foreground italic">{new Date(selectedMember.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="p-4 bg-surface-alt border border-border/40 group hover:border-text/30 transition-all">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1.5">Expiry Timeline</span>
                                        <span className="text-sm font-black text-foreground italic">{selectedMember.loyaltyExpiry || 'NEVER'}</span>
                                    </div>
                                </div>

                                {/* Points Wallet */}
                                <div className="p-6 bg-primary/5 border border-primary/20 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Star className="w-5 h-5 text-primary" fill="currentColor" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block leading-none mb-1">Accumulated Points</span>
                                            <span className="text-xs font-bold text-text-secondary uppercase tracking-tighter">Loyalty Ledger Balance</span>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black text-primary italic tracking-tighter">
                                        {Number(selectedMember.totalPoints || 0)}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-surface-alt border-t border-border/40 px-6 py-4 flex justify-end">
                                <button 
                                    onClick={() => setSelectedMember(null)}
                                    className="px-6 py-2.5 bg-text text-background text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-lg"
                                >
                                    Close Registry
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Assign Membership Plan Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-surface border border-border w-full max-w-lg overflow-hidden shadow-2xl rounded-none font-sans"
                        >
                            {/* Modal Header */}
                            <div className="bg-surface-alt border-b border-border/40 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    <h3 className="text-sm font-black uppercase tracking-widest italic">Assign Subscription Plan</h3>
                                </div>
                                <button 
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedCustomerId('');
                                        setSelectedPlanId('');
                                        setSearchCustomerTerm('');
                                        setErrorMessage('');
                                        setSuccessMessage('');
                                    }} 
                                    className="text-text-muted hover:text-primary transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleAssignMembership} className="p-8 space-y-6 text-left">
                                {errorMessage && (
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errorMessage}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        {successMessage}
                                    </div>
                                )}

                                {/* Search & Select Customer */}
                                <div className="relative">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2">Select Customer</label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Type customer name or phone..."
                                            value={searchCustomerTerm}
                                            onChange={(e) => setSearchCustomerTerm(e.target.value)}
                                            className="w-full h-12 bg-surface border border-border/40 pl-12 pr-4 text-xs font-bold text-foreground focus:border-primary outline-none transition-all shadow-sm"
                                        />
                                        {selectedCustomerId && (
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCustomerId('');
                                                    setSearchCustomerTerm('');
                                                }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {searchCustomerTerm && !selectedCustomerId && (
                                        <div className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto bg-surface border border-border shadow-2xl divide-y divide-border/20">
                                            {customers
                                                .filter(c => 
                                                    (c.name || '').toLowerCase().includes(searchCustomerTerm.toLowerCase()) || 
                                                    (c.phone || '').includes(searchCustomerTerm)
                                                )
                                                .slice(0, 10)
                                                .map(c => (
                                                    <button
                                                        key={c._id || c.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCustomerId(c._id || c.id);
                                                            setSearchCustomerTerm(`${c.name || 'Unknown'} (${c.phone || ''})`);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors text-xs font-black italic flex justify-between items-center"
                                                    >
                                                        <span>{c.name || 'Unknown'}</span>
                                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{c.phone || ''}</span>
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>

                                {/* Select Membership Plan */}
                                <div>
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2">Select Membership Plan</label>
                                    <select
                                        value={selectedPlanId}
                                        onChange={(e) => setSelectedPlanId(e.target.value)}
                                        className="w-full h-12 bg-surface border border-border/40 px-4 text-xs font-bold text-foreground focus:border-primary outline-none transition-all shadow-sm"
                                    >
                                        <option value="">-- Choose a Plan --</option>
                                        {plans.map(p => (
                                            <option key={p._id || p.id} value={p._id || p.id}>
                                                {p.name} - ₹{p.price} ({p.duration} Days)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Modal Footer / Actions */}
                                <div className="bg-surface-alt border-t border-border/40 -mx-8 -mb-8 px-8 py-4 flex justify-end gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setShowAssignModal(false);
                                            setSelectedCustomerId('');
                                            setSelectedPlanId('');
                                            setSearchCustomerTerm('');
                                            setErrorMessage('');
                                            setSuccessMessage('');
                                        }}
                                        className="px-6 py-2.5 border border-border/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-surface transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={assigning}
                                        className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {assigning ? 'Activating...' : 'Activate Subscription'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Th({ children, className }) {
    return <th className={`px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest italic ${className}`}>{children}</th>;
}

function StatusBadge({ status }) {
    const styles = {
        active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
        expired: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
        cancelled: 'bg-white/5 text-text-muted border-white/10',
    };
    return (
        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border leading-none ${styles[status]}`}>
            {status}
        </span>
    );
}
