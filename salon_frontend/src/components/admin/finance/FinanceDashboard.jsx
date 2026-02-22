import React from 'react';
import { TrendingUp, ArrowDownRight, Wallet, Users, AlertCircle, ChevronRight, ArrowUpRight } from 'lucide-react';
import AnimatedCounter from '../../common/AnimatedCounter';

export default function FinanceDashboard() {
    return (
        <div className="flex flex-col h-full slide-right overflow-y-auto no-scrollbar">
            {/* Dashboard Hero */}
            <div className="p-8 border-b border-border bg-surface/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-text tracking-tight">Financial Overview</h2>
                        <p className="text-sm text-text-secondary mt-1 font-medium">Real-time performance metrics for the selected period.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Opening Cash</span>
                            <span className="text-lg font-bold text-text">₹12,450</span>
                        </div>
                        <div className="w-[1px] h-8 bg-border" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Bank Balance</span>
                            <span className="text-lg font-bold text-emerald-600">₹4,82,900</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Placeholder for Chart */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface/30 border border-border rounded-3xl p-6 h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Revenue vs Expense Trend</h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                                    <span className="text-[10px] font-bold text-text-secondary uppercase">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                    <span className="text-[10px] font-bold text-text-secondary uppercase">Expense</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-4">
                            {[40, 65, 45, 90, 65, 55, 80, 70, 45, 60, 85, 95].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full flex flex-col-reverse gap-[1px]">
                                        <div
                                            className="w-full bg-violet-600/30 group-hover:bg-violet-600/50 transition-all rounded-t-sm"
                                            style={{ height: `${h}px` }}
                                        />
                                        <div
                                            className="w-full bg-amber-500/20 group-hover:bg-amber-500/40 transition-all rounded-t-sm"
                                            style={{ height: `${h / 2.5}px` }}
                                        />
                                    </div>
                                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-tighter">
                                        {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-white border border-border rounded-2xl hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                    <Users className="w-5 h-5" />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-text-muted" />
                            </div>
                            <h4 className="font-bold text-text text-sm">Top Suppliers</h4>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Settle 3 pending dues</p>
                        </div>
                        <div className="p-6 bg-white border border-border rounded-2xl hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-text-muted" />
                            </div>
                            <h4 className="font-bold text-text text-sm">Upcoming Taxes</h4>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">GST filing due in 4 days</p>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Recent Activities */}
                <div className="space-y-6">
                    <div className="bg-white border border-border rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Recent Transactions</h3>
                        <div className="space-y-4">
                            <TransactionRow label="Service Sale" amount="+₹1,500" type="income" staff="Aryan K." time="2h ago" />
                            <TransactionRow label="Product Sale" amount="+₹850" type="income" staff="Riya S." time="3h ago" />
                            <TransactionRow label="Electricity Bill" amount="-₹4,200" type="expense" staff="System" time="5h ago" />
                            <TransactionRow label="Supplier Payout" amount="-₹15,000" type="payout" staff="Admin" time="1d ago" />
                            <TransactionRow label="Coffee & Tea" amount="-₹120" type="expense" staff="Manager" time="1d ago" />
                        </div>
                        <button className="w-full py-3 bg-surface border border-border rounded-xl text-[10px] font-bold text-text-secondary uppercase tracking-widest hover:bg-secondary transition-all">
                            View Full Ledger
                        </button>
                    </div>

                    {/* Expense Split Preview */}
                    <div className="bg-surface/20 border border-border/50 rounded-3xl p-6 space-y-4">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Expense Distribution</h3>
                        <div className="space-y-3">
                            <ProgressItem label="Inventory" percentage={65} color="bg-primary" />
                            <ProgressItem label="Utilities" percentage={15} color="bg-orange-400" />
                            <ProgressItem label="Rent & Fixed" percentage={20} color="bg-purple-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TransactionRow({ label, amount, type, staff, time }) {
    const colors = {
        income: 'text-emerald-600',
        expense: 'text-rose-500',
        payout: 'text-blue-600'
    };

    return (
        <div className="flex justify-between items-center group cursor-default">
            <div className="flex gap-3 items-center">
                <div className={`w-1.5 h-1.5 rounded-full ${type === 'income' ? 'bg-emerald-500' : type === 'expense' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">{label}</span>
                    <span className="text-[10px] font-medium text-text-muted">{staff} • {time}</span>
                </div>
            </div>
            <span className={`text-xs font-bold ${colors[type]}`}>{amount}</span>
        </div>
    );
}

function ProgressItem({ label, percentage, color }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
