import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Users, Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight,
    Search, UserPlus, Plus, UserCheck, TrendingUp, ArrowUpRight,
    ArrowDownRight, X, Phone, User, Shield, Loader2, Scissors,
    Smartphone, ChevronDown, Store, Zap, ShoppingCart, FileText,
    Eye, Edit3, Printer, Filter, CreditCard, Banknote, Wallet,
    DollarSign, Activity, BarChart3, Package, Hash, MapPin, Mail,
    CalendarPlus, ClipboardList
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { maskPhone } from '../../utils/phoneUtils';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import mockApi from '../../services/mock/mockApi';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from '../../components/common/CustomDropdown';

// Status badge color mapping
const statusColors = {
    confirmed: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
    arrived: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
    pending: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
    upcoming: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
    completed: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
    cancelled: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
};

function getStatusStyle(status) {
    const key = (status || '').toLowerCase();
    return statusColors[key] || statusColors.pending;
}

export default function ReceptionistDashboard() {
    const { user } = useAuth();
    const { bookings: registryBookings, addBooking, updateBookingStatus: registryUpdate } = useBookingRegistry();
    const { activeOutletId, setActiveOutletId, outlets } = useBusiness();

    const isReceptionistMode = user?.role === 'receptionist';
    const userOutletId = user?.outletId || user?.outlet?._id || user?.outlet;
    const outletToFetch = isReceptionistMode ? userOutletId : (activeOutletId || '');

    // Live States
    const [stats, setStats] = useState([]);
    const [hourlyFootfall, setHourlyFootfall] = useState([]);
    const [liveFeed, setLiveFeed] = useState([]);
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isWalkinOpen, setIsWalkinOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('booking'); // 'booking' | 'order'

    // Manual Booking Form State
    const [newBooking, setNewBooking] = useState({
        clientName: '',
        phone: '',
        serviceId: '',
        staffId: '',
        time: '12:00 PM',
        date: new Date().toISOString().split('T')[0]
    });

    // Order Form State
    const [newOrder, setNewOrder] = useState({
        clientName: '',
        phone: '',
        products: '',
        quantity: 1,
        notes: ''
    });

    // Client Registration State
    const [newClient, setNewClient] = useState({
        name: '',
        phone: '',
        email: '',
        gender: 'other'
    });

    // Load Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const d = new Date();
                const today = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

                const [statsRes, bookingsRes, servicesRes, staffRes] = await Promise.all([
                    mockApi.get(`/dashboard/receptionist?outletId=${outletToFetch || ''}`),
                    mockApi.get(`/bookings?date=${today}&limit=100&outletId=${outletToFetch || ''}`),
                    mockApi.get('/services?limit=100'),
                    mockApi.get('/users?role=stylist')
                ]);

                if (statsRes.data?.success) {
                    const iconMap = {
                        "Total Appointments": Calendar,
                        "Total Orders": ShoppingCart,
                        "New Customers": UserPlus,
                        "Total Invoices": FileText
                    };
                    setStats((statsRes.data.data?.stats || []).map(s => ({
                        ...s,
                        icon: iconMap[s.label] || AlertCircle
                    })));
                    if (statsRes.data.data?.hourlyFootfall) {
                        setHourlyFootfall(statsRes.data.data.hourlyFootfall);
                    }
                }

                // Get all today's bookings for availability check
                const allBookings = bookingsRes.data?.results || [];
                setLiveFeed(allBookings.slice(0, 8).map(b => ({
                    id: b.id || b._id,
                    client: b.clientId?.name || 'Walk-in',
                    service: b.serviceId?.name || 'Unknown',
                    time: b.time || (b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
                    professional: b.staffId?.name || 'Unassigned',
                    status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Upcoming',
                    source: b.source || 'APP',
                    amount: b.serviceId?.price || '—',
                    isRegistry: false
                })));

                // Determine busy staff (arrived or in-progress)
                const busyStaffIds = allBookings
                    .filter(b => ['arrived', 'in-progress'].includes(b.status?.toLowerCase()))
                    .map(b => {
                        const sId = b.staffId?._id || b.staffId?.id || b.staffId;
                        return sId ? String(sId) : null;
                    })
                    .filter(Boolean);

                // Populate Services
                const serviceList = servicesRes.data?.data?.results || servicesRes.data?.results || [];
                setServices(serviceList);

                // Populate Staff with availability
                const staffList = staffRes.data?.data?.results || staffRes.data?.results || [];
                setStaff(staffList.map(s => {
                    const sId = String(s._id || s.id);
                    return {
                        ...s,
                        isAvailable: !busyStaffIds.includes(sId)
                    };
                }));

            } catch (err) {
                console.error('Front Desk Matrix Sync Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // 1 min sync
        return () => clearInterval(interval);
    }, [outletToFetch]);

    useEffect(() => {
        if (isRegistrationOpen || isBookingOpen || isWalkinOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isRegistrationOpen, isBookingOpen, isWalkinOpen]);

    const handleAction = (protocol) => {
        if (protocol === 'Client Registration') setIsRegistrationOpen(true);
        if (protocol === 'Booking') setIsBookingOpen(true);
        if (protocol === 'Walk-in') setIsWalkinOpen(true);
    };

    const handleCheckIn = async (id) => {
        try {
            await mockApi.patch(`/bookings/${id}`, { status: 'arrived' });
            // Refresh feed
            const d = new Date();
            const today = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            const feedRes = await mockApi.get(`/bookings?date=${today}&limit=8`);
            if (feedRes.data.results) {
                setLiveFeed(feedRes.data.results.map(b => ({
                    id: b.id || b._id,
                    client: b.clientId?.name || 'Walk-in',
                    service: b.serviceId?.name || 'Unknown',
                    time: b.time || (b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
                    professional: b.staffId?.name || 'Unassigned',
                    status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Upcoming',
                    source: b.source || 'APP',
                    amount: b.serviceId?.price || '—'
                })));
            }
            alert(`Check-in Successful: Guest marked as arrived.`);
        } catch (err) {
            alert('Check-in Failed: Unable to process guest status.');
        }
    };

    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();
        try {
            await mockApi.post('/users', {
                ...newClient,
                role: 'client',
                tenantId: user?.tenantId
            });
            setIsRegistrationOpen(false);
            setNewClient({ name: '', phone: '', email: '', gender: 'other' });
            alert('Registration Successful: Guest added to database.');

            // Refresh stats
            const statsRes = await mockApi.get('/dashboard/receptionist');
            if (statsRes.data.success) {
                const iconMap = { "Total Appointments": Calendar, "Total Orders": ShoppingCart, "New Customers": UserPlus, "Total Invoices": FileText };
                setStats(statsRes.data.data.stats.map(s => ({ ...s, icon: iconMap[s.label] || AlertCircle })));
            }
        } catch (err) {
            alert('Registration Failed: ' + (err.response?.data?.message || 'Server error'));
        }
    };

    const handleManualBookingSubmit = async (e) => {
        e.preventDefault();

        if (!newBooking.serviceId || !newBooking.staffId || !newBooking.clientName || !newBooking.phone) {
            alert('Missing Required Protocols: Please complete all fields.');
            return;
        }

        try {
            const bookingData = {
                clientName: newBooking.clientName,
                phone: newBooking.phone,
                serviceId: newBooking.serviceId,
                staffId: newBooking.staffId,
                outletId: user?.outletId, // Explicitly pass the receptionist's outlet
                appointmentDate: new Date(`${newBooking.date} ${newBooking.time}`).toISOString(),
                time: newBooking.time,
                status: 'upcoming',
                source: 'RECEPTION'
            };

            await mockApi.post('/bookings', bookingData);

            // Refresh feed and stats
            const d = new Date();
            const today = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            const [statsRes, feedRes] = await Promise.all([
                mockApi.get(`/dashboard/receptionist?outletId=${outletToFetch || ''}`),
                mockApi.get(`/bookings?date=${today}&limit=8&outletId=${outletToFetch || ''}`)
            ]);

            if (statsRes.data.success) {
                const iconMap = {
                    "Total Appointments": Calendar,
                    "Total Orders": ShoppingCart,
                    "New Customers": UserPlus,
                    "Total Invoices": FileText
                };
                setStats(statsRes.data.data.stats.map(s => ({
                    ...s,
                    icon: iconMap[s.label] || AlertCircle
                })));
            }

            if (feedRes.data.results) {
                setLiveFeed(feedRes.data.results.map(b => ({
                    id: b.id || b._id,
                    client: b.clientId?.name || 'Walk-in',
                    service: b.serviceId?.name || 'Unknown',
                    time: b.time || (b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
                    professional: b.staffId?.name || 'Unassigned',
                    status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Upcoming',
                    source: b.source || 'APP',
                    amount: b.serviceId?.price || '—'
                })));
            }

            setNewBooking({
                clientName: '',
                phone: '',
                serviceId: '',
                staffId: '',
                time: '12:00 PM',
                date: new Date().toISOString().split('T')[0]
            });
            alert('Booking Successful: Appointment has been created.');
        } catch (err) {
            alert('Error: Failed to save the booking.');
        }
    };

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        if (!newOrder.clientName || !newOrder.phone || !newOrder.products) {
            alert('Please fill all required fields.');
            return;
        }
        try {
            await mockApi.post('/orders', {
                clientName: newOrder.clientName,
                phone: newOrder.phone,
                products: newOrder.products,
                quantity: newOrder.quantity,
                notes: newOrder.notes,
                outletId: user?.outletId,
                status: 'pending',
                source: 'RECEPTION'
            });
            setNewOrder({ clientName: '', phone: '', products: '', quantity: 1, notes: '' });
            alert('Order placed successfully!');
        } catch (err) {
            alert('Failed to place order.');
        }
    };

    // Filtered appointments
    const filteredFeed = useMemo(() => {
        return liveFeed.filter(apt => {
            const matchesSearch = !searchQuery ||
                apt.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                apt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                apt.professional.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || apt.status.toLowerCase() === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [liveFeed, searchQuery, statusFilter]);

    // Current date/shift info
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentHour = now.getHours();
    const shiftLabel = currentHour < 14 ? 'Morning Shift' : currentHour < 20 ? 'Evening Shift' : 'Night Shift';

    // Custom tooltip for chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-600 rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-[11px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-[12px] font-bold" style={{ color: p.color }}>
                            {p.name}: {p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Stat card color config (admin-style colorful cards)
    const statCardConfig = [
        {
            iconColorClass: 'text-violet-600 dark:text-[#A78BFA]',
            iconBgClass: 'bg-violet-100 dark:bg-violet-950/30',
            cardBgClass: 'bg-violet-50/30 dark:bg-violet-950/10',
            cardBorderClass: 'border-violet-100 dark:border-violet-900/30 hover:border-violet-300 dark:hover:border-violet-800',
        },
        {
            iconColorClass: 'text-emerald-600 dark:text-[#34D399]',
            iconBgClass: 'bg-emerald-100 dark:bg-emerald-950/30',
            cardBgClass: 'bg-emerald-50/30 dark:bg-emerald-950/10',
            cardBorderClass: 'border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-800',
        },
        {
            iconColorClass: 'text-blue-600 dark:text-[#60A5FA]',
            iconBgClass: 'bg-blue-100 dark:bg-blue-950/30',
            cardBgClass: 'bg-blue-50/30 dark:bg-blue-950/10',
            cardBorderClass: 'border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-800',
        },
        {
            iconColorClass: 'text-orange-600 dark:text-[#FB923C]',
            iconBgClass: 'bg-orange-100 dark:bg-orange-950/30',
            cardBgClass: 'bg-orange-50/30 dark:bg-orange-950/10',
            cardBorderClass: 'border-orange-100 dark:border-orange-900/30 hover:border-orange-300 dark:hover:border-orange-800',
        },
    ];

    return (
        <div className="space-y-5 animate-reveal font-sans">

            {/* ═══════════════════════════════════════════
                DASHBOARD HEADER
            ═══════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        Welcome Back! <span className="animate-pulse">👋</span>
                    </h1>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal mt-1.5">
                        {dateStr} · <span className="text-[#B4912B] font-semibold">{shiftLabel}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {user?.role !== 'receptionist' && (
                        <CustomDropdown
                            value={activeOutletId || ''}
                            onChange={(val) => setActiveOutletId(val)}
                            options={[
                                { label: 'All Outlets', value: '' },
                                ...(outlets || []).map(o => ({ label: o.name, value: o._id }))
                            ]}
                            placeholder="All Outlets"
                            className="min-w-[140px]"
                            triggerClassName="!py-1.5"
                            icon={Store}
                        />
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                KPI STAT CARDS — Admin-style colorful
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat, i) => {
                    const config = statCardConfig[i % statCardConfig.length];
                    const routeMap = {
                        "Total Appointments": "/receptionist/appointments",
                        "Total Orders": "/receptionist/pos/billing",
                        "New Customers": "/receptionist/leads",
                        "Total Invoices": "/receptionist/invoices"
                    };
                    return (
                        <div
                            key={i}
                            onClick={() => {
                                const route = routeMap[stat.label];
                                if (route) navigate(route);
                            }}
                            className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md cursor-pointer ${config.cardBgClass} ${config.cardBorderClass}`}
                        >
                            <div className="flex !items-start gap-3 !text-left">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${config.iconBgClass}`} style={{ borderRadius: '12px' }}>
                                    <stat.icon className={`w-4 h-4 ${config.iconColorClass}`} strokeWidth={2} />
                                </div>
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
                                        <AnimatedCounter value={stat.value} />
                                    </h3>
                                </div>
                            </div>
                            <div
                                style={{ fontSize: '11px', fontWeight: 700 }}
                                className="flex !items-center gap-1 mt-auto pt-2 transition-all opacity-80 group-hover:opacity-100 whitespace-nowrap !text-left !justify-start"
                            >
                                <span className={`flex items-center gap-0.5 ${stat.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                                    {stat.positive ? <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-rose-500 dark:text-rose-450" />}
                                    {stat.trend}
                                </span>
                                <span className="text-slate-400 dark:text-slate-500 ml-1">vs last period</span>
                            </div>
                        </div>
                    );
                })}
            </div>



            {/* ═══════════════════════════════════════════
                MAIN CONTENT
            ═══════════════════════════════════════════ */}
            <div className="space-y-4">

                    {/* Today's Traffic & Footfall Chart */}
                    <div className="!bg-white dark:!bg-slate-900 !rounded-[24px] !border !border-[#B4912B]/20 dark:!border-[#B4912B]/15 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-md hover:!border-[#B4912B]/35 dark:hover:!border-[#B4912B]/30 transition-all !overflow-hidden p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Today's Traffic & Footfall</h2>
                            <div className="flex items-center gap-4 text-[11px] font-medium text-[#6B7280]">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#B4912B]" /> Walk-ins
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Appointments
                                </span>
                            </div>
                        </div>
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={hourlyFootfall} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorWalkinsNew" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#B4912B" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#B4912B" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorBookingsNew" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="walkins" name="Walk-ins" stroke="#B4912B" fillOpacity={1} fill="url(#colorWalkinsNew)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#B4912B', strokeWidth: 0 }} />
                                    <Area type="monotone" dataKey="bookings" name="Appointments" stroke="#10b981" fillOpacity={1} fill="url(#colorBookingsNew)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Today's Appointments Table */}
                    <div className="!bg-white dark:!bg-slate-900 !rounded-[24px] !border !border-slate-100 dark:!border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all !overflow-hidden">
                        {/* Table Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Today's Appointments</h2>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase">{liveFeed.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[12px] font-medium text-slate-700 dark:text-white w-[160px] focus:outline-none focus:border-[#B4912B] transition-all"
                                        />
                                    </div>
                                    <CustomDropdown
                                        value={statusFilter}
                                        onChange={(val) => setStatusFilter(val)}
                                        options={[
                                            { label: 'All Status', value: 'all' },
                                            { label: 'Confirmed', value: 'confirmed' },
                                            { label: 'Pending', value: 'pending' },
                                            { label: 'Completed', value: 'completed' },
                                            { label: 'Cancelled', value: 'cancelled' }
                                        ]}
                                        placeholder="All Status"
                                        className="min-w-[120px]"
                                        triggerClassName="!py-1.5"
                                        icon={Filter}
                                    />
                                    <button onClick={() => navigate('/receptionist/appointments')} className="text-[11px] font-bold text-[#B4912B] hover:text-[#B8892A] flex items-center gap-1 transition-colors whitespace-nowrap">
                                        View All <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Table Content */}
                        <div className="overflow-x-auto" style={{ borderRadius: 0, border: 'none', boxShadow: 'none', marginBottom: 0 }}>
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left">Time</th>
                                        <th className="text-left">Customer</th>
                                        <th className="text-left">Service</th>
                                        <th className="text-left">Stylist</th>
                                        <th className="text-left">Status</th>
                                        <th className="text-right">Amount</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFeed.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-10">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Calendar className="w-8 h-8 text-[#E5E7EB] dark:text-slate-600" />
                                                    <p className="text-[13px] font-medium text-[#9CA3AF]">No appointments found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredFeed.map((apt) => {
                                            const sStyle = getStatusStyle(apt.status);
                                            return (
                                                <tr key={apt.id} className="group">
                                                    <td>
                                                        <span className="text-[12px] font-semibold text-[#1F2937] dark:text-white">{apt.time}</span>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg bg-[#B4912B]/10 flex items-center justify-center text-[10px] font-bold text-[#B4912B] shrink-0">
                                                                {apt.client[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-[12px] font-semibold text-[#1F2937] dark:text-white">{apt.client}</p>
                                                                {apt.source === 'APP' && (
                                                                    <span className="text-[9px] font-medium text-[#B4912B] flex items-center gap-0.5">
                                                                        <Smartphone className="w-2.5 h-2.5" /> App Booking
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-[12px] font-medium text-[#4B5563] dark:text-slate-300">{apt.service}</span>
                                                    </td>
                                                    <td>
                                                        <span className="text-[12px] font-medium text-[#4B5563] dark:text-slate-300">{apt.professional}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                                                            {apt.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <span className="text-[12px] font-semibold text-[#1F2937] dark:text-white">
                                                            {typeof apt.amount === 'number' ? `₹${apt.amount.toLocaleString('en-IN')}` : apt.amount}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button className="w-7 h-7 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-[#B4912B] hover:bg-[#B4912B]/5 transition-all" title="View">
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button className="w-7 h-7 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all" title="Edit">
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            {apt.status.toLowerCase() !== 'arrived' && apt.status.toLowerCase() !== 'completed' && (
                                                                <button
                                                                    onClick={() => handleCheckIn(apt.id)}
                                                                    className="w-7 h-7 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                                                                    title="Check In"
                                                                >
                                                                    <UserCheck className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
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

            {/* ═══════════════════════════════════════════
                MODALS
            ═══════════════════════════════════════════ */}

            {/* Manual Booking Modal */}
            {isBookingOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <style>{`
                        .receptionist-modal-card h3 {
                            color: #1e293b !important;
                        }
                        .receptionist-modal-card p {
                            color: #B4912B !important;
                        }
                        .receptionist-modal-card label {
                            color: #475569 !important;
                        }
                        .receptionist-modal-card button[type="button"] {
                            color: #475569 !important;
                        }
                        .receptionist-modal-card .close-btn-x {
                            background-color: #fee2e2 !important;
                        }
                        .receptionist-modal-card .close-btn-x:hover {
                            background-color: #fecaca !important;
                        }
                        .receptionist-modal-card .close-btn-x svg {
                            color: #dc2626 !important;
                            stroke: #dc2626 !important;
                        }
                        .receptionist-modal-card input,
                        .receptionist-modal-card select,
                        .receptionist-modal-card textarea {
                            color: #1e293b !important;
                        }
                        .dark .receptionist-modal-card h3 {
                            color: #ffffff !important;
                        }
                        .dark .receptionist-modal-card p {
                            color: #B4912B !important;
                        }
                        .dark .receptionist-modal-card label {
                            color: #cbd5e1 !important;
                        }
                        .dark .receptionist-modal-card button[type="button"] {
                            color: #cbd5e1 !important;
                        }
                        .dark .receptionist-modal-card .close-btn-x {
                            background-color: rgba(220, 38, 38, 0.15) !important;
                        }
                        .dark .receptionist-modal-card .close-btn-x:hover {
                            background-color: rgba(220, 38, 38, 0.25) !important;
                        }
                        .dark .receptionist-modal-card .close-btn-x svg {
                            color: #fca5a5 !important;
                            stroke: #fca5a5 !important;
                        }
                        .dark .receptionist-modal-card input,
                        .dark .receptionist-modal-card select,
                        .dark .receptionist-modal-card textarea {
                            color: #ffffff !important;
                        }
                    `}</style>
                    <div className="receptionist-modal-card admin-panel bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-full max-w-md relative animate-in zoom-in-95 duration-200 shadow-2xl rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#FEF3C7] dark:bg-[#B4912B]/20 text-[#B4912B] rounded-xl flex items-center justify-center">
                                    <Plus className="w-4 h-4 text-[#B4912B] stroke-[#B4912B]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">New Appointment</h3>
                                    <p className="text-[9px] text-[#B4912B] font-bold uppercase tracking-widest mt-1">Quick booking form</p>
                                </div>
                            </div>
                            <button onClick={() => setIsBookingOpen(false)} className="close-btn-x w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all text-slate-600 dark:text-slate-300" title="Close">
                                <X className="w-4 h-4 text-slate-600 dark:text-slate-300 stroke-2" />
                            </button>
                        </div>
                        <form onSubmit={handleManualBookingSubmit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Client Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <input
                                        required
                                        type="text"
                                        value={newBooking.clientName}
                                        onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[13px] font-medium text-slate-900 dark:text-white rounded-xl focus:border-[#B4912B] focus:outline-none transition-all"
                                        placeholder="Enter client name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <input
                                        required
                                        type="tel"
                                        value={newBooking.phone}
                                        onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[13px] font-medium text-slate-900 dark:text-white rounded-xl focus:border-[#B4912B] focus:outline-none transition-all"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Date</label>
                                    <input
                                        type="date"
                                        value={newBooking.date}
                                        onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[12px] font-medium text-slate-900 dark:text-white rounded-xl focus:border-[#B4912B] focus:outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Time Slot</label>
                                    <CustomDropdown
                                        value={newBooking.time}
                                        onChange={(val) => setNewBooking({ ...newBooking, time: val })}
                                        options={[
                                            '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM',
                                            '03:00 PM', '04:00 PM'
                                        ].map(t => ({ label: t, value: t }))}
                                        placeholder="Select time..."
                                        className="w-full"
                                        triggerClassName="!py-2.5"
                                        icon={Clock}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Service</label>
                                <CustomDropdown
                                    value={newBooking.serviceId}
                                    onChange={(val) => setNewBooking({ ...newBooking, serviceId: val })}
                                    options={services.map(s => ({ label: `${s.name} - ₹${s.price}`, value: s.id || s._id }))}
                                    placeholder="Select service..."
                                    className="w-full"
                                    triggerClassName="!py-2.5"
                                    icon={Scissors}
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Staff Assignment</label>
                                <CustomDropdown
                                    value={newBooking.staffId}
                                    onChange={(val) => setNewBooking({ ...newBooking, staffId: val })}
                                    options={staff.filter(s => s.isAvailable).map(s => ({ label: `${s.name} - ${s.role}`, value: s.id || s._id }))}
                                    placeholder="Select stylist..."
                                    className="w-full"
                                    triggerClassName="!py-2.5"
                                    icon={Users}
                                />
                            </div>
                            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setIsBookingOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-[#B4912B] hover:bg-[#9f8025] text-white font-bold text-[10px] uppercase tracking-widest shadow-md rounded-xl text-center flex items-center justify-center gap-2 transition-all">
                                    <Calendar className="w-3.5 h-3.5 text-white" /> Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Registration Modal */}
            {isRegistrationOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <style>{`
                        .receptionist-modal-card h3 {
                            color: #1e293b !important;
                        }
                        .receptionist-modal-card p {
                            color: #2563EB !important;
                        }
                        .receptionist-modal-card label {
                            color: #475569 !important;
                        }
                        .receptionist-modal-card button[type="button"] {
                            color: #475569 !important;
                        }
                        .receptionist-modal-card .close-btn-x {
                            background-color: #fee2e2 !important;
                        }
                        .receptionist-modal-card .close-btn-x:hover {
                            background-color: #fecaca !important;
                        }
                        .receptionist-modal-card .close-btn-x svg {
                            color: #dc2626 !important;
                            stroke: #dc2626 !important;
                        }
                        .receptionist-modal-card input,
                        .receptionist-modal-card select,
                        .receptionist-modal-card textarea {
                            color: #1e293b !important;
                        }
                        .dark .receptionist-modal-card h3 {
                            color: #ffffff !important;
                        }
                        .dark .receptionist-modal-card p {
                            color: #2563EB !important;
                        }
                        .dark .receptionist-modal-card label {
                            color: #cbd5e1 !important;
                        }
                        .dark .receptionist-modal-card button[type="button"] {
                            color: #cbd5e1 !important;
                        }
                        .dark .receptionist-modal-card .close-btn-x {
                            background-color: rgba(220, 38, 38, 0.15) !important;
                        }
                        .dark .receptionist-modal-card .close-btn-x:hover {
                            background-color: rgba(220, 38, 38, 0.25) !important;
                        }
                        .dark .receptionist-modal-card .close-btn-x svg {
                            color: #fca5a5 !important;
                            stroke: #fca5a5 !important;
                        }
                        .dark .receptionist-modal-card input,
                        .dark .receptionist-modal-card select,
                        .dark .receptionist-modal-card textarea {
                            color: #ffffff !important;
                        }
                    `}</style>
                    <div className="receptionist-modal-card admin-panel bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-full max-w-md relative animate-in zoom-in-95 duration-200 shadow-2xl rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#DBEAFE] dark:bg-[#2563EB]/20 text-[#2563EB] rounded-xl flex items-center justify-center">
                                    <UserPlus className="w-4 h-4 text-[#2563EB] stroke-[#2563EB]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">New Client</h3>
                                    <p className="text-[9px] text-[#2563EB] font-bold uppercase tracking-widest mt-1">Client registration form</p>
                                </div>
                            </div>
                            <button onClick={() => setIsRegistrationOpen(false)} className="close-btn-x w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all text-slate-600 dark:text-slate-300" title="Close">
                                <X className="w-4 h-4 text-slate-600 dark:text-slate-300 stroke-2" />
                            </button>
                        </div>
                        <form onSubmit={handleRegistrationSubmit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <input
                                        required
                                        type="text"
                                        value={newClient.name}
                                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[13px] font-medium text-slate-900 dark:text-white rounded-xl focus:border-[#B4912B] focus:outline-none transition-all"
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <input
                                        required
                                        type="tel"
                                        value={newClient.phone}
                                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[13px] font-medium text-slate-900 dark:text-white rounded-xl focus:border-[#B4912B] focus:outline-none transition-all"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email (Optional)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="email"
                                        value={newClient.email}
                                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[13px] font-medium text-slate-900 dark:text-white rounded-xl focus:border-[#B4912B] focus:outline-none transition-all"
                                        placeholder="Enter email address"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Gender</label>
                                <div className="flex gap-2">
                                    {['male', 'female', 'other'].map(g => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setNewClient({ ...newClient, gender: g })}
                                            className={`flex-1 py-2 text-[12px] font-bold rounded-xl border transition-all capitalize ${newClient.gender === g
                                                    ? 'bg-[#B4912B]/10 border-[#B4912B]/30 text-[#B4912B]'
                                                    : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-[#B4912B]/20'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setIsRegistrationOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-[#B4912B] hover:bg-[#9f8025] text-white font-bold text-[10px] uppercase tracking-widest shadow-md rounded-xl text-center flex items-center justify-center gap-2 transition-all">
                                    <UserPlus className="w-3.5 h-3.5 text-white" /> Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Walk-in Modal */}
            {isWalkinOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <style>{`
                        .receptionist-modal-card h3 {
                            color: #1e293b !important;
                        }
                        .receptionist-modal-card p {
                            color: #059669 !important;
                        }
                        .receptionist-modal-card label {
                            color: #475569 !important;
                        }
                        .receptionist-modal-card button[type="button"] {
                            color: #475569 !important;
                        }
                        .receptionist-modal-card .close-btn-x {
                            background-color: #fee2e2 !important;
                        }
                        .receptionist-modal-card .close-btn-x:hover {
                            background-color: #fecaca !important;
                        }
                        .receptionist-modal-card .close-btn-x svg {
                            color: #dc2626 !important;
                            stroke: #dc2626 !important;
                        }
                        .receptionist-modal-card input,
                        .receptionist-modal-card select,
                        .receptionist-modal-card textarea {
                            color: #1e293b !important;
                        }
                        .dark .receptionist-modal-card h3 {
                            color: #ffffff !important;
                        }
                        .dark .receptionist-modal-card p {
                            color: #059669 !important;
                        }
                        .dark .receptionist-modal-card label {
                            color: #cbd5e1 !important;
                        }
                        .dark .receptionist-modal-card button[type="button"] {
                            color: #cbd5e1 !important;
                        }
                        .dark .receptionist-modal-card .close-btn-x {
                            background-color: rgba(220, 38, 38, 0.15) !important;
                        }
                        .dark .receptionist-modal-card .close-btn-x:hover {
                            background-color: rgba(220, 38, 38, 0.25) !important;
                        }
                        .dark .receptionist-modal-card .close-btn-x svg {
                            color: #fca5a5 !important;
                            stroke: #fca5a5 !important;
                        }
                        .dark .receptionist-modal-card input,
                        .dark .receptionist-modal-card select,
                        .dark .receptionist-modal-card textarea {
                            color: #ffffff !important;
                        }
                    `}</style>
                    <div className="receptionist-modal-card admin-panel bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-full max-w-md relative animate-in zoom-in-95 duration-200 shadow-2xl rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#D1FAE5] dark:bg-[#059669]/20 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-emerald-600 stroke-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">Quick Walk-in</h3>
                                    <p className="text-[9px] text-[#059669] font-bold uppercase tracking-widest mt-1">Instant check-in</p>
                                </div>
                            </div>
                            <button onClick={() => setIsWalkinOpen(false)} className="close-btn-x w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all text-slate-600 dark:text-slate-300" title="Close">
                                <X className="w-4 h-4 text-slate-600 dark:text-slate-300 stroke-2" />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            // Use the same booking flow for walk-ins
                            if (!newBooking.serviceId || !newBooking.staffId || !newBooking.clientName || !newBooking.phone) {
                                alert('Please complete all fields.');
                                return;
                            }
                            const bookingData = {
                                clientName: newBooking.clientName,
                                phone: newBooking.phone,
                                serviceId: newBooking.serviceId,
                                staffId: newBooking.staffId,
                                outletId: user?.outletId,
                                appointmentDate: new Date().toISOString(),
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                status: 'arrived',
                                source: 'WALK-IN'
                            };
                            mockApi.post('/bookings', bookingData).then(() => {
                                setIsWalkinOpen(false);
                                setNewBooking({ clientName: '', phone: '', serviceId: '', staffId: '', time: '12:00 PM', date: new Date().toISOString().split('T')[0] });
                                alert('Walk-in registered successfully!');
                            }).catch(() => alert('Failed to register walk-in.'));
                        }} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Guest Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <input
                                        required
                                        type="text"
                                        value={newBooking.clientName}
                                        onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[13px] font-medium text-slate-900 dark:text-white rounded-xl focus:border-[#B4912B] focus:outline-none transition-all"
                                        placeholder="Enter guest name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <input
                                        required
                                        type="tel"
                                        value={newBooking.phone}
                                        onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[13px] font-medium text-slate-900 dark:text-white rounded-xl focus:border-[#B4912B] focus:outline-none transition-all"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Service</label>
                                <CustomDropdown
                                    value={newBooking.serviceId}
                                    onChange={(val) => setNewBooking({ ...newBooking, serviceId: val })}
                                    options={services.map(s => ({ label: `${s.name} - ₹${s.price}`, value: s.id || s._id }))}
                                    placeholder="Select service..."
                                    className="w-full"
                                    triggerClassName="!py-2.5"
                                    icon={Scissors}
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Assign Stylist</label>
                                <CustomDropdown
                                    value={newBooking.staffId}
                                    onChange={(val) => setNewBooking({ ...newBooking, staffId: val })}
                                    options={staff.filter(s => s.isAvailable).map(s => ({ label: `${s.name} - ${s.role}`, value: s.id || s._id }))}
                                    placeholder="Select stylist..."
                                    className="w-full"
                                    triggerClassName="!py-2.5"
                                    icon={Users}
                                />
                            </div>
                            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setIsWalkinOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest shadow-md rounded-xl text-center flex items-center justify-center gap-2 transition-all">
                                    <Zap className="w-3.5 h-3.5 text-white" /> Check In
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
