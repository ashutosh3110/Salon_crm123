import { useState, useEffect, useMemo } from 'react';
import {
    MessageSquare, Mail, Share2, TrendingUp, Users, Send,
    Plus, Search, Filter, MoreVertical, CheckCircle, Clock,
    Eye, BarChart2, Smartphone, Facebook, Instagram,
    Zap, Calendar, Layout, Trash2, Edit3, ArrowRight,
    QrCode, Globe, Percent, XCircle, Save, Star, Download, CheckCircle2, Tag, Gift, ChevronRight, SmartphoneIcon, Target, Megaphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

/* ─── Components ───────────────────────────────────────────────────────── */

function StatCard({ label, value, trend, icon: Icon, color }) {
    return (
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tight">
                        <TrendingUp className="w-3 h-3" /> {trend}
                    </div>
                )}
            </div>
            <div className="text-2xl font-black text-text">{value}</div>
            <div className="text-xs text-text-muted font-bold uppercase tracking-wider mt-0.5">{label}</div>
        </div>
    );
}

function SectionHeader({ title, desc, icon: Icon, badge }) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-text tracking-tight flex items-center gap-2">
                        {title}
                        {badge && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-widest">{badge}</span>}
                    </h2>
                    <p className="text-xs text-text-muted font-medium">{desc}</p>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ────────────────────────────────────────────────────────── */

export default function MarketingHub() {
    const [activeTab, setActiveTab] = useState('whatsapp');
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [campaignStep, setCampaignStep] = useState(1); // 1: Audience, 2: Message, 3: Sending
    const [campaignForm, setCampaignForm] = useState({
        name: '',
        type: 'bulk', // bulk, segmented, or selective
        segment: 'all',
        selectedCustomers: [], // array of IDs
        message: '',
        schedule: 'now'
    });
    const [sendingProgress, setSendingProgress] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [isContactListOpen, setIsContactListOpen] = useState(false);
    const [campaignError, setCampaignError] = useState('');
    const [dashboardData, setDashboardData] = useState(null);
    const [segments, setSegments] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [campaignsLoading, setCampaignsLoading] = useState(false);

    const loadDashboard = async () => {
        try {
            const res = await api.get('/marketing/dashboard');
            if (res.data?.success) setDashboardData(res.data.data);
        } catch (e) {
            setDashboardData(null);
        }
    };

    const loadSegments = async () => {
        try {
            const res = await api.get('/marketing/segments');
            if (res.data?.success) setSegments(res.data.data || []);
        } catch (e) {
            setSegments([]);
        }
    };

    const loadCampaigns = async () => {
        setCampaignsLoading(true);
        try {
            const res = await api.get('/marketing/campaigns?limit=100');
            if (res.data?.success) setCampaigns(res.data.data?.results || []);
        } catch (e) {
            setCampaigns([]);
        } finally {
            setCampaignsLoading(false);
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.allSettled([loadDashboard(), loadSegments(), loadCampaigns()]);
            setLoading(false);
        };
        load();
    }, []);

    const startCampaign = () => {
        setIsCampaignModalOpen(true);
        setCampaignStep(1);
        setIsSending(false);
        setSendingProgress(0);
        setCampaignError('');
        loadSegments();
    };

    const handleSendCampaign = async () => {
        setCampaignError('');
        setCampaignStep(3);
        setIsSending(true);
        let progress = 0;
        const interval = setInterval(() => setSendingProgress((p) => Math.min(p + 5, 90)), 150);

        try {
            const payload = {
                name: campaignForm.name,
                type: campaignForm.type,
                segment: campaignForm.type === 'segmented' ? campaignForm.segment : 'all',
                selectedCustomers: campaignForm.type === 'selective' ? campaignForm.selectedCustomers : [],
                message: campaignForm.message,
                channel: 'whatsapp',
            };
            console.log('🚀 Initiating WhatsApp campaign...', payload);
            const res = await api.post('/marketing/campaigns', payload);
            console.log('✅ Campaign response received:', res.data);
            
            clearInterval(interval);
            setSendingProgress(100);
            await loadCampaigns();
            await loadDashboard();
            await loadSegments();
        } catch (err) {
            console.error('❌ Campaign sending FAILED:', err.response?.data || err.message);
            clearInterval(interval);
            setCampaignError(err?.response?.data?.message || err?.message || 'Failed to create campaign');
            setIsSending(false);
            return;
        }
        setIsSending(false);
        setTimeout(() => {
            setIsCampaignModalOpen(false);
            setCampaignForm({ name: '', type: 'bulk', segment: 'all', message: '', schedule: 'now' });
        }, 600);
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Layout },
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'automations', label: 'Automations', icon: Zap },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight uppercase leading-none">WhatsApp Marketing</h1>
                    <p className="text-[10px] sm:text-sm text-text-secondary mt-2 uppercase tracking-[0.1em] opacity-80 leading-tight">Send templates to all or selected customers</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-none bg-white border border-border text-text-secondary text-[10px] sm:text-xs font-black uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all shadow-sm">
                        <Calendar className="w-4 h-4" /> Schedule Campaign
                    </button>
                    <button
                        onClick={startCampaign}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-none bg-primary text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-primary/25 active:scale-[0.98] transition-all leading-none"
                    >
                        <Plus className="w-4 h-4" /> Create Campaign
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                <DashboardContent dashboardData={dashboardData} segments={segments} loading={loading} onRefresh={() => { loadDashboard(); loadSegments(); }} />
                <WhatsAppContent campaigns={campaigns} campaignsLoading={campaignsLoading} onNew={() => startCampaign()} onRefresh={loadCampaigns} />
            </div>

            {/* ── Campaign Wizard Modal ── */}
            <AnimatePresence>
                {isCampaignModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSending && setIsCampaignModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2rem] border border-border w-full max-w-xl shadow-2xl relative overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-text uppercase tracking-tight">Create WhatsApp Campaign</h3>
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3].map(s => (
                                            <div key={s} className={`h-1 rounded-full transition-all duration-300 ${campaignStep >= s ? 'w-8 bg-primary' : 'w-4 bg-slate-100'}`} />
                                        ))}
                                    </div>
                                </div>
                                {!isSending && (
                                    <button onClick={() => setIsCampaignModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                                        <XCircle className="w-6 h-6 text-text-muted" />
                                    </button>
                                )}
                            </div>

                            {/* Step 1: Select Audience */}
                            {campaignStep === 1 && (
                                <div className="p-8 space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 block">Campaign Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Summer Special 2026"
                                            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            value={campaignForm.name}
                                            onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 block">Choose Audience</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'bulk', label: 'Send to Everyone', desc: 'All Customers', icon: Users },
                                                { id: 'segmented', label: 'By Segment', desc: 'Auto Groups', icon: Zap },
                                                { id: 'selective', label: 'Pick Specific', desc: 'Selected List', icon: Target },
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setCampaignForm({ ...campaignForm, type: t.id })}
                                                    className={`p-4 rounded-2xl border-2 transition-all text-left ${campaignForm.type === t.id ? 'border-primary bg-primary/[0.02]' : 'border-border hover:border-slate-300'}`}
                                                >
                                                    <t.icon className={`w-5 h-5 mb-2 ${campaignForm.type === t.id ? 'text-primary' : 'text-text-muted'}`} />
                                                    <div className="text-xs font-black text-text uppercase tracking-tight">{t.label}</div>
                                                    <div className="text-[10px] text-text-muted font-bold mt-0.5">{t.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {campaignForm.type === 'segmented' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 block">Pick a Segment</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { id: 'inactive_60', label: 'Inactive (60d+)' },
                                                    { id: 'high_spenders', label: 'High Spenders' },
                                                    { id: 'birthday', label: 'Birthday Today' },
                                                    { id: 'at_risk', label: 'At Risk (30d+)' },
                                                    { id: 'new_month', label: 'New This Month' },
                                                ].map(s => {
                                                    const seg = segments.find(se => se.id === s.id);
                                                    const cnt = seg?.count ?? 0;
                                                    return (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => setCampaignForm({ ...campaignForm, segment: s.id })}
                                                            className={`px-3 py-2 rounded-lg text-left text-[10px] font-black uppercase tracking-tight border ${campaignForm.segment === s.id ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-border hover:border-primary/30'}`}
                                                        >
                                                            {s.label} {cnt > 0 && `(${cnt})`}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {campaignForm.type === 'selective' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Recipients ({campaignForm.selectedCustomers.length})</label>
                                                <button 
                                                    onClick={() => setIsContactListOpen(true)}
                                                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                                >
                                                    + Pick Customers
                                                </button>
                                            </div>
                                            {campaignForm.selectedCustomers.length > 0 ? (
                                                <div className="max-h-32 overflow-y-auto p-3 bg-surface border border-border rounded-xl flex flex-wrap gap-2 no-scrollbar">
                                                    {campaignForm.selectedCustomers.map(id => (
                                                        <div key={id} className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-lg uppercase flex items-center gap-1">
                                                            {id.slice(-4)}
                                                            <button onClick={() => setCampaignForm(p => ({ ...p, selectedCustomers: p.selectedCustomers.filter(x => x !== id) }))} className="hover:text-rose-500"><XCircle size={10} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center border-2 border-dashed border-border rounded-2xl opacity-40">
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No customers selected</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={() => setCampaignStep(2)}
                                        disabled={!campaignForm.name}
                                        className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                                Next: Write Message
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Compose Message */}
                            {campaignStep === 2 && (
                                <div className="p-8 space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Message</label>
                                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Use Template</button>
                                        </div>
                                        <textarea
                                            rows={5}
                                            placeholder="Type your WhatsApp message here..."
                                            className="w-full bg-surface border border-border rounded-2xl px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                            value={campaignForm.message}
                                            onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
                                        />
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-text-muted font-bold uppercase tracking-widest text-right justify-end">
                                            {campaignForm.message.length} characters
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Estimated Recipients</div>
                                                <div className="text-sm font-black text-emerald-900">
                                                    {campaignForm.type === 'bulk'
                                                        ? (segments.find(s => s.id === 'all')?.count ?? 0).toLocaleString()
                                                        : campaignForm.type === 'selective'
                                                            ? campaignForm.selectedCustomers.length.toLocaleString()
                                                            : (segments.find(s => s.id === campaignForm.segment)?.count ?? 0).toLocaleString()
                                                    } <span className="text-[10px] font-bold opacity-60">customers</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {campaignError && (
                                        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-bold">{campaignError}</div>
                                    )}
                                    <div className="flex gap-3">
                                        <button onClick={() => { setCampaignStep(1); setCampaignError(''); }} className="flex-1 py-4 bg-white border border-border text-text-secondary text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-surface transition-all">Back</button>
                                        <button
                                            onClick={handleSendCampaign}
                                            disabled={!campaignForm.message || isSending}
                                            className="flex-[2] py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                                        >
                                            {isSending ? 'Saving...' : 'Send Campaign Now'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Sending */}
                            {campaignStep === 3 && (
                                <div className="p-12 flex flex-col items-center text-center space-y-8">
                                    {!campaignError && (
                                        <div className="relative w-32 h-32 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                                <motion.circle
                                                    cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                    strokeDasharray={380}
                                                    animate={{ strokeDashoffset: 380 - (380 * sendingProgress) / 100 }}
                                                    className="text-primary"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-text">
                                                {Math.round(sendingProgress)}%
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-xl font-black text-text uppercase tracking-tight">{isSending ? 'Sending Messages...' : campaignError ? 'Error' : 'Campaign Sent!'}</h3>
                                        <p className="text-sm text-text-muted mt-2 font-medium">
                                            {campaignError
                                                ? campaignError
                                                : isSending
                                                    ? `Saving campaign for ${(campaignForm.type === 'bulk' ? (segments.find(s => s.id === 'all')?.count ?? 0) : (segments.find(s => s.id === campaignForm.segment)?.count ?? 0)).toLocaleString()} customers.`
                                                    : 'Campaign saved successfully. Connect WhatsApp API to send messages.'
                                            }
                                        </p>
                                    </div>

                                    {!isSending && !campaignError && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                                            <CheckCircle className="w-8 h-8" />
                                        </motion.div>
                                    )}
                                    {campaignError && (
                                        <button onClick={() => { setCampaignStep(2); setCampaignError(''); }} className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:brightness-110">
                                            Try Again
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {/* ── Contact List Modal ── */}
                <ContactListModal 
                    isOpen={isContactListOpen} 
                    onClose={() => setIsContactListOpen(false)} 
                    selectionMode={campaignForm.type === 'selective'}
                    selectedIds={campaignForm.selectedCustomers}
                    onToggleSelect={(id) => {
                        setCampaignForm(prev => {
                            const list = prev.selectedCustomers;
                            if (list.includes(id)) {
                                return { ...prev, selectedCustomers: list.filter(x => x !== id) };
                            } else {
                                return { ...prev, selectedCustomers: [...list, id] };
                            }
                        });
                    }}
                />
            </AnimatePresence>
        </div>
    );
}

/* ─── Dashboard Tab ─────────────────────────────────────────────────────── */
function DashboardContent({ dashboardData, segments, loading, onRefresh }) {
    const stats = dashboardData?.stats || [
        { label: 'Campaign Reach', value: '0', trend: null },
        { label: 'Conv. Rate', value: '0%', trend: null },
        { label: 'Total Spent', value: '₹0', trend: null },
        { label: 'Campaigns', value: '0', trend: null },
    ];
    const chartData = dashboardData?.chartData || [
        { name: 'Mon', whatsapp: 0, email: 0, social: 0 },
        { name: 'Tue', whatsapp: 0, email: 0, social: 0 },
        { name: 'Wed', whatsapp: 0, email: 0, social: 0 },
        { name: 'Thu', whatsapp: 0, email: 0, social: 0 },
        { name: 'Fri', whatsapp: 0, email: 0, social: 0 },
        { name: 'Sat', whatsapp: 0, email: 0, social: 0 },
        { name: 'Sun', whatsapp: 0, email: 0, social: 0 },
    ];
    const displaySegments = segments.length > 0 ? segments.filter(s => ['all', 'loyal', 'at_risk', 'new_month'].includes(s.id)) : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <p className="text-text-muted font-bold uppercase tracking-widest">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label={stats[0]?.label || 'Campaign Reach'} value={stats[0]?.value || '0'} trend={stats[0]?.trend} icon={Users} color="bg-blue-50 text-blue-600" />
                <StatCard label={stats[1]?.label || 'Conv. Rate'} value={stats[1]?.value || '0%'} trend={stats[1]?.trend} icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
                <StatCard label={stats[2]?.label || 'Total Spent'} value={stats[2]?.value || '₹0'} icon={Zap} color="bg-amber-50 text-amber-600" />
                <StatCard label={stats[3]?.label || 'Campaigns'} value={stats[3]?.value || '0'} trend={stats[3]?.trend} icon={Smartphone} color="bg-primary/10 text-primary" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-text uppercase tracking-wider">Campaign Performance</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Last 7 days by channel</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-[10px] font-bold text-text-muted uppercase">WhatsApp</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-bold text-text-muted uppercase">Email</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorWa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#AD0B2A" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#AD0B2A" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorEmail" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" stroke="#A3A3A3" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <YAxis stroke="#A3A3A3" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="whatsapp" stroke="#AD0B2A" strokeWidth={3} fillOpacity={1} fill="url(#colorWa)" />
                                <Area type="monotone" dataKey="email" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorEmail)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Audience Segments */}
                <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-text uppercase tracking-wider">Audience Segments</h3>
                        <button onClick={onRefresh} className="p-2 hover:bg-surface rounded-lg transition-colors"><Plus className="w-4 h-4 text-primary" /></button>
                    </div>
                    <div className="space-y-4">
                        {(displaySegments.length > 0 ? displaySegments : [
                            { id: 'all', label: 'All Customers', count: 0, color: 'text-slate-400' },
                            { id: 'loyal', label: 'Loyal (5+ visits)', count: 0, color: 'text-primary' },
                            { id: 'at_risk', label: 'At Risk (30d+ gap)', count: 0, color: 'text-amber-500' },
                            { id: 'new_month', label: 'New This Month', count: 0, color: 'text-emerald-500' },
                        ]).map(s => {
                            const total = displaySegments.find(x => x.id === 'all')?.count || 1;
                            const pct = total > 0 ? Math.min(100, (s.count / total) * 100) : 0;
                            return (
                                <div key={s.id || s.label} className="p-4 rounded-2xl border border-border hover:border-primary/30 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-tight text-text-secondary">{s.label}</span>
                                        <span className={`text-xs font-black ${s.color}`}>{s.count}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${pct}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button onClick={onRefresh} className="w-full mt-6 py-3 bg-surface text-text-secondary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
                        Refresh Segments
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── WhatsApp Tab ─────────────────────────────────────────────────────── */
function WhatsAppContent({ campaigns, campaignsLoading, onNew, onRefresh }) {
    const mapCampaign = (c) => ({
        id: c._id || c.id,
        name: c.name || 'Untitled',
        status: (c.status || 'draft').toLowerCase(),
        sent: c.sentCount ?? c.sent ?? 0,
        read: c.readCount ?? c.read ?? 0,
        date: c.sentAt ? new Date(c.sentAt).toISOString().slice(0, 10) : (c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : '--'),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <SectionHeader
                    title="WhatsApp Campaigns"
                    desc="Send messages to customers and track delivery and reads."
                    icon={MessageSquare}
                    badge="Live"
                />
                <div className="flex items-center gap-2">
                    <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-xs font-black uppercase tracking-widest hover:border-primary/30 transition-all">
                        Refresh
                    </button>
                    <button
                        onClick={onNew}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-emerald-200"
                    >
                        <Plus className="w-4 h-4" /> New Campaign
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Left Column: Stats & Templates */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Quick Templates</h4>
                        <div className="space-y-3">
                            {['Birthday Wish', 'Review Request', 'Flash Sale', 'Appointment Reminder'].map(t => (
                                <button key={t} className="w-full p-3 rounded-xl bg-surface border border-transparent hover:border-primary/20 text-xs font-bold text-text-secondary text-left transition-all flex items-center justify-between group">
                                    {t} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Campaigns */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden text-center justify-center">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface/30">
                            <h3 className="text-xs font-black text-text uppercase tracking-widest leading-none">Recent Campaigns</h3>
                            <button onClick={onRefresh} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Refresh</button>
                        </div>
                        <div className="table-responsive">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Campaign Name</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">Sent / Read</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaignsLoading ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-text-muted font-bold">Loading campaigns...</td></tr>
                                    ) : campaigns.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-text-muted font-bold">No campaigns yet. Create one to get started.</td></tr>
                                    ) : (
                                        campaigns.map(c => {
                                            const row = mapCampaign(c);
                                            return (
                                                <tr key={row.id} className="border-b border-border/50 hover:bg-surface/10 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-black text-text uppercase tracking-tight">{row.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${row.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-black text-xs text-text-secondary">
                                                        {row.sent} <span className="text-text-muted font-bold mx-1">/</span> <span className="text-primary">{row.read}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-xs text-text-muted italic">{row.date}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="p-2 hover:bg-surface rounded-lg transition-colors"><MoreVertical className="w-4 h-4 text-text-muted" /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Automations Tab ──────────────────────────────────────────────────── */
function AutomationsContent() {
    const [flows, setFlows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [editModal, setEditModal] = useState(null);

    const loadAutomations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/marketing/automations');
            const data = res.data?.data || [];
            setFlows(Array.isArray(data) ? data : []);
            if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
        } catch {
            setFlows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAutomations();
    }, []);

    useEffect(() => {
        if (flows.length > 0 && !selectedId) setSelectedId(flows[0].id);
    }, [flows]);

    const selected = flows.find((f) => f.id === selectedId) ?? flows[0];

    const handleToggle = async (flowId, enabled) => {
        setActionLoading(true);
        try {
            await api.patch(`/marketing/automations/${flowId}`, { enabled });
            setFlows((prev) => prev.map((f) => (f.id === flowId ? { ...f, enabled } : f)));
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveMessage = async (flowId, messageTemplate) => {
        setActionLoading(true);
        try {
            const res = await api.patch(`/marketing/automations/${flowId}`, { messageTemplate });
            setFlows((prev) => prev.map((f) => (f.id === flowId ? { ...f, preview: res.data?.data?.preview ?? messageTemplate } : f)));
            setEditModal(null);
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <p className="text-text-muted font-bold uppercase tracking-widest">Loading automations...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Automatic Messages"
                desc="Set once and messages will be sent automatically."
                icon={Zap}
                badge="Live"
            />

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: templates list */}
                <div className="lg:col-span-1 space-y-4">
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-[0.2em]">
                        Ready-made automations
                    </p>
                    <div className="space-y-3">
                        {flows.map((flow) => {
                            const isActive = selected?.id === flow.id;
                            return (
                                <button
                                    key={flow.id}
                                    type="button"
                                    onClick={() => setSelectedId(flow.id)}
                                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all group ${isActive
                                        ? 'border-primary bg-primary/[0.02] shadow-sm'
                                        : 'border-border bg-white hover:border-primary/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-xl flex items-center justify-center text-primary bg-primary/10">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-black text-text uppercase tracking-tight">
                                                {flow.name}
                                            </span>
                                        </div>
                                        {flow.badge && (
                                            <span className="text-[9px] font-black uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-surface text-text-muted">
                                                {flow.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-text-muted font-medium leading-snug">
                                        {flow.short}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-4 rounded-2xl border border-dashed border-border px-4 py-3 bg-surface/60 text-[11px] text-text-muted font-medium">
                        Messages will start only after you enable a flow. Connect WhatsApp API to send.
                    </div>
                </div>

                {/* Right: selected flow details */}
                <div className="lg:col-span-2 space-y-4">
                    {selected && (
                        <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h3 className="text-sm font-black text-text uppercase tracking-wider">
                                        {selected.name}
                                    </h3>
                                    <p className="text-xs text-text-muted font-medium mt-1">
                                        {selected.short}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${selected.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                        <Clock className="w-3.5 h-3.5" />
                                        {selected.enabled ? 'Enabled' : 'Not Active'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="rounded-2xl bg-surface p-4 border border-border/60">
                                    <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1.5">When it runs</div>
                                    <p className="text-xs text-text font-medium leading-relaxed">{selected.triggerLabel}</p>
                                </div>
                                <div className="rounded-2xl bg-surface p-4 border border-border/60">
                                    <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1.5">Where it sends</div>
                                    <p className="text-xs text-text font-medium leading-relaxed">{selected.channelLabel}</p>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 items-start">
                                <div className="rounded-2xl border border-border bg-surface p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black">WA</div>
                                            <div>
                                                <p className="text-[11px] font-black text-text uppercase tracking-[0.18em]">Message preview</p>
                                                <p className="text-[10px] text-text-muted font-medium">Use tags like &#123;&#123;name&#125;&#125;, &#123;&#123;offer&#125;&#125;, &#123;&#123;salon_name&#125;&#125;</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEditModal({ flowId: selected.id, preview: selected.preview })}
                                            className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted hover:text-primary"
                                        >
                                            Edit text
                                        </button>
                                    </div>
                                    <div className="rounded-2xl bg-white border border-border/60 px-4 py-3 text-[11px] text-text leading-relaxed whitespace-pre-line">
                                        {selected.preview}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
                                    <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Who will get this</p>
                                    <ul className="space-y-2 text-xs text-text font-medium">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-[2px]" />
                                            <span>Only active customers in your client list.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-[2px]" />
                                            <span>Messages respect opt-out / DND flags.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-[2px]" />
                                            <span>Timing windows are spread out to avoid spamming.</span>
                                        </li>
                                    </ul>
                                    <div className="pt-2 border-t border-border/60 mt-2">
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mb-2">Status</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${selected.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                                <Clock className="w-3.5 h-3.5" />
                                                {selected.enabled ? 'Enabled' : 'Not Active'}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() => handleToggle(selected.id, !selected.enabled)}
                                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.18em] transition-colors disabled:opacity-50 ${selected.enabled ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-slate-900 text-white hover:bg-black'}`}
                                            >
                                                {selected.enabled ? 'Disable' : 'Enable'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Message Modal */}
            <AnimatePresence>
                {editModal && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditModal(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative"
                        >
                            <h4 className="text-lg font-black text-text uppercase tracking-tight mb-4">Edit Message</h4>
                            <textarea
                                rows={6}
                                value={editModal.preview}
                                onChange={(e) => setEditModal((p) => ({ ...p, preview: e.target.value }))}
                                className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                placeholder="Message template..."
                            />
                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setEditModal(null)} className="px-4 py-2 border border-border rounded-xl text-xs font-black uppercase">Cancel</button>
                                <button
                                    onClick={() => handleSaveMessage(editModal.flowId, editModal.preview)}
                                    disabled={actionLoading}
                                    className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase disabled:opacity-50"
                                >
                                    {actionLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Contact List Modal ───────────────────────────────────────────────── */
function ContactListModal({ isOpen, onClose, selectionMode = false, selectedIds = [], onToggleSelect }) {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.get('/clients?limit=500')
                .then((res) => {
                    const rows = res.data?.results || res.data || [];
                    setContacts(Array.isArray(rows) ? rows : []);
                })
                .catch(() => setContacts([]))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const filtered = useMemo(() => {
        if (!search.trim()) return contacts;
        const q = search.trim().toLowerCase();
        return contacts.filter((c) =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.phone || '').includes(search)
        );
    }, [contacts, search]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[85vh] shadow-2xl relative overflow-hidden flex flex-col"
            >
                <div className="px-8 py-6 border-b border-border flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-xl font-black text-text uppercase tracking-tight">Contact List</h3>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-2 border border-border rounded-xl text-sm font-medium w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button onClick={onClose} className="p-2 hover:bg-surface rounded-full">
                            <XCircle className="w-6 h-6 text-text-muted" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="py-16 text-center text-text-muted font-bold">Loading contacts...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-text-muted font-bold">No customers found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-border">
                                        {selectionMode && (
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-text-muted uppercase tracking-widest w-10">
                                                Select
                                            </th>
                                        )}
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Name</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Email</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Phone</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Gender</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Birthday</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((c) => {
                                        const isSelected = selectedIds.includes(c._id || c.id);
                                        return (
                                            <tr 
                                                key={c._id || c.id} 
                                                className={`border-b border-border/50 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-surface/30'} ${selectionMode ? 'cursor-pointer' : ''}`}
                                                onClick={() => selectionMode && onToggleSelect(c._id || c.id)}
                                            >
                                                {selectionMode && (
                                                    <td className="px-4 py-3">
                                                        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                                                            {isSelected && <CheckCircle size={10} className="text-white" />}
                                                        </div>
                                                    </td>
                                                )}
                                            <td className="px-4 py-3 text-sm font-bold text-text">{c.name || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-text-secondary">{c.email || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-text-secondary font-mono">{c.phone || '—'}</td>
                                            <td className="px-4 py-3 text-xs text-text-muted capitalize">{c.gender || '—'}</td>
                                            <td className="px-4 py-3 text-xs text-text-muted">
                                                {c.birthday ? new Date(c.birthday).toISOString().slice(0, 10) : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="px-8 py-4 border-t border-border bg-surface/30 text-[10px] font-black text-text-muted uppercase tracking-widest">
                    {filtered.length} contact{filtered.length !== 1 ? 's' : ''} shown
                </div>
            </motion.div>
        </div>
    );
}


