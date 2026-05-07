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
    const abs = Math.abs(v);
    if (abs >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`;
    if (abs >= 1e5) return `₹${(v / 1e5).toFixed(2)}L`;
    if (abs >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
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
    if (days < 7) return `${days}d ago`;
    return new Date(d).toLocaleDateString('en-IN');
}

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
                            Data: <span className="font-mono">GET /invoices/finance-dashboard</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-none border border-border shadow-sm text-left">
                        <div className="flex flex-col items-end text-right font-black">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Opening cash</span>
                            <span className="text-lg font-black text-text">
                                {cash.openingCash != null ? formatInr(cash.openingCash) : '—'}
                            </span>
                        </div>
                        <div className="w-[1px] h-8 bg-border" />
                        <div className="flex flex-col items-end text-right font-black">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Bank balance</span>
                            <span className="text-lg font-black text-emerald-600">
                                {cash.bankBalance != null ? formatInr(cash.bankBalance) : '—'}
                            </span>
                        </div>
                    </div>
                </div>
                {cash.note ? (
                    <p className="text-[10px] text-text-muted mt-3 font-bold">{cash.note}</p>
                ) : null}
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-left font-black">
                <div className="lg:col-span-2 space-y-6 text-left font-black">
                    <div className="bg-surface/30 border border-border rounded-none p-8 h-[400px] flex flex-col text-left">
                        <div className="flex justify-between items-center mb-10 text-left">
                            <h3 className="text-[10px] font-black text-text uppercase tracking-[0.2em] text-left">
                                Revenue vs expense (12 months)
                            </h3>
                            <div className="flex gap-6 text-left">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-none bg-primary" />
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">
                                        Inflow (invoices)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-none bg-amber-500" />
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
                                        <Tooltip
                                            formatter={(v) => formatInr(v)}
                                            contentStyle={{
                                                backgroundColor: 'var(--surface)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '0px',
                                                fontSize: '10px',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                            }}
                                        />
                                        <Bar dataKey="revenue" fill="var(--primary)" barSize={12} name="Revenue" />
                                        <Bar dataKey="expense" fill="#f59e0b" barSize={12} name="Expense" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-black">
                        <div className="p-6 bg-white border border-border rounded-none hover:shadow-md transition-all group text-left">
                            <div className="flex justify-between items-start mb-4 text-left">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-none group-hover:scale-110 transition-transform">
                                    <Users className="w-5 h-5" />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-text-muted" />
                            </div>
                            <h4 className="font-black text-text text-sm uppercase tracking-tight text-left">Refunds queue</h4>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 text-left">
                                {kpis.pendingRefunds ?? 0} PENDING
                            </p>
                        </div>
                        <div className="p-6 bg-white border border-border rounded-none hover:shadow-md transition-all group text-left">
                            <div className="flex justify-between items-start mb-4 text-left">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-none group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-text-muted" />
                            </div>
                            <h4 className="font-black text-text text-sm uppercase tracking-tight text-left">Liability note</h4>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 text-left line-clamp-2">
                                {kpis.liabilityHint || '—'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 text-left font-black">
                    <div className="bg-white border border-border rounded-none p-6 flex flex-col gap-6 shadow-sm text-left">
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
                            className="w-full py-4 bg-surface border border-border rounded-none text-[9px] font-black text-text uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all"
                            onClick={() => navigate('/admin/finance/invoices')}
                        >
                            View invoices
                        </button>
                    </div>

                    <div className="bg-surface/20 border border-border/50 rounded-none p-6 space-y-6 text-left">
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
                    className={`w-1.5 h-1.5 rounded-none shrink-0 ${type === 'income' ? 'bg-emerald-500' : type === 'expense' ? 'bg-rose-500' : 'bg-blue-500'}`}
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
            <div className="w-full h-1.5 bg-border rounded-none overflow-hidden">
                <div className={`h-full ${color} rounded-none`} style={{ width: `${Math.min(100, percentage)}%` }} />
            </div>
        </div>
    );
}
