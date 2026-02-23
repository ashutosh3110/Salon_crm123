import { TrendingUp, DollarSign, Calendar, ArrowUpRight, ChevronRight, Award, Zap, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const earningsHistory = [
    { date: 'Today', services: 5, revenue: 4200, commission: 840 },
    { date: 'Yesterday', services: 8, revenue: 7500, commission: 1500 },
    { date: '21 Feb', services: 6, revenue: 5100, commission: 1020 },
    { date: '20 Feb', services: 7, revenue: 6200, commission: 1240 },
    { date: '19 Feb', services: 4, revenue: 3800, commission: 760 },
];

export default function StylistCommissionsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">My Commissions</h1>
                    <p className="text-sm text-text-muted font-medium">Track your earnings and performance rewards</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border/40 rounded-xl text-sm font-bold text-text-secondary hover:bg-surface-alt transition-colors">
                        <Calendar className="w-4 h-4" /> This Month
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Earned', value: '₹12,450', icon: DollarSign, color: 'text-emerald-500' },
                    { label: 'Services done', value: '42', icon: Zap, color: 'text-primary' },
                    { label: 'Points Earned', value: '1,250', icon: Award, color: 'text-amber-500' },
                    { label: 'Base Pay', value: '₹25,000', icon: CreditCard, color: 'text-blue-500' },
                ].map((s) => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/10 mb-3">
                            <s.icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                        <p className="text-xl font-black text-text">{s.value}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Commission Breakdown */}
                <div className="lg:col-span-2 bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-border/40 bg-surface/50">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Recent Earnings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/40">
                                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Services</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Total Revenue</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {earningsHistory.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-surface-alt/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-text-secondary">{row.date}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-text">{row.services}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-text">₹{row.revenue.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm font-black text-emerald-500 text-right">₹{row.commission.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Target Scorecard */}
                <div className="bg-surface rounded-3xl border border-border/40 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Monthly Bonus Target</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-4xl font-black text-text">85%</p>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Target Achievement</p>
                            </div>
                            <div className="h-4 bg-background border border-border/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '85%' }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="h-full bg-primary"
                                />
                            </div>
                            <p className="text-xs text-text-secondary text-center leading-relaxed">
                                You need <span className="font-bold text-primary">₹15,000</span> more in revenue to unlock the <span className="font-bold text-emerald-500">Superstar Bonus</span>.
                            </p>
                        </div>
                    </div>
                    <button className="mt-8 w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-98 transition-all">
                        View Incentive Slab
                    </button>
                </div>
            </div>
        </div>
    );
}
