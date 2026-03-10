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
    TrendingUp,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { createPortal } from 'react-dom';

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

    // Modals
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [showBridalModal, setShowBridalModal] = useState(false);

    // Form States
    const [newRule, setNewRule] = useState({ category: '', interval: 30, channel: 'WhatsApp', message: "Hi {name}, it's time for your {category}! Book your slot: {link}" });
    const [newBridal, setNewBridal] = useState({ clientName: '', clientPhone: '', eventName: '', eventDate: '', service: '' });

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

    const handleAddRule = (e) => {
        e.preventDefault();
        const rule = {
            id: `rule-${Date.now()}`,
            ...newRule,
            active: true
        };
        persistRules([...reminderRules, rule]);
        setShowRuleModal(false);
        setNewRule({ category: '', interval: 30, channel: 'WhatsApp', message: "Hi {name}, it's time for your {category}! Book your slot: {link}" });
    };

    const handleAddBridal = (e) => {
        e.preventDefault();
        if (!newBridal.clientName || !newBridal.clientPhone || !newBridal.eventDate) return;
        const booking = {
            id: `br-${Date.now()}`,
            ...newBridal,
            reminders: [
                { id: `rem-30d-${Date.now()}`, label: '30 Days Before', daysBefore: 30, status: 'scheduled', active: true },
                { id: `rem-7d-${Date.now()}`, label: '7 Days Before', daysBefore: 7, status: 'scheduled', active: true },
                { id: `rem-1d-${Date.now()}`, label: '1 Day Before', daysBefore: 1, status: 'scheduled', active: true },
            ]
        };
        persistBridal([booking, ...bridalBookings]);
        setShowBridalModal(false);
        setNewBridal({ clientName: '', clientPhone: '', eventName: '', eventDate: '', service: '' });
    };

    const sendBridalReminder = (clientPhone, clientName, eventName, remLabel) => {
        const text = `Hi ${clientName}, this is a gentle reminder regarding your upcoming ${eventName} (${remLabel}). Let us know if you need to align on anything!`;
        const phoneParam = clientPhone ? clientPhone.replace(/\D/g, '') : '';
        window.open(`https://wa.me/${phoneParam}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const sendActionHubReminder = (clientName, service) => {
        const text = `Hello ${clientName}, we noticed you might be due for your ${service}. We'd love to have you back! Shall we check available slots?`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
                            <div className="flex items-center justify-between mb-8">
                                <SectionHeader
                                    title="Bridal reminders"
                                    desc="Stay on top of wedding bookings with gentle follow-ups."
                                    icon={Sparkles}
                                />
                                <button
                                    onClick={() => setShowBridalModal(true)}
                                    className="px-6 py-4 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                                >
                                    <Plus className="w-4 h-4" /> Track Event
                                </button>
                            </div>

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
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => sendBridalReminder(booking.clientPhone, booking.clientName, booking.eventName, rem.label)}
                                                            className="px-4 py-1.5 rounded-none text-[8px] font-black uppercase tracking-widest border transition-all bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white flex items-center gap-1"
                                                        >
                                                            <MessageSquare className="w-3 h-3" /> SEND
                                                        </button>
                                                        <button
                                                            onClick={() => toggleReminder(booking.id, rem.id)}
                                                            className={`px-4 py-1.5 rounded-none text-[8px] font-black uppercase tracking-widest border transition-all ${rem.active ? 'bg-primary/5 text-primary border-primary/20 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20' : 'bg-slate-100 dark:bg-surface-alt text-slate-400 dark:text-text-muted border-slate-200 dark:border-border/40 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20'}`}
                                                        >
                                                            {rem.active ? 'ENABLED' : 'DISABLED'}
                                                        </button>
                                                    </div>
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

                                    <button onClick={() => setShowRuleModal(true)} className="w-full py-4 border-2 border-dashed border-border text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-3 font-black">
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
                                                        <div className="flex items-center justify-end gap-3">
                                                            <span className={`text-[9px] font-black uppercase px-3 py-1 border ${client.dueIn < 0 ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'}`}>
                                                                {client.dueIn < 0 ? `${Math.abs(client.dueIn)}d Overdue` : `Due in ${client.dueIn}d`}
                                                            </span>
                                                            <div className="flex items-center">
                                                                <button onClick={() => setPendingClients(pendingClients.filter(c => c.id !== client.id))} className="px-3 py-1 border border-border text-[9px] font-black uppercase hover:bg-primary/10 hover:text-primary transition-all rounded-none bg-surface-alt">Mark Replied</button>
                                                                <button onClick={() => sendActionHubReminder(client.name, client.service)} className="px-3 py-1 border border-l-0 border-border bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all"><MessageSquare className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </div>
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

            {/* MODALS */}
            {typeof document !== 'undefined' ? createPortal(
                <>
                    {/* Rule Modal */}
                    <AnimatePresence>
                        {showRuleModal && (
                            <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 text-left font-black" onClick={() => setShowRuleModal(false)}>
                                <div className="bg-surface rounded-none w-full max-w-md p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-border text-left font-black" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex flex-col items-center text-center mb-8">
                                        <div className="w-20 h-20 rounded-none bg-primary/5 text-primary flex items-center justify-center mb-8 border border-primary/20 shadow-xl shadow-primary/5">
                                            <Scissors className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-2xl font-black text-text uppercase tracking-tight leading-none">Create Protocol</h2>
                                        <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.3em] opacity-60 leading-none">Initializing logic pattern</p>
                                    </div>
                                    <form onSubmit={handleAddRule} className="space-y-8 text-left font-black">
                                        <div className="space-y-3 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Trigger Category *</label>
                                            <input type="text" required value={newRule.category} onChange={e => setNewRule({ ...newRule, category: e.target.value.replace(/[^a-zA-Z\s]/g, '') })} placeholder="e.g. Hair Spa" className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 text-left">
                                            <div className="space-y-3 text-left">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Interval (Days) *</label>
                                                <input type="number" required min="1" value={newRule.interval} onChange={e => setNewRule({ ...newRule, interval: parseInt(e.target.value) || 0 })} className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" />
                                            </div>
                                            <div className="space-y-3 text-left">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Transmission Channel</label>
                                                <select value={newRule.channel} onChange={e => setNewRule({ ...newRule, channel: e.target.value })} className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                                    <option>WhatsApp</option>
                                                    <option>Email</option>
                                                    <option>SMS</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-3 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Message Template</label>
                                            <textarea required value={newRule.message} onChange={e => setNewRule({ ...newRule, message: e.target.value })} rows={3} className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black focus:border-primary outline-none transition-all resize-none placeholder:text-text-muted/10 text-text-muted" placeholder="Use {name} and {link}..." />
                                        </div>
                                        <div className="flex gap-6 pt-10 font-black">
                                            <button type="button" onClick={() => setShowRuleModal(false)} className="flex-1 py-5 rounded-none border border-border text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:bg-surface-alt transition-all">Abort</button>
                                            <button type="submit" className="flex-1 py-5 bg-primary text-primary-foreground rounded-none font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:bg-primary-dark transition-all">Save Protocol</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Bridal Modal */}
                    <AnimatePresence>
                        {showBridalModal && (
                            <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 text-left font-black" onClick={() => setShowBridalModal(false)}>
                                <div className="bg-surface rounded-none w-full max-w-md p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-border text-left font-black" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex flex-col items-center text-center mb-8">
                                        <div className="w-20 h-20 rounded-none bg-primary/5 text-primary flex items-center justify-center mb-8 border border-primary/20 shadow-xl shadow-primary/5">
                                            <Sparkles className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-2xl font-black text-text uppercase tracking-tight leading-none">Track New Event</h2>
                                        <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.3em] opacity-60 leading-none">Provisioning event data stream</p>
                                    </div>
                                    <form onSubmit={handleAddBridal} className="space-y-8 text-left font-black">
                                        <div className="grid grid-cols-2 gap-8 text-left">
                                            <div className="space-y-3 text-left">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Client Identity *</label>
                                                <input type="text" required value={newBridal.clientName} onChange={e => setNewBridal({ ...newBridal, clientName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })} placeholder="e.g. SANYA_G" className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" />
                                            </div>
                                            <div className="space-y-3 text-left">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Contact No. *</label>
                                                <input type="tel" required value={newBridal.clientPhone} onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 10) setNewBridal({ ...newBridal, clientPhone: val });
                                                }} placeholder="e.g. 9876543210" className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 text-left">
                                            <div className="space-y-3 text-left">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Event Timeline *</label>
                                                <input type="date" required value={newBridal.eventDate} onChange={e => setNewBridal({ ...newBridal, eventDate: e.target.value })} className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" />
                                            </div>
                                            <div className="space-y-3 text-left">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Event Context *</label>
                                                <input type="text" required value={newBridal.eventName} onChange={e => setNewBridal({ ...newBridal, eventName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })} placeholder="e.g. WEDDING CEREMONY" className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" />
                                            </div>
                                        </div>
                                        <div className="space-y-3 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Target Service *</label>
                                            <input type="text" required value={newBridal.service} onChange={e => setNewBridal({ ...newBridal, service: e.target.value })} placeholder="e.g. VIP BRIDAL JOURNEY" className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" />
                                        </div>
                                        <div className="bg-primary/5 border border-primary/20 p-6 shadow-inner relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rotate-45 transform translate-x-8 -translate-y-8 blur-sm pointer-events-none" />
                                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] leading-relaxed relative z-10"><span className="text-primary-muted opacity-60">System Notification // </span>3 automated milestones (30d, 7d, 1d) will be injected dynamically.</p>
                                        </div>
                                        <div className="flex gap-6 pt-10 font-black">
                                            <button type="button" onClick={() => setShowBridalModal(false)} className="flex-1 py-5 rounded-none border border-border text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:bg-surface-alt transition-all">Abort</button>
                                            <button type="submit" className="flex-1 py-5 bg-primary text-primary-foreground rounded-none font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:bg-primary-dark transition-all">Commit Event</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </>,
                document.body
            ) : null}
        </div>
    );
}
