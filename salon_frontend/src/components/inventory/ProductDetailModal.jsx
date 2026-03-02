import { useRef } from 'react';
import { X, Printer, Package, Tag, Building2, IndianRupee, RefreshCw, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import BarcodeDisplay from './BarcodeDisplay';
import { generateEAN13 } from '../../contexts/InventoryContext';

/**
 * ProductDetailModal — Full product detail view with barcode
 * Props:
 *   product    — product object
 *   onClose    — close handler
 *   onRegenerate — (id) => void — regenerate barcode
 */
export default function ProductDetailModal({ product, outlets = [], onClose, onRegenerate }) {
    const printRef = useRef(null);

    if (!product) return null;

    const handlePrint = () => {
        const printArea = printRef.current;
        if (!printArea) return;
        const win = window.open('', '_blank', 'width=400,height=300');
        win.document.write(`
            <html>
            <head>
                <title>Barcode — ${product.name}</title>
                <style>
                    body { font-family: monospace; display: flex; flex-direction: column; align-items: center; padding: 20px; background: white; }
                    h2 { font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
                    p  { font-size: 10px; color: #666; margin: 2px 0; }
                    svg { width: 100%; max-width: 280px; }
                </style>
            </head>
            <body>
                <h2>${product.name}</h2>
                <p>SKU: ${product.sku}</p>
                ${printArea.innerHTML}
                <p style="margin-top:6px;">MRP: ₹${product.price}</p>
            </body>
            </html>
        `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    };

    const statusColor = {
        'In Stock': 'bg-emerald-500/10 text-emerald-600',
        'Low Stock': 'bg-amber-500/10 text-amber-600',
        'Critical': 'bg-rose-500/10 text-rose-600',
    }[product.status] || 'bg-gray-100 text-gray-600';

    const typeLabel = product.type === 'retail' ? 'Retail Product' : 'Service Consumable';
    const typeColor = product.type === 'retail' ? 'bg-violet-500/10 text-violet-600' : 'bg-blue-500/10 text-blue-600';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface w-full max-w-lg rounded-3xl border border-border/40 shadow-2xl overflow-hidden relative"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-border/40 bg-surface/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-text uppercase tracking-tight line-clamp-1">{product.name}</h2>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Product Detail</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-rose-500 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${statusColor}`}>
                            {product.status}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${typeColor}`}>
                            {typeLabel}
                        </span>
                        {product.category && (
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-background text-text-secondary border border-border/40">
                                {product.category}
                            </span>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-left">
                        {[
                            { icon: Tag, label: 'SKU', value: product.sku },
                            { icon: Building2, label: 'Brand', value: product.brand || '—' },
                            { icon: IndianRupee, label: 'Cost Price', value: `₹${product.costPrice || '—'}` },
                            { icon: IndianRupee, label: 'Selling Price', value: `₹${product.price}` },
                            { icon: Package, label: 'Stock', value: `${product.stock} ${product.unit}` },
                            { icon: Package, label: 'Min Stock', value: `${product.minStock} ${product.unit}` },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="bg-background rounded-xl border border-border/10 p-3 flex items-center gap-2">
                                <Icon className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{label}</p>
                                    <p className="text-xs font-black text-text">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Per-Outlet Stock Breakdown */}
                    {outlets.length > 0 && product.stockByOutlet && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Stock by Outlet</p>
                            <div className="grid grid-cols-3 gap-2">
                                {outlets.map(o => {
                                    const s = product.stockByOutlet?.[o.id] ?? 0;
                                    const pct = Math.min((s / (product.minStock || 1)) * 100, 100);
                                    const isLow = s <= Math.ceil(product.minStock / outlets.length);
                                    return (
                                        <div key={o.id} className="bg-background rounded-xl border border-border/10 p-3 text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <MapPin className="w-2.5 h-2.5 text-text-muted" />
                                                <span className="text-[8px] font-black text-text-muted uppercase">{o.short}</span>
                                            </div>
                                            <p className={`text-lg font-black ${s === 0 ? 'text-text-muted/40' : isLow ? 'text-rose-500' : 'text-text'}`}>{s}</p>
                                            <p className="text-[8px] text-text-muted">{product.unit}</p>
                                            <div className="w-full h-1 bg-border/20 rounded-full overflow-hidden mt-1.5">
                                                <div className={`h-full rounded-full ${s === 0 ? 'bg-border/20' : isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Barcode Section */}
                    <div className="bg-white border border-border/20 rounded-2xl p-5 text-center">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Barcode</p>
                        {product.barcode ? (
                            <div ref={printRef} className="flex justify-center">
                                <BarcodeDisplay
                                    value={product.barcode}
                                    height={55}
                                    width={1.8}
                                    fontSize={11}
                                />
                            </div>
                        ) : (
                            <div className="py-4 text-text-muted text-sm font-medium">No barcode assigned</div>
                        )}
                        <p className="text-[11px] font-black text-text mt-2 tracking-widest font-mono">{product.barcode || '—'}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            disabled={!product.barcode}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-text text-background rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
                        >
                            <Printer className="w-4 h-4" /> Print Barcode
                        </button>
                        <button
                            onClick={() => onRegenerate(product.id)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-background border border-border/40 rounded-xl text-xs font-black text-text-secondary hover:border-primary/40 hover:text-primary active:scale-95 transition-all"
                            title="Generate new barcode"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
