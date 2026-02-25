import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function LoyaltyCard({ points = 0, redeemRate = 0.5 }) {
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const cashValue = (points * redeemRate).toFixed(0);

    const colors = {
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        accent: '#C8956C',
    };

    // Tier calculation
    const getTier = (pts) => {
        if (pts >= 1000) return { name: 'Platinum', color: 'from-slate-400 to-slate-200', icon: '💎' };
        if (pts >= 500) return { name: 'Gold', color: 'from-amber-400 to-amber-200', icon: '👑' };
        return { name: 'Silver', color: 'from-gray-300 to-gray-100', icon: '✨' };
    };

    const tier = getTier(points);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-xl shadow-[#C8956C]/20"
            style={{
                background: isLight
                    ? 'linear-gradient(135deg, #C8956C 0%, #A06844 100%)'
                    : 'linear-gradient(135deg, #1A1A1A 0%, #111111 100%)',
                border: !isLight ? `1px solid ${colors.border}` : 'none'
            }}
        >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-20 translate-x-20 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-black/5 translate-y-12 -translate-x-12 blur-xl" />

            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-10 -right-10 opacity-10 pointer-events-none"
            >
                <Sparkles size={160} />
            </motion.div>

            <div className="relative">
                {/* Tier Badge */}
                <div className="flex items-center justify-between gap-2 mb-8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <span className="text-sm">{tier.icon}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">{tier.name} PRIVILEGE</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-lg border border-white/10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Active Member</span>
                    </div>
                </div>

                {/* Points */}
                <div className="mb-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-1">Ritual Points</p>
                    <motion.div className="flex items-center gap-4">
                        <motion.span
                            key={points}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black italic tracking-tighter"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            {points.toLocaleString()}
                        </motion.span>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center p-2 backdrop-blur-sm border border-white/10">
                            <Star className="w-full h-full text-[#C8956C]" fill="currentColor" />
                        </div>
                    </motion.div>
                </div>

                {/* Cash Value */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        REDEEMABLE VALUE: <span className="text-white font-black ml-1">₹{cashValue}</span>
                    </div>
                    <button className="text-[9px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-lg active:scale-95 transition-all shadow-lg shadow-black/10">
                        Redeem
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
