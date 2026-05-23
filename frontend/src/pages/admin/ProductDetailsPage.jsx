import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Package, 
    Tag, 
    Building2, 
    ShieldCheck, 
    Layers, 
    Truck, 
    AlertCircle,
    BadgePercent,
    Edit2,
    Clock,
    FileText,
    Boxes,
    ChevronRight,
    Search
} from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { useBusiness } from '../../contexts/BusinessContext';
import getImageUrl from '../../utils/imageUtils';

export default function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, updateProduct } = useInventory();
    const { outlets } = useBusiness();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        if (id && products.length > 0) {
            const found = products.find(p => (p._id || p.id) === id);
            if (found) setProduct(found);
        }
    }, [id, products]);

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 font-mono">
                <Search className="w-12 h-12 text-text-muted animate-pulse" />
                <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Locating Asset Entry...</p>
            </div>
        );
    }

    const isActive = String(product.status || '').toLowerCase() === 'active';

    return (
        <div className="max-w-[1200px] mx-auto pb-20 animate-reveal">
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/inventory/products')}
                        className="p-3 bg-surface border border-border hover:bg-surface-alt transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="font-mono">
                        <h1 className="text-2xl font-black text-text uppercase italic tracking-tight leading-none">
                            Asset Intelligence
                        </h1>
                        <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">
                            Product :: {product.sku} :: Detailed Registry View
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate(`/admin/inventory/products/edit/${id}`)}
                    className="flex items-center gap-2 bg-text text-background px-6 py-3 text-[10px] font-black hover:bg-primary hover:text-white transition-all uppercase tracking-widest font-mono shadow-xl"
                >
                    <Edit2 className="w-3.5 h-3.5" /> Modify Asset
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Visuals & Core Status */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Visual Gallery */}
                    <div className="bg-surface border border-border overflow-hidden group shadow-sm">
                        <div className="aspect-square bg-surface-alt relative overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                                <img 
                                    src={getImageUrl(product.images[0])} 
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-text-muted/20">
                                    <Package className="w-20 h-20" />
                                    <p className="text-[10px] font-black uppercase mt-4">No Asset Visual</p>
                                </div>
                            )}
                            <div className={`absolute top-4 right-4 px-3 py-1 text-[8px] font-black uppercase tracking-widest ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                                {isActive ? 'Live Entry' : 'Decommissioned'}
                            </div>
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="p-4 grid grid-cols-4 gap-2 border-t border-border bg-surface-alt/30">
                                {product.images.slice(1, 5).map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-surface border border-border overflow-hidden">
                                        <img src={getImageUrl(img)} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer" alt="" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stock Meter */}
                    <div className="bg-surface p-6 border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Stock Velocity</h3>
                            <Clock className="w-3 h-3 text-text-muted" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-black italic font-mono leading-none">{product.stock || 0}</span>
                                <span className="text-[10px] font-black text-text-muted uppercase mb-1">{product.unit || 'Units'}</span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-alt rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${product.stock <= product.threshold ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, (product.stock / (product.threshold * 5)) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest leading-relaxed">
                                {product.stock <= product.threshold 
                                    ? 'Asset levels below critical threshold. Immediate procurement required.' 
                                    : 'Asset levels within optimal operational parameters.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Middle & Right Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Primary Identity */}
                    <div className="bg-surface p-8 border border-border shadow-sm">
                        <div className="flex flex-col gap-1 mb-8">
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-1">Master Entry Registry</span>
                            <h2 className="text-4xl font-black text-text italic uppercase leading-none">{product.name}</h2>
                            <div className="flex items-center gap-4 mt-4 font-mono">
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest border-r border-border pr-4">
                                    <Building2 className="w-3 h-3" /> {product.brand || 'No Brand'}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest border-r border-border pr-4">
                                    <Tag className="w-3 h-3" /> {product.category || 'General'}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    <Truck className="w-3.5 h-3.5" /> Supplier: {product.supplier || 'None / Direct'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="p-4 bg-surface-alt/50 border border-border">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Pricing (MRP)</p>
                                <p className="text-lg font-black font-mono">₹{product.sellingPrice || 0}</p>
                            </div>
                            <div className="p-4 bg-surface-alt/50 border border-border">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">GST Logic</p>
                                <p className="text-lg font-black font-mono">{product.gstPercent || 0}%</p>
                            </div>
                            <div className="p-4 bg-surface-alt/50 border border-border">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">HSN Code</p>
                                <p className="text-lg font-black font-mono">{product.hsnCode || '—'}</p>
                            </div>
                            <div className="p-4 bg-surface-alt/50 border border-border">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Min Threshold</p>
                                <p className="text-lg font-black font-mono">{product.threshold || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Description & Usage */}
                        <div className="bg-surface p-8 border border-border shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b border-border pb-4">
                                <FileText className="w-4 h-4 text-primary" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest">Asset Narrative</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-2">Description</p>
                                    <p className="text-xs text-text leading-relaxed font-medium">
                                        {product.description || 'No detailed narrative provided for this asset entry.'}
                                    </p>
                                </div>
                                {product.appCare && (
                                    <div>
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-2">Care Instructions</p>
                                        <p className="text-xs text-text leading-relaxed font-medium">{product.appCare}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Outlet Distribution */}
                        <div className="bg-surface p-8 border border-border shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b border-border pb-4">
                                <Truck className="w-4 h-4 text-primary" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest">Global Distribution</h3>
                            </div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {product.outletIds && product.outletIds.length > 0 ? (
                                    product.outletIds.map((oid) => {
                                        const outlet = outlets.find(o => String(o._id) === String(oid));
                                        const outletStock = product.stockByOutlet?.[oid] || 0;
                                        return (
                                            <div key={oid} className="flex items-center justify-between p-3 bg-surface-alt/30 border border-border/50">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3 h-3 text-text-muted" />
                                                    <span className="text-[10px] font-black uppercase tracking-tight">{outlet?.name || 'Unknown Node'}</span>
                                                </div>
                                                <span className={`text-[10px] font-black font-mono ${outletStock <= (product.threshold / 2) ? 'text-rose-500' : 'text-text'}`}>
                                                    {outletStock} Units
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                                        <AlertCircle className="w-8 h-8 opacity-20 mb-2" />
                                        <p className="text-[8px] font-black uppercase tracking-widest">No Node Deployment</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
