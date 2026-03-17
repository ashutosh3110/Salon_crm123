import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, History, TrendingUp,
    TrendingDown, CreditCard, Wallet,
    CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function AppWalletPage() {
    const navigate = useNavigate();
    const { balance, transactions, addMoney, spentThisMonth } = useWallet();
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
            await new Promise(r => setTimeout(r, 1500)); // Premium delay
            await addMoney(addAmount);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setShowAddModal(false);
                setAddAmount('');
            }, 2000);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div style={{ background: colors.bg, minHeight: '100svh', padding: '16px' }}>
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

            {/* Quick Actions / Stats */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '16px' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} color="#10B981" />
                        <span style={{ color: colors.textMuted, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Spent this month</span>
                    </div>
                    <p style={{ color: colors.text, fontSize: '18px', fontWeight: 900 }}>₹{spentThisMonth.toLocaleString()}</p>
                </div>
                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '16px' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={14} color="#C8956C" />
                        <span style={{ color: colors.textMuted, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Refundable</span>
                    </div>
                    <p style={{ color: colors.text, fontSize: '18px', fontWeight: 900 }}>₹1,500</p>
                </div>
            </div>

            {/* Transaction History */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <History size={18} style={{ color: colors.accent }} />
                        <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: 900 }}>Activity History</h3>
                    </div>
                    <button style={{ color: colors.accent, fontSize: '12px', fontWeight: 800 }}>View All</button>
                </div>

                <div className="space-y-3">
                    {transactions.length > 0 ? transactions.map((tx, idx) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{
                                background: colors.card, border: `1px solid ${colors.border}`,
                                borderRadius: '16px', padding: '14px',
                                display: 'flex', alignItems: 'center', gap: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: tx.type === 'CREDIT' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: tx.type === 'CREDIT' ? '#10B981' : '#EF4444'
                            }}>
                                {tx.type === 'CREDIT' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            </div>
                            <div className="flex-1">
                                <h4 style={{ color: colors.text, fontSize: '14px', fontWeight: 700, margin: 0 }}>{tx.description}</h4>
                                <p style={{ color: colors.textMuted, fontSize: '10px', fontWeight: 600 }}>{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p style={{
                                    fontSize: '15px', fontWeight: 900,
                                    color: tx.type === 'CREDIT' ? '#10B981' : colors.text
                                }}>
                                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                                </p>
                                <p style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(16, 185, 129, 0.6)' }}>Completed</p>
                            </div>
                        </motion.div>
                    )) : (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <p style={{ color: colors.textMuted, fontSize: '13px', fontWeight: 700 }}>No transactions yet.</p>
                        </div>
                    )}
                </div>
            </section>

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
                                padding: '32px 24px 48px', position: 'relative'
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
                                        {addAmount >= 500 && (
                                            <motion.p 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ color: '#10B981', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginTop: '8px', letterSpacing: '0.05em' }}
                                            >
                                                + ₹{addAmount >= 2000 ? 300 : addAmount >= 1000 ? 100 : 50} Loyalty Bonus will be added
                                            </motion.p>
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
