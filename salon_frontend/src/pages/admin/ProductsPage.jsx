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
                    <h1 className="text-2xl font-bold text-text">Products</h1>
                    <p className="text-sm text-text-secondary mt-1">{products.length} products</p>
                </div>
                <button onClick={() => { setEditing(null); setForm({ name: '', sku: '', price: '', category: '', stockQuantity: '', lowStockThreshold: 5 }); setShowModal(true); }} className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            <div className="flex items-center bg-white rounded-lg border border-border px-3 py-2 max-w-md">
                <Search className="w-4 h-4 text-text-muted mr-2" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products or SKU..." className="bg-transparent text-sm text-text placeholder-text-muted outline-none w-full" />
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20"><Package className="w-12 h-12 text-text-muted mx-auto mb-3" /><p className="text-sm text-text-secondary">No products found</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border bg-surface">
                                <th className="text-left px-5 py-3 font-semibold text-text-secondary">Product</th>
                                <th className="text-left px-5 py-3 font-semibold text-text-secondary hidden sm:table-cell">SKU</th>
                                <th className="text-left px-5 py-3 font-semibold text-text-secondary">Price</th>
                                <th className="text-left px-5 py-3 font-semibold text-text-secondary">Stock</th>
                                <th className="text-left px-5 py-3 font-semibold text-text-secondary hidden md:table-cell">Category</th>
                                <th className="text-right px-5 py-3 font-semibold text-text-secondary">Actions</th>
                            </tr></thead>
                            <tbody>
                                {filtered.map((p) => (
                                    <tr key={p._id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors">
                                        <td className="px-5 py-3 font-medium text-text">{p.name}</td>
                                        <td className="px-5 py-3 text-text-muted hidden sm:table-cell font-mono text-xs">{p.sku || '—'}</td>
                                        <td className="px-5 py-3"><span className="flex items-center gap-0.5 font-medium"><IndianRupee className="w-3 h-3" />{p.price}</span></td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${p.stockQuantity <= (p.lowStockThreshold || 5) ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                {p.stockQuantity <= (p.lowStockThreshold || 5) && <AlertTriangle className="w-3 h-3" />}
                                                {p.stockQuantity}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-text-secondary hidden md:table-cell">{p.category || '—'}</td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-secondary transition-colors"><Edit className="w-4 h-4 text-text-secondary" /></button>
                                                <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-error/10 transition-colors"><Trash2 className="w-4 h-4 text-text-secondary" /></button>
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
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-text mb-5">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">SKU</label><input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">Category</label><input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">Price (₹) *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">Stock *</label><input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">Low Alert</label><input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface transition">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-2.5">{editing ? 'Update' : 'Add Product'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
