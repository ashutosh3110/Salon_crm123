import React, { useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Box,
    Tag,
    Building2,
    AlertTriangle,
    Edit2,
    Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductManager({ products = [], onDelete, onToggleStatus }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const categories = ['All', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search products by name, brand or SKU..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <select
                        className="px-3 py-2 rounded-xl text-sm font-bold text-text-secondary bg-slate-50 border border-border focus:outline-none"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button
                        onClick={() => navigate('/admin/inventory/products/new')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all scale-active"
                    >
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Product Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Brand & Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Selling Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Current Stock</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-text-muted bg-slate-50/20">
                                        No products found in the master list.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-text-muted border border-border">
                                                    <Box className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">{product.name}</p>
                                                    <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5 uppercase font-bold tracking-tighter">
                                                        SKU: {product.sku}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase">
                                                    <Building2 className="w-2.5 h-2.5" />
                                                    {product.brand}
                                                </div>
                                                <p className="text-xs text-text flex items-center gap-1 font-medium">
                                                    <Tag className="w-3 h-3 text-text-muted" />
                                                    {product.category}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-text">
                                            ₹{(product.sellingPrice || product.price || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-sm font-bold ${product.stock < (product.threshold || 10) ? 'text-rose-500' : 'text-text'}`}>
                                                    {product.stock}
                                                </span>
                                                {product.stock < (product.threshold || 10) && (
                                                    <span className="text-[8px] font-bold text-rose-500 uppercase tracking-tighter flex items-center gap-0.5">
                                                        <AlertTriangle className="w-2 h-2" />
                                                        Low
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => onToggleStatus?.(product.id)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all active:scale-95 ${product.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        : 'bg-slate-50 text-slate-500 border border-slate-200'
                                                        }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    {product.status}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete?.(product.id)}
                                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-rose-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-text transition-all">
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
