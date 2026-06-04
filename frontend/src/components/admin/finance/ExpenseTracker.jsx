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
    ArrowDownRight,
} from 'lucide-react';
import api from '../../../services/api';
import { useBusiness } from '../../../contexts/BusinessContext';
import CustomDropdown from '../../common/CustomDropdown';

const CATEGORY_OPTIONS = [
    { value: 'Rent', label: 'Rent' },
    { value: 'Salary', label: 'Salary' },
    { value: 'Electricity', label: 'Electricity' },
    { value: 'Product Purchase', label: 'Product Purchase' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Other', label: 'Other' },
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

export default function ExpenseTracker({ outletId }) {
    const [view, setView] = useState('list');
    return (
        <div className="flex flex-col h-full slide-right overflow-y-auto no-scrollbar pb-10 bg-[#fafafa]">
            {/* Header Section */}
            <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Expenses Management</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Track and manage all business expenses in one place.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={() => setView('list')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border ${view === 'list' ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                    >
                        <History className="w-4 h-4" />
                        Expense History
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('form')}
                        className={`flex items-center gap-2 px-5 py-2.5 text-white text-xs font-bold rounded-lg transition-colors shadow-sm ${view === 'form' ? 'bg-[#9a7b24]' : 'bg-[#B4912B] hover:bg-[#9a7b24]'}`}
                    >
                        <Plus className="w-4 h-4" />
                        Record New Expense
                    </button>
                </div>
            </div>

            <div className="flex-1 px-8">
                {view === 'list' ? (
                    <ExpenseList onAdd={() => setView('form')} outletId={outletId} />
                ) : (
                    <ExpenseForm onCancel={() => setView('list')} onSaved={() => setView('list')} outletId={outletId} />
                )}
            </div>
        </div>
    );
}

function ExpenseList({ onAdd, outletId }) {
    const { outlets } = useBusiness();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/finance/expenses', { params: { limit: 200, page: 1, outletId: outletId || undefined } });
            setRows(pickExpenseRows(res));
        } catch (e) {
            setError(e?.networkHint || e?.response?.data?.message || e.message || 'Failed to load expenses');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [outletId]);

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
        <div className="flex flex-col gap-6 animate-fadeIn pb-8">
            {/* Main Table Card */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Search & Actions Row */}
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search category, note, outlet…"
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-300 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={load}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={exportCsv}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            Export CSV
                        </button>
                        <button
                            type="button"
                            onClick={onAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            New
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="px-6 py-3 text-sm font-bold text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
                )}

                <div className="relative min-h-[300px] bg-white">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                            <RefreshCw className="w-6 h-6 text-[#B4912B] animate-spin" />
                        </div>
                    )}
                    
                    {filtered.length === 0 && !loading ? (
                        <div className="py-24 text-center bg-white flex flex-col items-center justify-center">
                            <img src="/vector iamge 4.png" alt="No Expenses" className="w-48 h-48 object-contain mb-4" />
                            <h3 className="text-sm font-black text-slate-800 tracking-tight mb-1">No expenses recorded yet!</h3>
                            <p className="text-xs font-semibold text-slate-500 mb-6">
                                Save your first expense to keep your records organized.
                            </p>
                            <button
                                type="button"
                                onClick={onAdd}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#B4912B] text-white text-xs font-bold rounded-lg hover:bg-[#9a7b24] transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Record New Expense
                            </button>
                        </div>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                    <th className="px-6 py-4"><div className="flex items-center gap-1">Date <ArrowDownRight className="w-3 h-3 text-slate-400" /></div></th>
                                    <th className="px-6 py-4">Category & Note</th>
                                    <th className="px-6 py-4">Outlet</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Paid Via</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 bg-white">
                                {filtered.map((exp) => (
                                    <tr key={exp.id || exp._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-bold text-slate-700">
                                                {new Date(exp.date || exp.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-xs">
                                                    {labelForCategory(exp.category)}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                                                    {exp.description || '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-bold text-slate-700">
                                                {exp.outletId?.name || exp.outletName || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-black text-slate-800">
                                                ₹{Number(exp.amount || 0).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                {exp.paymentMethod === 'cash' ? (
                                                    <Wallet className="w-3.5 h-3.5 text-[#B4912B]" />
                                                ) : (
                                                    <CreditCard className="w-3.5 h-3.5 text-[#B4912B]" />
                                                )}
                                                <span className="text-xs font-bold text-slate-700">{modeLabel(exp.paymentMethod)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                                ...
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </div>
            </div>

            {/* Outlets List Section */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Outlets List ({outlets?.length || 0})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(outlets || []).map((outlet) => {
                        const colors = ['bg-indigo-100 text-indigo-600', 'bg-emerald-100 text-emerald-600', 'bg-blue-100 text-blue-600', 'bg-rose-100 text-rose-600', 'bg-amber-100 text-amber-600'];
                        const colorClass = colors[Math.abs(outlet.name.length) % colors.length];
                        const initials = outlet.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                        
                        return (
                            <div key={outlet._id || outlet.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${colorClass}`}>
                                        {initials}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800">{outlet.name}</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <span className="text-[10px] font-bold text-emerald-600">Active</span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowDownRight className="w-4 h-4 text-slate-400 -rotate-45" />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-500 pb-4">
                <div className="text-amber-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                </div>
                <span className="text-[11px] font-semibold">Expense data is saved locally per outlet. Changes reflect instantly.</span>
            </div>
        </div>
    );
}

function ExpenseForm({ onCancel, onSaved, outletId }) {
    const { outlets, fetchOutlets } = useBusiness();
    const [saving, setSaving] = useState(false);
    const [category, setCategory] = useState('Other');
    const [amount, setAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash'); // cash | online (maps to cash | online)
    const [formOutletId, setFormOutletId] = useState(() => (outletId && outletId !== 'all' ? outletId : ''));
    const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!outlets?.length) fetchOutlets?.();
    }, [outlets?.length, fetchOutlets]);

    useEffect(() => {
        if (outletId && outletId !== 'all') {
            setFormOutletId(outletId);
        }
    }, [outletId]);

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
                paymentMethod: paymentMode === 'cash' ? 'cash' : 'upi', // Mapping 'online' to 'upi' to match backend enum
                description: notes.trim(),
                date: dateStr ? new Date(dateStr).toISOString() : undefined,
                outletId: formOutletId || undefined,
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
        <div className="p-6 max-w-2xl mx-auto animate-slideUp">
            <form onSubmit={submit} className="space-y-6 bg-surface p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                        <IndianRupee className="w-6 h-6 text-rose-500" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-text tracking-tight">
                            Record Operational Expense
                        </h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                            Saved to the finance ledger — appears in the dashboard expense mix.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Expense category</label>
                        <CustomDropdown
                            value={category}
                            onChange={setCategory}
                            placeholder="Select Category"
                            options={CATEGORY_OPTIONS}
                        />
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
                                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
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
                                    className={`flex-1 flex flex-col items-center gap-2 p-3 bg-white border rounded-2xl transition-all ${
                                        paymentMode === key
                                            ? 'border-rose-500 bg-rose-500/5 ring-2 ring-rose-500/20 shadow-sm'
                                            : 'border-border hover:border-rose-300'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentMode === key ? 'bg-rose-500/10' : 'bg-surface-alt'}`}>
                                        {key === 'cash' ? (
                                            <Wallet className={`w-4 h-4 ${paymentMode === key ? 'text-rose-500' : 'text-text-muted'}`} />
                                        ) : (
                                            <CreditCard className={`w-4 h-4 ${paymentMode === key ? 'text-rose-500' : 'text-text-muted'}`} />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Outlet</label>
                        <CustomDropdown
                            value={formOutletId}
                            onChange={setFormOutletId}
                            placeholder="All / not specified"
                            options={[
                                { label: 'All / not specified', value: '' },
                                ...(outlets || []).map((o) => ({
                                    label: o.name,
                                    value: o._id || o.id,
                                })),
                            ]}
                        />
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
                                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-2xl text-xs font-bold transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Remarks / notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Bill reference, vendor, etc."
                            rows={2}
                            className="w-full px-4 py-3 bg-white border border-border rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest text-text hover:bg-surface-alt transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:brightness-110 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Save expense
                    </button>
                </div>
            </form>
        </div>
    );
}
