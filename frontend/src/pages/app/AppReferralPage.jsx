import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Copy, Share2, Check, UserPlus, MapPin, ChevronLeft } from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBusiness } from '../../contexts/BusinessContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

export default function AppReferralPage() {
    const navigate = useNavigate();
    const { customer } = useCustomerAuth();
    const { colors: themeColors, isLight } = useCustomerTheme();
    const { activeOutlet } = useBusiness();
    const [copied, setCopied] = useState(false);
    const [referrals, setReferrals] = useState([]);
    const [settings, setSettings] = useState({
        enabled: true,
        referrerReward: 200,
        referredReward: 100,
        redeemRate: 1,
        minRedeemPoints: 0,
        threshold: 'FIRST_SERVICE',
        expiryDays: 90,
    });

    const colors = useMemo(() => ({
        bg: '#FFFFFF',
        card: '#FFFFFF',
        text: themeColors.text || '#1A1A1A',
        textMuted: themeColors.textMuted || '#666',
        border: themeColors.border || 'rgba(0,0,0,0.08)',
        toggle: themeColors.input || '#F5F5F5',
        accent: themeColors.accent || '#B4912B',
    }), [themeColors]);

    useEffect(() => {
        const fetchReferralData = async () => {
            try {
                const [settingsRes, referralsRes] = await Promise.all([
                    api.get('/loyalty/rules'),
                    api.get('/loyalty/referrals/me'),
                ]);

                if (settingsRes.data?.success) {
                    const data = settingsRes.data.data;
                    setSettings({
                        enabled: data.active ?? true,
                        referrerReward: data.referralPoints || 200,
                        referredReward: data.referredPoints || 100,
                        pointsRate: data.pointsRate || 10,
                        redeemValue: data.redeemValue || 1,
                        redeemRate: data.redeemValue || 1,
                        minRedeemPoints: data.minRedeemPoints || 0,
                        threshold: 'FIRST_SERVICE',
                        expiryDays: 90,
                    });
                }
                if (referralsRes.data?.success) {
                    setReferrals(referralsRes.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch referral data:', err);
            }
        };

        fetchReferralData();
    }, []);

    const triggerLabel = useMemo(() => {
        if (settings.threshold === 'REGISTRATION') return 'after signup';
        if (settings.threshold === 'FIRST_INVOICE_MIN_1000') return 'after first bill above Rs. 1000';
        return 'after first service';
    }, [settings.threshold]);

    // Use the real referral code from customer data
    const referralCode = customer?.referralCode || `WAP-XXXX`;
    const referralLink = `${window.location.origin}/app/login?ref=${referralCode}`;

    const completedCount = referrals.filter(r => r.status === 'COMPLETED').length;
    const pendingCount = referrals.filter(r => r.status === 'PENDING').length;
    const totalEarned = referrals.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.rewardPoints, 0);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true);
            toast.success('Referral code copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const el = document.createElement('textarea');
            el.value = referralCode;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            toast.success('Referral code copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            toast.success('Referral link copied!');
        } catch {
            const el = document.createElement('textarea');
            el.value = referralLink;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            toast.success('Referral link copied!');
        }
    };

    const handleShare = async () => {
        const salonName = activeOutlet?.name || 'Wapixo Signature';
        const shareData = {
            title: `Join ${salonName}`,
            text: `Use my referral code ${referralCode} to get ${settings.referredReward} points when you sign up at ${salonName}!`,
            url: referralLink,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                toast.success('Shared successfully!');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
    const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <div style={{ background: '#FFFFFF', minHeight: '100vh' }} className="pb-10 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between" style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent active:bg-gray-200/50 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
                </button>
                <h1 className="text-lg font-bold text-center flex-1 pr-10" style={{ color: colors.text }}>Refer & Earn</h1>
            </div>

            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 px-4 pt-4">

                <motion.div variants={fadeUp} className="flex items-center gap-4">
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: colors.card,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        border: `1.5px solid ${colors.border}`
                    }}>
                        <MapPin size={20} style={{ color: colors.accent }} />
                    </div>
                    <div>
                        <p style={{ fontSize: '9px', fontWeight: 950, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Exclusive Referral Program</p>
                        <h2 style={{ fontSize: '15px', fontWeight: 800, color: colors.text, margin: 0 }}>{activeOutlet?.name || 'Wapixo Boutique'}</h2>
                    </div>
                </motion.div>

                {/* Hero Card */}
                <motion.div
                    variants={fadeUp}
                    style={{
                        background: colors.card,
                        borderRadius: '18px',
                        padding: '20px 24px',
                        border: `1.5px dashed ${colors.accent}`,
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div className="relative z-10">
                        <p style={{ fontSize: '10px', color: colors.textMuted, margin: '0 0 6px', fontWeight: 600 }}>Premium Rewards</p>
                        <h3 className="text-lg font-extrabold mb-3" style={{ color: colors.text, lineHeight: 1.3 }}>
                            Earn {settings.referrerReward} Points<br />
                            <span style={{ color: colors.accent }}>per successful referral</span>
                        </h3>

                        <div className="flex gap-6 mb-4 border-t border-b py-3" style={{ borderColor: colors.border }}>
                            <div className="flex flex-col">
                                <span style={{ fontSize: '8px', fontWeight: 900, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Value</span>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: colors.text }}>{settings.pointsRate} PT = ₹{settings.redeemValue}</span>
                            </div>
                            <div className="flex flex-col">
                                <span style={{ fontSize: '8px', fontWeight: 900, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min. Redeem</span>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: colors.text }}>{settings.minRedeemPoints} PTS</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '10px', color: colors.textMuted, opacity: 0.9, margin: 0 }}>
                            Friend gets {settings.referredReward} points {triggerLabel}. Reward valid for {settings.expiryDays || 90} days.
                        </p>
                    </div>
                </motion.div>

                {/* Referral Code */}
                <motion.div
                    variants={fadeUp}
                    style={{
                        background: colors.card,
                        border: `1.5px dashed ${colors.accent}`,
                        borderRadius: '18px'
                    }}
                    className="p-5 space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                >
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Your Referral Code</p>
                    <div className="flex items-center gap-3">
                        <div style={{ background: colors.toggle, borderRadius: '12px', borderColor: colors.accent }} className="flex-1 px-3 py-3 border border-dashed text-center">
                            <span className="text-lg font-extrabold tracking-[0.3em] uppercase" style={{ color: colors.accent }}>{referralCode}</span>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCopyCode}
                            style={{ background: colors.toggle, border: `1px solid ${colors.border}`, borderRadius: '12px' }}
                            className="w-12 h-12 flex items-center justify-center transition-colors shrink-0"
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
                        disabled={!settings.enabled}
                        style={{ background: colors.accent }}
                        className="w-full py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                        <Share2 className="w-3.5 h-3.5" /> {settings.enabled ? 'Invite Your Inner Circle' : 'Referral Program Disabled'}
                    </motion.button>
                </motion.div>

                {/* Stats */}
                <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                    <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-2xl p-4 text-center shadow-sm">
                        <p className="text-xl font-black italic tracking-tighter" style={{ color: colors.text }}>{completedCount + pendingCount}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-80" style={{ color: colors.text }}>Referred</p>
                    </div>
                    <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-2xl p-4 text-center shadow-sm">
                        <p className="text-xl font-black italic tracking-tighter text-emerald-500">{completedCount}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-80" style={{ color: colors.text }}>Joined</p>
                    </div>
                    <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-2xl p-4 text-center shadow-sm">
                        <p className="text-xl font-black italic tracking-tighter" style={{ color: colors.accent }}>{totalEarned}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-80" style={{ color: colors.text }}>Earned</p>
                    </div>
                </motion.div>

                {/* Referral List */}
                {referrals.length > 0 && (
                    <motion.div variants={fadeUp} className="space-y-4 pt-2">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 px-1" style={{ color: colors.text }}>Your Status List</h3>
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
                                        <p className="text-sm font-bold truncate" style={{ color: colors.text }}>{ref.referredName}</p>
                                        <p className="text-[9px] font-bold tracking-wider mt-0.5" style={{ color: colors.textMuted }}>
                                            {ref.status === 'COMPLETED' ? 'BOOKING SECURED' : 'INVITATION SENT'}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg ${ref.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                        {ref.status === 'COMPLETED' ? `+${ref.rewardPoints} PTS` : 'PENDING'}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
