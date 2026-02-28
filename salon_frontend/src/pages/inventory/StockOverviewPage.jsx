import { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal, ArrowUpDown, X, Package, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';

export default function StockOverviewPage() {
    const { products, addProduct } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state for add product
    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        category: 'Hair Colour',
        brand: '',
        stock: 0,
        minStock: 10,
        unit: 'pcs',
        price: 0
    });

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddProduct = (e) => {
        e.preventDefault();
        addProduct({
            ...newProduct,
            stock: Number(newProduct.stock),
            minStock: Number(newProduct.minStock),
            price: Number(newProduct.price),
            status: 'In Stock'
        });
        setIsAddModalOpen(false);
        setNewProduct({
            name: '',
            sku: '',
            category: 'Hair Colour',
            brand: '',
            stock: 0,
            minStock: 10,
            unit: 'pcs',
            price: 0
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Stock Overview</h1>
                    <p className="text-sm text-text-muted font-medium">Manage your product inventory and stock levels</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add New Item
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface rounded-2xl border border-border/40 p-3 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search by product name or SKU..."
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border/40 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border/40 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-alt transition-colors">
                        <Filter className="w-3.5 h-3.5" /> Category
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border/40 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-alt transition-colors">
                        <ArrowUpDown className="w-3.5 h-3.5" /> Sort
                    </button>
                </div>
            </div>

            {/* Stock Table */}
            <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                <div className="overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Product / SKU</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Brand</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Stock Level</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredProducts.map((item) => (
                                <tr key={item.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-background border border-border/10 flex items-center justify-center shrink-0">
                                                <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary italic">
                                                    {item.name.charAt(0)}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">{item.name}</p>
                                                <p className="text-[10px] text-text-muted font-medium">SKU: {item.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-text-secondary">{item.category}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-text-secondary">{item.brand || '—'}</td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <span className="text-text">{item.stock} {item.unit}</span>
                                                <span className="text-text-muted italic">Min: {item.minStock}</span>
                                            </div>
                                            <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden border border-border/5">
                                                <div
                                                    className={`h-full rounded-full ${item.status === 'Critical' ? 'bg-rose-500' :
                                                        item.status === 'Low Stock' ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${Math.min((item.stock / 100) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${item.status === 'Critical' ? 'bg-rose-500/10 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.1)]' :
                                            item.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-background rounded-lg text-text-muted hover:text-text transition-all">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add New Item Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-surface w-full max-w-xl rounded-[32px] border border-border/40 shadow-2xl overflow-hidden relative"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <Package className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-xl font-black text-text uppercase tracking-tight">Add New Stock</h2>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-0.5">Inventory Registration</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="w-10 h-10 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form className="space-y-6 text-left" onSubmit={handleAddProduct}>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Product Name</label>
                                            <input required type="text" placeholder="e.g. Matrix Serum" className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                                value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">SKU Code</label>
                                            <input required type="text" placeholder="SKU-XXX-000" className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                                value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Category</label>
                                            <select className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                                value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                                                <option>Hair Colour</option>
                                                <option>Shampoo</option>
                                                <option>Conditioner</option>
                                                <option>Consumables</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Brand</label>
                                            <input required type="text" placeholder="e.g. Matrix" className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                                value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Initial Stock</label>
                                            <input required type="number" placeholder="0" className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                                value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Min. Alert Level</label>
                                            <input required type="number" className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                                value={newProduct.minStock} onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Unit Type</label>
                                            <select className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                                value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}>
                                                <option>Pieces (pcs)</option>
                                                <option>Bottles</option>
                                                <option>Packs</option>
                                                <option>Litres</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Purchase Price (₹)</label>
                                            <input required type="number" placeholder="0" className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                                value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Item will be added to the primary storage location by default.</p>
                                    </div>

                                    <button type="submit" className="w-full py-4.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:translate-y-[-2px] active:translate-y-[0px] transition-all mt-4">
                                        Register Product
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
