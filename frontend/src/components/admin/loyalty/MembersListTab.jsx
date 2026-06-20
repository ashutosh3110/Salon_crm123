import React from 'react';
/* eslint-disable */
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
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
    FileText,
    Users,
    CheckCircle2,
    MapPin,
    Diamond,
    Crown,
    Shield,
    Edit2,
    Trash2,
    UserPlus
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { maskPhone } from '../../../utils/phoneUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusiness } from '../../../contexts/BusinessContext';
import api from '../../../services/api';
import CustomDropdown from '../../common/CustomDropdown';

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

    // Edit Modal State
    const [editingMember, setEditingMember] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        loyaltyPoints: 0,
        walletBalance: 0,
        loyaltyPlanId: '',
        loyaltyStatus: 'active',
        loyaltyExpiry: ''
    });
    const [updating, setUpdating] = useState(false);

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
        const hasOpenModal = !!selectedMember || !!showAssignModal || !!selectedInvoice || !!editingMember;
        document.body.style.overflow = hasOpenModal ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedMember, showAssignModal, selectedInvoice, editingMember]);

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

    // Load membership plans when assignment modal or edit modal is shown
    useEffect(() => {
        if (showAssignModal || editingMember) {
            if (showAssignModal) {
                setSelectedOutletId(activeOutletId || '');
                setPaymentMethod('cash');
            }
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
    }, [showAssignModal, editingMember, activeOutletId]);

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

    const handleEditClick = (member) => {
        let expiryDateStr = '';
        if (member.loyaltyExpiryRaw) {
            try {
                const dateObj = new Date(member.loyaltyExpiryRaw);
                if (!isNaN(dateObj.getTime())) {
                    expiryDateStr = dateObj.toISOString().split('T')[0];
                }
            } catch (e) {
                console.error("Error parsing loyaltyExpiryRaw:", e);
            }
        }
        if (!expiryDateStr && member.loyaltyExpiry && member.loyaltyExpiry !== 'NEVER') {
            try {
                const cleanExpiry = String(member.loyaltyExpiry).replace(/-/g, '/');
                const parts = cleanExpiry.split('/');
                if (parts.length === 3) {
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    const year = parts[2];
                    expiryDateStr = `${year}-${month}-${day}`;
                } else {
                    const dateObj = new Date(cleanExpiry);
                    if (!isNaN(dateObj.getTime())) {
                        expiryDateStr = dateObj.toISOString().split('T')[0];
                    }
                }
            } catch (e) {
                console.error("Error parsing loyaltyExpiry:", e);
            }
        }

        setEditingMember(member);
        setEditForm({
            name: member.name || '',
            phone: member.phone || '',
            loyaltyPoints: member.loyaltyPoints || 0,
            walletBalance: member.walletBalance || 0,
            loyaltyPlanId: member.loyaltyPlanId || '',
            loyaltyStatus: member.loyaltyStatus || 'active',
            loyaltyExpiry: expiryDateStr
        });
    };

    const handleUpdateMember = async (e) => {
        e.preventDefault();
        if (!editForm.name.trim() || !editForm.phone.trim()) {
            toast.error('Name and Phone are required.');
            return;
        }

        setUpdating(true);
        try {
            const res = await api.patch(`/loyalty/members/${editingMember._id || editingMember.id}`, {
                name: editForm.name,
                phone: editForm.phone,
                loyaltyPoints: Number(editForm.loyaltyPoints),
                walletBalance: Number(editForm.walletBalance),
                loyaltyPlanId: editForm.loyaltyPlanId || undefined,
                loyaltyStatus: editForm.loyaltyStatus,
                loyaltyExpiry: editForm.loyaltyExpiry || undefined
            });

            if (res.data?.success) {
                toast.success('Member updated successfully!');
                setEditingMember(null);
                setRefreshTrigger(prev => prev + 1);
            } else {
                toast.error(res.data?.message || 'Failed to update member.');
            }
        } catch (err) {
            console.error('Update error:', err);
            toast.error(err.response?.data?.message || 'Server error occurred while updating member.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteMember = async (member) => {
        const confirmCancel = window.confirm(
            `Are you sure you want to cancel and delete the loyalty membership for ${member.name || 'this client'}?`
        );
        if (!confirmCancel) return;

        try {
            const res = await api.delete(`/loyalty/members/${member._id || member.id}`);
            if (res.data?.success) {
                toast.success('Membership deleted successfully!');
                setRefreshTrigger(prev => prev + 1);
            } else {
                toast.error(res.data?.message || 'Failed to delete membership.');
            }
        } catch (err) {
            console.error('Delete error:', err);
            toast.error(err.response?.data?.message || 'Server error occurred while deleting membership.');
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

    const [outletDropdownOpen, setOutletDropdownOpen] = useState(false);
    const outletDropdownRef = useRef(null);

    useEffect(() => {
        const handleOutletOutside = (e) => {
            if (outletDropdownRef.current && !outletDropdownRef.current.contains(e.target)) {
                setOutletDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutletOutside);
        return () => document.removeEventListener('mousedown', handleOutletOutside);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6">
                {/* Row 1: Search, Assign, Outlet, Download */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#B4912B] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search members by name, phone or plan..."
                            value={searchTerm}
                            onChange={e => { setPage(1); setSearchTerm(e.target.value); }}
                            className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-11 pr-4 text-sm font-bold text-slate-900 focus:border-[#B4912B] outline-none transition-all shadow-sm"
                        />
                    </div>

                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="h-11 px-5 bg-[#B4912B] hover:bg-[#9a7b24] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
                    >
                        <UserPlus className="w-4 h-4 icon-white-outline-force" />
                        Assign Plan
                    </button>

                    <div className="relative shrink-0" ref={outletDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setOutletDropdownOpen(o => !o)}
                            className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 h-11 bg-white text-xs font-bold text-slate-700 whitespace-nowrap shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-none">
                                {activeOutletId ? (outlets.find(o => (o._id || o.id) === activeOutletId)?.name || 'Outlet') : 'All Outlets'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${outletDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {outletDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[200px] max-h-52 overflow-y-auto">
                                <button
                                    type="button"
                                    onClick={() => { setActiveOutletId(null); setOutletDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors ${!activeOutletId ? 'bg-[#B4912B]/10 text-[#B4912B]' : 'text-slate-700 hover:bg-slate-50'}`}
                                >All Outlets</button>
                                {outlets.map(o => (
                                    <button
                                        key={o._id || o.id}
                                        type="button"
                                        onClick={() => { setActiveOutletId(o._id || o.id); setOutletDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors ${activeOutletId === (o._id || o.id) ? 'bg-[#B4912B]/10 text-[#B4912B]' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >{o.name}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={downloadCsv}
                        className="h-11 w-11 border border-slate-200 rounded-xl bg-white text-slate-500 hover:text-[#B4912B] hover:border-[#B4912B]/50 hover:bg-[#B4912B]/5 transition-all flex items-center justify-center shrink-0 shadow-sm"
                        title="Download CSV"
                    >
                        <Download size={18} />
                    </button>
                </div>

                {/* Row 2: Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">TOTAL MEMBERS</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{meta.total || members.length}</h3>
                            <p className="text-[10px] text-purple-500 dark:text-purple-400 font-bold mt-1.5 leading-none">Active members</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">ACTIVE MEMBERS</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{members.filter(m => m.loyaltyStatus === 'active').length}</h3>
                            <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold mt-1.5 leading-none">100% of total members</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 dark:text-orange-400 flex items-center justify-center shrink-0">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">EXPIRING SOON</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">0</h3>
                            <p className="text-[10px] text-orange-500 dark:text-orange-400 font-bold mt-1.5 leading-none">In next 30 days</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">TOTAL REVENUE</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">₹0</h3>
                            <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold mt-1.5 leading-none">From membership sales</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <Star className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">AVG. MEMBERSHIP AGE</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">5 days</h3>
                            <p className="text-[10px] text-rose-500 dark:text-rose-400 font-bold mt-1.5 leading-none">Average since joined</p>
                        </div>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 w-fit flex items-center gap-2 shadow-sm">
                    {['all', 'active', 'expired'].map((f) => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-5 py-2.5 rounded-lg font-bold text-xs capitalize transition-all whitespace-nowrap ${filter === f
                                ? 'bg-[#B4912B] text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {f} Members
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden text-left">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <Th>CUSTOMER</Th>
                                    <Th>SUBSCRIPTION TIER</Th>
                                    <Th>PROTOCOL STATUS</Th>
                                    <Th>JOIN CYCLE</Th>
                                    <Th>EXPIRY TIMELINE</Th>
                                    <Th className="text-center">ACTIONS</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-10 text-center text-sm font-bold text-slate-500 dark:text-slate-400">Loading active members...</td></tr>
                                ) : members.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center bg-surface">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <img src="/vector image 3.png" alt="No members found" className="w-56 h-56 object-contain mix-blend-multiply dark:mix-blend-screen dark:invert opacity-90 dark:opacity-80" />
                                                <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">No members found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((member, idx) => {
                                        // Colors based on tier loosely
                                        const tier = (member.loyaltyPlan || '').toLowerCase();
                                        const isPremium = tier.includes('premium');
                                        const isPro = tier.includes('pro');

                                        let TierIcon = Shield;
                                        let tierColor = '!text-blue-600 !stroke-blue-600 dark:!text-blue-500 dark:!stroke-blue-500';

                                        if (isPremium) { TierIcon = Diamond; tierColor = '!text-purple-600 !stroke-purple-600 dark:!text-purple-500 dark:!stroke-purple-500'; }
                                        else if (isPro) { TierIcon = Crown; tierColor = '!text-amber-600 !stroke-amber-600 dark:!text-amber-500 dark:!stroke-amber-500'; }

                                        let AvatarColor = 'bg-purple-100 dark:bg-purple-900/30 !text-purple-700 dark:!text-purple-400';
                                        if (idx % 3 === 1) AvatarColor = 'bg-orange-100 dark:bg-orange-900/30 !text-orange-700 dark:!text-orange-400';
                                        if (idx % 3 === 2) AvatarColor = 'bg-blue-100 dark:bg-blue-900/30 !text-blue-700 dark:!text-blue-400';

                                        return (
                                            <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl ${AvatarColor} flex items-center justify-center font-black text-lg`}>
                                                            {(member.name || 'U')[0]}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-slate-900 dark:text-white">{member.name || 'Unknown'}</div>
                                                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                                <span className="text-[10px]">📞</span>
                                                                {maskPhone(member.phone || '', user?.role)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <TierIcon className={`w-4 h-4 ${tierColor}`} />
                                                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">{member.loyaltyPlan || 'BASIC'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-widest uppercase">
                                                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                                        ACTIVE
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(member.createdAt).toLocaleDateString('en-IN')}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-5">INITIATED</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{member.loyaltyExpiryRaw ? new Date(member.loyaltyExpiryRaw).toLocaleDateString('en-IN') : (member.loyaltyExpiry || 'NEVER')}</span>
                                                        </div>
                                                        <div className="ml-5">
                                                            {(() => {
                                                                if (!member.loyaltyExpiryRaw || member.loyaltyExpiry === 'NEVER') {
                                                                    return (
                                                                        <>
                                                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Never Expires</span>
                                                                            <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                                <div className="h-full bg-slate-400 dark:bg-slate-500 w-full rounded-full"></div>
                                                                            </div>
                                                                        </>
                                                                    );
                                                                }
                                                                const daysLeft = Math.ceil((new Date(member.loyaltyExpiryRaw) - new Date()) / (1000 * 60 * 60 * 24));
                                                                const isExpired = daysLeft <= 0;
                                                                const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

                                                                const textColor = isExpired ? 'text-rose-500' : isExpiringSoon ? 'text-orange-500' : 'text-emerald-600 dark:text-emerald-400';
                                                                const barColor = isExpired ? 'bg-rose-500' : isExpiringSoon ? 'bg-orange-500' : 'bg-emerald-500';
                                                                const progressPercent = isExpired ? 0 : Math.min(100, (daysLeft / 30) * 100);

                                                                return (
                                                                    <>
                                                                        <span className={`text-[10px] font-bold ${textColor} block mb-1`}>
                                                                            {isExpired ? 'Expired' : `${daysLeft} days left`}
                                                                        </span>
                                                                        <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                            <div className={`h-full ${barColor} rounded-full`} style={{ width: `${progressPercent}%` }}></div>
                                                                        </div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => { console.log('Eye clicked', member); setSelectedMember(member); }}
                                                            className="member-action-btn member-view-btn w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-[#B4912B] dark:hover:text-[#B4912B] hover:border-[#B4912B]/30 hover:bg-[#B4912B]/5 transition-all"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { console.log('Edit clicked', member); handleEditClick(member); }}
                                                            className="member-action-btn member-edit-btn w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { console.log('Delete clicked', member); handleDeleteMember(member); }}
                                                            className="member-action-btn member-delete-btn w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Pagination */}
                    <div className="border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs font-bold text-slate-500">
                            Showing 1 to {members.length} of {meta.total || members.length} members
                        </span>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500">Rows per page</span>
                                <div className="border border-slate-200 rounded-lg px-2 h-8 flex items-center gap-2 bg-white cursor-pointer hover:bg-slate-50">
                                    <span className="text-xs font-bold text-slate-700">10</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#B4912B] bg-[#B4912B]/10 text-[#B4912B] font-bold text-xs">
                                    1
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Member Details Modal */}
            {selectedMember && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-sm transition-all overflow-hidden"
                    onClick={() => setSelectedMember(null)}
                >
                    <div
                        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl rounded-xl font-sans text-slate-800 dark:text-slate-200 flex flex-col max-h-[85vh] overflow-y-auto admin-panel"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-[#B4912B]" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Member Protocol Details</h3>
                            </div>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6 text-left">
                            {/* Profile Header */}
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-[#B4912B]/10 border-2 border-[#B4912B]/20 flex items-center justify-center text-[#B4912B] text-2xl font-black italic shadow-inner">
                                    {(selectedMember.name || 'U')[0]}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight leading-none">
                                        {selectedMember.name || 'Unknown Client'}
                                    </h4>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-2">
                                        {maskPhone(selectedMember.phone || '', user?.role)}
                                    </p>
                                </div>
                            </div>

                            {/* Subscription Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 group hover:border-[#B4912B]/30 transition-all text-left">
                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Current Tier</span>
                                    <span className="text-sm font-black text-[#B4912B] uppercase italic">{selectedMember.loyaltyPlan || 'STANDARD'}</span>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 group hover:border-emerald-500/30 transition-all text-left">
                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Protocol Status</span>
                                    <StatusBadge status={selectedMember.loyaltyStatus || 'active'} />
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 group hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left">
                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Activation Date</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white italic">
                                        {selectedMember.createdAt && !isNaN(new Date(selectedMember.createdAt).getTime()) ? new Date(selectedMember.createdAt).toLocaleDateString('en-IN') : '-'}
                                    </span>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 group hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left">
                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Expiry Timeline</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white italic">{selectedMember.loyaltyExpiry || 'NEVER'}</span>
                                </div>
                            </div>

                            {/* Points Wallet */}
                            <div className="p-6 bg-[#B4912B]/5 dark:bg-[#B4912B]/10 border border-[#B4912B]/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#B4912B]/10 flex items-center justify-center">
                                        <Star className="w-5 h-5 text-[#B4912B]" fill="currentColor" />
                                    </div>
                                    <div className="text-left">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none mb-1">Accumulated Points</span>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Loyalty Ledger Balance</span>
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-[#B4912B] italic tracking-tighter">
                                    {Number(selectedMember.totalPoints || 0)}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-end">
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="px-6 py-2.5 bg-[#B4912B] hover:bg-[#B4912B]/90 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg rounded-xl"
                            >
                                Close Registry
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit Member Profile Modal */}
            {editingMember && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-sm transition-all overflow-hidden"
                    onClick={() => setEditingMember(null)}
                >
                    <div
                        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl rounded-xl font-sans text-slate-800 dark:text-slate-200 flex flex-col max-h-[85vh] overflow-y-auto admin-panel"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <Settings className="w-5 h-5 text-[#B4912B]" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Modify Member Profile</h3>
                            </div>
                            <button
                                onClick={() => setEditingMember(null)}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleUpdateMember} className="p-8 space-y-5 text-left overflow-y-auto no-scrollbar flex-1">
                            {/* Basic Info Section Title */}
                            <div>
                                <h4 className="text-[10px] font-black text-[#B4912B] uppercase tracking-[0.2em] mb-4">Customer Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.name}
                                            onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-xs font-bold text-slate-950 dark:text-white focus:border-[#B4912B] outline-none transition-all shadow-sm rounded-xl"
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Phone Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.phone}
                                            onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-xs font-bold text-slate-950 dark:text-white focus:border-[#B4912B] outline-none transition-all shadow-sm rounded-xl"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

                            {/* Balances / Ledger Section */}
                            <div>
                                <h4 className="text-[10px] font-black text-[#B4912B] uppercase tracking-[0.2em] mb-4">Financial Ledger</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Loyalty Points</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editForm.loyaltyPoints}
                                            onChange={e => setEditForm(prev => ({ ...prev, loyaltyPoints: Number(e.target.value) }))}
                                            className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-xs font-bold text-slate-950 dark:text-white focus:border-[#B4912B] outline-none transition-all shadow-sm rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Wallet Balance (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={editForm.walletBalance}
                                            onChange={e => setEditForm(prev => ({ ...prev, walletBalance: Number(e.target.value) }))}
                                            className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-xs font-bold text-slate-950 dark:text-white focus:border-[#B4912B] outline-none transition-all shadow-sm rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

                            {/* Subscription Section */}
                            <div>
                                <h4 className="text-[10px] font-black text-[#B4912B] uppercase tracking-[0.2em] mb-4">Membership Subscription</h4>
                                <div className="space-y-4">
                                    <div className="relative z-30">
                                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Assigned Plan</label>
                                        <CustomDropdown
                                            options={plans.map(p => ({
                                                label: `${p.name} - ₹${p.price} (${p.duration} Days)`,
                                                value: p._id || p.id
                                            }))}
                                            value={editForm.loyaltyPlanId}
                                            onChange={val => setEditForm(prev => ({ ...prev, loyaltyPlanId: val }))}
                                            placeholder="-- No Active Plan / Standard --"
                                            className="w-full h-11 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-950 dark:text-white rounded-xl"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 relative z-20">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Status</label>
                                            <CustomDropdown
                                                options={[
                                                    { label: 'Active', value: 'active' },
                                                    { label: 'Expired', value: 'expired' },
                                                    { label: 'Cancelled', value: 'cancelled' }
                                                ]}
                                                value={editForm.loyaltyStatus}
                                                onChange={val => setEditForm(prev => ({ ...prev, loyaltyStatus: val }))}
                                                placeholder="Select Status"
                                                className="w-full h-11 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Expiry Date</label>
                                            <input
                                                type="date"
                                                value={editForm.loyaltyExpiry}
                                                style={{ colorScheme: 'dark' }}
                                                onChange={e => setEditForm(prev => ({ ...prev, loyaltyExpiry: e.target.value }))}
                                                className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-xs font-bold text-slate-950 dark:text-white focus:border-[#B4912B] outline-none transition-all shadow-sm rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer / Actions */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-8 py-4 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setEditingMember(null)}
                                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateMember}
                                disabled={updating}
                                className="px-6 py-2.5 bg-[#B4912B] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#B4912B]/90 transition-all disabled:opacity-50 flex items-center gap-2 rounded-xl shadow-lg"
                            >
                                {updating ? 'Saving...' : 'Save Adjustments'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Assign Membership Plan Modal */}
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
                    <div
                        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl rounded-xl font-sans text-slate-800 dark:text-slate-200 flex flex-col max-h-[90vh] admin-panel"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-[#B4912B]" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Assign Subscription Plan</h3>
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
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
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
                            <div className="relative z-40" ref={dropdownRef}>
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Select Customer</label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#B4912B] transition-colors z-10 pointer-events-none" />
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
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-12 pr-10 text-xs font-bold text-slate-900 dark:text-white focus:border-[#B4912B] outline-none transition-all shadow-sm rounded-xl"
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
                                    <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
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
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-black italic flex justify-between items-center cursor-pointer text-slate-900 dark:text-white"
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
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-black italic flex justify-between items-center cursor-pointer text-slate-900 dark:text-white"
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
                            <div className="relative z-30">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Select Membership Plan</label>
                                <CustomDropdown
                                    options={plans.map(p => ({
                                        label: `${p.name} - ₹${p.price} (${p.duration} Days) — ${p.taxType === 'including' ? 'Incl.' : 'Excl.'} ${p.taxRate}% GST`,
                                        value: p._id || p.id
                                    }))}
                                    value={selectedPlanId}
                                    onChange={(val) => setSelectedPlanId(val)}
                                    placeholder="-- Choose a Plan --"
                                    className="w-full h-12 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                                {/* Select Outlet */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Select Outlet</label>
                                    <CustomDropdown
                                        options={outlets.map(o => ({
                                            label: o.name,
                                            value: o._id || o.id
                                        }))}
                                        value={selectedOutletId}
                                        onChange={(val) => setSelectedOutletId(val)}
                                        placeholder="-- Choose Outlet --"
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl"
                                    />
                                </div>

                                {/* Select Payment Method */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Payment Method</label>
                                    <CustomDropdown
                                        options={[
                                            { label: 'Cash', value: 'cash' },
                                            { label: 'Card', value: 'card' },
                                            { label: 'UPI / Online', value: 'online' },
                                            { label: 'Wallet Balance', value: 'wallet' }
                                        ]}
                                        value={paymentMethod}
                                        onChange={(val) => setPaymentMethod(val)}
                                        placeholder="Select Payment Method"
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-xl"
                                    />
                                </div>
                            </div>

                            {paymentMethod === 'wallet' && (
                                selectedCustomer ? (
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-between rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
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
                                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-600 flex items-center gap-2.5 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
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
                        <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-8 py-4 flex justify-end gap-3 shrink-0">
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
                                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all"
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
                                className="px-6 py-2.5 !bg-[#B4912B] !text-white text-[10px] font-black uppercase tracking-[0.2em] hover:!bg-[#B4912B]/90 transition-all disabled:opacity-50 flex items-center gap-2 rounded-xl shadow-lg"
                            >
                                {assigning ? 'Activating...' : 'ACTIVATE SUBSCRIPTION'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Invoice Preview Modal (Standard/Thermal) */}
            {selectedInvoice && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print"
                    onClick={() => setSelectedInvoice(null)}
                >
                    <div
                        className="bg-white border border-slate-200 w-full max-w-2xl overflow-hidden shadow-2xl rounded-xl font-sans flex flex-col max-h-[90vh]"
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
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Format Switcher Tab Bar */}
                        <div className="flex border-b border-slate-100 bg-slate-50 p-1 shrink-0">
                            <button
                                onClick={() => setInvoiceTab('standard')}
                                className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${invoiceTab === 'standard'
                                    ? 'bg-white text-slate-900 border border-slate-200 font-extrabold shadow-sm'
                                    : 'text-slate-400 hover:text-slate-950'
                                    }`}
                            >
                                Standard Invoice (A4)
                            </button>
                            <button
                                onClick={() => setInvoiceTab('thermal')}
                                className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${invoiceTab === 'thermal'
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
                                className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all"
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
                                className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center gap-2 rounded-xl shadow-lg"
                            >
                                <Printer className="w-4 h-4" /> Print Receipt
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

function Th({ children, className }) {
    return <th className={`px-10 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest italic ${className}`}>{children}</th>;
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
