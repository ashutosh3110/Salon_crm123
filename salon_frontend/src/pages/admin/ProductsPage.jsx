import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, IndianRupee } from 'lucide-react';
import api from '../../services/api';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', sku: '', price: '', category: '', stockQuantity: '', lowStockThreshold: 5 });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/products');
            // Backend returns { results: [], ... } for paginated queries
            const list = data?.data?.results || data?.results || data?.data || data || [];
            setProducts(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await api.put(`/products/${editing._id}`, form); }
            else { await api.post('/products', form); }
            setShowModal(false); setEditing(null);
            setForm({ name: '', sku: '', price: '', category: '', stockQuantity: '', lowStockThreshold: 5 });
            fetchProducts();
        } catch (err) { alert(err.response?.data?.message || 'Error saving product'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try { await api.delete(`/products/${id}`); fetchProducts(); } catch { alert('Error deleting'); }
    };

    const openEdit = (p) => {
        setEditing(p);
        setForm({ name: p.name, sku: p.sku || '', price: p.price, category: p.category || '', stockQuantity: p.stockQuantity, lowStockThreshold: p.lowStockThreshold || 5 });
        setShowModal(true);
    };

    const filtered = products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Merchandise Catalog</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em]">{products.length} registered units</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setForm({ name: '', sku: '', price: '', category: '', stockQuantity: '', lowStockThreshold: 5 }); setShowModal(true); }}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Protocol
                </button>
            </div>

            <div className="flex items-center bg-surface-alt rounded-none border border-border px-4 py-3 max-w-md shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="w-4 h-4 text-text-muted mr-3" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Scan products or SKU codes..."
                    className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-text placeholder:text-text-muted/40 outline-none w-full"
                />
            </div>

            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-none animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <Package className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                        <h3 className="text-sm font-black text-text uppercase tracking-widest">No Inventory Found</h3>
                        <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">System scan complete</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border bg-surface-alt">
                                <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80">Entity Item</th>
                                <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80 hidden sm:table-cell">SKU ID</th>
                                <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80">Unit Price</th>
                                <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80">Stock pulse</th>
                                <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80 hidden md:table-cell">Metadata</th>
                                <th className="text-right px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80">Control</th>
                            </tr></thead>
                            <tbody>
                                {filtered.map((p) => (
                                    <tr key={p._id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary group-hover:scale-105 transition-transform">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-black text-text uppercase tracking-tight">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-widest hidden sm:table-cell font-mono">{p.sku || 'N/A'}</td>
                                        <td className="px-8 py-5">
                                            <span className="flex items-center gap-1 font-black text-text text-sm">
                                                <IndianRupee className="w-3.5 h-3.5 opacity-40" />
                                                {p.price.toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest border ${p.stockQuantity <= (p.lowStockThreshold || 5) ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {p.stockQuantity <= (p.lowStockThreshold || 5) && <AlertTriangle className="w-3.5 h-3.5" />}
                                                {p.stockQuantity} UNITS
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest hidden md:table-cell">{p.category || 'GENERAL'}</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(p)} className="p-2.5 rounded-none bg-surface-alt border border-border text-text-muted hover:text-primary transition-all shadow-sm">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(p._id)} className="p-2.5 rounded-none bg-surface-alt border border-border text-text-muted hover:text-rose-600 transition-all shadow-sm">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" onClick={() => setShowModal(false)}>
                    <div className="bg-surface rounded-none w-full max-w-lg p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-border" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-16 h-16 rounded-none bg-primary/5 text-primary flex items-center justify-center mb-6 border border-primary/20">
                                <Package className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-text uppercase tracking-tight">{editing ? 'Edit Protocol' : 'New Protocol'}</h2>
                            <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Provisioning material data</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Item Identity *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-text-muted/20" placeholder="e.g. Silk Serum Pro" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">SKU identifier</label>
                                    <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-text-muted/20" placeholder="SKU-XXXX" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Category tag</label>
                                    <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-text-muted/20" placeholder="e.g. HAIRCARE" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Value (₹) *</label>
                                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Stock *</label>
                                    <input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Threshold</label>
                                    <input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4.5 rounded-none border border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt transition-all">Abort</button>
                                <button type="submit" className="flex-1 py-4.5 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all">{editing ? 'Commit' : 'Deploy Item'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
