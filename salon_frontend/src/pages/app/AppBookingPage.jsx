import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles, Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, MapPin, Crown, Star } from 'lucide-react';
import StepIndicator from '../../components/app/StepIndicator';
import { MOCK_SERVICES, MOCK_STAFF, MOCK_OUTLET, MOCK_OUTLETS, generateTimeSlots } from '../../data/appMockData';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useBusiness } from '../../contexts/BusinessContext';

const STEPS = ['Service', 'Date & Time', 'Stylist', 'Confirm'];

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function AppBookingPage() {
    const { addBooking } = useBookingRegistry();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const preSelectedServiceId = searchParams.get('serviceId');
    const outletId = searchParams.get('outletId');
    const { 
        activeOutlet, 
        outlets, 
        services: businessServices, 
        staff: businessStaff 
    } = useBusiness();

    const [selectedOutlet, setSelectedOutlet] = useState(() => {
        return outlets.find(o => o.id === outletId || o._id === outletId) || activeOutlet || null;
    });

    const currentOutlet = selectedOutlet;

    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [serviceSearch, setServiceSearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [viewMonth, setViewMonth] = useState(new Date());
    const [activeMembership, setActiveMembership] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [isPromoApplied, setIsPromoApplied] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState(0);

    // Initial load for membership
    useEffect(() => {
        const mem = localStorage.getItem('salon_active_membership');
        if (mem) {
            try {
                setActiveMembership(JSON.parse(mem));
            } catch (e) {
                console.error("Failed to parse membership", e);
            }
        }
    }, []);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        toggle: isLight ? '#EDF0F2' : '#1A1A1A',
        input: isLight ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
    };

    // Pre-select service from query
    useEffect(() => {
        if (preSelectedServiceId) {
            const svc = businessServices.find(s => String(s.id) === String(preSelectedServiceId));
            if (svc && !selectedServices.find(s => String(s.id) === String(preSelectedServiceId))) {
                setSelectedServices([svc]);
                // If we also have an outlet selected, move to date/time
                if (outletId) {
                    const out = outlets.find(o => o.id === outletId || o._id === outletId);
                    if (out) setSelectedOutlet(out);
                    setStep(1); // Jump to Date & Time skip Location selection
                }
            }
        }
    }, [preSelectedServiceId, outletId, outlets, businessServices]);

    const toggleService = (svc) => {
        setSelectedServices(prev => {
            const exists = prev.find(s => s.id === svc.id);
            if (exists) return prev.filter(s => s.id !== svc.id);
            return [...prev, svc];
        });
    };

    const totalDuration = useMemo(() => {
        return selectedServices.reduce((sum, s) => sum + s.duration, 0);
    }, [selectedServices]);

    const totalPrice = useMemo(() => {
        return selectedServices.reduce((sum, s) => sum + s.price, 0);
    }, [selectedServices]);

    const membershipDiscount = useMemo(() => {
        if (!activeMembership || !totalPrice) return 0;
        // Search for a percentage benefit like "15% Off on all services"
        const benefit = activeMembership.benefits?.find(b => b.toLowerCase().includes('off'));
        if (benefit) {
            const match = benefit.match(/\d+/);
            if (match) {
                const percent = parseInt(match[0]);
                return Math.floor((totalPrice * percent) / 100);
            }
        }
        return 0;
    }, [activeMembership, totalPrice]);

    const finalPrice = Math.max(0, totalPrice - membershipDiscount - promoDiscount);

    const applyPromo = () => {
        if (!couponCode.trim()) return;
        // Mock promo logic
        const code = couponCode.toUpperCase();
        if (code === 'SAVE20') {
            setPromoDiscount(Math.floor(totalPrice * 0.2));
            setIsPromoApplied(true);
        } else if (code === 'WELCOMESALON') {
            setPromoDiscount(200);
            setIsPromoApplied(true);
        } else if (code === 'REFER500') {
            setPromoDiscount(500);
            setIsPromoApplied(true);
        } else {
            alert("Invalid or expired promo code");
            setPromoDiscount(0);
            setIsPromoApplied(false);
        }
    };

    const availableSalons = useMemo(() => {
        if (!selectedServices.length) return outlets;
        const selectedCategories = [...new Set(selectedServices.map(s => s.category))];
        return outlets.filter(salon => {
            if (!salon.categories || salon.categories.length === 0) return true;
            return selectedCategories.every(cat => salon.categories.includes(cat));
        });
    }, [selectedServices, outlets]);

    // Use dynamic data from BusinessContext
    const services = businessServices.filter(s => s.status === 'active');
    const staff = businessStaff.filter(s => {
        if (!currentOutlet) return true;
        return s.outletId === currentOutlet.id || s.outletId === currentOutlet._id;
    });

    const goTo = (newStep) => {
        setDirection(newStep > step ? 1 : -1);
        setStep(newStep);
    };

    // Generate days for monthly view
    const calendarDays = useMemo(() => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();

        // First day of visibility (start from the Sunday before the 1st of the month)
        const firstDayOfMonth = new Date(year, month, 1);
        const startDay = new Date(firstDayOfMonth);
        startDay.setDate(1 - firstDayOfMonth.getDay());

        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Generate 42 days (6 full weeks) to cover any month
        for (let i = 0; i < 42; i++) {
            const d = new Date(startDay);
            d.setDate(startDay.getDate() + i);

            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            // Fallback: If no working hours defined, assume open Mon-Sat 10:00-20:00
            const dayHours = currentOutlet.workingHours?.find(wh => wh.day === dayName);
            const defaultOpen = dayName !== 'Sunday';

            const isCurrentMonth = d.getMonth() === month;
            const isPast = d < today;

            days.push({
                date: new Date(d),
                dayNum: d.getDate(),
                month: d.toLocaleDateString('en-IN', { month: 'short' }),
                fullMonth: d.toLocaleDateString('en-IN', { month: 'long' }),
                year: d.getFullYear(),
                isOpen: (dayHours ? dayHours.isOpen : defaultOpen) && !isPast && isCurrentMonth,
                isToday: d.getTime() === today.getTime(),
                isCurrentMonth,
            });
        }
        return days;
    }, [viewMonth, currentOutlet]);

    const currentMonthLabel = viewMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const handlePrevMonth = () => {
        const d = new Date(viewMonth);
        d.setMonth(d.getMonth() - 1);
        // Don't go to past months before current month
        if (d >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)) {
            setViewMonth(d);
        }
    };

    const handleNextMonth = () => {
        const d = new Date(viewMonth);
        d.setMonth(d.getMonth() + 1);
        setViewMonth(d);
    };

    // Generate time slots for selected date
    const timeSlots = useMemo(() => {
        if (!selectedDate) return [];
        const dayName = selectedDate.date.toLocaleDateString('en-US', { weekday: 'long' });
        return generateTimeSlots(dayName, totalDuration || 30, currentOutlet);
    }, [selectedDate, totalDuration, currentOutlet]);

    // Filter services by search
    const filteredServices = useMemo(() => {
        if (!serviceSearch.trim()) return services;
        const q = serviceSearch.toLowerCase();
        return services.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }, [services, serviceSearch]);

    // Submit booking
    const { customer } = useCustomerAuth();

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await new Promise(r => setTimeout(r, 1500)); // Simulate API

            // --- Persist Booking to Global Registry ---
            const newBooking = {
                id: `BOK-${Date.now()}`,
                clientId: customer?._id || 'cust-001',
                clientName: customer?.name || 'Priya Sharma',
                phone: customer?.phone || '',
                services: selectedServices.map(s => ({ name: s.name, price: s.price, duration: s.duration })),
                totalPrice,
                totalDuration,
                date: selectedDate.date.toISOString(),
                appointmentDate: selectedDate.date.toISOString(), // For admin compatibility
                time: selectedTime,
                staffId: selectedStaff.id || selectedStaff._id,
                staffName: selectedStaff.name,
                status: 'upcoming',
                timestamp: new Date().toISOString(),
                source: 'APP'
            };

            addBooking(newBooking);

            setBookingComplete(true);
        } catch {
            console.error('Booking failed');
        } finally {
            setSubmitting(false);
        }
    };

    // Success screen
    if (bookingComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6"
                style={{ background: colors.bg, minHeight: '100svh' }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-24 h-24 rounded-full bg-[#C8956C]/10 flex items-center justify-center border border-[#C8956C]/20"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
                    >
                        <Check className="w-12 h-12 text-[#C8956C]" strokeWidth={3} />
                    </motion.div>
                </motion.div>
                <div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ fontFamily: "'Libre Baskerville', serif" }}
                        className="text-2xl font-bold tracking-tight"
                    >
                        Booking Confirmed! 🎉
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-[10px] uppercase tracking-[0.2em] mt-2 opacity-60"
                        style={{ color: colors.textMuted, fontFamily: "'Poppins', sans-serif" }}
                    >
                        {selectedServices.map(s => s.name).join(' + ')} with {selectedStaff?.name}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{ background: colors.card, border: `1px solid ${colors.border}`, fontFamily: "'Poppins', sans-serif" }}
                    className="rounded-3xl p-6 w-full max-w-xs space-y-4 shadow-sm"
                >
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span style={{ color: colors.textMuted }}>Date</span>
                        <span style={{ color: colors.text }}>
                            {selectedDate?.date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span style={{ color: colors.textMuted }}>Time</span>
                        <span style={{ color: colors.text }}>{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span style={{ color: colors.textMuted }}>Duration</span>
                        <span style={{ color: colors.text }}>{totalDuration} min</span>
                    </div>
                    <div className="flex justify-between text-base pt-4 border-t border-dashed border-black/10 dark:border-white/10 uppercase font-black tracking-tighter">
                        <span style={{ color: colors.textMuted }}>Total</span>
                        <span className="text-[#C8956C]">₹{totalPrice.toLocaleString()}</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col gap-3 w-full max-w-xs pt-4"
                >
                    <button
                        onClick={() => navigate('/app/bookings')}
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                        className="w-full py-4 rounded-xl bg-[#C8956C] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#C8956C]/20 active:scale-95 transition-all"
                    >
                        My Bookings
                    </button>
                    <button
                        onClick={() => navigate('/app')}
                        style={{ background: colors.toggle, border: `1px solid ${colors.border}`, color: colors.textMuted, fontFamily: "'Poppins', sans-serif" }}
                        className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#C8956C] transition-colors"
                    >
                        Go Home
                    </button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 px-4 pb-12" style={{ background: colors.bg, minHeight: '100svh' }}>
            {/* Back Button */}
            <div className="pt-4 flex items-center justify-between">
                <button onClick={() => step > 0 ? goTo(step - 1) : navigate(-1)} style={{ color: colors.textMuted, fontFamily: "'Poppins', sans-serif" }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#C8956C] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {step > 0 ? 'Back' : 'Cancel'}
                </button>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8956C] font-mono" style={{ fontFamily: "'Poppins', sans-serif" }}>Step {step + 1}/{STEPS.length}</div>
            </div>

            {/* Step Indicator */}
            <div className="py-2">
                <StepIndicator currentStep={step} steps={STEPS} />
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait" custom={direction}>
                {/* STEP 0: Select Service */}
                {step === 0 && (
                    <motion.div
                        key="step-0"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col gap-0">
                            <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                                Book <span className="text-[#C8956C]">Services</span>
                            </h2>
                            {currentOutlet && (
                                <div className="flex items-center gap-1.5 opacity-60 mb-2">
                                    <MapPin size={10} className="text-[#C8956C]" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{currentOutlet.name}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-4">
                            <div
                                style={{
                                    background: isLight
                                        ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                                        : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                                    boxShadow: isLight ? 'inset 0 1px 3px rgba(0,0,0,0.03)' : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                                    borderRadius: '20px 6px 20px 6px',
                                    border: isSearchFocused ? `1.5px solid #C8956C` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                                    padding: '0 16px',
                                    height: '52px',
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <Search size={18} style={{ color: isSearchFocused ? '#C8956C' : colors.textMuted }} />
                                <input
                                    type="text"
                                    value={serviceSearch}
                                    onChange={(e) => setServiceSearch(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    placeholder="Search services..."
                                    style={{ background: 'transparent', border: 'none', outline: 'none', color: colors.text, width: '100%', fontSize: '14px', fontWeight: 600 }}
                                />
                                <SlidersHorizontal size={18} style={{ color: colors.textMuted }} />
                            </div>

                            <div className="transition-all duration-300">
                                <button
                                    onClick={() => goTo(1)}
                                    disabled={selectedServices.length === 0}
                                    style={{ fontFamily: "'Poppins', sans-serif" }}
                                    className="w-full py-4 rounded-xl bg-[#C8956C] text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-[#C8956C]/10 active:scale-95 transition-all"
                                >
                                    Continue ({selectedServices.length}) <ArrowRight className="w-4 h-4" />
                                </button>
                                {selectedServices.length > 0 && (
                                    <p className="text-center text-[9px] font-bold uppercase tracking-widest mt-3 opacity-40" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                        Total: ₹{totalPrice.toLocaleString()} · {totalDuration} min
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1">
                            {filteredServices.map((svc) => {
                                const isSelected = selectedServices.some(s => s.id === svc.id);
                                return (
                                    <motion.button
                                        key={svc.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => toggleService(svc)}
                                        style={{
                                            background: isSelected ? 'rgba(200,149,108,0.1)' : colors.card,
                                            borderColor: isSelected ? '#C8956C' : colors.border,
                                            fontFamily: "'Poppins', sans-serif"
                                        }}
                                        className="w-full text-left p-5 rounded-2xl border transition-all duration-300 shadow-sm relative overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold tracking-tight uppercase" style={{ color: colors.text, fontFamily: "'Poppins', sans-serif" }}>{svc.name}</p>
                                                <p className="text-[9px] mt-1.5 flex items-center gap-2 font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                                                    <span>{svc.category}</span>
                                                    <span className="w-1 h-1 rounded-full bg-black/10 dark:bg-white/10" />
                                                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#C8956C]" /> {svc.duration} MIN</span>
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-sm font-black text-[#C8956C] tracking-tighter">₹{svc.price.toLocaleString()}</span>
                                                {isSelected && (
                                                    <div className="bg-[#C8956C] rounded-full p-1">
                                                        <Check size={12} color="white" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}




                {/* STEP 1: Date & Time */}
                {step === 1 && (
                    <motion.div
                        key="step-1"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-8"
                    >
                        <button
                            onClick={() => goTo(2)}
                            disabled={!selectedDate || !selectedTime}
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                            className="w-full py-4 rounded-xl bg-[#C8956C] text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-[#C8956C]/10 active:scale-95 transition-all"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-0">
                                    <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                                        Select <span className="text-[#C8956C]">Timeline</span>
                                    </h2>
                                    <div className="flex items-center gap-1.5 opacity-60 mb-2">
                                        <MapPin size={10} className="text-[#C8956C]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{currentOutlet?.name || 'Select Location'}</span>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                    {selectedDate ? `${selectedDate.fullMonth} ${selectedDate.year}` : currentMonthLabel}
                                </div>
                            </div>

                            {/* Calendar Grid View */}
                            <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-3xl p-4 shadow-sm">
                                {/* Week Days Header */}
                                <div className="grid grid-cols-7 mb-4">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                        <div key={idx} className="text-center text-[10px] font-bold opacity-30 uppercase tracking-widest py-1">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Month Navigation */}
                                <div className="flex items-center justify-between mb-6 px-1">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-80" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                        {currentMonthLabel}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={handlePrevMonth}
                                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors opacity-60 hover:opacity-100"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={handleNextMonth}
                                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors opacity-60 hover:opacity-100"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((d, i) => {
                                        const isSelected = selectedDate?.date.toDateString() === d.date.toDateString();
                                        const canSelect = d.isOpen && d.isCurrentMonth;

                                        return (
                                            <motion.button
                                                key={i}
                                                whileHover={canSelect ? { scale: 1.1 } : {}}
                                                whileTap={canSelect ? { scale: 0.95 } : {}}
                                                disabled={!canSelect}
                                                onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                                                style={{
                                                    background: isSelected ? '#C8956C' : 'transparent',
                                                    borderColor: isSelected ? '#C8956C' : 'transparent',
                                                    fontFamily: "'Poppins', sans-serif",
                                                    color: isSelected ? '#fff' : (canSelect ? colors.text : colors.textMuted)
                                                }}
                                                className={`relative h-10 w-full flex flex-col items-center justify-center rounded-xl transition-all ${!canSelect ? 'opacity-10 cursor-not-allowed' : 'cursor-pointer'} ${!d.isCurrentMonth ? 'invisible' : ''}`}
                                            >
                                                <span className={`text-xs ${isSelected ? 'font-bold' : 'font-medium'}`}>
                                                    {d.dayNum}
                                                </span>
                                                {d.isToday && !isSelected && (
                                                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#C8956C]" />
                                                )}
                                                {isSelected && (
                                                    <motion.div
                                                        layoutId="activeDay"
                                                        className="absolute inset-0 bg-[#C8956C] rounded-xl -z-10 shadow-lg shadow-[#C8956C]/20"
                                                    />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Available Slots</p>
                                <div className="grid grid-cols-4 gap-2.5 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                                    {timeSlots.map((slot, i) => (
                                        <motion.button
                                            key={slot.time}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                            whileTap={{ scale: 0.93 }}
                                            disabled={!slot.available}
                                            onClick={() => setSelectedTime(slot.time)}
                                            style={{
                                                background: selectedTime === slot.time ? '#C8956C' : colors.card,
                                                borderColor: selectedTime === slot.time ? '#C8956C' : colors.border,
                                                color: selectedTime === slot.time ? '#fff' : (slot.available ? colors.text : colors.textMuted),
                                                fontFamily: "'Poppins', sans-serif"
                                            }}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${!slot.available ? 'opacity-10' : ''}`}
                                        >
                                            {slot.time}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}


                    </motion.div>
                )}

                {/* STEP 2: Stylist */}
                {step === 2 && (
                    <motion.div
                        key="step-2"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col gap-0">
                            <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                                Choose <span className="text-[#C8956C]">Expert</span>
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => goTo(3)}
                                disabled={!selectedStaff}
                                className={`w-full py-5 rounded-[20px] text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all duration-300 shadow-xl ${
                                    selectedStaff 
                                        ? 'bg-[#C8956C] text-white shadow-[#C8956C]/30 active:scale-95' 
                                        : 'bg-black/5 dark:bg-white/5 text-black/30 dark:text-white/30 cursor-not-allowed border border-dashed border-black/10'
                                }`}
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-1 pb-4">
                            {staff.map((s, i) => {
                                const sid = s.id || s._id;
                                const isSelected = !!selectedStaff && (String(selectedStaff.id || selectedStaff._id) === String(sid));
                                
                                return (
                                    <motion.button
                                        key={sid || i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedStaff(s)}
                                        style={{
                                            background: isSelected ? (isLight ? '#FFF9F5' : 'rgba(200,149,108,0.15)') : colors.card,
                                            borderColor: isSelected ? '#C8956C' : colors.border,
                                            fontFamily: "'Poppins', sans-serif"
                                        }}
                                        className={`w-full flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all duration-300 relative overflow-hidden ${isSelected ? 'shadow-md border-[#C8956C]' : 'border-transparent shadow-sm'}`}
                                    >
                                        {/* Avatar Section */}
                                        <div className="relative shrink-0">
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-white dark:bg-[#1A1A1A] border-2 flex items-center justify-center p-0.5 transition-all duration-300"
                                                 style={{ borderColor: isSelected ? '#C8956C' : 'rgba(0,0,0,0.05)' }}>
                                                {s.image ? (
                                                    <img src={s.image} alt={s.name} className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <div className="w-full h-full rounded-full flex items-center justify-center font-black text-[#C8956C] bg-white dark:bg-[#2A211B] text-xl">
                                                        {s.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Online Indicator */}
                                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00D084] rounded-full border-2 border-white dark:border-[#1A1A1A] z-10 shadow-sm" />
                                        </div>
    
                                        {/* Info Section */}
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="text-[17px] font-bold tracking-tight mb-1" style={{ color: colors.text }}>
                                                {s.name}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <Sparkles size={10} className="text-[#C8956C]" />
                                                <p className="text-[9px] uppercase font-black tracking-[0.15em] text-[#C8956C]">
                                                    {s.specialization}
                                                </p>
                                            </div>
                                        </div>
    
                                        {/* Selection Checkmark Button Style */}
                                        {isSelected && (
                                            <motion.div 
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="w-10 h-10 rounded-full bg-[#C8956C] flex items-center justify-center shadow-lg shadow-[#C8956C]/30"
                                            >
                                                <Check size={20} color="white" strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>


                    </motion.div>
                )}

                {/* STEP 3: Confirm */}
                {step === 3 && (
                    <motion.div
                        key="step-4"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-8"
                    >
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                fontFamily: "'Poppins', sans-serif",
                                background: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)'
                            }}
                            className="w-full py-5 rounded-[20px] text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-2xl active:scale-[0.98] transition-all"
                        >
                            {submitting ? 'Processing...' : (
                                <>Confirm & Book <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                        <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                            Confirm <span className="text-[#C8956C]">Session</span>
                        </h2>

                        <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-[2rem] p-6 space-y-6 shadow-sm">
                            <div className="space-y-3 pb-6 border-b border-black/5 dark:border-white/5">
                                {selectedServices.map((svc) => (
                                    <div key={svc.id || svc._id || svc.name} className="flex items-center gap-0">
                                        <div style={{ fontFamily: "'Poppins', sans-serif" }}>
                                            <h3 className="text-sm font-bold uppercase tracking-tight" style={{ color: colors.text }}>{svc.name}</h3>
                                            <p className="text-[8px] font-black uppercase tracking-widest mt-0.5 opacity-40" style={{ color: colors.textMuted }}>{svc.category} · {svc.duration} MIN</p>
                                        </div>
                                        <div className="ml-auto text-[11px] font-bold text-[#C8956C]" style={{ fontFamily: "'Poppins', sans-serif" }}>₹{svc.price}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span style={{ color: colors.textMuted }}>Date</span>
                                    <span style={{ color: colors.text }}>
                                        {selectedDate?.date.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span style={{ color: colors.textMuted }}>Time</span>
                                    <span style={{ color: colors.text }}>{selectedTime}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span style={{ color: colors.textMuted }}>Stylist</span>
                                    <span style={{ color: colors.text }}>{selectedStaff?.name}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span style={{ color: colors.textMuted }}>Salon</span>
                                    <span style={{ color: colors.text }}>{currentOutlet?.name || 'Not selected'}</span>
                                </div>
                            </div>

                            {activeMembership && membershipDiscount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 rounded-2xl flex items-center gap-3 border border-orange-200"
                                    style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(200, 149, 108, 0.05) 100%)' }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <Crown size={14} color="#C8956C" fill="#C8956C" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[#C8956C]">{activeMembership.name} Benefit</p>
                                        <p className="text-[11px] font-bold" style={{ color: colors.text }}>Additional ₹{membershipDiscount} saved</p>
                                    </div>
                                    <Sparkles size={14} color="#C8956C" className="animate-pulse" />
                                </motion.div>
                            )}

                            {/* Coupon Code Section */}
                            <div className="pt-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-2 opacity-50" style={{ color: colors.text }}>Promo Code</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="ENTER CODE"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={isPromoApplied}
                                        className="flex-1 bg-black/5 dark:bg-white/5 rounded-xl px-4 py-2.5 text-[11px] font-bold tracking-widest outline-none border border-transparent focus:border-[#C8956C]/30 transition-all"
                                        style={{ color: colors.text }}
                                    />
                                    <button
                                        onClick={isPromoApplied ? () => { setIsPromoApplied(false); setPromoDiscount(0); setCouponCode(''); } : applyPromo}
                                        className={`px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPromoApplied ? 'bg-red-500/10 text-red-500' : 'bg-[#C8956C] text-white'}`}
                                    >
                                        {isPromoApplied ? 'Remove' : 'Apply'}
                                    </button>
                                </div>
                                {isPromoApplied && (
                                    <p className="text-[10px] font-bold text-green-500 mt-2 flex items-center gap-1">
                                        <Sparkles size={10} /> Promo code applied successfully!
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 pt-4 border-t border-dashed border-black/10 dark:border-white/10 uppercase font-black tracking-tighter">
                                <div className="flex justify-between items-center opacity-40 text-xs">
                                    <span style={{ color: colors.text }}>Subtotal</span>
                                    <span style={{ color: colors.text }}>₹{totalPrice.toLocaleString()}</span>
                                </div>
                                {membershipDiscount > 0 && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[#C8956C]">Membership Discount</span>
                                        <span className="text-[#C8956C]">- ₹{membershipDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-green-500">Promo Discount</span>
                                        <span className="text-green-500">- ₹{promoDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-2xl pt-2">
                                    <span style={{ color: colors.textMuted }}>Total</span>
                                    <span className="text-[#C8956C]">₹{finalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[9px] text-center uppercase tracking-widest font-bold leading-relaxed opacity-40" style={{ color: colors.textMuted, fontFamily: "'Poppins', sans-serif" }}>
                                Secure booking confirmation will be sent <br />
                                to your registered mobile number
                            </p>
                        </div>
                    </motion.div>
                )
                }
            </AnimatePresence >
        </div >
    );
}
