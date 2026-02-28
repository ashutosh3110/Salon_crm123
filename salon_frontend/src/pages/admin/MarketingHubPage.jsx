import { useState } from 'react';
import {
    MessageSquare, Mail, Share2, TrendingUp, Users, Send,
    Plus, Search, Filter, MoreVertical, CheckCircle, Clock,
    Eye, BarChart2, Smartphone, Facebook, Instagram,
    Zap, Calendar, Layout, Trash2, Edit3, ArrowRight,
    QrCode, Globe, Percent, XCircle
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Mock Data ────────────────────────────────────────────────────────── */
const CAMPAIGN_STATS = [
    { name: 'Mon', whatsapp: 450, email: 210, social: 120 },
    { name: 'Tue', whatsapp: 520, email: 180, social: 150 },
    { name: 'Wed', whatsapp: 380, email: 320, social: 100 },
    { name: 'Thu', whatsapp: 610, email: 410, social: 280 },
    { name: 'Fri', whatsapp: 890, email: 530, social: 450 },
    { name: 'Sat', whatsapp: 950, email: 480, social: 620 },
    { name: 'Sun', whatsapp: 720, email: 390, social: 380 },
];

const AUDIENCE_SEGMENTS = [
    { label: 'All Customers', count: 1248, color: 'text-slate-400' },
    { label: 'Loyal (5+ visits)', count: 284, color: 'text-primary' },
    { label: 'At Risk (30d+ gap)', count: 156, color: 'text-amber-500' },
    { label: 'New This Month', count: 92, color: 'text-emerald-500' },
];

const WHATSAPP_CAMPAIGNS = [
    { id: 'wa1', name: 'Valentine\'s Special Offer', status: 'completed', sent: 850, read: 720, date: '2026-02-12' },
    { id: 'wa2', name: 'Winter Hair Spa Day', status: 'completed', sent: 1200, read: 980, date: '2026-01-25' },
    { id: 'wa3', name: 'Weekend Grooming Alert', status: 'draft', sent: 0, read: 0, date: '--' },
];

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
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [campaignStep, setCampaignStep] = useState(1); // 1: Audience, 2: Message, 3: Sending
    const [campaignForm, setCampaignForm] = useState({
        name: '',
        type: 'bulk', // bulk or segmented
        segment: 'all',
        message: '',
        schedule: 'now'
    });
    const [sendingProgress, setSendingProgress] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const startCampaign = () => {
        setIsCampaignModalOpen(true);
        setCampaignStep(1);
        setIsSending(false);
        setSendingProgress(0);
    };

    const handleSendCampaign = () => {
        setCampaignStep(3);
        setIsSending(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            setSendingProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsSending(false);
                setTimeout(() => setIsCampaignModalOpen(false), 1500);
            }
        }, 150);
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Layout },
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
        { id: 'email', label: 'Email Center', icon: Mail },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Marketing Command Center</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Automate your growth and reach customers where they are</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-text-secondary text-sm font-bold hover:border-primary/30 hover:text-primary transition-all shadow-sm">
                        <Calendar className="w-4 h-4" /> Schedule
                    </button>
                    <button
                        onClick={startCampaign}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-sm font-black hover:brightness-110 transition-all shadow-xl shadow-primary/25 active:scale-95 leading-none"
                    >
                        <Plus className="w-4 h-4" /> NEW CAMPAIGN
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeTab === t.id
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white border-border text-text-muted hover:border-primary/30 hover:text-primary'
                            }`}
                    >
                        <t.icon className="w-3.5 h-3.5 shrink-0" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'dashboard' && <DashboardContent />}
                    {activeTab === 'whatsapp' && <WhatsAppContent onNew={() => startCampaign()} />}
                    {activeTab === 'email' && <EmailContent onOpen={() => setIsEmailModalOpen(true)} />}
                </motion.div>
            </AnimatePresence>

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
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 block">Target Audience</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'bulk', label: 'Bulk Campaign', desc: 'All Customers', icon: Users },
                                                { id: 'segmented', label: 'Smart Targeting', desc: 'Specific Groups', icon: Zap },
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
                                                    { id: 'facial_only', label: 'Facial Clients' },
                                                    { id: 'membership_exp', label: 'Membership Expired' },
                                                ].map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => setCampaignForm({ ...campaignForm, segment: s.id })}
                                                        className={`px-3 py-2 rounded-lg text-left text-[10px] font-black uppercase tracking-tight border ${campaignForm.segment === s.id ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-border hover:border-primary/30'}`}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={() => setCampaignStep(2)}
                                        disabled={!campaignForm.name}
                                        className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next: Compose Message
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Compose Message */}
                            {campaignStep === 2 && (
                                <div className="p-8 space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Message Body</label>
                                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Pick Template</button>
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
                                                <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Estimated Cost</div>
                                                <div className="text-sm font-black text-emerald-900">₹{campaignForm.type === 'bulk' ? '1,248' : '156'} <span className="text-[10px] font-bold opacity-60">(1 Credit per Msg)</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setCampaignStep(1)} className="flex-1 py-4 bg-white border border-border text-text-secondary text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-surface transition-all">Back</button>
                                        <button
                                            onClick={handleSendCampaign}
                                            disabled={!campaignForm.message}
                                            className="flex-[2] py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                                        >
                                            Send Campaign Now
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Sending */}
                            {campaignStep === 3 && (
                                <div className="p-12 flex flex-col items-center text-center space-y-8">
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

                                    <div>
                                        <h3 className="text-xl font-black text-text uppercase tracking-tight">{isSending ? 'Blasting Messages...' : 'Campaign Launched!'}</h3>
                                        <p className="text-sm text-text-muted mt-2 font-medium">
                                            {isSending
                                                ? `Sending to ${campaignForm.type === 'bulk' ? '1,248' : '156'} customers across WhatsApp.`
                                                : `Successfully delivered to all recipients in the segment.`
                                            }
                                        </p>
                                    </div>

                                    {!isSending && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                                            <CheckCircle className="w-8 h-8" />
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Email Newsletter Builder Modal ── */}
            <AnimatePresence>
                {isEmailModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEmailModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] w-full max-w-4xl h-[80vh] shadow-2xl relative overflow-hidden flex flex-col">
                            <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                                <h3 className="text-xl font-black text-text uppercase tracking-tight">Newsletter Builder</h3>
                                <button onClick={() => setIsEmailModalOpen(false)} className="p-2 hover:bg-surface rounded-full"><XCircle className="w-6 h-6 text-text-muted" /></button>
                            </div>
                            <div className="flex-1 flex bg-slate-50">
                                <div className="w-64 border-r border-border p-6 space-y-4 bg-white">
                                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">DRAG BLOCKS</h4>
                                    {['Hero Image', 'Button', 'Text Block', 'Service List', 'Footer'].map(b => (
                                        <div key={b} className="p-3 bg-surface border border-border rounded-xl text-xs font-bold cursor-move hover:border-primary transition-all flex items-center gap-2">
                                            <Layout className="w-3.5 h-3.5 text-primary" /> {b}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-1 p-12 flex items-center justify-center overflow-y-auto">
                                    <div className="w-full max-w-md bg-white shadow-xl min-h-[500px] border border-border p-8 text-center space-y-6">
                                        <div className="w-full h-32 bg-slate-100 rounded-xl flex items-center justify-center italic text-text-muted">Upload Header</div>
                                        <h2 className="text-2xl font-black text-slate-800">Your Salon Name</h2>
                                        <p className="text-sm text-slate-500">Edit this text or drag new blocks here to build your email.</p>
                                        <div className="py-3 px-8 bg-slate-900 text-white inline-block rounded-lg font-black uppercase text-[10px] tracking-widest">Book Now</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-border flex justify-end gap-3 bg-white">
                                <button className="px-6 py-2.5 rounded-xl border border-border text-xs font-black uppercase tracking-widest">Save Draft</button>
                                <button className="px-8 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest">Send Test Email</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Dashboard Tab ─────────────────────────────────────────────────────── */
function DashboardContent() {
    return (
        <div className="space-y-6">
            {/* Quick KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Campaign Reach" value="4,820" trend="+12%" icon={Users} color="bg-blue-50 text-blue-600" />
                <StatCard label="Conv. Rate" value="8.4%" trend="+2.5%" icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
                <StatCard label="Total Spent" value="₹12,450" icon={Zap} color="bg-amber-50 text-amber-600" />
                <StatCard label="App Installs" value="342" trend="+15%" icon={Smartphone} color="bg-primary/10 text-primary" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-text uppercase tracking-wider">Campaign Performance</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Metrics across all channels</p>
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
                            <AreaChart data={CAMPAIGN_STATS}>
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
                        <button className="p-2 hover:bg-surface rounded-lg transition-colors"><Plus className="w-4 h-4 text-primary" /></button>
                    </div>
                    <div className="space-y-4">
                        {AUDIENCE_SEGMENTS.map(s => (
                            <div key={s.label} className="p-4 rounded-2xl border border-border hover:border-primary/30 transition-all cursor-pointer group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-tight text-text-secondary">{s.label}</span>
                                    <span className={`text-xs font-black ${s.color}`}>{s.count}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(s.count / 1248) * 100}%` }}
                                        className={`h-full bg-primary`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 bg-surface text-text-secondary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
                        View All Segments
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── WhatsApp Tab ─────────────────────────────────────────────────────── */
function WhatsAppContent({ onNew }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <SectionHeader
                    title="WhatsApp Promotions"
                    desc="Send high-converting bulk messages and track read rates in real-time."
                    icon={MessageSquare}
                    badge="Premium"
                />
                <button
                    onClick={onNew}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus className="w-4 h-4" /> Start New Campaign
                </button>
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
                            <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">View History</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
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
                                    {WHATSAPP_CAMPAIGNS.map(c => (
                                        <tr key={c.id} className="border-b border-border/50 hover:bg-surface/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-black text-text uppercase tracking-tight">{c.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${c.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-black text-xs text-text-secondary">
                                                {c.sent} <span className="text-text-muted font-bold mx-1">/</span> <span className="text-primary">{c.read}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-xs text-text-muted italic">{c.date}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-surface rounded-lg transition-colors"><MoreVertical className="w-4 h-4 text-text-muted" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Email Tab ────────────────────────────────────────────────────────── */
function EmailContent({ onOpen }) {
    return (
        <div className="space-y-6">
            <SectionHeader
                title="Email Marketing"
                desc="Create stunning visual newsletters and automate booking confirmations."
                icon={Mail}
            />

            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { label: 'Newsletter Builder', icon: Layout, desc: 'Drag-and-drop visuals', color: 'from-blue-500 to-indigo-600', action: onOpen },
                    { label: 'Auto-Responders', icon: Zap, desc: 'Instant birthday & visit triggers', color: 'from-primary to-[#8B1A2D]' },
                    { label: 'Contact Lists', icon: Users, desc: 'Verify and clean your lists', color: 'from-emerald-500 to-teal-600' },
                ].map(b => (
                    <motion.button
                        whileHover={{ y: -5 }}
                        key={b.label}
                        onClick={b.action}
                        className="bg-white rounded-3xl border border-border p-6 shadow-sm text-left group transition-all hover:shadow-xl hover:shadow-slate-100"
                    >
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-6 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform`}>
                            <b.icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-sm font-black text-text uppercase tracking-wider mb-2">{b.label}</h4>
                        <p className="text-xs text-text-muted font-medium mb-6 leading-relaxed">{b.desc}</p>
                        <div className="h-0.5 w-8 bg-border group-hover:bg-primary group-hover:w-full transition-all duration-300" />
                    </motion.button>
                ))}
            </div>

            {/* Email Statistics Overview */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">Domain Reputation: 98%</h3>
                        <p className="text-sm text-white/50 font-medium">Your email deliverability is excellent. Your emails are landing in the Inbox.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-black">28%</div>
                            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Avg Open Rate</div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-black">4.2%</div>
                            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Avg Click Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
