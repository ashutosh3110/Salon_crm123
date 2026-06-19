import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
    Calendar, Users, Clock, Star, TrendingUp,
    CheckCircle2, ArrowRight, Activity, Search, X,
    Scissors, Shield, Target, Award, Plus, CalendarPlus,
    UserCheck, Loader2, DollarSign, ChevronDown, ChevronRight, Fingerprint, LogOut, Bell, Menu, LayoutGrid, CalendarCheck, IndianRupee, Percent, Grid, Check
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer
} from 'recharts';

import AnimatedCounter from '../../components/common/AnimatedCounter';

const statusColors = {
    completed: { bg: 'bg-[#E6F8EF] dark:bg-emerald-500/10', text: 'text-[#059669] dark:text-emerald-400' },
    'in-progress': { bg: 'bg-[#FFF0E6] dark:bg-orange-500/10', text: 'text-[#EA580C] dark:text-orange-400' },
    upcoming: { bg: 'bg-[#EBF4FF] dark:bg-blue-500/10', text: 'text-[#3B82F6] dark:text-blue-400' },
    cancelled: { bg: 'bg-[#FEF2F2] dark:bg-red-500/10', text: 'text-[#EF4444] dark:text-red-400' },
    pending: { bg: 'bg-[#EBF4FF] dark:bg-blue-500/10', text: 'text-[#3B82F6] dark:text-blue-400' },
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

    const showToast = (msg, isErr) => {
        setToast({ msg, isErr: !!isErr });
        setTimeout(() => setToast(null), 3200);
    };

    const updateBooking = async (id, nextStatus) => {
        try {
            await api.patch(`/bookings/${id}/status`, { status: nextStatus });
            showToast('Booking updated successfully');
            await loadOverview();
        } catch (e) {
            showToast(e?.response?.data?.message || e?.message || 'Update failed', true);
        }
    };

    const stats = overview?.stats || { revenue: 0, totalAssigned: 0, totalCompleted: 0, totalCommission: 0, avgCommission: 0, progressPercent: 0 };
    const attendanceLog = overview?.attendanceLog || [];
    const shiftActive = !!overview?.shiftActive;

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

    return (
        <div className="bg-[#F9FAFB] dark:bg-slate-900 min-h-screen pb-24 md:pb-8 font-sans text-slate-800 dark:text-slate-100 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 transition-colors duration-200">
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

            {/* Mobile Header (Hidden on Desktop) */}
            <div className="md:hidden flex items-center justify-between px-5 py-4 bg-[#F9FAFB] dark:bg-slate-900 sticky top-0 z-10">
                <button className="text-slate-800 dark:text-slate-200"><Menu className="w-6 h-6" /></button>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Overview</h1>
                <button className="relative text-slate-800 dark:text-slate-200">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#7C3AED] rounded-full border-2 border-[#F9FAFB] dark:border-slate-900"></span>
                </button>
            </div>

            <div className="px-5 sm:px-8 py-4 sm:py-6 space-y-6 max-w-5xl mx-auto">
                {/* Greeting */}
                <div className="flex items-center justify-between mt-2 mb-2">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            Hello {user?.name?.split(' ')[0] || 'KP'} <span className="text-2xl animate-bounce inline-block">👋</span>
                        </h2>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Have a great day at work!</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-11 h-11 rounded-full bg-slate-200 overflow-hidden mb-1 shadow-sm">
                            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'KP'}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${shiftActive ? 'bg-[#059669]' : 'bg-slate-300'}`}></div>
                            <span className={`text-[10px] font-bold ${shiftActive ? 'text-[#059669]' : 'text-slate-500'}`}>
                                {shiftActive ? 'On Duty' : 'Off Duty'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Punch Card */}
                <div className="bg-[#FAFAFA] dark:bg-slate-800 rounded-[20px] p-5 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                            <div className={`w-[54px] h-[54px] rounded-full flex items-center justify-center ${shiftActive ? 'bg-[#00A350] text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                <Fingerprint className="w-[28px] h-[28px] stroke-[1.5]" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[16px] font-bold text-[#0F172A] dark:text-slate-200 leading-tight">
                                    You are <span className={shiftActive ? 'text-[#00A350]' : 'text-slate-500'}>{shiftActive ? 'Punched In' : 'Punched Out'}</span>
                                </p>
                                <p className="text-[14px] text-[#2E2856] dark:text-[#A5B4FC] font-bold leading-tight">
                                    {shiftActive ? `Since ${attendanceLog.find(l => l.type === 'PUNCH_IN')?.time || '09:05 AM'}` : 'Not working'}
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/stylist/attendance"
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[14px] font-bold transition-colors shadow-sm
                                ${shiftActive 
                                    ? 'bg-white dark:bg-slate-800 border-[1.5px] border-[#7C3AED] text-[#7C3AED] hover:bg-[#F8F5FF] dark:hover:bg-[#7C3AED]/10' 
                                    : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'}`}
                        >
                            <LogOut className="w-[18px] h-[18px] stroke-[2.5]" /> {shiftActive ? 'Punch Out' : 'Punch In'}
                        </Link>
                    </div>
                    <div className="flex justify-between items-center pt-5 border-t border-slate-200/60 dark:border-slate-700">
                        <div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold mb-1">Shift Start</p>
                            <p className="text-[16px] font-black text-slate-900 dark:text-slate-100">{attendanceLog.find(l => l.type === 'PUNCH_IN')?.time || '09:05 AM'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold mb-1">Expected Shift End</p>
                            <p className="text-[16px] font-black text-slate-900 dark:text-slate-100">07:00 PM</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold mb-1">Total Hours Today</p>
                            <p className="text-[16px] font-black text-slate-900 dark:text-slate-100">02h 35m</p>
                        </div>
                    </div>
                </div>

                {/* Today's Summary */}
                <div>
                    <h3 className="text-[15px] font-bold mb-4 text-slate-900 dark:text-slate-100">Today's Summary</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-[#F8F5FF] dark:bg-slate-800 rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
                            <CalendarCheck className="w-8 h-8 text-[#7C3AED] mb-3" strokeWidth={1.5} />
                            <p className="text-[22px] font-black text-slate-900 dark:text-white leading-tight">{stats.totalAssigned || 8}</p>
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1">Assigned</p>
                        </div>
                        <div className="bg-[#F0FDF4] dark:bg-slate-800 rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
                            <CheckCircle2 className="w-8 h-8 text-[#059669] mb-3" strokeWidth={1.5} />
                            <p className="text-[22px] font-black text-slate-900 dark:text-white leading-tight">{stats.totalCompleted || 5}</p>
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1">Completed</p>
                        </div>
                        <div className="bg-[#FFF7ED] dark:bg-slate-800 rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
                            <Clock className="w-8 h-8 text-[#EA580C] mb-3" strokeWidth={1.5} />
                            <p className="text-[22px] font-black text-slate-900 dark:text-white leading-tight">{Math.max(0, (stats.totalAssigned || 8) - (stats.totalCompleted || 5))}</p>
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1">Remaining</p>
                        </div>
                        <div className="bg-[#F0F7FF] dark:bg-slate-800 rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
                            <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center mb-3">
                                <IndianRupee className="w-4 h-4" strokeWidth={2} />
                            </div>
                            <p className="text-[17px] font-black text-slate-900 dark:text-white leading-tight">₹{(stats.revenue || 1250).toLocaleString('en-IN')}</p>
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1 leading-tight">Today's Earnings</p>
                        </div>
                    </div>
                </div>

                {/* Today's Appointments */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[14px] font-bold text-slate-900 dark:text-slate-100">Today's Appointments</h3>
                        <button className="text-[11px] font-bold flex items-center" style={{ color: '#7C3AED' }}>View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" /></button>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-[20px] p-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] border border-[#F3F4F6] dark:border-slate-700/50">
                        {scheduleRows.length === 0 ? (
                            <div className="space-y-4">
                                {[
                                    { time: '10:00 AM', initial: 'PN', name: 'Priya Sharma', service: 'Hair Cut', status: 'completed', color: 'purple' },
                                    { time: '11:30 AM', initial: 'NP', name: 'Neha Patel', service: 'Hair Color', status: 'in-progress', color: 'green' },
                                    { time: '02:00 PM', initial: 'AK', name: 'Amit Kumar', service: 'Facial', status: 'upcoming', color: 'blue' },
                                    { time: '04:00 PM', initial: 'RS', name: 'Ritika Singh', service: 'Hair Spa', status: 'upcoming', color: 'orange' },
                                    { time: '06:00 PM', initial: 'SJ', name: 'Sneha Joshi', service: 'Hair Treatment', status: 'upcoming', color: 'purple' }
                                ].map((mock, idx) => {
                                    const statusStyle = getStatusStyle(mock.status);
                                    
                                    const colorMap = {
                                        purple: { bg: '#F3E8FF', text: '#7C3AED' },
                                        green: { bg: '#DCFCE7', text: '#059669' },
                                        blue: { bg: '#DBEAFE', text: '#2563EB' },
                                        orange: { bg: '#FFF7ED', text: '#DC2626' },
                                    };
                                    const cStyle = colorMap[mock.color] || colorMap.purple;

                                    return (
                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0 gap-3 group">
                                            <div className="text-[11px] font-bold w-[60px]" style={{ color: '#7C3AED' }}>{mock.time}</div>
                                            <div 
                                                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{ backgroundColor: cStyle.bg, color: cStyle.text }}
                                            >
                                                {mock.initial}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-0.5 truncate">{mock.service}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate">{mock.name}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[6px] ${statusStyle.bg} ${statusStyle.text}`}>
                                                    {mock.status === 'in-progress' ? 'In Progress' : mock.status.charAt(0).toUpperCase() + mock.status.slice(1)}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-slate-800 dark:text-slate-400" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {scheduleRows.map((row, idx) => {
                                    const statusStyle = getStatusStyle(row.uiStatus);
                                    
                                    const colors = ['purple', 'green', 'blue', 'orange', 'purple'];
                                    const cType = colors[idx % colors.length];
                                    const colorMap = {
                                        purple: { bg: '#F3E8FF', text: '#7C3AED' },
                                        green: { bg: '#DCFCE7', text: '#059669' },
                                        blue: { bg: '#DBEAFE', text: '#2563EB' },
                                        orange: { bg: '#FFF7ED', text: '#DC2626' },
                                    };
                                    const cStyle = colorMap[cType] || colorMap.purple;

                                    return (
                                        <div key={row.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0 gap-3 group">
                                            <div className="text-[11px] font-bold w-[60px]" style={{ color: '#7C3AED' }}>{row.time}</div>
                                            <div 
                                                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{ backgroundColor: cStyle.bg, color: cStyle.text }}
                                            >
                                                {initials(row.customer)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-0.5 truncate">{row.service}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate">{row.customer}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[6px] ${statusStyle.bg} ${statusStyle.text}`}>
                                                    {row.uiStatus === 'in-progress' ? 'In Progress' : row.uiStatus.charAt(0).toUpperCase() + row.uiStatus.slice(1)}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-slate-800 dark:text-slate-400" />
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
                    <h3 className="text-[15px] font-bold mb-4 text-slate-900 dark:text-slate-100">Quick Actions</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <button className="bg-[#F8F5FF] dark:bg-slate-800 rounded-[20px] p-3 flex flex-col items-center justify-center text-center hover:opacity-90 transition-opacity">
                            <div className="w-12 h-12 rounded-[14px] bg-[#7C3AED] text-white flex items-center justify-center mb-3 shadow-sm shadow-purple-500/20">
                                <Scissors className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 leading-tight">Start Service</span>
                        </button>
                        <button className="bg-[#F0FDF4] dark:bg-slate-800 rounded-[20px] p-3 flex flex-col items-center justify-center text-center hover:opacity-90 transition-opacity">
                            <div className="w-12 h-12 rounded-full border-[1.5px] border-[#059669] text-[#059669] flex items-center justify-center mb-3 bg-white">
                                <Check className="w-6 h-6" strokeWidth={2.5} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 leading-tight">Mark Complete</span>
                        </button>
                        <button className="bg-[#FFF7ED] dark:bg-slate-800 rounded-[20px] p-3 flex flex-col items-center justify-center text-center hover:opacity-90 transition-opacity">
                            <div className="w-12 h-12 rounded-[14px] border-[1.5px] border-[#EA580C] text-[#EA580C] flex items-center justify-center mb-3 bg-white">
                                <Calendar className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 leading-tight">View Appointments</span>
                        </button>
                        <button className="bg-[#F8F5FF] dark:bg-slate-800 rounded-[20px] p-3 flex flex-col items-center justify-center text-center hover:opacity-90 transition-opacity">
                            <div className="w-12 h-12 rounded-[14px] border-[1.5px] border-[#7C3AED] text-[#7C3AED] flex items-center justify-center mb-3 bg-white">
                                <UserCheck className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 leading-tight">Request Leave</span>
                        </button>
                    </div>
                </div>

                {/* My Performance */}
                <div>
                    <h3 className="text-[14px] font-bold mb-3 flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                        My Performance <span className="text-[11px] font-medium text-slate-500">(This Month)</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-800 border border-[#F3F4F6] dark:border-slate-700/50 rounded-[16px] p-3 flex flex-row items-center justify-center text-center shadow-sm gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#F3E8FF] dark:bg-[#7C3AED]/20 text-[#7C3AED] flex items-center justify-center shrink-0">
                                <IndianRupee className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[14px] font-black text-slate-900 dark:text-white">₹{(stats.revenue || 28650).toLocaleString('en-IN')}</span>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">Total Earnings</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-[#F3F4F6] dark:border-slate-700/50 rounded-[16px] p-3 flex flex-row items-center justify-center text-center shadow-sm gap-2">
                            <div className="w-8 h-8 rounded-full border-[3px] border-[#059669] text-[#059669] flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold">{stats.progressPercent || 87}%</span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[14px] font-black text-slate-900 dark:text-white">{stats.progressPercent || 87}%</span>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">Completion Rate</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-[#F3F4F6] dark:border-slate-700/50 rounded-[16px] p-3 flex flex-row items-center justify-center text-center shadow-sm gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#FFEDD5] dark:bg-[#EA580C]/20 text-[#EA580C] flex items-center justify-center shrink-0">
                                <Percent className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[14px] font-black text-slate-900 dark:text-white">₹{(stats.totalCommission || 3650).toLocaleString('en-IN')}</span>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">Commission Earned</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Notifications */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[14px] font-bold text-slate-900 dark:text-slate-100">Recent Notifications</h3>
                        <button className="text-[11px] font-bold text-[#7C3AED] flex items-center">View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" /></button>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-[#F3F4F6] dark:border-slate-700/50 rounded-[20px] p-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] space-y-4">
                        <div className="flex items-start gap-3 border-b border-slate-50 dark:border-slate-700/50 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] dark:bg-[#7C3AED]/20 text-[#7C3AED] flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[12px] font-bold text-slate-900 dark:text-slate-100 truncate leading-tight mb-0.5">New appointment assigned</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Neha Patel - Hair Color at 11:30 AM</p>
                            </div>
                            <span className="text-[9px] font-semibold text-slate-500 pt-1">10:15 AM</span>
                        </div>
                        <div className="flex items-start gap-3 border-b border-slate-50 dark:border-slate-700/50 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] dark:bg-[#059669]/20 text-[#059669] flex items-center justify-center shrink-0">
                                <IndianRupee className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[12px] font-bold text-slate-900 dark:text-slate-100 truncate leading-tight mb-0.5">Commission added</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">₹250 added for Hair Cut</p>
                            </div>
                            <span className="text-[9px] font-semibold text-slate-500 pt-1">09:30 AM</span>
                        </div>
                        <div className="flex items-start gap-3 pb-1">
                            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] dark:bg-[#EA580C]/20 text-[#EA580C] flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[12px] font-bold text-slate-900 dark:text-slate-100 truncate leading-tight mb-0.5">Leave request approved</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Your leave on 22 June has been approved</p>
                            </div>
                            <span className="text-[9px] font-semibold text-slate-500 pt-1">Yesterday</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Mobile Navbar Spacer */}
            <div className="h-24 lg:hidden w-full"></div>
        </div>
    );
}
