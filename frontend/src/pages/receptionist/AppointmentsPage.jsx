import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    Search,
    Filter,
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    MoreVertical,
    CheckCircle2,
    XCircle,
    MapPin,
    X,
    Phone,
    Scissors,
    Shield,
    Edit3,
    Trash2,
    CreditCard,
    Smartphone,
    UserPlus,
    Loader2,
    Banknote
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { maskPhone } from '../../utils/phoneUtils';
import mockApi from '../../services/mock/mockApi';

export default function AppointmentsPage() {
    const { user } = useAuth();
    const { activeOutletId, outlets = [] } = useBusiness();
    const navigate = useNavigate();

    // Live States
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'calendar'
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'orders'
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');

    // Coupon & Payment States
    const [couponCode, setCouponCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [isPromoApplied, setIsPromoApplied] = useState(false);
    const [advancePayment, setAdvancePayment] = useState(0);
    const [advancePaymentMethod, setAdvancePaymentMethod] = useState('cash');

    // Manual Booking Form State
    const [newBooking, setNewBooking] = useState({
        clientName: '',
        phone: '',
        outletId: user?.outletId || user?.outlet?._id || user?.outlet || activeOutletId || '',
        serviceId: '',
        staffId: '',
        time: '10:00 AM',
        date: (() => {
            const d = new Date();
            return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        })()
    });

    const filteredClients = useMemo(() => {
        if (!newBooking.clientName) return clients;
        return clients.filter(c =>
            (c.name || '').toLowerCase().includes(newBooking.clientName.toLowerCase()) ||
            (c.phone || '').includes(newBooking.clientName)
        );
    }, [clients, newBooking.clientName]);

    const filteredServicesForBooking = useMemo(() => {
        if (!newBooking.outletId) return services;
        return services.filter(s => !s.outletIds || s.outletIds.length === 0 || s.outletIds.includes(newBooking.outletId));
    }, [services, newBooking.outletId]);

    const filteredStaffForBooking = useMemo(() => {
        if (!newBooking.outletId) return staff;
        return staff.filter(s => {
            const staffOutletId = s.outletId?._id || s.outletId;
            return !staffOutletId || staffOutletId === newBooking.outletId;
        });
    }, [staff, newBooking.outletId]);

    const selectedService = useMemo(() => {
        return services.find(s => s._id === newBooking.serviceId || s.id === newBooking.serviceId);
    }, [services, newBooking.serviceId]);

    const priceCalculation = useMemo(() => {
        if (!selectedService) return { original: 0, discount: 0, promoDiscount: 0, subtotal: 0, tax: 0, total: 0, gstRate: 18, isInclusive: false, cgst: 0, sgst: 0 };

        const original = selectedService.price || 0;
        const discount = 0;

        const gstRate = selectedService.gst !== undefined ? selectedService.gst : 18;
        const isInclusive = selectedService.isInclusiveTax === true || String(selectedService.isInclusiveTax) === 'true';

        const netAfterPromo = Math.max(0, original - promoDiscount);

        let subtotal = 0;
        let tax = 0;
        let total = 0;
        let cgst = 0;
        let sgst = 0;

        if (isInclusive) {
            total = Number(netAfterPromo.toFixed(2));
            subtotal = Number((netAfterPromo / (1 + (gstRate / 100))).toFixed(2));
            tax = Number((netAfterPromo - subtotal).toFixed(2));
            cgst = Number((tax / 2).toFixed(2));
            sgst = Number((tax - cgst).toFixed(2));
        } else {
            subtotal = Number(netAfterPromo.toFixed(2));
            tax = Number((subtotal * (gstRate / 100)).toFixed(2));
            cgst = Number((tax / 2).toFixed(2));
            sgst = Number((tax - cgst).toFixed(2));
            total = Number((subtotal + tax).toFixed(2));
        }

        return { original, discount, promoDiscount, subtotal, tax, total, gstRate, isInclusive, cgst, sgst };
    }, [selectedService, promoDiscount]);

    useEffect(() => {
        if (priceCalculation.total) {
            setAdvancePayment(Math.round(priceCalculation.total * 0.4));
        } else {
            setAdvancePayment(0);
        }
    }, [priceCalculation.total]);

    const applyPromo = () => {
        const code = String(couponCode || '').trim().toUpperCase();
        if (!code) return;
        const original = selectedService?.price || 0;
        const discount = Math.round(original * 0.15); // 15% discount
        setPromoDiscount(discount);
        setIsPromoApplied(true);
        alert(`Coupon applied! Discount of ₹${discount} added.`);
    };

    const [busySlots, setBusySlots] = useState([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    useEffect(() => {
        const updateBusySlots = async () => {
            if (!newBooking.date || !newBooking.staffId) {
                setBusySlots([]);
                return;
            }
            setFetchingSlots(true);
            try {
                const res = await mockApi.get(`/bookings?date=${newBooking.date}&outletId=${newBooking.outletId}`);
                const dateBookings = res.data?.results || [];
                const busy = dateBookings
                    .filter(b => {
                        const bStaffId = b.staffId?._id || b.staffId?.id || b.staffId;
                        return bStaffId === newBooking.staffId;
                    })
                    .map(b => b.time);
                setBusySlots(busy);
            } catch (e) {
                console.error(e);
            } finally {
                setFetchingSlots(false);
            }
        };
        updateBusySlots();
    }, [newBooking.date, newBooking.staffId, newBooking.outletId]);

    // Load Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
            const isReceptionistMode = user?.role === 'receptionist';
            const userOutletId = user?.outletId || user?.outlet?._id || user?.outlet;
            const outletToFetch = isReceptionistMode ? userOutletId : (activeOutletId || '');

            const [bookingsRes, servicesRes, staffRes, invoicesRes, clientsRes] = await Promise.all([
                mockApi.get(`/bookings?date=${dateStr}&limit=100&outletId=${outletToFetch}`),
                mockApi.get('/services?limit=100'),
                mockApi.get('/users?role=stylish'),
                mockApi.get('/invoices', { params: { limit: 100, outletId: outletToFetch } }),
                mockApi.get('/client')
            ]);

            if (invoicesRes?.data?.results) {
                setOrders(invoicesRes.data.results);
            }

            if (clientsRes?.data?.results) {
                setClients(clientsRes.data.results);
            }

            if (bookingsRes.data.results) {
                const allBookings = bookingsRes.data.results;
                setAppointments(allBookings.map(b => ({
                    id: b.id || b._id,
                    client: b.clientId?.name || 'Walk-in',
                    service: b.serviceId?.name || 'Unknown',
                    time: b.time || (b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
                    professional: b.staffId?.name || 'Unassigned',
                    staffId: b.staffId?._id || b.staffId?.id || null,
                    status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Upcoming',
                    price: `₹${b.price || 0}`,
                    phone: b.clientId?.phone || b.phone || '',
                    source: b.source || 'APP',
                    paymentStatus: b.paymentStatus || 'unpaid',
                    paymentMethod: b.paymentMethod || 'salon',
                    isRegistry: false
                })));

                // Determine busy staff (arrived or in-progress)
                const busyStaffIds = allBookings
                    .filter(b => ['arrived', 'in-progress'].includes(b.status.toLowerCase()))
                    .map(b => b.staffId?._id || b.staffId?.id)
                    .filter(Boolean);

                if (staffRes?.data?.success) {
                    console.log("hvsvahv", staffRes)
                    const staffList = staffRes.data.data?.results || staffRes.data.results || [];
                    const mappedStaffList = staffList.map(s => {
                        let staffOutletId = s.outletId;
                        if (s.name === 'Alina Khan' || s.name === 'Rahul Sharma') {
                            staffOutletId = outlets[0]?._id || outlets[0]?.id || '1';
                        } else if (s.name === 'Anita Verma') {
                            staffOutletId = outlets[1]?._id || outlets[1]?.id || '2';
                        }
                        return { ...s, outletId: staffOutletId };
                    });
                    setStaff(mappedStaffList.map(s => ({
                        ...s,
                        isAvailable: !busyStaffIds.includes(s._id || s.id)
                    })));
                }
            }

            if (servicesRes?.data?.success) {
                setServices(servicesRes.data.data?.results || servicesRes.data.results || []);
            }

        } catch (err) {
            console.error('Ledger Sync Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentDate, activeOutletId]);

    useEffect(() => {
        if (isBookingOpen || isDetailsOpen) {
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
    }, [isBookingOpen, isDetailsOpen]);

    useEffect(() => {
        if (!isBookingOpen) {
            setSelectedClientId('');
            setNewBooking({
                clientName: '',
                phone: '',
                outletId: user?.outletId || user?.outlet?._id || user?.outlet || activeOutletId || '',
                serviceId: '',
                staffId: '',
                time: '10:00 AM',
                date: (() => {
                    const d = new Date();
                    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
                })()
            });
            setCouponCode('');
            setPromoDiscount(0);
            setIsPromoApplied(false);
            setAdvancePayment(0);
            setAdvancePaymentMethod('cash');
        } else {
            setNewBooking(prev => ({
                ...prev,
                outletId: user?.outletId || user?.outlet?._id || user?.outlet || activeOutletId || ''
            }));
        }
    }, [isBookingOpen, user, activeOutletId]);

    const filteredAppointments = appointments.filter(apt =>
        apt.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.phone?.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, ''))
    );

    const handleBill = (apt) => {
        navigate('/pos', {
            state: {
                preSelectClient: {
                    name: apt.client,
                    phone: apt.phone
                },
                preSelectService: apt.service,
                preSelectStaffId: apt.staffId || null,
                appointmentId: apt.id
            }
        });
    };

    const handleCheckIn = async (id) => {
        try {
            await mockApi.patch(`/bookings/${id}`, { status: 'arrived' });
            // Update local state
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Arrived' } : a));
            alert(`Protocol Clearance: Appointment ${id} marked as ARRIVED.`);
        } catch (err) {
            alert('Status Sync Error: Could not update booking.');
        }
    };

    const handleViewDetails = (id) => {
        const apt = appointments.find(a => a.id === id);
        setSelectedAppointment(apt);
        setIsDetailsOpen(true);
    };

    const handleCancelAppointment = async (id) => {
        if (confirm(`Authorize cancellation of ${id}? This action is permanent.`)) {
            try {
                await mockApi.patch(`/bookings/${id}`, { status: 'cancelled' });
                setAppointments(prev => prev.filter(a => a.id !== id));
                setIsDetailsOpen(false);
                alert('Security Clearance: Appointment protocol terminated.');
            } catch (err) {
                alert('Cancellation Failed: Server rejected the command.');
            }
        }
    };

    const handleManualBookingSubmit = async (e) => {
        e.preventDefault();

        if (!newBooking.serviceId || !newBooking.staffId || !newBooking.clientName || !newBooking.phone || !newBooking.outletId) {
            alert('Missing Required Protocols: Please complete all fields.');
            return;
        }

        try {
            const bookingData = {
                clientName: newBooking.clientName,
                phone: newBooking.phone,
                serviceId: newBooking.serviceId,
                staffId: newBooking.staffId,
                outletId: newBooking.outletId,
                appointmentDate: new Date(`${newBooking.date} ${newBooking.time}`).toISOString(),
                time: newBooking.time,
                status: 'upcoming',
                source: 'RECEPTION',
                advancePaid: Number(advancePayment),
                advancePaymentMethod,
                couponCode: isPromoApplied ? couponCode : undefined,
                totalPrice: priceCalculation.total,
                price: priceCalculation.total
            };

            await mockApi.post('/bookings', bookingData);

            // Refresh
            fetchData();

            setIsBookingOpen(false);
            setNewBooking({
                clientName: '',
                phone: '',
                outletId: user?.outletId || user?.outlet?._id || user?.outlet || activeOutletId || '',
                serviceId: '',
                staffId: '',
                time: '10:00 AM',
                date: new Date().toISOString().split('T')[0]
            });
            setSelectedClientId('');
            setCouponCode('');
            setPromoDiscount(0);
            setIsPromoApplied(false);
            setAdvancePayment(0);
            setAdvancePaymentMethod('cash');
            alert('Internal Protocol: Manual booking successfully registered.');
        } catch (err) {
            alert('Registry Write Error: Failed to save booking.');
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const changeDate = (days) => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + days);
        setCurrentDate(nextDate);
    };

    // --- Calendar Implementation ---
    const timeSlots = [
        '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
        '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
        '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
        '07:00 PM', '07:30 PM', '08:00 PM'
    ];

    const CalendarView = () => {
        return (
            <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col h-[700px]">
                {/* Calendar Header (Staff Names) */}
                <div className="flex border-b border-border bg-surface-alt/50 sticky top-0 z-10">
                    <div className="w-24 border-r border-border shrink-0 p-4 text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center justify-center">
                        TIME
                    </div>
                    <div className="flex flex-1 overflow-x-auto scrollbar-hide">
                        {staff.map(member => (
                            <div key={member._id} className="min-w-[150px] flex-1 border-r border-border last:border-r-0 p-4 text-center">
                                <p className="text-[10px] font-black text-text uppercase tracking-widest">{member.name}</p>
                                <p className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-0.5">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                    {timeSlots.map(time => (
                        <div key={time} className="flex border-b border-border/50 min-h-[80px] group transition-all">
                            {/* Time Label */}
                            <div className="w-24 border-r border-border shrink-0 p-3 bg-surface-alt/20 flex flex-col items-center justify-start">
                                <span className="text-[11px] font-black text-text uppercase tracking-tight">{time}</span>
                            </div>

                            {/* Staff Columns */}
                            <div className="flex flex-1 overflow-x-auto scrollbar-hide">
                                {staff.map(member => {
                                    // Find appointments for this time slot and this professional
                                    const slotApts = appointments.filter(apt =>
                                        apt.time === time &&
                                        (apt.professional === member.name || (apt.professional === 'Unassigned' && member.name === 'Anita Verma'))
                                    );

                                    return (
                                        <div key={member._id} className="min-w-[150px] flex-1 border-r border-border/30 last:border-r-0 p-2 relative group/cell hover:bg-surface-alt/10 transition-colors">
                                            {slotApts.map(apt => (
                                                <div
                                                    key={apt.id}
                                                    onClick={() => handleViewDetails(apt.id)}
                                                    className={`absolute inset-1 p-2 border overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:z-20 shadow-sm ${apt.status === 'Arrived' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                                        apt.status === 'Cancelled' ? 'bg-rose-500/10 border-rose-500/30 opacity-60' :
                                                            'bg-primary/10 border-primary/30'
                                                        }`}
                                                >
                                                    <div className="flex flex-col h-full justify-between">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[9px] font-black text-text uppercase tracking-tight truncate flex-1">{apt.client}</span>
                                                                {apt.source === 'APP' && <Smartphone className="w-2 h-2 text-primary" />}
                                                            </div>
                                                            <p className="text-[7px] font-bold text-text-muted uppercase tracking-widest truncate">{apt.service}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className={`text-[6px] font-black px-1 py-0.5 border ${apt.status === 'Arrived' ? 'border-emerald-500/50 text-emerald-600' : 'border-primary/50 text-primary'
                                                                } uppercase`}>
                                                                {apt.status}
                                                            </span>
                                                            <span className="text-[7px] font-black text-text-muted">{apt.price}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6 animate-reveal">
                {/* Header Area */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-text tracking-tight uppercase">Appointments & Orders</h1>
                        <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">View and manage all salon bookings and orders</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-surface border border-border p-1">
                            <button
                                onClick={() => setView('list')}
                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'text-white' : 'text-text-muted hover:text-text'}`}
                                style={{ backgroundColor: view === 'list' ? '#B4912B' : undefined }}
                            >
                                List
                            </button>
                            <button
                                onClick={() => setView('calendar')}
                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${view === 'calendar' ? 'text-white' : 'text-text-muted hover:text-text'}`}
                                style={{ backgroundColor: view === 'calendar' ? '#B4912B' : undefined }}
                            >
                                Calendar
                            </button>
                        </div>
                        <button
                            onClick={() => setIsBookingOpen(true)}
                            className="px-5 py-2.5 text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                            style={{ backgroundColor: '#B4912B' }}
                        >
                            <Plus className="w-4 h-4 text-white-force" /> Book Appointment
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-2`}
                        style={{
                            color: activeTab === 'bookings' ? '#B4912B' : '#6b7280',
                            borderBottomColor: activeTab === 'bookings' ? '#B4912B' : 'transparent'
                        }}
                    >
                        Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-2`}
                        style={{
                            color: activeTab === 'orders' ? '#B4912B' : '#6b7280',
                            borderBottomColor: activeTab === 'orders' ? '#B4912B' : 'transparent'
                        }}
                    >
                        Orders
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-surface border border-border p-3 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="FIND APPOINTMENT..."
                                className="pl-10 pr-4 py-2 bg-surface-alt border border-border text-[10px] font-extrabold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30 w-full md:w-64"
                            />
                        </div>
                        <button className="p-2 bg-surface-alt border border-border hover:border-primary/30 transition-all">
                            <Filter className="w-4 h-4 text-text-muted" />
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border border-border bg-surface-alt px-3 py-1.5">
                            <button onClick={() => changeDate(-1)} className="p-1 hover:text-primary"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="text-[10px] font-black uppercase tracking-widest min-w-[120px] text-center">{formatDate(currentDate)}</span>
                            <button onClick={() => changeDate(1)} className="p-1 hover:text-primary"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                {activeTab === 'bookings' ? (
                    <>
                        {/* Views */}
                        {view === 'list' ? (
                            <div className="bg-surface border border-border shadow-sm overflow-hidden">
                                <div className="overflow-x-auto min-h-[400px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-alt/50 border-b border-border">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Booking ID</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Client</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Service</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Time</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Stylist</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Payment</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {filteredAppointments.length > 0 ? filteredAppointments.map((apt) => (
                                                <tr key={apt.id} className="hover:bg-surface-alt/30 transition-all group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-black text-text uppercase tracking-tight">{apt.id}</p>
                                                            {apt.source === 'APP' ? (
                                                                <Smartphone className="w-3 h-3 text-primary animate-pulse" title="Mobile App Booking" />
                                                            ) : (
                                                                <User className="w-3 h-3 text-text-muted opacity-50" title="Manual Entry" />
                                                            )}
                                                        </div>
                                                        <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{apt.source || 'INTERNAL'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-surface-alt border border-border flex items-center justify-center font-black text-[10px] text-text-muted">
                                                                {apt.client[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-text uppercase tracking-tight">{apt.client}</p>
                                                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em]">{maskPhone(apt.phone)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <p className="text-[11px] font-bold text-text uppercase tracking-widest">{apt.service}</p>
                                                        <p className="text-[9px] font-black text-primary/70 uppercase mt-0.5">{apt.price}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <div className="flex items-center gap-1.5 text-sm font-black text-text uppercase tracking-tight">
                                                                <Clock className="w-3 h-3 text-primary" />
                                                                {apt.time}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">{apt.professional}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase border ${apt.status === 'Arrived' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                                                                apt.status === 'Completed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                                                                    apt.status === 'Upcoming' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                                                                        'bg-rose-500/10 border-rose-500/20 text-rose-600'
                                                                }`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${apt.status === 'Arrived' ? 'bg-emerald-500' :
                                                                    apt.status === 'Completed' ? 'bg-blue-500' :
                                                                        apt.status === 'Upcoming' ? 'bg-amber-500' : 'bg-rose-500'
                                                                    }`} />
                                                                {apt.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase border ${apt.paymentStatus === 'paid'
                                                                ? 'bg-emerald-500/10 border-emerald-500/20 !text-emerald-600'
                                                                : 'bg-primary/5 border-primary/20 !text-[#B4912B]'
                                                                }`}
                                                                style={{ color: apt.paymentStatus === 'paid' ? '#059669' : '#B4912B' }}
                                                            >
                                                                {apt.paymentStatus === 'paid' ? (
                                                                    <>
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        PAID
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Banknote className="w-3 h-3" />
                                                                        PAY AT SALON
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {apt.status === 'Arrived' && (
                                                                <button
                                                                    onClick={() => handleBill(apt)}
                                                                    className="px-3 py-1.5 text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:opacity-90 transition-all shadow-sm"
                                                                    style={{ backgroundColor: '#B4912B', borderColor: '#B4912B' }}
                                                                >
                                                                    <CreditCard className="w-3 h-3 text-white-force" /> Bill
                                                                </button>
                                                            )}
                                                            {apt.status === 'Upcoming' && (
                                                                <button
                                                                    onClick={() => handleCheckIn(apt.id)}
                                                                    className="p-2 border border-border hover:bg-emerald-500/5 hover:border-emerald-500/20 group transition-all"
                                                                    title="Mark Arrived"
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4 text-text-muted group-hover:text-emerald-500" />
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleViewDetails(apt.id)} className="p-2 border border-border hover:bg-surface-alt transition-all group" title="View Protocol">
                                                                <MoreVertical className="w-4 h-4 text-text-muted group-hover:text-text" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-20 text-center">
                                                        <div className="opacity-20 flex flex-col items-center">
                                                            <CalendarIcon className="w-12 h-12 mb-2" />
                                                            <p className="text-[10px] font-black uppercase tracking-widest">No active protocols in ledger</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <CalendarView />
                        )}
                    </>
                ) : (
                    <div className="bg-surface border border-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-alt/50 border-b border-border">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Order ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Client</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {orders.length > 0 ? orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-surface-alt/30 transition-all group">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-black text-text uppercase tracking-tight">{order.invoiceNumber || order._id}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-surface-alt border border-border flex items-center justify-center font-black text-[10px] text-text-muted">
                                                        {(order.clientId?.name || 'W')[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-text uppercase tracking-tight">{order.clientId?.name || 'Walk-in'}</p>
                                                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em]">{maskPhone(order.clientId?.phone || '')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <p className="text-[11px] font-bold text-text uppercase tracking-widest text-center">₹{order.total}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase border ${order.paymentStatus === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20 !text-emerald-600' : 'bg-amber-500/10 border-amber-500/20 !text-amber-700'}`}
                                                        style={{ color: order.paymentStatus === 'paid' ? '#059669' : '#b45309' }}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                        {order.paymentStatus}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] text-center">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="opacity-20 flex flex-col items-center">
                                                    <Banknote className="w-12 h-12 mb-2" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No active orders in ledger</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {typeof document !== 'undefined' && document.body && createPortal(
                <AnimatePresence>
                    {isBookingOpen && (
                        <div key="booking-modal" className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                            <div className="bg-surface border border-border w-full max-w-lg max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden rounded-2xl">
                                <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between shrink-0">
                                    <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-primary" /> NEW APPOINTMENT
                                    </h3>
                                    <button onClick={() => setIsBookingOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                        <X className="w-5 h-5 text-text-muted" />
                                    </button>
                                </div>
                                <form onSubmit={handleManualBookingSubmit} className="p-8 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Client</label>
                                        <select
                                            required
                                            value={selectedClientId}
                                            onChange={(e) => {
                                                const cid = e.target.value;
                                                setSelectedClientId(cid);
                                                const client = clients.find(c => (c._id || c.id) === cid);
                                                if (client) {
                                                    setNewBooking(prev => ({
                                                        ...prev,
                                                        clientName: client.name,
                                                        phone: client.phone
                                                    }));
                                                } else {
                                                    setNewBooking(prev => ({
                                                        ...prev,
                                                        clientName: '',
                                                        phone: ''
                                                    }));
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                                        >
                                            <option value="">-- SELECT CLIENT --</option>
                                            {clients.map(c => (
                                                <option key={c._id || c.id} value={c._id || c.id}>
                                                    {c.name} - {c.phone}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedClientId && (
                                        <div className="grid grid-cols-2 gap-4 animate-reveal">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Client Name</label>
                                                <input
                                                    disabled
                                                    type="text"
                                                    value={newBooking.clientName}
                                                    className="w-full px-4 py-3 bg-surface-alt border border-border text-sm font-black uppercase tracking-tight outline-none opacity-60 cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Contact Number</label>
                                                <input
                                                    disabled
                                                    type="tel"
                                                    value={newBooking.phone}
                                                    className="w-full px-4 py-3 bg-surface-alt border border-border text-sm font-black uppercase tracking-tight outline-none opacity-60 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Outlet</label>
                                        <select
                                            required
                                            disabled={user?.role === 'receptionist'}
                                            value={newBooking.outletId}
                                            onChange={(e) => setNewBooking({ ...newBooking, outletId: e.target.value, serviceId: '', staffId: '' })}
                                            className={`w-full px-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 ${user?.role === 'receptionist' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <option value="">-- SELECT OUTLET --</option>
                                            {outlets.map(o => (
                                                <option key={o._id || o.id} value={o._id || o.id}>{o.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Service</label>
                                        <select
                                            required
                                            value={newBooking.serviceId}
                                            onChange={(e) => setNewBooking({ ...newBooking, serviceId: e.target.value })}
                                            className="w-full px-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                                        >
                                            <option value="">-- SELECT SERVICE --</option>
                                            {filteredServicesForBooking.map(s => (
                                                <option key={s._id || s.id} value={s._id || s.id}>{s.name} - ₹{s.price}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Stylist</label>
                                        <select
                                            required
                                            value={newBooking.staffId}
                                            onChange={(e) => setNewBooking({ ...newBooking, staffId: e.target.value })}
                                            className="w-full px-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                                        >
                                            <option value="">-- SELECT STYLIST --</option>
                                            {filteredStaffForBooking.map(s => (
                                                <option key={s._id || s.id} value={s._id || s.id}>{s.name} - {s.specialist || s.role}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Date</label>
                                            <input
                                                type="date"
                                                value={newBooking.date}
                                                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                                                className="w-full px-4 py-3 bg-surface-alt border border-border text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Time Slot</label>
                                            <select
                                                value={newBooking.time}
                                                onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                                                className="w-full px-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                                            >
                                                {timeSlots.map(t => {
                                                    const isBusy = busySlots.includes(t);
                                                    return (
                                                        <option key={t} value={t} disabled={isBusy}>
                                                            {t} {isBusy ? '(Booked)' : ''}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Coupon Code</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="ENTER COUPON CODE"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                disabled={isPromoApplied}
                                                className="flex-1 px-4 py-3 bg-surface-alt border border-border text-sm font-black uppercase outline-none focus:ring-1 focus:ring-primary/20"
                                            />
                                            {isPromoApplied ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPromoDiscount(0);
                                                        setIsPromoApplied(false);
                                                        setCouponCode('');
                                                    }}
                                                    className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest transition-all"
                                                >
                                                    Remove
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={applyPromo}
                                                    className="px-6 py-3 bg-[#B4912B] hover:bg-[#9f8025] text-white text-xs font-black uppercase tracking-widest transition-all"
                                                >
                                                    Apply
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Advance Pay</label>
                                            <input
                                                type="number"
                                                value={advancePayment}
                                                onChange={(e) => setAdvancePayment(Number(e.target.value))}
                                                className="w-full px-4 py-3 bg-surface-alt border border-border text-sm font-black uppercase outline-none focus:ring-1 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Advance Payment Method</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setAdvancePaymentMethod('cash')}
                                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${advancePaymentMethod === 'cash'
                                                            ? 'bg-[#B4912B] text-white border-[#B4912B]'
                                                            : 'bg-surface-alt text-text-muted border-border hover:border-text'
                                                        }`}
                                                >
                                                    Cash
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAdvancePaymentMethod('online')}
                                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${advancePaymentMethod === 'online'
                                                            ? 'bg-[#B4912B] text-white border-[#B4912B]'
                                                            : 'bg-surface-alt text-text-muted border-border hover:border-text'
                                                        }`}
                                                >
                                                    Online
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedService && (
                                        <div className="bg-surface-alt/50 p-4 border border-border space-y-2 rounded-xl text-left">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-muted">
                                                <span>Service Price</span>
                                                <span>₹{priceCalculation.original}</span>
                                            </div>
                                            {priceCalculation.promoDiscount > 0 && (
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-600 font-bold">
                                                    <span>Coupon Discount</span>
                                                    <span>- ₹{priceCalculation.promoDiscount}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-muted">
                                                <span>GST ({priceCalculation.gstRate}%)</span>
                                                <span>₹{priceCalculation.tax}</span>
                                            </div>
                                            <div className="h-[1px] bg-border/40 my-1" />
                                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-text">
                                                <span>Final Total</span>
                                                <span>₹{priceCalculation.total}</span>
                                            </div>
                                            {advancePayment > 0 && (
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#B4912B] font-bold">
                                                    <span>Advance Paid ({advancePaymentMethod})</span>
                                                    <span>₹{advancePayment}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-emerald-600">
                                                <span>Remaining Payment</span>
                                                <span>₹{Math.max(0, priceCalculation.total - advancePayment)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" className="w-full py-4 text-white text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg" style={{ backgroundColor: '#B4912B' }}>
                                        Submit Appointment Protocol
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {typeof document !== 'undefined' && document.body && createPortal(
                <AnimatePresence>
                    {isDetailsOpen && selectedAppointment && (
                        <div key="details-modal" className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                            <div className="bg-surface border border-border w-full max-w-lg relative animate-in zoom-in-95 duration-300 shadow-2xl rounded-2xl overflow-hidden">
                                <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                                    <h3 className="text-[12px] font-black text-text uppercase tracking-widest">APPOINTMENT DETAIL: {selectedAppointment.id}</h3>
                                    <button onClick={() => setIsDetailsOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                        <X className="w-5 h-5 text-text-muted" />
                                    </button>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center gap-6 pb-6 border-b border-border">
                                        <div className="w-16 h-16 bg-surface-alt border border-border flex items-center justify-center font-black text-xl text-text-muted">
                                            {selectedAppointment.client[0]}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-text uppercase tracking-tight">{selectedAppointment.client}</h2>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{selectedAppointment.id} · {selectedAppointment.source || 'MANUAL'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2"><Clock className="w-3 h-3" /> Schedule</p>
                                            <p className="text-sm font-black text-text uppercase">{selectedAppointment.time}</p>
                                            <p className="text-[10px] font-bold text-text-secondary uppercase">Today</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2"><Scissors className="w-3 h-3" /> Service</p>
                                            <p className="text-sm font-black text-text uppercase">{selectedAppointment.service}</p>
                                            <p className="text-[10px] font-black text-primary uppercase">{selectedAppointment.price}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2"><User className="w-3 h-3" /> Professional</p>
                                            <p className="text-sm font-black text-text uppercase">{selectedAppointment.professional}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2"><Phone className="w-3 h-3" /> Contact</p>
                                            <p className="text-sm font-black text-text uppercase">{maskPhone(selectedAppointment.phone)}</p>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-border flex gap-3">
                                        {selectedAppointment.status === 'Upcoming' && (
                                            <button
                                                onClick={() => handleCheckIn(selectedAppointment.id)}
                                                className="flex-1 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                                            >
                                                MARK ARRIVED
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleCancelAppointment(selectedAppointment.id)}
                                            className="flex-1 py-3 border border-border text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                        >
                                            CANCEL APPOINTMENT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
