import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Gift, Check, UserPlus, Users } from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { MOCK_REFERRALS, MOCK_LOYALTY_RULES } from '../../data/appMockData';

export default function AppReferralPage() {
    const { customer } = useCustomerAuth();
    const [copied, setCopied] = useState(false);

    // TODO: Replace with api.get('/loyalty/referrals/:customerId')  
    const referrals = MOCK_REFERRALS;
    const rules = MOCK_LOYALTY_RULES;

    // Generate a referral code from customer id
    const referralCode = `GLAM${(customer?.phone || '0000').slice(-4)}`;
    const referralLink = `${window.location.origin}/app/login?ref=${referralCode}`;

    const completedCount = referrals.filter(r => r.status === 'COMPLETED').length;
    const pendingCount = referrals.filter(r => r.status === 'PENDING').length;
    const totalEarned = referrals.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.rewardPoints, 0);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const el = document.createElement('textarea');
            el.value = referralCode;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Glamour Studio',
                    text: `Use my referral code ${referralCode} to get rewards when you book your first appointment!`,
                    url: referralLink,
                });
            } catch { /* cancelled */ }
        } else {
            handleCopy();
        }
    };

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
    const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
            <h1 className="text-xl font-extrabold text-text">Refer & Earn</h1>

            {/* Hero Card */}
            <motion.div
                variants={fadeUp}
                className="bg-gradient-to-br from-primary via-primary-dark to-primary rounded-2xl p-5 text-white relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-4" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <Gift className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white/70">Invite Friends</span>
                    </div>
                    <h3 className="text-lg font-extrabold leading-tight">
                        Earn <span className="text-amber-200">50 points</span><br />for each referral
                    </h3>
                    <p className="text-xs text-white/60 mt-1.5">Your friend also gets a welcome bonus!</p>
                </div>
            </motion.div>

            {/* Referral Code */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-border/60 p-4 space-y-3">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Your Referral Code</p>
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-surface rounded-xl px-4 py-3 border-2 border-dashed border-primary/30 text-center">
                        <span className="text-xl font-extrabold text-primary tracking-[0.2em]">{referralCode}</span>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopy}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${copied ? 'bg-emerald-50' : 'bg-surface hover:bg-surface-alt'}`}
                    >
                        {copied ? (
                            <Check className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <Copy className="w-5 h-5 text-text-secondary" />
                        )}
                    </motion.button>
                </div>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleShare}
                    className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:shadow-md transition-all"
                >
                    <Share2 className="w-4 h-4" /> Share with Friends
                </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5">
                <div className="bg-white rounded-xl border border-border/60 p-3 text-center">
                    <p className="text-lg font-extrabold text-text">{completedCount + pendingCount}</p>
                    <p className="text-[10px] text-text-muted font-medium mt-0.5">Referred</p>
                </div>
                <div className="bg-white rounded-xl border border-border/60 p-3 text-center">
                    <p className="text-lg font-extrabold text-emerald-600">{completedCount}</p>
                    <p className="text-[10px] text-text-muted font-medium mt-0.5">Joined</p>
                </div>
                <div className="bg-white rounded-xl border border-border/60 p-3 text-center">
                    <p className="text-lg font-extrabold text-primary">{totalEarned}</p>
                    <p className="text-[10px] text-text-muted font-medium mt-0.5">Pts Earned</p>
                </div>
            </motion.div>

            {/* Referral List */}
            {referrals.length > 0 && (
                <motion.div variants={fadeUp}>
                    <h3 className="text-sm font-bold text-text mb-3">Your Referrals</h3>
                    <div className="space-y-2">
                        {referrals.map((ref, i) => (
                            <motion.div
                                key={ref._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.06 }}
                                className="bg-white rounded-xl border border-border/60 p-3.5 flex items-center gap-3"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ref.status === 'COMPLETED' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                    <UserPlus className={`w-5 h-5 ${ref.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-text truncate">{ref.referredName}</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">
                                        {ref.status === 'COMPLETED' ? 'Joined & booked' : 'Invite sent'}
                                    </p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${ref.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {ref.status === 'COMPLETED' ? `+${ref.rewardPoints} pts` : 'Pending'}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
