import { useState } from 'react';
import {
    Target, TrendingUp, Users, ShoppingBag,
    ArrowUpRight, ChevronRight, Plus,
    Zap, Award, CreditCard, Flame, ArrowDownRight
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomDropdown from '../../components/common/CustomDropdown';
import { motion } from 'framer-motion';

const INITIAL_TARGETS = [
    {
        id: 1,
        title: 'Monthly Sales Target',
        subtitle: 'Product & retail sales',
        icon: ShoppingBag,
        current: 42500,
        goal: 50000,
        color: 'text-primary',
        subStats: [
            { label: 'Weekly', value: '₹12k', icon: TrendingUp },
            { label: 'Daily', value: '₹2k', icon: Plus }
        ]
    },
    {
        id: 2,
        title: 'Revisit Rate Goal',
        subtitle: 'Customer loyalty index',
        icon: Users,
        current: 68,
        goal: 85,
        color: 'text-blue-500',
        suffix: '%',
        subStats: [
            { label: 'Growth', value: '+5%', icon: ArrowUpRight },
            { label: 'Churn', value: '-2%', icon: ArrowDownRight }
        ]
    }
];

export default function TargetsPage() {
    const [targetList, setTargetList] = useState(INITIAL_TARGETS);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTarget, setNewTarget] = useState({ title: '', goal: '', role: 'Stylist' });

    const roleOptions = [
        { label: 'Stylist', value: 'Stylist' },
        { label: 'Senior Stylist', value: 'Senior Stylist' },
        { label: 'Junior Stylist', value: 'Junior Stylist' },
        { label: 'Receptionist', value: 'Receptionist' },
        { label: 'Makeup Artist', value: 'Makeup Artist' },
    ];

    const teamProgress = [
        { name: 'Ananya Sharma', role: 'Stylist', progress: 92, status: 'Peak' },
        { name: 'Priya Das', role: 'Makeup', progress: 78, status: 'On Track' },
        { name: 'Rahul Verma', role: 'Reception', progress: 65, status: 'Improving' },
        { name: 'Vikas Singh', role: 'Stylist', progress: 45, status: 'Delayed' },
    ];

    const handleCreateTarget = (e) => {
        e.preventDefault();
        const id = targetList.length + 1;
        setTargetList([...targetList, {
            id,
            title: newTarget.title,
            subtitle: `Target for ${newTarget.role}`,
            icon: Target,
            current: 0,
            goal: parseInt(newTarget.goal),
            color: 'text-emerald-500',
            subStats: [
                { label: 'Start', value: '0', icon: Plus },
                { label: 'Status', value: 'New', icon: Zap }
            ]
        }]);
        setIsAddModalOpen(false);
        setNewTarget({ title: '', goal: '', role: 'Stylist' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Performance Targets</h1>
                    <p className="text-sm text-text-muted font-medium">Define and track KPIs for your salon</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-none text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> New Target
                </button>
            </div>

            {/* Target Progress Cards */}
            <div className="grid lg:grid-cols-2 gap-3">
                {targetList.map((t) => (
                    <div key={t.id} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        {/* Soft Glow Effect */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <t.icon className="w-4 h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{t.subtitle}</p>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                                    <ArrowUpRight className="w-3 h-3" />
                                    ON TRACK
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-3xl font-black text-text tracking-tight uppercase">
                                    <AnimatedCounter
                                        value={typeof t.current === 'string' ? parseFloat(t.current.replace(/[₹%,]/g, '')) : t.current}
                                        prefix={typeof t.current === 'string' && t.current.includes('₹') ? '₹' : ''}
                                    />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-400">
                                        <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="w-full h-1 bg-background rounded-none overflow-hidden border border-border/5">
                                    <motion.div
                                        className={`h-full ${t.percent >= 70 ? 'bg-emerald-500' : 'bg-primary'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${t.percent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[9px] font-black text-primary uppercase">{t.percent}% ACHIEVED</span>
                                    <span className="text-[9px] font-bold text-text-muted uppercase">GOAL: {t.goal}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Team Target Progress */}
                <div className="lg:col-span-2 bg-white rounded-none border border-border/60 p-6 shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Users className="w-4.5 h-4.5 text-primary" />
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Team Target Tracker</h2>
                        </div>
                        <button className="text-[10px] font-black text-primary px-3 py-1.5 bg-white border border-primary/20 rounded-none uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                            Manage Weights
                        </button>
                    </div>

                    <div className="space-y-6">
                        {teamProgress.map((tp) => (
                            <div key={tp.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-none bg-white flex items-center justify-center border border-border/20 text-xs font-bold text-text-secondary">
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
                                <div className="w-full h-1 bg-background rounded-none overflow-hidden">
                                    <div
                                        className={`h-full ${tp.progress >= 90 ? 'bg-emerald-500' : tp.progress >= 70 ? 'bg-blue-500' : 'bg-primary'}`}
                                        style={{ width: `${tp.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievement Badge Section */}
                <div className="bg-primary rounded-none p-6 text-white relative overflow-hidden shadow-none flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-8 translate-x-8" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-none bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
                            <Flame className="w-6 h-6 text-amber-300" />
                        </div>
                        <h3 className="text-xl font-black leading-tight tracking-tight uppercase">On a Streak!</h3>
                        <p className="text-white/70 text-xs mt-2 leading-relaxed font-medium">Your salon has surpassed its revenue targets for 3 consecutive weeks. 🚀</p>
                    </div>

                    <div className="relative mt-8 bg-black/10 backdrop-blur-md rounded-none p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-amber-300" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">New Milestone Unlocked</span>
                        </div>
                        <p className="text-sm font-extrabold text-white leading-snug">Platinum Efficiency Rating</p>
                        <p className="text-[10px] text-white/60 font-medium mt-0.5">Maintain 90% targets for 10 more days.</p>
                    </div>
                </div>
            </div>

            {/* Add Target Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-border/60 rounded-none w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-border/40 flex items-center justify-between">
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Define Performance Target</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-primary transition-colors">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTarget} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Target Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-surface-alt border border-border/40 rounded-none text-sm outline-none focus:border-primary/50 transition-colors"
                                    placeholder="e.g. Retail Upsell Target"
                                    value={newTarget.title}
                                    onChange={(e) => setNewTarget({ ...newTarget, title: e.target.value })}
                                />
                            </div>
                            <CustomDropdown
                                label="Assigned Role"
                                options={roleOptions}
                                value={newTarget.role}
                                onChange={(val) => setNewTarget({ ...newTarget, role: val })}
                            />
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Goal Value (INR or %)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-4 py-2.5 bg-surface-alt border border-border/40 rounded-none text-sm outline-none focus:border-primary/50 transition-colors"
                                    placeholder="e.g. 50000"
                                    value={newTarget.goal}
                                    onChange={(e) => setNewTarget({ ...newTarget, goal: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 bg-white border border-border/60 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Activate Target
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
