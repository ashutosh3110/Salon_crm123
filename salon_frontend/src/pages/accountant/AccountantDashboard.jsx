import { TrendingUp, TrendingDown, DollarSign, CreditCard, FileText, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────────────────
const financeSummary = {
    todayRevenue: 28500,
    yesterdayRevenue: 24200,
    monthRevenue: 485000,
    pendingPayables: 62000,
    cashInHand: 12400,
    bankBalance: 315000,
};

const recentTransactions = [
    { id: 1, desc: 'Invoice #INV-1042 — Priya Sharma', amount: 2500, type: 'credit', time: '10:30 AM' },
    { id: 2, desc: 'Supplier: Beauty Hub — Stock Purchase', amount: -8200, type: 'debit', time: '09:15 AM' },
    { id: 3, desc: 'Invoice #INV-1041 — Ravi Kumar', amount: 850, type: 'credit', time: '09:00 AM' },
    { id: 4, desc: 'Petty Cash — Tea & Snacks', amount: -350, type: 'debit', time: 'Yesterday' },
    { id: 5, desc: 'Invoice #INV-1040 — Meera Patel', amount: 4200, type: 'credit', time: 'Yesterday' },
    { id: 6, desc: 'Staff Commission — Anita', amount: -1200, type: 'debit', time: 'Yesterday' },
];

const pendingInvoices = [
    { id: 1, vendor: 'Lotus Cosmetics', amount: 24000, due: '28 Feb 2026', status: 'overdue' },
    { id: 2, vendor: 'Beauty Hub Supplies', amount: 18000, due: '05 Mar 2026', status: 'due-soon' },
    { id: 3, vendor: 'Salon Equipments Co.', amount: 20000, due: '15 Mar 2026', status: 'upcoming' },
];

const statusStyles = {
    'overdue': 'bg-rose-500/10 text-rose-500',
    'due-soon': 'bg-amber-500/10 text-amber-500',
    'upcoming': 'bg-surface-alt text-text-muted',
};

export default function AccountantDashboard() {
    const revChange = ((financeSummary.todayRevenue - financeSummary.yesterdayRevenue) / financeSummary.yesterdayRevenue * 100).toFixed(1);
    const isUp = revChange > 0;

    return (
        <div className="space-y-6">
            {/* Financial KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                    { label: "Today's Revenue", value: `₹${financeSummary.todayRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', badge: `${isUp ? '+' : ''}${revChange}%`, badgeUp: isUp },
                    { label: 'Month Revenue', value: `₹${(financeSummary.monthRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-emerald-500' },
                    { label: 'Pending Payables', value: `₹${(financeSummary.pendingPayables / 1000).toFixed(0)}K`, icon: FileText, color: 'text-rose-500' },
                    { label: 'Cash in Hand', value: `₹${financeSummary.cashInHand.toLocaleString()}`, icon: Wallet, color: 'text-amber-500' },
                    { label: 'Bank Balance', value: `₹${(financeSummary.bankBalance / 1000).toFixed(0)}K`, icon: CreditCard, color: 'text-primary' },
                ].map((s) => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/10">
                                <s.icon className={`w-4 h-4 ${s.color}`} />
                            </div>
                            {s.badge && (
                                <span className={`flex items-center gap-0.5 text-[10px] font-bold ${s.badgeUp ? 'text-emerald-500' : 'text-rose-500'} bg-background px-1.5 py-0.5 rounded-lg border border-border/10`}>
                                    {s.badgeUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {s.badge}
                                </span>
                            )}
                        </div>
                        <p className="text-xl font-black text-text">{s.value}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                {/* Recent Transactions */}
                <div className="bg-surface rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-border/40 bg-surface/50">
                        <h2 className="text-sm font-extrabold text-text">Recent Transactions</h2>
                    </div>
                    <div className="divide-y divide-border/40">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="px-5 py-3 flex items-center gap-3 hover:bg-surface-alt transition-colors">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                    {tx.type === 'credit' ? <ArrowDownRight className="w-4 h-4 text-emerald-500 rotate-180" /> : <ArrowUpRight className="w-4 h-4 text-rose-500 rotate-180" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-text truncate">{tx.desc}</p>
                                    <p className="text-[10px] text-text-muted">{tx.time}</p>
                                </div>
                                <p className={`text-sm font-black shrink-0 ${tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {tx.type === 'credit' ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Supplier Invoices */}
                <div className="bg-surface rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-border/40 bg-surface/50">
                        <h2 className="text-sm font-extrabold text-text">Supplier Invoices</h2>
                    </div>
                    <div className="divide-y divide-border/40">
                        {pendingInvoices.map((inv) => (
                            <div key={inv.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface-alt transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/10">
                                    <FileText className="w-4 h-4 text-text-muted" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-text truncate">{inv.vendor}</p>
                                    <p className="text-[10px] text-text-muted font-bold">Due: {inv.due}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-black text-text tracking-tight">₹{inv.amount.toLocaleString()}</p>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${statusStyles[inv.status]}`}>
                                        {inv.status.replace('-', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
