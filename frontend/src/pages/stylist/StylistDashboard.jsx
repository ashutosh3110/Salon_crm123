import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Calendar, Users, Clock, Star, TrendingUp,
    CheckCircle2, ArrowRight, Activity, Search, X, 
    Scissors, Shield, Target, Award, Plus, CalendarPlus,
    UserCheck, Loader2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from 'recharts';
import mockApi from '../../services/mock/mockApi';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const statusColors = {
    completed: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
    'in-progress': { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
    upcoming: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
    cancelled: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
    pending: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
};

function mapBookingToUi(bookingStatus) {
    if (bookingStatus === 'completed') return 'completed';
    if (bookingStatus === 'cancelled') return 'cancelled';
    if (bookingStatus === 'confirmed') return 'in-progress';
    return 'upcoming';
}

function getStatusStyle(status) {
    return statusColors[status] || statusColors.upcoming;
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

export default function StylistDashboard() {
    const { user } = useAuth();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scheduleDate, setScheduleDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toast, setToast] = useState(null);

    const [allBookings, setAllBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    const loadOverview = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await mockApi.get('/stylist/overview', { params: { date: scheduleDate } });
            const data = res.data?.data ?? res.data;
            setOverview(data || null);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load overview');
            setOverview(null);
        } finally {
            setLoading(false);
        }
    }, [scheduleDate]);

    const loadAllBookings = useCallback(async () => {
        setBookingsLoading(true);
        try {
            const res = await mockApi.get('/bookings', { params: { staffId: user?._id || user?.id, limit: 100 } });
            const data = res.data?.data ?? res.data ?? [];
            setAllBookings(Array.isArray(data) ? data : data.results || []);
        } catch (e) {
            console.error('Failed to load bookings', e);
        } finally {
            setBookingsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadOverview();
        if (user) {
            loadAllBookings();
        }
    }, [loadOverview, loadAllBookings, user]);

    const scheduleRows = useMemo(() => {
        const rows = overview?.schedule || [];
        return rows.map((r) => ({
            ...r,
            uiStatus: mapBookingToUi(r.bookingStatus),
        }));
    }, [overview]);

    const filteredSchedule = scheduleRows.filter((s) => {
        const matchesSearch =
            s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.service.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || s.uiStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const showToast = (msg, isErr) => {
        setToast({ msg, isErr: !!isErr });
        setTimeout(() => setToast(null), 3200);
    };

    const updateBooking = async (id, nextStatus) => {
        try {
            await mockApi.patch(`/bookings/${id}`, { status: nextStatus });
            showToast('Booking updated successfully');
            await loadOverview();
        } catch (e) {
            showToast(e?.response?.data?.message || e?.message || 'Update failed', true);
        }
    };

    const stats = overview?.stats || { revenue: 0, target: 1, progressPercent: 0, servicesDone: 0, highestDaily: 0, rating: null };
    const performanceData = overview?.performanceData || [];
    const attendanceLog = overview?.attendanceLog || [];
    const shiftActive = !!overview?.shiftActive;

    const displayDateLabel = useMemo(() => {
        try {
            const [y, m, d] = scheduleDate.split('-').map(Number);
            return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return scheduleDate;
        }
    }, [scheduleDate]);

    const statCards = [
        {
            label: 'Revenue (Month)',
            value: `₹${Math.round(stats.revenue || 0).toLocaleString()}`,
            subtitle: 'Total earnings',
            icon: TrendingUp,
            colorClass: 'text-[#7C3AED] dark:text-[#A78BFA]',
            bgClass: 'bg-[#EDE9FE] dark:bg-[#7C3AED]/20',
            cardClass: 'bg-[#FAF5FF] dark:bg-[#7C3AED]/5 border-[#F3E8FF] dark:border-[#7C3AED]/15'
        },
        {
            label: 'Goal Progress',
            value: `${stats.progressPercent ?? 0}%`,
            subtitle: 'Monthly target',
            icon: Target,
            colorClass: 'text-[#059669] dark:text-[#34D399]',
            bgClass: 'bg-[#D1FAE5] dark:bg-[#059669]/20',
            cardClass: 'bg-[#F0FDF4] dark:bg-[#059669]/5 border-[#DCFCE7] dark:border-[#059669]/15'
        },
        {
            label: 'Services Done',
            value: stats.servicesDone ?? 0,
            subtitle: 'Completed appointments',
            icon: Scissors,
            colorClass: 'text-[#2563EB] dark:text-[#60A5FA]',
            bgClass: 'bg-[#DBEAFE] dark:bg-[#2563EB]/20',
            cardClass: 'bg-[#EFF6FF] dark:bg-[#2563EB]/5 border-[#DBEAFE] dark:border-[#2563EB]/15'
        },
        {
            label: 'Average Rating',
            value: stats.rating || 'N/A',
            subtitle: 'Client feedback',
            icon: Star,
            colorClass: 'text-[#EA580C] dark:text-[#FB923C]',
            bgClass: 'bg-[#FFEDD5] dark:bg-[#EA580C]/20',
            cardClass: 'bg-[#FFF7ED] dark:bg-[#EA580C]/5 border-[#FFEDD5] dark:border-[#EA580C]/15'
        }
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-[#C89B2B] animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Custom Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300
                    ${toast.isErr 
                        ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/50 dark:border-rose-900/50 dark:text-rose-400' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/50 dark:border-emerald-900/50 dark:text-emerald-400'}`}
                >
                    {toast.isErr ? <X className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    <span className="text-sm font-semibold">{toast.msg}</span>
                </div>
            )}

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Welcome Back, {user?.name?.split(' ')[0] || 'Stylist'} <span className="animate-bounce inline-block">👋</span>
                    </h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${shiftActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        {shiftActive ? 'You are currently punched in and on duty.' : 'You are currently punched out.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/stylist/attendance"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all
                            ${shiftActive 
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200' 
                                : 'bg-[#C89B2B] text-white hover:bg-[#B48A25] shadow-[#C89B2B]/20 shadow-lg hover:-translate-y-0.5'}`}
                    >
                        {shiftActive ? <Clock className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        {shiftActive ? 'Punch Out' : 'Punch In'}
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div
                        key={i}
                        className={`rounded-[24px] border p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all hover:-translate-y-0.5 ${stat.cardClass}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.bgClass}`}>
                                <stat.icon className={`w-5 h-5 ${stat.colorClass}`} />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    {stat.label}
                                </p>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">
                                    {stat.label.includes('Services') ? <AnimatedCounter value={stat.value} /> : stat.value}
                                </h3>
                                <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                                    {stat.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 70/30 Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Content (70%) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Performance Chart */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#C89B2B]" />
                                Revenue Performance
                            </h2>
                        </div>
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C89B2B" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#C89B2B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="label" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                                        dy={10} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                                        tickFormatter={val => `₹${val}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600 }}
                                        itemStyle={{ color: '#1F2937', fontWeight: 800 }}
                                        formatter={(val) => [`₹${val}`, 'Revenue']}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#C89B2B" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorPerf)" 
                                        activeDot={{ r: 6, fill: '#C89B2B', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Schedule List */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-6 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#C89B2B]" />
                                Today's Schedule
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text"
                                        placeholder="Search clients..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 w-full sm:w-48 text-sm bg-slate-50 border-slate-200"
                                    />
                                </div>
                                <select 
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="py-2 px-3 text-sm bg-slate-50 border-slate-200 font-medium"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Time</th>
                                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Client</th>
                                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Service</th>
                                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Status</th>
                                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredSchedule.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-12 text-center text-slate-500 font-medium">
                                                No appointments found for today.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSchedule.map((row) => {
                                            const statusStyle = getStatusStyle(row.uiStatus);
                                            return (
                                                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                    <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        {row.time}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                                                        {row.customer}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                        {row.service}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                                            {row.uiStatus.replace('-', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {row.uiStatus === 'upcoming' && (
                                                            <button 
                                                                onClick={() => updateBooking(row.id, 'confirmed')}
                                                                className="text-xs font-bold text-[#C89B2B] hover:text-[#B48A25] bg-[#C89B2B]/10 hover:bg-[#C89B2B]/20 px-3 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                Start
                                                            </button>
                                                        )}
                                                        {row.uiStatus === 'in-progress' && (
                                                            <button 
                                                                onClick={() => updateBooking(row.id, 'completed')}
                                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Content (30%) */}
                <div className="flex flex-col gap-6">
                    {/* Attendance Log */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#C89B2B]" />
                                Shift Activity
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {attendanceLog.length === 0 ? (
                                <p className="text-sm text-slate-500 font-medium py-4 text-center">No punch records yet.</p>
                            ) : (
                                attendanceLog.map((log, idx) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        {/* Timeline line */}
                                        {idx !== attendanceLog.length - 1 && (
                                            <div className="absolute left-[15px] top-[30px] bottom-[-20px] w-px bg-slate-200 dark:bg-slate-700" />
                                        )}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-white dark:bg-slate-900
                                            ${log.type === 'PUNCH_IN' ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500'}`}
                                        >
                                            {log.type === 'PUNCH_IN' ? <ArrowRight className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="pt-1.5">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                {log.type === 'PUNCH_IN' ? 'Punched In' : 'Punched Out'}
                                            </p>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                                {log.time}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-6 shadow-sm">
                        <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                            <Shield className="w-4 h-4 text-[#C89B2B]" />
                            Quick Links
                        </h2>
                        <div className="space-y-2">
                            <Link to="/stylist/clients" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">My Clients</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#C89B2B] group-hover:translate-x-1 transition-all" />
                            </Link>
                            <Link to="/stylist/commissions" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Award className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Earnings Report</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#C89B2B] group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
