import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShoppingBag, Star, Heart, Plus, Minus, ChevronDown, MessageSquare } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useInventory } from '../../contexts/InventoryContext';
import { mapInventoryProductToShopProduct } from '../../utils/shopProductMapper';
import api from '../../services/api';
import ReviewModal from '../../components/app/ReviewModal';

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
    
    const [reviews, setReviews] = useState([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const { rawRow, product } = useMemo(() => {
        const row = inventoryProducts.find((p) => String(p.id ?? p._id) === String(id));
        if (!row) return { rawRow: null, product: null };
        return { rawRow: row, product: mapInventoryProductToShopProduct(row, shopCategories) };
    }, [inventoryProducts, shopCategories, id]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!id) return;
            try {
                const res = await api.get(`/feedbacks?targetId=${id}&targetType=product`);
                if (res.data?.success) {
                    setReviews(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch product reviews:', err);
            }
        };
        fetchReviews();
    }, [id]);

    const isLiked = isProductLiked(id);
    const inCart = cart.find((item) => item._id === id);

    if (!rawRow || !product) {
        return (
            <div
                style={{ background: colors.bg, color: colors.text }}
                className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
            >
                <h2 className="text-xl font-black italic">Product not found</h2>
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
    const vendorText = product.appVendorDetails || 'Manufactured for your salon brand. 100% authentic when purchased through the official app.';
    const returnText = product.appReturnPolicy || 'Unopened products may be returned within 7 days of delivery where applicable.';

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
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/10 text-white">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-black">{product.rating}</span>
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-white leading-[1.2] tracking-tighter italic">{product.name}</h2>
                    </div>
                </div>

                <div className="p-8 pb-32 space-y-8" style={{ background: colors.bg }}>
                    <div className="flex items-end justify-between gap-4">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Price</p>
                            <p className="text-3xl font-black text-[#C8956C] tracking-tighter italic">₹{product.price}</p>
                        </div>
                        <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-full p-1 border border-black/5 dark:border-white/5 h-10">
                            <button type="button" onClick={() => updateQuantity(product._id, -1)} className="w-8 h-8 flex items-center justify-center rounded-full"><Minus size={14}/></button>
                            <span className="flex-1 text-center text-lg font-black tabular-nums leading-none min-w-[32px]">{inCart?.quantity || 1}</span>
                            <button type="button" onClick={() => addToCart(product)} className="w-8 h-8 flex items-center justify-center rounded-full"><Plus size={14}/></button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Accordion title="Know your product" isInitialOpen colors={colors}>
                            {product.description ? <p className="mb-3">{product.description}</p> : null}
                            <div className="mt-2 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 flex flex-col gap-3">
                                <div className="flex justify-between items-center text-[12px]"><span className="opacity-60">Consistency:</span><span className="font-bold">{consistency}</span></div>
                                <div className="flex justify-between items-center text-[12px]"><span className="opacity-60">Ritual status:</span><span className="font-bold text-emerald-500">{ritual}</span></div>
                            </div>
                        </Accordion>

                        <Accordion title="Customer Reviews" subtext={`${reviews.length} reviews`} colors={colors}>
                            <div className="space-y-4">
                                {reviews.length > 0 ? (
                                    reviews.map((rev) => (
                                        <div key={rev._id} className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} size={10} fill={s <= rev.rating ? '#C8956C' : 'none'} color={s <= rev.rating ? '#C8956C' : 'rgba(255,255,255,0.2)'} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] opacity-40">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[12px] italic mb-2">"{rev.comment}"</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest">— {rev.customerName}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-4 opacity-40 italic">No reviews yet. Be the first!</p>
                                )}
                                <button 
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="w-full py-3 rounded-xl border border-[#C8956C]/30 text-[#C8956C] text-[10px] font-black uppercase tracking-widest mt-2 flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={14} /> Write a Review
                                </button>
                            </div>
                        </Accordion>

                        <Accordion title="Return and exchange policy" colors={colors}>
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
                                background: rawRow.stock <= 0 ? 'rgba(255,255,255,0.1)' : '#C8956C',
                                color: rawRow.stock <= 0 ? 'rgba(255,255,255,0.3)' : '#FFFFFF',
                            }}
                            className="w-full h-16 rounded-2xl flex items-center justify-center gap-4 shadow-2xl transition-all"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                                {rawRow.stock <= 0 ? 'AVAILABLE SOON' : (inCart ? 'ADD TO CART' : 'BUY NOW')}
                            </span>
                        </motion.button>
                    </div>
                </div>
            </div>

            <ReviewModal 
                isOpen={isReviewModalOpen} 
                onClose={() => setIsReviewModalOpen(false)}
                targetType="product"
                targetId={id}
                targetName={product.name}
                onSuccess={() => {
                    // Re-fetch reviews
                    const fetchReviews = async () => {
                        const res = await api.get(`/feedbacks?targetId=${id}&targetType=product`);
                        if (res.data?.success) setReviews(res.data.data);
                    };
                    fetchReviews();
                }}
            />
        </div>
    );
}
