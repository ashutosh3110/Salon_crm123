import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';

export default function LoyaltyCard({ points = 0, redeemRate = 0.5 }) {
    const cashValue = (points * redeemRate).toFixed(0);

    // Tier calculation
    const getTier = (pts) => {
        if (pts >= 1000) return { name: 'Gold', color: 'from-amber-400 to-amber-600', icon: '👑' };
        if (pts >= 500) return { name: 'Silver', color: 'from-gray-300 to-gray-500', icon: '🥈' };
        return { name: 'Bronze', color: 'from-orange-300 to-orange-500', icon: '🥉' };
    };

    const tier = getTier(points);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-primary p-5 text-white"
        >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-4 right-4 opacity-10"
            >
                <Sparkles className="w-20 h-20" />
            </motion.div>

            <div className="relative">
                {/* Tier Badge */}
                <div className="flex items-center gap-2 mb-4">
                    <div className={`bg-gradient-to-r ${tier.color} px-2.5 py-1 rounded-lg flex items-center gap-1.5`}>
                        <span className="text-sm">{tier.icon}</span>
                        <span className="text-xs font-bold text-white">{tier.name} Member</span>
                    </div>
                </div>

                {/* Points */}
                <div className="mb-1">
                    <p className="text-xs font-medium text-white/60 uppercase tracking-wider">Your Balance</p>
                    <motion.div className="flex items-baseline gap-2 mt-1">
                        <motion.span
                            key={points}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-extrabold"
                        >
                            {points.toLocaleString()}
                        </motion.span>
                        <Star className="w-5 h-5 text-amber-300" fill="currentColor" />
                    </motion.div>
                </div>

                {/* Cash Value */}
                <p className="text-sm text-white/60 font-medium">
                    Worth <span className="text-white font-bold">₹{cashValue}</span>
                </p>
            </div>
        </motion.div>
    );
}
