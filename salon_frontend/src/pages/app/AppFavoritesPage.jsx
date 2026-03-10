import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, MapPin, Star, Plus } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { MOCK_OUTLETS, MOCK_PRODUCTS } from '../../data/appMockData';

export default function AppFavoritesPage() {
    const navigate = useNavigate();
    const { colors, isLight } = useCustomerTheme();
    const { favoriteSalons, favoriteProducts, toggleSalonLike, toggleProductLike } = useFavorites();
    const { addToCart } = useCart();
    const [activeTab, setActiveTab] = useState('Salons');

    const likedSalonsData = useMemo(() => {
        return MOCK_OUTLETS.filter(salon => favoriteSalons.includes(salon._id));
    }, [favoriteSalons]);

    const likedProductsData = useMemo(() => {
        return MOCK_PRODUCTS.filter(product => favoriteProducts.includes(product._id));
    }, [favoriteProducts]);

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1 } };

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 px-4 pt-12 pb-6" style={{ background: colors.bg, backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: colors.card, border: `1px solid ${colors.border}`, color: colors.text }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black italic tracking-tight" style={{ color: colors.text }}>Liked Items</h1>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Your curated selection</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1.5 rounded-2xl" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
                    {['Salons', 'Products'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                height: '44px',
                                borderRadius: '14px',
                                background: activeTab === tab ? '#C8956C' : 'transparent',
                                color: activeTab === tab ? '#FFF' : colors.textMuted,
                                fontSize: '11px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                        >
                            {tab} ({tab === 'Salons' ? likedSalonsData.length : likedProductsData.length})
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="px-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'Salons' ? (
                        <motion.div
                            key="salons-list"
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={containerVariants}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {likedSalonsData.length > 0 ? (
                                likedSalonsData.map((salon, i) => (
                                    <motion.div
                                        key={salon._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="relative group p-4 rounded-3xl flex gap-4"
                                        style={{ background: colors.card, border: `1.5px solid ${colors.border}` }}
                                        onClick={() => navigate(`/app/salon/${salon._id}`)}
                                    >
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                                            <img src={salon.image} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Star size={10} fill="#C8956C" color="#C8956C" />
                                                <span className="text-[10px] font-black">{salon.rating}</span>
                                            </div>
                                            <h3 className="text-sm font-black truncate mb-1" style={{ color: colors.text }}>{salon.name}</h3>
                                            <p className="text-[10px] opacity-40 font-bold flex items-center gap-1">
                                                <MapPin size={10} /> {salon.address}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleSalonLike(salon._id); }}
                                            className="absolute top-4 right-4 text-red-500 p-2"
                                        >
                                            <Heart size={18} fill="currentColor" />
                                        </button>
                                    </motion.div>
                                ))
                            ) : (
                                <EmptyState icon={Heart} title="No Liked Salons" subtitle="Salons you heart will appear here." />
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="products-list"
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={containerVariants}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-2 gap-4 pb-12"
                        >
                            {likedProductsData.length > 0 ? (
                                likedProductsData.map((product, i) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                                        className="group rounded-2xl overflow-hidden shadow-sm flex flex-col h-full"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-black/5 dark:bg-white/5">
                                            <img
                                                onClick={() => navigate(`/app/product/${product._id}`)}
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover cursor-pointer"
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleProductLike(product._id); }}
                                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center shadow-sm"
                                                style={{ color: '#e53e3e' }}
                                            >
                                                <Heart className="w-4 h-4 fill-current" />
                                            </button>
                                            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-[#C8956C] text-white text-[8px] font-bold tracking-widest uppercase">
                                                {product.brand}
                                            </div>
                                        </div>
                                        <div className="p-3 flex flex-col flex-1">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h3
                                                    onClick={() => navigate(`/app/product/${product._id}`)}
                                                    style={{ color: colors.text }}
                                                    className="font-bold text-[13px] leading-tight line-clamp-2 cursor-pointer flex-1"
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
                                                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                    className="w-8 h-8 rounded-lg bg-[#C8956C] text-white flex items-center justify-center shadow-lg shadow-[#C8956C]/20 active:scale-90"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <EmptyState icon={Heart} title="No Liked Products" subtitle="Products you heart will appear here." />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, subtitle }) {
    const { colors } = useCustomerTheme();
    return (
        <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#C8956C]/5 flex items-center justify-center mb-6 border border-[#C8956C]/10">
                <Icon size={32} className="text-[#C8956C] opacity-30" />
            </div>
            <h3 className="text-lg font-black italic" style={{ color: colors.text }}>{title}</h3>
            <p className="text-[11px] opacity-40 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
        </div>
    );
}
