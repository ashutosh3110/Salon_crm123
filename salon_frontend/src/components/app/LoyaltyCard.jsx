import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Coins, Gift } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function LoyaltyCard({ points = 0, pointsRate = 100, onRedeem, minRedeem = 100 }) {
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const cashValue = (points / (pointsRate || 1)).toFixed(0);

    const isRedeemable = points >= minRedeem;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
                background: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)',
                borderRadius: '28px',
                padding: '24px',
                color: '#FFF',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <div style={{
                position: 'absolute', top: '-20%', right: '-10%',
                width: '150px', height: '150px',
                background: 'rgba(200,149,108,0.15)',
                filter: 'blur(40px)', borderRadius: '50%'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Star size={14} color="#C8956C" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#C8956C]">Ritual Points</span>
                        </div>
                        <h2 className="text-4xl font-black">{points.toLocaleString()}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold opacity-40 uppercase mb-1">Redeemable</p>
                        <p className="text-xl font-black text-[#C8956C]">₹{cashValue}</p>
                    </div>
                </div>

                <motion.button
                    whileTap={isRedeemable ? { scale: 0.95 } : {}}
                    onClick={() => isRedeemable && onRedeem && onRedeem(points)}
                    disabled={!isRedeemable}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: isRedeemable ? '#FFF' : 'rgba(255,255,255,0.05)',
                        color: isRedeemable ? '#000' : 'rgba(255,255,255,0.3)',
                        borderRadius: '16px 4px 16px 4px',
                        fontSize: '13px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: isRedeemable ? 'pointer' : 'not-allowed',
                        border: 'none',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {isRedeemable ? (
                        <><Sparkles size={18} /> Convert to Wallet</>
                    ) : (
                        <><Gift size={18} /> Need {minRedeem - points} more pts</>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
}
