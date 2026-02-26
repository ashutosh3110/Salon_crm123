import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { X, ShoppingBag, Star, Heart, Share2, ShieldCheck, Truck, RotateCcw, Plus, Minus, ArrowLeft } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/appMockData';
import { useCart } from '../../contexts/CartContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useRef } from 'react';

export default function AppProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, toggleWishlist, wishlist, cart, updateQuantity } = useCart();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const containerRef = useRef(null);

    const product = MOCK_PRODUCTS.find(p => p._id === id);
    const isLiked = wishlist.includes(id);
    const inCart = cart.find(item => item._id === id);

    const { scrollY } = useScroll();
    const headerBgOpacity = useTransform(scrollY, [100, 300], [0, 1]);
    const headerBlur = useTransform(scrollY, [100, 300], [0, 20]);
    const imgScale = useTransform(scrollY, [0, 500], [1, 1.2]);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        accent: '#C8956C'
    };

    if (!product) return (
        <div style={{ background: colors.bg, color: colors.text }} className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-xl font-black italic" style={{ fontFamily: "'Playfair Display', serif" }}>Ritual not found</h2>
            <button onClick={() => navigate('/app/shop')} className="mt-6 px-10 py-3 bg-[#C8956C] text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Back to Shop</button>
        </div>
    );

    return (
        <div style={{ background: colors.bg, color: colors.text }} className="min-h-screen">
            {/* ── STICKY LUXURY HEADER ── */}
            <motion.header
                className="fixed top-0 left-0 right-0 z-[100] h-20 flex items-center justify-between px-6 max-w-lg mx-auto pointer-events-none"
            >
                <motion.div
                    style={{ opacity: headerBgOpacity, backdropFilter: `blur(${headerBlur}px)` }}
                    className="absolute inset-0 bg-inherit border-b border-white/5"
                />

                <button
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 rounded-[1.25rem] bg-black/40 text-white backdrop-blur-xl border border-white/10 flex items-center justify-center active:scale-90 transition-all pointer-events-auto shadow-2xl"
                >
                    <X size={20} />
                </button>

                <motion.div
                    style={{ opacity: headerBgOpacity }}
                    className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C8956C] pointer-events-auto"
                >
                    Ritual Details
                </motion.div>

                <div className="flex gap-2 pointer-events-auto">
                    <button
                        onClick={() => toggleWishlist(product._id)}
                        className="w-12 h-12 rounded-[1.25rem] bg-black/40 text-white backdrop-blur-xl border border-white/10 flex items-center justify-center active:scale-90 transition-all shadow-2xl"
                    >
                        <Heart size={18} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                    </button>
                </div>
            </motion.header>

            {/* ── HERO SECTION ── */}
            <div className="relative aspect-[4/5] overflow-hidden bg-black">
                <motion.img
                    style={{ scale: imgScale }}
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-12 left-8 right-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1.5 bg-[#C8956C] text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-xl shadow-[#C8956C]/20">
                            {product.brand}
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-black text-white">{product.rating}</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {product.name}
                    </h1>
                </div>
            </div>

            {/* ── PRODUCT INFO BODY ── */}
            <div className="px-8 py-12 space-y-12 bg-inherit">
                {/* Price & Quantity */}
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Order Value</p>
                        <p className="text-4xl font-black text-[#C8956C] tracking-tighter">₹{product.price}</p>
                    </div>

                    <div className="flex items-center bg-white/5 rounded-[2.5rem] p-2 border border-white/5">
                        <button
                            onClick={() => updateQuantity(product._id, -1)}
                            className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-xl font-black italic tracking-tighter tabular-nums" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {inCart?.quantity || 1}
                        </span>
                        <button
                            onClick={() => addToCart(product)}
                            className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">The Ritual Story</h3>
                    <p className="text-lg leading-relaxed font-medium opacity-80 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {product.description}
                    </p>
                    <p className="text-sm leading-relaxed opacity-50">
                        This signature ritual product is curated for those who demand excellence. Every ingredient is ethically sourced and scientifically balanced to provide lasting results that elevate your daily grooming experience.
                    </p>
                </div>

                {/* Benefits List */}
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { icon: ShieldCheck, text: 'Dermatologically Tested', sub: 'Safe for sensitive skin types' },
                        { icon: Truck, text: 'Complimentary Delivery', sub: 'Shipping across major locations' },
                        { icon: RotateCcw, text: 'Ritual Assurance', sub: '7-day seamless return window' }
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-6 group hover:bg-white/10 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-[#C8956C]/10 flex items-center justify-center text-[#C8956C] shadow-lg shadow-[#C8956C]/5">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h5 className="text-[11px] font-black uppercase tracking-widest">{item.text}</h5>
                                <p className="text-[10px] opacity-30 uppercase tracking-[0.2em]">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Button (Integrated) */}
                <div className="pt-8 pb-10">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addToCart(product)}
                        className="w-full h-20 bg-[#C8956C] text-white rounded-[2rem] flex items-center justify-center gap-4 shadow-2xl shadow-[#C8956C]/40 active:scale-95 transition-all"
                    >
                        <ShoppingBag className="w-6 h-6" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                            {inCart ? 'ADD MORE TO SELECTION' : 'ORDER RITUAL NOW'}
                        </span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
