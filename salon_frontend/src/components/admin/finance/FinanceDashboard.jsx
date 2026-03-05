import React from 'react';
import { TrendingUp, ArrowDownRight, Wallet, Users, AlertCircle, ChevronRight, ArrowUpRight } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import AnimatedCounter from '../../common/AnimatedCounter';

const trendData = [
    { name: 'Jan', revenue: 4000, expense: 2400 },
    { name: 'Feb', revenue: 3000, expense: 1398 },
    { name: 'Mar', revenue: 5000, expense: 9800 },
    { name: 'Apr', revenue: 2780, expense: 3908 },
    { name: 'May', revenue: 1890, expense: 4800 },
    { name: 'Jun', revenue: 2390, expense: 3800 },
    { name: 'Jul', revenue: 3490, expense: 4300 },
    { name: 'Aug', revenue: 4000, expense: 2400 },
    { name: 'Sep', revenue: 3000, expense: 1398 },
    { name: 'Oct', revenue: 2000, expense: 9800 },
    { name: 'Nov', revenue: 2780, expense: 3908 },
    { name: 'Dec', revenue: 1890, expense: 4800 },
];

export default function FinanceDashboard() {
    return (
        <div className="flex flex-col h-full slide-right overflow-y-auto no-scrollbar font-black text-left">
            {/* Dashboard Hero */}
            <div className="p-8 border-b border-border bg-surface/30 text-left font-black">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
                    <div className="text-left font-black">
                        <h2 className="text-xl font-black text-text tracking-tight uppercase">Financial Performance Matrix</h2>
                        <p className="text-[11px] text-text-secondary mt-1 font-bold uppercase tracking-widest text-left">Real-time fiscal intelligence stream</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-none border border-border shadow-sm text-left">
                        <div className="flex flex-col items-end text-right font-black">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Opening Cash</span>
                            <span className="text-lg font-black text-text">₹12,450</span>
                        </div>
                        <div className="w-[1px] h-8 bg-border" />
                        <div className="flex flex-col items-end text-right font-black">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Bank Balance</span>
                            <span className="text-lg font-black text-emerald-600">₹4,82,900</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-left font-black">
                <div className="lg:col-span-2 space-y-6 text-left font-black">
                    <div className="bg-surface/30 border border-border rounded-none p-8 h-[400px] flex flex-col text-left">
                        <div className="flex justify-between items-center mb-10 text-left">
                            <h3 className="text-[10px] font-black text-text uppercase tracking-[0.2em] text-left">Revenue vs Expense Vector</h3>
                            <div className="flex gap-6 text-left">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-none bg-primary" />
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">Inflow</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-none bg-amber-500" />
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">Outflow</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full text-left">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0px',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase'
                                        }}
                                    />
                                    <Bar dataKey="revenue" fill="var(--primary)" barSize={12} />
                                    <Bar dataKey="expense" fill="#f59e0b" barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
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
                            <h4 className="font-black text-text text-sm uppercase tracking-tight text-left">Vendor Matrix</h4>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 text-left">3 SETTLEMENTS PENDING</p>
                        </div>
                        <div className="p-6 bg-white border border-border rounded-none hover:shadow-md transition-all group text-left">
                            <div className="flex justify-between items-start mb-4 text-left">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-none group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-text-muted" />
                            </div>
                            <h4 className="font-black text-text text-sm uppercase tracking-tight text-left">Tax Compliance</h4>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 text-left">GST FILING DUE IN 4 DAYS</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 text-left font-black">
                    <div className="bg-white border border-border rounded-none p-6 flex flex-col gap-6 shadow-sm text-left">
                        <h3 className="text-[10px] font-black text-text uppercase tracking-[0.2em] text-left">Recent Journals</h3>
                        <div className="space-y-4 text-left">
                            <TransactionRow label="Service Sale" amount="+₹1,500" type="income" staff="ARYAN K." time="2H AGO" />
                            <TransactionRow label="Product Sale" amount="+₹850" type="income" staff="RIYA S." time="3H AGO" />
                            <TransactionRow label="Electricity Bill" amount="-₹4,200" type="expense" staff="SYSTEM" time="5H AGO" />
                            <TransactionRow label="Supplier Payout" amount="-₹15,000" type="payout" staff="ADMIN" time="1D AGO" />
                            <TransactionRow label="Miscellaneous" amount="-₹120" type="expense" staff="MANAGER" time="1D AGO" />
                        </div>
                        <button className="w-full py-4 bg-surface border border-border rounded-none text-[9px] font-black text-text uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all">
                            Open Audit Ledger
                        </button>
                    </div>

                    <div className="bg-surface/20 border border-border/50 rounded-none p-6 space-y-6 text-left">
                        <h3 className="text-[10px] font-black text-text uppercase tracking-[0.2em] text-left">Cost Allocation</h3>
                        <div className="space-y-4 text-left">
                            <ProgressItem label="Inventory" percentage={65} color="bg-primary" />
                            <ProgressItem label="Utilities" percentage={15} color="bg-amber-500" />
                            <ProgressItem label="Rent & Fixed" percentage={20} color="bg-indigo-500" />
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
        payout: 'text-blue-500'
    };

    return (
        <div className="flex justify-between items-center group cursor-default text-left font-black">
            <div className="flex gap-3 items-center text-left">
                <div className={`w-1.5 h-1.5 rounded-none ${type === 'income' ? 'bg-emerald-500' : type === 'expense' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                <div className="flex flex-col text-left">
                    <span className="text-[11px] font-black text-text group-hover:text-primary transition-colors uppercase tracking-tight text-left">{label}</span>
                    <span className="text-[9px] font-bold text-text-muted uppercase text-left">{staff} • {time}</span>
                </div>
            </div>
            <span className={`text-[11px] font-black ${colors[type]}`}>{amount}</span>
        </div>
    );
}

function ProgressItem({ label, percentage, color }) {
    return (
        <div className="space-y-2 text-left font-black">
            <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest text-left">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-none overflow-hidden">
                <div className={`h-full ${color} rounded-none`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
