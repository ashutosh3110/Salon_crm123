import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Building2, MapPin, Phone, Mail, Users, Home,
    Crown, Clock, CheckCircle, XCircle, AlertTriangle,
    Edit3, Ban, LogIn, Trash2, RefreshCw, Key,
    CalendarDays, CreditCard, BarChart2, Layers, FileText,
    ScrollText, TrendingUp, Zap, ChevronRight, Settings2,
    Calendar, Package, Heart, Target, Smartphone, DollarSign,
    MessageSquare, Star, Activity, Plus, Minus
} from 'lucide-react';

/* ─── Full mock dataset (same IDs as list) ─────────────────────────────── */
const MOCK_DB = {
    t1: {
        _id: 't1', name: 'Glam Studio', slug: 'glam-studio',
        ownerName: 'Priya Shah', email: 'priya@glam.com', phone: '9876543210',
        city: 'Mumbai', address: '14 Linking Road, Bandra West, Mumbai 400050',
        subscriptionPlan: 'pro', status: 'active',
        outletsCount: 3, staffCount: 12, trialDays: 0,
        createdAt: '2026-01-15T10:00:00Z',
        mrr: 4999, totalRevenue: 14997,
        features: { pos: true, inventory: true, marketing: true, payroll: false, crm: true, mobileApp: true, reports: true, whatsapp: false, loyalty: true },
        limits: { staffLimit: 25, outletLimit: 5, smsCredits: 1000, storageGB: 10 },
        outlets: [
            { id: 'o1', name: 'Bandra Main', address: '14 Linking Rd, Bandra', staff: 5, status: 'active' },
            { id: 'o2', name: 'Juhu Branch', address: '22 Juhu Tara Rd', staff: 4, status: 'active' },
            { id: 'o3', name: 'Andheri', address: '8 Marol MIDC', staff: 3, status: 'active' },
        ],
        staff: [
            { id: 's1', name: 'Riya Mehta', role: 'Stylist', outlet: 'Bandra Main', status: 'active' },
            { id: 's2', name: 'Ananya Roy', role: 'Receptionist', outlet: 'Bandra Main', status: 'active' },
            { id: 's3', name: 'Kiran Das', role: 'Manager', outlet: 'Juhu Branch', status: 'active' },
            { id: 's4', name: 'Pooja Singh', role: 'Stylist', outlet: 'Andheri', status: 'inactive' },
        ],
        billing: [
            { id: 'b1', date: '2026-02-01', amount: 4999, plan: 'Pro', status: 'paid', invoice: 'INV-0023' },
            { id: 'b2', date: '2026-01-01', amount: 4999, plan: 'Pro', status: 'paid', invoice: 'INV-0011' },
            { id: 'b3', date: '2025-12-01', amount: 2999, plan: 'Basic', status: 'paid', invoice: 'INV-0004' },
        ],
        logs: [
            { id: 'l1', time: '2026-02-22 14:32', action: 'Plan upgraded: Basic → Pro', actor: 'Super Admin' },
            { id: 'l2', time: '2026-02-15 09:10', action: 'New outlet added: Andheri', actor: 'Priya Shah' },
            { id: 'l3', time: '2026-01-15 10:00', action: 'Salon registered', actor: 'System' },
        ],
    },
    t2: {
        _id: 't2', name: 'The Barber Room', slug: 'barber-room',
        ownerName: 'Raj Mehta', email: 'raj@barber.com', phone: '9123456780',
        city: 'Delhi', address: '7 Connaught Place, New Delhi 110001',
        subscriptionPlan: 'basic', status: 'trial',
        outletsCount: 1, staffCount: 4, trialDays: 8,
        createdAt: '2026-02-10T08:30:00Z',
        mrr: 0, totalRevenue: 0,
        features: { pos: true, inventory: false, marketing: false, payroll: false, crm: false, mobileApp: false, reports: true, whatsapp: false, loyalty: false },
        limits: { staffLimit: 10, outletLimit: 2, smsCredits: 200, storageGB: 2 },
        outlets: [{ id: 'o1', name: 'Main Branch', address: '7 Connaught Place', staff: 4, status: 'active' }],
        staff: [
            { id: 's1', name: 'Raj Mehta', role: 'Manager', outlet: 'Main Branch', status: 'active' },
            { id: 's2', name: 'Vikram Bose', role: 'Barber', outlet: 'Main Branch', status: 'active' },
        ],
        billing: [],
        logs: [
            { id: 'l1', time: '2026-02-10 08:30', action: 'Salon registered — 14-day trial started', actor: 'System' },
        ],
    },
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const planColors = {
    free: 'bg-slate-100 text-slate-600 border-slate-200',
    basic: 'bg-blue-50 text-blue-600 border-blue-200',
    pro: 'bg-primary/10 text-primary border-primary/25',
    premium: 'bg-primary/10 text-primary border-primary/25',
    enterprise: 'bg-amber-50 text-amber-600 border-amber-200',
};

const STATUS_CFG = {
    active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle },
    trial: { label: 'Trial', cls: 'bg-blue-50 text-blue-600 border-blue-200', icon: Clock },
    expired: { label: 'Expired', cls: 'bg-orange-50 text-orange-600 border-orange-200', icon: AlertTriangle },
    suspended: { label: 'Suspended', cls: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

const FEATURE_FULL_LIST = [
    { key: 'pos', label: 'POS Terminal', icon: CreditCard, desc: 'High-speed billing & terminals' },
    { key: 'appointments', label: 'Appointments', icon: Calendar, desc: 'Real-time booking & calendar' },
    { key: 'inventory', label: 'Inventory Pro', icon: Package, desc: 'Stock management & POs' },
    { key: 'crm', label: 'CRM & Clients', icon: Heart, desc: 'History & membership tracking' },
    { key: 'marketing', label: 'Marketing Hub', icon: Target, desc: 'SMS campaigns & promotions' },
    { key: 'payroll', label: 'Staff & HR', icon: Users, desc: 'Attendance & commissions' },
    { key: 'mobileApp', label: 'Customer App', icon: Smartphone, desc: 'Branded mobile booking app' },
    { key: 'finance', label: 'Finance Hub', icon: DollarSign, desc: 'Tax reports & reconciliation' },
    { key: 'reports', label: 'Analytics AI', icon: BarChart2, desc: 'Business insights & performance' },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, desc: 'Automated confirmations' },
    { key: 'loyalty', label: 'Loyalty Flow', icon: Star, desc: 'Points, rewards & cashback' },
    { key: 'feedback', label: 'Feedback Loop', icon: Activity, desc: 'Automated reviews & ratings' },
];

const FEATURE_LIST = FEATURE_FULL_LIST.map(f => ({ key: f.key, label: f.label }));

const BILLING_STATUS = {
    paid: 'bg-emerald-50 text-emerald-600',
    failed: 'bg-red-50 text-red-600',
    refunded: 'bg-orange-50 text-orange-600',
};

/* ─── Tab button ─────────────────────────────────────────────────────── */
function Tab({ id, active, icon: Icon, label, onClick }) {
    return (
        <button onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-surface'
                }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </button>
    );
}

