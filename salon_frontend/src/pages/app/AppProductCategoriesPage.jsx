import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, X, Plus, Minus, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useInventory } from '../../contexts/InventoryContext';

const CARD_GRADIENTS = [
    'linear-gradient(145deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)',
    'linear-gradient(145deg, #2D1B69 0%, #4A1A6B 60%, #7B2D8B 100%)',
    'linear-gradient(145deg, #0F2027 0%, #203A43 60%, #2C5364 100%)',
    'linear-gradient(145deg, #1A1A1A 0%, #3A0000 60%, #600000 100%)',
    'linear-gradient(145deg, #0A2342 0%, #126872 60%, #1B998B 100%)',
];

function FlipCard({ item, gradient, onClick, accent, delay, isLight }) {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        const initial = setTimeout(() => {
            setFlipped(true);
            const interval = setInterval(() => {
                setFlipped(prev => !prev);
            }, 4000);
            return () => clearInterval(interval);
        }, delay);
        return () => clearTimeout(initial);
    }, [delay]);

    return (
        <motion.div
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            className="flex flex-col items-center gap-2 cursor-pointer"
        >
            <div className="w-[72px] h-[72px] shrink-0" style={{ perspective: '300px' }}>
                <div
                    className="w-full h-full relative transition-transform duration-700"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        borderRadius: '50%'
                    }}
                >
                    {/* FRONT — 3D text card */}
                    <div
                        className="absolute inset-0 rounded-full flex items-center justify-center p-2 shadow-lg"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            background: gradient,
                        }}
                    >
                        <span className="text-[9.5px] font-black text-white text-center leading-tight tracking-tight uppercase" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>
                            {item.label}
                        </span>
                    </div>

                    {/* BACK — circular photo */}
                    <div
                        className="absolute inset-0 rounded-full overflow-hidden border-2 border-white/10 shadow-xl"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-center" style={{ color: accent }}>
                {item.label}
            </span>
        </motion.div>
    );
}

function SpotlightItem({ item, index, onClick, accent, isLight }) {
    const isImage = index % 2 === 0;
    const gradient = CARD_GRADIENTS[Math.floor(index / 2) % CARD_GRADIENTS.length];

    if (!isImage) {
        return (
            <FlipCard item={item} gradient={gradient} onClick={onClick} accent={accent} delay={index * 700} isLight={isLight} />
        );
    }

    return (
        <motion.div
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            className="flex flex-col items-center gap-2 cursor-pointer"
        >
            <div className="w-[72px] h-[72px] rounded-full overflow-hidden shrink-0 border-2 border-white/10 shadow-lg">
                <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-center opacity-40 shrink-0">
                {item.label}
            </span>
        </motion.div>
    );
}

const CartDrawer = ({ isOpen, onClose, cart, total, onUpdateQuantity, onRemove, onCheckout, colors, isLight }) => {
    const drawerContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000]">
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
                        style={{ background: colors.card, borderLeft: `1px solid ${colors.border}`, width: '100%', maxWidth: '380px' }}
                        className="absolute top-0 right-0 h-full shadow-2xl flex flex-col"
                    >
                        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: colors.text }}>Your Bag</h3>
                                <p className="text-[9px] font-black text-[#C8956C] uppercase tracking-[0.3em]">{cart.length} Selections</p>
                            </div>
                            <button onClick={onClose} style={{ color: colors.text }} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                    <ShoppingBag size={64} className="mb-4" />
                                    <p className="font-black uppercase tracking-[0.4em] text-[10px]">Empty Selection</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item._id} className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 overflow-hidden shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-[11px] uppercase tracking-widest leading-relaxed mb-1 line-clamp-1" style={{ color: colors.text }}>{item.name}</h4>
                                            <p className="text-[10px] font-black text-[#C8956C] mb-3 uppercase tracking-[0.2em]">₹{item.price}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                                                    <button onClick={() => onUpdateQuantity(item._id, -1)} style={{ color: colors.text }} className="w-7 h-7 flex items-center justify-center opacity-40 hover:opacity-100"><Minus size={10} /></button>
                                                    <span className="w-7 text-center text-[10px] font-black tabular-nums" style={{ color: colors.text }}>{item.quantity}</span>
                                                    <button onClick={() => onUpdateQuantity(item._id, 1)} style={{ color: colors.text }} className="w-7 h-7 flex items-center justify-center opacity-40 hover:opacity-100"><Plus size={10} /></button>
                                                </div>
                                                <button onClick={() => onRemove(item._id)} className="text-[9px] font-black text-rose-500 uppercase tracking-widest px-2">Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: colors.text }}>Subtotal</span>
                                <span className="text-2xl font-black italic tracking-tighter" style={{ color: colors.text }}>₹{total}</span>
                            </div>
                            <button
                                onClick={onCheckout}
                                disabled={cart.length === 0}
                                className="w-full h-14 bg-[#C8956C] text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-xl flex items-center justify-center gap-3 disabled:opacity-20 shadow-xl shadow-[#C8956C]/20"
                            >
                                PROCEED TO CHECKOUT <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    const portalRoot = document.getElementById('app-portal-root');
    if (!portalRoot) return null;
    return createPortal(drawerContent, portalRoot);
};

