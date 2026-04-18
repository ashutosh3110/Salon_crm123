import React, { useMemo, useState } from 'react';
import {
    ChevronRight, Zap, TrendingUp, Layers, Settings2, Plus, Scissors, XCircle
} from 'lucide-react';
import ServiceList from '../../components/admin/services/ServiceList';
import ServiceForm from '../../components/admin/services/ServiceForm';
import ServiceCategories from '../../components/admin/services/ServiceCategories';
import ServiceSettings from '../../components/admin/services/ServiceSettings';
import { useBusiness } from '../../contexts/BusinessContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomDropdown from '../../components/common/CustomDropdown';

export default function ServicesPage({ tab = 'list' }) {
    const activeTab = tab;
    const {
        services,
        categories,
        addService,
        updateService,
        deleteService,
        toggleServiceStatus,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus,
        fetchServices,
        fetchCategories,
        outlets,
        activeOutletId
    } = useBusiness();

    const [selectedOutletId, setSelectedOutletId] = useState('all');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    // Disable body scroll when modal is open
    React.useEffect(() => {
        if (isFormModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isFormModalOpen]);

    React.useEffect(() => {
        fetchServices(null, selectedOutletId === 'all' ? null : selectedOutletId);
        fetchCategories();
    }, [fetchServices, fetchCategories, selectedOutletId, activeTab]);

    const stats = useMemo(() => ([
        { label: 'Active Services', value: services.length, icon: Zap, color: 'primary' },
        { label: 'Catalog Value', value: `₹${services.reduce((s, p) => s + p.price, 0).toLocaleString()}`, icon: TrendingUp, color: 'emerald' },
        { label: 'Service Categories', value: categories.length, icon: Layers, color: 'orange' },
        { label: 'Avg. Duration', value: `${Math.round(services.reduce((s, p) => s + p.duration, 0) / (services.length || 1))}m`, icon: Settings2, color: 'violet' }
    ]), [services, categories]);

    const handleAddClick = () => {
        setEditingService(null);
        setIsFormModalOpen(true);
    };

    const handleEditClick = (service) => {
        setEditingService(service);
        setIsFormModalOpen(true);
    };

    const handleSaveService = async (data) => {
        if (editingService) {
            await updateService(editingService._id, data);
        } else {
            await addService(data);
        }
        setIsFormModalOpen(false);
        setEditingService(null);
    };

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">
                        <span className="opacity-60">Operations</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        <span className="text-primary">Catalog Management</span>
                    </div>
                    <h1 className="text-3xl font-black text-text tracking-tighter uppercase leading-none">Portfolio Services</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60">Architect and manage your salon service portfolio</p>
                </div>
                {activeTab === 'list' && (
                    <button
                        onClick={handleAddClick}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-text text-white text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-primary transition-all active:scale-95 italic"
                    >
                        <Plus className="w-4 h-4" />
                        Initialize New Service
                    </button>
                )}
            </div>

            {/* Outlet Filter */}
            {activeTab === 'list' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/50 p-4 border border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Layers className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-text-muted tracking-widest leading-none mb-1">View Scope</p>
                            <p className="text-[11px] font-black uppercase text-text tracking-tighter">Filter by Outlet</p>
                        </div>
                    </div>
                    
                    <CustomDropdown
                        className="w-full sm:w-64"
                        placeholder="All Outlets"
                        options={[
                            { label: 'All Outlets (Global)', value: 'all' },
                            ...outlets.map(o => ({ label: o.name, value: o._id }))
                        ]}
                        value={selectedOutletId}
                        onChange={setSelectedOutletId}
                    />
                    
                    {selectedOutletId !== 'all' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 animate-in fade-in slide-in-from-left-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest italic">
                                Showing specific + common services
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Stats Row - Always Visible in List */}
            {activeTab === 'list' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 border border-border shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                            <div className={`absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all`} />
                            <div className="relative z-10 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <stat.icon className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-text tracking-tighter uppercase">
                                        {typeof stat.value === 'string' ? stat.value : <AnimatedCounter value={stat.value} />}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Content Area */}
            <div className={`border-t border-border pt-6 ${activeTab === 'list' ? '' : 'min-h-[600px]'}`}>
                {activeTab === 'list' && (
                    <ServiceList
                        services={services}
                        onDelete={deleteService}
                        onToggleStatus={toggleServiceStatus}
                        onEdit={handleEditClick}
                        onAdd={handleAddClick}
                    />
                )}
                {activeTab === 'categories' && (
                    <ServiceCategories
                        categories={categories.map(cat => ({
                            ...cat,
                            serviceCount: services.filter(s => s.category === cat.name).length
                        }))}
                        onAdd={addCategory}
                        onUpdate={updateCategory}
                        onDelete={deleteCategory}
                        onToggleStatus={toggleCategoryStatus}
                    />
                )}
                {activeTab === 'settings' && <ServiceSettings />}
            </div>

            {/* Service Form Modal */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-end justify-center p-0 overflow-hidden">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsFormModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-5xl shadow-[0_-8px_32px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-20 duration-500 flex flex-col h-[92vh] rounded-t-[40px] border-t border-white/20">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20">
                                    <Scissors className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] italic text-text">
                                        {editingService ? `Edit Service: ${editingService.name}` : 'Initialize New Entry'}
                                    </h2>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted opacity-60 italic leading-none">Define catalog service protocols</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsFormModalOpen(false)}
                                className="p-1.5 text-text-muted hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <ServiceForm
                                onSave={handleSaveService}
                                onCancel={() => setIsFormModalOpen(false)}
                                categories={categories}
                                initialData={editingService}
                                isModal={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
