import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Target, TrendingUp, Users, Zap, Plus, Loader2, CheckCircle2, RefreshCw, FileText
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomDropdown from '../../components/common/CustomDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusiness } from '../../contexts/BusinessContext';
import api from '../../services/api';

export default function TargetsPage() {
    const { staff, fetchStaff } = useBusiness();
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
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
            const res = await api.get('/hr/performance', { params: { startDate: start, endDate: end } });
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
        fetchStaff();
    }, [fetchPerformance, fetchStaff]);

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

            // Find avatar in context staff if exists
            const matchedStaff = Array.isArray(staff) ? staff.find(u => (u._id || u.id) === s.id) : null;

            return {
                id: s.id,
                name: s.staff,
                role: s.role,
                progress,
                status,
                revenue: s.revenue,
                goal: s.goal,
                avatar: matchedStaff?.avatar
            };
        });
    }, [performance, staff]);

    const salonStats = useMemo(() => {
        if (!teamProgress.length) return { current: 0, goal: 500000, percent: 0 };
        const current = teamProgress.reduce((acc, s) => acc + s.revenue, 0);
        const goal = teamProgress.reduce((acc, s) => acc + s.goal, 0) || 500000;
        const percent = Math.min(100, Math.round((current / goal) * 100));
        return { current, goal, percent };
    }, [teamProgress]);

    const handleCreateTarget = async (e) => {
        e.preventDefault();
        if (!newTarget.userId || !newTarget.goal) {
            showToast('Please select staff and enter a goal.');
            return;
        }
        try {
            await api.patch(`/hr/staff/${newTarget.userId}/target`, {
                goal: parseFloat(newTarget.goal)
            });
            showToast('Target updated successfully');
            setIsAddModalOpen(false);
            setNewTarget({ userId: '', goal: '' });
            fetchPerformance();
        } catch (err) {
            console.error('Failed to update target', err);
            showToast('Update failed');
        }
    };

    const handleExport = () => {
        if (!teamProgress.length) {
            showToast('No data to export.');
            return;
        }
        try {
            const headers = ['Staff Name', 'Role', 'Monthly Goal (INR)', 'Revenue Achieved (INR)', 'Progress %', 'Status'];
            const rows = teamProgress.map(tp => [
                tp.name,
                tp.role,
                tp.goal,
                tp.revenue,
                `${tp.progress}%`,
                tp.status
            ]);
            const csvContent = "data:text/csv;charset=utf-8," 
                + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `staff_targets_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Report exported successfully');
        } catch (err) {
            console.error(err);
            showToast('Export failed');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-6">
            {/* 1. Top Header (Dashboard Style) */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-100 pb-6">
                <div className="text-left">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Monthly Targets</h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                        Track staff goals and salon revenue performance
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={fetchPerformance}
                        className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 !bg-[#C89B2B] hover:!bg-[#b08722] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer border-0"
                    >
                        <Plus className="w-4 h-4 text-white" /> Set Target
                    </button>
                </div>
            </div>

            {/* 2. Top Cards (White & Compact Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Target Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                    <div className="relative z-10 text-left space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue Target</span>
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-slate-800">
                                <AnimatedCounter value={salonStats.current} prefix="₹" />
                            </h2>
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                Goal: ₹{salonStats.goal.toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-2 pt-1">
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-emerald-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${salonStats.percent}%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full w-fit">
                                <span>{salonStats.percent}% Completed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Index Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                    <div className="relative z-10 text-left space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operations Health</span>
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-slate-800">
                                <AnimatedCounter value={88} suffix="%" />
                            </h2>
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                Goal: 95%
                            </p>
                        </div>
                        <div className="space-y-2 pt-1">
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `88%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full w-fit">
                                <span>88% Completed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Team Performance Section (Table Style) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Section Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left">
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <span>👥</span> Team Performance
                        </h2>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                            Monthly target tracking of all staff members
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchPerformance}
                            className="bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button
                            onClick={handleExport}
                            className="bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5"
                        >
                            <FileText className="w-3.5 h-3.5" /> Export
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-[#C89B2B]" />
                    </div>
                ) : teamProgress.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Staff</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Target</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Revenue</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Progress</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {teamProgress.map((tp) => (
                                    <tr key={tp.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {/* Staff Avatar */}
                                                {tp.avatar ? (
                                                    <img
                                                        src={tp.avatar}
                                                        alt={tp.name}
                                                        className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-[#C89B2B]/10 flex items-center justify-center text-[#C89B2B] shrink-0 border border-[#C89B2B]/10">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800 leading-none">{tp.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{tp.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-bold text-slate-800">
                                            ₹{tp.goal.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-bold text-slate-800">
                                            ₹{tp.revenue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap w-[240px]">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-[10px] font-black text-slate-700 uppercase">
                                                    <span>{tp.progress}% Achieved</span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${tp.progress}%` }}
                                                        transition={{ duration: 1.2, ease: 'easeOut' }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                                                tp.status === 'Peak' ? 'bg-emerald-100 text-emerald-800' :
                                                tp.status === 'On Track' ? 'bg-blue-100 text-blue-800' :
                                                tp.status === 'Improving' ? 'bg-amber-100 text-amber-800' : 
                                                'bg-rose-100 text-rose-800'
                                            }`}>
                                                {tp.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* 8. Empty State */
                    <div className="flex flex-col items-center justify-center text-center p-12 space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                            <Target className="w-14 h-14" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">No performance data found</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                Set targets for staff to start tracking progress.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* 7. Set Staff Target Modal (Premium Layout) */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="text-left">
                                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">🎯 Set Staff Target</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Assign monthly sales goal</p>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border-0 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4 rotate-45" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateTarget} className="p-6 space-y-6">
                                <CustomDropdown
                                    label="Select Staff Member"
                                    options={staffOptions}
                                    value={newTarget.userId}
                                    onChange={(val) => setNewTarget({ ...newTarget, userId: val })}
                                />
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Goal (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-4 h-14 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-[#C89B2B] focus:bg-white transition-all"
                                        placeholder="e.g. 50000"
                                        value={newTarget.goal}
                                        onChange={(e) => setNewTarget({ ...newTarget, goal: e.target.value })}
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 h-12 bg-gradient-to-r from-[#C89B2B] to-yellow-500 hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer border-0"
                                    >
                                        Save Target
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 9. Success Toast (Premium Styled) */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400/20"
                    >
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <p className="text-xs font-bold tracking-wide">✓ {toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
