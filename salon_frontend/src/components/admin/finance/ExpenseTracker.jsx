import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    IndianRupee,
    Plus,
    History,
    Search,
    Calendar,
    Store,
    CreditCard,
    Wallet,
    Tag,
    FileText,
    Send,
    Download,
    RefreshCw,
    Loader2,
} from 'lucide-react';
import api from '../../../services/api';
import { useBusiness } from '../../../contexts/BusinessContext';

const CATEGORY_OPTIONS = [
    { value: 'rent', label: 'Rent' },
    { value: 'utilities', label: 'Electricity / Utilities' },
    { value: 'welfare', label: 'Staff welfare / Tea & snacks' },
    { value: 'maintenance', label: 'Repairs & maintenance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'supplies', label: 'Cleaning / supplies' },
    { value: 'salary', label: 'Salary / payroll' },
    { value: 'inventory', label: 'Inventory (non-supplier)' },
    { value: 'commission', label: 'Commission' },
    { value: 'other', label: 'Other' },
];

const CATEGORY_LABEL = Object.fromEntries(CATEGORY_OPTIONS.map((o) => [o.value, o.label]));

function labelForCategory(key) {
    return CATEGORY_LABEL[key] || key || '—';
}

function pickExpenseRows(res) {
    const d = res?.data?.data ?? res?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.results)) return d.results;
    return [];
}