/* ─── Action button ──────────────────────────────────────────────────── */
function ActionBtn({ icon: Icon, label, onClick, variant = 'default' }) {
    const varCls = {
        default: 'bg-white text-text-secondary border-border hover:border-primary/30 hover:text-primary',
        danger: 'bg-white text-red-500 border-red-100 hover:bg-red-50',
        primary: 'bg-primary text-white border-primary hover:brightness-110 shadow-lg shadow-primary/20',
        blue: 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50',
    };
    return (
        <button onClick={onClick}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${varCls[variant]}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </button>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function SATenantDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState('info');
    const [toast, setToast] = useState(null);

    const t = MOCK_DB[id] || {
        ...MOCK_DB.t1,
        _id: id,
        name: 'Unknown Salon',
        ownerName: 'Unknown',
        email: 'unknown@salon.com',
    };

    const sc = STATUS_CFG[t.status] || STATUS_CFG.active;

    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(t);

    const [customForm, setCustomForm] = useState(null);

    const openCustomizer = () => {
        setCustomForm({
            features: { ...selectedTenant.features },
            limits: { ...selectedTenant.limits }
        });
        setIsCustomModalOpen(true);
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handlePlanChange = (newPlanId) => {
        const planMap = {
            free: { mrr: 0, limits: { staffLimit: 3, outletLimit: 1, smsCredits: 0, storageGB: 1 } },
            basic: { mrr: 1999, limits: { staffLimit: 10, outletLimit: 2, smsCredits: 200, storageGB: 5 } },
            pro: { mrr: 4999, limits: { staffLimit: 25, outletLimit: 5, smsCredits: 1000, storageGB: 10 } },
            enterprise: { mrr: 12999, limits: { staffLimit: 999, outletLimit: 999, smsCredits: 10000, storageGB: 100 } },
        };

        const details = planMap[newPlanId];
        setSelectedTenant(prev => ({
            ...prev,
            subscriptionPlan: newPlanId,
            mrr: details.mrr,
            limits: details.limits,
            logs: [
                { id: Date.now(), time: new Date().toISOString().slice(0, 16).replace('T', ' '), action: `Plan changed: ${prev.subscriptionPlan.toUpperCase()} → ${newPlanId.toUpperCase()}`, actor: 'Super Admin' },
                ...prev.logs
            ]
        }));

        setIsPlanModalOpen(false);
        showToast(`Plan successfully changed to ${newPlanId.toUpperCase()}`);
    };

    const handleCustomSave = () => {
        setSelectedTenant(prev => ({
            ...prev,
            subscriptionPlan: 'custom',
            features: customForm.features,
            limits: customForm.limits,
            logs: [
                { id: Date.now(), time: new Date().toISOString().slice(0, 16).replace('T', ' '), action: `Features & Limits manually customized`, actor: 'Super Admin' },
                ...prev.logs
            ]
        }));
        setIsCustomModalOpen(false);
        showToast('Custom configuration applied successfully!');
    };

    const TABS = [
        { id: 'info', icon: Building2, label: 'Info' },
        { id: 'sub', icon: CreditCard, label: 'Subscription' },
        { id: 'usage', icon: BarChart2, label: 'Usage' },
        { id: 'outlets', icon: Home, label: 'Outlets' },
        { id: 'billing', icon: FileText, label: 'Billing' },
    ];

    return (
        <div className="space-y-5 pb-8">

            {/* Plan Change Modal */}
            <AnimatePresence>
                {isPlanModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPlanModalOpen(false)} />
                        <div className="bg-white rounded-2xl border border-border w-full max-w-lg shadow-2xl relative overflow-hidden">
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-text">Assign Subscription Plan</h3>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Update salon capabilities & billing</p>
                                </div>
                                <button onClick={() => setIsPlanModalOpen(false)} className="p-2 hover:bg-surface rounded-xl transition-colors">
                                    <XCircle className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {[
                                    { id: 'free', name: 'Free Starter', price: 0, tag: 'Trial / Early Stage', color: 'slate' },
                                    { id: 'basic', name: 'Basic Growth', price: 1999, tag: 'Standard Features', color: 'blue' },
                                    { id: 'pro', name: 'Pro Business', price: 4999, tag: 'Full Control', color: 'primary' },
                                    { id: 'enterprise', name: 'Enterprise Power', price: 12999, tag: 'Unlimited Scale', color: 'amber' },
                                ].map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handlePlanChange(p.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group hover:shadow-lg ${selectedTenant.subscriptionPlan === p.id
                                            ? 'border-primary bg-primary/[0.02] ring-2 ring-primary/10'
                                            : 'border-border hover:border-primary/40'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${planColors[p.color]}`}>
                                                <Crown className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-text uppercase tracking-tight">{p.name}</div>
                                                <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{p.tag}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-text">₹{p.price.toLocaleString('en-IN')}</div>
                                            <div className="text-[9px] text-text-muted font-bold">PER MONTH</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="px-6 py-4 bg-surface text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] text-center border-t border-border">
                                Modification will be applied immediately
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Config Modal */}
            <AnimatePresence>
                {isCustomModalOpen && customForm && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCustomModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl border border-border w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-text">Customize Salon Features</h3>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Manual overrides for {selectedTenant.name}</p>
                                </div>
                                <button onClick={() => setIsCustomModalOpen(false)} className="p-2 hover:bg-surface rounded-xl transition-colors">
                                    <XCircle className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-8">
                                {/* Limits Section */}
                                <div>
                                    <h4 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5" /> Usage Quotas
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { key: 'staffLimit', label: 'Staff Limit', icon: Users },
                                            { key: 'outletLimit', label: 'Outlet Limit', icon: Home },
                                            { key: 'smsCredits', label: 'SMS Credits', icon: MessageSquare },
                                            { key: 'storageGB', label: 'Storage (GB)', icon: CreditCard },
                                        ].map(l => (
                                            <div key={l.key} className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1.5">
                                                    <l.icon className="w-3 h-3" /> {l.label}
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setCustomForm(p => ({ ...p, limits: { ...p.limits, [l.key]: Math.max(0, p.limits[l.key] - 1) } }))}
                                                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={customForm.limits[l.key]}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setCustomForm(p => ({ ...p, limits: { ...p.limits, [l.key]: val } }));
                                                        }}
                                                        className="flex-1 min-w-0 bg-surface border border-border rounded-lg text-center font-bold text-sm py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                    <button
                                                        onClick={() => setCustomForm(p => ({ ...p, limits: { ...p.limits, [l.key]: p.limits[l.key] + 1 } }))}
                                                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Features Section */}
                                <div>
                                    <h4 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Layers className="w-3.5 h-3.5" /> Module Access
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {FEATURE_FULL_LIST.map(f => (
                                            <button
                                                key={f.key}
                                                onClick={() => setCustomForm(p => ({ ...p, features: { ...p.features, [f.key]: !p.features[f.key] } }))}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${customForm.features[f.key]
                                                    ? 'bg-emerald-50/50 border-emerald-200'
                                                    : 'bg-white border-border hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${customForm.features[f.key] ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        <f.icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className={`text-xs font-bold leading-tight ${customForm.features[f.key] ? 'text-emerald-700' : 'text-text-secondary'}`}>{f.label}</div>
                                                        <div className="text-[9px] text-text-muted leading-tight mt-0.5">{f.desc}</div>
                                                    </div>
                                                </div>
                                                <div className={`w-8 h-4 rounded-full relative transition-colors ${customForm.features[f.key] ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${customForm.features[f.key] ? 'left-[18px]' : 'left-0.5'}`} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setIsCustomModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCustomSave}
                                    className="px-6 py-2 bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-sm font-bold rounded-xl hover:brightness-110 shadow-lg shadow-primary/25"
                                >
                                    Save Custom Config
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}>
                    <CheckCircle className="w-4 h-4" /> {toast.msg}
                </div>
            )}

            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-2 text-xs text-text-muted">
                <Link to="/superadmin/tenants" className="hover:text-primary transition-colors flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Salons
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-text font-semibold">{selectedTenant.name}</span>
            </div>

            {/* ── Hero card ── */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-[#8B1A2D] to-amber-500" />

                <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#8B1A2D] flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-primary/30 shrink-0">
                        {selectedTenant.name[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-xl font-black text-text">{selectedTenant.name}</h1>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_CFG[selectedTenant.status]?.cls}`}>
                                {STATUS_CFG[selectedTenant.status]?.icon && <sc.icon className="w-3 h-3" />} {selectedTenant.status.toUpperCase()}
                                {selectedTenant.status === 'trial' && ` · ${selectedTenant.trialDays}d left`}
                            </span>
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase ${planColors[selectedTenant.subscriptionPlan] || planColors.free}`}>
                                {selectedTenant.subscriptionPlan}
                            </span>
                        </div>
                        <p className="text-sm text-text-secondary font-mono mb-2">/{selectedTenant.slug}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selectedTenant.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedTenant.phone}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedTenant.city}</span>
                            <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />
                                Joined {new Date(selectedTenant.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="flex gap-4 shrink-0">
                        {[
                            { label: 'Outlets', value: selectedTenant.outletsCount, icon: Home },
                            { label: 'Staff', value: selectedTenant.staffCount, icon: Users },
                            { label: 'MRR', value: `₹${(selectedTenant.mrr || 0).toLocaleString('en-IN')}`, icon: TrendingUp },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div className="text-lg font-black text-text">{s.value}</div>
                                <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Action toolbar ── */}
                <div className="px-6 pb-5 flex flex-wrap gap-2">
                    <ActionBtn icon={Key} label="Reset Password" onClick={() => showToast('Reset email sent to ' + selectedTenant.email)} />
                    <ActionBtn icon={Clock} label="Extend Trial" onClick={() => showToast('Trial extended by 7 days')} />
                    <ActionBtn icon={Edit3} label="Change Plan" onClick={() => setIsPlanModalOpen(true)} variant="primary" />
                    <ActionBtn icon={Settings2} label="Customize" onClick={openCustomizer} variant="blue" />
                    <ActionBtn
                        icon={Ban}
                        label={selectedTenant.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        onClick={() => {
                            const newStatus = selectedTenant.status === 'suspended' ? 'active' : 'suspended';
                            setSelectedTenant(prev => ({ ...prev, status: newStatus }));
                            showToast(newStatus === 'suspended' ? 'Salon suspended' : 'Salon reactivated');
                        }}
                        variant="danger"
                    />
                    <ActionBtn icon={RefreshCw} label="Force Logout" onClick={() => showToast('All sessions cleared')} variant="danger" />
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {TABS.map(t2 => (
                    <Tab key={t2.id} id={t2.id} active={tab === t2.id} icon={t2.icon} label={t2.label} onClick={setTab} />
                ))}
            </div>

            {/* ══ TAB CONTENT ══ */}

            {/* INFO */}
            {tab === 'info' && (
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                        <h3 className="font-bold text-text text-sm border-b border-border pb-2">Salon Information</h3>
                        {[
                            { label: 'Salon Name', value: selectedTenant.name },
                            { label: 'Owner', value: selectedTenant.ownerName },
                            { label: 'Email', value: selectedTenant.email },
                            { label: 'Phone', value: selectedTenant.phone },
                            { label: 'City', value: selectedTenant.city },
                            { label: 'Full Address', value: selectedTenant.address },
                            { label: 'Slug', value: `/${selectedTenant.slug}`, mono: true },
                        ].map(r => (
                            <div key={r.label} className="flex justify-between gap-4">
                                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider shrink-0">{r.label}</span>
                                <span className={`text-sm text-text text-right ${r.mono ? 'font-mono text-primary' : ''}`}>{r.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                        <h3 className="font-bold text-text text-sm border-b border-border pb-2">Platform Metrics</h3>
                        {[
                            { label: 'Status', value: selectedTenant.status.charAt(0).toUpperCase() + selectedTenant.status.slice(1) },
                            { label: 'Plan', value: selectedTenant.subscriptionPlan.toUpperCase() },
                            { label: 'Outlets', value: selectedTenant.outletsCount },
                            { label: 'Staff Count', value: selectedTenant.staffCount },
                            { label: 'Monthly Revenue', value: `₹${(selectedTenant.mrr || 0).toLocaleString('en-IN')}` },
                            { label: 'Total Revenue', value: `₹${(selectedTenant.totalRevenue || 0).toLocaleString('en-IN')}` },
                            { label: 'Joined', value: new Date(selectedTenant.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) },
                        ].map(r => (
                            <div key={r.label} className="flex justify-between">
                                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">{r.label}</span>
                                <span className="text-sm font-semibold text-text">{r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SUBSCRIPTION */}
            {tab === 'sub' && (
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                        <h3 className="font-bold text-text text-sm border-b border-border pb-2">Current Plan</h3>
                        <div className={`inline-flex gap-2 items-center px-3 py-1.5 rounded-xl border text-sm font-bold uppercase ${planColors[selectedTenant.subscriptionPlan] || planColors.free}`}>
                            <Crown className="w-4 h-4" /> {selectedTenant.subscriptionPlan}
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Limits</p>
                            {[
                                { label: 'Staff Limit', value: selectedTenant.limits?.staffLimit ?? '—' },
                                { label: 'Outlet Limit', value: selectedTenant.limits?.outletLimit ?? '—' },
                                { label: 'SMS Credits', value: selectedTenant.limits?.smsCredits ?? '—' },
                                { label: 'Storage', value: selectedTenant.limits?.storageGB ? `${selectedTenant.limits.storageGB} GB` : '—' },
                            ].map(r => (
                                <div key={r.label} className="flex justify-between py-1.5 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">{r.label}</span>
                                    <span className="text-sm font-bold text-text">{r.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                        <h3 className="font-bold text-text text-sm border-b border-border pb-2">Feature Access</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {FEATURE_LIST.map(f => (
                                <div key={f.key} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${selectedTenant.features?.[f.key]
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-50 text-slate-400 border-slate-200'
                                    }`}>
                                    {selectedTenant.features?.[f.key]
                                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                    }
                                    {f.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* USAGE */}
            {tab === 'usage' && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: 'Active Outlets', value: selectedTenant.outlets?.filter(o => o.status === 'active').length ?? 0, max: selectedTenant.limits?.outletLimit, icon: Home, color: 'from-blue-500 to-indigo-600' },
                        { label: 'Staff Members', value: selectedTenant.staffCount, max: selectedTenant.limits?.staffLimit, icon: Users, color: 'from-primary to-[#8B1A2D]' },
                        { label: 'Bookings (Month)', value: 284, max: null, icon: CalendarDays, color: 'from-emerald-500 to-teal-600' },
                    ].map(u => (
                        <div key={u.label} className="bg-white rounded-2xl border border-border shadow-sm p-5">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${u.color} flex items-center justify-center mb-3 shadow-lg`}>
                                <u.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-2xl font-black text-text">{u.value}</div>
                            <div className="text-xs text-text-muted mt-0.5">{u.label}{u.max ? ` / ${u.max} limit` : ''}</div>
                            {u.max && typeof u.value === 'number' && (
                                <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${u.color} transition-all duration-700`}
                                        style={{ width: `${Math.min(100, (u.value / u.max) * 100)}%` }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* OUTLETS */}
            {tab === 'outlets' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-text">Outlets ({selectedTenant.outlets?.length ?? 0})</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {(selectedTenant.outlets || []).map(o => (
                            <div key={o.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-surface/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary shrink-0">
                                        {o.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-text">{o.name}</div>
                                        <div className="text-xs text-text-muted">{o.address}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-xs text-text-secondary flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" /> {o.staff} staff
                                    </div>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${o.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {o.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* BILLING */}
            {tab === 'billing' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                        <h3 className="font-bold text-text">Billing History</h3>
                    </div>
                    {!selectedTenant.billing?.length ? (
                        <div className="text-center py-16">
                            <CreditCard className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
                            <p className="text-sm text-text-secondary">No billing history yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-surface/50 border-b border-border">
                                        {['Invoice', 'Date', 'Plan', 'Amount', 'Status'].map(h => (
                                            <th key={h} className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-5 py-3 text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {selectedTenant.billing.map(b => (
                                        <tr key={b.id} className="hover:bg-surface/40 transition-colors">
                                            <td className="px-5 py-3.5 text-sm font-mono text-primary">{b.invoice}</td>
                                            <td className="px-5 py-3.5 text-sm text-text-secondary">{b.date}</td>
                                            <td className="px-5 py-3.5 text-sm text-text-secondary">{b.plan}</td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-text">₹{b.amount.toLocaleString('en-IN')}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${BILLING_STATUS[b.status]}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
