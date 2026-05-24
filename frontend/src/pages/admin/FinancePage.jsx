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
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';
import FinanceDashboard from '../../components/admin/finance/FinanceDashboard';
import ExpenseTracker from '../../components/admin/finance/ExpenseTracker';
import SalesReports from '../../components/admin/finance/SalesReports';
import EndOfDay from '../../components/admin/finance/EndOfDay';
import Transactions from '../../components/admin/finance/Transactions';
import CashAndBank from '../../components/admin/finance/CashAndBank';
import SupplierManager from '../../components/admin/finance/SupplierManager';
import SupplierInvoices from '../../components/admin/finance/SupplierInvoices';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function formatInrShort(n) {
    if (n == null || Number.isNaN(Number(n))) return '₹0';
    const v = Number(n);
    return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

export default function FinancePage({ tab = 'dashboard' }) {
    const activeTab = tab;
    const { outlets = [], activeOutletId } = useBusiness();
    const [selectedOutletId, setSelectedOutletId] = useState(() => activeOutletId || 'all');
    const [financeData, setFinanceData] = useState(null);
    const [financeLoading, setFinanceLoading] = useState(true);
    const [financeError, setFinanceError] = useState(null);

    useEffect(() => {
        if (activeOutletId && selectedOutletId === 'all') {
            setSelectedOutletId(activeOutletId);
        }
    }, [activeOutletId]);

    const loadFinance = useCallback(() => {
        setFinanceLoading(true);
        setFinanceError(null);
        api
            .get('/finance/summary', { params: { outletId: selectedOutletId } })
            .then((res) => setFinanceData(res.data?.data))
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
    }, [selectedOutletId]);

    useEffect(() => {
        loadFinance();
    }, [loadFinance, activeTab]);

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
            {activeTab === 'dashboard' ? (
                <>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                        <div className="text-left font-black leading-none">
                            <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Finances</h1>
                            <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-relaxed text-left max-w-2xl">
                                Live summary from <span className="font-mono">/finance/dashboard</span>
                                <span className="block mt-1.5 normal-case tracking-normal text-[11px] font-bold opacity-90">
                                    POS sales, expense ledger, and inventory stock-in (this month). ₹0 means no activity yet in that lane.
                                </span>
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-left font-black">
                            {outlets.length > 0 && (
                                <select
                                    value={selectedOutletId}
                                    onChange={(e) => setSelectedOutletId(e.target.value)}
                                    className="bg-surface border border-border px-6 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] text-text hover:border-primary transition-all focus:outline-none focus:border-primary cursor-pointer shadow-sm"
                                >
                                    <option value="all">All Outlets</option>
                                    {outlets.map((o) => (
                                        <option key={o._id} value={o._id}>
                                            {o.name}
                                        </option>
                                    ))}
                                </select>
                            )}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left font-black auto-rows-fr">
                        <FinanceKPICard
                            title="Customer Sales"
                            value={financeLoading ? '…' : formatInrShort(kpis.grossInflow ?? 0)}
                            icon={TrendingUp}
                            color="blue"
                            trend="POS Bills"
                            to="/admin/finance/invoices"
                        />
                        <FinanceKPICard
                            title="Shop Expenses"
                            value={financeLoading ? '…' : formatInrShort(kpis.totalExpenses ?? 0)}
                            icon={ArrowDownRight}
                            color="rose"
                            trend="Salary, Rent, Bills"
                            to="/admin/finance/expenses"
                        />
                        <FinanceKPICard
                            title="Supplier Purchases"
                            value={financeLoading ? '…' : formatInrShort(kpis.supplierPurchasesMtd ?? 0)}
                            icon={Package}
                            color="violet"
                            trend="Product Stock"
                            to="/admin/finance/invoices"
                        />
                        <FinanceKPICard
                            title="Net Profit"
                            value={financeLoading ? '…' : formatInrShort(kpis.netLiquidity ?? 0)}
                            icon={Activity}
                            color="emerald"
                            trend="Income − Expenses"
                            to="/admin/finance/dashboard"
                        />
                    </div>
                </>
            ) : (
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left border-b border-border pb-4">
                    <div className="text-left font-black leading-none">
                        <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Finances</h1>
                        <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-relaxed text-left max-w-2xl">
                            Live Workspace · <span className="font-mono">/finance/{activeTab}</span>
                        </p>
                    </div>
                    {outlets.length > 0 && (
                        <div className="flex flex-wrap items-center gap-4 text-left font-black">
                            <select
                                value={selectedOutletId}
                                onChange={(e) => setSelectedOutletId(e.target.value)}
                                className="bg-surface border border-border px-6 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] text-text hover:border-primary transition-all focus:outline-none focus:border-primary cursor-pointer shadow-sm"
                            >
                                <option value="all">All Outlets</option>
                                {outlets.map((o) => (
                                    <option key={o._id} value={o._id}>
                                        {o.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

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
                        outletId={selectedOutletId}
                    />
                )}
                {activeTab === 'transactions' && <Transactions outletId={selectedOutletId} />}
                {activeTab === 'suppliers' && <SupplierManager />}
                {activeTab === 'invoices' && <SupplierInvoices />}
                {activeTab === 'cash-book' && <CashAndBank type="cash" outletId={selectedOutletId} />}
                {activeTab === 'bank-book' && <CashAndBank type="bank" outletId={selectedOutletId} />}
                {activeTab === 'expenses' && <ExpenseTracker outletId={selectedOutletId} />}
                {activeTab === 'reports' && <SalesReports outletId={selectedOutletId} />}
                {activeTab === 'eod' && <EndOfDay outletId={selectedOutletId} />}
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

function FinanceKPICard({ title, value, icon: Icon, color, trend, className = '', to }) {
    const colors = {
        blue: 'text-primary',
        rose: 'text-rose-500',
        orange: 'text-orange-500',
        emerald: 'text-emerald-500',
        violet: 'text-violet-600',
    };

    const trendText = trend != null ? String(trend) : '—';

    const content = (
        <>
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
        </>
    );

    const cardClasses = `bg-surface p-5 sm:p-6 rounded-none border border-border shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all group relative overflow-hidden text-left font-black flex flex-col min-h-[160px] ${className}`;

    if (to) {
        return (
            <Link to={to} className={cardClasses}>
                {content}
            </Link>
        );
    }

    return (
        <div className={cardClasses}>
            {content}
        </div>
    );
}
