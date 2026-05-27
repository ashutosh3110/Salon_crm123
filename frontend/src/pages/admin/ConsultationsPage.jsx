import React, { useState, useEffect, useCallback } from 'react';
import {
    ClipboardList,
    Plus,
    Search,
    Edit,
    Trash2,
    Calendar,
    Users,
    Store,
    Clock,
    X,
    Filter,
    ShieldAlert,
    CheckCircle2,
    BookOpen
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { maskPhone } from '../../utils/phoneUtils';

export default function ConsultationsPage() {
    const { user } = useAuth();
    const { outlets, activeSalonId } = useBusiness();

    // Data lists & loading states
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [filterOutlet, setFilterOutlet] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCustomer, setFilterCustomer] = useState('');
    
    // Add / Edit Modal state
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    
    // Selected outlet customer fetching
    const [outletCustomers, setOutletCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // Form inputs
    const [formData, setFormData] = useState({
        outletId: '',
        customerId: '',
        title: '',
        notes: '',
        solution: '',
        adminNotes: '',
        status: 'pending',
        followUpDate: ''
    });

    // Fetch consultations from backend
    const fetchConsultationsList = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            let url = `/consultations?page=${page}&limit=10`;
            if (filterOutlet) url += `&outletId=${filterOutlet}`;
            if (filterStatus) url += `&status=${filterStatus}`;
            if (filterCustomer) url += `&customerId=${filterCustomer}`;

            const res = await api.get(url);
            if (res.data?.success) {
                setConsultations(res.data.data || []);
                setTotalPages(res.data.totalPages || 1);
                setTotalCount(res.data.totalCount || 0);
            }
        } catch (err) {
            console.error('Fetch consultations failed:', err);
            toast.error('Failed to retrieve consultations log');
        } finally {
            setLoading(false);
        }
    }, [filterOutlet, filterStatus, filterCustomer]);

    // React to filters / page changes
    useEffect(() => {
        fetchConsultationsList(currentPage);
    }, [currentPage, fetchConsultationsList]);

    // Reset page on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterOutlet, filterStatus, filterCustomer]);

    // Fetch customers when outlet is selected inside modal form
    useEffect(() => {
        const fetchCustomersByOutlet = async () => {
            if (!formData.outletId) {
                setOutletCustomers([]);
                return;
            }
            setLoadingCustomers(true);
            try {
                // Leverage updated getClients endpoint with outletId filter!
                const res = await api.get(`/clients?limit=1000&outletId=${formData.outletId}`);
                if (res.data?.success) {
                    setOutletCustomers(res.data.data || []);
                }
            } catch (err) {
                console.error('Fetch outlet customers error:', err);
                toast.error('Failed to load customers for this outlet');
            } finally {
                setLoadingCustomers(false);
            }
        };

        fetchCustomersByOutlet();
    }, [formData.outletId]);

    // Open add modal
    const handleOpenAddModal = () => {
        setSelectedConsultation(null);
        setFormData({
            outletId: filterOutlet || '', // Auto-fill current active outlet filter if present
            customerId: '',
            title: '',
            notes: '',
            solution: '',
            adminNotes: '',
            status: 'pending',
            followUpDate: ''
        });
        setShowFormModal(true);
    };

    // Open edit/view modal
    const handleOpenEditModal = (consultation) => {
        setSelectedConsultation(consultation);
        setFormData({
            outletId: consultation.outletId?._id || consultation.outletId || '',
            customerId: consultation.customerId?._id || consultation.customerId || '',
            title: consultation.title || '',
            notes: consultation.notes || '',
            solution: consultation.solution || '',
            adminNotes: consultation.adminNotes || '',
            status: consultation.status || 'pending',
            followUpDate: consultation.followUpDate ? consultation.followUpDate.split('T')[0] : ''
        });
        setShowFormModal(true);
    };

    // Handle submit (Create or Update)
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!formData.outletId || !formData.customerId || !formData.title || !formData.notes || !formData.solution) {
            return toast.error('Please fill in all mandatory fields');
        }

        setFormLoading(true);
        try {
            if (selectedConsultation) {
                // Update
                const res = await api.patch(`/consultations/${selectedConsultation._id}`, formData);
                if (res.data?.success) {
                    toast.success('Consultation updated successfully');
                    setShowFormModal(false);
                    fetchConsultationsList(currentPage);
                }
            } else {
                // Create
                const res = await api.post('/consultations', formData);
                if (res.data?.success) {
                    toast.success('Consultation recorded successfully');
                    setShowFormModal(false);
                    fetchConsultationsList(1);
                }
            }
        } catch (err) {
            console.error('Submit form error:', err);
            toast.error(err.response?.data?.message || 'Error processing consultation');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle delete consultation (Admin/Manager only)
    const handleDeleteConsultation = async (id) => {
        if (!confirm('Are you sure you want to permanently delete this consultation log?')) return;
        try {
            const res = await api.delete(`/consultations/${id}`);
            if (res.data?.success) {
                toast.success('Consultation record deleted');
                fetchConsultationsList(currentPage);
            }
        } catch (err) {
            console.error('Delete consultation failed:', err);
            toast.error('Failed to delete consultation log');
        }
    };

    return (
        <div className="space-y-6 animate-reveal text-left max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-text uppercase tracking-tighter leading-none">Consultations</h1>
                    <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.3em] opacity-60 leading-none">CRM Directory • Medical & Ritual Consultation Logs</p>
                </div>

                <button
                    onClick={handleOpenAddModal}
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 self-start lg:self-auto"
                >
                    <Plus className="w-4 h-4" /> Add Consultation
                </button>
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface p-5 border border-border shadow-sm">
                <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block ml-1">Filter by Outlet</label>
                    <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <select
                            value={filterOutlet}
                            onChange={(e) => setFilterOutlet(e.target.value)}
                            className="w-full pl-9 pr-4 py-3 bg-surface-alt border border-border text-xs font-black uppercase tracking-wider outline-none cursor-pointer"
                        >
                            <option value="">All Outlets</option>
                            {outlets.map(o => (
                                <option key={o._id || o.id} value={o._id || o.id}>{o.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block ml-1">Filter by Status</label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-9 pr-4 py-3 bg-surface-alt border border-border text-xs font-black uppercase tracking-wider outline-none cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Free Text Search for Customer */}
                <div className="space-y-1 text-left md:col-span-2">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block ml-1">Search Customer (Database ID)</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Enter Customer ID to filter..."
                            value={filterCustomer}
                            onChange={(e) => setFilterCustomer(e.target.value.trim())}
                            className="w-full pl-11 pr-4 py-3 bg-surface-alt border border-border text-xs font-bold outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Consultations Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest animate-pulse">Fetching Consultations...</p>
                    </div>
                ) : consultations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="p-4 border border-border bg-surface-alt/20 text-text-muted">
                            <ClipboardList className="w-8 h-8 opacity-45" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-text">No Consultations Recorded</h3>
                            <p className="text-xs text-text-muted max-w-xs leading-relaxed">No medical or ritual details have been logged yet for the selected filters.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full justify-between">
                        <div className="table-responsive border-b border-border">
                            <table className="w-full text-left min-w-[850px]">
                                <thead className="bg-surface-alt border-b border-border">
                                    <tr>
                                        <th className="p-4 text-[9px] font-black uppercase text-text-muted tracking-widest">Date</th>
                                        <th className="p-4 text-[9px] font-black uppercase text-text-muted tracking-widest">Outlet</th>
                                        <th className="p-4 text-[9px] font-black uppercase text-text-muted tracking-widest">Customer details</th>
                                        <th className="p-4 text-[9px] font-black uppercase text-text-muted tracking-widest">Consultation details</th>
                                        <th className="p-4 text-[9px] font-black uppercase text-text-muted tracking-widest">Status</th>
                                        <th className="p-4 text-[9px] font-black uppercase text-text-muted tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-xs bg-surface">
                                    {consultations.map(c => (
                                        <tr key={c._id} className="hover:bg-surface-alt/10 transition-colors">
                                            <td className="p-4 font-bold text-text-muted">
                                                {new Date(c.date || c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                <span className="block text-[8px] font-semibold text-text-muted mt-1">
                                                    {new Date(c.date || c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-text">
                                                {c.outletId?.name || 'General Outlet'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-text text-white flex items-center justify-center font-black text-xs">
                                                        {c.customerId?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-text uppercase tracking-tight">{c.customerId?.name || 'Standard Client'}</p>
                                                        <p className="text-[9px] text-text-muted font-bold tracking-widest mt-0.5">{maskPhone(c.customerId?.phone || '', user?.role)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-[250px]">
                                                <p className="font-black text-text uppercase tracking-tight truncate">{c.title}</p>
                                                <p className="text-[10px] text-text-muted mt-1 truncate">{c.notes}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase border rounded ${
                                                    c.status === 'completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                    c.status === 'in_progress' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' :
                                                    'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                }`}>
                                                    {c.status === 'in_progress' ? 'In Progress' : c.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right flex items-center justify-end gap-2 mt-1">
                                                <button
                                                    onClick={() => handleOpenEditModal(c)}
                                                    className="p-2.5 text-text-muted hover:text-primary border border-border hover:bg-surface-alt transition-all"
                                                    title="Edit / View Details"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'manager') && (
                                                    <button
                                                        onClick={() => handleDeleteConsultation(c._id)}
                                                        className="p-2.5 text-text-muted hover:text-rose-500 border border-border hover:bg-surface-alt transition-all"
                                                        title="Delete Log"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-8 py-6 bg-surface-alt/10 flex items-center justify-between">
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    Displaying {consultations.length} of {totalCount} logs
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-6 py-3 border border-border bg-surface text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                                    >
                                        Prev
                                    </button>
                                    <div className="px-4 text-xs font-black">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage >= totalPages}
                                        className="px-6 py-3 border border-border bg-surface text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal: Add & Edit Consultation */}
            {showFormModal && (
                <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-none border border-border w-full max-w-xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-border flex justify-between items-center bg-white sticky top-0 z-10">
                            <h4 className="text-[11px] font-black text-text uppercase flex items-center gap-2 tracking-widest">
                                <ClipboardList className="w-4 h-4 text-primary" />
                                {selectedConsultation ? 'Update Consultation Log' : 'Create Consultation Record'}
                            </h4>
                            <button
                                type="button"
                                onClick={() => setShowFormModal(false)}
                                className="p-1 border border-border hover:bg-rose-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} className="p-6 space-y-5 text-left">
                            <div className="space-y-4">
                                {/* Step 1: Select Outlet */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">1. Select Target Outlet *</label>
                                    <select
                                        required
                                        disabled={!!selectedConsultation} // Freeze outlet selection on update
                                        value={formData.outletId}
                                        onChange={(e) => setFormData({ ...formData, outletId: e.target.value, customerId: '' })}
                                        className="w-full bg-surface-alt/5 border-2 border-text p-3 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-primary transition-all uppercase rounded-none"
                                    >
                                        <option value="">-- Choose Outlet --</option>
                                        {outlets.map(o => (
                                            <option key={o._id || o.id} value={o._id || o.id}>{o.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Step 2: Auto-fetched Outlet Customers */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">2. Select Target Customer *</label>
                                    {loadingCustomers ? (
                                        <div className="text-[10px] text-primary animate-pulse font-black uppercase tracking-widest py-2">Auto-fetching outlet customers...</div>
                                    ) : selectedConsultation ? (
                                        // On Edit mode, just show readonly customer name
                                        <input
                                            type="text"
                                            readOnly
                                            value={selectedConsultation.customerId?.name || 'Standard Client'}
                                            className="w-full bg-slate-100 border-2 border-text/25 p-3 text-xs font-black text-slate-500 outline-none rounded-none uppercase cursor-not-allowed"
                                        />
                                    ) : (
                                        <select
                                            required
                                            disabled={!formData.outletId}
                                            value={formData.customerId}
                                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                            className="w-full bg-surface-alt/5 border-2 border-text p-3 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-primary transition-all uppercase rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">-- Choose Customer --</option>
                                            {outletCustomers.map(c => (
                                                <option key={c._id} value={c._id}>{c.name} ({maskPhone(c.phone, user?.role)})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="h-px bg-border my-2"></div>

                                {/* Title */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Consultation Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Skin ritual evaluation / Hair spa profile"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-surface-alt/5 border-2 border-text p-3 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-primary transition-all uppercase rounded-none"
                                    />
                                </div>

                                {/* Problem / Notes */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Consultation Notes / Problem Description *</label>
                                    <textarea
                                        required
                                        placeholder="Type problem details or client requests..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full h-24 bg-surface-alt/5 border-2 border-text p-3 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-primary transition-all rounded-none resize-none"
                                    />
                                </div>

                                {/* Recommendation / Solutions */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Solution / Stylist Recommendations *</label>
                                    <textarea
                                        required
                                        placeholder="Type recommend products, ritual treatments, or guidelines..."
                                        value={formData.solution}
                                        onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                                        className="w-full h-24 bg-surface-alt/5 border-2 border-text p-3 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-primary transition-all rounded-none resize-none"
                                    />
                                </div>

                                {/* Status & Follow-up Dates */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-surface-alt/5 border-2 border-text p-3 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-primary transition-all uppercase rounded-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>

                                

                                {/* Private Admin Notes */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Private Admin Notes (Internal Only)</label>
                                    <input
                                        type="text"
                                        placeholder="Stylist internal logs / not visible to customer"
                                        value={formData.adminNotes}
                                        onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                                        className="w-full bg-surface-alt/5 border-2 border-text p-3 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-primary transition-all uppercase rounded-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-border sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="flex-1 py-3.5 border-2 border-text font-black text-[10px] uppercase tracking-widest italic bg-white hover:bg-surface-alt/20 transition-all rounded-none text-text-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 bg-text text-white border-2 border-text py-3.5 font-black text-[10px] uppercase tracking-widest italic hover:bg-primary hover:border-primary hover:text-white transition-all rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    {formLoading ? 'Executing...' : selectedConsultation ? 'Update Record' : 'Create Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
