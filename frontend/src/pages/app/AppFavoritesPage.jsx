import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Scissors } from 'lucide-react';
import AppBackButton from '../../components/app/AppBackButton';
import ServiceCard from '../../components/app/ServiceCard';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useInventory } from '../../contexts/InventoryContext';
import { mapInventoryProductToShopProduct } from '../../utils/shopProductMapper';
import { getImageUrl } from '../../utils/imageUtils';

export default function AppFavoritesPage() {
    const navigate = useNavigate();
    const { colors, theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const { favoriteProducts, toggleProductLike, favoriteServices, toggleServiceLike } = useFavorites();
    const { addToCart } = useCart();
    const { shopCategories } = useInventory();
    const [activeTab, setActiveTab] = useState('products');

    const likedProductsData = useMemo(() => {
        return favoriteProducts.map((p) => mapInventoryProductToShopProduct(p, shopCategories)).filter(Boolean);
    }, [favoriteProducts, shopCategories]);

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1 } };

    const handleBookService = (service) => {
        navigate(`/app/service/${service._id}`);
    };

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 pt-6 pb-2 px-4" style={{ background: colors.bg }}>
                <div className="flex items-center gap-4 mb-6">
                    <AppBackButton />
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tighter" style={{ color: colors.text, fontFamily: "'SF Pro Display', sans-serif" }}>
                            Liked <span className="text-[#C8956C]">Items</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-0.5">Your curated collection</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'products' ? 'bg-[#C8956C] text-white shadow-lg shadow-[#C8956C]/20' : 'text-text-muted opacity-40'}`}
                    >
                        Products ({likedProductsData.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'services' ? 'bg-[#C8956C] text-white shadow-lg shadow-[#C8956C]/20' : 'text-text-muted opacity-40'}`}
                    >
                        Services ({favoriteServices.length})
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="px-4 mt-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'products' ? (
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
                                        style={{ 
                                            background: colors.card, 
                                            border: `1px solid ${colors.border}`,
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                                        }}
                                        className="group rounded-[28px] overflow-hidden flex flex-col h-full"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-black/5 dark:bg-white/5">
                                            <img
                                                onClick={() => navigate(`/app/product/${product._id}`)}
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleProductLike(product._id); }}
                                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center shadow-sm"
                                                style={{ color: '#ff4b4b' }}
                                            >
                                                <Heart className="w-4 h-4 fill-current" />
                                            </button>
                                            <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-[#C8956C] text-white text-[7px] font-black tracking-[0.2em] uppercase">
                                                {product.brand}
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h3
                                                    onClick={() => navigate(`/app/product/${product._id}`)}
                                                    style={{ color: colors.text }}
                                                    className="font-black text-[12px] italic leading-tight line-clamp-2 cursor-pointer flex-1 tracking-tight"
                                                >
                                                    {product.name}
                                                </h3>
                                            </div>
                                            <div className="mt-auto pt-3 flex items-center justify-between border-t border-black/5 dark:border-white/5">
                                                <div>
                                                    <span className="text-sm font-black text-[#C8956C] tracking-tighter">₹{product.price?.toLocaleString()}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); addToCart(product._id); }}
                                                    className="w-9 h-9 rounded-xl bg-[#C8956C]/10 text-[#C8956C] flex items-center justify-center hover:bg-[#C8956C] hover:text-white transition-all active:scale-90"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-2">
                                    <EmptyState icon={Heart} title="No Liked Products" subtitle="Products you heart will appear here." />
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="services-list"
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={containerVariants}
                            transition={{ duration: 0.2 }}
                        >
                            {favoriteServices.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4 pb-12">
                                    {favoriteServices.map((service, i) => (
                                        <motion.div
                                            key={service._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            style={{ 
                                                background: colors.card, 
                                                border: `1px solid ${colors.border}`,
                                                backdropFilter: 'blur(10px)',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                                            }}
                                            className="group rounded-[28px] overflow-hidden flex flex-col h-full relative"
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-black/5 dark:bg-white/5">
                                                <img
                                                    onClick={() => navigate(`/app/service/${service._id}`)}
                                                    src={getImageUrl(service.image) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop"}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleServiceLike(service._id); }}
                                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center shadow-sm"
                                                    style={{ color: '#ff4b4b' }}
                                                >
                                                    <Heart className="w-4 h-4 fill-current" />
                                                </button>
                                                <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-[#C8956C] text-white text-[7px] font-black tracking-[0.2em] uppercase">
                                                    {service.duration} MIN
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <h3
                                                        onClick={() => navigate(`/app/service/${service._id}`)}
                                                        style={{ color: colors.text }}
                                                        className="font-black text-[12px] italic leading-tight line-clamp-2 cursor-pointer flex-1 tracking-tight"
                                                    >
                                                        {service.name}
                                                    </h3>
                                                </div>
                                                <div className="mt-auto pt-3 flex items-center justify-between border-t border-black/5 dark:border-white/5">
                                                    <div>
                                                        <span className="text-sm font-black text-[#C8956C] tracking-tighter">₹{service.price?.toLocaleString()}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/app/service/${service._id}`); }}
                                                        className="w-9 h-9 rounded-xl bg-[#C8956C]/10 text-[#C8956C] flex items-center justify-center hover:bg-[#C8956C] hover:text-white transition-all active:scale-90"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={Scissors} title="No Liked Services" subtitle="Services you heart will appear here." />
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
