import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    FileText,
    Calendar,
    Clock,
    Search,
    Filter,
    Download,
    ArrowRight,
    RefreshCw,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

function pickResults(res) {
    const d = res?.data?.data ?? res?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.results)) return d.results;
    return [];
}

export default function SupplierInvoices() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [payingKey, setPayingKey] = useState(null);
    const [payAmount, setPayAmount] = useState('');
    const [payNote, setPayNote] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/suppliers/invoices');
            setRows(pickResults(res));
        } catch (e) {
            const msg =
                e?.networkHint ||
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                (e?.response?.status === 403 && e?.response?.data?.errorCode === 'ONBOARDING_REQUIRED'
                    ? 'Complete onboarding first, or ensure your account has a salon (tenant) assigned.'
                    : null) ||
                e.message ||
                'Failed to load supplier invoices';
            setError(msg);
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        let list = rows;
        const q = search.trim().toLowerCase();
        if (q) {
            list = list.filter(
                (r) =>
                    String(r.supplierName || '')
                        .toLowerCase()
                        .includes(q) ||
                    String(r.invoiceNo || '')
                        .toLowerCase()
                        .includes(q) ||
                    String(r.invoiceRef || '')
                        .toLowerCase()
                        .includes(q)
            );
        }
        if (statusFilter !== 'All') {
            list = list.filter((r) => r.status === statusFilter);
        }
        return list;
    }, [rows, search, statusFilter]);

    const statusOptions = ['All', 'Pending', 'Partial', 'Paid', 'Overdue'];

    const openPay = (inv) => {
        if (inv.status === 'Paid' || inv.outstanding <= 0) {
            window.alert('This invoice is already fully paid.');
            return;
        }
        setPayingKey(inv.invoiceKey);
        setPayAmount(String(Math.max(0, Number(inv.outstanding) || 0)));
        setPayNote('');
    };

    const submitPayment = async () => {
        const amt = Number(payAmount);
        if (!payingKey || !Number.isFinite(amt) || amt <= 0) {
            window.alert('Enter a valid payment amount.');
            return;
        }
        try {
            await api.post('/suppliers/invoices/payments', {
                invoiceKey: payingKey,
                amount: amt,
                note: payNote?.trim() || undefined,
            });
            setPayingKey(null);
            await load();
        } catch (e) {
            window.alert(e?.response?.data?.message || e.message || 'Payment failed');
        }
    };

    const exportCsv = () => {
        const header = [
            'Supplier',
            'Invoice',
            'Billing date',
            'Due date',
            'Amount',
            'Paid',
            'Outstanding',
            'Status',
        ];
        const lines = [
            header.join(','),
            ...filtered.map((r) =>
                [
                    `"${String(r.supplierName).replace(/"/g, '""')}"`,
                    `"${String(r.invoiceNo).replace(/"/g, '""')}"`,
                    r.invoiceDate,
                    r.dueDate,
                    r.amount,
                    r.paidAmount,
                    r.outstanding,
                    r.status,
                ].join(',')
            ),
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `supplier-invoices-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full slide-right overflow-hidden">
            <div className="p-6 border-b border-border bg-surface/30 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto flex-wrap">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter by invoice # or supplier..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl text-xs font-bold text-text-secondary">
                            <Filter className="w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent outline-none font-bold"
                            >
                                {statusOptions.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={load}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-surface transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Refresh
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={exportCsv}
                    disabled={!filtered.length}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-600/30 transition-all scale-active disabled:opacity-40"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {error && (
                <div className="px-6 py-3 bg-rose-500/10 text-rose-700 text-sm font-bold border-b border-rose-500/20">
                    {error}
                </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar bg-white p-0 table-responsive relative">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                )}
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-surface/50 border-b border-border">
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Supplier & Invoice
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Billing Date
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
                                Invoice Amount
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Due Date
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Settlement
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-8 py-16 text-center text-sm text-text-muted font-bold">
                                    No supplier invoices yet. Record stock-in with an invoice # under Inventory → Stock In.
                                </td>
                            </tr>
                        )}
                        {filtered.map((inv) => (
                            <tr key={inv.invoiceKey} className="hover:bg-surface/30 transition-colors group cursor-default">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2 rounded-lg ${
                                                inv.status === 'Paid'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-surface text-text-muted'
                                            }`}
                                        >
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-text text-sm group-hover:text-primary transition-colors truncate">
                                                {inv.supplierName}
                                            </span>
                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5 truncate">
                                                # {inv.invoiceNo}
                                            </span>
                                            {inv.isAdHoc && (
                                                <span className="text-[9px] text-amber-600 font-bold mt-0.5">
                                                    Add invoice # on future stock-ins to group lines
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-xs font-semibold text-text-secondary">
                                        {inv.invoiceDate
                                            ? new Date(inv.invoiceDate).toLocaleDateString()
                                            : '—'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <span className="text-sm font-bold text-text tracking-tight">
                                        ₹{Number(inv.amount || 0).toLocaleString('en-IN')}
                                    </span>
                                    {inv.paidAmount > 0 && (
                                        <p className="text-[10px] text-text-muted mt-0.5">
                                            Paid ₹{Number(inv.paidAmount).toLocaleString('en-IN')}
                                        </p>
                                    )}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <Clock
                                            className={`w-3.5 h-3.5 ${
                                                inv.status === 'Overdue' ? 'text-rose-500' : 'text-text-muted'
                                            }`}
                                        />
                                        <span
                                            className={`text-xs font-semibold ${
                                                inv.status === 'Overdue' ? 'text-rose-600' : 'text-text-secondary'
                                            }`}
                                        >
                                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                                            inv.status === 'Paid'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : inv.status === 'Overdue'
                                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                  : inv.status === 'Partial'
                                                    ? 'bg-sky-50 text-sky-600 border-sky-100'
                                                    : 'bg-orange-50 text-orange-500 border-orange-100'
                                        }`}
                                    >
                                        {inv.status}
                                    </span>
                                    {inv.outstanding > 0 && inv.status !== 'Paid' && (
                                        <p className="text-[10px] text-text-muted mt-1 font-bold">
                                            Due ₹{Number(inv.outstanding).toLocaleString('en-IN')}
                                        </p>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button
                                        type="button"
                                        onClick={() => openPay(inv)}
                                        disabled={inv.status === 'Paid' || inv.outstanding <= 0}
                                        className="px-4 py-2 bg-white border border-border rounded-xl text-[10px] font-bold text-text-muted uppercase tracking-wider hover:bg-primary hover:text-white hover:border-primary transition-all group/btn disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        Record payment
                                        <ArrowRight className="w-3 h-3 inline-block ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {payingKey && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-surface border border-border p-6 max-w-md w-full shadow-xl rounded-2xl space-y-4">
                        <h3 className="text-lg font-black text-text">Record supplier payment</h3>
                        <p className="text-xs text-text-muted font-bold">
                            Outstanding: ₹
                            {Number(
                                rows.find((r) => r.invoiceKey === payingKey)?.outstanding || 0
                            ).toLocaleString('en-IN')}
                        </p>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase">Amount (₹)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                className="w-full px-4 py-2 border border-border rounded-xl text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase">Note (optional)</label>
                            <input
                                type="text"
                                value={payNote}
                                onChange={(e) => setPayNote(e.target.value)}
                                className="w-full px-4 py-2 border border-border rounded-xl text-sm"
                            />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setPayingKey(null)}
                                className="px-4 py-2 text-sm font-bold text-text-muted"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submitPayment}
                                className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-wider"
                            >
                                Save payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 bg-primary/5 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
                <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest max-w-3xl">
                    Invoice totals are built from{' '}
                    <span className="font-mono">Inventory → Stock In</span> (same invoice # + supplier groups lines).
                    Due date defaults to 30 days from the first line date.
                    <button
                        type="button"
                        onClick={() => navigate('/admin/inventory/stock-in')}
                        className="ml-2 underline hover:text-primary-dark transition-colors"
                    >
                        Go to Stock In →
                    </button>
                </p>
            </div>
        </div>
    );
}
