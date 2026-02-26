import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { Search, ShoppingBag, Star, Filter, ArrowRight, Heart, ChevronRight, X, Plus, Minus, Share2, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES } from '../../data/appMockData';
import { useCart } from '../../contexts/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const ProductCard = ({ product, index, onQuickView, onAddToCart, colors, isLight }) => {
    const { toggleWishlist, wishlist } = useCart();
    const isLiked = wishlist.includes(product._id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{ background: colors.card, border: `1px solid ${colors.border}` }}
            className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
            <div className="relative aspect-square overflow-hidden bg-black/5 dark:bg-white/5">
                <img
                    onClick={() => onQuickView(product)}
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                />
                <button
                    onClick={() => toggleWishlist(product._id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-black/40 transition-colors"
                    style={{ color: isLiked ? '#e53e3e' : '#fff' }}
                >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-[#C8956C] text-white text-[8px] font-bold tracking-widest uppercase">
                    {product.brand}
                </div>
            </div>
            <div className="p-3 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3
                        onClick={() => onQuickView(product)}
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
                    <button
                        onClick={(e) => onAddToCart(product, e)}
                        className="w-8 h-8 rounded-lg bg-[#C8956C] text-white flex items-center justify-center shadow-lg shadow-[#C8956C]/20 active:scale-90"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const QuickViewModal = ({ product, onClose, onAddToCart, colors, isLight }) => {
    const { cart, updateQuantity, toggleWishlist, wishlist } = useCart();
    const [isFull, setIsFull] = useState(false);
    const containerRef = useRef(null);
    const { scrollY } = useScroll({ container: containerRef });

    const opacity = useTransform(scrollY, [0, 80], [1, 0]);
    const imgScale = useTransform(scrollY, [0, 500], [1, 1.15]);

    const inCart = cart.find(item => item._id === product?._id);
    const isLiked = wishlist.includes(product?._id);

    useEffect(() => {
        const unsubscribe = scrollY.onChange((v) => {
            if (v > 40 && !isFull) setIsFull(true);
        });
        return () => unsubscribe();
    }, [scrollY, isFull]);

    const modalContent = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-end justify-center bg-black/95 backdrop-blur-2xl md:left-1/2 md:-ml-[215px] md:w-[430px]"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0, height: isFull ? '100.5%' : '75%' }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
                style={{
                    background: colors.bg,
                    borderTopLeftRadius: isFull ? '0' : '2.5rem',
                    borderTopRightRadius: isFull ? '0' : '2.5rem',
                }}
                className="w-full relative flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fixed Close Action */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/40 text-white backdrop-blur-xl z-[70] flex items-center justify-center active:scale-90 shadow-2xl border border-white/10"
                >
                    <X size={24} />
                </button>

                {/* Drag Handle Indicator */}
                {!isFull && (
                    <motion.div
                        style={{ opacity }}
                        className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <div className="w-12 h-1 bg-white/30 rounded-full mt-3" />
                    </motion.div>
                )}

                <div
                    ref={containerRef}
                    className="flex-1 overflow-y-auto custom-scrollbar bg-inherit"
                    style={{ overflowX: 'hidden' }}
                >
                    {/* Immersive Product Hero */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-black">
                        <motion.img
                            style={{ scale: imgScale }}
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover opacity-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                        <div className="absolute bottom-10 left-8 right-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1.5 bg-[#C8956C] text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                    {product.brand}
                                </span>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-white">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-black">{product.rating}</span>
                                </div>
                            </div>
                            <h2 className="text-4xl font-black text-white leading-tight tracking-tighter italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {product.name}
                            </h2>
                        </div>
                    </div>

                    {/* Ritual Information */}
                    <div className="p-8 space-y-12 bg-inherit">
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30" style={{ color: colors.text }}>Order Value</p>
                                <p className="text-5xl font-black text-[#C8956C] tracking-tighter italic">₹{product.price}</p>
                            </div>
                            <div className="flex items-center gap-5 bg-black/5 dark:bg-white/5 rounded-full p-2 border border-black/5 dark:border-white/5">
                                <button
                                    onClick={() => updateQuantity(product._id, -1)}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                                    disabled={!inCart}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-xl font-black w-8 text-center tabular-nums" style={{ color: colors.text }}>{inCart?.quantity || 1}</span>
                                <button
                                    onClick={() => onAddToCart(product)}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: colors.text }}>The Experience</h3>
                            <p className="text-xl leading-relaxed font-medium opacity-80 italic" style={{ fontFamily: "'Playfair Display', serif", color: colors.text }}>
                                {product.description}
                            </p>
                            <p className="text-sm leading-relaxed opacity-50" style={{ color: colors.text }}>
                                This signature curation is meticulously balanced to provide visible transformations. Each application is a ritual of rejuvenation, crafted with precision and ethically sourced components.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { icon: ShieldCheck, title: 'Quality Assurance', sub: 'Dermatologically Tested' },
                                { icon: Truck, title: 'Express Delivery', sub: 'Free on all ritual orders' },
                                { icon: RotateCcw, title: 'Ritual Guarantee', sub: '7-day seamless experience' }
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 flex items-center gap-6 group">
                                    <div className="w-14 h-14 rounded-2xl bg-[#C8956C]/10 flex items-center justify-center text-[#C8956C] shadow-inner">
                                        <item.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h5 className="text-[12px] font-black uppercase tracking-widest mb-1" style={{ color: colors.text }}>{item.title}</h5>
                                        <p className="text-[10px] opacity-40 uppercase tracking-widest">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Button (Integrated) */}
                        <div className="pt-8 pb-10">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onAddToCart(product)}
                                className="w-full h-20 bg-[#C8956C] text-white rounded-[2rem] flex items-center justify-center gap-4 shadow-3xl shadow-[#C8956C]/40 active:scale-95 transition-all"
                            >
                                <ShoppingBag className="w-6 h-6" />
                                <span className="text-[12px] font-black uppercase tracking-[0.4em]">
                                    {inCart ? 'ADD TO RITUAL BAG' : 'PURCHASE RITUAL NOW'}
                                </span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    const portalRoot = document.getElementById('app-portal-root');
    return portalRoot ? createPortal(modalContent, portalRoot) : null;
};

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
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
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
                                <h3 className="text-2xl font-black uppercase tracking-tight" style={{ color: colors.text, fontFamily: "'Playfair Display', serif" }}>Your Bag</h3>
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
                                    <p className="font-black uppercase tracking-[0.5em] text-xs font-serif">Empty Selection</p>
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
                            <div className="flex items-center justify-between font-serif">
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

    const selectedProductId = searchParams.get('product');
    const selectedProduct = useMemo(() =>
        MOCK_PRODUCTS.find(p => p._id === selectedProductId),
        [selectedProductId]);

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

    const handleQuickView = (product) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('product', product._id);
        setSearchParams(newParams);
    };

    const handleCloseQuickView = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('product');
        setSearchParams(newParams);
    };

    const filteredProducts = useMemo(() => {
        let result = MOCK_PRODUCTS;
        if (activeCategory !== 'All') {
            result = result.filter(p => p.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        }
        return result;
    }, [activeCategory, searchQuery]);

    const handleSendToPOS = () => {
        const orderData = { items: cart, total: cartTotal, timestamp: new Date().toISOString() };
        localStorage.setItem('pending_pos_cart', JSON.stringify(orderData));
        alert('Selection sent to checkout!');
    };

    const categories = [
        { name: 'All', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80' },
        ...PRODUCT_CATEGORIES
    ];

    const handleAddToCart = (product, event) => {
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
                        {filteredProducts.map((product, i) => (
                            <ProductCard key={product._id} product={product} index={i} onQuickView={handleQuickView} onAddToCart={handleAddToCart} colors={colors} isLight={isLight} />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} total={cartTotal} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} onCheckout={() => { handleSendToPOS(); setIsCartOpen(false); }} colors={colors} isLight={isLight} />

            <AnimatePresence>
                {selectedProduct && <QuickViewModal product={selectedProduct} onClose={handleCloseQuickView} onAddToCart={handleAddToCart} colors={colors} isLight={isLight} />}
            </AnimatePresence>

            <div className="fixed inset-0 pointer-events-none z-[10000]">
                <AnimatePresence>
                    {flyingItems.map((item) => (
                        <motion.img key={item.id} src={item.image} initial={{ x: item.startX - 24, y: item.startY - 24, scale: 0, opacity: 0 }} animate={{ x: item.endX - 24, y: item.endY - 24, scale: [0.5, 1.2, 0.2], opacity: [0.8, 1, 0.5], rotate: 720 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "circIn" }} className="fixed w-12 h-12 object-cover rounded-full border-2 border-[#C8956C] shadow-2xl" />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