export default function ExpenseTracker() {
    const [view, setView] = useState('list');
    return (
        <div className="flex flex-col h-full slide-right overflow-hidden">
            <div className="px-8 py-6 border-b border-border bg-surface/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap gap-4 p-1 bg-surface-alt rounded-xl border border-border">
                    <button
                        type="button"
                        onClick={() => setView('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        <History className="w-3.5 h-3.5" />
                        Expense History
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('form')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'form' ? 'bg-white text-rose-600 shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Record New Expense
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                {view === 'list' ? (
                    <ExpenseList onAdd={() => setView('form')} />
                ) : (
                    <ExpenseForm onCancel={() => setView('list')} onSaved={() => setView('list')} />
                )}
            </div>
        </div>
    );
}

function ExpenseList({ onAdd }) {
    const { outlets } = useBusiness();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/finance/expenses', { params: { limit: 200, page: 1 } });
            setRows(pickExpenseRows(res));
        } catch (e) {
            setError(e?.networkHint || e?.response?.data?.message || e.message || 'Failed to load expenses');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => {
            const cat = labelForCategory(r.category).toLowerCase();
            const desc = String(r.description || '').toLowerCase();
            const out = String(r.outletName || '').toLowerCase();
            return cat.includes(q) || desc.includes(q) || out.includes(q);
        });
    }, [rows, search]);

    const exportCsv = () => {
        const header = ['Date', 'Category', 'Description', 'Outlet', 'Amount', 'Paid via'];
        const lines = [
            header.join(','),
            ...filtered.map((r) =>
                [
                    new Date(r.date || r.createdAt).toISOString().slice(0, 10),
                    `"${labelForCategory(r.category).replace(/"/g, '""')}"`,
                    `"${String(r.description || '').replace(/"/g, '""')}"`,
                    `"${String(r.outletName || '—').replace(/"/g, '""')}"`,
                    r.amount,
                    r.paymentMethod,
                ].join(',')
            ),
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const modeLabel = (m) => {
        if (m === 'cash') return 'Cash';
        if (m === 'card') return 'Card';
        if (m === 'online') return 'Bank / Online';
        return m || '—';
    };

    return (
        <div className="p-0 animate-fadeIn table-responsive">
            <div className="px-8 py-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-border bg-surface/20">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search category, note, outlet…"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={load}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-surface disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh
                    </button>
                    <button
                        type="button"
                        onClick={exportCsv}
                        disabled={!filtered.length}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-surface disabled:opacity-40"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>
                    <button
                        type="button"
                        onClick={onAdd}
                        className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New
                    </button>
                </div>
            </div>

            {error && (
                <div className="px-8 py-3 text-sm font-bold text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
            )}

            <div className="relative min-h-[200px]">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                )}
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-surface/50 border-b border-border">
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Date</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Category & Note</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Outlet</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Amount</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Paid Via</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-8 py-16 text-center text-sm text-text-muted font-bold">
                                    No expenses yet. Use &quot;Record New Expense&quot; — saved to{' '}
                                    <span className="font-mono">POST /v1/finance/expenses</span>.
                                </td>
                            </tr>
                        )}
                        {filtered.map((exp) => (
                            <tr key={exp.id || exp._id} className="hover:bg-rose-50/20 transition-colors group cursor-default">
                                <td className="px-8 py-5">
                                    <span className="text-xs font-semibold text-text-secondary">
                                        {new Date(exp.date || exp.createdAt).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-text text-sm group-hover:text-rose-600 transition-colors">
                                            {labelForCategory(exp.category)}
                                        </span>
                                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5 line-clamp-2">
                                            {exp.description || '—'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-2.5 py-1 bg-surface border border-border rounded-lg text-[9px] font-bold text-text-secondary uppercase tracking-widest">
                                        {exp.outletName || '—'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <span className="text-sm font-bold text-rose-600">
                                        ₹{Number(exp.amount || 0).toLocaleString('en-IN')}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        {exp.paymentMethod === 'cash' ? (
                                            <Wallet className="w-3.5 h-3.5 text-orange-500" />
                                        ) : (
                                            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                                        )}
                                        <span className="text-xs font-semibold text-text-secondary">{modeLabel(exp.paymentMethod)}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="px-8 py-3 text-[10px] font-bold text-text-muted border-t border-border bg-surface/30">
                Outlets list from salon settings ({outlets?.length || 0} outlet{outlets?.length === 1 ? '' : 's'}).
            </p>
        </div>
    );
}

function ExpenseForm({ onCancel, onSaved }) {
    const { outlets, fetchOutlets } = useBusiness();
    const [saving, setSaving] = useState(false);
    const [category, setCategory] = useState('other');
    const [amount, setAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash'); // cash | online (maps to cash | online)
    const [outletId, setOutletId] = useState('');
    const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!outlets?.length) fetchOutlets?.();
    }, [outlets?.length, fetchOutlets]);

    const submit = async (e) => {
        e.preventDefault();
        const amt = Number(amount);
        if (!Number.isFinite(amt) || amt <= 0) {
            window.alert('Enter a valid amount.');
            return;
        }
        setSaving(true);
        try {
            await api.post('/finance/expenses', {
                amount: amt,
                category,
                paymentMethod: paymentMode === 'cash' ? 'cash' : 'online',
                description: notes.trim(),
                date: dateStr ? new Date(dateStr).toISOString() : undefined,
                outletId: outletId || undefined,
            });
            window.alert('Expense saved.');
            onSaved?.();
        } catch (err) {
            window.alert(err?.response?.data?.message || err.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-10 max-w-2xl mx-auto animate-slideUp">
            <form onSubmit={submit} className="space-y-8 bg-surface/20 p-8 rounded-3xl border border-border/50">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-text tracking-tight flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-rose-600" />
                        Record operational expense
                    </h3>
                    <p className="text-sm text-text-secondary font-medium">
                        Saved to the finance ledger — appears in the dashboard expense mix and MTD totals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Expense category</label>
                        <div className="relative group">
                            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-rose-500 transition-colors" />
                            <select
                                required
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
                            >
                                {CATEGORY_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Amount (₹)</label>
                        <div className="relative group">
                            <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-rose-500 transition-colors" />
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="₹ 0.00"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Payment mode</label>
                        <div className="flex gap-4 pt-1">
                            {[
                                { key: 'cash', label: 'Cash' },
                                { key: 'online', label: 'Bank / Online' },
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setPaymentMode(key)}
                                    className={`flex-1 flex flex-col items-center gap-2 p-3 bg-white border rounded-xl transition-all ${
                                        paymentMode === key
                                            ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20'
                                            : 'border-border hover:border-rose-300'
                                    }`}
                                >
                                    {key === 'cash' ? (
                                        <Wallet className="w-5 h-5 text-text-muted" />
                                    ) : (
                                        <CreditCard className="w-5 h-5 text-text-muted" />
                                    )}
                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Outlet</label>
                        <div className="relative">
                            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <select
                                value={outletId}
                                onChange={(e) => setOutletId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none transition-all"
                            >
                                <option value="">All / not specified</option>
                                {(outlets || []).map((o) => (
                                    <option key={o._id || o.id} value={o._id || o.id}>
                                        {o.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="date"
                                required
                                value={dateStr}
                                onChange={(e) => setDateStr(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Remarks / notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Bill reference, vendor, etc."
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3.5 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-rose-600/30 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Save expense
                    </button>
                </div>
            </form>
        </div>
    );
}
