import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Star, ArrowRight, Heart, X, Plus, Minus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { isVisibleInCustomerShop, stockQtyForOutlet } from '../../utils/shopVisibility';
import { mapInventoryProductToShopProduct } from '../../utils/shopProductMapper';

const ProductCard = React.memo(({ product, index, onOpenProduct, onAddToCart, colors, isLight, hasStock }) => {
    const { isProductLiked, toggleProductLike } = useFavorites();
    const isLiked = isProductLiked(product._id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.01 }}
            style={{ 
                background: colors.card, 
                border: `1px solid ${colors.border}`,
                opacity: hasStock ? 1 : 0.8
            }}
            className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
        >
            <div className={`relative aspect-square overflow-hidden bg-black/5 dark:bg-white/5 ${!hasStock ? 'grayscale-[0.3] blur-[1.5px]' : ''}`}>
                <img
                    onClick={() => onOpenProduct(product)}
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                />
            </div>

            {!hasStock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/90 px-4 py-2 rounded-xl shadow-2xl border-2 border-[#C8956C]/50 transform -rotate-12">
                        <p className="text-[10px] font-black tracking-[0.2em] text-[#C8956C] uppercase">Available Soon</p>
                    </div>
                </div>
            )}

            <button
                onClick={() => toggleProductLike(product._id)}
                className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-black/40 transition-colors"
                style={{ color: isLiked ? '#e53e3e' : '#fff' }}
            >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            
            <div className="absolute bottom-[100px] left-2 z-20 px-2 py-1 rounded-md bg-[#C8956C] text-white text-[8px] font-bold tracking-widest uppercase">
                {product.brand}
            </div>

            <div className={`p-3 flex flex-col flex-1 ${!hasStock ? 'blur-[1.5px]' : ''}`}>
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3
                        onClick={() => onOpenProduct(product)}
                        style={{ color: colors.text }}
                        className="font-bold text-[13px] leading-tight group-hover:text-[#C8956C] transition-colors line-clamp-2 cursor-pointer flex-1"
                    >
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold" style={{ color: colors.textMuted }}>{product.rating}</span>
                    </div>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between">
                    <div>
                        <span className="text-sm font-black tracking-tighter" style={{ color: colors.text }}>₹ {product.price}</span>
                    </div>
                    {hasStock ? (
                        <button
                            onClick={(e) => onAddToCart(product, e)}
                            className="w-8 h-8 rounded-lg bg-[#C8956C] text-white flex items-center justify-center shadow-lg shadow-[#C8956C]/20 active:scale-90"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            disabled
                            className="w-8 h-8 rounded-lg bg-gray-400/20 text-gray-400 flex items-center justify-center cursor-not-allowed"
                        >
                            <ShoppingBag className="w-4 h-4 opacity-40" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

const CartDrawer = ({ isOpen, onClose, cart, total, onUpdateQuantity, onRemove, onCheckout, colors, isLight }) => {
    const drawerContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[6000]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className={`absolute inset-0 ${isLight ? 'bg-white/20' : 'bg-black/30'} backdrop-blur-xl`}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ background: colors.card, borderLeft: `1px solid ${colors.border}` }}
                        className="absolute top-0 right-0 h-full w-full max-w-sm shadow-2xl flex flex-col"
                    >
                        <div className="p-10 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight" style={{ color: colors.text, fontFamily: "'SF Pro Display', sans-serif" }}>Your Bag</h3>
                                <p className="text-[10px] font-black text-[#C8956C] uppercase tracking-[0.3em]">{cart.length} Selections</p>
                            </div>
                            <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                    <ShoppingBag size={80} className="mb-6" />
                                    <p className="font-black uppercase tracking-[0.5em] text-xs" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>Empty Selection</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item._id} className="flex gap-6 group">
                                        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/5 overflow-hidden shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-[11px] uppercase tracking-widest leading-relaxed mb-1 line-clamp-1">{item.name}</h4>
                                            <p className="text-[10px] font-black text-[#C8956C] mb-4 uppercase tracking-[0.2em]">₹{item.price}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center bg-white/5 rounded-xl border border-white/5">
                                                    <button onClick={() => onUpdateQuantity(item._id, -1)} className="w-8 h-8 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"><Minus size={12} /></button>
                                                    <span className="w-8 text-center text-[10px] font-black tabular-nums">{item.quantity}</span>
                                                    <button onClick={() => onUpdateQuantity(item._id, 1)} className="w-8 h-8 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"><Plus size={12} /></button>
                                                </div>
                                                <button onClick={() => onRemove(item._id)} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline px-2">Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-10 bg-white/5 border-t border-white/5 space-y-6">
                            <div className="flex items-center justify-between" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Subtotal</span>
                                <span className="text-3xl font-black italic tracking-tighter">₹{total}</span>
                            </div>
                            <button
                                onClick={onCheckout}
                                disabled={cart.length === 0}
                                className="w-full h-18 bg-[#C8956C] text-white font-black uppercase tracking-[0.4em] text-[11px] hover:bg-[#C8956C]/90 rounded-2xl flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl shadow-[#C8956C]/20"
                            >
                                PROCEED TO CHECKOUT <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    const portalRoot = document.getElementById('app-portal-root');
    return portalRoot ? createPortal(drawerContent, portalRoot) : null;
};

