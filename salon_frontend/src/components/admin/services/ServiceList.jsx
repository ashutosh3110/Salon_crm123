import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Scissors,
    Clock,
    IndianRupee,
    Eye,
    Edit2,
    EyeOff,
    Tag,
    Building2,
    CheckCircle2,
    XCircle,
    ChevronDown,
    Trash2,
    Upload,
    RefreshCcw
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomSelect from '../common/CustomSelect';
import { useBusiness } from '../../../contexts/BusinessContext';
import { API_BASE_URL } from '../../../services/api';
import BulkImportModal from './BulkImportModal';
import OutletAssignmentModal from './OutletAssignmentModal';
import ServiceDetailsModal from './ServiceDetailsModal';
import CategorySelectModal from './CategorySelectModal';

export default function ServiceList({ services = [], onDelete, onToggleStatus, onEdit, onAdd }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { outlets, fetchServices, fetchCategories, updateService, deleteService } = useBusiness();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState(location.state?.category || 'All');
    const [filterOutlet, setFilterOutlet] = useState('All Outlets');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [viewingService, setViewingService] = useState(null);
    const [assigningOutletsService, setAssigningOutletsService] = useState(null);
    const [assigningCategoryService, setAssigningCategoryService] = useState(null);
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);
    const [bulkCategoryId, setBulkCategoryId] = useState('');

    const handleRefresh = async () => {
        await Promise.all([fetchServices(), fetchCategories()]);
    };

    const categories = ['All', ...new Set(services.map(s => s.category))];
    const outletOptions = ['All Outlets', ...outlets.map(o => o.name)];

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || service.category === filterCategory;
        
        // Filter by Outlet
        let matchesOutlet = true;
        if (filterOutlet !== 'All Outlets') {
            const selectedOutlet = outlets.find(o => o.name === filterOutlet);
            if (selectedOutlet) {
                // If service has specific outletIds, check if selected matches. 
                // If outletIds is empty, it's global and matches everything.
                if (service.outletIds && service.outletIds.length > 0) {
                    matchesOutlet = service.outletIds.includes(selectedOutlet._id);
                } else {
                    matchesOutlet = true;
                }
            }
        }

        return matchesSearch && matchesCategory && matchesOutlet;
    });

    const toggleSelectAll = () => {
        if (selectedServiceIds.length === filteredServices.length) {
            setSelectedServiceIds([]);
        } else {
            setSelectedServiceIds(filteredServices.map(s => s._id));
        }
    };

    const toggleSelectService = (id) => {
        setSelectedServiceIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleBulkCategoryAssign = async (category) => {
        const { updateService } = useBusiness();
        await Promise.all(selectedServiceIds.map(id => updateService(id, { category })));
        setSelectedServiceIds([]);
        handleRefresh();
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 max-w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search services by name..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <CustomSelect 
                        value={filterCategory} 
                        onChange={setFilterCategory} 
                        options={categories}
                        className="flex-1 lg:flex-none min-w-[120px] lg:min-w-[150px]"
                    />

                    <CustomSelect 
                        value={filterOutlet} 
                        onChange={setFilterOutlet} 
                        options={outletOptions}
                        className="flex-1 lg:flex-none min-w-[140px] lg:min-w-[180px]"
                    />

                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <button
                            onClick={handleRefresh}
                            className="flex-1 sm:flex-none p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-primary transition-all active:scale-95 flex justify-center items-center"
                            title="Refresh List"
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </button>


                        <button
                            onClick={() => onAdd?.()}
                            className="flex-[2] sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-tight shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all scale-active"
                        >
                            <Plus className="w-4 h-4" /> Add Service
                        </button>
                    </div>
                </div>
            </div>

            <BulkImportModal 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)} 
                onRefresh={handleRefresh}
                outlets={outlets}
            />

            {/* Bulk Actions Toolbar */}
            {selectedServiceIds.length > 0 && (
                <div className="fixed bottom-4 sm:bottom-8 left-0 right-0 px-4 sm:px-0 sm:left-1/2 sm:-translate-x-1/2 z-[90] animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-surface border border-border shadow-2xl rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 backdrop-blur max-w-4xl mx-auto">
                        <div className="flex items-center justify-between w-full sm:w-auto sm:border-r sm:border-border sm:pr-6">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-white text-[10px] sm:text-xs font-black">
                                    {selectedServiceIds.length}
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-text uppercase tracking-widest">Selected</span>
                            </div>
                            <button 
                                onClick={() => setSelectedServiceIds([])}
                                className="sm:hidden p-1.5 hover:bg-surface-alt rounded-lg transition-all"
                            >
                                <XCircle className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <CustomSelect 
                                value={bulkCategoryId || 'Category'} 
                                onChange={setBulkCategoryId} 
                                options={['Category', ...categories.filter(c => c !== 'All')]}
                                className="flex-1 sm:min-w-[140px]"
                                position="top"
                            />
                            <button 
                                onClick={async () => {
                                    if (!bulkCategoryId || bulkCategoryId === 'Category') return;
                                    await Promise.all(selectedServiceIds.map(id => updateService(id, { category: bulkCategoryId })));
                                    setSelectedServiceIds([]);
                                    setBulkCategoryId('');
                                    handleRefresh();
                                }}
                                disabled={!bulkCategoryId || bulkCategoryId === 'Category'}
                                className="px-3 sm:px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Apply
                            </button>
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-border mx-1" />

                        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                            <button 
                                onClick={() => setAssigningOutletsService('bulk')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl hover:bg-surface-alt text-[10px] font-black uppercase tracking-widest transition-all text-primary border border-primary/10 sm:border-none"
                            >
                                <Building2 className="w-3.5 h-3.5" />
                                <span className="sm:hidden lg:inline">Outlets</span>
                            </button>

                            <button 
                                onClick={async () => {
                                    if (window.confirm(`Are you sure you want to delete ${selectedServiceIds.length} services?`)) {
                                        await Promise.all(selectedServiceIds.map(id => deleteService(id)));
                                        setSelectedServiceIds([]);
                                    }
                                }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest transition-all border border-rose-100 sm:border-none"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="sm:hidden lg:inline">Delete</span>
                            </button>

                            <button 
                                onClick={() => setSelectedServiceIds([])}
                                className="hidden sm:block p-2 hover:bg-surface-alt rounded-lg transition-all ml-2"
                            >
                                <XCircle className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ServiceDetailsModal removed in favor of ServiceDetailPage */}

            <OutletAssignmentModal
                isOpen={!!assigningOutletsService || (selectedServiceIds.length > 0 && assigningOutletsService === 'bulk')}
                onClose={() => setAssigningOutletsService(null)}
                onSave={async (id, data) => {
                    if (assigningOutletsService === 'bulk') {
                        await Promise.all(selectedServiceIds.map(sid => updateService(sid, data)));
                        setSelectedServiceIds([]);
                    } else {
                        await updateService(id, data);
                    }
                }}
                service={assigningOutletsService === 'bulk' ? { name: `${selectedServiceIds.length} Services` } : assigningOutletsService}
                outlets={outlets}
            />

            <CategorySelectModal
                isOpen={!!assigningCategoryService || (selectedServiceIds.length > 0 && assigningCategoryService === 'bulk')}
                onClose={() => setAssigningCategoryService(null)}
                onSave={async (id, data) => {
                    if (assigningCategoryService === 'bulk') {
                        await Promise.all(selectedServiceIds.map(sid => updateService(sid, data)));
                        setSelectedServiceIds([]);
                    } else {
                        await updateService(id, data);
                    }
                }}
                service={assigningCategoryService === 'bulk' ? { name: `${selectedServiceIds.length} Services` } : assigningCategoryService}
                categories={categories}
            />

            {/* Service Table / Cards */}
            <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                {/* Desktop View (Table) */}
                <div className="hidden lg:block table-responsive">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-surface-alt/50 border-b border-border">
                                <th className="px-6 py-4 w-10">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                        checked={selectedServiceIds.length === filteredServices.length && filteredServices.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Service Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Target</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Duration</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center text-rose-400">GST %</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Outlets</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <Scissors className="w-8 h-8" />
                                            <p className="text-sm font-bold">No services found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr key={service._id} className={`hover:bg-surface-alt/50 transition-colors group ${selectedServiceIds.includes(service._id) ? 'bg-primary/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                checked={selectedServiceIds.includes(service._id)}
                                                onChange={() => toggleSelectService(service._id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 overflow-hidden">
                                                    {service.image ? (
                                                        <img 
                                                            src={service.image.startsWith('http') ? service.image : `${API_BASE_URL}${service.image}`} 
                                                            alt={service.name} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <Scissors className="w-5 h-5" />
                                                    )}
                                                </div>

                                                <div className="flex flex-col">
                                                    <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">{service.name}</p>
                                                    <div className="lg:hidden mt-1">
                                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                            service.gender === 'men' ? 'bg-blue-100 text-blue-700' : 
                                                            service.gender === 'women' ? 'bg-pink-100 text-pink-700' : 
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {service.gender || 'both'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                                                service.gender === 'men' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                                                service.gender === 'women' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                                                'bg-slate-50 text-slate-500 border border-slate-200'
                                            }`}>
                                                {service.gender === 'men' ? 'Men' : service.gender === 'women' ? 'Women' : 'Both'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {service.category ? (
                                                <button 
                                                    onClick={() => setAssigningCategoryService(service)}
                                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-tighter hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                >
                                                    <Tag className="w-2.5 h-2.5" />
                                                    {service.category}
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setAssigningCategoryService(service)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border-2 border-dashed border-border text-text-muted hover:text-primary hover:border-primary/40 text-[10px] font-bold uppercase tracking-tighter transition-all active:scale-95"
                                                >
                                                    <Plus className="w-2.5 h-2.5" />
                                                    Select Category
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-text-secondary">
                                                <Clock className="w-3.5 h-3.5 text-text-muted" />
                                                {service.duration} min
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-text">₹{service.price}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs font-bold text-rose-500/60">
                                            {service.gst}%
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => setAssigningOutletsService(service)}
                                                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-tighter hover:text-primary transition-colors hover:bg-primary/5 py-1.5 rounded-lg border border-transparent hover:border-primary/10"
                                                title="Assign Outlets"
                                            >
                                                <Building2 className="w-3.5 h-3.5 text-text-muted" />
                                                {(!service.outletIds || service.outletIds.length === 0) 
                                                    ? 'All Outlets' 
                                                    : `${service.outletIds.length} Outlet${service.outletIds.length > 1 ? 's' : ''}`}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => onToggleStatus?.(service._id)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all active:scale-90 ${service.status === 'active'
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                                                        }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${service.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    {service.status}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/admin/services/view/${service._id}`)}
                                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all" 
                                                    title="View Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onEdit?.(service)}
                                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all"
                                                    title="Edit Service"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
                                                            onDelete?.(service._id);
                                                        }
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-rose-500 transition-all"
                                                    title="Delete Service"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="lg:hidden p-4 space-y-4">
                    {filteredServices.length === 0 ? (
                        <div className="py-20 text-center opacity-40">
                            <Scissors className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-sm font-bold">No services found</p>
                        </div>
                    ) : (
                        filteredServices.map((service) => (
                            <div 
                                key={service._id} 
                                className={`bg-surface-alt/30 border border-border rounded-2xl p-4 space-y-4 transition-all ${selectedServiceIds.includes(service._id) ? 'ring-2 ring-primary border-primary/20 bg-primary/5' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                            checked={selectedServiceIds.includes(service._id)}
                                            onChange={() => toggleSelectService(service._id)}
                                        />
                                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shrink-0 overflow-hidden">
                                            {service.image ? (
                                                <img 
                                                    src={service.image.startsWith('http') ? service.image : `${API_BASE_URL}${service.image}`} 
                                                    alt={service.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <Scissors className="w-5 h-5" />
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-bold text-text">{service.name}</h3>
                                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                    service.gender === 'men' ? 'bg-blue-100 text-blue-700' : 
                                                    service.gender === 'women' ? 'bg-pink-100 text-pink-700' : 
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {service.gender || 'both'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                                                    <Tag className="w-2.5 h-2.5" />
                                                    {service.category || 'NO CATEGORY'}
                                                </span>
                                                <span className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded flex items-center gap-1 ${service.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                    <div className={`w-1 h-1 rounded-full ${service.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    {service.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => navigate(`/admin/services/view/${service._id}`)}
                                            className="p-1.5 text-text-muted hover:text-primary transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/admin/services/edit/${service._id}`)}
                                            className="p-1.5 text-text-muted hover:text-primary transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Pricing</span>
                                        <div className="flex items-center gap-1 text-sm font-bold text-text">
                                            <IndianRupee className="w-3 h-3 text-text-muted" />
                                            {service.price}
                                            <span className="text-[9px] text-rose-400">({service.gst}%)</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Timing</span>
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-text">
                                            <Clock className="w-3.5 h-3.5 text-text-muted" />
                                            {service.duration} MIN
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <button 
                                        onClick={() => setAssigningOutletsService(service)}
                                        className="inline-flex items-center gap-1.5 text-[9px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors"
                                    >
                                        <Building2 className="w-3.5 h-3.5" />
                                        {(!service.outletIds || service.outletIds.length === 0) ? 'GLOBAL (ALL OUTLETS)' : `${service.outletIds.length} BRANCHES`}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (window.confirm(`Delete "${service.name}"?`)) {
                                                onDelete?.(service._id);
                                            }
                                        }}
                                        className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
