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
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { isVisibleInCustomerShop, stockQtyForOutlet } from '../../utils/shopVisibility';
import { mapInventoryProductToShopProduct } from '../../utils/shopProductMapper';

const ProductCard = React.memo(({ product, index, onOpenProduct, onAddToCart, colors, isLight, hasStock, onToggleLike }) => {
    const { customer } = useCustomerAuth();
    const isLiked = product.likedBy?.includes(customer?._id);

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
            <div className={`relative aspect-square overflow-hidden bg-black/5 dark:bg-white/5 cursor-pointer ${!hasStock ? 'grayscale-[0.3] blur-[1.5px]' : ''}`}>
                <img
                    onClick={() => onOpenProduct(product._id || product.id)}
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>

            {!hasStock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/90 px-4 py-2 rounded-xl shadow-2xl border-2 border-[#C8956C]/50 transform -rotate-12">
                        <p className="text-[10px] font-black tracking-[0.2em] text-[#C8956C] uppercase">Available Soon</p>
                    </div>
                </div>
            )}

            <div className="absolute top-2 right-2 z-20 flex flex-col items-center gap-1">
                <button
                    onClick={() => onToggleLike(product._id)}
                    className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-black/40 transition-colors"
                    style={{ color: isLiked ? '#e53e3e' : '#fff' }}
                >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                {product.likes > 0 && (
                    <span className="text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                        {product.likes}
                    </span>
                )}
            </div>
            
            <div className="absolute top-2 left-2 z-20 px-2 py-1 rounded-md bg-[#C8956C]/90 backdrop-blur-sm text-white text-[8px] font-extrabold tracking-widest uppercase shadow-sm">
                {product.brand}
            </div>

            <div className={`p-3 flex flex-col flex-1 ${!hasStock ? 'blur-[1.5px]' : ''}`}>
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3
                        onClick={() => onOpenProduct(product._id || product.id)}
                        style={{ color: colors.text }}
                        className="font-bold text-[14px] leading-tight group-hover:text-[#C8956C] transition-colors line-clamp-none cursor-pointer flex-1 underline-offset-2 hover:underline decoration-[#C8956C]/30"
                    >
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold" style={{ color: colors.textMuted }}>{Number(product.rating || 0).toFixed(1)}</span>
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


export default function AppShopPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'All';
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [flyingItems, setFlyingItems] = useState([]);
    const cartIconRef = useRef(null);
    const { cart, cartTotal, cartCount, addToCart, setIsCartOpen } = useCart();
    const { products: inventoryProducts, shopCategories, toggleProductLike } = useInventory();
    const { isProductLiked } = useFavorites();
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

    const shopProducts = useMemo(() => {
        return inventoryProducts
            .filter((p) => p.isShopProduct)
            .map((p) => ({
                _id: String(p.id || p._id),
                name: p.name,
                brand: p.brand || 'Premium',
                price: p.sellingPrice || 0,
                image: p.appImage || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000',
                rating: p.rating || '4.5',
                likes: p.likes || 0,
                likedBy: p.likedBy || [],
                category: (() => {
                    const cat = shopCategories.find(c => 
                        String(c.id) === String(p.categoryId) || 
                        String(c.id) === String(p.appCategory) || 
                        c.name === p.appCategory
                    );
                    return cat ? cat.name : 'General';
                })(),
                description: p.shopDescription || p.description || '',
                outletIds: p.outletIds || [],
                isShopProduct: true,
                availability: p.availability || 'all',
                stock: p.stock,
                stockByOutlet: p.stockByOutlet,
            }));
    }, [inventoryProducts, shopCategories]);

    const categories = useMemo(() => {
        // Count products for each category to determine popularity
        const counts = {};
        shopProducts.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });

        const catList = shopCategories.map(c => ({ 
            name: c.name, 
            img: c.image,
            count: counts[c.name] || 0
        }));

        // Sort by count descending
        catList.sort((a, b) => b.count - a.count);

        return [
            { name: 'All', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80' },
            ...catList.map(c => ({ name: c.name, img: c.img }))
        ];
    }, [shopCategories, shopProducts]);


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


    const handleOpenProduct = (productId) => {
        navigate(`/app/product/${encodeURIComponent(productId)}`);
    };

    useEffect(() => {
        // ... navigation handles it now
    }, []);

    const filteredProducts = useMemo(() => {
        let result = shopProducts.filter((p) => isVisibleInCustomerShop(p, activeOutletId));

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
    }, [activeCategory, searchQuery, activeOutletId, shopProducts]);

    const handleAddToCart = async (product, event) => {
        const btnRect = event?.currentTarget?.getBoundingClientRect();
        const success = await addToCart(product._id, 1);
        if (success && btnRect && cartIconRef.current) {
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

                {/* Categories - Premium Circular Style */}
                <div className="app-scroll no-scrollbar flex gap-4 overflow-x-auto px-4 pb-4 -mt-4">
                    {categories.map(cat => {
                        const isActive = activeCategory === cat.name;
                        return (
                            <motion.div
                                key={cat.name}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCategoryChange(cat.name)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    flexShrink: 0,
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '50%',
                                    padding: '3px',
                                    background: isActive ? '#C8956C' : 'transparent',
                                    border: isActive ? 'none' : `1px solid ${colors.border}`,
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    zIndex: 2
                                }}>
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        background: colors.card,
                                        border: `2px solid ${isLight ? '#fff' : '#000'}`
                                    }}>
                                        <img 
                                            src={cat.img} 
                                            alt={cat.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                                
                                <div 
                                    style={{ 
                                        background: isActive ? '#C8956C' : colors.card,
                                        color: isActive ? '#FFFFFF' : colors.text,
                                        borderRadius: '12px 4px 12px 4px',
                                        padding: '4px 12px',
                                        boxShadow: isActive ? '0 4px 12px rgba(200,149,108,0.2)' : 'none',
                                        border: isActive ? 'none' : `1px solid ${colors.border}`,
                                        marginTop: '-12px',
                                        zIndex: 3,
                                        minWidth: '60px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <span 
                                        style={{ 
                                            fontSize: '9px', 
                                            fontWeight: 800,
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {cat.name}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            <div className="space-y-6 px-4">
                <div className="grid grid-cols-2 gap-3">
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
                                    onToggleLike={toggleProductLike}
                                    colors={colors} 
                                    isLight={isLight} 
                                    hasStock={hasStock}
                                />
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>


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
