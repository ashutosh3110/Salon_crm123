import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShoppingBag, Star, Heart, Plus, Minus, ChevronDown } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useInventory } from '../../contexts/InventoryContext';
import { mapInventoryProductToShopProduct } from '../../utils/shopProductMapper';

const Accordion = ({ title, subtext, children, isInitialOpen = false, colors }) => {
    const [isOpen, setIsOpen] = useState(isInitialOpen);
    return (
        <div style={{ borderBottom: `1px solid ${colors.border}` }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-3.5 flex items-center justify-between text-left group"
            >
                <div className="flex-1 pr-4">
                    <h4
                        className="text-[13px] font-bold uppercase tracking-tight"
                        style={{ color: colors.text === '#1A1A1A' ? '#000' : colors.text }}
                    >
                        {title}
                    </h4>
                    {subtext && !isOpen && (
                        <p className="text-[10px] opacity-40 mt-0.5 font-medium italic">{subtext}</p>
                    )}
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: 'spring', damping: 20 }}>
                    <ChevronDown size={14} style={{ color: colors.text, opacity: 0.5 }} />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 text-[12px] leading-relaxed opacity-70" style={{ color: colors.text }}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function AppProductDetailsPage() {
    const { id: rawId } = useParams();
    const id = rawId ? decodeURIComponent(rawId) : '';
    const navigate = useNavigate();
    const { addToCart, cart, updateQuantity } = useCart();
    const { isProductLiked, toggleProductLike } = useFavorites();
    const { colors } = useCustomerTheme();
    const { products: inventoryProducts, shopCategories } = useInventory();

    const { rawRow, product } = useMemo(() => {
        const row = inventoryProducts.find((p) => String(p.id ?? p._id) === String(id));
        if (!row) return { rawRow: null, product: null };
        return { rawRow: row, product: mapInventoryProductToShopProduct(row, shopCategories) };
    }, [inventoryProducts, shopCategories, id]);

    const isLiked = isProductLiked(id);
    const inCart = cart.find((item) => item._id === id);

    if (!rawRow || !product) {
        return (
            <div
                style={{ background: colors.bg, color: colors.text }}
                className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
            >
                <h2 className="text-xl font-black italic" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>
                    Product not found
                </h2>
                <p className="text-sm opacity-50 mt-2 max-w-xs">
                    This item may have been removed or the link is invalid.
                </p>
                <button
                    type="button"
                    onClick={() => navigate('/app/shop')}
                    className="mt-6 px-10 py-3 bg-[#C8956C] text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
                >
                    Back to Shop
                </button>
            </div>
        );
    }

    if (!product.isShopProduct) {
        return (
            <div
                style={{ background: colors.bg, color: colors.text }}
                className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
            >
                <h2 className="text-xl font-black italic" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>
                    Not available in shop
                </h2>
                <p className="text-sm opacity-50 mt-2 max-w-xs">
                    This product is not enabled for the customer app. Ask the salon for details.
                </p>
                <button
                    type="button"
                    onClick={() => navigate('/app/shop')}
                    className="mt-6 px-10 py-3 bg-[#C8956C] text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
                >
                    Back to Shop
                </button>
            </div>
        );
    }

    const care = product.appCare || 'Store in a cool, dry place away from direct sunlight.';
    const usage = product.appUsage || 'Follow directions on the label or as advised by your stylist.';
    const origin = product.appOrigin || 'Responsibly sourced.';
    const formula = product.appFormulaType || '—';
    const consistency = product.appConsistency || '—';
    const ritual = product.appRitualStatus || '—';
    const vendorText =
        product.appVendorDetails ||
        'Manufactured for your salon brand. 100% authentic when purchased through the official app.';
    const returnText =
        product.appReturnPolicy ||
        'Unopened products may be returned within 7 days of delivery where applicable. Opened items are non-refundable unless defective.';

    return (
        <div style={{ background: colors.bg, color: colors.text }} className="min-h-screen relative flex flex-col overflow-hidden">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="fixed top-6 left-6 w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur-xl z-[70] flex items-center justify-center active:scale-90 shadow-2xl border border-white/10"
            >
                <ChevronLeft size={20} />
            </button>

            <button
                type="button"
                onClick={() => toggleProductLike(product._id)}
                className={`fixed top-6 right-6 w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur-xl z-[70] flex items-center justify-center active:scale-90 shadow-2xl border border-white/10 ${
                    isLiked ? 'text-rose-500' : ''
                }`}
            >
                <Heart size={20} className={isLiked ? 'fill-current' : ''} />
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar h-[100dvh]" style={{ overflowX: 'hidden' }}>
                <div className="relative aspect-[3/4] overflow-hidden bg-black">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-95" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-10 left-8 right-8">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-[#C8956C] text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                                {product.brand}
                            </span>
                            <span
                                className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/10 text-white text-[9px] font-black uppercase"
                            >
                                {product.category}
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/10 text-white">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-black">{product.rating}</span>
                            </div>
                        </div>
                        <h2
                            className="text-4xl font-black text-white leading-[1.2] tracking-tighter italic"
                            style={{ fontFamily: "'SF Pro Display', sans-serif" }}
                        >
                            {product.name}
                        </h2>
                        {product.sku ? (
                            <p className="text-[10px] text-white/50 font-mono mt-2 tracking-wider">SKU: {product.sku}</p>
                        ) : null}
                    </div>
                </div>

                <div className="p-8 pb-32 space-y-8" style={{ background: colors.bg }}>
                    <div className="flex items-end justify-between gap-4">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30" style={{ color: colors.text }}>
                                Price
                            </p>
                            <p className="text-3xl font-black text-[#C8956C] tracking-tighter italic">₹{product.price}</p>
                        </div>
                        <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-full p-1 border border-black/5 dark:border-white/5 h-10">
                            <button
                                type="button"
                                onClick={() => updateQuantity(product._id, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors shrink-0"
                                disabled={!inCart}
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span
                                className="flex-1 text-center text-lg font-black tabular-nums leading-none min-w-[32px]"
                                style={{ color: colors.text }}
                            >
                                {inCart?.quantity || 1}
                            </span>
                            <button
                                type="button"
                                onClick={() => addToCart(product)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-[15px] font-black tracking-tight mb-4" style={{ color: colors.text }}>
                            Product information
                        </h3>

                        <Accordion title="Product details" subtext="Care, usage & origin" colors={colors}>
                            <ul className="space-y-3">
                                <li className="flex gap-2">
                                    <span className="font-bold shrink-0">Care:</span>
                                    <span>{care}</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold shrink-0">Usage:</span>
                                    <span>{usage}</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold shrink-0">Origin:</span>
                                    <span>{origin}</span>
                                </li>
                            </ul>
                        </Accordion>

                        <Accordion title="Know your product" isInitialOpen colors={colors}>
                            {product.description ? <p className="mb-3">{product.description}</p> : null}
                            {product.appKnowMore ? (
                                <p className="mb-4 opacity-90 whitespace-pre-wrap">{product.appKnowMore}</p>
                            ) : null}
                            <div className="mt-2 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 flex flex-col gap-3">
                                <div className="flex justify-between items-center text-[12px] gap-2">
                                    <span className="font-bold opacity-60">Formula type:</span>
                                    <span className="font-bold text-right">{formula}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px] gap-2">
                                    <span className="font-bold opacity-60">Consistency:</span>
                                    <span className="font-bold text-right">{consistency}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px] gap-2">
                                    <span className="font-bold opacity-60">Ritual status:</span>
                                    <span className="font-bold text-emerald-500 text-right">{ritual}</span>
                                </div>
                            </div>
                        </Accordion>

                        <Accordion
                            title="Vendor details"
                            subtext="Manufacturer & authenticity"
                            colors={colors}
                        >
                            <p className="whitespace-pre-wrap">{vendorText}</p>
                        </Accordion>

                        <Accordion title="Return and exchange policy" isInitialOpen colors={colors}>
                            <p className="whitespace-pre-wrap">{returnText}</p>
                        </Accordion>
                    </div>

                    <div className="pt-4">
                        <motion.button
                            whileTap={rawRow.stock > 0 ? { scale: 0.98 } : {}}
                            type="button"
                            onClick={() => rawRow.stock > 0 && addToCart(product)}
                            disabled={rawRow.stock <= 0}
                            style={{
                                background: rawRow.stock <= 0 ? (colors.text === '#1A1A1A' ? '#E5E7EB' : 'rgba(255,255,255,0.1)') : '#C8956C',
                                color: rawRow.stock <= 0 ? (colors.text === '#1A1A1A' ? '#9CA3AF' : 'rgba(255,255,255,0.3)') : '#FFFFFF',
                                cursor: rawRow.stock <= 0 ? 'not-allowed' : 'pointer'
                            }}
                            className="w-full h-16 rounded-2xl flex items-center justify-center gap-4 shadow-2xl transition-all"
                        >
                            {rawRow.stock > 0 && <ShoppingBag className="w-5 h-5" />}
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                                {rawRow.stock <= 0 ? 'AVAILABLE SOON' : (inCart ? 'ADD TO CART' : 'BUY NOW')}
                            </span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}
