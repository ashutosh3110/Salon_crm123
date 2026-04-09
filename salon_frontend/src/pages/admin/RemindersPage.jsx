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
import mockApi from '../../services/mock/mockApi';

/* ─── Main Page ────────────────────────────────────────────────────────── */

export default function RemindersPage() {
    const [activeTab, setActiveTab] = useState('bridal');
    const [loading, setLoading] = useState(true);
    const [copyStatus, setCopyStatus] = useState(false);

    // Modals
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [showBridalModal, setShowBridalModal] = useState(false);
    const [socialResultModal, setSocialResultModal] = useState({ open: false, title: '', message: '' });

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
        showServices: true,
    });

    const loadPendingSignals = async () => {
        try {
            const res = await mockApi.get('/reminders-links/service-signals/pending');
            setPendingClients(res.data?.results || []);
        } catch (e) {
            console.error('[Reminders] Pending signals load failed:', e);
            setPendingClients([]);
        }
    };

    const loadState = async () => {
        setLoading(true);
        try {
            const res = await mockApi.get('/reminders-links/state');
            const data = res.data || {};
            setBridalBookings(data.bridalBookings || []);
            setReminderRules(data.reminderRules || []);
            setBookingSettings(data.bookingSettings || {
                salonSlug: 'premium-salon-bandra',
                welcomeMsg: 'Welcome to our premium salon.',
                showServices: true,
            });
            await loadPendingSignals();
        } catch (e) {
            console.error('[Reminders] Load failed:', e);
            setBridalBookings([]);
            setReminderRules([]);
            setPendingClients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadState();
    }, []);

    const bookingURL = `${window.location.origin}/app/book?salon=${bookingSettings.salonSlug}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(bookingURL);
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    };

    const handleAddRule = (e) => {
        e.preventDefault();
        (async () => {
            try {
                await mockApi.post('/reminders-links/rules', { ...newRule, active: true });
                await loadState();
                setShowRuleModal(false);
                setNewRule({ category: '', interval: 30, channel: 'WhatsApp', message: "Hi {name}, it's time for your {category}! Book your slot: {link}" });
            } catch (err) {
                console.error('[Reminders] Add rule failed:', err);
            }
        })();
    };

    const handleAddBridal = (e) => {
        e.preventDefault();
        if (!newBridal.clientName || !newBridal.clientPhone || !newBridal.eventDate) return;
        (async () => {
            try {
                await mockApi.post('/reminders-links/bridal-bookings', {
                    ...newBridal,
                    reminders: [
                        { id: `rem-30d-${Date.now()}`, label: '30 Days Before', daysBefore: 30, active: true, sentAt: null },
                        { id: `rem-1d-${Date.now()}`, label: '1 Day Before', daysBefore: 1, active: true, sentAt: null },
                    ],
                });
                await loadState();
                setShowBridalModal(false);
                setNewBridal({ clientName: '', clientPhone: '', eventName: '', eventDate: '', service: '' });
            } catch (err) {
                console.error('[Reminders] Add bridal event failed:', err);
            }
        })();
    };

    const sendBridalReminder = (clientPhone, clientName, eventName, remLabel) => {
        const text = `Hi ${clientName}, this is a gentle reminder regarding your upcoming ${eventName} (${remLabel}).`;
        const phoneParam = clientPhone ? clientPhone.replace(/\D/g, '') : '';
        window.open(`https://wa.me/${phoneParam}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const sendActionHubReminder = async (clientId, ruleId) => {
        try {
            const res = await mockApi.post('/reminders-links/service-signals/send-whatsapp', { clientId, ruleId });
            const waLink = res.data?.waLink;
            if (waLink) window.open(waLink, '_blank');
            await loadPendingSignals();
        } catch (e) {
            console.error('[Reminders] Send service reminder failed:', e);
        }
    };

    const toggleReminder = (bookingId, remId) => {
        (async () => {
            try {
                await mockApi.patch(`/reminders-links/bridal-bookings/${bookingId}/reminders/${remId}/toggle`);
                await loadState();
            } catch (err) {
                console.error('[Reminders] Toggle reminder failed:', err);
            }
        })();
    };

    const toggleRule = (id) => {
        const rule = reminderRules.find((r) => r.id === id);
        if (!rule) return;
        (async () => {
            try {
                await mockApi.patch(`/reminders-links/rules/${id}`, { active: !rule.active });
                await loadState();
            } catch (err) {
                console.error('[Reminders] Toggle rule failed:', err);
            }
        })();
    };

    const persistSettings = (data) => {
        setBookingSettings(data);
        (async () => {
            try {
                await mockApi.patch('/reminders-links/settings', data);
            } catch (err) {
                console.error('[Reminders] Update settings failed:', err);
            }
        })();
    };

    const handleSocialShare = async (platform) => {
        if (platform !== 'WhatsApp') return;
        try {
            const res = await mockApi.post('/reminders-links/social-share/whatsapp', {
                message: `Hi {name}, book your next appointment here: {link}`,
            });
            const mode = res.data?.mode || 'manual_links';
            const links = res.data?.links || [];
            setSocialResultModal({
                open: true,
                title: 'WhatsApp Signal Sent',
                message: 'Social broadcast signal has been initiated locally.',
            });
        } catch (err) {
            console.error('[Reminders] WhatsApp social share failed:', err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-reveal font-black">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left italic">Reminders & Links</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none text-left">Standalone Marketing Hub Control</p>
                </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                <button onClick={() => setActiveTab('bridal')} className={`px-6 py-4 border-2 font-black text-[10px] uppercase tracking-widest ${activeTab === 'bridal' ? 'bg-primary text-white border-primary' : 'bg-white border-border'}`}>Bridal</button>
                <button onClick={() => setActiveTab('service')} className={`px-6 py-4 border-2 font-black text-[10px] uppercase tracking-widest ${activeTab === 'service' ? 'bg-primary text-white border-primary' : 'bg-white border-border'}`}>Protocols</button>
                <button onClick={() => setActiveTab('link')} className={`px-6 py-4 border-2 font-black text-[10px] uppercase tracking-widest ${activeTab === 'link' ? 'bg-primary text-white border-primary' : 'bg-white border-border'}`}>Gateway</button>
                <button onClick={() => setActiveTab('social')} className={`px-6 py-4 border-2 font-black text-[10px] uppercase tracking-widest ${activeTab === 'social' ? 'bg-primary text-white border-primary' : 'bg-white border-border'}`}>Social</button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[500px]">
                    {activeTab === 'bridal' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-8 border border-border italic font-black uppercase tracking-tighter">
                                <span>Bridal Events Log</span>
                                <button onClick={() => setShowBridalModal(true)} className="bg-text text-white px-6 py-2 text-[10px]">Add Event</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {bridalBookings.map(b => (
                                    <div key={b.id} className="bg-white border-2 border-text p-8 text-left">
                                        <h3 className="text-xl font-black uppercase mb-1">{b.clientName}</h3>
                                        <p className="text-[10px] text-primary mb-6 font-black uppercase">{b.service}</p>
                                        <div className="space-y-2">
                                            {b.reminders.map(r => (
                                                <div key={r.id} className="flex justify-between items-center border border-border p-3 text-[10px] uppercase font-black italic">
                                                    <span>{r.label}</span>
                                                    <button onClick={() => sendBridalReminder(b.clientPhone, b.clientName, b.eventName, r.label)} className="text-emerald-500">SEND WA</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'link' && (
                        <div className="max-w-2xl mx-auto bg-white border-2 border-text p-12 text-center space-y-8">
                            <div className="p-6 border-2 border-border inline-block">
                                <QRCodeSVG value={bookingURL} size={200} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none italic">Booking Gateway</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted italic opacity-40">Share this link to accept appointments offline</p>
                            </div>
                            <div className="flex bg-surface border-2 border-text p-4">
                                <code className="flex-1 text-[10px] font-black truncate">{bookingURL}</code>
                                <button onClick={handleCopyLink} className="text-primary font-black text-[10px] uppercase pl-4">{copyStatus ? 'COPIED' : 'COPY'}</button>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'service' && (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black uppercase italic text-left">Active Protocols</h2>
                                {reminderRules.map(r => (
                                    <div key={r.id} className="bg-white border-2 border-text p-6 text-left">
                                        <h4 className="font-black uppercase text-lg italic">{r.category}</h4>
                                        <p className="text-[9px] uppercase font-black opacity-40 mb-4">Every {r.interval} Days</p>
                                        <div className="bg-surface p-4 text-[10px] font-black text-text-muted italic border border-border">{r.message}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black uppercase italic text-left">Action Hub</h2>
                                <div className="bg-white border-2 border-text overflow-hidden">
                                     <table className="w-full text-left font-black">
                                        <thead className="bg-surface uppercase text-[9px] border-b-2 border-text">
                                            <tr><th className="p-4">Client</th><th className="p-4">Protocol</th><th className="p-4 text-right">Action</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {pendingClients.map(c => (
                                                <tr key={c.id} className="text-[10px] uppercase font-black italic">
                                                    <td className="p-4">{c.name}</td>
                                                    <td className="p-4 text-primary">{c.service}</td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => sendActionHubReminder(c.clientId, c.ruleId)} className="bg-emerald-500 text-white px-3 py-1">SEND</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                     </table>
                                </div>
                            </div>
                         </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             {['Instagram', 'WhatsApp', 'Facebook'].map(p => (
                                 <div key={p} className="bg-white border-2 border-text p-10 flex flex-col items-center text-center space-y-6">
                                     <div className="w-16 h-16 bg-surface-alt border-2 border-text flex items-center justify-center italic font-black text-2xl">{p[0]}</div>
                                     <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">{p}</h3>
                                     <button onClick={() => handleSocialShare(p)} className="w-full bg-text text-white py-4 text-[10px] uppercase font-black tracking-widest italic">Broadcast Signal</button>
                                 </div>
                             ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {typeof document !== 'undefined' ? createPortal(
                <>
                    {showBridalModal && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 font-black" onClick={() => setShowBridalModal(false)}>
                            <div className="bg-white border-4 border-text w-full max-w-md p-10 shadow-2xl relative animate-reveal" onClick={(e) => e.stopPropagation()}>
                                <h2 className="text-3xl font-black uppercase italic mb-8">Add Event</h2>
                                <form onSubmit={handleAddBridal} className="space-y-6 text-left">
                                    <input type="text" placeholder="NAME" required className="w-full p-4 border-2 border-text font-black text-xs uppercase italic outline-none focus:bg-surface transition-all" value={newBridal.clientName} onChange={e => setNewBridal({...newBridal, clientName: e.target.value.toUpperCase()})} />
                                    <input type="tel" placeholder="PHONE" required className="w-full p-4 border-2 border-text font-black text-xs outline-none focus:bg-surface transition-all" value={newBridal.clientPhone} onChange={e => setNewBridal({...newBridal, clientPhone: e.target.value})} />
                                    <input type="date" required className="w-full p-4 border-2 border-text font-black text-xs outline-none focus:bg-surface transition-all" value={newBridal.eventDate} onChange={e => setNewBridal({...newBridal, eventDate: e.target.value})} />
                                    <input type="text" placeholder="CONTEXT" required className="w-full p-4 border-2 border-text font-black text-xs uppercase italic outline-none focus:bg-surface transition-all" value={newBridal.eventName} onChange={e => setNewBridal({...newBridal, eventName: e.target.value.toUpperCase()})} />
                                    <div className="flex gap-4 pt-6">
                                        <button type="button" onClick={() => setShowBridalModal(false)} className="flex-1 py-4 border-2 border-text font-black text-[10px] uppercase italic">Cancel</button>
                                        <button type="submit" className="flex-1 bg-text text-white py-4 font-black text-[10px] uppercase italic">Commit</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    
                    {socialResultModal.open && (
                         <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4" onClick={() => setSocialResultModal({ open: false, title: '', message: '' })}>
                            <div className="bg-white border-4 border-text w-full max-w-xs p-10 shadow-2xl text-left" onClick={e => e.stopPropagation()}>
                                <h3 className="text-xl font-black uppercase italic mb-4">{socialResultModal.title}</h3>
                                <p className="text-[10px] font-black uppercase italic opacity-60 mb-8">{socialResultModal.message}</p>
                                <button onClick={() => setSocialResultModal({ open: false, title: '', message: '' })} className="w-full bg-text text-white py-3 font-black text-[10px] uppercase">OK</button>
                            </div>
                         </div>
                    )}
                </>,
                document.body
            ) : null}
        </div>
    );
}
