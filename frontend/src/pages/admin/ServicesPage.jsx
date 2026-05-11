import React, { useMemo, useState } from 'react';
import {
    ChevronRight, Zap, TrendingUp, Layers, Settings2, Plus, Scissors, XCircle,
    Search, RefreshCcw, Download, Upload
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterOutlet, setFilterOutlet] = useState('All Outlets');
    const [importing, setImporting] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    // Disable body scroll when modal is open
    React.useEffect(() => {
        if (isFormModalOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.paddingRight = '5px';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.paddingRight = '';
        };
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

    const handleRefresh = async () => {
        await Promise.all([fetchServices(), fetchCategories()]);
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                'Name': 'Classic Haircut',
                'Category': 'Hair Care',
                'Price': 499,
                'Duration (mins)': 45,
                'Gender': 'both',
                'Outlets (Comma Separated)': '',
                'Description': 'Professional precision haircutting',
                'GST %': 18,
                'Commission Applicable': 'yes',
                'Commission Type': 'percent',
                'Commission Value': 10,
                'Resource Type': 'chair'
            }
        ];

        import('xlsx').then(m => {
            const ws = m.utils.json_to_sheet(templateData);
            const wb = m.utils.book_new();
            m.utils.book_append_sheet(wb, ws, 'Services');
            
            const helpData = outlets.map(o => ({ 'Available Outlets': o.name }));
            const wsHelp = m.utils.json_to_sheet(helpData);
            m.utils.book_append_sheet(wb, wsHelp, 'Outlet_Guide');

            m.writeFile(wb, 'Services_Bulk_Upload_Template.xlsx');
            import('react-hot-toast').then(t => t.toast.success('Template downloaded!'));
        });
    };

    const handleDirectUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await import('../../services/api').then(m => m.default.post('/services/bulk-import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }));

            if (response.data.success) {
                import('react-hot-toast').then(t => t.toast.success(`Successfully imported ${response.data.importedCount} services!`));
                handleRefresh();
            }
        } catch (error) {
            import('react-hot-toast').then(t => t.toast.error(error.response?.data?.message || 'Bulk import failed'));
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    const handleDownloadCategoryTemplate = () => {
        const templateData = [
            {
                'Name': 'Hair Care',
                'Gender': 'women',
                'Status': 'active'
            },
            {
                'Name': 'Facial & Clean-up',
                'Gender': 'women',
                'Status': 'active'
            },
            {
                'Name': 'Men\'s Grooming',
                'Gender': 'men',
                'Status': 'active'
            }
        ];

        import('xlsx').then(m => {
            const ws = m.utils.json_to_sheet(templateData);
            const wb = m.utils.book_new();
            m.utils.book_append_sheet(wb, ws, 'Categories');
            m.writeFile(wb, 'Service_Categories_Bulk_Upload_Template.xlsx');
            import('react-hot-toast').then(t => t.toast.success('Template downloaded!'));
        });
    };

    const handleCategoryBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await import('../../services/api').then(m => m.default.post('/categories/bulk-import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }));

            if (response.data.success) {
                import('react-hot-toast').then(t => t.toast.success(`Successfully imported ${response.data.importedCount} categories!`));
                handleRefresh();
            }
        } catch (error) {
            import('react-hot-toast').then(t => t.toast.error(error.response?.data?.message || 'Bulk import failed'));
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    const categoriesList = ['All', ...new Set(services.map(s => s.category))];
    const outletOptions = ['All Outlets', ...outlets.map(o => o.name)];

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
            </div>

            {/* Toolbar */}
            {activeTab === 'list' && (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
                    <div className="relative flex-1 max-w-full lg:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search services by name..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <CustomDropdown
                            value={filterCategory}
                            onChange={setFilterCategory}
                            options={categoriesList}
                            className="flex-1 lg:flex-none min-w-[120px] lg:min-w-[150px]"
                        />

                        <CustomDropdown
                            value={filterOutlet}
                            onChange={setFilterOutlet}
                            options={outletOptions}
                            className="flex-1 lg:flex-none min-w-[140px] lg:min-w-[180px]"
                        />

                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <button
                                onClick={handleRefresh}
                                className="flex-1 sm:flex-none p-2.5 rounded-xl bg-white border border-border text-text-muted hover:text-primary transition-all active:scale-95 flex justify-center items-center"
                                title="Refresh List"
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleDownloadTemplate}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-border text-text-muted hover:text-primary transition-all active:scale-95 text-[10px] font-black uppercase tracking-tight"
                            >
                                <Download className="w-3.5 h-3.5" /> Sample
                            </button>

                            <div className="relative flex-1 sm:flex-none">
                                <input
                                    type="file"
                                    id="bulk-upload-top"
                                    className="hidden"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleDirectUpload}
                                />
                                <button
                                    onClick={() => document.getElementById('bulk-upload-top').click()}
                                    disabled={importing}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-text-muted hover:text-primary transition-all active:scale-95 text-[10px] font-black uppercase tracking-tight disabled:opacity-50"
                                >
                                    {importing ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                    {importing ? 'Importing...' : 'Bulk Upload'}
                                </button>
                            </div>

                            <button
                                onClick={handleAddClick}
                                className="flex-[2] sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-tight shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                            >
                                <Plus className="w-4 h-4" /> Add Service
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <button
                            onClick={handleRefresh}
                            className="flex-1 sm:flex-none p-2.5 rounded-xl bg-white border border-border text-text-muted hover:text-primary transition-all active:scale-95 flex justify-center items-center"
                            title="Refresh List"
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleDownloadCategoryTemplate}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-border text-text-muted hover:text-primary transition-all active:scale-95 text-[10px] font-black uppercase tracking-tight"
                        >
                            <Download className="w-3.5 h-3.5" /> Sample
                        </button>

                        <div className="relative flex-1 sm:flex-none">
                            <input
                                type="file"
                                id="category-bulk-upload"
                                className="hidden"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleCategoryBulkUpload}
                            />
                            <button
                                onClick={() => document.getElementById('category-bulk-upload').click()}
                                disabled={importing}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-text-muted hover:text-primary transition-all active:scale-95 text-[10px] font-black uppercase tracking-tight disabled:opacity-50"
                            >
                                {importing ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                {importing ? 'Importing...' : 'Bulk Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Stats Row */}
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
                        searchTerm={searchTerm}
                        filterCategory={filterCategory}
                        filterOutlet={filterOutlet}
                    />
                )}
                {activeTab === 'categories' && (
                    <ServiceCategories
                        categories={categories.map(cat => ({
                            ...cat,
                            serviceCount: services.filter(s => s.categoryId === cat._id || s.category === cat._id || s.category === cat.name).length
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
                <div className="fixed inset-0 z-[1000] flex items-start justify-center p-0 overflow-hidden">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsFormModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-6xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col h-screen sm:h-[95vh] sm:mt-0 rounded-none sm:rounded-t-[32px] sm:rounded-b-[32px] border border-white/20 overflow-hidden">
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
