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
import { isVisibleInCustomerShop, stockQtyForOutlet, productAvailableAtOutlet } from '../../utils/shopVisibility';
import { mapInventoryProductToShopProduct } from '../../utils/shopProductMapper';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';



const ProductCard = React.memo(({ product, index, onOpenProduct, onAddToCart, onUpdateQuantity, cartItem, colors, isLight, hasStock }) => {
    const { isProductLiked, toggleProductLike } = useFavorites();
    const isLiked = isProductLiked(product._id || product.id);

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
                    src={getImageUrl(product.image) || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000'}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23222222%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EWapixo%3C%2Ftext%3E%3C%2Fsvg%3E"; 
                    }}
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
                    onClick={() => toggleProductLike(product._id || product.id)}
                    className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-black/40 transition-colors"
                    style={{ color: isLiked ? '#ff4b4b' : '#fff' }}
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
                        cartItem ? (
                            <div className="flex items-center bg-[#C8956C] rounded-lg text-white h-8 shadow-lg shadow-[#C8956C]/10 overflow-hidden">
                                <button 
                                    onClick={() => onUpdateQuantity(product._id, -1)} 
                                    className="w-8 h-8 flex items-center justify-center hover:bg-black/10 active:scale-90 transition-all"
                                >
                                    <Minus size={12} strokeWidth={3} />
                                </button>
                                <span className="w-5 text-center text-[11px] font-black tabular-nums">{cartItem.quantity}</span>
                                <button 
                                    onClick={() => onUpdateQuantity(product._id, 1)} 
                                    className="w-8 h-8 flex items-center justify-center hover:bg-black/10 active:scale-90 transition-all"
                                >
                                    <Plus size={12} strokeWidth={3} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => onAddToCart(product, e)}
                                className="w-8 h-8 rounded-lg bg-[#C8956C] text-white flex items-center justify-center shadow-lg shadow-[#C8956C]/20 active:scale-90"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        )
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
    const { cart, cartTotal, cartCount, addToCart, setIsCartOpen, updateQuantity } = useCart();
    const { 
        products: inventoryProducts, 
        productCategories: shopCategories,
        activeOutletId,
        fetchCustomerInitialData,
        fetchProducts,
        isInitializing
    } = useBusiness();
    const { toggleProductLike } = useInventory(); // Keep only for actions if needed, or move toggle to business
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Ensure data is loaded if landing directly on shop
    useEffect(() => {
        const initShop = async () => {
            if (!inventoryProducts || inventoryProducts.length === 0 || !shopCategories || shopCategories.length === 0) {
                setIsLoading(true);
                try {
                    await Promise.all([
                        fetchProducts(),
                        // Categories are usually fetched in initial data, but we check anyway
                    ]);
                } catch (err) {
                    console.error("Shop initialization failed:", err);
                } finally {
                    setTimeout(() => setIsLoading(false), 300);
                }
            } else {
                setIsLoading(false);
            }
        };
        initShop();
    }, [inventoryProducts?.length, shopCategories?.length, fetchProducts]);

    console.log("[Shop] Inventory Products:", inventoryProducts?.length);
    console.log("[Shop] Shop Categories:", shopCategories?.length);
    
    if (inventoryProducts && inventoryProducts.length > 0) {
        const firstProd = inventoryProducts[0];
        console.log("[Shop] First Product Image Debug:", {
            name: firstProd.name,
            originalPath: firstProd.appImage || firstProd.image,
            absoluteUrl: getImageUrl(firstProd.appImage || firstProd.image)
        });
    }
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
        if (!inventoryProducts) return [];
        
        // Debugging visibility
        inventoryProducts.forEach(p => {
            const hasShopFlag = !!p.isShopProduct;
            const isAvail = productAvailableAtOutlet(p, activeOutletId);
            if (!hasShopFlag || !isAvail) {
                console.log(`[Shop Debug] Hiding "${p.name}":`, { 
                    reason: !hasShopFlag ? "Show in Shop is UNCHECKED" : "Not assigned to this outlet",
                    pId: p._id 
                });
            }
        });

        return inventoryProducts
            .filter((p) => p.isShopProduct)
            .map((p) => mapInventoryProductToShopProduct(p, shopCategories))
            .filter(Boolean);
    }, [inventoryProducts, shopCategories, activeOutletId]);

    const categories = useMemo(() => {
        // Count products for each category to determine popularity
        const counts = {};
        shopProducts.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });

        const catList = (shopCategories || []).map(c => ({ 
            name: c.name, 
            img: c.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80',
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
            const q = searchQuery.trim().toLowerCase().replace(/\s/g, '');
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().replace(/\s/g, '').includes(q) ||
                    p.brand.toLowerCase().replace(/\s/g, '').includes(q) ||
                    p.category.toLowerCase().replace(/\s/g, '').includes(q)
            );
        }
        return result;
    }, [activeCategory, searchQuery, activeOutletId, shopProducts]);

    const handleAddToCart = async (product, event) => {
        const btnRect = event?.currentTarget?.getBoundingClientRect();
        const success = await addToCart(product._id, 1);
        if (success) {
            setIsCartOpen(true);
            if (btnRect && cartIconRef.current) {
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
        }
    };

    if (isLoading || isInitializing) {
        return (
            <div className="space-y-8 p-4" style={{ background: colors.bg, minHeight: '100svh' }}>
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
                <div className="flex gap-4 mt-2">
                    <div className="flex-1 h-12 rounded-[20px_6px_20px_6px] shimmer_box" />
                    <div className="w-12 h-12 rounded-[14px_4px_14px_4px] shimmer_box" />
                </div>
                <div className="flex gap-4 overflow-hidden mt-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                            <div className="w-16 h-16 rounded-full shimmer_box" />
                            <div className="w-12 h-3 rounded shimmer_box" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex flex-col gap-3">
                            <div className="aspect-square rounded-2xl shimmer_box" />
                            <div className="h-4 w-3/4 rounded shimmer_box" />
                            <div className="flex justify-between items-center">
                                <div className="h-4 w-1/3 rounded shimmer_box" />
                                <div className="h-8 w-8 rounded-lg shimmer_box" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="pb-32" style={{ background: colors.bg, minHeight: '100svh', overflowX: 'hidden' }}>
            <style>{`
                .search-input::placeholder {
                    color: ${isLight ? '#555' : 'rgba(255,255,255,0.6)'};
                    opacity: 0.8;
                }
            `}</style>
            
            {/* Shop Search Header - Sticky */}
            <div className="sticky top-0 z-50 pt-3 pb-3 px-4" style={{ background: colors.bg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${colors.border}` }}>
                <div className="flex gap-3 items-center">
                    <div className="relative flex-1" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 14px',
                        height: '44px',
                        background: isLight
                            ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                            : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                        boxShadow: isLight
                            ? 'inset 0 1px 3px rgba(0,0,0,0.03)'
                            : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                        borderRadius: '16px',
                        border: isFocused ? `1.5px solid #C8956C` : `1.5px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'transparent'}`,
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
                            borderRadius: '14px',
                            width: 44,
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            position: 'relative',
                            boxShadow: '0 8px 16px rgba(200,149,108,0.2)'
                        }}
                    >
                        <ShoppingBag size={18} color="#FFF" />
                        {cartCount > 0 && <span className="absolute top-[-4px] right-[-4px] min-w-[18px] h-[18px] bg-black text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg px-1">{cartCount}</span>}
                    </motion.div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="mt-6 mb-6">
                <div className="app-scroll no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2">
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
                                    gap: '8px',
                                    flexShrink: 0,
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    padding: '2px',
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
                                        border: `2px solid ${isLight ? '#fff' : colors.bg}`
                                    }}>
                                        <img 
                                            src={getImageUrl(cat.img) || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80'} 
                                            alt={cat.name}
                                            loading="lazy"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23222222%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EWapixo%3C%2Ftext%3E%3C%2Fsvg%3E"; }}
                                        />
                                    </div>
                                </div>
                                
                                <div 
                                    style={{ 
                                        background: isActive ? '#C8956C' : colors.card,
                                        color: isActive ? '#FFFFFF' : colors.text,
                                        borderRadius: '10px',
                                        padding: '4px 10px',
                                        boxShadow: isActive ? '0 4px 8px rgba(200,149,108,0.2)' : 'none',
                                        border: isActive ? 'none' : `1px solid ${colors.border}`,
                                        marginTop: '-12px',
                                        zIndex: 3,
                                        minWidth: '50px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <span 
                                        style={{ 
                                            fontSize: '8px', 
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
            </div>

            {/* Products Grid */}
            <div className="px-4">
                <div className="grid grid-cols-2 gap-3">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product, i) => {
                            const hasStock = true;
                            const cartItem = (cart?.items || []).find(item => 
                                (item.productId?._id || item.productId?.id || item.productId) === (product._id || product.id)
                            );
                            
                            return (
                                <ProductCard 
                                    key={product._id} 
                                    product={product} 
                                    index={i} 
                                    onOpenProduct={handleOpenProduct} 
                                    onAddToCart={handleAddToCart}
                                    onUpdateQuantity={updateQuantity}
                                    cartItem={cartItem}
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
                        <motion.img key={item.id} src={getImageUrl(item.image)} initial={{ x: item.startX - 24, y: item.startY - 24, scale: 0, opacity: 0 }} animate={{ x: item.endX - 24, y: item.endY - 24, scale: [0.5, 1.2, 0.2], opacity: [0.8, 1, 0.5], rotate: 720 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "circIn" }} className="fixed w-12 h-12 object-cover rounded-full border-2 border-[#C8956C] shadow-2xl" />
                    ))}
                </AnimatePresence>
            </div>

        </div>
    );
}