export default function AppShopPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'All';
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [flyingItems, setFlyingItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartIconRef = useRef(null);
    const { cart, cartTotal, cartCount, addToCart, updateQuantity, removeFromCart } = useCart();
    const { products: inventoryProducts, shopCategories } = useInventory();
    const { activeOutletId } = useBusiness();
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [rotations, setRotations] = useState({});

    const placeholders = [
        "Search products...",
        "Search brands...",
        "Search skincare...",
        "Search haircare...",
        "Search makeup..."
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    const MOCK_PRODUCTS = useMemo(() => {
        return inventoryProducts
            .filter((p) => p.isShopProduct)
            .map((p) => ({
                _id: String(p.id),
                name: p.name,
                brand: p.brand || 'Premium',
                price: p.sellingPrice || 0,
                image: p.appImage || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000',
                rating: p.rating || '4.5',
                category: shopCategories.find((c) => c.id === p.appCategory)?.name || 'General',
                description: p.shopDescription || p.description || '',
                outletIds: p.outletIds || [],
                // Required for isVisibleInCustomerShop (map previously dropped these → empty shop)
                isShopProduct: true,
                availability: p.availability || 'all',
                stock: p.stock,
                stockByOutlet: p.stockByOutlet,
            }));
    }, [inventoryProducts, shopCategories]);

    const categories = useMemo(() => ([
        { name: 'All', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80' },
        ...shopCategories.map(c => ({ name: c.name, img: c.image }))
    ]), [shopCategories]);

    const handleSendToPOS = () => {
        const orderData = { items: cart, total: cartTotal, timestamp: new Date().toISOString() };
        localStorage.setItem('pending_pos_cart', JSON.stringify(orderData));
        alert('Selection sent to checkout!');
    };

    // Sync state with URL params for external navigation
    useEffect(() => {
        const cat = searchParams.get('category') || 'All';
        setActiveCategory(cat);
    }, [searchParams]);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        toggle: isLight ? '#EDF0F2' : '#242424',
        input: isLight ? '#FFFFFF' : '#1A1A1A',
    };

    const handleCategoryChange = (val) => {
        setActiveCategory(val);
        setRotations(prev => ({
            ...prev,
            [val]: (prev[val] || 0) + 360
        }));
        const newParams = new URLSearchParams(searchParams);
        if (val === 'All') newParams.delete('category');
        else newParams.set('category', val);
        setSearchParams(newParams);
    };

    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleOpenProduct = (product) => {
        setSelectedProduct(product);
    };

    const isRedirecting = useRef(false);
    useEffect(() => {
        if (!selectedProduct) isRedirecting.current = false;
    }, [selectedProduct]);

    const filteredProducts = useMemo(() => {
        let result = MOCK_PRODUCTS.filter((p) => isVisibleInCustomerShop(p, activeOutletId));

        if (activeCategory !== 'All') {
            result = result.filter((p) => p.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.brand.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q)
            );
        }
        return result;
    }, [activeCategory, searchQuery, activeOutletId, MOCK_PRODUCTS]);

    const handleAddToCart = (product, event) => {
        // Map back to the format addToCart expects if needed, or unify.
        addToCart(product);
        if (event && cartIconRef.current) {
            const btnRect = event.currentTarget.getBoundingClientRect();
            const cartRect = cartIconRef.current.getBoundingClientRect();
            const newItem = {
                id: Date.now(),
                image: product.image,
                startX: btnRect.left + btnRect.width / 2,
                startY: btnRect.top + btnRect.height / 2,
                endX: cartRect.left + cartRect.width / 2,
                endY: cartRect.top + cartRect.height / 2,
            };
            setFlyingItems(prev => [...prev, newItem]);
            setTimeout(() => {
                setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
            }, 800);
        }
    };

    return (
        <div className="space-y-8 pb-32" style={{ background: colors.bg, minHeight: '100svh', overflowX: 'hidden' }}>
            <style>{`
                .search-input::placeholder {
                    color: ${isLight ? '#555' : 'rgba(255,255,255,0.6)'};
                    opacity: 0.8;
                }
            `}</style>
            {/* Header */}
            <div className="sticky top-0 z-50 pt-2 pb-2 px-4" style={{ background: colors.bg, backdropFilter: 'blur(20px)' }}>
                <div className="flex gap-3 items-center">
                    <div className="relative flex-1" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 14px',
                        height: '42px',
                        background: isLight
                            ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                            : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                        boxShadow: isLight
                            ? 'inset 0 1px 3px rgba(0,0,0,0.03)'
                            : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                        borderRadius: '20px 6px 20px 6px',
                        border: isFocused ? `1.5px solid #C8956C` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <Search className="w-4 h-4 mr-2" style={{ color: isFocused ? '#C8956C' : colors.textMuted }} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder={placeholders[placeholderIndex]}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            style={{ background: 'transparent', border: 'none', color: colors.text, outline: 'none', width: '100%', fontSize: '14px', fontWeight: 500 }}
                        />
                    </div>
                    <motion.div
                        ref={cartIconRef}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsCartOpen(true)}
                        style={{
                            background: '#C8956C',
                            borderRadius: '14px 4px 14px 4px',
                            width: 42,
                            height: 42,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            position: 'relative',
                            boxShadow: '0 10px 20px rgba(200,149,108,0.2)'
                        }}
                    >
                        <ShoppingBag size={18} color="#FFF" />
                        {cartCount > 0 && <span className="absolute top-[-5px] right-[-5px] w-5 h-5 bg-black text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg">{cartCount}</span>}
                    </motion.div>
                </div>
            </div>

            <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '20px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px', marginTop: '-35px' }}>
                {categories.map((cat) => (
                    <motion.div
                        key={cat.name}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCategoryChange(cat.name)}
                        style={{
                            flexShrink: 0, width: '90px',
                            padding: '12px 4px', textAlign: 'center', cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        <motion.div
                            animate={{ rotateY: rotations[cat.name] || 0 }}
                            transition={{ duration: 0.6, type: 'spring', damping: 20, stiffness: 100 }}
                            style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                overflow: 'hidden', margin: '0 auto 0',
                                border: activeCategory === cat.name ? '2.5px solid #C8956C' : (isLight ? '2.5px solid rgba(0,0,0,0.05)' : '2.5px solid rgba(255,255,255,0.1)'),
                                boxShadow: isLight ? '0 6px 15px rgba(0,0,0,0.08)' : '0 6px 15px rgba(0,0,0,0.4)',
                                padding: '2px',
                                perspective: '1000px'
                            }}>
                            <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        </motion.div>
                        <div style={{
                            padding: '5px 14px',
                            borderRadius: '16px 4px 16px 4px',
                            background: activeCategory === cat.name ? 'linear-gradient(135deg, #C8956C 0%, #A06844 100%)' : (isLight ? '#FDF6F0' : 'rgba(200, 149, 108, 0.15)'),
                            position: 'absolute',
                            bottom: '-4px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 2,
                            boxShadow: activeCategory === cat.name ? '0 6px 15px rgba(200,149,108,0.4)' : 'none',
                            width: 'max-content',
                            border: activeCategory === cat.name ? 'none' : `1px solid ${colors.border}`
                        }}>
                            <p style={{
                                fontSize: '9px',
                                fontWeight: 800,
                                color: activeCategory === cat.name ? '#FFFFFF' : (isLight ? '#8B6B54' : '#C8956C'),
                                margin: 0,
                                whiteSpace: 'nowrap',
                                letterSpacing: '0.01em',
                                textTransform: 'uppercase'
                            }}>
                                {cat.name}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-6 px-1">
                <div className="grid grid-cols-2 gap-6 px-1">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product, i) => {
                            const hasStock = stockQtyForOutlet(product, activeOutletId) > 0;
                            return (
                                <ProductCard 
                                    key={product._id} 
                                    product={product} 
                                    index={i} 
                                    onOpenProduct={handleOpenProduct} 
                                    onAddToCart={handleAddToCart} 
                                    colors={colors} 
                                    isLight={isLight} 
                                    hasStock={hasStock}
                                />
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} total={cartTotal} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} onCheckout={() => { handleSendToPOS(); setIsCartOpen(false); }} colors={colors} isLight={isLight} />

            <div className="fixed inset-0 pointer-events-none z-[10000]">
                <AnimatePresence>
                    {flyingItems.map((item) => (
                        <motion.img key={item.id} src={item.image} initial={{ x: item.startX - 24, y: item.startY - 24, scale: 0, opacity: 0 }} animate={{ x: item.endX - 24, y: item.endY - 24, scale: [0.5, 1.2, 0.2], opacity: [0.8, 1, 0.5], rotate: 720 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "circIn" }} className="fixed w-12 h-12 object-cover rounded-full border-2 border-[#C8956C] shadow-2xl" />
                    ))}
                </AnimatePresence>
            </div>

            {/* PRODUCT PREVIEW MODAL */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductPreviewModal 
                        product={selectedProduct} 
                        onClose={() => setSelectedProduct(null)} 
                        colors={colors}
                        isLight={isLight}
                        navigate={navigate}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const ProductPreviewModal = ({ product, onClose, colors, isLight, navigate }) => {
    const [isExpanding, setIsExpanding] = useState(false);
    const isRedirecting = useRef(false);

    useEffect(() => {
        if (product) {
            document.body.style.overflow = 'hidden';
            setIsExpanding(false);
            isRedirecting.current = false;
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [product]);

    if (!product) return null;

    return (
        <div className="absolute inset-0 z-[5000] flex items-end justify-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className={`absolute inset-0 ${isLight ? 'bg-black/20' : 'bg-black/70'} backdrop-blur-sm`}
            />
            <motion.div
                layout
                initial={{ y: '100%', maxHeight: '75vh', borderRadius: '32px 32px 0 0' }}
                animate={{ 
                    y: 0, 
                    height: isExpanding ? '100dvh' : '75vh',
                    maxHeight: '100dvh',
                    borderRadius: isExpanding ? '0px' : '32px 32px 0 0'
                }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full overflow-hidden shadow-2xl flex flex-col"
                style={{ background: colors.card }}
            >
                <div className="absolute top-4 right-4 z-10">
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-black/30 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/50 transition-colors border border-white/10 shadow-lg"
                    >
                        <X size={14} strokeWidth={3} />
                    </button>
                </div>
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto my-3 shrink-0 opacity-50" />
                <div 
                    className="overflow-y-auto px-6 pb-12 custom-scrollbar overscroll-contain"
                    style={{ flex: 1, touchAction: 'pan-y', overscrollBehavior: 'none' }}
                    onScroll={(e) => {
                        if(e.currentTarget.scrollTop > 60 && !isRedirecting.current) {
                            isRedirecting.current = true;
                            setIsExpanding(true);
                            navigate(`/app/product/${encodeURIComponent(product._id)}`, { 
                                state: { fromModal: true }
                            });
                        }
                    }}
                >
                    <div className="relative aspect-square mb-6 rounded-2xl overflow-hidden bg-black/5 mt-2 shadow-sm border border-black/5 dark:border-white/5">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-4 items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-black leading-tight tracking-tight" style={{ color: colors.text, fontFamily: "'SF Pro Display', sans-serif" }}>{product.name}</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 text-[#C8956C]">{product.brand}</p>
                        </div>
                        <span className="text-[#C8956C] font-black text-2xl tracking-tighter italic shrink-0" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>₹{product.price}</span>
                    </div>
                    
                    <p className="text-[13px] font-medium opacity-60 mt-4 leading-relaxed" style={{ color: colors.text }}>{product.description}</p>
                    
                    <div className="text-center mt-12 mb-4 opacity-40">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-bounce text-[#C8956C]">↑ Scroll up for full details</p>
                    </div>

                    <div style={{ height: '300px' }} />
                </div>
            </motion.div>
        </div>
    );
};
