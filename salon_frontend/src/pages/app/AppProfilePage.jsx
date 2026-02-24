import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Star, Users, ChevronRight, LogOut, Shield, HelpCircle, Edit3, Loader2 } from 'lucide-react';

export default function AppProfilePage() {
    const { customer, updateCustomer, customerLogout } = useCustomerAuth();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [form, setForm] = useState({
        name: customer?.name || '',
        email: customer?.email || '',
        gender: customer?.gender || '',
        birthday: customer?.birthday || '',
    });

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
        { icon: Star, label: 'Loyalty Points', path: '/app/loyalty', color: 'text-amber-500 bg-amber-500/10' },
        { icon: Users, label: 'Refer Friends', path: '/app/referrals', color: 'text-emerald-500 bg-emerald-500/10' },
    ];

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
    const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
            {/* Profile Card */}
            <motion.div variants={fadeUp} className="bg-surface rounded-2xl border border-border/60 p-5">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-lg font-extrabold text-primary">{getInitials(customer?.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-extrabold text-text truncate">{customer?.name || 'Customer'}</h2>
                        <p className="text-xs text-text-muted">{customer?.phone ? `+91 ${customer.phone}` : ''}</p>
                        {customer?.email && <p className="text-xs text-text-muted">{customer.email}</p>}
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditing(!editing)}
                        className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center hover:bg-surface-alt transition-colors"
                    >
                        <Edit3 className="w-4 h-4 text-text-secondary" />
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
                            <label className="text-[10px] font-bold text-text-muted uppercase mb-1 block">Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-text-muted uppercase mb-1 block">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="your@email.com"
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-text-muted uppercase mb-1.5 block">Gender</label>
                            <div className="flex gap-2">
                                {['female', 'male', 'other'].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setForm({ ...form, gender: g })}
                                        className={`flex-1 py-2 rounded-lg border text-xs font-bold capitalize transition-all ${form.gender === g
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-border bg-surface text-text-secondary dark:bg-surface-alt'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-text-muted uppercase mb-1 block">Birthday</label>
                            <input
                                type="date"
                                value={form.birthday}
                                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setEditing(false)}
                                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-text-secondary hover:bg-surface transition-colors"
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-sm transition-all"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeUp} className="space-y-2">
                {quickLinks.map((link) => (
                    <motion.button
                        key={link.path}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(link.path)}
                        className="w-full flex items-center gap-3 bg-surface rounded-xl border border-border/60 p-3.5 hover:shadow-sm transition-all"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${link.color}`}>
                            <link.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-text flex-1 text-left">{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-text-muted" />
                    </motion.button>
                ))}
            </motion.div>

            {/* Support & Legal */}
            <motion.div variants={fadeUp} className="bg-surface rounded-2xl border border-border/60 overflow-hidden">
                <button className="w-full flex items-center gap-3 p-3.5 border-b border-border/30 hover:bg-surface/50 transition-colors">
                    <HelpCircle className="w-5 h-5 text-text-muted" />
                    <span className="text-sm text-text-secondary flex-1 text-left">Help & Support</span>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                </button>
                <button className="w-full flex items-center gap-3 p-3.5 hover:bg-surface/50 transition-colors">
                    <Shield className="w-5 h-5 text-text-muted" />
                    <span className="text-sm text-text-secondary flex-1 text-left">Privacy Policy</span>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                </button>
            </motion.div>

            {/* Logout */}
            <motion.div variants={fadeUp}>
                {!showLogoutConfirm ? (
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200/50 text-sm font-bold text-red-500 hover:bg-red-500/5 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Log Out
                    </button>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                        <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-text-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={customerLogout}
                            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold shadow-sm"
                        >
                            Yes, Log Out
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* App Version */}
            <p className="text-center text-[10px] text-text-muted pb-4">Glamour Studio v1.0.0</p>
        </motion.div>
    );
}