export default function AppProductCategoriesPage() {
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const { shopCategories, products: inventoryProducts } = useInventory();
    const [active, setActive] = useState('trending');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cart, cartTotal, cartCount, updateQuantity, removeFromCart } = useCart();

    const SIDEBAR = useMemo(() => {
        return shopCategories.map((c, i) => ({
            id: c.id,
            label: c.name,
            img: c.image,
            accent: CARD_GRADIENTS[i % CARD_GRADIENTS.length].match(/#[a-fA-F0-9]{3,6}/g)?.[0] || '#C8956C'
        }));
    }, [shopCategories]);

    useEffect(() => {
        if (SIDEBAR.length > 0 && !SIDEBAR.find(s => s.id === active)) {
            setActive(SIDEBAR[0].id);
        }
    }, [SIDEBAR, active]);

    const cat = SIDEBAR.find(s => s.id === active) || SIDEBAR[0] || { label: 'Category', img: '' };

    const content = useMemo(() => {
        // Filter some products for this category to show in spotlight
        const categoryProducts = inventoryProducts
            .filter(p => p.isShopProduct && p.appCategory === active)
            .slice(0, 9);
        
        return {
            spotlight: categoryProducts.map(p => ({
                id: p.id,
                label: p.name,
                img: p.appImage || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000'
            }))
        };
    }, [active, inventoryProducts]);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        side: isLight ? '#FFFFFF' : '#1A1A1A',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: colors.bg, color: colors.text }}>
            {/* Header */}
            <div className="sticky top-0 z-50 p-4 pb-2 flex items-center justify-between border-b" style={{ background: `${colors.bg}cc`, backdropFilter: 'blur(16px)', borderBottomColor: colors.border }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} style={{ color: colors.text }} className="flex items-center justify-center active:scale-90 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-black tracking-tight" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>Categories</h1>
                </div>
                <div className="flex gap-2 font-black">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsCartOpen(true)}
                        style={{ color: colors.text, position: 'relative' }}
                        className="flex items-center justify-center active:scale-90 transition-all"
                    >
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white text-[8px] flex items-center justify-center rounded-full border border-white">
                                {cartCount}
                            </span>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-24 flex-shrink-0 overflow-y-auto border-r" style={{ background: colors.side, borderColor: colors.border }}>
                    {SIDEBAR.map((item) => {
                        const isActive = active === item.id;
                        return (
                            <motion.div
                                key={item.id}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setActive(item.id)}
                                className="flex flex-col items-center py-4 px-2 cursor-pointer transition-all gap-2 relative"
                                style={{ background: isActive ? (isLight ? 'rgba(200,149,108,0.05)' : 'rgba(200,149,108,0.1)') : 'transparent' }}
                            >
                                {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-[#C8956C]" />}
                                <div
                                    className="w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all shadow-sm"
                                    style={{ borderColor: isActive ? '#C8956C' : colors.border }}
                                >
                                    <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight" style={{ color: isActive ? '#C8956C' : colors.textMuted }}>
                                    {item.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Right Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-8">
                    {/* Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative h-24 rounded-3xl overflow-hidden shadow-lg"
                    >
                        <img src={cat.img} alt={cat.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-6">
                            <h2 className="text-xl font-black text-white italic tracking-tighter" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>{cat.label}</h2>
                        </div>
                    </motion.div>

                    {/* Spotlight */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">In The Spotlight</h3>
                        <div className="grid grid-cols-3 gap-6">
                            {content.spotlight.map((item, i) => (
                                <SpotlightItem key={item.id} item={item} index={i} accent={cat.accent} isLight={isLight} onClick={() => navigate(`/app/shop?tag=${encodeURIComponent(item.label)}`)} />
                            ))}
                        </div>
                    </div>

                    {/* View All CTA */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/app/shop?category=${encodeURIComponent(cat.label)}`)}
                        style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                        className="w-full h-16 rounded-2xl flex items-center justify-between p-4 shadow-sm active:scale-95 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden">
                                <img src={cat.img} className="w-full h-full object-cover" alt="" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Explore All Products</span>
                        </div>
                        <div className="bg-[#C8956C] text-white p-2 rounded-lg">
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                        </div>
                    </motion.button>
                </div>
            </div>

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                total={cartTotal}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onCheckout={() => {
                    localStorage.setItem('pending_pos_cart', JSON.stringify({ items: cart, total: cartTotal }));
                    setIsCartOpen(false);
                    alert('Selection sent to checkout!');
                }}
                colors={colors}
                isLight={isLight}
            />
        </div>
    );
}
