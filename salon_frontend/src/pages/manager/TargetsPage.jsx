import {
    Target, TrendingUp, Users, ShoppingBag,
    ArrowUpRight, ChevronRight, Plus,
    Zap, Award, CreditCard, Flame
} from 'lucide-react';
import { motion } from 'framer-motion';

const targets = [
    {
        id: 1,
        title: 'Monthly Sales Target',
        subtitle: 'Product & retail sales',
        current: '₹42,000',
        goal: '₹60,000',
        percent: 70,
        icon: ShoppingBag,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
    {
        id: 2,
        title: 'Service Revenue',
        subtitle: 'All salon services',
        current: '₹1,85,000',
        goal: '₹2,50,000',
        percent: 74,
        icon: Zap,
        color: 'text-primary',
        bg: 'bg-primary/10'
    },
    {
        id: 3,
        title: 'New Client Target',
        subtitle: 'First-time visitors',
        current: '84',
        goal: '120',
        percent: 70,
        icon: Users,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        id: 4,
        title: 'Membership Sales',
        subtitle: 'Loyalty plan renewals',
        current: '12',
        goal: '25',
        percent: 48,
        icon: CreditCard,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
    },
];

const teamProgress = [
    { name: 'Ananya Sharma', role: 'Stylist', progress: 92, status: 'Peak' },
    { name: 'Priya Das', role: 'Makeup', progress: 78, status: 'On Track' },
    { name: 'Rahul Verma', role: 'Reception', progress: 65, status: 'Improving' },
    { name: 'Vikas Singh', role: 'Stylist', progress: 45, status: 'Delayed' },
];

export default function TargetsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Performance Targets</h1>
                    <p className="text-sm text-text-muted font-medium">Define and track KPIs for your salon</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                    <Plus className="w-4 h-4" /> New Target
                </button>
            </div>

            {/* Target Progress Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {targets.map((t) => (
                    <div key={t.id} className="bg-surface rounded-3xl border border-border/40 p-5 shadow-sm group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        <div className={`w-12 h-12 rounded-2xl ${t.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                            <t.icon className={`w-6 h-6 ${t.color}`} />
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em]">{t.subtitle}</p>
                        <h3 className="text-base font-extrabold text-text mt-1">{t.title}</h3>

                        <div className="mt-5 space-y-1.5">
                            <div className="flex items-end justify-between">
                                <p className="text-xl font-black text-text">{t.current}</p>
                                <p className="text-[11px] font-bold text-text-muted">Goal: {t.goal}</p>
                            </div>
                            <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border/5">
                                <motion.div
                                    className={`h-full rounded-full ${t.percent >= 70 ? 'bg-emerald-500' : 'bg-primary'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${t.percent}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>
                            <p className="text-[10px] font-black text-primary uppercase text-right mt-1">{t.percent}% ACHIEVED</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Team Target Progress */}
                <div className="lg:col-span-2 bg-surface rounded-3xl border border-border/40 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Users className="w-4.5 h-4.5 text-primary" />
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Team Target Tracker</h2>
                        </div>
                        <button className="text-[10px] font-black text-primary px-3 py-1.5 bg-primary/10 rounded-lg uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                            Manage Weights
                        </button>
                    </div>

                    <div className="space-y-6">
                        {teamProgress.map((tp) => (
                            <div key={tp.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center border border-border/10 text-xs font-bold text-text-secondary">
                                            {tp.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-text leading-none">{tp.name}</p>
                                            <p className="text-[10px] text-text-muted font-medium mt-1 uppercase tracking-wider">{tp.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-black text-text">{tp.progress}%</p>
                                        <span className={`text-[9px] font-black uppercase tracking-tight ${tp.status === 'Peak' ? 'text-emerald-500' :
                                            tp.status === 'On Track' ? 'text-blue-500' :
                                                tp.status === 'Improving' ? 'text-amber-500' : 'text-rose-500'
                                            }`}>{tp.status}</span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${tp.progress >= 90 ? 'bg-emerald-500' : tp.progress >= 70 ? 'bg-blue-500' : 'bg-primary'}`}
                                        style={{ width: `${tp.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievement Badge Section */}
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-primary/20 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-8 translate-x-8" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                            <Flame className="w-6 h-6 text-amber-300" />
                        </div>
                        <h3 className="text-xl font-black leading-tight tracking-tight uppercase">On a Streak!</h3>
                        <p className="text-white/70 text-xs mt-2 leading-relaxed font-medium">Your salon has surpassed its revenue targets for 3 consecutive weeks. 🚀</p>
                    </div>

                    <div className="relative mt-8 bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-amber-300" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">New Milestone Unlocked</span>
                        </div>
                        <p className="text-sm font-extrabold text-white leading-snug">Platinum Efficiency Rating</p>
                        <p className="text-[10px] text-white/60 font-medium mt-0.5">Maintain 90% targets for 10 more days.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
