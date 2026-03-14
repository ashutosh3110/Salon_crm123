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
import CustomSelect from '../common/CustomSelect';

export default function ProductManager({ products = [], onDelete, onToggleStatus, onEdit, onDuplicate }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [openMenuId, setOpenMenuId] = useState(null);

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search products by name, brand or SKU..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <CustomSelect 
                        value={filterCategory} 
                        onChange={setFilterCategory} 
                        options={categories}
                        className="min-w-[160px]"
                    />
                    <button
                        onClick={() => navigate('/admin/inventory/products/new')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all scale-active"
                    >
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-alt/50 border-b border-border text-left">
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
                                    <td colSpan="6" className="px-6 py-20 text-center text-text-muted bg-surface-alt/20">
                                        No products found in the master list.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-surface-alt/50 transition-colors group text-left">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-surface-alt flex items-center justify-center text-text-muted border border-border">
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
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase">
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
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900'
                                                        : 'bg-surface-alt text-text-muted border border-border'
                                                        }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    {product.status}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => onEdit?.(product)}
                                                    className="p-2 rounded-lg hover:bg-surface-alt hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete?.(product.id)}
                                                    className="p-2 rounded-lg hover:bg-surface-alt hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-rose-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                                                        className="p-2 rounded-lg hover:bg-surface-alt hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    
                                                    {openMenuId === product.id && (
                                                        <>
                                                            <div 
                                                                className="fixed inset-0 z-30" 
                                                                onClick={() => setOpenMenuId(null)} 
                                                            />
                                                            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                                <button
                                                                    onClick={() => {
                                                                        onDuplicate?.(product.id);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-text hover:bg-surface-alt transition-colors flex items-center gap-2 uppercase tracking-tighter"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                    Duplicate Entry
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        onToggleStatus?.(product.id);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-text hover:bg-surface-alt transition-colors flex items-center gap-2 uppercase tracking-tighter"
                                                                >
                                                                    {product.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
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
