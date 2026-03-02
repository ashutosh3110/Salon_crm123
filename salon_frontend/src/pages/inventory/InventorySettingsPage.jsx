import { useState } from 'react';
import { Package, Tag, Truck, Building2, UserCog, Plus, CheckCircle2, MoreHorizontal, X, Edit2, Trash2, Bell, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';

const INITIAL_CATEGORIES = [
    { id: 1, name: 'Hair Colour', items: 124, status: 'Active' },
    { id: 2, name: 'Shampoos', items: 45, status: 'Active' },
    { id: 3, name: 'Styling Products', items: 89, status: 'Active' },
    { id: 4, name: 'Consumables', items: 12, status: 'Restricted' },
];

const INITIAL_SUPPLIERS = [
    { id: 1, name: 'Beauty Hub Supplies', contact: 'Ravi Kumar', phone: '9876543210', status: 'Active' },
    { id: 2, name: 'Lotus Cosmetics', contact: 'Priya Sharma', phone: '9123456789', status: 'Active' },
    { id: 3, name: 'Matrix Distribution', contact: 'Amit Singh', phone: '9988776655', status: 'Active' },
];

export default function InventorySettingsPage() {
    const { outlets } = useInventory();
    const [activeTab, setActiveTab] = useState('Categories');

    // ── Categories State ─────────────────────────────────────
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [catModal, setCatModal] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [catForm, setCatForm] = useState({ name: '', status: 'Active' });
    const [catMenuOpen, setCatMenuOpen] = useState(null);

    // ── Suppliers State ──────────────────────────────────────
    const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
    const [supModal, setSupModal] = useState(false);
    const [editingSup, setEditingSup] = useState(null);
    const [supForm, setSupForm] = useState({ name: '', contact: '', phone: '', status: 'Active' });
    const [supMenuOpen, setSupMenuOpen] = useState(null);

    // ── Alerts State ─────────────────────────────────────────
    const [globalThreshold, setGlobalThreshold] = useState(10);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [smsAlerts, setSmsAlerts] = useState(false);
    const [autoReorder, setAutoReorder] = useState(false);
    const [editThreshold, setEditThreshold] = useState(false);
    const [thresholdInput, setThresholdInput] = useState('10');
    const [catThresholds, setCatThresholds] = useState({});
    const [showCatThresholds, setShowCatThresholds] = useState(false);
    const [alertsSaved, setAlertsSaved] = useState(false);

    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const tabs = [
        { name: 'Categories', icon: Tag, desc: 'Manage product groups' },
        { name: 'Suppliers', icon: Truck, desc: 'Manage vendors & partners' },
        { name: 'Locations', icon: Building2, desc: 'Storage & outlets' },
        { name: 'Alerts Setup', icon: UserCog, desc: 'Thresholds & notifications' },
    ];

    // ── Category CRUD ────────────────────────────────────────
    const openAddCat = () => { setEditingCat(null); setCatForm({ name: '', status: 'Active' }); setCatModal(true); };
    const openEditCat = (cat) => { setEditingCat(cat); setCatForm({ name: cat.name, status: cat.status }); setCatModal(true); setCatMenuOpen(null); };
    const saveCat = (e) => {
        e.preventDefault();
        if (editingCat) {
            setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, ...catForm } : c));
            showToast(`Category "${catForm.name}" updated`);
        } else {
            setCategories(prev => [...prev, { id: Date.now(), name: catForm.name, status: catForm.status, items: 0 }]);
            showToast(`Category "${catForm.name}" added`);
        }
        setCatModal(false);
    };
    const deleteCat = (id) => {
        setCategories(prev => prev.filter(c => c.id !== id));
        setCatMenuOpen(null);
        showToast('Category deleted');
    };
    const toggleCatStatus = (id) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Restricted' : 'Active' } : c));
        setCatMenuOpen(null);
    };

    // ── Supplier CRUD ────────────────────────────────────────
    const openAddSup = () => { setEditingSup(null); setSupForm({ name: '', contact: '', phone: '', status: 'Active' }); setSupModal(true); };
    const openEditSup = (sup) => { setEditingSup(sup); setSupForm({ name: sup.name, contact: sup.contact, phone: sup.phone, status: sup.status }); setSupModal(true); setSupMenuOpen(null); };
    const saveSup = (e) => {
        e.preventDefault();
        if (editingSup) {
            setSuppliers(prev => prev.map(s => s.id === editingSup.id ? { ...s, ...supForm } : s));
            showToast(`Supplier "${supForm.name}" updated`);
        } else {
            setSuppliers(prev => [...prev, { id: Date.now(), ...supForm }]);
            showToast(`Supplier "${supForm.name}" added`);
        }
        setSupModal(false);
    };
    const deleteSup = (id) => { setSuppliers(prev => prev.filter(s => s.id !== id)); setSupMenuOpen(null); showToast('Supplier removed'); };

    // ── Save alerts ──────────────────────────────────────────
    const saveAlerts = () => {
        if (editThreshold) { setGlobalThreshold(Number(thresholdInput)); setEditThreshold(false); }
        setAlertsSaved(true);
        showToast('Alert settings saved successfully');
        setTimeout(() => setAlertsSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-text tracking-tight uppercase">Inventory Settings</h1>
                <p className="text-sm text-text-muted font-medium">Configure categories, suppliers, and stock parameters</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="md:w-64 space-y-2 shrink-0">
                    {tabs.map(tab => (
                        <button key={tab.name} onClick={() => setActiveTab(tab.name)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${activeTab === tab.name ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface text-text-secondary hover:bg-surface-alt border border-border/40'}`}>
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.name ? 'text-white' : 'text-text-muted'}`} />
                            <div>
                                <p className="leading-none">{tab.name}</p>
                                <p className={`text-[9px] mt-1 font-medium ${activeTab === tab.name ? 'text-white/70' : 'text-text-muted'}`}>{tab.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Content Panel */}
                <div className="flex-1 bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm flex flex-col text-left min-h-[400px]">
                    <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-surface/50">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">{activeTab}</h2>
                        {(activeTab === 'Categories' || activeTab === 'Suppliers') && (
                            <button
                                onClick={activeTab === 'Categories' ? openAddCat : openAddSup}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                <Plus className="w-3 h-3" /> New Entry
                            </button>
                        )}
                        {activeTab === 'Alerts Setup' && (
                            <button onClick={saveAlerts}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${alertsSaved ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:scale-105'}`}>
                                {alertsSaved ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                                {alertsSaved ? 'Saved!' : 'Save Settings'}
                            </button>
                        )}
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        {/* ── CATEGORIES ── */}
                        {activeTab === 'Categories' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border/10 group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-surface border border-border/20 flex items-center justify-center">
                                                <Tag className="w-4 h-4 text-text-muted" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text">{cat.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{cat.items} Products Linked</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${cat.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{cat.status}</span>
                                            <div className="relative">
                                                <button onClick={() => setCatMenuOpen(catMenuOpen === cat.id ? null : cat.id)}
                                                    className="p-2 hover:bg-surface rounded-lg text-text-muted transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                                <AnimatePresence>
                                                    {catMenuOpen === cat.id && (
                                                        <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                                            className="absolute right-0 top-full mt-1 bg-surface border border-border/40 rounded-xl shadow-xl z-20 w-40 overflow-hidden py-1">
                                                            <button onClick={() => openEditCat(cat)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-text hover:bg-surface-alt transition-colors text-left">
                                                                <Edit2 className="w-3.5 h-3.5" /> Edit
                                                            </button>
                                                            <button onClick={() => toggleCatStatus(cat.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-text hover:bg-surface-alt transition-colors text-left">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Toggle Status
                                                            </button>
                                                            <button onClick={() => deleteCat(cat.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors text-left">
                                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <div className="text-center py-10 text-sm font-bold text-text-muted">No categories yet. Click "New Entry" to add one.</div>
                                )}
                            </motion.div>
                        )}

                        {/* ── SUPPLIERS ── */}
                        {activeTab === 'Suppliers' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                                {suppliers.map(sup => (
                                    <div key={sup.id} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border/10 group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-surface border border-border/20 flex items-center justify-center">
                                                <Truck className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text">{sup.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold">{sup.contact} · {sup.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${sup.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{sup.status}</span>
                                            <div className="relative">
                                                <button onClick={() => setSupMenuOpen(supMenuOpen === sup.id ? null : sup.id)}
                                                    className="p-2 hover:bg-surface rounded-lg text-text-muted transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                                <AnimatePresence>
                                                    {supMenuOpen === sup.id && (
                                                        <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                                            className="absolute right-0 top-full mt-1 bg-surface border border-border/40 rounded-xl shadow-xl z-20 w-40 overflow-hidden py-1">
                                                            <button onClick={() => openEditSup(sup)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-text hover:bg-surface-alt transition-colors text-left">
                                                                <Edit2 className="w-3.5 h-3.5" /> Edit
                                                            </button>
                                                            <button onClick={() => deleteSup(sup.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors text-left">
                                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* ── LOCATIONS ── */}
                        {activeTab === 'Locations' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 mb-4">
                                    <Building2 className="w-5 h-5 text-amber-500 shrink-0" />
                                    <p className="text-xs font-bold text-text-secondary leading-tight">Outlet locations are synced from business settings. Changes must be approved by the platform administrator.</p>
                                </div>
                                {outlets.map(outlet => (
                                    <div key={outlet.id} className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-border/10">
                                        <div className={`w-10 h-10 rounded-xl ${outlet.color} flex items-center justify-center`}>
                                            <Building2 className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-text">{outlet.name}</p>
                                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{outlet.isWarehouse ? 'Central Warehouse' : 'Retail Outlet'} · ID: {outlet.id}</p>
                                        </div>
                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 uppercase">Active</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* ── ALERTS SETUP ── */}
                        {activeTab === 'Alerts Setup' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                {/* Global threshold */}
                                <div className="p-5 bg-background border border-border/10 rounded-3xl space-y-4">
                                    <h3 className="text-xs font-black text-text uppercase tracking-widest">Global Thresholds</h3>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-text">Low Stock Threshold</p>
                                            <p className="text-xs text-text-muted font-medium mt-0.5">Alert when stock falls below this level</p>
                                        </div>
                                        {editThreshold ? (
                                            <div className="flex items-center gap-2">
                                                <input type="number" min="1" max="999"
                                                    className="w-20 px-3 py-1.5 bg-surface border border-primary/50 rounded-lg text-sm font-black text-text outline-none text-center"
                                                    value={thresholdInput}
                                                    onChange={e => setThresholdInput(e.target.value)}
                                                    onBlur={() => { setGlobalThreshold(Number(thresholdInput)); setEditThreshold(false); }}
                                                    onKeyDown={e => { if (e.key === 'Enter') { setGlobalThreshold(Number(thresholdInput)); setEditThreshold(false); } }}
                                                    autoFocus />
                                                <span className="text-xs text-text-muted">units</span>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setEditThreshold(true); setThresholdInput(String(globalThreshold)); }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border/40 rounded-xl font-black text-sm text-primary hover:border-primary/40 transition-all">
                                                {globalThreshold} <span className="text-[10px] text-text-muted">Units</span>
                                            </button>
                                        )}
                                    </div>

                                    {[
                                        { label: 'Email Notifications', desc: 'Daily alert digest when critical levels hit', value: emailAlerts, set: setEmailAlerts },
                                        { label: 'SMS Alerts', desc: 'Instant SMS on critical shortage', value: smsAlerts, set: setSmsAlerts },
                                        { label: 'Auto-Reorder Suggestions', desc: 'Generate draft POs automatically', value: autoReorder, set: setAutoReorder },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-black text-text">{item.label}</p>
                                                <p className="text-xs text-text-muted font-medium mt-0.5">{item.desc}</p>
                                            </div>
                                            <button type="button" onClick={() => item.set(v => !v)}
                                                className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-all ${item.value ? 'bg-emerald-500 justify-end' : 'bg-border/60 justify-start'}`}>
                                                <div className="w-5 h-5 bg-white rounded-full shadow-sm transition-all" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Per-category thresholds */}
                                <div className="p-5 bg-background border border-border/10 rounded-3xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black text-text uppercase tracking-widest">Per-Category Thresholds</h3>
                                        <button onClick={() => setShowCatThresholds(v => !v)}
                                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                            {showCatThresholds ? 'Collapse ↑' : 'Customize ↓'}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {showCatThresholds && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                                                {INITIAL_CATEGORIES.map(cat => (
                                                    <div key={cat.id} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border/20">
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="w-3.5 h-3.5 text-text-muted" />
                                                            <span className="text-xs font-bold text-text">{cat.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input type="number" min="1"
                                                                className="w-16 px-2 py-1 bg-background border border-border/40 rounded-lg text-xs font-black text-center outline-none focus:border-primary"
                                                                value={catThresholds[cat.id] ?? globalThreshold}
                                                                onChange={e => setCatThresholds(prev => ({ ...prev, [cat.id]: Number(e.target.value) }))} />
                                                            <span className="text-[9px] text-text-muted">units</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Category Modal ── */}
            <AnimatePresence>
                {catModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCatModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-[28px] border border-border/40 shadow-2xl relative p-7">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-black text-text uppercase">{editingCat ? 'Edit Category' : 'New Category'}</h2>
                                <button onClick={() => setCatModal(false)} className="w-8 h-8 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={saveCat} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Name *</label>
                                    <input required type="text" placeholder="e.g. Hair Treatments"
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                        value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status</label>
                                    <select className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none"
                                        value={catForm.status} onChange={e => setCatForm(f => ({ ...f, status: e.target.value }))}>
                                        <option>Active</option>
                                        <option>Restricted</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-[1.01] transition-all">
                                    {editingCat ? 'Save Changes' : 'Add Category'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Supplier Modal ── */}
            <AnimatePresence>
                {supModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSupModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-[28px] border border-border/40 shadow-2xl relative p-7">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-black text-text uppercase">{editingSup ? 'Edit Supplier' : 'New Supplier'}</h2>
                                <button onClick={() => setSupModal(false)} className="w-8 h-8 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={saveSup} className="space-y-4">
                                {[
                                    { key: 'name', label: 'Company Name', placeholder: 'e.g. Beauty Hub Supplies' },
                                    { key: 'contact', label: 'Contact Person', placeholder: 'e.g. Ravi Kumar' },
                                    { key: 'phone', label: 'Phone Number', placeholder: '9876543210' },
                                ].map(field => (
                                    <div key={field.key} className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">{field.label} *</label>
                                        <input required type="text" placeholder={field.placeholder}
                                            className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                            value={supForm[field.key]} onChange={e => setSupForm(f => ({ ...f, [field.key]: e.target.value }))} />
                                    </div>
                                ))}
                                <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-[1.01] transition-all">
                                    {editingSup ? 'Save Changes' : 'Add Supplier'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 bg-surface border border-border/40 rounded-2xl shadow-2xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-sm font-bold text-text">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
