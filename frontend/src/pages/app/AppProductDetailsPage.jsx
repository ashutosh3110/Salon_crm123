import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShoppingBag, Star, Heart, Plus, Minus, ChevronDown, MessageSquare, ShieldCheck, Sparkles, Share2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { mapInventoryProductToShopProduct } from '../../utils/shopProductMapper';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import ReviewModal from '../../components/app/ReviewModal';

const Accordion = ({ title, subtext, children, isInitialOpen = false, colors }) => {
    const [isOpen, setIsOpen] = useState(isInitialOpen);
    return (
        <div style={{ borderBottom: `1px solid ${colors.border}` }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex items-center justify-between text-left group"
            >
                <div className="flex-1 pr-4">
                    <h4
                        className="text-[13px] font-black uppercase tracking-widest"
                        style={{ color: colors.text }}
                    >
                        {title}
                    </h4>
                    {subtext && !isOpen && (
                        <p className="text-[10px] opacity-40 mt-0.5 font-bold italic">{subtext}</p>
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
                        <div className="pb-6 text-[12px] leading-relaxed opacity-70" style={{ color: colors.text }}>
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
    const { addToCart, cart, updateQuantity, setIsCartOpen, removeFromCart } = useCart();
    const { isProductLiked, toggleProductLike } = useFavorites();
    const { colors, isLight } = useCustomerTheme();
    const { products: inventoryProducts, shopCategories } = useInventory();
    const { isInitializing } = useBusiness();
    
    const [reviews, setReviews] = useState([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    
    const [fetchedProduct, setFetchedProduct] = useState(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState(true);

    const { rawRow, product } = useMemo(() => {
        let row = inventoryProducts.find((p) => String(p.id ?? p._id) === String(id));
        if (!row && fetchedProduct) row = fetchedProduct;
        
        if (!row) return { rawRow: null, product: null };
        return { rawRow: row, product: mapInventoryProductToShopProduct(row, shopCategories) };
    }, [inventoryProducts, shopCategories, id, fetchedProduct]);

    const activeOutletId = localStorage.getItem('active_outlet_id');

    useEffect(() => {
        const loadProduct = async () => {
            setIsLoadingProduct(true);
            try {
                // Fetch directly to get latest stock and details
                const res = await api.get(`/products/${id}`);
                if (res.data?.success) {
                    setFetchedProduct(res.data.data);
                } else {
                    // Fallback to local if API fails or returns success: false
                    const row = inventoryProducts.find((p) => String(p.id ?? p._id) === String(id));
                    if (row) setFetchedProduct(row);
                }
            } catch (err) {
                console.error("Failed to fetch product details:", err);
                const row = inventoryProducts.find((p) => String(p.id ?? p._id) === String(id));
                if (row) setFetchedProduct(row);
            } finally {
                setIsLoadingProduct(false);
            }
        };
        if (id) loadProduct();
    }, [id, inventoryProducts]);

    const currentStock = useMemo(() => {
        if (!rawRow) return 0;
        if (activeOutletId && rawRow.stockByOutlet?.[activeOutletId] !== undefined) {
            return rawRow.stockByOutlet[activeOutletId];
        }
        return rawRow.stock || 0;
    }, [rawRow, activeOutletId]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!id) return;
            try {
                const oid = localStorage.getItem('active_outlet_id');
                let url = `/feedbacks?targetId=${id}&targetType=product&status=Approved`;
                if (oid) url += `&outletId=${oid}`;
                
                const res = await api.get(url);
                console.log(`Feedbacks for ${id}:`, res.data);
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
    const inCart = (cart?.items || []).find((item) => {
        const pId = item.productId?._id || item.productId?.id || item.productId;
        return String(pId) === String(id);
    });

    if (isLoadingProduct || isInitializing) {
        return (
            <div style={{ background: colors.bg }} className="min-h-screen relative flex flex-col overflow-hidden">
                <style>{`
                    @keyframes shimmer_effect {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                    .shimmer_box {
                        background: ${isLight ? 'linear-gradient(90deg, #F3EAE3 25%, #E8ECEF 50%, #F3EAE3 75%)' : 'linear-gradient(90deg, #1A1411 25%, #2A211B 50%, #1A1411 75%)'};
                        background-size: 200% 100%;
                        animation: shimmer_effect 1.5s infinite linear;
                    }
                `}</style>
                {/* Hero Skeleton */}
                <div className="relative aspect-[4/5] shimmer_box w-full">
                    <div className="absolute bottom-10 left-8 right-8 space-y-4">
                        <div className="flex gap-3">
                            <div className="h-6 w-20 rounded-md shimmer_box opacity-50" />
                            <div className="h-6 w-16 rounded-md shimmer_box opacity-50" />
                        </div>
                        <div className="h-12 w-3/4 rounded-xl shimmer_box opacity-50" />
                    </div>
                </div>

                {/* Details Skeleton */}
                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-end">
                        <div className="space-y-2">
                            <div className="h-3 w-16 rounded shimmer_box" />
                            <div className="h-10 w-32 rounded shimmer_box" />
                        </div>
                        <div className="h-12 w-28 rounded-2xl shimmer_box" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-14 w-full rounded-xl shimmer_box opacity-40" />
                        ))}
                    </div>
                    <div className="h-16 w-full rounded-2xl shimmer_box" />
                </div>
            </div>
        );
    }

    if (!rawRow || !product) {
        return (
            <div style={{ background: colors.bg, color: colors.text }} className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <span className="text-red-500 font-bold text-2xl">!</span>
                </div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter mb-2">Product Not Found</h2>
                <p className="text-sm opacity-60 mb-8">This product may have been removed or is unavailable.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-3 bg-[#C8956C] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#C8956C]/20">Go Back</button>
            </div>
        );
    }

    const care = product.appCare || '';
    const usage = product.appUsage || '';
    const origin = product.appOrigin || '';
    const consistency = product.appConsistency || '';
    const ritual = product.appRitualStatus || '';
    const returnText = product.appReturnPolicy || 'No return policy specified.';
    const formulaType = product.appFormulaType || '';
    const vendorDetails = product.appVendorDetails || '';

    return (
        <div style={{ background: colors.bg, color: colors.text }} className="min-h-screen relative flex flex-col overflow-hidden">
            {/* Header Actions */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="fixed top-6 left-6 w-11 h-11 rounded-2xl bg-black/40 text-white backdrop-blur-xl z-[70] flex items-center justify-center active:scale-90 shadow-2xl border border-white/10"
            >
                <ChevronLeft size={22} />
            </button>

            <div className="fixed top-6 right-6 flex gap-3 z-[70]">
                <button
                    type="button"
                    onClick={() => toggleProductLike(product._id)}
                    className={`w-11 h-11 rounded-2xl bg-black/40 text-white backdrop-blur-xl flex items-center justify-center active:scale-90 shadow-2xl border border-white/10 ${isLiked ? 'text-rose-500' : ''}`}
                >
                    <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar h-[100dvh]" style={{ overflowX: 'hidden' }}>
                {/* Product Images Carousel */}
                <div className="relative aspect-[4/5] overflow-hidden bg-black">
                    {product.images && product.images.length > 0 ? (
                        <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                            {product.images.map((img, idx) => (
                                <div key={idx} className="w-full h-full shrink-0 snap-center relative">
                                    <img 
                                        src={getImageUrl(img)} 
                                        alt={`${product.name} ${idx + 1}`} 
                                        className="w-full h-full object-cover opacity-90" 
                                    />
                                    {product.images.length > 1 && (
                                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                                            {idx + 1} / {product.images.length}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <motion.img 
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.5 }}
                            src={getImageUrl(product.image)} 
                            alt={product.name} 
                            className="w-full h-full object-cover opacity-90" 
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                    <div className="absolute bottom-10 left-8 right-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap items-center gap-3 mb-4"
                        >
                            <span className="px-3 py-1 bg-[#C8956C] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-md">
                                {product.brand}
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/10 text-white">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-black">{product.rating}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest backdrop-blur-md ${
                                currentStock <= 0 
                                ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                                : currentStock < 5 
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            }`}>
                                {currentStock <= 0 ? 'Out of Stock' : currentStock < 5 ? `Only ${currentStock} Left` : 'In Stock'}
                            </div>
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl font-black text-white leading-tight tracking-tighter italic"
                        >
                            {product.name}
                        </motion.h2>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-8 pb-32 space-y-9" style={{ background: colors.bg }}>
                    <div className="flex items-end justify-between gap-4">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Investment</p>
                            <p className="text-4xl font-black text-[#C8956C] tracking-tighter italic">₹{product.price}</p>
                        </div>
                        <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-2xl p-1.5 border border-black/5 h-12 shadow-inner">
                            <button 
                                type="button" 
                                onClick={() => {
                                    const currentQty = inCart?.quantity || 1;
                                    if (currentQty > 1) {
                                        updateQuantity(product._id, currentQty - 1);
                                    } else if (inCart) {
                                        removeFromCart(product._id);
                                    }
                                }} 
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 active:scale-95 transition-all"
                            >
                                <Minus size={16}/>
                            </button>
                            <span className="flex-1 text-center text-lg font-black tabular-nums leading-none min-w-[40px]">{inCart?.quantity || 1}</span>
                            <button 
                                type="button" 
                                onClick={() => {
                                    const currentQty = inCart?.quantity || 0;
                                    updateQuantity(product._id, currentQty + 1);
                                }} 
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 active:scale-95 transition-all"
                            >
                                <Plus size={16}/>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Accordion title="Product Overview" isInitialOpen colors={colors}>
                            <p className="mb-6 leading-relaxed font-medium">
                                {product.description || product.shopDescription}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {product.sku && (
                                    <div className="p-4 rounded-2xl bg-black/3 dark:bg-white/3 border border-black/5 flex flex-col gap-1 text-center">
                                        <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">SKU Code</span>
                                        <span className="text-[11px] font-black uppercase italic">{product.sku}</span>
                                    </div>
                                )}
                                {product.hsnCode && (
                                    <div className="p-4 rounded-2xl bg-black/3 dark:bg-white/3 border border-black/5 flex flex-col gap-1 text-center">
                                        <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">HSN Code</span>
                                        <span className="text-[11px] font-black uppercase italic">{product.hsnCode}</span>
                                    </div>
                                )}
                                {product.unit && (
                                    <div className="p-4 rounded-2xl bg-black/3 dark:bg-white/3 border border-black/5 flex flex-col gap-1 text-center">
                                        <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Unit Type</span>
                                        <span className="text-[11px] font-black uppercase italic">{product.unit}</span>
                                    </div>
                                )}
                                {formulaType && (
                                    <div className="p-4 rounded-2xl bg-black/3 dark:bg-white/3 border border-black/5 flex flex-col gap-1 text-center">
                                        <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Formula</span>
                                        <span className="text-[11px] font-black uppercase italic">{formulaType}</span>
                                    </div>
                                )}
                                {consistency && (
                                    <div className="p-4 rounded-2xl bg-black/3 dark:bg-white/3 border border-black/5 flex flex-col gap-1 text-center">
                                        <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Consistency</span>
                                        <span className="text-[11px] font-black uppercase italic">{consistency}</span>
                                    </div>
                                )}
                                {ritual && (
                                    <div className="p-4 rounded-2xl bg-black/3 dark:bg-white/3 border border-black/5 flex flex-col gap-1 text-center">
                                        <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Ritual status</span>
                                        <span className="text-[11px] font-black uppercase italic text-emerald-500">{ritual}</span>
                                    </div>
                                )}
                            </div>
                        </Accordion>

                        {(usage || care) && (
                            <Accordion title="Application Guide" colors={colors}>
                                {usage && <p className="leading-relaxed font-medium">{usage}</p>}
                                {care && (
                                    <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-[#C8956C] mb-2 flex items-center gap-2">
                                            <Sparkles size={12}/> Pro Tip
                                        </h5>
                                        <p className="text-[11px] font-medium opacity-80">{care}</p>
                                    </div>
                                )}
                            </Accordion>
                        )}

                        <Accordion title="Customer Voices" subtext={`${reviews.length} reviews`} colors={colors}>
                            <div className="space-y-4">
                                {reviews.length > 0 ? (
                                    reviews.map((rev) => (
                                        <div key={rev._id} className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} size={11} fill={s <= rev.rating ? '#C8956C' : 'none'} color={s <= rev.rating ? '#C8956C' : 'rgba(255,255,255,0.1)'} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] opacity-30 font-bold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[12px] italic mb-3 font-medium opacity-80 leading-relaxed">"{rev.comment}"</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-[#C8956C]/20 flex items-center justify-center text-[8px] font-black text-[#C8956C]">
                                                    {rev.customerName?.charAt(0)}
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">— {rev.customerName}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-8 opacity-40 italic font-medium">No reviews yet for this product. Be the first to share your experience.</p>
                                )}
                                <button 
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="w-full h-14 rounded-2xl border-2 border-dashed border-[#C8956C]/30 text-[#C8956C] text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    <MessageSquare size={16} /> Write a Review
                                </button>
                            </div>
                        </Accordion>

                        <Accordion title="Policy & Care" colors={colors}>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck size={16} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase mb-1">Authentic Product</h5>
                                        <p className="text-[10px] opacity-60">100% genuine products sourced directly from the authorized distributors.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center shrink-0">
                                        <Share2 size={16} className="text-white opacity-40" />
                                    </div>
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase mb-1">Return Policy</h5>
                                        <p className="text-[10px] opacity-60">{returnText}</p>
                                    </div>
                                </div>
                                {vendorDetails && (
                                    <div className="flex gap-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Package size={16} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <h5 className="text-[11px] font-black uppercase mb-1">Manufacturer Details</h5>
                                            <p className="text-[10px] opacity-60 leading-relaxed">{vendorDetails}</p>
                                            {origin && <p className="text-[9px] font-bold text-[#C8956C] mt-1 uppercase tracking-widest">Origin: {origin}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Accordion>
                    </div>

                    <div className="pt-6">
                        <motion.button
                            whileTap={currentStock > 0 ? { scale: 0.96 } : {}}
                            type="button"
                            onClick={() => {
                                if (currentStock > 0) {
                                    addToCart(product);
                                    setIsCartOpen(true);
                                }
                            }}
                            disabled={currentStock <= 0}
                            style={{
                                background: currentStock <= 0 ? (isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)') : 'linear-gradient(135deg, #C8956C 0%, #A06844 100%)',
                                color: currentStock <= 0 ? (isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)') : '#FFFFFF',
                                boxShadow: currentStock > 0 ? '0 20px 40px rgba(200,149,108,0.3)' : 'none'
                            }}
                            className="w-full h-16 rounded-2xl flex items-center justify-center gap-4 shadow-2xl transition-all"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                                {currentStock <= 0 ? 'OUT OF STOCK' : (inCart ? 'ADD TO CART' : 'ORDER NOW')}
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
                    const fetchReviews = async () => {
                        const res = await api.get(`/feedbacks?targetId=${id}&targetType=product&status=Approved`);
                        if (res.data?.success) setReviews(res.data.data);
                    };
                    fetchReviews();
                }}
            />
        </div>
    );
}
