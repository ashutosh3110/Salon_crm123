import { useState } from 'react';
import { Search, Plus, ArrowUpDown, X, Package, ShieldCheck, Barcode, Eye, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';
import { generateEAN13 } from '../../contexts/InventoryContext';
import BarcodeDisplay from '../../components/inventory/BarcodeDisplay';
import ProductDetailModal from '../../components/inventory/ProductDetailModal';

const CATEGORIES = ['All', 'Hair Colour', 'Shampoo', 'Conditioner', 'Serum', 'Nail Polish', 'Consumables', 'Skin Care', 'Styling'];

export default function StockOverviewPage() {
    const { products, outlets, addProduct, updateProduct } = useInventory();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [sortBy, setSortBy] = useState('name');
    const [selectedOutletId, setSelectedOutletId] = useState('all');   // outlet filter
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [newProduct, setNewProduct] = useState({
        name: '', sku: '', barcode: '', category: 'Hair Colour', brand: '',
        type: 'retail', stock: 0, minStock: 10, unit: 'pcs',
        costPrice: 0, price: 0, taxRate: 18, supplier: '', reorderQty: 20,
    });

    // ── Get stock for selected outlet (or total) ──────────────
    const getDisplayStock = (product) => {
        if (selectedOutletId === 'all') return product.stock; // total
        return product.stockByOutlet?.[selectedOutletId] ?? 0;
    };

    // ── Filtered + sorted products ────────────────────────────
    const filtered = products
        .filter(p => {
            const q = searchTerm.toLowerCase();
            const matchSearch = p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                (p.barcode || '').includes(searchTerm) ||
                (p.brand || '').toLowerCase().includes(q);
            const matchCat = filterCategory === 'All' || p.category === filterCategory;
            const matchType = filterType === 'All' || p.type === filterType;
            // Outlet filter: only show products that have stock in selected outlet
            const matchOutlet = selectedOutletId === 'all' || (p.stockByOutlet?.[selectedOutletId] ?? 0) >= 0;
            return matchSearch && matchCat && matchType && matchOutlet;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'stock') return getDisplayStock(a) - getDisplayStock(b);
            if (sortBy === 'price') return a.price - b.price;
            return 0;
        });

    const handleAddProduct = (e) => {
        e.preventDefault();
        addProduct({
            ...newProduct,
            stock: Number(newProduct.stock),
            minStock: Number(newProduct.minStock),
            costPrice: Number(newProduct.costPrice),
            price: Number(newProduct.price),
            taxRate: Number(newProduct.taxRate),
            reorderQty: Number(newProduct.reorderQty),
        });
        setIsAddModalOpen(false);
        setNewProduct({ name: '', sku: '', barcode: '', category: 'Hair Colour', brand: '', type: 'retail', stock: 0, minStock: 10, unit: 'pcs', costPrice: 0, price: 0, taxRate: 18, supplier: '', reorderQty: 20 });
    };

    const handleRegenerateBarcode = (id) => {
        const nb = generateEAN13();
        updateProduct(id, { barcode: nb });
        setSelectedProduct(prev => prev ? { ...prev, barcode: nb } : null);
    };

    const statusConfig = {
        'In Stock': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        'Low Stock': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        'Critical': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };

    const selectedOutlet = outlets.find(o => o.id === selectedOutletId);

    return (
        <div className="space-y-5">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Stock Overview</h1>
                    <p className="text-sm text-text-muted font-medium">
                        {filtered.length} products
                        {selectedOutletId !== 'all' && <span className="ml-1 text-primary font-bold">• {selectedOutlet?.name}</span>}
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            {/* ── Outlet Tabs ── */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                    onClick={() => setSelectedOutletId('all')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${selectedOutletId === 'all' ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-surface text-text-secondary border-border/40 hover:border-primary/40'}`}
                >
                    <Package className="w-3.5 h-3.5" /> All Outlets
                </button>
                {outlets.map(outlet => (
                    <button
                        key={outlet.id}
                        onClick={() => setSelectedOutletId(outlet.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${selectedOutletId === outlet.id ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-surface text-text-secondary border-border/40 hover:border-primary/40'}`}
                    >
                        <MapPin className="w-3 h-3" /> {outlet.short}
                    </button>
                ))}
            </div>

            {/* ── Search + Filters ── */}
            <div className="bg-surface rounded-2xl border border-border/40 p-3 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search by name, SKU, barcode or brand..."
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/40 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                        className="px-3 py-2 bg-background border border-border/40 rounded-xl text-xs font-bold text-text-secondary outline-none cursor-pointer">
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}
                        className="px-3 py-2 bg-background border border-border/40 rounded-xl text-xs font-bold text-text-secondary outline-none cursor-pointer">
                        <option value="All">All Types</option>
                        <option value="retail">Retail</option>
                        <option value="service_consumable">Service Use</option>
                    </select>
                    <button
                        onClick={() => setSortBy(s => s === 'name' ? 'stock' : s === 'stock' ? 'price' : 'name')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border/40 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface transition-colors"
                    >
                        <ArrowUpDown className="w-3.5 h-3.5" /> {sortBy === 'name' ? 'Name' : sortBy === 'stock' ? 'Stock ↑' : 'Price'}
                    </button>
                </div>
            </div>

            {/* ── Quick Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total SKUs', value: products.length, color: 'text-primary' },
                    { label: 'With Barcode', value: products.filter(p => p.barcode).length, color: 'text-emerald-600' },
                    { label: selectedOutletId === 'all' ? 'Retail Items' : 'In This Outlet', value: selectedOutletId === 'all' ? products.filter(p => p.type === 'retail').length : products.filter(p => (p.stockByOutlet?.[selectedOutletId] || 0) > 0).length, color: 'text-violet-600' },
                    { label: 'Low / Critical', value: products.filter(p => p.status !== 'In Stock').length, color: 'text-rose-600' },
                ].map(s => (
                    <div key={s.label} className="bg-surface rounded-xl border border-border/40 p-3">
                        <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Products Table ── */}
            <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50">
                                <th className="px-5 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Product / SKU</th>
                                <th className="px-5 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest hidden md:table-cell">Barcode</th>
                                <th className="px-5 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest hidden lg:table-cell">Type</th>
                                <th className="px-5 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    Stock {selectedOutletId !== 'all' && <span className="text-primary normal-case">({selectedOutlet?.short})</span>}
                                </th>
                                {/* Per-outlet columns when viewing all */}
                                {selectedOutletId === 'all' && outlets.map(o => (
                                    <th key={o.id} className="px-3 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest hidden xl:table-cell">{o.short}</th>
                                ))}
                                <th className="px-5 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest hidden sm:table-cell">Price</th>
                                <th className="px-5 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                <th className="px-5 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filtered.map(item => {
                                const displayStock = getDisplayStock(item);
                                const isOutletLow = selectedOutletId !== 'all' && displayStock <= Math.ceil(item.minStock / outlets.length);

                                return (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-surface-alt/50 transition-colors group"
                                    >
                                        {/* Product */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-background border border-border/10 flex items-center justify-center shrink-0 text-sm font-black text-primary">
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-text group-hover:text-primary transition-colors line-clamp-1">{item.name}</p>
                                                    <p className="text-[10px] text-text-muted font-medium">SKU: {item.sku}</p>
                                                    {item.brand && <p className="text-[9px] text-text-muted/60 italic">{item.brand}</p>}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Barcode */}
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            {item.barcode ? (
                                                <div className="bg-white rounded-lg p-1.5 inline-block border border-border/10">
                                                    <BarcodeDisplay value={item.barcode} height={26} width={0.9} fontSize={7} />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { const b = generateEAN13(); updateProduct(item.id, { barcode: b }); }}
                                                    className="text-[10px] font-black text-primary/60 hover:text-primary flex items-center gap-1 border border-dashed border-primary/30 hover:border-primary px-2 py-1 rounded-lg transition-all"
                                                >
                                                    <Barcode className="w-3 h-3" /> Gen
                                                </button>
                                            )}
                                        </td>

                                        {/* Type */}
                                        <td className="px-5 py-4 hidden lg:table-cell">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${item.type === 'retail' ? 'bg-violet-500/10 text-violet-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                                {item.type === 'retail' ? 'Retail' : 'Service'}
                                            </span>
                                        </td>

                                        {/* Stock (outlet-specific or total) */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-1">
                                                <span className={`text-base font-black ${isOutletLow ? 'text-rose-500' : 'text-text'}`}>{displayStock}</span>
                                                <span className="text-[10px] text-text-muted"> {item.unit}</span>
                                                <div className="w-20 h-1.5 bg-background rounded-full overflow-hidden mt-1">
                                                    <div
                                                        className={`h-full rounded-full ${isOutletLow || item.status === 'Critical' ? 'bg-rose-500' : item.status === 'Low Stock' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${Math.min((displayStock / (item.minStock || 1)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Per-outlet columns (all view only, xl+) */}
                                        {selectedOutletId === 'all' && outlets.map(o => (
                                            <td key={o.id} className="px-3 py-4 hidden xl:table-cell text-sm font-bold text-center">
                                                <span className={`${(item.stockByOutlet?.[o.id] || 0) <= Math.ceil(item.minStock / 3) && (item.stockByOutlet?.[o.id] || 0) > 0 ? 'text-rose-500' : 'text-text-secondary'}`}>
                                                    {item.stockByOutlet?.[o.id] ?? 0}
                                                </span>
                                            </td>
                                        ))}

                                        {/* Price */}
                                        <td className="px-5 py-4 hidden sm:table-cell">
                                            <p className="text-sm font-black text-text">₹{item.price}</p>
                                            {item.costPrice && <p className="text-[10px] text-text-muted">Cost: ₹{item.costPrice}</p>}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider border ${statusConfig[item.status] || ''}`}>
                                                {item.status}
                                            </span>
                                        </td>

                                        {/* Action */}
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedProduct(item)}
                                                className="p-2 hover:bg-primary/10 rounded-lg text-text-muted hover:text-primary transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center">
                                        <Package className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-30" />
                                        <p className="text-sm font-bold text-text-muted">No products found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Product Detail Modal ── */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductDetailModal
                        product={selectedProduct}
                        outlets={outlets}
                        onClose={() => setSelectedProduct(null)}
                        onRegenerate={handleRegenerateBarcode}
                    />
                )}
            </AnimatePresence>

            {/* ── Add Product Modal ── */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-2xl rounded-[32px] border border-border/40 shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <Package className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-xl font-black text-text uppercase tracking-tight">Add New Product</h2>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-0.5">Inventory Registration</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-rose-500 transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form className="space-y-5 text-left" onSubmit={handleAddProduct}>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Product Name *</label>
                                            <input required type="text" placeholder="e.g. Matrix Serum 200ml"
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all"
                                                value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">SKU Code *</label>
                                            <input required type="text" placeholder="MAT-SRM-001"
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all uppercase"
                                                value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })} />
                                        </div>
                                    </div>

                                    {/* Barcode */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Barcode</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Enter or auto-generate EAN-13..."
                                                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold font-mono focus:border-primary outline-none transition-all"
                                                value={newProduct.barcode} onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })} />
                                            <button type="button"
                                                onClick={() => setNewProduct({ ...newProduct, barcode: generateEAN13() })}
                                                className="px-4 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-black uppercase hover:bg-primary hover:text-white transition-all flex items-center gap-1.5">
                                                <Barcode className="w-3.5 h-3.5" /> Auto
                                            </button>
                                        </div>
                                        {newProduct.barcode && (
                                            <div className="mt-2 bg-white rounded-xl border border-border/20 p-3 flex justify-center">
                                                <BarcodeDisplay value={newProduct.barcode} height={38} width={1.4} fontSize={9} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Category</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none cursor-pointer"
                                                value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                                                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Brand</label>
                                            <input type="text" placeholder="e.g. Matrix"
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all"
                                                value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Type</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none cursor-pointer"
                                                value={newProduct.type} onChange={e => setNewProduct({ ...newProduct, type: e.target.value })}>
                                                <option value="retail">Retail Product</option>
                                                <option value="service_consumable">Service Consumable</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Stock per outlet */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Initial Stock — Main Storage</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-text-muted uppercase pl-1 truncate">Min. Alert Level</p>
                                                <input required type="number" placeholder="10"
                                                    className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                                    value={newProduct.minStock} onChange={e => setNewProduct({ ...newProduct, minStock: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-text-muted uppercase pl-1">Qty in Main</p>
                                                <input required type="number" placeholder="0"
                                                    className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                                    value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-text-muted uppercase pl-1">Unit</p>
                                                <select className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none cursor-pointer"
                                                    value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}>
                                                    <option value="pcs">Pieces</option>
                                                    <option value="bottles">Bottles</option>
                                                    <option value="packs">Packs</option>
                                                    <option value="litres">Litres</option>
                                                    <option value="ml">Millilitres</option>
                                                </select>
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-text-muted font-bold pl-1 italic">💡 Use Stock Transfer to distribute to outlets after adding.</p>
                                    </div>

                                    {/* Pricing */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Cost Price (₹)</label>
                                            <input required type="number" placeholder="0"
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                                value={newProduct.costPrice} onChange={e => setNewProduct({ ...newProduct, costPrice: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Selling Price (₹)</label>
                                            <input required type="number" placeholder="0"
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                                value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">GST (%)</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none cursor-pointer"
                                                value={newProduct.taxRate} onChange={e => setNewProduct({ ...newProduct, taxRate: e.target.value })}>
                                                <option value={0}>0%</option><option value={5}>5%</option>
                                                <option value={12}>12%</option><option value={18}>18%</option>
                                                <option value={28}>28%</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Margin */}
                                    {newProduct.costPrice > 0 && newProduct.price > 0 && (
                                        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <p className="text-[11px] font-bold text-emerald-700">
                                                Margin: ₹{newProduct.price - newProduct.costPrice} &nbsp;|&nbsp;
                                                {(((newProduct.price - newProduct.costPrice) / newProduct.price) * 100).toFixed(1)}% profit
                                            </p>
                                        </div>
                                    )}

                                    <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all">
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
