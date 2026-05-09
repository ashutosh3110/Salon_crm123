import { useState, useEffect, useMemo } from 'react';
import {
    MessageSquare, Mail, Share2, TrendingUp, Users, Send,
    Plus, Search, Filter, MoreVertical, CheckCircle, Clock,
    Eye, BarChart2, Smartphone, Facebook, Instagram,
    Zap, Calendar, Layout, Trash2, Edit3, ArrowRight,Bell,
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
        { id: 'notifications', label: 'App Notifications', icon: Bell },
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

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                            activeTab === tab.id ? 'text-primary' : 'text-text-muted hover:text-text'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-10">
                {/* 1. KPI Cards & Performance Chart */}
                <DashboardContent dashboardData={dashboardData} segments={segments} loading={loading} onRefresh={() => { loadDashboard(); loadSegments(); }} />
                
                {/* 2. Campaign List */}
                {activeTab === 'whatsapp' && (
                    <WhatsAppContent campaigns={campaigns} campaignsLoading={campaignsLoading} onNew={() => startCampaign()} onRefresh={loadCampaigns} />
                )}

                {/* 3. Push Notifications */}
                {activeTab === 'notifications' && (
                    <NotificationsContent segments={segments} onRefresh={() => { loadCampaigns(); loadSegments(); }} />
                )}
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
                            className="bg-white rounded-[2rem] border border-border w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-border flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-xl font-black text-text uppercase tracking-tight">Create WhatsApp Campaign</h3>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Fill details and send instantly</p>
                                </div>
                                {!isSending && (
                                    <button onClick={() => setIsCampaignModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                                        <XCircle className="w-6 h-6 text-text-muted" />
                                    </button>
                                )}
                            </div>

                            {/* Single Step Body */}
                            <div className="overflow-y-auto p-8 space-y-8 flex-1 no-scrollbar">
                                {campaignStep === 3 ? (
                                    /* Sending State Overlay-like content */
                                    <div className="py-12 flex flex-col items-center text-center space-y-8">
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
                                                        ? `Processing campaign for your selected audience...`
                                                        : 'Campaign finished successfully! Check your list for details.'
                                                }
                                            </p>
                                        </div>

                                        {!isSending && !campaignError && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                                                <CheckCircle className="w-8 h-8" />
                                            </motion.div>
                                        )}
                                        {campaignError && (
                                            <button onClick={() => { setCampaignStep(1); setCampaignError(''); }} className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:brightness-110">
                                                Try Again
                                            </button>
                                        )}
                                        {!isSending && !campaignError && (
                                            <button onClick={() => setIsCampaignModalOpen(false)} className="px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black">
                                                Close
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    /* Campaign Form */
                                    <>
                                        {/* 1. Campaign Name */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block">Campaign Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Summer Special 2026"
                                                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                value={campaignForm.name}
                                                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                                            />
                                        </div>

                                        {/* 2. Audience Selection */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block">Choose Audience</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'bulk', label: 'Everyone', desc: 'All Customers', icon: Users },
                                                    { id: 'selective', label: 'Selected', desc: 'Specific List', icon: Target },
                                                ].map(t => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setCampaignForm({ ...campaignForm, type: t.id })}
                                                        className={`p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${campaignForm.type === t.id ? 'border-primary bg-primary/[0.02]' : 'border-border hover:border-slate-300'}`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${campaignForm.type === t.id ? 'bg-primary text-white' : 'bg-surface text-text-muted'}`}>
                                                            <t.icon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-black text-text uppercase tracking-tight">{t.label}</div>
                                                            <div className="text-[9px] text-text-muted font-bold mt-0.5 uppercase tracking-wider">{t.desc}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Selective Picker UI */}
                                            {campaignForm.type === 'selective' && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                                    <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
                                                        <div>
                                                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">Recipients</div>
                                                            <div className="text-sm font-black text-text">{campaignForm.selectedCustomers.length} selected</div>
                                                        </div>
                                                        <button 
                                                            onClick={() => setIsContactListOpen(true)}
                                                            className="px-4 py-2 bg-white border border-border rounded-xl text-[10px] font-black text-primary uppercase tracking-widest hover:border-primary/30"
                                                        >
                                                            {campaignForm.selectedCustomers.length > 0 ? 'Edit Selection' : 'Select Customers'}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* 3. Message Composition */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Message Content</label>
                                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{campaignForm.message.length} characters</span>
                                            </div>
                                            <textarea
                                                rows={4}
                                                placeholder="Type your WhatsApp message here... (Use {{name}} for customer name)"
                                                className="w-full bg-surface border border-border rounded-2xl px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                                                value={campaignForm.message}
                                                onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
                                            />
                                        </div>

                                        {/* Estimated Reach Info */}
                                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Estimated Reach</div>
                                                <div className="text-sm font-black text-emerald-900">
                                                    {campaignForm.type === 'bulk'
                                                        ? (segments.find(s => s.id === 'all')?.count ?? 0).toLocaleString()
                                                        : campaignForm.selectedCustomers.length.toLocaleString()
                                                    } <span className="text-[10px] font-bold opacity-60 uppercase">Real Customers</span>
                                                </div>
                                            </div>
                                        </div>

                                        {campaignError && (
                                            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-bold">{campaignError}</div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Footer Action */}
                            {campaignStep !== 3 && (
                                <div className="p-8 border-t border-border bg-surface/30 shrink-0">
                                    <button
                                        onClick={handleSendCampaign}
                                        disabled={!campaignForm.name || !campaignForm.message || (campaignForm.type === 'selective' && campaignForm.selectedCustomers.length === 0) || isSending}
                                        className="w-full py-5 bg-primary text-white text-xs font-black uppercase tracking-[0.3em] rounded-[1.5rem] hover:brightness-110 shadow-xl shadow-primary/25 transition-all disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        {isSending ? 'Initiating Campaign...' : 'Send WhatsApp Campaign Now'}
                                    </button>
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
                <StatCard label={stats[2]?.label || 'Total Sent'} value={stats[2]?.value || '0'} icon={Zap} color="bg-amber-50 text-amber-600" />
                <StatCard label={stats[3]?.label || 'Campaigns'} value={stats[3]?.value || '0'} trend={stats[3]?.trend} icon={Smartphone} color="bg-primary/10 text-primary" />
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
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Recent Campaigns - Full Width */}
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
                    const rows = res.data?.data || [];
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
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-border">
                                        {selectionMode && (
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-text-muted uppercase tracking-widest w-10">
                                                Select
                                            </th>
                                        )}
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Name</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number</th>
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
                                            <td className="px-4 py-3 text-sm font-black text-text uppercase tracking-tight">{c.name || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-text-secondary font-mono">{c.phone || '—'}</td>
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

function NotificationsContent({ segments, onRefresh }) {
    const [form, setForm] = useState({
        title: '',
        message: '',
        image: '',
        type: 'marketing',
        customerId: 'all'
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [selectedCustomerName, setSelectedCustomerName] = useState('');

    const handleSend = async () => {
        setLoading(true);
        try {
            const res = await api.post('/notifications/send', form);
            if (res.data?.success) {
                setSuccess(true);
                setForm({ title: '', message: '', image: '', type: 'marketing', customerId: 'all' });
                setSelectedCustomerName('');
                setTimeout(() => setSuccess(false), 3000);
                onRefresh();
            }
        } catch (err) {
            console.error('Failed to send notification', err);
            alert(err.response?.data?.message || 'Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm space-y-6">
                <SectionHeader 
                    title="Push Notifications" 
                    desc="Send instant mobile & web notifications." 
                    icon={Bell} 
                />
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Audience</label>
                        <div className="flex gap-2">
                            <select 
                                className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
                                value={form.customerId === 'all' ? 'all' : (form.customerId === 'self' ? 'self' : 'specific')}
                                onChange={(e) => {
                                    if (e.target.value === 'all') {
                                        setForm({...form, customerId: 'all'});
                                        setSelectedCustomerName('');
                                    } else if (e.target.value === 'self') {
                                        setForm({...form, customerId: 'self'});
                                        setSelectedCustomerName('Me (Test)');
                                    } else {
                                        setIsPickerOpen(true);
                                    }
                                }}
                            >
                                <option value="all">All Active Customers</option>
                                <option value="self">Test to Me (Self)</option>
                                <option value="specific">Specific Customer {selectedCustomerName ? `(${selectedCustomerName})` : ''}</option>
                            </select>
                            {form.customerId !== 'all' && form.customerId !== 'self' && (
                                <button 
                                    onClick={() => setIsPickerOpen(true)}
                                    className="p-3 bg-surface border border-border rounded-xl hover:border-primary/30 text-primary transition-all"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Notification Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
                            placeholder="e.g. Special Offer Just for You! 🎉"
                            value={form.title}
                            onChange={(e) => setForm({...form, title: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Message</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none resize-none"
                            placeholder="Type your push message here..."
                            value={form.message}
                            onChange={(e) => setForm({...form, message: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Image URL (Optional)</label>
                        <input 
                            type="text" 
                            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
                            placeholder="https://example.com/banner.jpg"
                            value={form.image}
                            onChange={(e) => setForm({...form, image: e.target.value})}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleSend}
                            disabled={loading || !form.title || !form.message}
                            className="flex-1 py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:brightness-110 shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Sending...' : success ? 'Sent Successfully!' : (form.customerId === 'all' ? 'Broadcast Notification' : 'Send Notification')}
                        </button>
                    </div>

                    <ContactListModal 
                        isOpen={isPickerOpen}
                        onClose={() => setIsPickerOpen(false)}
                        selectionMode={true}
                        selectedIds={form.customerId === 'all' || form.customerId === 'self' ? [] : [form.customerId]}
                        onToggleSelect={(id) => {
                            setForm({...form, customerId: id});
                            setIsPickerOpen(false);
                        }}
                    />
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[100px]" />
                </div>
                
                <div className="w-48 h-80 bg-black rounded-[2.5rem] border-4 border-slate-800 shadow-2xl relative p-4 flex flex-col">
                    <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-6" />
                    
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        key={form.title}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-left border border-white/10"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                                <Bell size={8} className="text-white" />
                            </div>
                            <span className="text-[6px] font-black text-white uppercase tracking-widest">Salon App</span>
                        </div>
                        <h4 className="text-[8px] font-black text-white truncate">{form.title || 'Notification Title'}</h4>
                        <p className="text-[7px] text-white/60 line-clamp-2 mt-0.5 leading-tight">{form.message || 'The notification message body will appear here on the user\'s lock screen.'}</p>
                    </motion.div>
                </div>
                
                <div className="mt-8">
                    <h3 className="text-white text-lg font-black uppercase tracking-tight">Live Preview</h3>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">This is how it looks on mobile</p>
                </div>
            </div>
        </div>
    );
}


