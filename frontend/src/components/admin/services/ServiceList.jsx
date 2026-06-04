import React, { useState } from 'react';
import {
    Plus,
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
    LayoutGrid,
    List
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import CustomSelect from '../common/CustomSelect';
import { useBusiness } from '../../../contexts/BusinessContext';
import { getImageUrl } from '../../../utils/imageUtils';
import api from '../../../services/api';
import OutletAssignmentModal from './OutletAssignmentModal';
import ServiceDetailsModal from './ServiceDetailsModal';
import CategorySelectModal from './CategorySelectModal';

export default function ServiceList({ services = [], onDelete, onToggleStatus, onEdit, onAdd, searchTerm = '', filterCategory = 'All', filterOutlet = 'All Outlets' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { outlets, fetchServices, fetchCategories, updateService, deleteService } = useBusiness();
    const [viewingService, setViewingService] = useState(null);
    const [assigningOutletsService, setAssigningOutletsService] = useState(null);
    const [assigningCategoryService, setAssigningCategoryService] = useState(null);
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);
    const [bulkCategoryId, setBulkCategoryId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid');
    const itemsPerPage = viewMode === 'grid' ? 8 : 10;

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

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

            {/* View Toggle & Count Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border/40 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-2">
                        {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'} Found
                    </span>
                </div>
                <div className="flex items-center gap-1 bg-surface-alt p-1.5 rounded-2xl border border-border/40">
                    <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            viewMode === 'grid'
                                ? 'bg-primary !text-white shadow-md border border-primary'
                                : 'text-text-muted hover:text-foreground'
                        }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Cards
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            viewMode === 'table'
                                ? 'bg-primary !text-white shadow-md border border-primary'
                                : 'text-text-muted hover:text-foreground'
                        }`}
                    >
                        <List className="w-3.5 h-3.5" />
                        Table
                    </button>
                </div>
            </div>

            {/* Service Table / Cards Container */}
            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px] flex flex-col justify-between">
                <div>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                            {filteredServices.length === 0 ? (
                                <div className="col-span-full py-20 text-center flex flex-col items-center gap-2 opacity-40">
                                    <Scissors className="w-8 h-8" />
                                    <p className="text-sm font-bold">No services found matching your criteria</p>
                                </div>
                            ) : (
                                paginatedServices.map((service) => (
                                    <div
                                        key={service._id}
                                        className={`bg-surface border transition-all duration-300 hover:shadow-xl hover:border-primary/20 rounded-2xl overflow-hidden flex flex-col justify-between group relative ${
                                            selectedServiceIds.includes(service._id)
                                                ? 'ring-2 ring-primary border-primary/20 bg-primary/[0.01]'
                                                : 'shadow-sm border-border/70'
                                        }`}
                                    >
                                        {/* Card Header with Image and badges */}
                                        <div className="relative aspect-[2.4/1] bg-slate-100 overflow-hidden border-b border-border">
                                            {service.image ? (
                                                <img
                                                    src={getImageUrl(service.image)}
                                                    alt="Service"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-text-muted bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
                                                    <Scissors className="w-8 h-8 stroke-[1.5]" />
                                                </div>
                                            )}

                                            {/* Selection Checkbox */}
                                            <div className="absolute top-3 left-3 z-10">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-white/40 text-primary bg-black/35 backdrop-blur-md focus:ring-primary/20 cursor-pointer shadow-md"
                                                    checked={selectedServiceIds.includes(service._id)}
                                                    onChange={() => toggleSelectService(service._id)}
                                                />
                                            </div>

                                            {/* Target Gender Badge */}
                                            <div className="absolute bottom-3 left-3 z-10">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                                                    service.gender === 'men' ? 'bg-blue-500/80 text-white border-blue-400/30' :
                                                    service.gender === 'women' ? 'bg-rose-500/80 text-white border-rose-400/30' :
                                                    'bg-slate-900/60 text-white border-white/10'
                                                }`}>
                                                    {service.gender === 'men' ? 'Men' : service.gender === 'women' ? 'Women' : 'Unisex'}
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => onToggleStatus?.(service._id)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-md transition-all active:scale-90 border ${
                                                        service.status === 'active'
                                                            ? 'bg-white/95 hover:bg-white backdrop-blur-md text-emerald-600 border-emerald-100'
                                                            : 'bg-white/95 hover:bg-white backdrop-blur-md text-rose-600 border-rose-100'
                                                    }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${service.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                                    {service.status}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                                            <div className="space-y-2">
                                                {/* Category */}
                                                <div className="flex items-center justify-between">
                                                    {service.category ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setAssigningCategoryService(service)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-[#B4912B]/10 text-slate-600 hover:text-primary border-0 text-[9px] font-bold uppercase tracking-wider transition-colors"
                                                        >
                                                            <Tag className="w-2.5 h-2.5" />
                                                            {service.category}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => setAssigningCategoryService(service)}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-dashed border-border text-text-muted hover:text-primary hover:border-primary/40 text-[9px] font-black uppercase tracking-wider transition-all"
                                                        >
                                                            <Plus className="w-2.5 h-2.5" />
                                                            No Category
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-base font-extrabold text-slate-800 tracking-tight leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                                                    {service.name}
                                                </h3>
                                            </div>

                                            {/* Price and Duration Details (2-column info layout) */}
                                            <div className="bg-slate-50/50 rounded-xl border border-slate-100/60 p-2 grid grid-cols-2 gap-2 relative">
                                                <div className="w-px h-8 bg-slate-200/60 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                <div>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 block">Price</span>
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className="text-base font-extrabold text-slate-800">₹{service.price}</span>
                                                        <span className="text-[8px] font-medium text-slate-400 uppercase tracking-widest ml-1">
                                                            {service.isInclusiveTax ? 'Incl.' : 'Excl.'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pl-2">
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 block">Duration</span>
                                                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        {service.duration} min
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Outlets Info */}
                                            <button
                                                type="button"
                                                onClick={() => setAssigningOutletsService(service)}
                                                className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-[#B4912B]/10 border-0 hover:shadow-sm transition-all duration-200 text-left group/outlet"
                                            >
                                                <Building2 className="w-4 h-4 text-slate-400 group-hover/outlet:text-primary transition-colors shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">Assigned Outlets</span>
                                                    <span className="text-[10px] font-extrabold text-slate-600 group-hover/outlet:text-slate-800 truncate block">
                                                        {(!service.outletIds || service.outletIds.length === 0 || service.outletIds.length === outlets.length)
                                                            ? 'All Outlets'
                                                            : service.outletIds.length === 1
                                                                ? (outlets.find(o => o._id === service.outletIds[0])?.name || '1 Outlet')
                                                                : `${service.outletIds.length} Outlets`}
                                                    </span>
                                                </div>
                                            </button>
                                        </div>

                                        {/* Card Footer Actions */}
                                        <div className="px-3 py-1.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-1.5">
                                            <button
                                                type="button"
                                                title="View"
                                                onClick={() => navigate(`/admin/services/view/${service._id}`)}
                                                className="flex-1 flex items-center justify-center py-1.5 rounded-xl bg-white border border-border/60 hover:border-primary/30 text-slate-500 hover:text-primary transition-all shadow-sm hover:shadow active:scale-95"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title="Edit"
                                                onClick={() => onEdit?.(service)}
                                                className="flex-1 flex items-center justify-center py-1.5 rounded-xl bg-white border border-border/60 hover:border-primary/30 text-slate-500 hover:text-primary transition-all shadow-sm hover:shadow active:scale-95"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title="Delete"
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
                                                        onDelete?.(service._id);
                                                    }
                                                }}
                                                className="flex-1 flex items-center justify-center py-1.5 rounded-xl bg-white border border-border/60 hover:border-rose-300 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 transition-all shadow-sm hover:shadow active:scale-95"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop View (Table) */}
                            <div className="hidden lg:block table-responsive">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-surface-alt/50 border-b border-border">
                                            <th className="px-4 py-2.5 w-10">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                    checked={selectedServiceIds.length === filteredServices.length && filteredServices.length > 0}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Service Name</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Target</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Category</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Duration</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Price</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Tax Mode</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Outlets</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredServices.length === 0 ? (
                                            <tr>
                                                <td colSpan="10" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2 opacity-40">
                                                        <Scissors className="w-8 h-8" />
                                                        <p className="text-sm font-bold">No services found matching your criteria</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedServices.map((service) => (
                                                <tr key={service._id} className={`hover:bg-surface-alt/50 transition-colors group ${selectedServiceIds.includes(service._id) ? 'bg-primary/5' : ''}`}>
                                                    <td className="px-4 py-2.5">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                            checked={selectedServiceIds.includes(service._id)}
                                                            onChange={() => toggleSelectService(service._id)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 overflow-hidden">
                                                                {service.image ? (
                                                                    <img 
                                                                        src={getImageUrl(service.image)} 
                                                                        alt={service.name} 
                                                                        className="w-full h-full object-cover" 
                                                                    />
                                                                ) : (
                                                                    <Scissors className="w-4 h-4" />
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
                                                            service.gender === 'men' ? 'bg-[#eff6ff] dark:bg-blue-950/40 !text-blue-600 dark:!text-blue-400 border border-blue-100 dark:border-blue-900/30' : 
                                                            service.gender === 'women' ? 'bg-[#fff1f2] dark:bg-rose-950/40 !text-rose-600 dark:!text-rose-400 border border-rose-100 dark:border-rose-900/30' : 
                                                            'bg-slate-50 dark:bg-slate-800/50 !text-slate-500 dark:!text-slate-300 border border-slate-200 dark:border-slate-700/50'
                                                        }`}>
                                                            {service.gender === 'men' ? 'Men' : service.gender === 'women' ? 'Women' : 'Both'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {service.category ? (
                                                            <button 
                                                                type="button"
                                                                onClick={() => setAssigningCategoryService(service)}
                                                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 !text-blue-600 dark:!text-blue-400 text-[10px] font-bold uppercase tracking-tighter hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                            >
                                                                <Tag className="w-2.5 h-2.5" />
                                                                {service.category}
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                type="button"
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
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border whitespace-nowrap inline-block ${service.isInclusiveTax ? 'bg-[#ecfdf5] dark:bg-emerald-950/40 !text-emerald-600 dark:!text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-slate-50 dark:bg-slate-800/50 !text-slate-500 dark:!text-slate-300 border border-slate-200 dark:border-slate-700/50'}`}>
                                                            {service.isInclusiveTax ? 'Including GST' : 'Excluding GST'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setAssigningOutletsService(service)}
                                                            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-tighter hover:text-primary transition-colors hover:bg-[#B4912B]/10 py-1.5 rounded-lg border border-transparent hover:border-[#B4912B]/20"
                                                            title="Assign Outlets"
                                                        >
                                                            <Building2 className="w-3.5 h-3.5 text-text-muted" />
                                                            {(!service.outletIds || service.outletIds.length === 0 || service.outletIds.length === outlets.length) 
                                                                ? 'All Outlets' 
                                                                : service.outletIds.length === 1 
                                                                   ? (outlets.find(o => o._id === service.outletIds[0])?.name || '1 Outlet')
                                                                   : `${service.outletIds.length} Outlets`}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => onToggleStatus?.(service._id)}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all active:scale-90 ${service.status === 'active'
                                                                    ? 'bg-[#ecfdf5] dark:bg-[#064e3b]/30 !text-emerald-600 dark:!text-emerald-400 border border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                                                    : 'bg-[#fff1f2] dark:bg-[#881337]/30 !text-rose-600 dark:!text-rose-400 border border-rose-100 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                                                                    }`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${service.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                                {service.status}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                type="button"
                                                                onClick={() => navigate(`/admin/services/view/${service._id}`)}
                                                                className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all" 
                                                                title="View Detail"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => onEdit?.(service)}
                                                                className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all"
                                                                title="Edit Service"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
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

                            {/* Mobile View (Cards) - fallback when in table mode */}
                            <div className="lg:hidden p-4 space-y-4">
                                {filteredServices.length === 0 ? (
                                    <div className="py-20 text-center opacity-40">
                                        <Scissors className="w-12 h-12 mx-auto mb-4" />
                                        <p className="text-sm font-bold">No services found</p>
                                    </div>
                                ) : (
                                    paginatedServices.map((service) => (
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
                                                                src={getImageUrl(service.image)} 
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
                                                        type="button"
                                                        onClick={() => navigate(`/admin/services/view/${service._id}`)}
                                                        className="p-1.5 text-text-muted hover:text-primary transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        type="button"
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
                                                        <span className={`ml-2 text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${service.isInclusiveTax ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                                            {service.isInclusiveTax ? 'Incl.' : 'Excl.'}
                                                        </span>
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
                                                    type="button"
                                                    onClick={() => setAssigningOutletsService(service)}
                                                    className="inline-flex items-center gap-1.5 text-[9px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors"
                                                >
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    {(!service.outletIds || service.outletIds.length === 0 || service.outletIds.length === outlets.length) 
                                                       ? 'ALL OUTLETS' 
                                                       : service.outletIds.length === 1 
                                                           ? (outlets.find(o => o._id === service.outletIds[0])?.name?.toUpperCase() || '1 BRANCH')
                                                           : `${service.outletIds.length} BRANCHES`}
                                                </button>
                                                <button 
                                                    type="button"
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
                        </>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="bg-surface-alt/50 px-6 py-4 border-t border-border flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">
                        Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} Services
                    </span>
                    <div className="flex gap-4">
                        <button 
                            type="button"
                            onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={currentPage === 1}
                            className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-20"
                        >
                            Previous
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-20"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
