import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Info, ChevronDown, ChevronUp } from 'lucide-react';
import LoyaltyCard from '../../components/app/LoyaltyCard';
import { MOCK_LOYALTY_WALLET, MOCK_LOYALTY_RULES, MOCK_LOYALTY_TRANSACTIONS } from '../../data/appMockData';

export default function AppLoyaltyPage() {
    const [showHowItWorks, setShowHowItWorks] = useState(false);

    // TODO: Replace with api.get('/loyalty/wallet/:customerId')
    const wallet = MOCK_LOYALTY_WALLET;

    // TODO: Replace with api.get('/loyalty/rules') — if customer-facing endpoint exists
    const rules = MOCK_LOYALTY_RULES;

    // TODO: Replace with api.get('/loyalty/history/:customerId')
    const transactions = MOCK_LOYALTY_TRANSACTIONS;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-5">
            <h1 className="text-xl font-extrabold text-text">Loyalty Rewards</h1>

            {/* Points Card */}
            <LoyaltyCard points={wallet.totalPoints} redeemRate={rules.redeemRate} />

            {/* Earn/Redeem Info */}
            <div className="grid grid-cols-2 gap-2.5">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl border border-border/60 p-3.5 text-center"
                >
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Earn Rate</p>
                    <p className="text-lg font-extrabold text-emerald-600">{rules.earnRate}x</p>
                    <p className="text-[10px] text-text-muted">point per ₹1 spent</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-xl border border-border/60 p-3.5 text-center"
                >
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Redeem Value</p>
                    <p className="text-lg font-extrabold text-primary">₹{rules.redeemRate}</p>
                    <p className="text-[10px] text-text-muted">per point</p>
                </motion.div>
            </div>

            {/* How It Works */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-border/60 overflow-hidden"
            >
                <button
                    onClick={() => setShowHowItWorks(!showHowItWorks)}
                    className="w-full flex items-center justify-between p-4"
                >
                    <span className="flex items-center gap-2 text-sm font-bold text-text">
                        <Info className="w-4 h-4 text-primary" /> How It Works
                    </span>
                    {showHowItWorks ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </button>

                <AnimatePresence>
                    {showHowItWorks && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 space-y-2.5">
                                <div className="flex gap-3 items-start">
                                    <span className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-xs font-bold text-emerald-600">1</span>
                                    <p className="text-xs text-text-secondary leading-relaxed">Earn <span className="font-bold">{rules.earnRate} point</span> for every ₹1 you spend on services</p>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">2</span>
                                    <p className="text-xs text-text-secondary leading-relaxed">Redeem points at <span className="font-bold">₹{rules.redeemRate}/point</span>. Minimum <span className="font-bold">{rules.minRedeemPoints} points</span> to redeem</p>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-xs font-bold text-amber-600">3</span>
                                    <p className="text-xs text-text-secondary leading-relaxed">Points expire after <span className="font-bold">{rules.expiryDays} days</span>. Max <span className="font-bold">{rules.maxEarnPerInvoice} points</span> per visit</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Transaction History */}
            <div>
                <h3 className="text-sm font-bold text-text mb-3">Transaction History</h3>
                <div className="space-y-2">
                    {transactions.length === 0 ? (
                        <p className="text-center text-sm text-text-muted py-8">No transactions yet</p>
                    ) : (
                        transactions.map((tx, i) => (
                            <motion.div
                                key={tx._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.06 }}
                                className="bg-white rounded-xl border border-border/60 p-3.5 flex items-center gap-3"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'EARN' ? 'bg-emerald-50' : tx.type === 'REDEEM' ? 'bg-primary/10' : 'bg-gray-100'
                                    }`}>
                                    {tx.type === 'EARN' ? (
                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <TrendingDown className="w-5 h-5 text-primary" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-text truncate">
                                        {tx.metadata?.serviceName || tx.metadata?.source || tx.metadata?.redeemedFor || tx.type}
                                    </p>
                                    <p className="text-[10px] text-text-muted mt-0.5">{formatDate(tx.createdAt)}</p>
                                </div>
                                <span className={`text-sm font-extrabold ${tx.points > 0 ? 'text-emerald-600' : 'text-primary'}`}>
                                    {tx.points > 0 ? '+' : ''}{tx.points}
                                </span>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
