import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, History, TrendingUp,
    TrendingDown, CreditCard, Wallet,
    CheckCircle2, ChevronRight, X, Zap
} from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBusiness } from '../../contexts/BusinessContext';

export default function AppWalletPage() {
    const navigate = useNavigate();
    const { balance, transactions, addMoney, spentThisMonth } = useWallet();
    const { loyaltySettings } = useBusiness();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [showAddModal, setShowAddModal] = useState(false);
    const [addAmount, setAddAmount] = useState('');
    const [adding, setAdding] = useState(false);
    const [success, setSuccess] = useState(false);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        accent: '#C8956C',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        input: isLight ? '#F1F3F5' : '#141414',
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
        <div style={{ background: colors.bg, minHeight: '100svh', padding: '16px' }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pt-4 px-2">
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ color: colors.text }}
                    className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5 active:scale-90 transition-all shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Financial</h1>
                    <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: colors.text }}>Wallet <span className="text-[#C8956C]">Pass</span></h2>
                </div>
            </div>

            {/* Premium Wallet Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)',
                    borderRadius: '28px',
                    padding: '30px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '24px'
                }}
            >
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute', top: '-20%', right: '-10%',
                    width: '200px', height: '200px',
                    background: 'radial-gradient(circle, rgba(200,149,108,0.1) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                                Available Balance
                            </p>
                            <h2 style={{ color: '#FFF', fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                                ₹{balance.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ color: "#C8956C" }}>
                            <Wallet size={28} />
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex gap-4">
                            <div>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Account Status</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span style={{ color: '#FFF', fontSize: '12px', fontWeight: 700 }}>Active</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{
                                background: '#C8956C', color: '#FFF', padding: '10px 20px',
                                borderRadius: '12px 4px 12px 4px', fontSize: '13px', fontWeight: 900,
                                display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: '0 8px 16px rgba(200,149,108,0.3)'
                            }}
                        >
                            <Plus size={18} /> Add Money
                        </button>
                    </div>
                </div>
            </motion.div>


            {/* Add Money Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0' }}>
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
                                background: colors.card, width: '100%', maxWidth: '430px',
                                borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
                                padding: '32px 24px 96px', position: 'relative'
                            }}
                        >
                            {!success ? (
                                <>
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 style={{ color: colors.text, fontSize: '20px', fontWeight: 900 }}>Top-up Wallet</h3>
                                        <button onClick={() => setShowAddModal(false)}><X size={24} style={{ color: colors.textMuted }} /></button>
                                    </div>

                                    <div className="mb-8">
                                        <p style={{ color: colors.textMuted, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Amount to add</p>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '24px', fontWeight: 900, color: colors.text }}>₹</span>
                                            <input
                                                type="number"
                                                value={addAmount}
                                                onChange={(e) => setAddAmount(e.target.value)}
                                                autoFocus
                                                placeholder="0.00"
                                                style={{
                                                    width: '100%', background: colors.input, border: `1.5px solid ${colors.border}`,
                                                    borderRadius: '20px', padding: '16px 16px 16px 40px',
                                                    fontSize: '28px', fontWeight: 900, color: colors.text, outline: 'none'
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
                                                    background: addAmount === amt ? 'rgba(200,149,108,0.1)' : 'transparent',
                                                    border: `1.5px solid ${addAmount === amt ? '#C8956C' : colors.border}`,
                                                    borderRadius: '16px', padding: '12px', color: addAmount === amt ? '#C8956C' : colors.text,
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
                                            width: '100%', background: '#C8956C', color: '#FFF',
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
                                    <h3 style={{ color: colors.text, fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Success!</h3>
                                    <p style={{ color: colors.textMuted, fontSize: '14px', fontWeight: 600 }}>₹{addAmount} has been added to your wallet.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
