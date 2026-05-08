import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ClipboardList,
    PieChart,
    Download,
    Calendar,
    ArrowUpRight,
    LayoutGrid,
    List,
    RefreshCw,
} from 'lucide-react';
import api from '../../../services/api';

function formatInr(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return '₹0';
    return `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/** India FY start year (April–March): April–Dec → same calendar year start; Jan–Mar → previous year */
function currentFyStartYear() {
    const d = new Date();
    return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
}

function fyOptions(count = 4) {
    const start = currentFyStartYear();
    const out = [];
    for (let i = 0; i < count; i += 1) {
        const y = start - i;
        out.push({
            value: String(y),
            label: `FY ${y}-${String(y + 1).slice(-2)}`,
        });
    }
    return out;
}

function buildCsv(data) {
    if (!data?.monthly?.length) {
        return 'Period,Taxable Value,CGST,SGST,Total GST,Product GST,Service GST,Invoices\n';
    }
    const header =
        'Month,Taxable Value,CGST,SGST,Total GST,Product GST (est.),Service GST (est.),Invoices\n';
    const lines = data.monthly.map(
        (r) =>
            `${r.monthLabel},${r.taxable},${r.cgst},${r.sgst},${r.gstTotal},${r.productGst},${r.serviceGst},${r.invoices}`
    );
    const t = data.totals;
    const totalLine = `TOTAL,${t.taxable},${t.cgst},${t.sgst},${t.gstTotal},${t.productGst},${t.serviceGst},${t.invoices}`;
    return `${header}${lines.join('\n')}\n${totalLine}\n`;
}

export default function TaxReports() {
    const fyList = useMemo(() => fyOptions(5), []);
    const [fy, setFy] = useState(() => String(currentFyStartYear()));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/finance/tax/gst-summary', { params: { fy } });
            setData(res.data?.data || null);
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                    e?.networkHint ||
                    e.message ||
                    'GST summary load failed'
            );
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [fy]);

    useEffect(() => {
        load();
    }, [load]);

    const downloadCsv = () => {
        if (!data) return;
        const csv = buildCsv(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gst-summary-fy-${fy}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const totals = data?.totals;
    const monthly = data?.monthly || [];
    const period = data?.period;
    const assumptions = data?.assumptions;

    return (
        <div className="flex flex-col h-full slide-right overflow-y-auto no-scrollbar">
            <div className="p-8 border-b border-border bg-surface/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-bold text-text tracking-tight flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-primary" />
                        GST & Tax Reports
                    </h2>
                    <p className="text-sm text-text-secondary mt-1 font-medium">
                        Paid POS invoices se GST — monthly breakdown, GSTR-style summary (estimate).
                    </p>
                    {period ? (
                        <p className="text-[10px] font-bold text-text-muted mt-2 uppercase tracking-widest">
                            {period.fromDate} → {period.toDate}
                        </p>
                    ) : null}
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-text-secondary shadow-sm">
                        <Calendar className="w-4 h-4" />
                        <select
                            value={fy}
                            onChange={(e) => setFy(e.target.value)}
                            className="bg-transparent border-none font-bold focus:outline-none cursor-pointer"
                        >
                            {fyList.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="button"
                        onClick={load}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-white transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        type="button"
                        onClick={downloadCsv}
                        disabled={!data || loading}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-600/30 transition-all disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {error ? (
                <div className="mx-8 mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="p-16 flex justify-center text-text-muted font-bold">Loading GST data…</div>
            ) : (
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <TaxStatCard
                            title="Total GST (collected)"
                            value={formatInr(totals?.gstTotal)}
                            icon={PieChart}
                            color="blue"
                            sub={`${totals?.invoices ?? 0} invoices`}
                        />
                        <TaxStatCard
                            title="Product GST (allocated)"
                            value={formatInr(totals?.productGst)}
                            icon={LayoutGrid}
                            color="purple"
                            sub="By line share"
                        />
                        <TaxStatCard
                            title="Service GST (allocated)"
                            value={formatInr(totals?.serviceGst)}
                            icon={List}
                            color="emerald"
                            sub="By line share"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-border rounded-2xl p-5">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                Taxable turnover (est.)
                            </p>
                            <p className="text-2xl font-bold text-text mt-1">{formatInr(totals?.taxable)}</p>
                        </div>
                        <div className="bg-white border border-border rounded-2xl p-5">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                CGST + SGST (50/50 split)
                            </p>
                            <p className="text-lg font-bold text-text mt-1">
                                {formatInr(totals?.cgst)} + {formatInr(totals?.sgst)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border bg-surface/10">
                            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                Monthly tax summary
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[720px]">
                                <thead>
                                    <tr className="bg-surface/50 border-b border-border">
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                            Period
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
                                            Taxable
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
                                            CGST
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
                                            SGST
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
                                            Total GST
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
                                            Invoices
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {monthly.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-10 text-center text-sm text-text-muted font-medium"
                                            >
                                                Is period mein koi paid invoice nahi mila.
                                            </td>
                                        </tr>
                                    ) : (
                                        monthly.map((row) => (
                                            <tr key={row.monthKey} className="hover:bg-surface/30 transition-colors">
                                                <td className="px-6 py-5">
                                                    <span className="font-bold text-text text-sm">{row.monthLabel}</span>
                                                </td>
                                                <td className="px-6 py-5 text-right font-medium text-text-secondary">
                                                    {formatInr(row.taxable)}
                                                </td>
                                                <td className="px-6 py-5 text-right text-text-muted">
                                                    {formatInr(row.cgst)}
                                                </td>
                                                <td className="px-6 py-5 text-right text-text-muted">
                                                    {formatInr(row.sgst)}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <span className="font-bold text-primary">{formatInr(row.gstTotal)}</span>
                                                </td>
                                                <td className="px-6 py-5 text-right text-xs font-bold text-text-muted">
                                                    {row.invoices}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-6 bg-surface border border-border rounded-2xl flex items-start gap-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-text uppercase tracking-widest">
                                Calculation notice
                            </h4>
                            <ul className="text-xs text-text-secondary font-medium space-y-1 list-disc list-inside">
                                <li>Only <strong>paid / partially paid</strong> POS invoices (cancelled excluded).</li>
                                <li>{assumptions?.taxable || 'Taxable = subTotal − discount per invoice.'}</li>
                                <li>{assumptions?.gstSplit || ''}</li>
                                <li>{assumptions?.productServiceTax || ''}</li>
                            </ul>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                                Please reconcile with your bank and accounting books before tax filing.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TaxStatCard({ title, value, icon: Icon, color, sub }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                {sub ? (
                    <span className="text-[9px] font-bold text-text-muted bg-surface px-2 py-0.5 rounded uppercase max-w-[120px] text-right leading-tight">
                        {sub}
                    </span>
                ) : null}
            </div>
            <div className="space-y-1">
                <h3 className="text-text-secondary text-[10px] font-bold uppercase tracking-widest opacity-60">
                    {title}
                </h3>
                <div className="text-2xl font-bold text-text tracking-tight">{value}</div>
            </div>
        </div>
    );
}
