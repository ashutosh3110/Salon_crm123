import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Users, Calendar, Search, Globe, ArrowUpRight, MessageSquare, Download, CalendarPlus, List, UserPlus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const defaultWeek = () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({ name, revenue: 0, appointments: 0 }));

export default function StaffDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payload, setPayload] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRange, setSelectedRange] = useState('week'); // 'today' | 'week' | 'month' | 'custom'
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });
    const [showCustomRangeModal, setShowCustomRangeModal] = useState(false);
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);

    const loadDashboard = useCallback(async (rangeVal = selectedRange, start = startDate, end = endDate) => {
        setError(null);
        try {
            let url = `/dashboard/salon?range=${rangeVal}`;
            if (rangeVal === 'custom') {
                url += `&startDate=${start}&endDate=${end}`;
            }
            // Enforce outlet filter by passing user's outletId if present
            if (user?.outletId) {
                url += `&outletId=${user.outletId}`;
            }
            const res = await api.get(url);
            if (res.data?.success) {
                setPayload(res.data.data);
            } else {
                setPayload(res.data);
            }
        } catch (e) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [selectedRange, startDate, endDate, user]);

    useEffect(() => {
        if (user) {
            loadDashboard(selectedRange, startDate, endDate);
        }
    }, [loadDashboard, selectedRange, startDate, endDate, user]);

    const revenueData = useMemo(() => {
        return payload?.revenueWeek || defaultWeek();
    }, [payload]);

    const headerDateText = useMemo(() => {
        const now = new Date();
        if (selectedRange === 'today') {
            return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else if (selectedRange === 'week') {
            const currentDay = now.getDay();
            const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
            const monday = new Date(now);
            monday.setDate(now.getDate() + distanceToMonday);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            const options = { month: 'short', day: 'numeric' };
            const start = monday.toLocaleDateString('en-US', options);
            const end = sunday.toLocaleDateString('en-US', { ...options, year: 'numeric' });
            return `${start} – ${end}`;
        } else if (selectedRange === 'month') {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const options = { month: 'short', day: 'numeric' };
            const start = firstDay.toLocaleDateString('en-US', options);
            const end = lastDay.toLocaleDateString('en-US', { ...options, year: 'numeric' });
            return `${start} – ${end}`;
        } else if (selectedRange === 'custom') {
            const options = { month: 'short', day: 'numeric' };
            const start = new Date(startDate).toLocaleDateString('en-US', options);
            const end = new Date(endDate).toLocaleDateString('en-US', { ...options, year: 'numeric' });
            return `${start} – ${end}`;
        }
        return '';
    }, [selectedRange, startDate, endDate]);

    const totalPeriodRevenue = useMemo(() => {
        if (!payload?.revenueWeek) return 0;
        return payload.revenueWeek.reduce((sum, item) => sum + (item.revenue || 0), 0);
    }, [payload]);

    const periodPctText = useMemo(() => {
        if (selectedRange !== 'week' && selectedRange !== 'month') return null;
        const current = selectedRange === 'month' ? (payload?.stats?.thisMonthRev ?? 0) : (payload?.stats?.thisWeekRev ?? 0);
        const last = selectedRange === 'month' ? (payload?.stats?.lastMonthRev ?? 0) : (payload?.stats?.lastWeekRev ?? 0);
        if (last > 0) {
            const pct = Math.round(((current - last) / last) * 100);
            return `${pct >= 0 ? '+' : ''}${pct}% vs last ${selectedRange === 'month' ? 'month' : 'week'}`;
        } else if (current > 0) {
            return `+100% vs last ${selectedRange === 'month' ? 'month' : 'week'}`;
        }
        return `0% vs last ${selectedRange === 'month' ? 'month' : 'week'}`;
    }, [payload, selectedRange]);

    const serviceDistribution = useMemo(() => {
        return payload?.serviceDistribution || [];
    }, [payload]);

    const activeStats = useMemo(() => {
        const s = payload?.stats || {};
        return [
            {
                label: 'Assigned Outlet',
                value: 1,
                subtitle: 'Active Branch',
                icon: Globe,
                path: '#',
                linkText: 'My Outlet View',
                iconColorClass: '!text-[#7C3AED] dark:!text-[#A78BFA]',
                iconBgClass: '!bg-[#EDE9FE] dark:!bg-[#7C3AED]/20',
                cardBgClass: '!bg-[#FAF5FF] dark:!bg-[#7C3AED]/5',
                cardBorderClass: '!border-[#F3E8FF] dark:!border-[#7C3AED]/15',
            },
            {
                label: 'Outlet Bookings',
                value: s.bookingsTotal ?? 0,
                subtitle: 'Total Appointments',
                icon: Calendar,
                path: '/receptionist/appointments',
                linkText: 'View bookings',
                iconColorClass: '!text-[#059669] dark:!text-[#34D399]',
                iconBgClass: '!bg-[#D1FAE5] dark:!bg-[#059669]/20',
                cardBgClass: '!bg-[#F0FDF4] dark:!bg-[#059669]/5',
                cardBorderClass: '!border-[#DCFCE7] dark:!border-[#059669]/15 hover:!border-[#86EFAC] dark:hover:!border-[#34D399]/50',
            },
            {
                label: 'Branch Customers',
                value: s.clients ?? 0,
                subtitle: 'Assigned Client Registry',
                icon: Users,
                path: '#',
                linkText: 'Active Clients',
                iconColorClass: '!text-[#2563EB] dark:!text-[#60A5FA]',
                iconBgClass: '!bg-[#DBEAFE] dark:!bg-[#2563EB]/20',
                cardBgClass: '!bg-[#EFF6FF] dark:!bg-[#2563EB]/5',
                cardBorderClass: '!border-[#DBEAFE] dark:!border-[#2563EB]/15 hover:!border-[#93C5FD] dark:hover:!border-[#60A5FA]/50',
            },
            {
                label: 'Outlet Staff',
                value: s.staff ?? 0,
                subtitle: 'On Duty Team',
                icon: TrendingUp,
                path: '#',
                linkText: 'Active Staff',
                iconColorClass: '!text-[#EA580C] dark:!text-[#FB923C]',
                iconBgClass: '!bg-[#FFEDD5] dark:!bg-[#EA580C]/20',
                cardBgClass: '!bg-[#FFF7ED] dark:!bg-[#EA580C]/5',
                cardBorderClass: '!border-[#FFEDD5] dark:!border-[#EA580C]/15 hover:!border-[#FDBA74] dark:hover:!border-[#FB923C]/50',
            },
        ];
    }, [payload]);

    const liveRecentActivity = useMemo(() => payload?.recentActivity || [], [payload]);

    const totalServices = useMemo(() => {
        return serviceDistribution.reduce((acc, curr) => acc + (curr.value || 0), 0);
    }, [serviceDistribution]);

    const recentActivityFormatted = useMemo(() => {
        return liveRecentActivity.slice(0, 3).map((item) => {
            let category = 'Booking';
            let bgClass = 'bg-[#ECFDF5] dark:bg-[#059669]/10';
            let colorClass = 'text-[#059669] dark:text-[#34D399]';
            let badgeClass = 'bg-[#ECFDF5] text-[#059669] dark:bg-[#059669]/20 dark:text-[#34D399]';
            let icon = Calendar;

            if (item.service?.toLowerCase().includes('message') || item.client?.toLowerCase().includes('whatsapp')) {
                category = 'WhatsApp';
                bgClass = 'bg-emerald-50 dark:bg-emerald-950/20';
                colorClass = 'text-emerald-600 dark:text-emerald-450';
                badgeClass = 'bg-[#E8FDF0] text-emerald-600 dark:bg-[#059669]/20 dark:text-emerald-400';
                icon = MessageSquare;
            } else if (item.service?.toLowerCase().includes('new') || !item.service || item.service === 'N/A') {
                category = 'Client';
                bgClass = 'bg-[#EFF6FF] dark:bg-[#2563EB]/10';
                colorClass = 'text-[#2563EB] dark:text-[#60A5FA]';
                badgeClass = 'bg-[#EFF6FF] text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#60A5FA]';
                icon = Users;
            }

            let title = item.service && item.service !== 'N/A'
                ? `Booking: ${item.service} (${item.client})`
                : `New client: ${item.client}`;

            let timeLabel = `Today, ${item.time || '10:30 AM'}`;
            if (item.createdAt) {
                const dateVal = new Date(item.createdAt);
                const now = new Date();
                const isToday = dateVal.toDateString() === now.toDateString();

                const yesterday = new Date();
                yesterday.setDate(now.getDate() - 1);
                const isYesterday = dateVal.toDateString() === yesterday.toDateString();

                if (isToday) {
                    timeLabel = `Today, ${item.time}`;
                } else if (isYesterday) {
                    timeLabel = `Yesterday, ${item.time}`;
                } else {
                    const formattedDate = dateVal.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    timeLabel = `${formattedDate}, ${item.time}`;
                }
            }

            return {
                title,
                timeLabel,
                category,
                bgClass,
                colorClass,
                badgeClass,
                icon
            };
        });
    }, [liveRecentActivity]);

    const handleExportReport = () => {
        try {
            const stats = payload?.stats || {};
            const revData = revenueData || [];
            const activity = liveRecentActivity || [];

            let csvContent = "data:text/csv;charset=utf-8,";

            csvContent += "OUTLET PERFORMANCE SUMMARY\n";
            csvContent += `Generated On,${new Date().toLocaleString()}\n`;
            csvContent += `Reporting Range,${selectedRange === 'week' ? 'Weekly' : 'Monthly'}\n\n`;

            csvContent += "Metric,Value\n";
            csvContent += `Total Bookings,${stats.bookingsTotal ?? 0}\n`;
            csvContent += `Active Clients,${stats.clients ?? 0}\n`;
            csvContent += `Staff Members,${stats.staff ?? 0}\n`;
            csvContent += `This Period Revenue,INR ${totalPeriodRevenue}\n\n`;

            csvContent += "REVENUE DATA POINTS\n";
            csvContent += "Period/Day,Revenue (INR)\n";
            revData.forEach(item => {
                csvContent += `${item.name},${item.revenue}\n`;
            });
            csvContent += "\n";

            csvContent += "RECENT BUSINESS ACTIVITY LOG\n";
            csvContent += "Activity details,Time,Category,Amount\n";
            activity.forEach(item => {
                const title = item.service && item.service !== 'N/A' ? `Booking: ${item.service}` : 'New Client Registration';
                csvContent += `"${title} (${item.client})",${item.time || 'N/A'},${item.amount ? 'Paid' : 'Pending'},${item.amount || 0}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `outlet_report_${selectedRange}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Outlet performance report exported!");
        } catch (e) {
            console.error("Failed to export business report:", e);
            toast.error("Failed to export report");
        }
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Loading Dashboard...</div>;

    return (
        <div className="space-y-6 animate-reveal font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        Welcome Back, {user?.name || 'Staff'}! <span className="animate-pulse">👋</span>
                    </h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal mt-1.5">
                        Here&apos;s the performance breakdown for your assigned outlet.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative z-50">
                        <button
                            onClick={() => setHeaderDropdownOpen(!headerDropdownOpen)}
                            type="button"
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer shadow-sm focus:outline-none select-none min-h-[34px]"
                        >
                            <Calendar className="w-3.5 h-3.5 text-[#B4912B]" />
                            <span>{headerDateText}</span>
                            <span className="text-[7px] text-slate-400 ml-1">▼</span>
                        </button>
                        {headerDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setHeaderDropdownOpen(false)} />
                                <div className="absolute right-0 mt-1.5 w-36 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 shadow-lg z-50 transition-all text-left">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedRange('today');
                                            setHeaderDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3.5 py-1.5 text-[11px] font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 block ${selectedRange === 'today' ? '!text-[#B4912B] dark:!text-[#B4912B]' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        Today
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedRange('week');
                                            setHeaderDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3.5 py-1.5 text-[11px] font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 block ${selectedRange === 'week' ? '!text-[#B4912B] dark:!text-[#B4912B]' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        This Week
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedRange('month');
                                            setHeaderDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3.5 py-1.5 text-[11px] font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 block ${selectedRange === 'month' ? '!text-[#B4912B] dark:!text-[#B4912B]' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        This Month
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleExportReport}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B4912B] hover:bg-[#A57C1E] text-white text-xs font-extrabold shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {activeStats.map((stat, i) => (
                    <div
                        key={i}
                        className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md ${stat.cardBgClass} ${stat.cardBorderClass}`}
                    >
                        <div className="flex !items-start gap-3 !text-left">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBgClass}`} style={{ borderRadius: '12px' }}>
                                <stat.icon className={`w-4 h-4 ${stat.iconColorClass}`} strokeWidth={2} />
                            </div>

                            <div className="flex flex-col !items-start !text-left">
                                <span
                                    style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }}
                                    className="uppercase text-slate-500 dark:text-slate-455 leading-none mb-1.5 !text-left"
                                >
                                    {stat.label}
                                </span>
                                <h3
                                    style={{ fontSize: '24px', fontWeight: 850 }}
                                    className="text-slate-800 dark:text-slate-55 leading-none tracking-tight !text-left"
                                >
                                    <AnimatedCounter value={stat.value} />
                                </h3>
                                <span
                                    style={{ fontSize: '12px', fontWeight: 500 }}
                                    className="text-slate-500 dark:text-slate-400 mt-1.5 !text-left"
                                >
                                    {stat.subtitle}
                                </span>
                            </div>
                        </div>

                        <div
                            style={{ fontSize: '11px', fontWeight: 700 }}
                            className="flex !items-center gap-1 mt-auto pt-2 transition-all opacity-90 group-hover:opacity-100 whitespace-nowrap !text-left !justify-start"
                        >
                            <span className={stat.iconColorClass}>{stat.linkText}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 !bg-white dark:!bg-slate-900 p-5 !rounded-[24px] !border !border-slate-100 dark:!border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] group hover:shadow-md transition-all !overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Revenue Trends ({selectedRange === 'today' ? 'Daily' : selectedRange === 'month' ? 'Monthly' : 'Weekly'})</h2>
                            <div className="relative z-50">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    type="button"
                                    className="flex items-center gap-2 pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-350 transition-all select-none min-h-[30px]"
                                >
                                    <span>{selectedRange === 'today' ? 'Today' : selectedRange === 'month' ? 'This Month' : 'This Week'}</span>
                                    <span className="text-[7px] text-slate-400">▼</span>
                                </button>
                                {dropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setDropdownOpen(false)} />
                                        <div className="absolute right-0 mt-1.5 w-32 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 shadow-lg z-50 transition-all">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRange('today');
                                                    setDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3.5 py-1.5 text-[11px] font-bold transition-all hover:bg-slate-55 dark:hover:bg-slate-700 block ${selectedRange === 'today' ? '!text-[#B4912B] dark:!text-[#B4912B]' : 'text-slate-500 dark:text-slate-400'}`}
                                            >
                                                Today
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRange('week');
                                                    setDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3.5 py-1.5 text-[11px] font-bold transition-all hover:bg-slate-55 dark:hover:bg-slate-700 block ${selectedRange === 'week' ? '!text-[#B4912B] dark:!text-[#B4912B]' : 'text-slate-500 dark:text-slate-400'}`}
                                            >
                                                This Week
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRange('month');
                                                    setDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3.5 py-1.5 text-[11px] font-bold transition-all hover:bg-slate-55 dark:hover:bg-slate-700 block ${selectedRange === 'month' ? '!text-[#B4912B] dark:!text-[#B4912B]' : 'text-slate-500 dark:text-slate-400'}`}
                                            >
                                                This Month
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/80 dark:border-slate-800 rounded-xl p-3.5 min-w-[160px] text-left">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                                    Total Revenue
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                        ₹{totalPeriodRevenue.toLocaleString('en-IN')}
                                    </span>
                                    {periodPctText && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-[10px] font-bold bg-[#ECFDF5] dark:bg-[#059669]/10 text-[#059669] dark:text-[#34D399]">
                                            {periodPctText}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="h-[200px] w-full min-w-0 overflow-hidden mb-5">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#A57C1E" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#A57C1E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>

                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 100, fill: '#94a3b8' }}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 100, fill: '#94a3b8' }}
                                        tickFormatter={(val) => `₹${val}`}
                                        tickMargin={10}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-left">
                                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                                            {payload[0].payload.name}
                                                        </p>
                                                        <p className="text-sm font-black text-[#A57C1E] dark:text-[#E2B13C]">
                                                            Revenue: ₹{payload[0].value.toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#A57C1E"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        activeDot={{ r: 6, fill: '#A57C1E', stroke: 'none', strokeWidth: 0 }}
                                        dot={{ r: 4, fill: '#A57C1E', stroke: 'none', strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'This Week', value: payload?.stats?.thisWeekRev ?? 0, last: payload?.stats?.lastWeekRev ?? 0 },
                            { label: 'Last Week', value: payload?.stats?.lastWeekRev ?? 0 },
                            { label: 'This Month', value: payload?.stats?.thisMonthRev ?? 0, last: payload?.stats?.lastMonthRev ?? 0 },
                            { label: 'Last Month', value: payload?.stats?.lastMonthRev ?? 0 }
                        ].map((item, idx) => {
                            let pctText = '0%';
                            if (item.last !== undefined) {
                                const current = item.value;
                                const last = item.last;
                                if (last > 0) {
                                    const pct = Math.round(((current - last) / last) * 100);
                                    pctText = `${pct >= 0 ? '+' : ''}${pct}%`;
                                } else if (current > 0) {
                                    pctText = '+100%';
                                }
                            }
                            const isPositive = !pctText.startsWith('-');

                            return (
                                <div key={idx} className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/60 dark:border-slate-800 rounded-xl p-3 text-left">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                                        {item.label}
                                    </span>
                                    <div className="flex items-center justify-between gap-1 flex-wrap">
                                        <span className="text-[15px] font-black text-slate-850 dark:text-slate-200 whitespace-nowrap">
                                            ₹{item.value.toLocaleString('en-IN')}
                                        </span>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isPositive
                                            ? 'bg-[#ECFDF5] dark:bg-[#059669]/10 text-[#059669] dark:text-[#34D399]'
                                            : 'bg-rose-50 dark:bg-rose-955/15 text-rose-600 dark:text-rose-400'
                                            }`}>
                                            {pctText}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="!bg-white dark:!bg-slate-900 p-5 !rounded-[24px] !border !border-slate-100 dark:!border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] group hover:shadow-md transition-all !overflow-hidden text-left">
                        <h2 className="text-base font-bold text-slate-855 dark:text-slate-100 tracking-tight mb-3">Service Split</h2>
                        <div className="flex items-center justify-center gap-8 flex-wrap sm:flex-nowrap mt-2">
                            <div className="h-[125px] w-[125px] relative shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={serviceDistribution}
                                            dataKey="value"
                                            innerRadius={36}
                                            outerRadius={54}
                                            paddingAngle={4}
                                            stroke="none"
                                            strokeWidth={0}
                                        >
                                            {serviceDistribution.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} stroke="none" strokeWidth={0} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                    <span style={{ fontSize: '8px', lineHeight: '10px' }} className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
                                    <span className="text-lg font-black text-slate-800 dark:text-slate-100 my-0.5 leading-none">{totalServices}</span>
                                    <span style={{ fontSize: '7.5px', lineHeight: '10px' }} className="font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Services</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                                {serviceDistribution.slice(0, 5).map((item, idx) => {
                                    return (
                                        <div key={idx} className="flex items-center text-xs gap-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                <span className="font-bold text-slate-600 dark:text-slate-350 truncate">{item.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {serviceDistribution.length === 0 && (
                                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">No service data</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="!bg-white dark:!bg-slate-900 p-5 !rounded-[24px] !border !border-slate-100 dark:!border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] group hover:shadow-md transition-all !overflow-hidden text-left">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-bold text-slate-855 dark:text-slate-100 tracking-tight">Recent Activity</h2>
                        </div>
                        <div className="flex flex-col">
                            {recentActivityFormatted.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b border-slate-55 dark:border-slate-800/40 last:border-b-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 ${item.bgClass}`}>
                                            <item.icon className={`w-4 h-4 ${item.colorClass}`} />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-[11.5px] font-bold text-slate-800 dark:text-slate-100 truncate leading-snug">{item.title}</p>
                                            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold tracking-wide mt-0.5 leading-none">{item.timeLabel}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentActivityFormatted.length === 0 && (
                                <div className="text-xs text-slate-400 font-bold uppercase py-4">No recent activity at this branch</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
    );
}
