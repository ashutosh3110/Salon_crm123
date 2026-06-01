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
    Trash2,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../common/CustomSelect';
import { useBusiness } from '../../../contexts/BusinessContext';
import { getImageUrl } from '../../../utils/imageUtils';

export default function ProductManager({ products = [], onDelete, onToggleStatus, onEdit, onDuplicate }) {
    const navigate = useNavigate();
    const { outlets } = useBusiness();
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

    const salonAvailabilityLabel = (product) => {
        const ids = product.outletIds;
        if (!ids || !Array.isArray(ids) || ids.length === 0) return '—';
        const names = ids
            .map((oid) => outlets.find((o) => String(o._id) === String(oid) || o._id === oid)?.name)
            .filter(Boolean);
        if (names.length) return names.slice(0, 2).join(', ') + (names.length > 2 ? ` +${names.length - 2}` : '');
        return `${ids.length} outlet(s)`;
    };

    const isActive = (p) => String(p.status || '').toLowerCase() === 'active';

    return (
        <div className="space-y-6">
            {/* Toolbar - Compact */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-border shadow-sm rounded-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search products by name, brand or SKU..."
                        className="w-full pl-12 pr-4 py-3 bg-surface border border-border text-[11px] font-black focus:outline-none focus:border-primary outline-none transition-all font-mono uppercase placeholder:text-[10px] rounded-2xl shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <CustomSelect
                        value={filterCategory}
                        onChange={setFilterCategory}
                        options={categories}
                        className="min-w-[160px] !text-[10px] !py-2.5 rounded-xl"
                    />
                    <button
                        onClick={() => navigate('/admin/inventory/products/new')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-text text-white text-[10px] font-black hover:bg-primary transition-all uppercase tracking-widest font-mono shadow-md rounded-xl hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Add Product
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                <div className="table-responsive">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-surface-alt/50 border-b border-border text-left">
                                <th className="pl-10 pr-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Product Details</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Brand & Category</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Selling Price</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Current Stock</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Available in Salons</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                                <th className="pr-10 pl-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center text-text-muted bg-surface-alt/20">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="pl-10 pr-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-surface-alt border border-border flex items-center justify-center text-text-muted font-black group-hover:border-primary transition-all overflow-hidden shadow-sm rounded-2xl">
                                                    {(product.images && product.images.length > 0) ? (
                                                        <img
                                                            src={getImageUrl(product.images?.[0] || product.image || product.appImage)}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <Box className="w-5 h-5 opacity-20" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-text group-hover:text-primary transition-colors italic uppercase font-mono leading-none mb-0.5">{product.name}</p>
                                                    <p className="text-[8px] text-text-muted font-bold tracking-widest uppercase font-mono opacity-70">
                                                        SKU :: {product.sku}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="inline-flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase font-mono">
                                                    <Building2 className="w-2.5 h-2.5" />
                                                    {product.brand}
                                                </span>
                                                <span className="text-[9px] text-text-muted flex items-center gap-1 font-black uppercase font-mono italic">
                                                    <Tag className="w-2.5 h-2.5 opacity-40" />
                                                    {product.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-black text-text font-mono italic underline decoration-primary/20">
                                            ₹{(product.sellingPrice || product.price || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-[11px] font-black font-mono ${product.stock < (product.threshold || product.minStock || 10) ? 'text-rose-500' : 'text-text'}`}>
                                                    {product.stock ?? 0}
                                                </span>
                                                {(product.stockStatus === 'Critical' || product.stockStatus === 'Low Stock' || product.stock < (product.threshold || product.minStock || 10)) && (
                                                    <span className="text-[7px] font-black text-rose-500 uppercase tracking-tighter flex items-center gap-0.5 font-mono">
                                                        <AlertTriangle className="w-2 h-2" />
                                                        {product.stockStatus === 'Critical' ? 'CRITICAL' : product.stockStatus === 'Low Stock' ? 'LOW' : 'LOW'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center max-w-[140px]">
                                            <span className="text-[9px] font-bold text-text-muted uppercase font-mono leading-tight line-clamp-2" title={salonAvailabilityLabel(product)}>
                                                {salonAvailabilityLabel(product)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onToggleStatus?.(product.id || product._id)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border rounded-md transition-all font-mono ${isActive(product)
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                                    }`}
                                                title="Click to toggle Active / Inactive"
                                            >
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isActive(product) ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {isActive(product) ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="pr-10 pl-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => onEdit?.(product)}
                                                    className="p-1.5 text-text-muted hover:text-primary transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete?.(product.id)}
                                                    className="p-1.5 text-text-muted hover:text-rose-600 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/inventory/products/view/${product._id || product.id}`)}
                                                    className="p-1.5 text-text-muted hover:text-primary transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
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
