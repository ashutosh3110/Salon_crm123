import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingBag, Star, Heart, Share2, ShieldCheck, Truck, RotateCcw, Plus, Minus } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/appMockData';
import { useCart } from '../../contexts/CartContext';

export default function AppProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, toggleWishlist, wishlist, cart } = useCart();

    const product = MOCK_PRODUCTS.find(p => p._id === id);
    const isLiked = wishlist.includes(id);
    const inCart = cart.find(item => item._id === id);

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-xl font-bold">Product not found</h2>
            <button onClick={() => navigate('/app/shop')} className="mt-4 text-primary font-bold">Back to Shop</button>
        </div>
    );

    return (
        <div className="pb-24">
            {/* Header / Nav */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 max-w-lg mx-auto bg-white/10 backdrop-blur-md">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-none bg-white shadow-lg flex items-center justify-center text-text border border-border/20"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-none bg-white shadow-lg flex items-center justify-center text-text border border-border/20">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => toggleWishlist(product._id)}
                        className={`w-10 h-10 rounded-none bg-white shadow-lg flex items-center justify-center transition-colors border border-border/20 ${isLiked ? 'text-rose-500' : 'text-text'}`}
                    >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Product Image */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square bg-surface-alt relative overflow-hidden"
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 flex gap-0">
                    <span className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest">
                        {product.brand}
                    </span>
                    <span className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                        {product.category}
                    </span>
                </div>
            </motion.div>

            {/* Product Info */}
            <div className="px-6 py-8 space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-amber-500 fill-amber-500' : 'text-border'}`} />
                        ))}
                        <span className="text-xs font-bold text-text ml-1">{product.rating}</span>
                        <span className="text-xs text-text-muted">({product.reviews} Reviews)</span>
                    </div>
                    <h1 className="text-3xl font-black text-text tracking-tighter leading-none">{product.name}</h1>
                    <p className="text-2xl font-black text-primary italic">₹{product.price}</p>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Description</h3>
                    <p className="text-sm text-text-secondary leading-relaxed font-medium">
                        {product.description} This professional-grade product is designed to provide salon-quality results at home. Enriched with natural ingredients for maximum efficacy.
                    </p>
                </div>

                {/* Benefits / Features */}
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { icon: ShieldCheck, text: 'Dermatologically Tested', color: 'bg-blue-50 text-blue-600' },
                        { icon: Truck, text: 'Free Express Delivery', color: 'bg-emerald-50 text-emerald-600' },
                        { icon: RotateCcw, text: '7-Day Easy Returns', color: 'bg-amber-50 text-amber-600' }
                    ].map((item, i) => (
                        <div key={i} className={`${item.color} p-4 rounded-none flex items-center gap-3 border border-current/10`}>
                            <item.icon className="w-5 h-5 font-bold" />
                            <span className="text-xs font-black uppercase tracking-wider">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-border/40 p-5 z-50 max-w-lg mx-auto">
                <div className="flex gap-0">
                    <div className="flex items-center bg-surface-alt rounded-none border border-border/60">
                        <button className="w-12 h-12 flex items-center justify-center text-text-muted hover:text-text transition-colors">
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-sm font-black italic">1</span>
                        <button className="w-12 h-12 flex items-center justify-center text-text-muted hover:text-text transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-none shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3"
                    >
                        <ShoppingBag className="w-5 h-5" /> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
