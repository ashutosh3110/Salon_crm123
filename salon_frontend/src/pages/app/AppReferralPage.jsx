import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Gift, Check, UserPlus } from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { MOCK_REFERRALS } from '../../data/appMockData';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function AppReferralPage() {
    const { customer } = useCustomerAuth();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const [copied, setCopied] = useState(false);

    // TODO: Replace with api.get('/loyalty/referrals/:customerId')  
    const referrals = MOCK_REFERRALS;

    const colors = {
        bg: isLight ? '#F8F9FA' : '#141414',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        toggle: isLight ? '#EDF0F2' : '#242424',
    };

    // Generate a referral code from customer id
    const referralCode = `WAPIXO${(customer?.phone || '0000').slice(-4)}`;
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
                    title: 'Join Wapixo Signature',
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
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: colors.text, fontFamily: "'Playfair Display', serif" }}>
                Refer & <span className="text-[#C8956C]">Earn</span>
            </h1>

            {/* Hero Card */}
            <motion.div
                variants={fadeUp}
                className="bg-gradient-to-br from-[#C8956C] via-[#A06844] to-[#C8956C] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-[#C8956C]/20"
            >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-4" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <Gift className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Premium Rewards</span>
                    </div>
                    <h3 className="text-xl font-black leading-tight italic tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Earn 50 Points<br />per successful referral
                    </h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/60 mt-2">Your friends also get exclusive welcome perks</p>
                </div>
            </motion.div>

            {/* Referral Code */}
            <motion.div variants={fadeUp} style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-[2rem] p-6 space-y-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Your Referral Code</p>
                <div className="flex items-center gap-3">
                    <div style={{ background: colors.toggle, borderColor: '#C8956C' }} className="flex-1 rounded-2xl px-4 py-4 border-2 border-dashed text-center">
                        <span className="text-xl font-black tracking-[0.3em] text-[#C8956C] uppercase">{referralCode}</span>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopy}
                        style={{ background: colors.toggle, border: `1px solid ${colors.border}` }}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors"
                    >
                        {copied ? (
                            <Check className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <Copy className="w-5 h-5" style={{ color: colors.textMuted }} />
                        )}
                    </motion.button>
                </div>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleShare}
                    className="w-full py-4 rounded-2xl bg-[#C8956C] text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-[#C8956C]/10 active:scale-95 transition-all"
                >
                    <Share2 className="w-4 h-4" /> Invite Your Inner Circle
                </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-xl font-black italic tracking-tighter" style={{ color: colors.text }}>{completedCount + pendingCount}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-40" style={{ color: colors.textMuted }}>Referred</p>
                </div>
                <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-xl font-black italic tracking-tighter text-emerald-500">{completedCount}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-40" style={{ color: colors.textMuted }}>Joined</p>
                </div>
                <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-xl font-black italic tracking-tighter text-[#C8956C]">{totalEarned}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-40" style={{ color: colors.textMuted }}>Earned</p>
                </div>
            </motion.div>

            {/* Referral List */}
            {referrals.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-4 pt-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1" style={{ color: colors.textMuted }}>Your Status List</h3>
                    <div className="space-y-3">
                        {referrals.map((ref, i) => (
                            <motion.div
                                key={ref._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.06 }}
                                style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                                className="rounded-2xl p-4 flex items-center gap-4 shadow-sm"
                            >
                                <div style={{ background: ref.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }} className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                                    <UserPlus className={`w-5 h-5 ${ref.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black uppercase tracking-tight italic truncate" style={{ color: colors.text }}>{ref.referredName}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-40" style={{ color: colors.textMuted }}>
                                        {ref.status === 'COMPLETED' ? 'BOOKING SECURED' : 'INVITATION SENT'}
                                    </p>
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg ${ref.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                    {ref.status === 'COMPLETED' ? `+${ref.rewardPoints} PTS` : 'PENDING'}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
