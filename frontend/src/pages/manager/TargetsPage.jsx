import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Target, TrendingUp, Users, ShoppingBag,
    ArrowUpRight, ChevronRight, Plus,
    Zap, Award, CreditCard, Flame, ArrowDownRight,
    Loader2, CheckCircle2
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomDropdown from '../../components/common/CustomDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusiness } from '../../contexts/BusinessContext';
;
import mockApi from '../../services/mock/mockApi';

export default function TargetsPage() {
    const { staff } = useBusiness();
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTarget, setNewTarget] = useState({ userId: '', goal: '' });
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const fetchPerformance = useCallback(async () => {
        setLoading(true);
        try {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]; // Last day of the current month
            const res = await mockApi.get('/hr-performance', { params: { startDate: start, endDate: end } });
            setPerformance(res.data?.data || res.data);
        } catch (err) {
            console.error('Failed to fetch performance', err);
            showToast('Failed to load performance data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPerformance();
    }, [fetchPerformance]);

    const staffOptions = useMemo(() =>
        (Array.isArray(staff) ? staff : []).map(u => ({ label: `${u.name} (${u.role})`, value: u._id || u.id })),
        [staff]
    );

    const teamProgress = useMemo(() => {
        if (!performance?.staff) return [];
        return performance.staff.map(s => {
            const progress = s.goal > 0 ? Math.min(100, Math.round((s.revenue / s.goal) * 100)) : 0;
            let status = 'Increasing';
            if (progress >= 90) status = 'Peak';
            else if (progress >= 70) status = 'On Track';
            else if (progress >= 50) status = 'Improving';
            else status = 'Delayed';

            return {
                id: s.id,
                name: s.staff,
                role: s.role,
                progress,
                status,
                revenue: s.revenue,
                goal: s.goal
            };
        });
    }, [performance]);

    const salonStats = useMemo(() => {
        if (!teamProgress.length) return { current: 0, goal: 500000, percent: 0 };
        const current = teamProgress.reduce((acc, s) => acc + s.revenue, 0);
        const goal = teamProgress.reduce((acc, s) => acc + s.goal, 0) || 500000;
        const percent = Math.min(100, Math.round((current / goal) * 100));
        return { current, goal, percent };
    }, [teamProgress]);

    const targetList = useMemo(() => [
        {
            id: 'salon-revenue',
            title: 'Monthly Revenue Target',
            subtitle: 'Total Salon Performance',
            icon: TrendingUp,
            current: salonStats.current,
            goal: salonStats.goal,
            percent: salonStats.percent,
            color: 'text-primary',
        },
        {
            id: 'team-efficiency',
            title: 'Attendance Index',
            subtitle: 'Operations Health',
            icon: Zap,
            current: 88, // Placeholder, assuming this comes from another metric
            goal: 95, // Placeholder
            percent: 88, // Placeholder
            color: 'text-blue-500',
        }
    ], [salonStats]);

    const handleCreateTarget = async (e) => {
        e.preventDefault();
        if (!newTarget.userId || !newTarget.goal) {
            showToast('Please select staff and enter a goal.');
            return;
        }
        try {
            await mockApi.patch(`/hr-performance/staff/${newTarget.userId}/goal`, {
                goal: parseFloat(newTarget.goal)
            });
            showToast('Target protocol updated');
            setIsAddModalOpen(false);
            setNewTarget({ userId: '', goal: '' });
            fetchPerformance();
        } catch (err) {
            console.error('Failed to update target', err);
            showToast('Update failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 text-left font-black animate-reveal">
                <div className="leading-none text-left">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight uppercase leading-none">Monthly Targets</h1>
                    <p className="text-[9px] sm:text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">Tracking :: salon_growth_monitor</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-primary-foreground border border-primary px-6 sm:px-10 py-3 sm:py-4 rounded-none text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 transition-all font-black"
                >
                    <Plus className="w-4 h-4" /> Set New Target
                </button>
            </div>

            {/* Target Progress Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {targetList.map((t) => (
                    <div key={t.id} className="bg-surface py-5 sm:py-6 px-6 sm:px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        {/* Soft Glow Effect */}
                        <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-24 sm:h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10 text-left">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 sm:gap-2.5">
                                    <t.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[10px] sm:text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{t.subtitle}</p>
                                </div>
                                <div className="flex items-center gap-1 text-[9px] sm:text-[11px] font-black text-emerald-500 uppercase">
                                    <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    On Track
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-2xl sm:text-3xl font-black text-text tracking-tight uppercase leading-none">
                                    <AnimatedCounter
                                        value={typeof t.current === 'string' ? parseFloat(t.current.replace(/[₹%,]/g, '')) : t.current}
                                        prefix={typeof t.current === 'string' && t.current.includes('₹') ? '₹' : ''}
                                    />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity hidden sm:block">
                                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-400">
                                        <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="w-full h-1 sm:h-1.5 bg-background rounded-none overflow-hidden border border-border/5">
                                    <motion.div
                                        className={`h-full ${t.percent >= 70 ? 'bg-emerald-500' : 'bg-primary'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${t.percent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[8px] sm:text-[9px] font-black text-primary uppercase">{t.percent}% DONE</span>
                                    <span className="text-[8px] sm:text-[9px] font-bold text-text-muted uppercase tracking-tight">GOAL: {t.goal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Team Target Progress */}
                <div className="bg-white rounded-none border border-border/60 p-4 sm:p-6 shadow-none">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-primary" />
                            <h2 className="text-[13px] sm:text-sm font-black text-text uppercase tracking-widest">Staff Performance</h2>
                        </div>
                        <button className="w-full sm:w-auto text-[9px] sm:text-[10px] font-black text-primary px-3 py-2 sm:py-1.5 bg-white border border-primary/20 rounded-none uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                            Refresh Data
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-6 text-left">
                            {teamProgress.length > 0 ? teamProgress.map((tp) => (
                                <div key={tp.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-none bg-white flex items-center justify-center border border-border/20 text-[10px] sm:text-xs font-bold text-text-secondary shrink-0">
                                                {tp.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs sm:text-[13px] font-bold text-text leading-none">{tp.name}</p>
                                                <p className="text-[9px] sm:text-[10px] text-text-muted font-medium mt-1 uppercase tracking-wider">{tp.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs sm:text-[13px] font-black text-text leading-none">{tp.progress}%</p>
                                            <p className="text-[8px] font-black text-text-muted mt-1 uppercase tracking-tight">₹{tp.revenue.toLocaleString()} / ₹{tp.goal.toLocaleString()}</p>
                                            <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-tight mt-1 inline-block ${tp.status === 'Peak' ? 'text-emerald-500' :
                                                tp.status === 'On Track' ? 'text-blue-500' :
                                                    tp.status === 'Improving' ? 'text-amber-500' : 'text-rose-500'
                                                }`}>{tp.status}</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-1 sm:h-1.5 bg-background rounded-none overflow-hidden">
                                        <div
                                            className={`h-full ${tp.progress >= 90 ? 'bg-emerald-500' : tp.progress >= 70 ? 'bg-blue-500' : 'bg-primary'}`}
                                            style={{ width: `${tp.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-text-muted text-sm py-4">No team performance data available.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Target Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-border/60 rounded-none w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-border/40 flex items-center justify-between">
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Set Staff Target</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-primary transition-colors">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTarget} className="p-6 space-y-4">
                            <CustomDropdown
                                label="Select Staff Member"
                                options={staffOptions}
                                value={newTarget.userId}
                                onChange={(val) => setNewTarget({ ...newTarget, userId: val })}
                            />
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Monthly Goal (₹)</label>
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
                                    Save Target
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-6 right-6 z-50 bg-text text-background px-6 py-3 border border-border shadow-2xl flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
