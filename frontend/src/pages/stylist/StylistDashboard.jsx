import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
    Calendar, Users, Clock, CheckCircle2, ChevronRight, Fingerprint, Menu, CalendarCheck, IndianRupee, Percent, Scissors, Check, UserCheck, Bell, X, Loader2
} from 'lucide-react';

const statusColors = {
    completed: { bg: '!bg-emerald-50 dark:!bg-emerald-500/10', text: '!text-emerald-600 dark:!text-emerald-400' },
    'in-progress': { bg: '!bg-orange-50 dark:!bg-orange-500/10', text: '!text-orange-600 dark:!text-orange-455' },
    upcoming: { bg: '!bg-blue-50 dark:!bg-blue-500/10', text: '!text-blue-600 dark:!text-blue-400' },
    cancelled: { bg: '!bg-red-50 dark:!bg-red-500/10', text: '!text-red-600 dark:!text-red-400' },
    pending: { bg: '!bg-blue-50 dark:!bg-blue-500/10', text: '!text-blue-600 dark:!text-blue-400' },
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
    const { setMobileOpen } = useOutletContext() || {};
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scheduleDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    });

    const [toast, setToast] = useState(null);

    const loadOverview = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await api.get('/hr/overview/me', { params: { date: scheduleDate } });
            const data = res.data?.data ?? res.data;
            setOverview(data || null);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load overview');
            setOverview(null);
        } finally {
            setLoading(false);
        }
    }, [scheduleDate]);

    useEffect(() => {
        loadOverview();
    }, [loadOverview]);

    const scheduleRows = useMemo(() => {
        const rows = overview?.schedule || [];
        return rows.map((r) => ({
            ...r,
            uiStatus: mapBookingToUi(r.bookingStatus),
        }));
    }, [overview]);

    const stats = overview?.stats || { revenue: 0, totalAssigned: 0, totalCompleted: 0, totalCommission: 0, avgCommission: 0, progressPercent: 0 };
    const attendanceLog = overview?.attendanceLog || [];
    const shiftActive = !!overview?.shiftActive;

    const todayAssigned = scheduleRows.length;
    const todayCompleted = scheduleRows.filter(r => r.bookingStatus === 'completed').length;
    const todayRemaining = Math.max(0, scheduleRows.filter(r => r.bookingStatus !== 'completed' && r.bookingStatus !== 'cancelled').length);

    const initials = (name) => {
        if (!name) return 'S';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#F9FAFB] dark:bg-slate-900">
            <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        </div>
    );

    if (error === 'Staff not found' || error?.includes('Staff not found')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Staff Profile Pending</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                    Your account is not linked to a staff profile in this salon yet. Please ask your administrator or manager to add you to the staff roster.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-[#7C3AED] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all cursor-pointer border-0"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#FAFAFC] dark:bg-slate-900 min-h-screen pb-24 md:pb-8 font-sans text-slate-800 dark:text-slate-100 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 transition-colors duration-200">
            
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

            {/* Mobile Header */}
            <div className="flex lg:hidden items-center justify-between px-4 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-[50]">
                <button 
                    onClick={() => setMobileOpen && setMobileOpen(true)}
                    className="p-2 -ml-2 rounded-xl text-slate-800 dark:text-white bg-transparent border-0 cursor-pointer"
                >
                    <Menu className="w-6 h-6 stroke-[2]" />
                </button>
                <span className="text-[17px] font-bold text-slate-900 dark:text-white">
                    Overview
                </span>
                <div className="w-10 h-10" />
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between px-6 pt-6 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <h1 className="text-[20px] font-bold text-slate-900 dark:text-white">Overview</h1>
            </div>

            {/* Content Container */}
            <div className="px-5 sm:px-8 py-4 sm:py-6 space-y-6 w-full">
                
                {/* Greeting Row */}
                <div className="flex items-center justify-between mt-2">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white leading-none">
                            Hello {user?.name?.split(' ')[0] || 'KP'} <span className="text-2xl animate-bounce inline-block">👋</span>
                        </h2>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 font-bold">Have a great day at work!</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-11 h-11 rounded-full bg-slate-200 overflow-hidden mb-1.5 shadow-sm">
                            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'KP'}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${shiftActive ? 'bg-[#059669]' : 'bg-slate-350'}`}></div>
                            <span className={`text-[10px] font-bold ${shiftActive ? 'text-[#059669]' : 'text-slate-500'}`}>
                                {shiftActive ? 'On Duty' : 'Off Duty'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Shift Schedule (View-Only Attendance Info Card) */}
                <div className="bg-white dark:bg-slate-800 rounded-[20px] p-5 border border-slate-100 dark:border-slate-750 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 shadow-sm shrink-0">
                            <Clock className="w-[24px] h-[24px] text-[#5D2EE6]" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <p className="text-[15px] font-bold text-slate-900 dark:text-slate-200 leading-tight">
                                Today's Schedule
                            </p>
                            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 font-bold leading-tight">
                                {shiftActive ? 'Active Duty' : 'Inactive Duty'}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-750 text-left">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Shift Start</p>
                            <p className="text-[14.5px] font-bold text-slate-800 dark:text-slate-200">{attendanceLog.find(l => l.type === 'PUNCH_IN')?.time || '09:05 AM'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Expected End</p>
                            <p className="text-[14.5px] font-bold text-slate-800 dark:text-slate-200">07:00 PM</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Hours Logged</p>
                            <p className="text-[14.5px] font-bold text-slate-800 dark:text-slate-200">02h 35m</p>
                        </div>
                    </div>
                </div>

                {/* Today's Summary */}
                <div>
                    <h3 className="text-[16px] font-bold mb-4 text-slate-900 dark:text-slate-150">Today's Summary</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-[20px] p-3 flex flex-col items-center justify-center text-center">
                            <CalendarCheck className="w-7 h-7 text-[#7C3AED] mb-2" strokeWidth={1.8} />
                            <p className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">{todayAssigned}</p>
                            <p className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mt-1">Assigned</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-[20px] p-3 flex flex-col items-center justify-center text-center">
                            <CheckCircle2 className="w-7 h-7 text-emerald-650 mb-2" strokeWidth={1.8} />
                            <p className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">{todayCompleted}</p>
                            <p className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mt-1">Completed</p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-[20px] p-3 flex flex-col items-center justify-center text-center">
                            <Clock className="w-7 h-7 text-orange-600 mb-2" strokeWidth={1.8} />
                            <p className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">{todayRemaining}</p>
                            <p className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mt-1">Remaining</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-[20px] p-3 flex flex-col items-center justify-center text-center">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 shadow-sm">
                                <IndianRupee className="w-4 h-4" strokeWidth={2.5} />
                            </div>
                            <p className="text-[16px] font-bold text-slate-900 dark:text-white leading-tight">₹{(stats.revenue || 0).toLocaleString('en-IN')}</p>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 leading-tight">MTD Rev</p>
                        </div>
                    </div>
                </div>

                {/* Today's Appointments */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Today's Appointments</h3>
                        <Link to="/stylist/appointments" className="text-[12px] font-bold flex items-center text-[#5D2EE6] dark:text-purple-400">View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" /></Link>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-750">
                        {scheduleRows.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 text-[13px] font-medium">
                                No appointments scheduled for today.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-750">
                                {scheduleRows.map((row, idx) => {
                                    const statusStyle = getStatusStyle(row.uiStatus);
                                    
                                    const colors = ['purple', 'green', 'blue', 'orange', 'purple'];
                                    const cType = colors[idx % colors.length];
                                    const colorMap = {
                                        purple: { bg: 'bg-purple-50 text-[#7C3AED]' },
                                        green: { bg: 'bg-emerald-50 text-[#059669]' },
                                        blue: { bg: 'bg-blue-50 text-[#2563EB]' },
                                        orange: { bg: 'bg-rose-50 text-[#EF4444]' },
                                    };
                                    const cStyle = colorMap[cType] || colorMap.purple;

                                    return (
                                        <div key={row.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                                            <div className="text-[13px] font-bold w-[70px] text-[#5D2EE6] dark:text-[#8B5CF6] shrink-0">{row.time}</div>
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${cStyle.bg}`}>
                                                {initials(row.customer)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-0.5 truncate">{row.service}</p>
                                                <p className="text-[11px] text-slate-550 dark:text-slate-400 font-bold truncate">{row.customer}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[6px] uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text}`}>
                                                    {row.uiStatus === 'in-progress' ? 'In Progress' : row.uiStatus}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-slate-350 dark:text-slate-500" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-[16px] font-bold mb-4 text-slate-900 dark:text-slate-100">Quick Actions</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <Link to="/stylist/appointments" className="bg-[#F8F5FF] dark:bg-slate-800 rounded-[20px] p-3 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-[14px] bg-[#7C3AED] text-white flex items-center justify-center mb-3 shadow-sm">
                                <Scissors className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 leading-tight">Start Service</span>
                        </Link>
                        <Link to="/stylist/appointments" className="bg-[#F0FDF4] dark:bg-slate-800 rounded-[20px] p-3 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full border border-emerald-600 text-emerald-600 flex items-center justify-center mb-3 bg-white">
                                <Check className="w-6 h-6" strokeWidth={2.5} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 leading-tight">Mark Complete</span>
                        </Link>
                        <Link to="/stylist/appointments" className="bg-[#FFF7ED] dark:bg-slate-800 rounded-[20px] p-3 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-[14px] border border-orange-600 text-orange-600 flex items-center justify-center mb-3 bg-white">
                                <Calendar className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 leading-tight">Appointments</span>
                        </Link>
                        <Link to="/stylist/timeoff" className="bg-[#F8F5FF] dark:bg-slate-800 rounded-[20px] p-3 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-[14px] border border-purple-600 text-purple-650 flex items-center justify-center mb-3 bg-white">
                                <UserCheck className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 leading-tight">Request Leave</span>
                        </Link>
                    </div>
                </div>

                {/* My Performance */}
                <div>
                    <h3 className="text-[16px] font-bold mb-3 flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                        My Performance <span className="text-[12px] font-semibold text-slate-500">(This Month)</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 rounded-[16px] p-3 flex flex-row items-center justify-center text-center shadow-sm gap-2">
                            <div className="w-[38px] h-[38px] rounded-full bg-purple-50 dark:bg-purple-950/20 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0">
                                <IndianRupee className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col items-start min-w-0">
                                <span className="text-[15px] font-bold text-slate-900 dark:text-white truncate">₹{(stats.revenue || 0).toLocaleString('en-IN')}</span>
                                <p className="text-[9.5px] text-slate-450 dark:text-slate-400 font-bold leading-tight mt-0.5 truncate">Total Earnings</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 rounded-[16px] p-3 flex flex-row items-center justify-center text-center shadow-sm gap-2">
                            <div className="w-[38px] h-[38px] rounded-full border-3 border-emerald-600 text-emerald-605 dark:border-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 relative">
                                <span className="text-[10px] font-bold">{stats.progressPercent || 0}%</span>
                            </div>
                            <div className="flex flex-col items-start min-w-0">
                                <span className="text-[15px] font-bold text-slate-900 dark:text-white truncate">{stats.progressPercent || 0}%</span>
                                <p className="text-[9.5px] text-slate-450 dark:text-slate-400 font-bold leading-tight mt-0.5 truncate font-bold">Comp. Rate</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 rounded-[16px] p-3 flex flex-row items-center justify-center text-center shadow-sm gap-2">
                            <div className="w-[38px] h-[38px] rounded-full border-3 border-orange-100 text-orange-600 dark:border-orange-900/40 dark:text-orange-400 flex items-center justify-center shrink-0">
                                <Percent className="w-4 h-4 stroke-[2.5]" />
                            </div>
                            <div className="flex flex-col items-start min-w-0">
                                <span className="text-[15px] font-bold text-slate-900 dark:text-white truncate">₹{(stats.totalCommission || 0).toLocaleString('en-IN')}</span>
                                <p className="text-[9.5px] text-slate-450 dark:text-slate-400 font-bold leading-tight mt-0.5 truncate font-bold">Commission</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Notifications */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100">Recent Notifications</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                        <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-750 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-[#7C3AED] flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[12.5px] font-bold text-slate-900 dark:text-slate-100 truncate leading-tight mb-0.5">New appointment assigned</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Neha Patel - Hair Color at 11:30 AM</p>
                            </div>
                            <span className="text-[9px] font-semibold text-slate-450 pt-1">10:15 AM</span>
                        </div>
                        <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-750 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#059669] flex items-center justify-center shrink-0">
                                <IndianRupee className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[12.5px] font-bold text-slate-900 dark:text-slate-100 truncate leading-tight mb-0.5">Commission added</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">₹250 added for Hair Cut</p>
                            </div>
                            <span className="text-[9px] font-semibold text-slate-455 pt-1">09:30 AM</span>
                        </div>
                        <div className="flex items-start gap-3 pb-1">
                            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[12.5px] font-bold text-slate-900 dark:text-slate-100 truncate leading-tight mb-0.5">Leave request approved</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Your leave on 22 June has been approved</p>
                            </div>
                            <span className="text-[9px] font-semibold text-slate-455 pt-1">Yesterday</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
