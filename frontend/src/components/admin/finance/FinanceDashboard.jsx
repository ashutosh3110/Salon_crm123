import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertCircle, ArrowUpRight, Loader2, RefreshCw } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
function formatInr(n) {
    if (n == null || Number.isNaN(Number(n))) return '₹0';
    const v = Number(n);
    return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

function timeAgo(d) {
    if (!d) return '—';
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    return new Date(d).toLocaleDateString('en-IN');
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl text-left">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase mb-1.5 tracking-wider">{label}</p>
                <div className="space-y-1">
                    {payload.map((item, idx) => {
                        const isRevenue = item.name.toLowerCase() === 'revenue' || item.name.toLowerCase() === 'inflow';
                        const colorClass = isRevenue 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-amber-600 dark:text-amber-500';
                        return (
                            <p key={idx} className={`text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
                                {item.name}: {formatInr(item.value)}
                            </p>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

export default function FinanceDashboard({ data, loading, error, onRetry }) {
    const navigate = useNavigate();
    const trend = data?.monthlyTrend?.length ? data.monthlyTrend : [];
    const recent = data?.recentTransactions || [];
    const allocation = data?.costAllocation?.length ? data.costAllocation : [];
    const kpis = data?.kpis || {};
    const cash = data?.cashPosition || {};

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-text-muted">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-bold">Loading finance dashboard…</p>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="p-12 text-center space-y-4">
                <p className="text-sm font-bold text-rose-700">{error}</p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-text text-white text-xs font-bold"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full slide-right overflow-y-auto no-scrollbar font-black text-left">
            <div className="p-8 border-b border-border bg-surface/30 text-left font-black">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
                    <div className="text-left font-black">
                        <h2 className="text-xl font-black text-text tracking-tight uppercase">Financial Performance Overview</h2>
                        <p className="text-[11px] text-text-secondary mt-1 font-bold uppercase tracking-widest text-left">
                            Data: <span className="font-mono">GET /finance/dashboard</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 bg-surface p-5 rounded-2xl border border-border shadow-sm text-left w-full md:w-auto justify-between md:justify-start">
                        <div className="flex items-center gap-3 font-black">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <span className="text-blue-500 text-lg font-black leading-none">₹</span>
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Opening cash</span>
                                <span className="text-xl font-black text-text leading-none mt-1">
                                    {cash.openingCash != null ? formatInr(cash.openingCash) : '—'}
                                </span>
                            </div>
                        </div>
                        <div className="w-[1px] h-10 bg-border hidden md:block" />
                        <div className="flex items-center gap-3 font-black">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <span className="text-emerald-500 text-lg font-black leading-none">₹</span>
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Bank balance</span>
                                <span className="text-xl font-black text-emerald-500 leading-none mt-1">
                                    {cash.bankBalance != null ? formatInr(cash.bankBalance) : '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {cash.note ? (
                    <p className="text-[10px] text-text-muted mt-3 font-bold">{cash.note}</p>
                ) : null}
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-left font-black">
                <div className="lg:col-span-2 space-y-6 text-left font-black">
                    <div className="bg-surface/30 border border-border rounded-2xl p-8 h-[400px] flex flex-col text-left">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 text-left">
                            <h3 className="text-[10px] font-black text-text uppercase tracking-[0.2em] text-left">
                                Revenue vs expense (12 months)
                            </h3>
                            <div className="flex flex-wrap gap-4 sm:gap-6 text-left">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-md bg-primary" />
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">
                                        Inflow (invoices)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-md bg-amber-500" />
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">
                                        Outflow (expenses)
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full text-left min-h-[280px]">
                            {trend.length === 0 ? (
                                <p className="text-sm text-text-muted font-bold p-8">No invoice/expense data in range yet.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }}
                                        />
                                        <YAxis hide />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="revenue" fill="var(--primary)" barSize={12} name="Revenue" stroke="none" strokeWidth={0} />
                                        <Bar dataKey="expense" fill="#f59e0b" barSize={12} name="Expense" stroke="none" strokeWidth={0} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6 text-left font-black">
                    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm text-left">
                        <h3 className="text-[10px] font-black text-text uppercase tracking-[0.2em] text-left">Recent activity</h3>
                        <div className="space-y-4 text-left">
                            {recent.length === 0 ? (
                                <p className="text-xs text-text-muted font-bold">No recent invoices or expenses.</p>
                            ) : (
                                recent.map((row) => (
                                    <TransactionRow
                                        key={row.id}
                                        label={row.label}
                                        amount={row.type === 'income' ? `+${formatInr(row.amount)}` : `−${formatInr(row.amount)}`}
                                        type={row.type === 'income' ? 'income' : 'expense'}
                                        staff={row.staff || '—'}
                                        time={timeAgo(row.at)}
                                    />
                                ))
                            )}
                        </div>
                        <button
                            type="button"
                            className="w-full py-4 bg-primary/10 border border-primary/30 rounded-2xl text-[9px] font-black text-primary uppercase tracking-[0.3em] hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_0_12px_rgba(var(--color-primary),0.2)] hover:shadow-[0_0_20px_rgba(var(--color-primary),0.5)] active:scale-[0.98]"
                            onClick={() => navigate('/admin/finance/transactions')}
                        >
                            View Transactions
                        </button>
                    </div>

                    <div className="bg-surface border border-border/50 rounded-2xl p-6 space-y-6 text-left">
                        <h3 className="text-[10px] font-black text-text uppercase tracking-[0.2em] text-left">
                            Cost allocation (90d expenses)
                        </h3>
                        <div className="space-y-4 text-left">
                            {allocation.length === 0 ? (
                                <p className="text-xs text-text-muted font-bold">No expense categories yet (POS expenses).</p>
                            ) : (
                                allocation.map((item) => (
                                    <ProgressItem
                                        key={item.label}
                                        label={item.label}
                                        percentage={item.percentage}
                                        color="bg-primary"
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TransactionRow({ label, amount, type, staff, time }) {
    const colors = {
        income: 'text-emerald-500',
        expense: 'text-rose-500',
        payout: 'text-blue-500',
    };

    return (
        <div className="flex justify-between items-center group cursor-default text-left font-black">
            <div className="flex gap-3 items-center text-left min-w-0">
                <div
                    className={`w-2 h-2 rounded-full shrink-0 ${type === 'income' ? 'bg-emerald-500' : type === 'expense' ? 'bg-rose-500' : 'bg-blue-500'}`}
                />
                <div className="flex flex-col text-left min-w-0">
                    <span className="text-[11px] font-black text-text group-hover:text-primary transition-colors uppercase tracking-tight text-left truncate">
                        {label}
                    </span>
                    <span className="text-[9px] font-bold text-text-muted uppercase text-left truncate">
                        {staff} • {time}
                    </span>
                </div>
            </div>
            <span className={`text-[11px] font-black shrink-0 ${colors[type] || colors.expense}`}>{amount}</span>
        </div>
    );
}

function ProgressItem({ label, percentage, color }) {
    return (
        <div className="space-y-2 text-left font-black">
            <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest text-left">
                <span className="truncate">{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden border border-border/40">
                <div className={`h-full ${color} rounded-xl`} style={{ width: `${Math.min(100, percentage)}%` }} />
            </div>
        </div>
    );
}
