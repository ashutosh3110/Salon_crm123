import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    TrendingUp,
    Users,
    DownloadCloud,
    Calendar,
    ArrowDownRight,
    PieChart as PieIcon,
    BarChart3,
    Activity,
    Package,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
} from 'recharts';
import api from '../../services/api';
import FinanceDashboard from '../../components/admin/finance/FinanceDashboard';
import SupplierManager from '../../components/admin/finance/SupplierManager';
import SupplierInvoices from '../../components/admin/finance/SupplierInvoices';
import ExpenseTracker from '../../components/admin/finance/ExpenseTracker';
import CashAndBank from '../../components/admin/finance/CashAndBank';
import TaxReports from '../../components/admin/finance/TaxReports';
import EndOfDay from '../../components/admin/finance/EndOfDay';
import PettyCashPage from '../accountant/PettyCashPage';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function formatInrShort(n) {
    if (n == null || Number.isNaN(Number(n))) return '₹0';
    const v = Number(n);
    const abs = Math.abs(v);
    if (abs >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`;
    if (abs >= 1e5) return `₹${(v / 1e5).toFixed(2)}L`;
    if (abs >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
    return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

export default function FinancePage({ tab = 'dashboard' }) {
    const activeTab = tab;
    const [financeData, setFinanceData] = useState(null);
    const [financeLoading, setFinanceLoading] = useState(true);
    const [financeError, setFinanceError] = useState(null);

    const loadFinance = useCallback(() => {
        setFinanceLoading(true);
        setFinanceError(null);
        api
            .get('/invoices/finance-dashboard')
            .then((res) => setFinanceData(res.data))
            .catch((e) => {
                setFinanceError(
                    e?.networkHint ||
                        e?.response?.data?.message ||
                        e.message ||
                        'Failed to load'
                );
                setFinanceData(null);
            })
            .finally(() => setFinanceLoading(false));
    }, []);

    useEffect(() => {
        loadFinance();
    }, [loadFinance]);

    const allocationData = useMemo(() => {
        const ca = financeData?.costAllocation || [];
        if (!ca.length) {
            return [];
        }
        return ca.map((c, i) => ({
            name: String(c.label || 'other').toUpperCase().slice(0, 14),
            value: Math.max(1, c.percentage || 0),
            color: CHART_COLORS[i % CHART_COLORS.length],
        }));
    }, [financeData]);

    const hasExpenseMix = allocationData.length > 0;

    const flowData = useMemo(() => {
        const m = financeData?.monthlyTrend || [];
        return m.slice(-6).map(({ name, revenue, expense }) => ({
            name: name || '—',
            inflow: revenue ?? 0,
            outflow: expense ?? 0,
        }));
    }, [financeData]);

    const kpis = financeData?.kpis || {};

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Finances</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-relaxed text-left max-w-2xl">
                        Live summary from <span className="font-mono">/invoices/finance-dashboard</span>
                        <span className="block mt-1.5 normal-case tracking-normal text-[11px] font-bold opacity-90">
                            POS sales, expense ledger, and inventory stock-in (this month). ₹0 means no activity yet in that lane.
                        </span>
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-left font-black">
                    <button
                        type="button"
                        onClick={loadFinance}
                        disabled={financeLoading}
                        className="flex items-center gap-3 bg-surface border border-border px-8 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm disabled:opacity-50"
                    >
                        <DownloadCloud className="w-4 h-4" />
                        Refresh data
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-3 bg-primary text-primary-foreground border border-primary px-10 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all"
                    >
                        <Calendar className="w-4 h-4" />
                        Choose Period
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 text-left font-black">
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-left font-black auto-rows-fr">
                    <FinanceKPICard
                        className="lg:col-span-2"
                        title="Gross inflow (MTD)"
                        value={financeLoading ? '…' : formatInrShort(kpis.grossInflow ?? 0)}
                        icon={TrendingUp}
                        color="blue"
                        trend="POS invoices"
                    />
                    <FinanceKPICard
                        className="lg:col-span-2"
                        title="Total expenses (MTD)"
                        value={financeLoading ? '…' : formatInrShort(kpis.totalExpenses ?? 0)}
                        icon={ArrowDownRight}
                        color="rose"
                        trend="Ledger"
                    />
                    <FinanceKPICard
                        className="lg:col-span-2"
                        title="Supplier stock-in (MTD)"
                        value={financeLoading ? '…' : formatInrShort(kpis.supplierPurchasesMtd ?? 0)}
                        icon={Package}
                        color="violet"
                        trend="Stock-in"
                    />
                    <FinanceKPICard
                        className="lg:col-span-3"
                        title="Refund queue"
                        value={financeLoading ? '…' : String(kpis.pendingRefunds ?? 0)}
                        icon={Users}
                        color="orange"
                        trend={kpis.liabilityHint ? String(kpis.liabilityHint).slice(0, 28) : '—'}
                    />
                    <FinanceKPICard
                        className="lg:col-span-3"
                        title="Net (MTD)"
                        value={financeLoading ? '…' : formatInrShort(kpis.netLiquidity ?? 0)}
                        icon={Activity}
                        color="emerald"
                        trend="Inflow − expenses"
                    />
                </div>

                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Expense mix (90d)</span>
                        <PieIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left relative">
                        {hasExpenseMix ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={allocationData}
                                        innerRadius={25}
                                        outerRadius={45}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="transparent"
                                    >
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0px',
                                            fontSize: '9px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center px-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-70">
                                    No expense categories (90d)
                                </p>
                                <p className="text-[9px] font-bold text-text-muted mt-1 opacity-60">
                                    Add expenses under Finance → Expenses
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-left min-h-[1.25rem]">
                        {hasExpenseMix ? (
                            allocationData.map((d) => (
                                <div key={d.name} className="flex items-center gap-1.5 text-left">
                                    <div className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: d.color }} />
                                    <span className="text-[7px] font-black uppercase text-text-muted leading-none">{d.name}</span>
                                </div>
                            ))
                        ) : (
                            <span className="text-[7px] font-black uppercase text-text-muted opacity-50">—</span>
                        )}
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Recent months</span>
                        <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left">
                        {flowData.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-70">
                                    No monthly trend
                                </p>
                                <p className="text-[9px] font-bold text-text-muted mt-1 opacity-60">
                                    Load the dashboard after POS / expense activity
                                </p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={flowData}>
                                    <Bar dataKey="inflow" fill="var(--primary)" radius={0} />
                                    <Bar dataKey="outflow" fill="#8B1A2D" radius={0} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0px',
                                            fontSize: '9px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase',
                                        }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-4 text-[7px] font-black uppercase text-text-muted tracking-[0.1em] text-center italic opacity-40">
                        Last 6 months inflow / outflow
                    </div>
                </div>
            </div>

            {financeError ? (
                <div
                    role="alert"
                    className="rounded-none border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900 px-4 py-3 text-left"
                >
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-300 mb-1">
                        Could not load finance summary
                    </p>
                    <p className="text-sm font-bold text-rose-800 dark:text-rose-200 break-words">{financeError}</p>
                    <button
                        type="button"
                        onClick={loadFinance}
                        className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary underline underline-offset-2"
                    >
                        Try again
                    </button>
                </div>
            ) : null}

            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[650px] text-left font-black">
                {activeTab === 'dashboard' && (
                    <FinanceDashboard
                        data={financeData}
                        loading={financeLoading}
                        error={financeError}
                        onRetry={loadFinance}
                    />
                )}
                {activeTab === 'suppliers' && <SupplierManager />}
                {activeTab === 'invoices' && <SupplierInvoices />}
                {activeTab === 'expenses' && <ExpenseTracker />}
                {activeTab === 'petty-cash' && <PettyCashPage />}
                {activeTab === 'reconciliation' && <CashAndBank />}
                {activeTab === 'tax' && <TaxReports />}
                {activeTab === 'eod' && <EndOfDay />}
            </div>
        </div>
    );
}

const trendBadgeClass = (color) => {
    const map = {
        blue: 'border-primary/40 text-primary bg-primary/5',
        rose: 'border-rose-500/50 text-rose-600 bg-rose-500/5',
        orange: 'border-orange-500/50 text-orange-600 bg-orange-500/5',
        emerald: 'border-emerald-500/50 text-emerald-600 bg-emerald-500/5',
        violet: 'border-violet-500/50 text-violet-600 bg-violet-500/5',
    };
    return map[color] || map.emerald;
};

function FinanceKPICard({ title, value, icon: Icon, color, trend, className = '' }) {
    const colors = {
        blue: 'text-primary',
        rose: 'text-rose-500',
        orange: 'text-orange-500',
        emerald: 'text-emerald-500',
        violet: 'text-violet-600',
    };

    const trendText = trend != null ? String(trend) : '—';

    return (
        <div
            className={`bg-surface p-5 sm:p-6 rounded-none border border-border shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all group relative overflow-hidden text-left font-black flex flex-col min-h-[160px] ${className}`}
        >
            <div className={`absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rotate-12 transition-all group-hover:bg-primary/10`} />
            <div className="flex justify-between items-start gap-2 mb-4 text-left font-black min-h-[2.75rem]">
                <div className={`shrink-0 p-3 rounded-none ${colors[color]} border border-current bg-surface shadow-inner group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 font-black" />
                </div>
                <span
                    title={trendText}
                    className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-none border max-w-[58%] min-w-0 text-right leading-snug line-clamp-3 ${trendBadgeClass(color)}`}
                >
                    {trendText}
                </span>
            </div>
            <div className="space-y-1.5 mt-auto text-left font-black leading-tight">
                <h3 className="text-text-muted text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-60 line-clamp-2">
                    {title}
                </h3>
                <div className="text-2xl sm:text-3xl font-black text-text tracking-tighter tabular-nums break-words">{value}</div>
            </div>
        </div>
    );
}
