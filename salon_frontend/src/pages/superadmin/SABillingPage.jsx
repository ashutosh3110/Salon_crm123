import { useState, useRef } from 'react';
import {
    CreditCard, FileText, BarChart2, DollarSign, TrendingUp,
    TrendingDown, RefreshCw, Download, Plus, Search, Filter,
    CheckCircle, XCircle, AlertCircle, Clock, RotateCcw,
    Eye, Send, X, Building2, Calendar, Receipt, Layers,
    ArrowUpRight, Printer, ExternalLink, ChevronDown,
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import CustomDropdown from '../../components/superadmin/CustomDropdown';
import { exportToExcel } from '../../utils/exportUtils';

/* ─── Mock data ─────────────────────────────────────────────────────── */
const MOCK_PAYMENTS = [
    { id: 'pay001', salon: 'Glam Studio', plan: 'Pro', amount: 4999, date: '2026-02-01', status: 'paid', method: 'Razorpay', invoice: 'INV-0023' },
    { id: 'pay002', salon: 'Luxe Cuts', plan: 'Enterprise', amount: 12999, date: '2026-02-01', status: 'paid', method: 'Stripe', invoice: 'INV-0022' },
    { id: 'pay003', salon: 'Blossom Parlour', plan: 'Basic', amount: 1999, date: '2026-02-01', status: 'paid', method: 'Razorpay', invoice: 'INV-0021' },
    { id: 'pay004', salon: 'Elite Groom', plan: 'Basic', amount: 1999, date: '2026-02-01', status: 'failed', method: 'Razorpay', invoice: 'INV-0020' },
    { id: 'pay005', salon: 'Serenity Spa', plan: 'Pro', amount: 4999, date: '2026-01-01', status: 'refunded', method: 'Stripe', invoice: 'INV-0019' },
    { id: 'pay006', salon: 'Scissors & Style', plan: 'Pro', amount: 4999, date: '2026-01-15', status: 'paid', method: 'Razorpay', invoice: 'INV-0018' },
    { id: 'pay007', salon: 'Urban Aesthetics', plan: 'Free', amount: 0, date: '2026-01-01', status: 'paid', method: '—', invoice: 'INV-0017' },
    { id: 'pay008', salon: 'The Barber Room', plan: 'Basic', amount: 1999, date: '2025-12-01', status: 'paid', method: 'Razorpay', invoice: 'INV-0016' },
    { id: 'pay009', salon: 'Glam Studio', plan: 'Basic', amount: 1999, date: '2025-12-01', status: 'paid', method: 'Razorpay', invoice: 'INV-0015' },
    { id: 'pay010', salon: 'Luxe Cuts', plan: 'Enterprise', amount: 12999, date: '2025-12-01', status: 'failed', method: 'Stripe', invoice: 'INV-0014' },
];

const MOCK_INVOICES = MOCK_PAYMENTS.map((p, i) => ({
    id: p.invoice,
    salon: p.salon,
    plan: p.plan,
    amount: p.amount,
    date: p.date,
    dueDate: new Date(new Date(p.date).getTime() + 7 * 86400000).toISOString().split('T')[0],
    status: p.status === 'paid' ? 'paid' : p.status === 'refunded' ? 'refunded' : 'overdue',
    taxAmt: Math.round(p.amount * 0.18),
    total: Math.round(p.amount * 1.18),
}));

const MONTHLY_REV = [
    { month: 'Sep', revenue: 41200, subscriptions: 98 },
    { month: 'Oct', revenue: 53400, subscriptions: 107 },
    { month: 'Nov', revenue: 48900, subscriptions: 103 },
    { month: 'Dec', revenue: 67100, subscriptions: 112 },
    { month: 'Jan', revenue: 72800, subscriptions: 119 },
    { month: 'Feb', revenue: 81500, subscriptions: 127 },
];

const PLAN_REV = [
    { plan: 'Free', revenue: 0, salons: 38, color: '#94a3b8' },
    { plan: 'Basic', revenue: 53973, salons: 27, color: '#3b82f6' },
    { plan: 'Pro', revenue: 109978, salons: 22, color: '#B85C5C' },
    { plan: 'Enterprise', revenue: 168987, salons: 13, color: '#f59e0b' },
];

const STATUS_CFG = {
    paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle },
    failed: { label: 'Failed', cls: 'bg-red-50    text-red-600    border-red-200', icon: XCircle },
    refunded: { label: 'Refunded', cls: 'bg-orange-50 text-orange-600 border-orange-200', icon: RotateCcw },
    overdue: { label: 'Overdue', cls: 'bg-red-50    text-red-600    border-red-200', icon: AlertCircle },
    pending: { label: 'Pending', cls: 'bg-blue-50   text-blue-600   border-blue-200', icon: Clock },
};

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-border rounded-xl shadow-xl p-3 text-xs">
            <p className="font-semibold text-text mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-medium">
                    {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}{suffix}
                </p>
            ))}
        </div>
    );
};

