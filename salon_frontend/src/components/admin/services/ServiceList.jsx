import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Scissors,
    Clock,
    IndianRupee,
    MoreVertical,
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
import BulkImportModal from './BulkImportModal';
import OutletAssignmentModal from './OutletAssignmentModal';
import ServiceDetailsModal from './ServiceDetailsModal';
import CategorySelectModal from './CategorySelectModal';

export default function ServiceList({ services = [], onDelete, onToggleStatus }) {
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search services by name..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <CustomSelect 
                        value={filterCategory} 
                        onChange={setFilterCategory} 
                        options={categories}
                        className="min-w-[150px]"
                    />

                    <CustomSelect 
                        value={filterOutlet} 
                        onChange={setFilterOutlet} 
                        options={outletOptions}
                        className="min-w-[180px]"
                    />

                    <button
                        onClick={handleRefresh}
                        className="p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-primary transition-all active:scale-95"
                        title="Refresh List"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-text text-sm font-bold shadow-sm hover:bg-surface-alt transition-all scale-active font-black"
                    >
                        <Upload className="w-4 h-4" /> Import
                    </button>

                    <button
                        onClick={() => navigate('/admin/services/new')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all scale-active font-black"
                    >
                        <Plus className="w-4 h-4" /> Add Service
                    </button>
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
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-surface border border-border shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-6 backdrop-blur">
                        <div className="flex items-center gap-2 border-r border-border pr-6">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">
                                {selectedServiceIds.length}
                            </div>
                            <span className="text-sm font-bold text-text">Selected</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <CustomSelect 
                                value={bulkCategoryId || 'Select Category'} 
                                onChange={setBulkCategoryId} 
                                options={['Select Category', ...categories.filter(c => c !== 'All')]}
                                className="min-w-[160px]"
                                position="top"
                            />
                            <button 
                                onClick={async () => {
                                    if (!bulkCategoryId || bulkCategoryId === 'Select Category') return;
                                    await Promise.all(selectedServiceIds.map(id => updateService(id, { category: bulkCategoryId })));
                                    setSelectedServiceIds([]);
                                    setBulkCategoryId('');
                                    handleRefresh();
                                }}
                                disabled={!bulkCategoryId || bulkCategoryId === 'Select Category'}
                                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Apply Category
                            </button>
                        </div>

                        <div className="w-px h-8 bg-border mx-2" />

                        <button 
                            onClick={() => setAssigningOutletsService('bulk')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-surface-alt text-sm font-bold transition-all"
                        >
                            <Building2 className="w-4 h-4 text-primary" />
                            Update Outlets
                        </button>

                        <button 
                            onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete ${selectedServiceIds.length} services?`)) {
                                    await Promise.all(selectedServiceIds.map(id => deleteService(id)));
                                    setSelectedServiceIds([]);
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-rose-50 text-rose-600 text-sm font-bold transition-all ml-4"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>

                        <button 
                            onClick={() => setSelectedServiceIds([])}
                            className="p-2 hover:bg-surface-alt rounded-lg transition-all ml-2"
                        >
                            <XCircle className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>
                </div>
            )}

            <ServiceDetailsModal
                isOpen={!!viewingService}
                onClose={() => setViewingService(null)}
                service={viewingService}
                outlets={outlets}
            />

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

            {/* Service Table */}
            <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                <div className="table-responsive">
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
                                    <td colSpan="8" className="px-6 py-20 text-center">
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
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                                    <Scissors className="w-5 h-5" />
                                                </div>
                                                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">{service.name}</p>
                                            </div>
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
                                                    onClick={() => setViewingService(service)}
                                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all" 
                                                    title="View Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/services/edit/${service._id}`)}
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
                                                <button className="p-2 rounded-lg hover:bg-surface-alt hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all">
                                                    <MoreVertical className="w-4 h-4" />
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
        </div>
    );
}
