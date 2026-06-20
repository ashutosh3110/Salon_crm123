import React from 'react';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, Clock, Search,
    Wallet, Gem, ShoppingBag, Calendar, ArrowRightLeft,
    AlertCircle, ChevronLeft
} from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function AppTransactionHistoryPage() {
    const navigate = useNavigate();
    const { transactions, loading } = useWallet();
    const { colors: themeColors, isLight } = useCustomerTheme();

    const [activeTab, setActiveTab] = useState('all'); // all, credit, debit
    const [searchQuery, setSearchQuery] = useState('');

    const colors = useMemo(() => ({
        bg: '#FFFFFF',
        card: '#FFFFFF',
        text: themeColors.text || '#1A1A1A',
        textMuted: themeColors.textMuted || '#666',
        accent: themeColors.accent || '#B4912B',
        border: themeColors.border || 'rgba(0,0,0,0.07)',
        input: '#F3F4F6',
    }), [themeColors]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesTab = activeTab === 'all' || tx.type.toLowerCase() === activeTab;
            const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.amount.toString().includes(searchQuery);
            return matchesTab && matchesSearch;
        });
    }, [transactions, activeTab, searchQuery]);

    const getIcon = (type, description) => {
        const desc = description.toLowerCase();
        if (desc.includes('top-up') || desc.includes('recharge')) return { icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        if (desc.includes('loyalty') || desc.includes('points')) return { icon: Gem, color: 'text-blue-500', bg: 'bg-blue-500/10' };
        if (desc.includes('purchase') || desc.includes('item')) return { icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-500/10' };
        if (desc.includes('service') || desc.includes('booking')) return { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' };
        return { icon: ArrowRightLeft, color: 'text-gray-500', bg: 'bg-gray-500/10' };
    };

    const formatDate = (date) => {
        if (!date) return 'Just now';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Recently';

        const now = new Date();
        const diff = now - d;

        if (diff < 24 * 60 * 60 * 1000) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
    const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    return (
        <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: '100px' }} className="font-sans">
            {/* Header */}
            <div className="sticky top-0 z-30 px-4 py-4" style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent active:bg-gray-200/50 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
                    </button>
                    <h1 className="text-lg font-bold text-center flex-1 pr-10" style={{ color: colors.text }}>Transaction History</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 rounded-2xl mb-4" style={{ background: colors.input }}>
                    {['all', 'credit', 'debit'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
                            style={{
                                background: activeTab === tab ? colors.card : 'transparent',
                                color: activeTab === tab ? colors.accent : colors.textMuted,
                                boxShadow: activeTab === tab ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" style={{ color: colors.text }} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-bold border-none outline-none"
                        style={{ background: colors.card, color: colors.text, border: `1px solid ${colors.border}` }}
                    />
                </div>
            </div>

            {/* List */}
            <div className="px-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <Clock className="w-12 h-12 animate-spin mb-4" />
                        <p className="font-black uppercase tracking-widest text-[10px]">Loading History...</p>
                    </div>
                ) : filteredTransactions.length > 0 ? (
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        className="space-y-3"
                    >
                        {filteredTransactions.map((tx, idx) => {
                            const config = getIcon(tx.type, tx.description);
                            const isDebit = tx.type === 'DEBIT';

                            return (
                                <motion.div
                                    key={tx.id || idx}
                                    variants={fadeUp}
                                    className="p-4 rounded-2xl flex items-center gap-4 border"
                                    style={{ background: colors.card, borderColor: colors.border }}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                                        <config.icon className={`w-6 h-6 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold truncate mb-0.5" style={{ color: colors.text }}>
                                            {tx.description}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                                {formatDate(tx.date)}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-current opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: tx.status === 'COMPLETED' ? '#10B981' : '#F59E0B' }}>
                                                {tx.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base font-black flex items-center justify-end gap-1" style={{ color: isDebit ? '#EF4444' : '#10B981' }}>
                                            {isDebit ? '-' : '+'}₹{tx.amount.toLocaleString()}
                                        </p>
                                        <p className="text-[9px] font-bold uppercase opacity-30">via Wallet</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-500/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} className="opacity-20" />
                        </div>
                        <h3 className="text-lg font-black mb-2" style={{ color: colors.text }}>No Transactions</h3>
                        <p className="text-sm opacity-40 max-w-[200px] mx-auto font-medium">Your activity history will appear here once you start using your wallet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