/* ─── Invoice modal ─────────────────────────────────────────────────── */
function InvoiceModal({ onClose, onSend }) {
    const [form, setForm] = useState({ salon: '', plan: 'basic', amount: 1999, dueDate: '', note: '' });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';
    const labelCls = 'block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-border rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div>
                        <h3 className="text-base font-bold text-text">Generate Invoice</h3>
                        <p className="text-xs text-text-muted mt-0.5">Manually create and send an invoice</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className={labelCls}>Salon Name *</label>
                        <input className={inputCls} value={form.salon} onChange={e => set('salon', e.target.value)} placeholder="Select or type salon name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Plan</label>
                            <CustomDropdown
                                variant="form"
                                value={form.plan}
                                onChange={v => set('plan', v)}
                                options={[
                                    { value: 'free', label: 'Free — ₹0' },
                                    { value: 'basic', label: 'Basic — ₹1,999' },
                                    { value: 'pro', label: 'Pro — ₹4,999' },
                                    { value: 'enterprise', label: 'Enterprise — ₹12,999' },
                                ]}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Amount (₹)</label>
                            <input type="number" className={inputCls} value={form.amount} onChange={e => set('amount', +e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Due Date</label>
                        <input type="date" className={inputCls} value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelCls}>Note (optional)</label>
                        <textarea className={inputCls} rows={2} value={form.note} onChange={e => set('note', e.target.value)} placeholder="Additional details…" />
                    </div>
                    {/* Tax preview */}
                    <div className="bg-surface rounded-xl p-3 space-y-1.5">
                        <div className="flex justify-between text-xs text-text-secondary">
                            <span>Subtotal</span>
                            <span>₹{form.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-text-secondary">
                            <span>GST (18%)</span>
                            <span>₹{Math.round(form.amount * 0.18).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="border-t border-border pt-1.5 flex justify-between text-sm font-black text-text">
                            <span>Total</span>
                            <span>₹{Math.round(form.amount * 1.18).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                    <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface transition-all">Cancel</button>
                    <button onClick={() => onSend(form)} disabled={!form.salon}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-sm font-bold hover:brightness-110 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function SABillingPage() {
    const [tab, setTab] = useState('payments');
    const [search, setSearch] = useState('');
    const [statusFilter, setSF] = useState('');
    const [showModal, setModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [retrying, setRetry] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    /* filtered payments */
    const filteredPayments = MOCK_PAYMENTS.filter(p => {
        const q = search.toLowerCase();
        const matchQ = !q || p.salon.toLowerCase().includes(q) || p.invoice.toLowerCase().includes(q) || p.plan.toLowerCase().includes(q);
        const matchS = !statusFilter || p.status === statusFilter;
        return matchQ && matchS;
    });

    const filteredInvoices = MOCK_INVOICES.filter(inv => {
        const q = search.toLowerCase();
        const matchQ = !q || inv.salon.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q);
        const matchS = !statusFilter || inv.status === statusFilter;
        return matchQ && matchS;
    });

    /* KPIs */
    const totalRevenue = MOCK_PAYMENTS.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0);
    const failedCount = MOCK_PAYMENTS.filter(p => p.status === 'failed').length;
    const refundTotal = MOCK_PAYMENTS.filter(p => p.status === 'refunded').reduce((a, p) => a + p.amount, 0);
    const mrr = 81500;
    const arr = mrr * 12;

    const handleRetry = async (payId) => {
        setRetry(payId);
        await new Promise(r => setTimeout(r, 1200));
        setRetry(null);
        showToast('Payment retry initiated — awaiting gateway response.', 'info');
    };

    const handleInvoiceSend = async (form) => {
        setModal(false);
        showToast(`Invoice sent to "${form.salon}" for ₹${Math.round(form.amount * 1.18).toLocaleString('en-IN')}!`);
    };

    const TABS = [
        { id: 'payments', icon: CreditCard, label: 'Payments' },
        { id: 'invoices', icon: FileText, label: 'Invoices' },
        { id: 'reports', icon: BarChart2, label: 'Reports' },
    ];

    return (
        <div className="space-y-5 pb-8">

            {toast && (
                <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-right-4 duration-300 ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}>
                    <CheckCircle className="w-4 h-4 shrink-0" /> {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight">Revenue & Billing</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Track payments, invoices and platform revenue</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => {
                        exportToExcel(MOCK_PAYMENTS, 'Wapixo_Billing_Transactions', 'Payments');
                        showToast('Report exported as Excel!', 'info');
                    }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-text-secondary text-sm font-semibold hover:border-primary/30 hover:text-primary transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => setModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/25">
                        <Plus className="w-4 h-4" /> New Invoice
                    </button>
                </div>
            </div>

            {/* ── KPI cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Collected', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', change: 11 },
                    { label: 'Failed Payments', value: failedCount, icon: XCircle, gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/20', change: -2 },
                    { label: 'Refunded', value: `₹${refundTotal.toLocaleString('en-IN')}`, icon: RotateCcw, gradient: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/20', change: null },
                ].map(k => (
                    <div key={k.label} className="bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.gradient} flex items-center justify-center shadow-lg ${k.shadow}`}>
                                <k.icon className="w-5 h-5 text-white" />
                            </div>
                            {k.change !== null && (
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${k.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                    {k.change >= 0 ? '↑' : '↓'} {Math.abs(k.change)}%
                                </span>
                            )}
                        </div>
                        <div className="text-xl font-black text-text">{k.value}</div>
                        <div className="text-xs text-text-muted mt-0.5">{k.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-2">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); setSF(''); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white text-text-secondary border border-border hover:border-primary/30 hover:text-primary'
                            }`}>
                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {/* ════ TAB: PAYMENTS ════ */}
            {tab === 'payments' && (
                <div className="space-y-4">
                    {/* Filter bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search salon, invoice, plan…"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm" />
                        </div>
                        <CustomDropdown
                            value={statusFilter}
                            onChange={setSF}
                            placeholder="All Status"
                            options={[
                                { value: '', label: 'All Status' },
                                { value: 'paid', label: 'Paid', icon: CheckCircle },
                                { value: 'failed', label: 'Failed', icon: XCircle },
                                { value: 'refunded', label: 'Refunded', icon: RotateCcw },
                            ]}
                        />
                    </div>

                    {/* Payments table */}
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-surface/60 border-b border-border">
                                        {['Invoice', 'Salon', 'Plan', 'Amount', 'Date', 'Method', 'Status'].map(h => (
                                            <th key={h} className={`text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3 text-left`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredPayments.map(p => {
                                        const sc = STATUS_CFG[p.status];
                                        return (
                                            <tr key={p.id} className="hover:bg-surface/40 transition-colors">
                                                <td className="px-4 py-3.5 text-sm font-mono text-primary font-semibold">{p.invoice}</td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary shrink-0">
                                                            {p.salon[0]}
                                                        </div>
                                                        <span className="text-sm text-text font-medium">{p.salon}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-sm text-text-secondary">{p.plan}</td>
                                                <td className="px-4 py-3.5 text-sm font-bold text-text">
                                                    {p.amount === 0 ? '—' : `₹${p.amount.toLocaleString('en-IN')}`}
                                                </td>
                                                <td className="px-4 py-3.5 text-sm text-text-muted whitespace-nowrap">{p.date}</td>
                                                <td className="px-4 py-3.5 text-sm text-text-secondary">{p.method}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${sc.cls}`}>
                                                        <sc.icon className="w-3 h-3" /> {sc.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-border px-4 py-3 flex items-center justify-between">
                            <span className="text-xs text-text-muted">{filteredPayments.length} transactions</span>
                            <span className="text-xs font-bold text-text">
                                Total: ₹{filteredPayments.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0).toLocaleString('en-IN')} collected
                            </span>
                        </div>
                    </div>

                    {/* Failed payments quick action */}
                    {MOCK_PAYMENTS.filter(p => p.status === 'failed').length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-bold text-red-700">
                                    {MOCK_PAYMENTS.filter(p => p.status === 'failed').length} Failed Payments Need Attention
                                </span>
                            </div>
                            <div className="space-y-2">
                                {MOCK_PAYMENTS.filter(p => p.status === 'failed').map(p => (
                                    <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-100">
                                        <div>
                                            <span className="text-sm font-semibold text-text">{p.salon}</span>
                                            <span className="text-xs text-text-muted ml-2">— {p.plan} · ₹{p.amount.toLocaleString('en-IN')} · {p.date}</span>
                                        </div>
                                        <button onClick={() => handleRetry(p.id)} disabled={retrying === p.id}
                                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-60">
                                            <RefreshCw className={`w-3 h-3 ${retrying === p.id ? 'animate-spin' : ''}`} />
                                            {retrying === p.id ? 'Retrying…' : 'Retry Now'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ════ TAB: INVOICES ════ */}
            {tab === 'invoices' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by salon, invoice ID…"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm" />
                        </div>
                        <CustomDropdown
                            value={statusFilter}
                            onChange={setSF}
                            placeholder="All Status"
                            options={[
                                { value: '', label: 'All Status' },
                                { value: 'paid', label: 'Paid', icon: CheckCircle },
                                { value: 'overdue', label: 'Overdue', icon: AlertCircle },
                                { value: 'refunded', label: 'Refunded', icon: RotateCcw },
                            ]}
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-surface/60 border-b border-border">
                                        {['Invoice', 'Salon', 'Plan', 'Subtotal', 'GST (18%)', 'Total', 'Due Date', 'Status'].map(h => (
                                            <th key={h} className={`text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3 text-left`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredInvoices.map(inv => {
                                        const sc = STATUS_CFG[inv.status] || STATUS_CFG.pending;
                                        return (
                                            <tr key={inv.id} className="hover:bg-surface/40 transition-colors">
                                                <td className="px-4 py-3.5 text-sm font-mono text-primary font-semibold">{inv.id}</td>
                                                <td className="px-4 py-3.5 text-sm text-text font-medium">{inv.salon}</td>
                                                <td className="px-4 py-3.5 text-sm text-text-secondary">{inv.plan}</td>
                                                <td className="px-4 py-3.5 text-sm text-text-secondary">₹{inv.amount.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3.5 text-sm text-text-secondary">₹{inv.taxAmt.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3.5 text-sm font-bold text-text">₹{inv.total.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3.5 text-sm text-text-muted">{inv.dueDate}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${sc.cls}`}>
                                                        <sc.icon className="w-3 h-3" /> {sc.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-border px-4 py-3 flex items-center justify-between">
                            <span className="text-xs text-text-muted">{filteredInvoices.length} invoices</span>
                            <span className="text-xs font-bold text-text">
                                Total incl. GST: ₹{filteredInvoices.reduce((a, inv) => a + inv.total, 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ════ TAB: REPORTS ════ */}
            {tab === 'reports' && (
                <div className="space-y-5">


                    {/* Revenue trend chart */}
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-text">Revenue Trend</h3>
                                <p className="text-xs text-text-muted mt-0.5">Monthly revenue over last 6 months</p>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">↑ 11.9% MoM</span>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={MONTHLY_REV} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#B85C5C" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#B85C5C" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip prefix="₹" />} />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#B85C5C" strokeWidth={2.5} fill="url(#revGrad2)" dot={{ r: 4, fill: '#B85C5C', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Plan-wise revenue + subscriptions */}
                    <div className="grid lg:grid-cols-2 gap-5">

                        {/* Plan revenue cards */}
                        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                            <h3 className="font-bold text-text mb-1">Revenue by Plan</h3>
                            <p className="text-xs text-text-muted mb-4">Current month breakdown</p>
                            <div className="space-y-3">
                                {PLAN_REV.map(p => {
                                    const maxRev = Math.max(...PLAN_REV.map(x => x.revenue));
                                    const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0;
                                    return (
                                        <div key={p.plan}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                                                    <span className="text-sm font-medium text-text">{p.plan}</span>
                                                    <span className="text-xs text-text-muted">({p.salons} salons)</span>
                                                </div>
                                                <span className="text-sm font-bold text-text">
                                                    {p.revenue === 0 ? '—' : `₹${p.revenue.toLocaleString('en-IN')}`}
                                                </span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%`, backgroundColor: p.color }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tax summary */}
                        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                            <h3 className="font-bold text-text mb-1">Tax Summary</h3>
                            <p className="text-xs text-text-muted mb-4">GST breakdown for current month</p>
                            <div className="space-y-3">
                                {[
                                    { label: 'Gross Revenue (Feb 2026)', value: `₹${mrr.toLocaleString('en-IN')}` },
                                    { label: 'CGST (9%)', value: `₹${Math.round(mrr * 0.09).toLocaleString('en-IN')}` },
                                    { label: 'SGST (9%)', value: `₹${Math.round(mrr * 0.09).toLocaleString('en-IN')}` },
                                    { label: 'Total GST (18%)', value: `₹${Math.round(mrr * 0.18).toLocaleString('en-IN')}`, bold: true },
                                    { label: 'Net Revenue after GST', value: `₹${Math.round(mrr / 1.18).toLocaleString('en-IN')}`, bold: true, highlight: true },
                                ].map(r => (
                                    <div key={r.label} className={`flex justify-between items-center py-2 ${r.bold ? 'border-t border-border mt-1' : ''}`}>
                                        <span className={`text-sm ${r.highlight ? 'font-bold text-emerald-700' : 'text-text-secondary'}`}>{r.label}</span>
                                        <span className={`text-sm ${r.bold ? 'font-black text-text' : 'text-text-secondary'} ${r.highlight ? 'text-emerald-700' : ''}`}>{r.value}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => {
                                exportToExcel(MOCK_INVOICES, 'Wapixo_GST_Tax_Report', 'Taxes');
                                showToast('Tax report exported as Excel!', 'info');
                            }}
                                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-xs font-bold text-text-secondary hover:border-primary/30 hover:text-primary transition-all">
                                <Download className="w-3.5 h-3.5" /> Export GST Report
                            </button>
                        </div>
                    </div>

                </div>
            )}

            {/* ── Invoice modal ── */}
            {showModal && <InvoiceModal onClose={() => setModal(false)} onSend={handleInvoiceSend} />}
        </div>
    );
}
