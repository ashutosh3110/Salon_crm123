import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    ChevronDown,
    Star,
    Printer,
    FileText
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
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Assignment Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [plans, setPlans] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [searchCustomerTerm, setSearchCustomerTerm] = useState('');
    const [selectedOutletId, setSelectedOutletId] = useState(activeOutletId || '');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceTab, setInvoiceTab] = useState('standard'); // 'standard' or 'thermal'
    const [assigning, setAssigning] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchingCustomers, setSearchingCustomers] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const hasOpenModal = !!selectedMember || !!showAssignModal || !!selectedInvoice;
        document.body.style.overflow = hasOpenModal ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedMember, showAssignModal, selectedInvoice]);

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
    }, [page, searchTerm, filter, activeOutletId, refreshTrigger]);

    // Load membership plans when assignment modal is shown
    useEffect(() => {
        if (showAssignModal) {
            setSelectedOutletId(activeOutletId || '');
            setPaymentMethod('cash');
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
    }, [showAssignModal, activeOutletId]);

    // Dynamic, debounced client query
    useEffect(() => {
        if (!searchCustomerTerm || selectedCustomerId) {
            setSearchResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            setSearchingCustomers(true);
            try {
                const res = await api.get(`/clients`, {
                    params: {
                        search: searchCustomerTerm,
                        limit: 50
                    }
                });
                const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
                setSearchResults(list);
            } catch (err) {
                console.error('Failed to search customers', err);
            } finally {
                setSearchingCustomers(false);
            }
        }, 300);
        
        return () => clearTimeout(delayDebounceFn);
    }, [searchCustomerTerm, selectedCustomerId]);

    const handleAssignMembership = async (e) => {
        e.preventDefault();
        if (!selectedCustomerId || !selectedPlanId) {
            setErrorMessage('Please select both a customer and a plan.');
            return;
        }
        if (paymentMethod === 'wallet' && selectedCustomer) {
            const selectedPlan = plans.find(p => String(p._id || p.id) === String(selectedPlanId));
            if (selectedPlan) {
                const basePrice = Number(selectedPlan.price || 0);
                const taxRate = Number(selectedPlan.taxRate || 0);
                const calculatedTotal = selectedPlan.taxType === 'including' ? basePrice : basePrice + (basePrice * taxRate) / 100;
                if ((selectedCustomer.walletBalance || 0) < calculatedTotal) {
                    setErrorMessage('Insufficient wallet balance to assign this plan.');
                    return;
                }
            }
        }
        setAssigning(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const res = await api.post('/loyalty/membership/assign', {
                customerId: selectedCustomerId,
                planId: selectedPlanId,
                outletId: selectedOutletId || undefined,
                paymentMethod: paymentMethod
            });
            if (res.data?.success) {
                setSuccessMessage('Membership plan assigned successfully!');
                const createdInvoiceId = res.data?.data?.invoiceId;
                
                // Reload list
                setRefreshTrigger(prev => prev + 1);
                setPage(1);
                
                setTimeout(async () => {
                    setShowAssignModal(false);
                    setSelectedCustomerId('');
                    setSelectedCustomer(null);
                    setSelectedPlanId('');
                    setSearchCustomerTerm('');
                    setSuccessMessage('');
                    
                    if (createdInvoiceId) {
                        try {
                            const invRes = await api.get(`/pos/invoices/${createdInvoiceId}`);
                            if (invRes.data?.success && invRes.data?.data) {
                                setSelectedInvoice(invRes.data.data);
                                setInvoiceTab('standard');
                            }
                        } catch (invErr) {
                            console.error('Failed to load invoice for printing:', invErr);
                        }
                    }
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

    const fetchAndShowInvoice = async (invoiceId) => {
        if (!invoiceId) return;
        try {
            const res = await api.get(`/pos/invoices/${invoiceId}`);
            if (res.data?.success && res.data?.data) {
                setSelectedInvoice(res.data.data);
                setInvoiceTab('standard');
            } else {
                alert('Invoice could not be retrieved.');
            }
        } catch (err) {
            console.error('Error fetching invoice details:', err);
            alert('Failed to load invoice details.');
        }
    };

    return (
        <div className="space-y-6 italic">
            <div className="flex flex-col gap-4">
                {/* Row 1: Search & Primary Action */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                    <div className="relative w-full sm:w-96 group text-left">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Members / Phone / Plan..."
                            value={searchTerm}
                            onChange={e => { setPage(1); setSearchTerm(e.target.value); }}
                            className="w-full h-14 bg-surface border border-border/60 pl-12 pr-4 text-sm font-bold text-foreground focus:border-primary outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="px-6 h-14 bg-primary text-white border border-primary font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-primary-dark hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Assign Plan
                    </button>
                </div>

                {/* Row 2: Filter Options */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center border-t border-border/20 pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {['all', 'active', 'expired'].map((f) => (
                            <button
                                key={f}
                                onClick={() => { setFilter(f); setPage(1); }}
                                className={`px-5 py-3 border font-black text-[9px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filter === f
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'text-text-muted border-border/40 hover:bg-surface-alt'
                                    }`}
                            >
                                {f} Members
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Outlet Filter */}
                        <div className="flex items-center gap-2 border border-border/40 px-3 py-2 bg-surface">
                            <Filter className="w-3.5 h-3.5 text-text-muted" />
                            <select
                                value={activeOutletId || ''}
                                onChange={(e) => setActiveOutletId(e.target.value || null)}
                                className="bg-transparent text-[9px] font-black uppercase tracking-widest outline-none focus:border-transparent transition-all min-w-[160px] text-foreground cursor-pointer"
                            >
                                <option value="">All Outlets</option>
                                {outlets.map(o => (
                                    <option key={o._id || o.id} value={o._id || o.id} className="bg-surface">
                                        {o.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button onClick={downloadCsv} className="p-3 border border-border/40 text-text-muted hover:text-primary hover:bg-primary/5 hover:border-primary/40 transition-all shadow-sm flex items-center justify-center bg-surface" title="Download CSV">
                            <Download size={16} />
                        </button>
                    </div>
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
                                                {member.invoiceId && (
                                                    <button 
                                                        onClick={() => fetchAndShowInvoice(member.invoiceId)}
                                                        className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all"
                                                        title="Print Invoice / Bill"
                                                    >
                                                        <Printer size={16} />
                                                    </button>
                                                )}
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
                {selectedMember && createPortal(
                    <div 
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setSelectedMember(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl rounded-none font-sans text-slate-800"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Member Protocol Details</h3>
                                </div>
                                <button 
                                    onClick={() => setSelectedMember(null)} 
                                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 space-y-6">
                                {/* Profile Header */}
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-2xl font-black italic shadow-inner">
                                        {(selectedMember.name || 'U')[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 italic tracking-tight leading-none">
                                            {selectedMember.name || 'Unknown Client'}
                                        </h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
                                            {maskPhone(selectedMember.phone || '', user?.role)}
                                        </p>
                                    </div>
                                </div>

                                {/* Subscription Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 border border-slate-200 group hover:border-primary/30 transition-all text-left">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Current Tier</span>
                                        <span className="text-sm font-black text-primary uppercase italic">{selectedMember.loyaltyPlan || 'STANDARD'}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-200 group hover:border-emerald-500/30 transition-all text-left">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Protocol Status</span>
                                        <StatusBadge status={selectedMember.loyaltyStatus || 'active'} />
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-200 group hover:border-slate-300 transition-all text-left">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Activation Date</span>
                                        <span className="text-sm font-black text-slate-900 italic">{new Date(selectedMember.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-200 group hover:border-slate-300 transition-all text-left">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Expiry Timeline</span>
                                        <span className="text-sm font-black text-slate-900 italic">{selectedMember.loyaltyExpiry || 'NEVER'}</span>
                                    </div>
                                </div>

                                {/* Points Wallet */}
                                <div className="p-6 bg-primary/5 border border-primary/20 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Star className="w-5 h-5 text-primary" fill="currentColor" />
                                        </div>
                                        <div className="text-left">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Accumulated Points</span>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Loyalty Ledger Balance</span>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black text-primary italic tracking-tighter">
                                        {Number(selectedMember.totalPoints || 0)}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end">
                                <button 
                                    onClick={() => setSelectedMember(null)}
                                    className="px-6 py-2.5 bg-slate-900 hover:bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg rounded-none"
                                >
                                    Close Registry
                                </button>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>

            {/* Assign Membership Plan Modal */}
            <AnimatePresence>
                {showAssignModal && createPortal(
                    <div 
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => {
                            setShowAssignModal(false);
                            setSelectedCustomerId('');
                            setSelectedCustomer(null);
                            setSelectedPlanId('');
                            setSearchCustomerTerm('');
                            setErrorMessage('');
                            setSuccessMessage('');
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl rounded-none font-sans text-slate-800 flex flex-col max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Assign Subscription Plan</h3>
                                </div>
                                <button 
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedCustomerId('');
                                        setSelectedCustomer(null);
                                        setSelectedPlanId('');
                                        setSearchCustomerTerm('');
                                        setErrorMessage('');
                                        setSuccessMessage('');
                                    }} 
                                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleAssignMembership} className="p-8 space-y-6 text-left overflow-y-auto no-scrollbar flex-1">
                                {errorMessage && (
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errorMessage}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        {successMessage}
                                    </div>
                                )}

                                {/* Search & Select Customer */}
                                <div className="relative" ref={dropdownRef}>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Customer</label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Type to search or select customer..."
                                            value={searchCustomerTerm}
                                            onFocus={() => setShowDropdown(true)}
                                            onChange={(e) => {
                                                setSearchCustomerTerm(e.target.value);
                                                setSelectedCustomerId('');
                                                setSelectedCustomer(null);
                                                setShowDropdown(true);
                                            }}
                                            className="w-full h-12 bg-slate-50 border border-slate-200 pl-12 pr-10 text-xs font-bold text-slate-900 focus:border-primary outline-none transition-all shadow-sm rounded-none"
                                        />
                                        {selectedCustomerId ? (
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCustomerId('');
                                                    setSelectedCustomer(null);
                                                    setSearchCustomerTerm('');
                                                    setShowDropdown(false);
                                                }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                                            >
                                                <X size={16} />
                                            </button>
                                        ) : (
                                            <button 
                                                type="button"
                                                onClick={() => setShowDropdown(!showDropdown)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                                            >
                                                <ChevronDown size={16} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {showDropdown && (
                                        <div className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-2xl divide-y divide-slate-100">
                                            {searchCustomerTerm ? (
                                                searchingCustomers ? (
                                                    <div className="px-4 py-3 text-xs font-bold text-slate-400 italic">Searching customer database...</div>
                                                ) : searchResults.length === 0 ? (
                                                    <div className="px-4 py-3 text-xs font-bold text-slate-400 italic">No matching customers found.</div>
                                                ) : (
                                                    searchResults.map(c => (
                                                        <div
                                                            key={c._id || c.id}
                                                            onClick={() => {
                                                                setSelectedCustomerId(c._id || c.id);
                                                                setSelectedCustomer(c);
                                                                setSearchCustomerTerm(`${c.name || 'Unknown'} (${c.phone || ''})`);
                                                                setSearchResults([]);
                                                                setShowDropdown(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-xs font-black italic flex justify-between items-center cursor-pointer text-slate-900"
                                                        >
                                                            <span>{c.name || 'Unknown'}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.phone || ''}</span>
                                                        </div>
                                                    ))
                                                )
                                            ) : (
                                                /* Show preloaded customers when search input is empty */
                                                customers && customers.length > 0 ? (
                                                    customers.slice(0, 15).map(c => (
                                                        <div
                                                            key={c._id || c.id}
                                                            onClick={() => {
                                                                setSelectedCustomerId(c._id || c.id);
                                                                setSelectedCustomer(c);
                                                                setSearchCustomerTerm(`${c.name || 'Unknown'} (${c.phone || ''})`);
                                                                setShowDropdown(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-xs font-black italic flex justify-between items-center cursor-pointer text-slate-900"
                                                        >
                                                            <span>{c.name || 'Unknown'}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.phone || ''}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-xs font-bold text-slate-400 italic">No customers loaded. Start typing to search.</div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Select Membership Plan */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Membership Plan</label>
                                    <select
                                        value={selectedPlanId}
                                        onChange={(e) => setSelectedPlanId(e.target.value)}
                                        className="w-full h-12 bg-slate-50 border border-slate-200 px-4 text-xs font-bold text-slate-900 focus:border-primary outline-none transition-all shadow-sm rounded-none"
                                    >
                                        <option value="">-- Choose a Plan --</option>
                                        {plans.map(p => (
                                            <option key={p._id || p.id} value={p._id || p.id}>
                                                {p.name} - ₹{p.price} ({p.duration} Days) — {p.taxType === 'including' ? 'Incl.' : 'Excl.'} {p.taxRate}% GST
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Select Outlet */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Outlet</label>
                                        <select
                                            value={selectedOutletId}
                                            onChange={(e) => setSelectedOutletId(e.target.value)}
                                            className="w-full h-12 bg-slate-50 border border-slate-200 px-4 text-xs font-bold text-slate-900 focus:border-primary outline-none transition-all shadow-sm rounded-none"
                                        >
                                            <option value="">-- Choose Outlet --</option>
                                            {outlets.map(o => (
                                                <option key={o._id || o.id} value={o._id || o.id}>
                                                    {o.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Select Payment Method */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Payment Method</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full h-12 bg-slate-50 border border-slate-200 px-4 text-xs font-bold text-slate-900 focus:border-primary outline-none transition-all shadow-sm rounded-none"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="online">UPI / Online</option>
                                            <option value="wallet">Wallet Balance</option>
                                        </select>
                                    </div>
                                </div>

                                {paymentMethod === 'wallet' && (
                                    selectedCustomer ? (
                                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-between rounded-none animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <Star className="w-5 h-5 text-emerald-600" fill="currentColor" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-[10px] font-black uppercase tracking-wider block">Wallet Balance</span>
                                                    <span className="text-[10px] font-medium text-emerald-700/80">Available funds in customer's account</span>
                                                </div>
                                            </div>
                                            <div className="text-xl font-black font-mono">
                                                ₹{(selectedCustomer.walletBalance || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-600 flex items-center gap-2.5 rounded-none animate-in fade-in slide-in-from-top-2 duration-200">
                                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-left">Please select a customer first to view wallet balance.</span>
                                        </div>
                                    )
                                )}

                                {(() => {
                                    if (paymentMethod !== 'wallet' || !selectedCustomer || !selectedPlanId) return null;
                                    const selectedPlan = plans.find(p => String(p._id || p.id) === String(selectedPlanId));
                                    if (!selectedPlan) return null;
                                    
                                    const basePrice = Number(selectedPlan.price || 0);
                                    const taxRate = Number(selectedPlan.taxRate || 0);
                                    let calculatedTotal = 0;
                                    if (selectedPlan.taxType === 'including') {
                                        calculatedTotal = basePrice;
                                    } else {
                                        calculatedTotal = basePrice + (basePrice * taxRate) / 100;
                                    }

                                    const isWalletInsufficient = (selectedCustomer.walletBalance || 0) < calculatedTotal;
                                    if (isWalletInsufficient) {
                                        return (
                                            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <span>Insufficient Wallet Balance. Plan cost: ₹{calculatedTotal.toFixed(2)}, Wallet: ₹{(selectedCustomer.walletBalance || 0).toFixed(2)}.</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* Detailed Tax & Price Breakdown */}
                                {selectedPlanId && (() => {
                                    const selectedPlan = plans.find(p => String(p._id || p.id) === String(selectedPlanId));
                                    if (!selectedPlan) return null;

                                    const basePrice = Number(selectedPlan.price || 0);
                                    const taxRate = Number(selectedPlan.taxRate || 0);
                                    let calculatedBase = 0;
                                    let calculatedTax = 0;
                                    let calculatedTotal = 0;

                                    if (selectedPlan.taxType === 'including') {
                                        calculatedTotal = basePrice;
                                        calculatedBase = basePrice / (1 + taxRate / 100);
                                        calculatedTax = calculatedTotal - calculatedBase;
                                    } else {
                                        calculatedBase = basePrice;
                                        calculatedTax = basePrice * (taxRate / 100);
                                        calculatedTotal = basePrice + calculatedTax;
                                    }

                                    return (
                                        <div className="p-4 bg-slate-50 border border-slate-200 space-y-2 mt-4 italic text-slate-800">
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Plan Cost & Tax Ledger</div>
                                            <div className="flex justify-between text-xs font-black">
                                                <span className="text-slate-400 uppercase">Base Price:</span>
                                                <span>₹{calculatedBase.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-black text-primary">
                                                <span className="uppercase">GST ({taxRate}%):</span>
                                                <span>{selectedPlan.taxType === 'including' ? 'INCLUDED' : '+'} ₹{calculatedTax.toFixed(2)}</span>
                                            </div>
                                            <div className="h-[1px] bg-slate-200 my-1" />
                                            <div className="flex justify-between text-sm font-black text-slate-900">
                                                <span className="uppercase">Total Amount Payable:</span>
                                                <span>₹{calculatedTotal.toFixed(2)}</span>
                                            </div>
                                            {paymentMethod === 'wallet' && selectedCustomer && (
                                                <>
                                                    <div className="h-[1px] bg-slate-200 my-1 border-dashed" />
                                                    <div className="flex justify-between text-xs font-black text-emerald-600">
                                                        <span className="uppercase">Est. Wallet After Purchase:</span>
                                                        <span>₹{Math.max(0, (selectedCustomer.walletBalance || 0) - calculatedTotal).toFixed(2)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })()}
                            </form>

                            {/* Modal Footer / Actions */}
                            <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex justify-end gap-3 shrink-0">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedCustomerId('');
                                        setSelectedCustomer(null);
                                        setSelectedPlanId('');
                                        setSearchCustomerTerm('');
                                        setErrorMessage('');
                                        setSuccessMessage('');
                                    }}
                                    className="px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 bg-white text-[10px] font-black uppercase tracking-[0.2em] rounded-none transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={
                                        assigning || 
                                        (paymentMethod === 'wallet' && selectedCustomer && (() => {
                                            const selectedPlan = plans.find(p => String(p._id || p.id) === String(selectedPlanId));
                                            if (!selectedPlan) return false;
                                            const basePrice = Number(selectedPlan.price || 0);
                                            const taxRate = Number(selectedPlan.taxRate || 0);
                                            const calculatedTotal = selectedPlan.taxType === 'including' ? basePrice : basePrice + (basePrice * taxRate) / 100;
                                            return (selectedCustomer.walletBalance || 0) < calculatedTotal;
                                        })())
                                    }
                                    className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50 flex items-center gap-2 rounded-none shadow-lg"
                                >
                                    {assigning ? 'Activating...' : 'Activate Subscription'}
                                </button>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>

            {/* Invoice Preview Modal (Standard/Thermal) */}
            <AnimatePresence>
                {selectedInvoice && createPortal(
                    <div 
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print"
                        onClick={() => setSelectedInvoice(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white border border-slate-200 w-full max-w-2xl overflow-hidden shadow-2xl rounded-none font-sans flex flex-col max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-primary" />
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Invoice Billing Ledger</h3>
                                </div>
                                <button 
                                    onClick={() => setSelectedInvoice(null)} 
                                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Format Switcher Tab Bar */}
                            <div className="flex border-b border-slate-100 bg-slate-50 p-1 shrink-0">
                                <button
                                    onClick={() => setInvoiceTab('standard')}
                                    className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-widest transition-all rounded-none ${
                                        invoiceTab === 'standard'
                                            ? 'bg-white text-slate-900 border border-slate-200 font-extrabold shadow-sm'
                                            : 'text-slate-400 hover:text-slate-950'
                                    }`}
                                >
                                    Standard Invoice (A4)
                                </button>
                                <button
                                    onClick={() => setInvoiceTab('thermal')}
                                    className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-widest transition-all rounded-none ${
                                        invoiceTab === 'thermal'
                                            ? 'bg-white text-slate-900 border border-slate-200 font-extrabold shadow-sm'
                                            : 'text-slate-400 hover:text-slate-950'
                                    }`}
                                >
                                    Thermal POS Receipt (80mm)
                                </button>
                            </div>

                            {/* Modal Body / Invoice Sheet */}
                            <div className="p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1 no-scrollbar">
                                {invoiceTab === 'standard' ? (
                                    /* Standard A4 Styled Invoice Sheet */
                                    <div id="invoice-print-area" className="w-full bg-white border border-slate-200 shadow-sm p-8 text-black text-left font-mono text-[11px] leading-relaxed select-text print:border-0 print:shadow-none print:p-0 print:m-0 print:w-full">
                                        <div className="flex justify-between items-start border-b border-black/80 pb-6 mb-6">
                                            <div>
                                                <h1 className="text-xl font-black uppercase tracking-tight text-black">{selectedInvoice.salonId?.brandName || 'SALON LEDGER'}</h1>
                                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Official Invoice & Subscription Manifest</p>
                                                <p className="text-[9px] text-gray-500 mt-1">{selectedInvoice.outletId?.name || 'Main Branch'}</p>
                                            </div>
                                            <div className="text-right">
                                                <h2 className="text-md font-black uppercase italic text-primary">{selectedInvoice.invoiceNumber || 'INV-TEMP'}</h2>
                                                <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">Date: {new Date(selectedInvoice.createdAt).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mb-6 text-[10px]">
                                            <div className="space-y-1">
                                                <div className="font-black text-gray-500 uppercase tracking-widest">Billed To</div>
                                                <div className="font-extrabold text-sm">{selectedInvoice.clientId?.name || 'Walk-in Customer'}</div>
                                                <div>Phone: {selectedInvoice.clientId?.phone || '-'}</div>
                                                {selectedInvoice.clientId?.email && <div>Email: {selectedInvoice.clientId?.email}</div>}
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <div className="font-black text-gray-500 uppercase tracking-widest">Transaction details</div>
                                                <div>Payment Method: <span className="font-extrabold uppercase">{selectedInvoice.paymentMethod || 'CASH'}</span></div>
                                                <div>Status: <span className="font-extrabold uppercase text-emerald-600">{selectedInvoice.paymentStatus || 'PAID'}</span></div>
                                                {selectedInvoice.staffId && <div>Billed By: <span className="font-extrabold uppercase">{selectedInvoice.staffId.name || selectedInvoice.staffId}</span></div>}
                                            </div>
                                        </div>

                                        <table className="w-full border-collapse mb-6 text-[10px]">
                                            <thead>
                                                <tr className="border-y border-black font-black uppercase tracking-wider text-left bg-gray-50">
                                                    <th className="py-2.5 px-2">Description</th>
                                                    <th className="py-2.5 px-2 text-right">Qty</th>
                                                    <th className="py-2.5 px-2 text-right">Rate</th>
                                                    <th className="py-2.5 px-2 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {selectedInvoice.items?.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="py-3 px-2 font-extrabold text-black uppercase">{item.name || 'Membership Subscription Plan'}</td>
                                                        <td className="py-3 px-2 text-right">{item.quantity || 1}</td>
                                                        <td className="py-3 px-2 text-right">₹{(item.price || 0).toLocaleString('en-IN')}</td>
                                                        <td className="py-3 px-2 text-right font-extrabold">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className="w-full flex justify-end">
                                            <div className="w-72 space-y-2 border-t border-black/20 pt-4 text-[10px]">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 uppercase">Subtotal:</span>
                                                    <span className="font-bold">₹{(selectedInvoice.subtotal || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 uppercase">Base Amount:</span>
                                                    <span className="font-bold">₹{(selectedInvoice.baseAmount || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between text-primary">
                                                    <span className="uppercase">CGST (9%):</span>
                                                    <span>₹{(selectedInvoice.cgst || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between text-primary">
                                                    <span className="uppercase">SGST (9%):</span>
                                                    <span>₹{(selectedInvoice.sgst || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                                {selectedInvoice.discount > 0 && (
                                                    <div className="flex justify-between text-rose-500">
                                                        <span className="uppercase">Discount:</span>
                                                        <span>-₹{(selectedInvoice.discount || 0).toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                                <div className="h-[1px] bg-black/40 my-2" />
                                                <div className="flex justify-between text-sm font-black text-black">
                                                    <span>TOTAL AMOUNT:</span>
                                                    <span>₹{(selectedInvoice.total || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 pt-6 border-t border-gray-200 text-[8px] text-center text-gray-400 uppercase tracking-widest">
                                            *** THIS IS A COMPUTER GENERATED INVOICE. THANK YOU FOR YOUR BUSINESS! ***
                                        </div>
                                    </div>
                                ) : (
                                    /* POS Thermal Receipt 80mm Styled Sheet */
                                    <div id="invoice-print-area" className="w-[300px] bg-white border border-dashed border-gray-400 shadow-sm p-6 text-black text-left font-mono text-[10px] leading-relaxed select-text print:border-0 print:shadow-none print:p-0 print:m-0 print:w-full">
                                        <div className="text-center space-y-1 pb-4 border-b border-dashed border-black">
                                            <h1 className="text-md font-black uppercase tracking-tighter text-black">{selectedInvoice.salonId?.brandName || 'SALON LEDGER'}</h1>
                                            <p className="text-[8px] uppercase tracking-widest text-gray-500">RECEIPT MANIFEST</p>
                                            <p className="text-[8px] text-gray-500 leading-none">{selectedInvoice.outletId?.name || 'Main Branch'}</p>
                                        </div>

                                        <div className="py-4 space-y-1 text-[8px] border-b border-dashed border-black/40">
                                            <div>REC NO : <span className="font-bold">{selectedInvoice.invoiceNumber || 'INV-TEMP'}</span></div>
                                            <div>DATE   : <span>{new Date(selectedInvoice.createdAt).toLocaleString('en-IN')}</span></div>
                                            <div>CLIENT : <span className="font-bold uppercase">{selectedInvoice.clientId?.name || 'Walk-in'}</span></div>
                                            <div>PHONE  : <span>{selectedInvoice.clientId?.phone || '-'}</span></div>
                                            <div>METHOD : <span className="font-bold uppercase">{selectedInvoice.paymentMethod || 'CASH'}</span></div>
                                            {selectedInvoice.staffId && <div>STAFF  : <span className="font-bold uppercase">{selectedInvoice.staffId.name || selectedInvoice.staffId}</span></div>}
                                        </div>

                                        <div className="py-4 border-b border-dashed border-black/40 text-[9px]">
                                            <div className="flex justify-between font-black uppercase tracking-tight mb-2">
                                                <span>ITEM DESCRIPTION</span>
                                                <span>TOTAL</span>
                                            </div>
                                            {selectedInvoice.items?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start">
                                                    <span className="uppercase font-bold max-w-[200px]">{item.name || 'Membership Plan'} x{item.quantity || 1}</span>
                                                    <span>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="py-4 space-y-1.5 text-[8px]">
                                            <div className="flex justify-between">
                                                <span>SUBTOTAL:</span>
                                                <span>₹{(selectedInvoice.subtotal || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>TAX (GST):</span>
                                                <span>₹{((selectedInvoice.cgst || 0) + (selectedInvoice.sgst || 0)).toLocaleString('en-IN')}</span>
                                            </div>
                                            {selectedInvoice.discount > 0 && (
                                                <div className="flex justify-between text-rose-600">
                                                    <span>DISCOUNT:</span>
                                                    <span>-₹{(selectedInvoice.discount || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-dashed border-black/30 my-1" />
                                            <div className="flex justify-between text-xs font-black text-black">
                                                <span>TOTAL PAYABLE:</span>
                                                <span>₹{(selectedInvoice.total || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>

                                        <div className="text-center pt-4 border-t border-dashed border-black text-[8px] uppercase tracking-tighter">
                                            *** THANKS FOR VISITING US ***
                                            <br />
                                            HAVE A GREAT DAY!
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer / Actions */}
                            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3 text-right shrink-0">
                                <button
                                    onClick={() => setSelectedInvoice(null)}
                                    className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-[10px] font-black uppercase tracking-[0.2em] rounded-none transition-all"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        const style = document.createElement('style');
                                        style.id = 'print-style-helper';
                                        style.innerHTML = `
                                            @media print {
                                                body * {
                                                    visibility: hidden !important;
                                                }
                                                #invoice-print-area, #invoice-print-area * {
                                                    visibility: visible !important;
                                                }
                                                #invoice-print-area {
                                                    position: absolute !important;
                                                    left: 0 !important;
                                                    top: 0 !important;
                                                    width: 100% !important;
                                                    border: none !important;
                                                    box-shadow: none !important;
                                                    padding: 0 !important;
                                                    margin: 0 !important;
                                                }
                                            }
                                        `;
                                        document.head.appendChild(style);
                                        window.print();
                                        setTimeout(() => {
                                            const helper = document.getElementById('print-style-helper');
                                            if (helper) helper.remove();
                                        }, 1000);
                                    }}
                                    className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center gap-2 rounded-none shadow-lg"
                                >
                                    <Printer className="w-4 h-4" /> Print Receipt
                                </button>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
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
