import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Coins, Gift, Zap } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function LoyaltyCard({ points = 0, pointsRate = 100, redeemValue = 1, onRedeem, minRedeem = 100 }) {
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const cashValue = (points / (pointsRate || 1)) * (redeemValue || 1);

    const isRedeemable = points >= minRedeem;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden group"
            style={{ 
                background: 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)',
                borderRadius: '32px',
                padding: '32px',
                color: '#FFF',
                boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}
        >
            {/* Animated Glow Effects */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                    position: 'absolute', top: '-50%', right: '-30%',
                    width: '300px', height: '300px',
                    background: 'radial-gradient(circle, #C8956C 0%, transparent 70%)',
                    filter: 'blur(60px)', borderRadius: '50%',
                    pointerEvents: 'none'
                }} 
            />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-[#C8956C]/20 flex items-center justify-center">
                                <Star size={12} color="#C8956C" fill="#C8956C" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8956C]">Loyalty Points</span>
                        </div>
                        <h2 className="text-5xl font-black italic tracking-tighter">{points.toLocaleString()}</h2>
                        <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.3em] mt-1">Total Points Balance</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Cash Value</p>
                        <div className="flex items-baseline justify-end gap-1">
                            <span className="text-[10px] font-black opacity-40">₹</span>
                            <p className="text-3xl font-black text-white">{cashValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <motion.button
                        whileHover={isRedeemable ? { scale: 1.02 } : {}}
                        whileTap={isRedeemable ? { scale: 0.98 } : {}}
                        onClick={() => isRedeemable && onRedeem && onRedeem(points)}
                        disabled={!isRedeemable}
                        className="relative overflow-hidden group/btn"
                        style={{
                            width: '100%',
                            padding: '18px',
                            background: isRedeemable ? 'white' : 'rgba(255,255,255,0.03)',
                            color: isRedeemable ? '#000' : 'rgba(255,255,255,0.2)',
                            borderRadius: '24px 8px 24px 8px',
                            fontSize: '12px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            cursor: isRedeemable ? 'pointer' : 'not-allowed',
                            border: isRedeemable ? 'none' : '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: isRedeemable ? '0 15px 30px rgba(255,255,255,0.1)' : 'none'
                        }}
                    >
                        {isRedeemable ? (
                            <>
                                <Zap size={18} fill="currentColor" />
                                <span>Redeem Now</span>
                                <motion.div 
                                    className="absolute inset-0 bg-black/5 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                                />
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} className="opacity-40" />
                                <span>Need {minRedeem - points} Pts More</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
            
            {/* Geometric Decoration */}
            <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
                <Coins size={120} className="rotate-12 translate-x-12 translate-y-12" />
            </div>
        </motion.div>
    );
}
