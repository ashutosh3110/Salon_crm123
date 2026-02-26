import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

/* ── Left sidebar categories (with images) ── */
const SIDEBAR = [
    { id: 'trending', label: 'Trending Now', accent: '#C8956C', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
    { id: 'hair', label: 'Hair Care', accent: '#8B5CF6', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
    { id: 'skin', label: 'Skin Care', accent: '#EC4899', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
    { id: 'nails', label: 'Nail Art', accent: '#10B981', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80' },
    { id: 'makeup', label: 'Makeup', accent: '#F59E0B', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&q=80' },
    { id: 'tools', label: 'Pro Tools', accent: '#3B82F6', img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&q=80' },
    { id: 'body', label: 'Body Care', accent: '#06B6D4', img: 'https://images.unsplash.com/photo-1607006342411-b4f006fa1a11?w=200&q=80' },
    { id: 'spa', label: 'Spa & Relax', accent: '#F97316', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80' },
];

/* ── Right panel content per category ── */
const CONTENT = {
    trending: {
        spotlight: [
            { id: 1, label: "What's New", img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
            { id: 2, label: 'Summer Sale', img: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=200&q=80' },
            { id: 3, label: 'Bridal', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80' },
            { id: 4, label: 'New Arrivals', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
            { id: 5, label: 'Hot Deals', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 6, label: 'Budget Finds', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&q=80' },
            { id: 7, label: 'Top Rated', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=200&q=80' },
            { id: 8, label: 'Gift Cards', img: 'https://images.unsplash.com/photo-1607006342411-b4f006fa1a11?w=200&q=80' },
            { id: 9, label: 'Expert Picks', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: 'Rising Stars', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
            { id: 2, label: 'Luxe', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 3, label: 'Pro Line', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80' },
            { id: 4, label: 'Organic', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
            { id: 5, label: 'Global', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: "L'Oréal", img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&q=80' },
            { id: 2, name: 'MAC', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 3, name: 'Kerastase', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80' },
            { id: 4, name: 'Maybelline', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&q=80' },
            { id: 5, name: 'Wella', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
        ],
    },
    hair: {
        spotlight: [
            { id: 1, label: 'Shampoo', img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&q=80' },
            { id: 2, label: 'Conditioner', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80' },
            { id: 3, label: 'Hair Oil', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
            { id: 4, label: 'Hair Mask', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
            { id: 5, label: 'Serum', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80' },
            { id: 6, label: 'Color Care', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=200&q=80' },
            { id: 7, label: 'Anti-Dandruff', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80' },
            { id: 8, label: 'Growth', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80' },
            { id: 9, label: 'Argan Oil', img: 'https://images.unsplash.com/photo-1607006342411-b4f006fa1a11?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: "L'Oréal", img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&q=80' },
            { id: 2, label: 'Kerastase', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80' },
            { id: 3, label: 'Wella', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
            { id: 4, label: 'Pantene', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
            { id: 5, label: 'Dove', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: "L'Oréal", img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&q=80' },
            { id: 2, name: 'Kerastase', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80' },
            { id: 3, name: 'Wella', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
            { id: 4, name: 'Pantene', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&q=80' },
            { id: 5, name: 'Dove', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
        ],
    },
    skin: {
        spotlight: [
            { id: 1, label: 'Face Wash', img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=200&q=80' },
            { id: 2, label: 'Moisturizer', img: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80' },
            { id: 3, label: 'Sunscreen', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80' },
            { id: 4, label: 'Serum', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 5, label: 'Face Mask', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 6, label: 'Toner', img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&q=80' },
            { id: 7, label: 'Eye Cream', img: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=200&q=80' },
            { id: 8, label: 'Exfoliator', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
            { id: 9, label: 'Vitamin C', img: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: 'DermaX', img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=200&q=80' },
            { id: 2, label: 'NatureSpa', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 3, label: 'GlowUp', img: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80' },
            { id: 4, label: 'CeraVe', img: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=200&q=80' },
            { id: 5, label: "Neutrogena", img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: 'DermaX', img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=200&q=80' },
            { id: 2, name: 'NatureSpa', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 3, name: 'CeraVe', img: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=200&q=80' },
            { id: 4, name: 'La Roche', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80' },
            { id: 5, name: 'Neutrogena', img: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80' },
        ],
    },
    // ... adding more for Spa/etc
    spa: {
        spotlight: [
            { id: 1, label: 'Essential Oils', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80' },
            { id: 2, label: 'Bath Bombs', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
            { id: 3, label: 'Face Steam', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=200&q=80' },
            { id: 9, label: 'Diffusers', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=80' },
        ],
        universe: [
            { id: 1, label: 'Forest Essentials', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80' },
            { id: 2, label: 'Kama Ayurveda', img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&q=80' },
        ],
        trending_stores: [
            { id: 1, name: 'Forest', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80' },
            { id: 2, name: 'Kama', img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&q=80' },
        ],
    }
};

/* gradients for 3D text cards — cycles through rich palette */
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
                        <span className="text-[9.5px] font-black text-white text-center leading-tight tracking-tight uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
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

export default function AppProductCategoriesPage() {
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const [active, setActive] = useState('trending');

    const cat = SIDEBAR.find(s => s.id === active);
    const content = CONTENT[active] || CONTENT.trending;

    const colors = {
        bg: isLight ? '#F8F9FA' : '#141414',
        side: isLight ? '#FFFFFF' : '#1A1A1A',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: colors.bg, color: colors.text }}>
            {/* Header */}
            <div className="sticky top-0 z-50 p-6 flex items-center justify-between border-b" style={{ background: `${colors.bg}cc`, backdropFilter: 'blur(16px)', borderBottomColor: colors.border }}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} style={{ color: colors.text }} className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center active:scale-90 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Categories</h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/app/shop')} style={{ color: colors.text }} className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center active:scale-90 transition-all">
                        <ShoppingBag size={20} />
                    </button>
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
                            <h2 className="text-xl font-black text-white italic tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>{cat.label}</h2>
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
        </div>
    );
}
