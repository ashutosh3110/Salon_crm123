import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import {
    Calendar, Star, Users, ChevronRight, LogOut,
    Shield, HelpCircle, Edit3, Loader2,
    TrendingUp, TrendingDown, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import LoyaltyCard from '../../components/app/LoyaltyCard';
import {
    MOCK_LOYALTY_WALLET, MOCK_LOYALTY_RULES, MOCK_LOYALTY_TRANSACTIONS
} from '../../data/appMockData';

export default function AppProfilePage() {
    const { customer, updateCustomer, customerLogout } = useCustomerAuth();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const [form, setForm] = useState({
        name: customer?.name || '',
        email: customer?.email || '',
        gender: customer?.gender || '',
        birthday: customer?.birthday || '',
    });

    // Loyalty Data
    const wallet = MOCK_LOYALTY_WALLET;
    const rules = MOCK_LOYALTY_RULES;
    const transactions = MOCK_LOYALTY_TRANSACTIONS;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // TODO: Replace with api.patch('/clients/:id', form)
            await new Promise(r => setTimeout(r, 800));
            updateCustomer(form);
            setEditing(false);
        } catch {
            console.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const quickLinks = [
        { icon: Calendar, label: 'My Bookings', path: '/app/bookings', color: 'text-blue-500 bg-blue-500/10' },
        { icon: Users, label: 'Refer Friends', path: '/app/referrals', color: 'text-emerald-500 bg-emerald-500/10' },
    ];

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
    const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 px-4 pb-8" style={{ background: '#141414', minHeight: '100svh' }}>
            {/* Header */}
            <div className="pt-12 pb-2">
                <h1 className="text-2xl font-black text-white">Profile</h1>
                <p className="text-xs text-white/40">Manage your account and rewards</p>
            </div>

            {/* Profile Card */}
            <motion.div variants={fadeUp} className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-5">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C8956C]/20 to-[#C8956C]/10 flex items-center justify-center shrink-0 border border-[#C8956C]/20">
                        <span className="text-xl font-black text-[#C8956C]">{getInitials(customer?.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-white truncate">{customer?.name || 'Customer'}</h2>
                        <p className="text-xs text-white/40">{customer?.phone ? `+91 ${customer.phone}` : ''}</p>
                        {customer?.email && <p className="text-xs text-white/40">{customer.email}</p>}
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditing(!editing)}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5"
                    >
                        <Edit3 className="w-4 h-4 text-white/60" />
                    </motion.button>
                </div>

                {/* Edit Form */}
                {editing && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="mt-4 pt-4 border-t border-border/40 space-y-3 overflow-hidden"
                    >
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase mb-1.5 block tracking-widest">Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#141414] text-white text-sm focus:outline-none focus:border-[#C8956C] transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase mb-1.5 block tracking-widest">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#141414] text-white text-sm focus:outline-none focus:border-[#C8956C] transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase mb-1.5 block tracking-widest">Gender</label>
                            <div className="flex gap-2">
                                {['female', 'male', 'other'].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setForm({ ...form, gender: g })}
                                        className={`flex-1 py-3 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all ${form.gender === g
                                            ? 'border-[#C8956C] bg-[#C8956C]/10 text-[#C8956C]'
                                            : 'border-white/10 bg-[#141414] text-white/60'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase mb-1.5 block tracking-widest">Birthday</label>
                            <input
                                type="date"
                                value={form.birthday}
                                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#141414] text-white text-sm focus:outline-none focus:border-[#C8956C] transition-all"
                            />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setEditing(false)}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-[11px] font-black uppercase text-white/60 hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl bg-[#C8956C] text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-lg shadow-[#C8956C]/20 transition-all"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Loyalty Section */}
            <motion.div variants={fadeUp} className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Loyalty Rewards</h3>
                </div>

                <LoyaltyCard points={wallet.totalPoints} redeemRate={rules.redeemRate} />

                <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 text-center">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Earn Rate</p>
                        <p className="text-xl font-black text-emerald-500">{rules.earnRate}x</p>
                        <p className="text-[9px] text-white/30 italic mt-1">point per ₹1</p>
                    </div>
                    <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 text-center">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Redeem Value</p>
                        <p className="text-xl font-black text-[#C8956C]">₹{rules.redeemRate}</p>
                        <p className="text-[9px] text-white/30 italic mt-1">per point</p>
                    </div>
                </div>

                {/* How It Works (Expandable) */}
                <div className="bg-[#1A1A1A] rounded-xl border border-white/5 overflow-hidden">
                    <button
                        onClick={() => setShowHowItWorks(!showHowItWorks)}
                        className="w-full flex items-center justify-between p-4"
                    >
                        <span className="flex items-center gap-2 text-[11px] font-black uppercase text-white tracking-wider">
                            <Info className="w-4 h-4 text-[#C8956C]" /> How It Works
                        </span>
                        {showHowItWorks ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                    </button>

                    {showHowItWorks && (
                        <div className="px-4 pb-5 space-y-3.5 border-t border-white/5 pt-4">
                            <div className="flex gap-3 items-start">
                                <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 text-[10px] font-black text-emerald-500 border border-emerald-500/20">1</span>
                                <p className="text-[11px] text-white/60 leading-relaxed">Earn <span className="text-white font-bold">{rules.earnRate} point</span> for every ₹1 spent</p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="w-6 h-6 rounded-full bg-[#C8956C]/10 flex items-center justify-center shrink-0 text-[10px] font-black text-[#C8956C] border border-[#C8956C]/20">2</span>
                                <p className="text-[11px] text-white/60 leading-relaxed">Redeem at <span className="text-white font-bold">₹{rules.redeemRate}/point</span>. Min <span className="text-white font-bold">{rules.minRedeemPoints} pts</span></p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Recent Activity</p>
                    {transactions.slice(0, 3).map((tx) => (
                        <div key={tx._id} className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'EARN' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-[#C8956C]/10 border border-[#C8956C]/20'}`}>
                                {tx.type === 'EARN' ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-[#C8956C]" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-[12px] font-bold text-white truncate">{tx.metadata?.serviceName || tx.type}</p>
                                <p className="text-[10px] text-white/40">{formatDate(tx.createdAt)}</p>
                            </div>
                            <span className={`text-sm font-black tracking-tighter ${tx.points > 0 ? 'text-emerald-500' : 'text-[#C8956C]'}`}>
                                {tx.points > 0 ? '+' : ''}{tx.points}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeUp} className="space-y-3">
                {quickLinks.map((link) => (
                    <motion.button
                        key={link.path}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(link.path)}
                        className="w-full flex items-center gap-4 bg-[#1A1A1A] rounded-xl border border-white/5 p-4 hover:bg-white/5 transition-all"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${link.color} bg-white/5`}>
                            <link.icon className="w-6 h-6" />
                        </div>
                        <span className="text-[13px] font-black uppercase tracking-wider text-white flex-1 text-left">{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                    </motion.button>
                ))}
            </motion.div>

            {/* Support & Legal */}
            <motion.div variants={fadeUp} className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                <button className="w-full flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                    <HelpCircle className="w-5 h-5 text-white/40" />
                    <span className="text-sm font-bold text-white/60 flex-1 text-left">Help & Support</span>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                </button>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                    <Shield className="w-5 h-5 text-white/40" />
                    <span className="text-sm font-bold text-white/60 flex-1 text-left">Privacy Policy</span>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                </button>
            </motion.div>

            {/* Logout */}
            <motion.div variants={fadeUp}>
                {!showLogoutConfirm ? (
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-red-500/20 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 transition-all"
                    >
                        <LogOut className="w-4 h-4" /> Log Out
                    </button>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                        <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="flex-1 py-4 rounded-xl border border-white/10 text-[11px] font-black uppercase text-white/60"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={customerLogout}
                            className="flex-1 py-4 rounded-xl bg-red-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                        >
                            Yes, Log Out
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* App Version */}
            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/20 pb-4">Glamour Studio v1.0.0</p>
        </motion.div>
    );
}
