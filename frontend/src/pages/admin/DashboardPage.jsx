import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Users, Calendar, Search, Globe, ArrowUpRight, ArrowRight, MessageSquare, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import api from '../../services/api';

const defaultWeek = () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({ name, revenue: 0, appointments: 0 }));

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payload, setPayload] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
    const [selectedRange, setSelectedRange] = useState('week'); // 'week' or 'month'
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const loadDashboard = useCallback(async (rangeVal = selectedRange) => {
        setError(null);
        try {
            const res = await api.get(`/dashboard/salon?range=${rangeVal}`);
            if (res.data?.success) {
                setPayload(res.data.data);
                const s = res.data.data?.stats || {};
                if (s.whatsappCredits !== undefined && Number(s.whatsappCredits) <= 200) {
                    const alertShown = sessionStorage.getItem('low_whatsapp_credit_alert_shown');
                    if (!alertShown) {
                        setShowLowCreditAlert(true);
                        sessionStorage.setItem('low_whatsapp_credit_alert_shown', 'true');
                    }
                }
            } else {
                setPayload(res.data);
            }
        } catch (e) {
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    }, [selectedRange]);

    useEffect(() => {
        loadDashboard(selectedRange);
        const interval = setInterval(() => loadDashboard(selectedRange), 60000);
        return () => clearInterval(interval);
    }, [loadDashboard, selectedRange]);

    const revenueData = useMemo(() => {
        return payload?.revenueWeek || defaultWeek();
    }, [payload]);

    const totalPeriodRevenue = useMemo(() => {
        return selectedRange === 'month' 
            ? (payload?.stats?.thisMonthRev ?? 0) 
            : (payload?.stats?.thisWeekRev ?? 0);
    }, [payload, selectedRange]);

    const periodPctText = useMemo(() => {
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
        const credits = s.whatsappCredits ?? 0;
        return [
            {
                label: 'Total Outlets',
                value: s.outlets ?? 0,
                subtitle: 'Outlets',
                icon: Globe,
                path: '/admin/outlets',
                linkText: 'View outlets',
                iconColorClass: '!text-[#7C3AED] dark:!text-[#A78BFA]',
                iconBgClass: '!bg-[#EDE9FE] dark:!bg-[#7C3AED]/20',
                cardBgClass: '!bg-[#FAF5FF] dark:!bg-[#7C3AED]/5',
                cardBorderClass: '!border-[#F3E8FF] dark:!border-[#7C3AED]/15 hover:!border-[#D8B4FE] dark:hover:!border-[#A78BFA]/50',
            },
            {
                label: 'Total Bookings',
                value: s.bookingsTotal ?? 0,
                subtitle: 'Bookings',
                icon: Calendar,
                path: '/admin/bookings',
                linkText: 'View bookings',
                iconColorClass: '!text-[#059669] dark:!text-[#34D399]',
                iconBgClass: '!bg-[#D1FAE5] dark:!bg-[#059669]/20',
                cardBgClass: '!bg-[#F0FDF4] dark:!bg-[#059669]/5',
                cardBorderClass: '!border-[#DCFCE7] dark:!border-[#059669]/15 hover:!border-[#86EFAC] dark:hover:!border-[#34D399]/50',
            },
            {
                label: 'Active Clients',
                value: s.clients ?? 0,
                subtitle: 'CRM',
                icon: Users,
                path: '/admin/crm/customers',
                linkText: 'View clients',
                iconColorClass: '!text-[#2563EB] dark:!text-[#60A5FA]',
                iconBgClass: '!bg-[#DBEAFE] dark:!bg-[#2563EB]/20',
                cardBgClass: '!bg-[#EFF6FF] dark:!bg-[#2563EB]/5',
                cardBorderClass: '!border-[#DBEAFE] dark:!border-[#2563EB]/15 hover:!border-[#93C5FD] dark:hover:!border-[#60A5FA]/50',
            },
            {
                label: 'Staff Members',
                value: s.staff ?? 0,
                subtitle: 'Team',
                icon: TrendingUp,
                path: '/admin/staff',
                linkText: 'View staff',
                iconColorClass: '!text-[#EA580C] dark:!text-[#FB923C]',
                iconBgClass: '!bg-[#FFEDD5] dark:!bg-[#EA580C]/20',
                cardBgClass: '!bg-[#FFF7ED] dark:!bg-[#EA580C]/5',
                cardBorderClass: '!border-[#FFEDD5] dark:!border-[#EA580C]/15 hover:!border-[#FDBA74] dark:hover:!border-[#FB923C]/50',
            },
            {
                label: 'WhatsApp Credits',
                value: credits,
                subtitle: credits <= 200 ? 'Low Credits!' : 'Credits',
                icon: MessageSquare,
                path: '/admin/whatsapp-credits',
                linkText: credits <= 200 ? 'Top up now' : 'Top up now',
                iconColorClass: '!text-[#16A34A] dark:!text-[#4ADE80]',
                iconBgClass: '!bg-[#DCFCE7] dark:!bg-[#16A34A]/20',
                cardBgClass: '!bg-[#F2FDF5] dark:!bg-[#16A34A]/5',
                cardBorderClass: '!border-[#E8FDF0] dark:!border-[#16A34A]/15 hover:!border-[#A7F3D0] dark:hover:!border-[#4ADE80]/50',
            },
        ];
    }, [payload]);

    const liveRecentActivity = useMemo(() => payload?.recentActivity || [], [payload]);

    const filteredRecentActivity = useMemo(() => {
        if (!searchQuery.trim()) return liveRecentActivity;
        const q = searchQuery.toLowerCase();
        return liveRecentActivity.filter(activity =>
            activity.client?.toLowerCase().includes(q) ||
            activity.service?.toLowerCase().includes(q) ||
            activity.amount?.toString().includes(q)
        );
    }, [liveRecentActivity, searchQuery]);

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

    if (loading) return <div className="p-8 text-center text-text-muted">Loading Dashboard...</div>;

    return (
        <div className="space-y-6 animate-reveal font-sans">
            {/* Clean styling using Tailwind !important overrides to bypass AdminLayout rules */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        Welcome Back, Admin! <span className="animate-pulse">👋</span>
                    </h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal mt-1.5">
                        Here's what's happening with your business today.
                    </p>
                </div>
                
                {/* Datepicker dropdown and export report buttons */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>May 20 – May 26, 2025</span>
                        <span className="text-[7px] text-slate-400 ml-1">▼</span>
                    </div>
                    
                    <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B4912B] hover:bg-[#A57C1E] text-white text-xs font-extrabold shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                 {activeStats.map((stat, i) => (
                      <Link
                          to={stat.path}
                          key={i}
                          className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md ${stat.cardBgClass} ${stat.cardBorderClass}`}
                      >
                          {/* Upper Section: Icon on Left, Column of Labels on Right */}
                          <div className="flex !items-start gap-3 !text-left">
                              {/* Circle Icon */}
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${stat.iconBgClass}`}>
                                  <stat.icon className={`w-4 h-4 ${stat.iconColorClass}`} strokeWidth={2} />
                              </div>
                              
                              {/* Label + Value + Subtitle */}
                              <div className="flex flex-col !items-start !text-left">
                                  <span 
                                      style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }} 
                                      className="uppercase text-slate-500 dark:text-slate-450 leading-none mb-1.5 !text-left"
                                  >
                                     {stat.label}
                                  </span>
                                  <h3 
                                      style={{ fontSize: '24px', fontWeight: 850 }} 
                                      className="text-slate-800 dark:text-slate-50 leading-none tracking-tight !text-left"
                                  >
                                      <AnimatedCounter value={stat.value} prefix={stat.prefix} />
                                  </h3>
                                  <span 
                                      style={{ fontSize: '12px', fontWeight: 500 }} 
                                      className="text-slate-500 dark:text-slate-400 mt-1.5 !text-left"
                                  >
                                      {stat.subtitle}
                                  </span>
                              </div>
                          </div>
 
                          {/* View link at the bottom left */}
                          <div 
                              style={{ fontSize: '11px', fontWeight: 700 }} 
                              className="flex !items-center gap-1 mt-auto pt-2 transition-all opacity-90 group-hover:opacity-100 whitespace-nowrap !text-left !justify-start"
                          >
                              <span className={stat.iconColorClass}>{stat.linkText}</span>
                              <span 
                                  style={{ fontSize: '12px' }} 
                                  className={`inline-block transition-transform duration-200 group-hover:translate-x-1 leading-none ${stat.iconColorClass}`}
                              >
                                 →
                             </span>
                         </div>
                     </Link>
                 ))}
             </div>
 
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                 <div className="lg:col-span-2 !bg-white dark:!bg-slate-900 p-5 !rounded-[24px] !border !border-slate-100 dark:!border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] group hover:shadow-md transition-all !overflow-hidden flex flex-col justify-between">
                    <div>
                        {/* Header: Title + Custom Dropdown Toggle */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Revenue Trends ({selectedRange === 'month' ? 'Monthly' : 'Weekly'})</h2>
                            <div className="relative z-50">
                                <button 
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    type="button"
                                    className="flex items-center gap-2 pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-350 transition-all select-none min-h-[30px]"
                                >
                                    <span>{selectedRange === 'month' ? 'This Month' : 'This Week'}</span>
                                    <span className="text-[7px] text-slate-400">▼</span>
                                </button>
                                {dropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setDropdownOpen(false)} />
                                        <div className="absolute right-0 mt-1.5 w-32 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 shadow-lg z-50 transition-all">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRange('week');
                                                    setDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3.5 py-1.5 text-[11px] font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 block ${selectedRange === 'week' ? '!text-[#B4912B] dark:!text-[#B4912B]' : 'text-slate-500 dark:text-slate-400'}`}
                                            >
                                                This Week
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRange('month');
                                                    setDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3.5 py-1.5 text-[11px] font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 block ${selectedRange === 'month' ? '!text-[#B4912B] dark:!text-[#B4912B]' : 'text-slate-500 dark:text-slate-400'}`}
                                            >
                                                This Month
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>                        {/* Summary Row */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/80 dark:border-slate-800 rounded-xl p-3.5 min-w-[160px] text-left">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                                    Total Revenue
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                        ₹{totalPeriodRevenue.toLocaleString('en-IN')}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-[10px] font-bold bg-[#ECFDF5] dark:bg-[#059669]/10 text-[#059669] dark:text-[#34D399]">
                                        {periodPctText}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Line Chart */}
                        <div className="h-[200px] w-full min-w-0 overflow-hidden mb-5">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#A57C1E" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#A57C1E" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} strokeOpacity={0.15} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                                        tickFormatter={(val) => `₹${val}`}
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
                                        activeDot={{ r: 6, fill: '#A57C1E', strokeWidth: 2, stroke: '#fff' }}
                                        dot={{ r: 4, fill: '#A57C1E', strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bottom Mini Cards */}
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
                                        <span className="text-[15px] font-black text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                            ₹{item.value.toLocaleString('en-IN')}
                                        </span>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                            isPositive 
                                                ? 'bg-[#ECFDF5] dark:bg-[#059669]/10 text-[#059669] dark:text-[#34D399]' 
                                                : 'bg-rose-50 dark:bg-rose-950/15 text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {pctText}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Right Stack: Service Split & Recent Activity */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* Service Split Card */}
                    <div className="!bg-white dark:!bg-slate-900 p-5 !rounded-[24px] !border !border-slate-100 dark:!border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] group hover:shadow-md transition-all !overflow-hidden text-left">
                        <h2 className="text-base font-bold text-slate-855 dark:text-slate-100 tracking-tight mb-3">Service Split</h2>
                        <div className="flex items-center gap-2 justify-between flex-wrap sm:flex-nowrap">
                            {/* Donut Chart */}
                            <div className="h-[125px] w-[125px] relative shrink-0 mx-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={serviceDistribution} 
                                            dataKey="value" 
                                            innerRadius={36} 
                                            outerRadius={54} 
                                            paddingAngle={4}
                                        >
                                            {serviceDistribution.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Labels inside Donut */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                    <span style={{ fontSize: '8px', lineHeight: '10px' }} className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
                                    <span className="text-lg font-black text-slate-800 dark:text-slate-100 my-0.5 leading-none">{totalServices}</span>
                                    <span style={{ fontSize: '7.5px', lineHeight: '10px' }} className="font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Services</span>
                                </div>
                            </div>
 
                            {/* Custom Legend */}
                            <div className="flex flex-col gap-1.5 w-full min-w-0 pl-2">
                                {serviceDistribution.slice(0, 5).map((item, idx) => {
                                    const pct = totalServices > 0 ? Math.round((item.value / totalServices) * 100) : 0;
                                    return (
                                        <div key={idx} className="flex items-center justify-between text-xs gap-3">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                <span className="font-bold text-slate-600 dark:text-slate-350 truncate">{item.name}</span>
                                            </div>
                                            <span className="font-black text-slate-800 dark:text-slate-200 shrink-0">{item.value} ({pct}%)</span>
                                        </div>
                                    );
                                })}
                                {serviceDistribution.length === 0 && (
                                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">No service data</div>
                                )}
                            </div>
                        </div>
                    </div>
 
                    {/* Recent Activity Card */}
                    <div className="!bg-white dark:!bg-slate-900 p-5 !rounded-[24px] !border !border-slate-100 dark:!border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] group hover:shadow-md transition-all !overflow-hidden text-left">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-bold text-slate-855 dark:text-slate-100 tracking-tight">Recent Activity</h2>
                            <Link to="/admin/bookings" className="text-xs font-bold text-[#B4912B] hover:underline whitespace-nowrap">
                                View all →
                            </Link>
                        </div>
                        <div className="flex flex-col">
                            {recentActivityFormatted.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 dark:border-slate-800/40 last:border-b-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Custom Icon Circle */}
                                        <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 ${item.bgClass}`}>
                                            <item.icon className={`w-4 h-4 ${item.colorClass}`} />
                                        </div>
                                        {/* Text Block */}
                                        <div className="text-left min-w-0">
                                            <p className="text-[11.5px] font-bold text-slate-800 dark:text-slate-100 truncate leading-snug">{item.title}</p>
                                            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold tracking-wide mt-0.5 leading-none">{item.timeLabel}</p>
                                        </div>
                                    </div>
                                    {/* Right Badge */}
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${item.badgeClass}`}>
                                        {item.category}
                                    </span>
                                </div>
                            ))}
                            {recentActivityFormatted.length === 0 && (
                                <div className="py-6 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">No recent activities</div>
                            )}
                        </div>
                    </div>
                </div>
                </div>

            {showLowCreditAlert && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-left">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl relative overflow-hidden border border-rose-200 dark:border-rose-900 p-6 sm:p-8 text-left">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900 rounded-xl">
                                <MessageSquare className="w-8 h-8 animate-bounce text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest leading-none">Low WhatsApp Credits</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Critical system warning</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-350 leading-relaxed uppercase">
                                Your salon has only <span className="text-rose-600 dark:text-rose-400 font-black">{payload?.stats?.whatsappCredits}</span> WhatsApp credits remaining. 
                            </p>
                            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider leading-relaxed">
                                Once credits run out, automated service reminders, wallet notifications, and promotion sharing will stop working. Please recharge your credits immediately.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-8 mt-4 border-t border-slate-100 dark:border-slate-800">
                            <button 
                                onClick={() => setShowLowCreditAlert(false)} 
                                className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                            >
                                Dismiss
                            </button>
                            <Link 
                                to="/admin/whatsapp-credits" 
                                onClick={() => setShowLowCreditAlert(false)}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg rounded-xl text-center flex items-center justify-center transition-all"
                            >
                                Recharge Now
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
