import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, IndianRupee, Store, CheckCircle2 } from 'lucide-react';
import mockApi from '../../services/mock/mockApi';
import { useBusiness } from '../../contexts/BusinessContext';
import { useInventory } from '../../contexts/InventoryContext';

export default function ProductsPage() {
    const { outlets } = useBusiness();
    const { addProduct: contextAddProduct, updateProduct: contextUpdateProduct, products: invProducts } = useInventory();
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterOutlet, setFilterOutlet] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ 
        name: '', 
        sku: '', 
        price: '', 
        category: '', 
        stockQuantity: '', 
        lowStockThreshold: 5,
        availabilityType: 'all', 
        outletIds: []
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await mockApi.get('/products');
            const list = data?.data?.results || data?.results || data?.data || data || [];
            setProducts(Array.isArray(list) ? list : []);
        } catch (err) {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const toApiPayload = (f) => ({
        name: f.name,
        sku: f.sku,
        price: Number(f.price) || 0,
        category: f.category || '',
        stockQuantity: Number(f.stockQuantity) || 0,
        status: 'active',
        extended: {
            threshold: Number(f.lowStockThreshold) || 5,
            availability: f.availabilityType === 'selected' ? 'selected' : 'all',
            outletIds: Array.isArray(f.outletIds) ? f.outletIds : [],
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = toApiPayload(form);
            if (editing) {
                await mockApi.patch(`/products/${editing._id || editing.id}`, payload);
            } else {
                await mockApi.post('/products', payload);
            }
            setShowModal(false); setEditing(null);
            setForm({ name: '', sku: '', price: '', category: '', stockQuantity: '', lowStockThreshold: 5, availabilityType: 'all', outletIds: [] });
            fetchProducts();
        } catch (err) { alert('Error saving product locally'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try { await mockApi.delete(`/products/${id}`); fetchProducts(); } catch { alert('Error deleting'); }
    };

    const openEdit = (p) => {
        setEditing(p);
        setForm({ 
            name: p.name, 
            sku: p.sku || '', 
            price: p.price, 
            category: p.category || '', 
            stockQuantity: p.stockQuantity || p.stock || 0, 
            lowStockThreshold: p.extended?.threshold || p.lowStockThreshold || 5,
            availabilityType: p.extended?.outletIds?.length > 0 || p.outletIds?.length > 0 ? 'selected' : 'all',
            outletIds: p.extended?.outletIds || p.outletIds || []
        });
        setShowModal(true);
    };

    const filtered = products.filter((p) => {
        const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
        const prodOutletIds = p.extended?.outletIds || p.outletIds || [];
        const matchesOutlet = filterOutlet === 'All' || 
                             (prodOutletIds.includes(filterOutlet)) || 
                             (filterOutlet === 'General' && prodOutletIds.length === 0);
        return matchesSearch && matchesOutlet;
    });

    return (
        <div className="space-y-6 italic text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-left font-black leading-none">
                    <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Products Master</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em]">{products.length} products registered</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setForm({ name: '', sku: '', price: '', category: '', stockQuantity: '', lowStockThreshold: 5, availabilityType: 'all', outletIds: [] }); setShowModal(true); }}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 border font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <Plus className="w-4 h-4" /> Register New Asset
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex items-center bg-surface border border-border/40 px-4 py-3 shadow-sm">
                    <Search className="w-4 h-4 text-text-muted mr-3" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search assets by name or SKU..."
                        className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-foreground placeholder:text-text-muted/40 outline-none w-full italic"
                    />
                </div>

                <div className="w-full sm:w-64">
                    <select
                        value={filterOutlet}
                        onChange={(e) => setFilterOutlet(e.target.value)}
                        className="w-full bg-surface border border-border/40 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground outline-none font-black italic"
                    >
                        <option value="All">Global Catalog (All)</option>
                        <option value="General">System General</option>
                        {outlets.map(o => (
                            <option key={o._id || o.id} value={o._id || o.id}>{o.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-surface border border-border/40 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <p className="text-sm font-black italic opacity-40 uppercase tracking-widest">Accessing Asset Database...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <Package className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-10" />
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest">No Assets Detected</h3>
                        <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">Zero results for current search parameters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-alt border-b border-border/40"><tr>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest italic">Product Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest italic hidden sm:table-cell">SKU Vector</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest italic">Valuation</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest italic">Stock Density</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest italic hidden md:table-cell">Asset Deployment</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest italic text-right">Operation</th>
                            </tr></thead>
                            <tbody className="divide-y divide-border/20">
                                {filtered.map((p) => (
                                    <tr key={p._id || p.id} className="hover:bg-surface-alt/30 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1 h-6 bg-primary" />
                                                <span className="text-sm font-black text-foreground uppercase tracking-tight italic">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-[10px] font-black text-text-muted uppercase font-mono">{p.sku || '---'}</td>
                                        <td className="px-8 py-5">
                                            <span className="flex items-center gap-1 font-black text-foreground text-sm italic tracking-tighter">
                                                <IndianRupee size={12} className="text-primary" />
                                                {(p.price || 0).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${p.stockQuantity <= (p.extended?.threshold || p.lowStockThreshold || 5) ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                                {p.stockQuantity <= (p.extended?.threshold || p.lowStockThreshold || 5) && <AlertTriangle size={10} />}
                                                {p.stockQuantity || 0} UNITS
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {!(p.extended?.outletIds || p.outletIds)?.length ? (
                                                    <span className="text-[8px] font-black text-text-muted bg-surface-alt px-2 py-0.5 border border-border/40 uppercase">Global</span>
                                                ) : (
                                                    (p.extended?.outletIds || p.outletIds).map(oid => {
                                                        const o = outlets.find(out => out._id === oid || out.id === oid);
                                                        return <span key={oid} className="text-[8px] font-black text-primary bg-primary/5 px-2 py-0.5 border border-primary/10 uppercase">{o?.name || 'Local Outlet'}</span>
                                                    })
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(p)} className="p-2 border border-border/40 text-text-muted hover:text-primary transition-all"><Edit size={14} /></button>
                                                <button onClick={() => handleDelete(p._id || p.id)} className="p-2 border border-border/40 text-text-muted hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border w-full max-w-lg p-10 shadow-2xl relative italic text-left" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-10">
                            <Package className="w-10 h-10 text-primary mb-4" />
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">{editing ? 'Modify Asset' : 'Register Asset'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Asset Designation *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-5 py-3 bg-surface-alt border border-border/60 text-sm font-black italic focus:border-primary outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">SKU Vector</label>
                                    <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-5 py-3 bg-surface-alt border border-border/60 text-sm font-black italic focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Category</label>
                                    <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-5 py-3 bg-surface-alt border border-border/60 text-sm font-black italic focus:border-primary outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Valuation (₹)</label>
                                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full px-5 py-3 bg-surface-alt border border-border/60 text-sm font-black italic focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Volume</label>
                                    <input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required className="w-full px-5 py-3 bg-surface-alt border border-border/60 text-sm font-black italic focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Threshold</label>
                                    <input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} className="w-full px-5 py-3 bg-surface-alt border border-border/60 text-sm font-black italic focus:border-primary outline-none" />
                                </div>
                            </div>

                            <div className="p-6 bg-surface-alt border border-border/60 space-y-4">
                                <label className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2 italic"><Store size={14} className="text-primary" /> Deployment Protocol</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={form.availabilityType === 'all'} onChange={() => setForm({ ...form, availabilityType: 'all', outletIds: [] })} className="accent-primary" />
                                        <span className="text-[10px] font-black uppercase">Global</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={form.availabilityType === 'selected'} onChange={() => setForm({ ...form, availabilityType: 'selected' })} className="accent-primary" />
                                        <span className="text-[10px] font-black uppercase">Segmented</span>
                                    </label>
                                </div>
                                {form.availabilityType === 'selected' && (
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        {outlets.map(o => (
                                            <button key={o._id || o.id} type="button" onClick={() => {
                                                const ids = form.outletIds.includes(o._id || o.id) ? form.outletIds.filter(id => id !== (o._id || o.id)) : [...form.outletIds, (o._id || o.id)];
                                                setForm({ ...form, outletIds: ids });
                                            }} className={`px-3 py-2 border text-[9px] font-black uppercase transition-all ${form.outletIds.includes(o._id || o.id) ? 'bg-primary text-white border-primary' : 'bg-white border-border/40 text-text-muted'}`}>
                                                {o.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border border-border/60 text-[10px] font-black uppercase tracking-widest italic">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-primary/20">{editing ? 'Update' : 'Register'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
