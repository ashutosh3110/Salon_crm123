import React from 'react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Wallet, TrendingUp, TrendingDown,
    CheckCircle2, ChevronRight, X, Zap, Clock, ChevronLeft, Tag, Gift
} from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

export default function AppWalletPage() {
    const navigate = useNavigate();
    const { balance, transactions, addMoney } = useWallet();
    const { customer } = useCustomerAuth();
    const { loyaltySettings } = useBusiness();
    const { colors: themeColors } = useCustomerTheme();

    const [showAddModal, setShowAddModal] = useState(false);
    const [addAmount, setAddAmount] = useState('');
    const [adding, setAdding] = useState(false);
    const [success, setSuccess] = useState(false);

    const colors = useMemo(() => ({
        ...themeColors,
        accent: themeColors.accent || '#B4912B',
    }), [themeColors]);

    const hexToRgba = (hex, alpha) => {
        if (!hex || !hex.startsWith('#')) return hex;
        const cleanHex = hex.replace('#', '');
        let r = 0, g = 0, b = 0;
        if (cleanHex.length === 3) {
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else if (cleanHex.length === 6) {
            r = parseInt(cleanHex.slice(0, 2), 16);
            g = parseInt(cleanHex.slice(2, 4), 16);
            b = parseInt(cleanHex.slice(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const handleAddMoney = async () => {
        if (!addAmount || isNaN(addAmount) || addAmount <= 0) return;
        setAdding(true);
        try {
            const res = await addMoney(addAmount);
            if (res.success) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    setShowAddModal(false);
                    setAddAmount('');
                }, 2000);
            }
        } catch (err) {
            console.error('Wallet recharge failed:', err);
            alert(err.message || 'Payment failed. Please try again.');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div style={{ background: '#F9F9FA', minHeight: '100vh' }} className="pb-10 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between bg-[#F9F9FA]">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent active:bg-gray-200/50 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-black" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 text-center flex-1 pr-10">Rewards</h1>
            </div>

            <div className="px-4 space-y-4">
                {/* Wallet Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'linear-gradient(135deg, #DFAC2C 0%, #B98514 100%)',
                        borderRadius: '24px',
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 12px 24px rgba(185, 133, 20, 0.15)',
                    }}
                    className="text-white"
                >
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">Wallet Balance</p>
                            <h2 className="text-3xl font-extrabold mt-1 tracking-tight">
                                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-white text-[#B98514] px-4 py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-opacity-95 active:scale-95 transition-all"
                        >
                            + Add Money
                        </button>
                    </div>
                </motion.div>

                {/* Loyalty Points Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    style={{
                        background: '#FFF',
                        borderRadius: '24px',
                        padding: '20px 24px',
                        border: '1px solid rgba(0,0,0,0.03)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.02)',
                    }}
                    className="flex justify-between items-center"
                >
                    <div>
                        <p className="text-xs font-bold text-[#B48418] uppercase tracking-wide">Loyalty Points</p>
                        <div className="mt-1 flex items-baseline gap-1.5">
                            <span className="text-2xl font-extrabold text-gray-900">
                                {(customer?.loyaltyPoints || 0).toLocaleString()}
                            </span>
                            <span className="text-xs font-semibold text-gray-400">Points</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/app/loyalty')}
                        className="bg-[#FFF8E6] text-[#B48418] border border-[#B48418]/20 px-5 py-2.5 rounded-full text-xs font-bold shadow-sm hover:bg-[#B48418]/10 active:scale-95 transition-all"
                    >
                        Redeem Now
                    </button>
                </motion.div>

                {/* Grid of Options */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Refer & Earn */}
                    <div
                        onClick={() => navigate('/app/referrals')}
                        className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-50/50 cursor-pointer active:scale-95 transition-all"
                    >
                        <div className="w-[56px] h-[56px] flex items-center justify-center mb-1">
                            <img src="/refer and  earn .png" alt="Refer & Earn" className="w-[52px] h-[52px] object-contain" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 leading-tight">Refer & Earn</span>
                        <span className="text-[9px] text-gray-400 mt-1 font-medium">Earn Rewards</span>
                    </div>

                    {/* Membership */}
                    <div
                        onClick={() => navigate('/app/membership')}
                        className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-50/50 cursor-pointer active:scale-95 transition-all"
                    >
                        <div className="w-[56px] h-[56px] flex items-center justify-center mb-1">
                            <img src="/memebership.png" alt="Membership" className="w-[52px] h-[52px] object-contain" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 leading-tight">Membership</span>
                        <span className="text-[9px] text-gray-400 mt-1 font-medium">View Plans</span>
                    </div>

                    {/* Transactions */}
                    <div
                        onClick={() => navigate('/app/transactions')}
                        className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-50/50 cursor-pointer active:scale-95 transition-all"
                    >
                        <div className="w-[56px] h-[56px] flex items-center justify-center mb-1">
                            <img src="/transaction.png" alt="Transactions" className="w-[52px] h-[52px] object-contain" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 leading-tight">Transactions</span>
                        <span className="text-[9px] text-gray-400 mt-1 font-medium">View History</span>
                    </div>

                    {/* Convert Points */}
                    <div
                        onClick={() => navigate('/app/loyalty')}
                        className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-50/50 cursor-pointer active:scale-95 transition-all"
                    >
                        <div className="w-[56px] h-[56px] flex items-center justify-center mb-1">
                            <img src="/convertpoint.png" alt="Convert Points" className="w-[52px] h-[52px] object-contain" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 leading-tight">Convert Points</span>
                        <span className="text-[9px] text-gray-400 mt-1 font-medium">To Wallet</span>
                    </div>
                </div>

                {/* Banner Promotion */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-3xl overflow-hidden relative shadow-md mt-6"
                    style={{
                        backgroundImage: "url('/banner image 2.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '150px',
                    }}
                >
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                        <button
                            onClick={() => navigate('/app/referrals')}
                            className="bg-white text-[#B98514] font-extrabold text-[11px] px-5 py-2.5 rounded-full w-fit shadow-md active:scale-95 hover:bg-opacity-95 transition-all"
                        >
                            Refer Now
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Add Money Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyItems: 'center', padding: '0 0' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !adding && setShowAddModal(false)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                background: '#FFF', width: '100%', maxWidth: '430px',
                                borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
                                padding: '32px 24px 96px', position: 'relative',
                                margin: '0 auto'
                            }}
                        >
                            {!success ? (
                                <>
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-gray-900 text-xl font-black">Top-up Wallet</h3>
                                        <button onClick={() => setShowAddModal(false)}><X size={24} className="text-gray-400" /></button>
                                    </div>

                                    <div className="mb-8">
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Amount to add</p>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '24px', fontWeight: 900, color: '#111827' }}>₹</span>
                                            <input
                                                type="number"
                                                value={addAmount}
                                                onChange={(e) => setAddAmount(e.target.value)}
                                                autoFocus
                                                placeholder="0.00"
                                                style={{
                                                    width: '100%', background: '#F9FAFB', border: '1.5px solid #E5E7EB',
                                                    borderRadius: '20px', padding: '16px 16px 16px 40px',
                                                    fontSize: '28px', fontWeight: 900, color: '#111827', outline: 'none'
                                                }}
                                            />
                                        </div>
                                        {loyaltySettings?.active && addAmount > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                                            >
                                                <Zap size={14} className="text-emerald-500" fill="currentColor" />
                                                <p style={{ color: '#10B981', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                                    + {Math.floor(addAmount / (loyaltySettings.pointsRate || 100))} Loyalty Points will be added
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-8">
                                        {['500', '1000', '2000'].map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => setAddAmount(amt)}
                                                style={{
                                                    background: addAmount === amt ? hexToRgba(colors.accent, 0.1) : 'transparent',
                                                    border: `1.5px solid ${addAmount === amt ? colors.accent : '#E5E7EB'}`,
                                                    borderRadius: '16px', padding: '12px', color: addAmount === amt ? colors.accent : '#374151',
                                                    fontSize: '14px', fontWeight: 800
                                                }}
                                            >
                                                ₹{amt}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleAddMoney}
                                        disabled={adding || !addAmount}
                                        style={{
                                            width: '100%', background: 'linear-gradient(135deg, #DFAC2C 0%, #B98514 100%)', color: '#FFF',
                                            padding: '18px', borderRadius: '18px 6px 18px 6px',
                                            fontSize: '16px', fontWeight: 900, textTransform: 'uppercase',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                            opacity: (adding || !addAmount) ? 0.5 : 1
                                        }}
                                    >
                                        {adding ? (
                                            <>Processing...</>
                                        ) : (
                                            <>Confirm Top-up <ChevronRight size={18} /></>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                        <CheckCircle2 size={40} color="#10B981" />
                                    </div>
                                    <h3 className="text-gray-900 text-2xl font-black mb-2">Success!</h3>
                                    <p className="text-gray-500 text-sm font-semibold">₹{addAmount} has been added to your wallet.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
