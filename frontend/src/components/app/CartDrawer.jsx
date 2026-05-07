import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose, cart, total, onUpdateQuantity, onRemove, colors, isLight }) => {
    const navigate = useNavigate();
    
    const drawerContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[6000]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className={`absolute inset-0 ${isLight ? 'bg-black/10' : 'bg-black/30'} backdrop-blur-xl`}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ background: colors.card, borderLeft: `1px solid ${colors.border}` }}
                        className="absolute top-0 right-0 h-full w-full max-w-sm shadow-2xl flex flex-col"
                    >
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight" style={{ color: colors.text, fontFamily: "'SF Pro Display', sans-serif" }}>Your Bag</h3>
                                <p className="text-[10px] font-black text-[#C8956C] uppercase tracking-[0.3em]">{cart.length} Selections</p>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                    <ShoppingBag size={60} className="mb-4" />
                                    <p className="font-black uppercase tracking-[0.4em] text-[10px]">Empty Selection</p>
                                </div>
                            ) : (
                                cart.map((item) => {
                                    const p = item.productId;
                                    if (!p) return null;
                                    return (
                                        <div key={p._id || p.id} className="flex gap-4 group">
                                            <div className="w-16 h-16 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 overflow-hidden shrink-0">
                                                <img src={p.appImage || p.image} alt={p.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-[11px] uppercase tracking-widest leading-relaxed mb-1 line-clamp-1" style={{ color: colors.text }}>{p.name}</h4>
                                                <p className="text-[10px] font-black text-[#C8956C] mb-3 uppercase tracking-[0.2em]">₹{p.sellingPrice || p.price}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                                                        <button onClick={() => onUpdateQuantity(p._id || p.id, -1)} className="w-7 h-7 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"><Minus size={10} /></button>
                                                        <span className="w-6 text-center text-[10px] font-black tabular-nums">{item.quantity}</span>
                                                        <button onClick={() => onUpdateQuantity(p._id || p.id, 1)} className="w-7 h-7 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"><Plus size={10} /></button>
                                                    </div>
                                                    <button onClick={() => onRemove(p._id || p.id)} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline px-2">Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 space-y-4">
                            <div className="flex items-center justify-between" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: colors.text }}>Subtotal</span>
                                <span className="text-2xl font-black italic tracking-tighter" style={{ color: colors.text }}>₹{total}</span>
                            </div>
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/app/checkout');
                                }}
                                disabled={cart.length === 0}
                                className="w-full h-14 bg-[#C8956C] text-white font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#C8956C]/90 rounded-xl flex items-center justify-center gap-3 disabled:opacity-20 shadow-lg shadow-[#C8956C]/20"
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
    return portalRoot ? createPortal(drawerContent, portalRoot) : null;
};

export default CartDrawer;
