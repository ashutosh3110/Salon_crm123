import { useState, useEffect, useMemo } from 'react';
import {
    Bell,
    Calendar,
    Settings,
    Share2,
    Copy,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
    Search,
    Plus,
    Trash2,
    MessageSquare,
    Instagram,
    Facebook,
    QrCode,
    ExternalLink,
    AlertCircle,
    Save,
    RefreshCw,
    Scissors,
    Sparkles,
    ArrowRight,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

/* ─── Mock Data & Seeds ────────────────────────────────────────────────── */

const MOCK_BRIDAL_BOOKINGS = [
    {
        id: 'br-1',
        clientName: 'Ishika Malhotra',
        eventName: 'Wedding Ceremony',
        eventDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        service: 'Full Bridal Transformation',
        reminders: [
            { id: 'rem-30d', label: '30 Days Before', daysBefore: 30, status: 'missed', active: true },
            { id: 'rem-7d', label: '7 Days Before', daysBefore: 7, status: 'scheduled', active: true },
            { id: 'rem-1d', label: '1 Day Before', daysBefore: 1, status: 'scheduled', active: true },
            { id: 'rem-2h', label: '2 Hours Before', daysBefore: 0.1, status: 'scheduled', active: true },
        ]
    },
    {
        id: 'br-2',
        clientName: 'Sanya Gupta',
        eventName: 'Mehendi Night',
        eventDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        service: 'Mehendi & Sangeet Package',
        reminders: [
            { id: 'rem-30d', label: '30 Days Before', daysBefore: 30, status: 'sent', active: true },
            { id: 'rem-7d', label: '7 Days Before', daysBefore: 7, status: 'sent', active: true },
            { id: 'rem-1d', label: '1 Day Before', daysBefore: 1, status: 'scheduled', active: true },
            { id: 'rem-2h', label: '2 Hours Before', daysBefore: 0.1, status: 'scheduled', active: true },
        ]
    }
];

const DEFAULT_REMINDER_RULES = [
    { id: 'rule-1', category: 'Hair Color', interval: 30, channel: 'WhatsApp', active: true, message: 'Hi {name}, it\'s time for your Hair Color refresh! Book your slot now at {link}.' },
    { id: 'rule-2', category: 'Facial', interval: 45, channel: 'Email', active: true, message: 'Hello {name}, keep that glow! You are due for your next Facial. Book here: {link}.' },
    { id: 'rule-3', category: 'Keratin', interval: 90, channel: 'WhatsApp', active: false, message: 'Hey {name}, your Keratin treatment might need a touch-up soon. See our slots: {link}.' }
];

const MOCK_PENDING_CLIENTS = [
    { id: 'cl-1', name: 'Tanvi Shah', lastVisit: new Date(Date.now() - 35 * 86400000).toISOString(), service: 'Root Touchup', dueIn: -5 },
    { id: 'cl-2', name: 'Preeti Deshmukh', lastVisit: new Date(Date.now() - 40 * 86400000).toISOString(), service: 'Gold Facial', dueIn: 5 },
    { id: 'cl-3', name: 'Riya Varma', lastVisit: new Date(Date.now() - 85 * 86400000).toISOString(), service: 'Keratin Treatment', dueIn: 5 }
];

/* ─── Components ───────────────────────────────────────────────────────── */

function TabButton({ active, label, icon: Icon, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-4 rounded-none border-2 transition-all font-black text-[10px] uppercase tracking-[0.2em] transform active:scale-95 ${active
                ? 'bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20 -translate-y-1'
                : 'bg-surface border-border text-text-muted hover:border-primary/30 hover:text-text'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}

function SectionHeader({ title, desc, icon: Icon }) {
    return (
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/5 border border-primary/20 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left font-black">
                <h2 className="text-xl text-text uppercase tracking-tight leading-none mb-1">{title}</h2>
                <p className="text-[10px] text-text-muted uppercase tracking-widest opacity-60 leading-none">{desc}</p>
            </div>
        </div>
    );
}

/* ─── Main Page ────────────────────────────────────────────────────────── */

export default function RemindersPage() {
    const [activeTab, setActiveTab] = useState('bridal');
    const [loading, setLoading] = useState(true);
    const [copyStatus, setCopyStatus] = useState(false);

    // Data states
    const [bridalBookings, setBridalBookings] = useState([]);
    const [reminderRules, setReminderRules] = useState([]);
    const [pendingClients, setPendingClients] = useState([]);
    const [bookingSettings, setBookingSettings] = useState({
        salonSlug: 'premium-salon-bandra',
        welcomeMsg: 'Welcome to our premium salon. Book your next visit below.',
        showServices: true
    });

    useEffect(() => {
        // Load from localStorage or initialize
        const storedBridal = localStorage.getItem('bridal_reminders');
        const storedRules = localStorage.getItem('reminder_rules');
        const storedSettings = localStorage.getItem('booking_settings');

        setBridalBookings(storedBridal ? JSON.parse(storedBridal) : MOCK_BRIDAL_BOOKINGS);
        setReminderRules(storedRules ? JSON.parse(storedRules) : DEFAULT_REMINDER_RULES);
        setBookingSettings(storedSettings ? JSON.parse(storedSettings) : {
            salonSlug: 'premium-salon-bandra',
            welcomeMsg: 'Welcome to our premium salon. Book your next visit below.',
            showServices: true
        });
        setPendingClients(MOCK_PENDING_CLIENTS);

        setLoading(false);
    }, []);

    const persistBridal = (data) => {
        setBridalBookings(data);
        localStorage.setItem('bridal_reminders', JSON.stringify(data));
    };

    const persistRules = (data) => {
        setReminderRules(data);
        localStorage.setItem('reminder_rules', JSON.stringify(data));
    };

    const persistSettings = (data) => {
        setBookingSettings(data);
        localStorage.setItem('booking_settings', JSON.stringify(data));
    };

    const bookingURL = `${window.location.origin}/app/book?salon=${bookingSettings.salonSlug}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(bookingURL);
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    };

    const toggleReminder = (bookingId, remId) => {
        const updated = bridalBookings.map(b => {
            if (b.id === bookingId) {
                return {
                    ...b,
                    reminders: b.reminders.map(r => r.id === remId ? { ...r, active: !r.active } : r)
                };
            }
            return b;
        });
        persistBridal(updated);
    };

    const toggleRule = (id) => {
        const updated = reminderRules.map(r => r.id === id ? { ...r, active: !r.active } : r);
        persistRules(updated);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-reveal font-black">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Reminders</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none text-left">Automatically remind clients about important visits.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                <TabButton
                    active={activeTab === 'bridal'}
                    label="Bridal Reminders"
                    icon={Sparkles}
                    onClick={() => setActiveTab('bridal')}
                />
                <TabButton
                    active={activeTab === 'service'}
                    label="Service Reminders"
                    icon={Bell}
                    onClick={() => setActiveTab('service')}
                />
                <TabButton
                    active={activeTab === 'link'}
                    label="Booking Link"
                    icon={QrCode}
                    onClick={() => setActiveTab('link')}
                />
                <TabButton
                    active={activeTab === 'social'}
                    label="Social Sharing"
                    icon={Share2}
                    onClick={() => setActiveTab('social')}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[500px]"
                >
                    {/* 1. BRIDAL REMINDERS */}
                    {activeTab === 'bridal' && (
                        <div className="space-y-6">
                            <SectionHeader
                                title="Bridal reminders"
                                desc="Stay on top of wedding bookings with gentle follow-ups."
                                icon={Sparkles}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {bridalBookings.map((booking) => (
                                    <div key={booking.id} className="bg-surface border border-border p-8 shadow-sm hover:shadow-xl transition-all group relative">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 border-b border-l border-primary/20 flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-primary group-hover:scale-125 transition-transform" />
                                        </div>

                                        <div className="mb-6 text-left">
                                            <h3 className="text-lg font-black text-text uppercase tracking-tight mb-1">{booking.clientName}</h3>
                                            <p className="text-[11px] text-primary font-black uppercase tracking-widest">{booking.service}</p>
                                            <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mt-3 bg-background inline-block px-3 py-1 border border-border">
                                                Event Date: {new Date(booking.eventDate).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            {booking.reminders.map((rem) => (
                                                <div key={rem.id} className="flex items-center justify-between p-4 bg-background border border-border group/rem">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-2 h-2 rounded-none ${rem.status === 'sent' ? 'bg-emerald-500' : rem.status === 'missed' ? 'bg-rose-500' : 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)] animate-pulse'}`} />
                                                        <div className="text-left">
                                                            <p className="text-[10px] font-black text-text uppercase tracking-widest">{rem.label}</p>
                                                            <p className="text-[8px] text-text-muted uppercase tracking-[0.1em] mt-0.5">{rem.status.toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleReminder(booking.id, rem.id)}
                                                        className={`px-4 py-1.5 rounded-none text-[8px] font-black uppercase tracking-widest border transition-all ${rem.active ? 'bg-primary/5 text-primary border-primary/20' : 'bg-slate-100 dark:bg-surface-alt text-slate-400 dark:text-text-muted border-slate-200 dark:border-border/40'}`}
                                                    >
                                                        {rem.active ? 'ENABLED' : 'DISABLED'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. SERVICE REMINDERS */}
                    {activeTab === 'service' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Rules Section */}
                            <div className="space-y-6">
                                <SectionHeader
                                    title="Automatic Rules"
                                    desc="Logic patterns for recurring client visits"
                                    icon={Settings}
                                />

                                <div className="space-y-4">
                                    {reminderRules.map((rule) => (
                                        <div key={rule.id} className="bg-surface border border-border p-6 shadow-sm flex flex-col gap-4 text-left">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/5 border border-primary/20 flex items-center justify-center">
                                                        <Scissors className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black text-text uppercase tracking-tight">{rule.category}</h4>
                                                        <span className="text-[9px] text-text-muted uppercase tracking-widest">Every {rule.interval} Days via {rule.channel}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleRule(rule.id)}
                                                    className={`px-6 py-2 rounded-none text-[9px] font-black uppercase tracking-widest border transition-all ${rule.active ? 'bg-primary border-primary text-primary-foreground shadow-lg' : 'bg-background dark:bg-surface-alt border-border text-text-muted'}`}
                                                >
                                                    {rule.active ? 'ACTIVE' : 'INACTIVE'}
                                                </button>
                                            </div>
                                            <textarea
                                                className="bg-background border border-border px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted/60 resize-none outline-none focus:border-primary transition-all h-20"
                                                defaultValue={rule.message}
                                                readOnly
                                            />
                                        </div>
                                    ))}

                                    <button className="w-full py-4 border-2 border-dashed border-border text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-3 font-black">
                                        <Plus className="w-4 h-4" /> Add Protocol Rule
                                    </button>
                                </div>
                            </div>

                            {/* Pending System */}
                            <div className="space-y-6">
                                <SectionHeader
                                    title="Pending Signals"
                                    desc="Clients identified for immediate re-engagement"
                                    icon={Clock}
                                />

                                <div className="bg-surface border border-border overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-background border-b border-border">
                                            <tr>
                                                <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Identity</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Protocol</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {pendingClients.map((client) => (
                                                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-surface-alt/50 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col text-left">
                                                            <span className="text-[11px] font-black text-text uppercase tracking-tight">{client.name}</span>
                                                            <span className="text-[8px] text-text-muted uppercase">Last: {new Date(client.lastVisit).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{client.service}</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <span className={`text-[9px] font-black uppercase px-3 py-1 border ${client.dueIn < 0 ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'}`}>
                                                            {client.dueIn < 0 ? `${Math.abs(client.dueIn)}d Overdue` : `Due in ${client.dueIn}d`}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. BOOKING LINK SYSTEM */}
                    {activeTab === 'link' && (
                        <div className="max-w-4xl mx-auto space-y-12">
                            <SectionHeader
                                title="Booking Gateway"
                                desc="Provision public access points for automated scheduling"
                                icon={QrCode}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                <div className="md:col-span-3 space-y-8">
                                    <div className="bg-surface border border-border p-10 shadow-sm text-left relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-1 h-full bg-primary" />
                                        <h3 className="text-sm font-black text-text uppercase tracking-[0.2em] mb-4">Master Proxy Link</h3>
                                        <div className="flex items-center gap-2 bg-background border border-border p-3">
                                            <code className="text-[10px] font-black text-primary flex-1 truncate">{bookingURL}</code>
                                            <button
                                                onClick={handleCopyLink}
                                                className={`p-3 rounded-none transition-all flex items-center gap-2 ${copyStatus ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                                            >
                                                {copyStatus ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-text-muted uppercase tracking-[0.3em] mt-4 italic opacity-40">Embed this link in your social bios and marketing SMS.</p>
                                    </div>

                                    <div className="bg-background border border-border p-10 text-left space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Settings className="w-4 h-4 text-primary" />
                                            <h4 className="text-[10px] font-black text-text uppercase tracking-widest">Link Configuration</h4>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">System Slug</label>
                                                <input
                                                    type="text"
                                                    value={bookingSettings.salonSlug}
                                                    onChange={(e) => persistSettings({ ...bookingSettings, salonSlug: e.target.value })}
                                                    className="w-full bg-surface border border-border px-6 py-4 text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Portal Greeting</label>
                                                <input
                                                    type="text"
                                                    value={bookingSettings.welcomeMsg}
                                                    onChange={(e) => persistSettings({ ...bookingSettings, welcomeMsg: e.target.value })}
                                                    className="w-full bg-surface border border-border px-6 py-4 text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-white dark:bg-white/95 border border-border p-12 shadow-2xl flex flex-col items-center text-center">
                                        <div className="p-6 bg-white border border-border mb-8 shadow-inner">
                                            <QRCodeSVG value={bookingURL} size={200} level="M" />
                                        </div>
                                        <h3 className="text-xs font-black text-text uppercase tracking-[0.3em] mb-2 dark:text-slate-900">Physical Access Unit</h3>
                                        <p className="text-[9px] text-text-muted uppercase tracking-widest opacity-50 mb-8 dark:text-slate-500">Download and print for reception desks and windows</p>
                                        <button className="w-full bg-slate-900 text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-3">
                                            <Save className="w-4 h-4" /> Download Vector
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. SOCIAL LOGIC */}
                    {activeTab === 'social' && (
                        <div className="max-w-5xl mx-auto space-y-12">
                            <SectionHeader
                                title="Platform Dissemination"
                                desc="Broadcasting scheduling links across social signal clusters"
                                icon={Share2}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { platform: 'Instagram', icon: Instagram, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', desc: 'Optimize for Bio & Stories', action: 'Copy Bio Template' },
                                    { platform: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Broadcast to Broadcast Lists', action: 'Send Signal' },
                                    { platform: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', desc: 'Sync with Meta Page Insights', action: 'Share Link' },
                                ].map((p) => (
                                    <div key={p.platform} className={`bg-surface border p-8 shadow-sm hover:shadow-2xl transition-all group ${p.border} flex flex-col items-center text-center`}>
                                        <div className={`w-16 h-16 ${p.bg} ${p.color} border border-current/20 flex items-center justify-center mb-6`}>
                                            <p.icon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-black text-text uppercase tracking-tighter mb-2">{p.platform}</h3>
                                        <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] mb-10 opacity-60 font-black">{p.desc}</p>
                                        <button className={`w-full py-5 border ${p.color} ${p.bg} text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3`}>
                                            {p.action} <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-surface border border-border p-12 text-left relative overflow-hidden">
                                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-text uppercase tracking-tight">Social Bio Blueprint</h3>
                                        <p className="text-[10px] text-text-muted uppercase tracking-[0.3em] leading-relaxed">
                                            Copy this optimized text for your Instagram or WhatsApp bio to maximize conversion rate from visitor to booking.
                                        </p>
                                        <div className="bg-background border border-border p-6 font-black space-y-3">
                                            <p className="text-[11px] text-text-secondary uppercase">✨ Luxury Salon Experience</p>
                                            <p className="text-[11px] text-text-secondary uppercase">✂️ Expert Hair & Skin Care</p>
                                            <p className="text-[11px] text-text-secondary uppercase">📅 Rapid Appt Booking Link ⬇️</p>
                                            <p className="text-[11px] text-primary">{bookingURL}</p>
                                        </div>
                                        <button
                                            onClick={handleCopyLink}
                                            className="px-10 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center gap-3"
                                        >
                                            <Copy className="w-4 h-4" /> Copy Blueprint
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { l: 'Click Conversion', v: '84%', i: TrendingUp },
                                            { l: 'Direct Signals', v: '312', i: MessageSquare },
                                            { l: 'Engagement Hub', v: 'High', i: User },
                                            { l: 'System Status', v: 'Active', i: RefreshCw },
                                        ].map(s => (
                                            <div key={s.l} className="bg-background border border-border p-6 space-y-4">
                                                <s.i className="w-5 h-5 text-primary opacity-40" />
                                                <div className="flex flex-col text-left">
                                                    <span className="text-xl font-black text-text tracking-tighter">{s.v}</span>
                                                    <span className="text-[8px] text-text-muted uppercase tracking-widest">{s.l}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
