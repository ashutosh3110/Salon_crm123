import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Star, Filter, ArrowRight, Heart, ChevronRight, X, Plus, Minus, Info } from 'lucide-react';
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES } from '../../data/appMockData';
import { useCart } from '../../contexts/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRef } from 'react';

const ProductCard = ({ product, index, onQuickView, onAddToCart }) => {
    const { toggleWishlist, wishlist } = useCart();
    const isLiked = wishlist.includes(product._id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-surface rounded-none border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full bg-white"
        >
            <div className="relative aspect-square overflow-hidden bg-surface-alt">
                <img
                    onClick={() => onQuickView(product)}
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                />
                <button
                    onClick={() => toggleWishlist(product._id)}
                    className={`absolute top-0 right-0 w-9 h-9 rounded-none bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-white transition-colors ${isLiked ? 'text-rose-500' : 'text-text'}`}
                >
                    <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <div className="absolute bottom-0 left-0 px-2 py-1 rounded-none bg-black text-white text-[9px] font-bold tracking-widest uppercase">
                    {product.brand}
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-1 mb-1.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-text-secondary">{product.rating}</span>
                </div>
                <h3
                    onClick={() => onQuickView(product)}
                    className="font-bold text-sm text-text leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[40px] cursor-pointer"
                >
                    {product.name}
                </h3>
                <div className="mt-auto pt-3 flex items-center justify-between">
                    <div>
                        <span className="text-sm font-black text-text tracking-tighter">₹ {product.price}</span>
                    </div>
                    <button
                        onClick={(e) => onAddToCart(product, e)}
                        className="w-10 h-10 rounded-none bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 active:scale-90"
                    >
                        <ShoppingBag className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
    const { cart, updateQuantity } = useCart();
    const navigate = useNavigate();
    const inCart = cart.find(item => item._id === product?._id);

    if (!product) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white w-full max-w-lg rounded-none p-10 space-y-8 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-border/40 rounded-full" />

                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 w-12 h-12 rounded-none bg-surface-alt flex items-center justify-center text-text-muted hover:text-text transition-colors border border-border/40"
                >
                    <X className="w-6 h-6" />
                </button>

                <div
                    className="flex flex-col sm:flex-row gap-8 cursor-pointer group"
                    onClick={() => navigate(`/app/product/${product._id}`)}
                >
                    <div className="w-full sm:w-48 h-48 rounded-none overflow-hidden bg-surface-alt shrink-0 shadow-inner">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] group-hover:text-primary-dark transition-colors">{product.brand}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                            <div className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-bold text-text-secondary">{product.rating}</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-text leading-tight tracking-tighter mb-3 group-hover:text-primary transition-colors">{product.name}</h2>
                        <p className="text-3xl font-black text-primary italic tracking-tighter">₹{product.price}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div
                        className="bg-surface-alt/40 p-5 rounded-none border border-border/30 cursor-pointer hover:bg-surface-alt/60 transition-colors group/desc"
                        onClick={() => navigate(`/app/product/${product._id}`)}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Description</h4>
                                    <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover/desc:opacity-100 -translate-x-2 group-hover/desc:translate-x-0 transition-all" />
                                </div>
                                <p className="text-sm text-text-secondary font-medium leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-none bg-white shadow-sm flex items-center justify-center text-primary group-hover/desc:bg-primary group-hover/desc:text-white transition-all shrink-0 border border-border/20">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-alt rounded-none p-5 flex items-center justify-between border border-border/60 shadow-inner">
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => updateQuantity(product._id, -1)}
                                className="w-10 h-10 rounded-none bg-white shadow-sm flex items-center justify-center text-text disabled:opacity-30 border border-border/40 hover:border-primary/40 transition-colors"
                                disabled={!inCart}
                            >
                                <Minus className="w-4.5 h-4.5" />
                            </button>
                            <span className="text-base font-black w-6 text-center tabular-nums">{inCart?.quantity || 0}</span>
                            <button
                                onClick={() => addToCart(product)}
                                className="w-10 h-10 rounded-none bg-white shadow-sm flex items-center justify-center text-text border border-border/40 hover:border-primary/40 transition-colors"
                            >
                                <Plus className="w-4.5 h-4.5" />
                            </button>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                if (!inCart) onAddToCart(product, e);
                                else onClose();
                            }}
                            className="px-8 py-4 bg-primary text-white rounded-none text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all"
                        >
                            {inCart ? 'View Cart' : 'Add to Cart'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const CartDrawer = ({ isOpen, onClose, cart, total, onUpdateQuantity, onRemove, onCheckout }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col pt-safe"
                    >
                        <div className="p-6 border-b border-border/40 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">Your Bag</h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{cart.length} Items Selected</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 border border-border/80 flex items-center justify-center text-black"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <ShoppingBag className="w-16 h-16 mb-4" />
                                    <p className="font-black uppercase tracking-widest text-xs">Your bag is empty</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item._id} className="flex gap-4 group">
                                        <div className="w-20 h-20 rounded-none bg-surface-alt border border-border/40 shrink-0 overflow-hidden relative">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-xs uppercase tracking-tight text-text leading-snug mb-1 line-clamp-1">{item.name}</h4>
                                            <p className="text-[10px] font-black text-primary italic mb-3">₹{item.price}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center border border-border/80 bg-surface-alt">
                                                    <button
                                                        onClick={() => onUpdateQuantity(item._id, -1)}
                                                        className="w-7 h-7 flex items-center justify-center hover:bg-white transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-[10px] font-black tabular-nums">{item.quantity}</span>
                                                    <button
                                                        onClick={() => onUpdateQuantity(item._id, 1)}
                                                        className="w-7 h-7 flex items-center justify-center hover:bg-white transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => onRemove(item._id)}
                                                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-surface-alt border-t border-border/40 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Subtotal</span>
                                <span className="text-xl font-black text-text italic">₹{total}</span>
                            </div>
                            <button
                                onClick={onCheckout}
                                disabled={cart.length === 0}
                                className="w-full h-16 bg-black text-white font-black uppercase tracking-[0.2em] text-[11px] hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:pointer-events-none"
                            >
                                Send to Checkout <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default function AppShopPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'All';
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [flyingItems, setFlyingItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartIconRef = useRef(null);
    const { cart, cartTotal, cartCount, addToCart, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        if (cat === 'All') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', cat);
        }
        setSearchParams(searchParams);
    };

    const filteredProducts = useMemo(() => {
        let result = MOCK_PRODUCTS;
        if (activeCategory !== 'All') {
            result = result.filter(p => p.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            );
        }
        return result;
    }, [activeCategory, searchQuery]);

    const handleSendToPOS = () => {
        // Logic to send items to POS
        // We'll store it in localStorage so the POSBillingPage can fetch it when a client is selected
        // In a real app, this would be an API call to CREATE A PENDING BASKET for the customer.
        const orderData = {
            items: cart,
            total: cartTotal,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('pending_pos_cart', JSON.stringify(orderData));
        alert('Items sent to checkout! Please tell the receptionist to process your bill.');
    };

    const categories = ['All', ...PRODUCT_CATEGORIES.map(c => c.name)];

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

            // Clean up after animation
            setTimeout(() => {
                setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
            }, 800);
        }
    };

    return (
        <div className="space-y-8 pb-32">
            {/* Sticky Header with Search, Filter & Cart */}
            <div className="sticky top-0 z-40 bg-white pt-4 pb-4 -mx-1 border-b border-border/10">
                <div className="flex gap-2 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-black group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 rounded-none bg-white border border-border/80 focus:outline-none focus:border-black transition-all text-xs font-black uppercase tracking-widest placeholder:text-text-muted/50"
                        />
                    </div>

                    <button className="w-16 h-16 rounded-none bg-white border border-border/80 text-black flex items-center justify-center hover:bg-surface-alt transition-colors shrink-0">
                        <Filter className="w-5 h-5" />
                    </button>

                    <motion.div
                        ref={cartIconRef}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsCartOpen(true)}
                        className="w-16 h-16 rounded-none bg-black text-white flex items-center justify-center relative group shrink-0 cursor-pointer overflow-hidden"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 w-6 h-6 bg-primary text-white text-[10px] font-black flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </motion.div>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-7 py-3.5 rounded-none text-[11px] font-black tracking-widest uppercase transition-all whitespace-nowrap border-2 ${activeCategory === cat
                            ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20'
                            : 'bg-white border-transparent text-text-secondary hover:border-border/60 hover:bg-surface-alt'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            {/* Products Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Curated For You ({filteredProducts.length})</h2>
                    <button className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Recommend <Info className="w-3 h-3" />
                    </button>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="py-20 text-center space-y-4 rounded-none bg-surface-alt/50 border border-dashed border-border flex flex-col items-center">
                        <div className="text-5xl">🔭</div>
                        <div className="space-y-1">
                            <p className="font-black text-text tracking-tighter">Nothing Found</p>
                            <p className="text-[11px] text-text-muted px-10 leading-relaxed font-bold uppercase tracking-wider">Try adjusting your filters</p>
                        </div>
                        <button
                            onClick={() => { setSearchQuery(''); handleCategoryChange('All'); }}
                            className="mt-4 px-8 py-3 bg-black text-white rounded-none text-[10px] font-black uppercase tracking-widest shadow-xl"
                        >Reset All</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-5">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product, i) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    index={i}
                                    onQuickView={setSelectedProduct}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Flying Items Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[9999]">
                <AnimatePresence>
                    {flyingItems.map((item) => (
                        <motion.img
                            key={item.id}
                            src={item.image}
                            initial={{
                                x: item.startX - 20,
                                y: item.startY - 20,
                                scale: 0,
                                opacity: 0,
                                rotate: 0
                            }}
                            animate={{
                                x: item.endX - 20,
                                y: item.endY - 20,
                                scale: [0.5, 1.5, 0.15],
                                opacity: [0.8, 1, 0.4],
                                rotate: 720
                            }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{
                                duration: 0.9,
                                times: [0, 0.2, 1],
                                ease: "easeInOut",
                            }}
                            className="fixed w-12 h-12 object-cover rounded-none border-2 border-primary shadow-2xl"
                        />
                    ))}
                </AnimatePresence>
            </div>



            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                total={cartTotal}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onCheckout={() => {
                    handleSendToPOS();
                    setIsCartOpen(false);
                }}
            />

            {/* Quick View Portal */}
            <AnimatePresence>
                {selectedProduct && (
                    <QuickViewModal
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                        onAddToCart={handleAddToCart}
                    />
                )}
            </AnimatePresence>
        </div >
    );
}
