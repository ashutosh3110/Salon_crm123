import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles, Loader2, Search, ChevronLeft, ChevronRight, MapPin, User, Zap } from 'lucide-react';
import StepIndicator from '../../components/app/StepIndicator';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const STEPS = ['Details', 'Outlet', 'Services', 'Stylist', 'Slots', 'Confirm & Book'];

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function AppSharedBookingPage() {
    const { addBooking } = useBookingRegistry();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const tenantId = searchParams.get('tenantId') || searchParams.get('salonId') || localStorage.getItem('active_salon_id');

    // State Variables
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);

    // Form inputs & data loaded
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerError, setCustomerError] = useState('');
    const [activeCustomer, setActiveCustomer] = useState(null);

    const [outlets, setOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [groupedServices, setGroupedServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [serviceSearch, setServiceSearch] = useState('');

    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [viewMonth, setViewMonth] = useState(new Date());

    const [couponCode, setCouponCode] = useState('');
    const [isPromoApplied, setIsPromoApplied] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState(0);

    const [platformSettings, setPlatformSettings] = useState(null);

    // Initial check for shared booking parameters
    useEffect(() => {
        if (!tenantId) {
            alert('Cannot identify salon for this shared booking link. Redirecting back...');
            navigate(-1);
            return;
        }

        const loadCoreData = async () => {
            setIsLoading(true);
            try {
                const [outletsRes, servicesRes, settingsRes] = await Promise.all([
                    api.get(`/outlets?salonId=${tenantId}`),
                    api.get(`/services/grouped?salonId=${tenantId}`),
                    api.get('/settings').catch(() => null)
                ]);

                setOutlets(outletsRes.data?.data || outletsRes.data?.results || outletsRes.data || []);
                setGroupedServices(servicesRes.data?.data || servicesRes.data?.results || servicesRes.data || []);
                if (settingsRes) {
                    setPlatformSettings(settingsRes.data?.data || settingsRes.data);
                }
            } catch (err) {
                console.error('[SharedBooking] Failed to fetch shared salon info:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadCoreData();
    }, [tenantId, navigate]);

    // Fetch staff list whenever selectedOutlet changes
    useEffect(() => {
        if (!selectedOutlet) {
            setStaffList([]);
            return;
        }

        const loadStaff = async () => {
            try {
                const res = await api.get(`/users?salonId=${tenantId}`);
                const allStaff = res.data?.data || res.data?.results || res.data || [];
                const outletOid = String(selectedOutlet._id || selectedOutlet.id);

                // Filter experts who belong to chosen outlet
                const filtered = allStaff.filter(s => {
                    const isStylistRole = ['stylist', 'stylish', 'expert', 'beautician', 'hairdresser', 'barber'].includes(String(s.role || '').toLowerCase());
                    const isStylist = s.isStylist !== false && (s.isStylist === true || isStylistRole);
                    if (!isStylist) return false;
                    if (s.status === 'inactive' || s.isActive === false) return false;
                    
                    const sOutletId = String(s.outletId?._id || s.outletId || '');
                    return sOutletId === outletOid;
                });
                setStaffList(filtered);
            } catch (err) {
                console.error('[SharedBooking] Staff fetch failed:', err);
            }
        };

        loadStaff();
    }, [selectedOutlet, tenantId]);

    // Fetch slot availability whenever date or staff or service changes
    useEffect(() => {
        if (!selectedDate || !selectedOutlet || !selectedStaff || selectedServices.length === 0) {
            setAvailableSlots([]);
            return;
        }

        const fetchSlots = async () => {
            setLoadingAvailability(true);
            try {
                const d = selectedDate.date;
                const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
                
                const res = await api.get('/bookings/available-slots', {
                    params: {
                        staffId: selectedStaff._id || selectedStaff.id,
                        serviceId: selectedServices[0]._id || selectedServices[0].id,
                        date: dateStr
                    }
                });
                const allSlots = res.data?.data || [];
                
                const now = new Date();
                const isToday = d.getFullYear() === now.getFullYear() &&
                              d.getMonth() === now.getMonth() &&
                              d.getDate() === now.getDate();
                
                if (isToday) {
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    setAvailableSlots(allSlots.filter(slot => {
                        const [hours, minutes] = slot.split(':').map(Number);
                        return (hours * 60 + minutes) > currentMinutes + 15; 
                    }));
                } else {
                    setAvailableSlots(allSlots);
                }
            } catch (err) {
                console.error("[SharedBooking] Available slots fetch failed:", err);
                setAvailableSlots([]);
            } finally {
                setLoadingAvailability(false);
            }
        };

        fetchSlots();
    }, [selectedDate, selectedOutlet, selectedStaff, selectedServices]);

    // Step Transition helper
    const goTo = (newStep) => {
        setDirection(newStep > step ? 1 : -1);
        setStep(newStep);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    const handleBack = () => {
        if (step > 0) goTo(step - 1);
        else navigate(-1);
    };

    // Guest registration / login without OTP
    const handleRegisterGuest = async () => {
        if (!customerName.trim()) {
            setCustomerError('Please enter your name');
            return;
        }
        if (customerPhone.length !== 10) {
            setCustomerError('Please enter a valid 10-digit mobile number');
            return;
        }

        setCustomerError('');
        setIsLoading(true);
        try {
            // Trigger brand-new silent login/registration endpoint
            const res = await api.post('/auth/silent-guest-login', {
                phone: customerPhone,
                name: customerName.trim(),
                tenantId
            });

            if (res.data?.success) {
                const token = res.data.data.accessToken;
                const client = res.data.data.client;
                
                localStorage.setItem('customer_token', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setActiveCustomer(client);

                // Auto-advance to select outlet step
                goTo(1);
            } else {
                throw new Error('Registration failed');
            }
        } catch (err) {
            setCustomerError(err.response?.data?.message || err.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleService = (svc) => {
        const svcId = svc._id || svc.id;
        setSelectedServices(prev => {
            const exists = prev.find(s => (s._id || s.id) === svcId);
            if (exists) return prev.filter(s => (s._id || s.id) !== svcId);
            return [...prev, svc];
        });
    };

    // Financial Computations
    const totalDuration = useMemo(() => selectedServices.reduce((sum, s) => sum + s.duration, 0), [selectedServices]);
    const totalPrice = useMemo(() => selectedServices.reduce((sum, s) => sum + s.price, 0), [selectedServices]);
    const tax = useMemo(() => {
        const sGst = Number(platformSettings?.serviceGst || 18);
        return (totalPrice - promoDiscount) * (sGst / 100);
    }, [totalPrice, promoDiscount, platformSettings]);
    const finalPrice = Math.max(0, totalPrice - promoDiscount + tax);

    // Coupon validations
    const applyPromo = async () => {
        const code = String(couponCode || '').trim().toUpperCase();
        if (!code) return;

        try {
            const res = await api.post('/promotions/validate-coupon', {
                couponCode: code,
                billAmount: totalPrice,
                customerId: activeCustomer?._id
            });

            const discount = Number(res?.data?.data?.discount || 0);
            if (discount > 0) {
                setPromoDiscount(discount);
                setIsPromoApplied(true);
                setCouponCode(code);
            } else {
                setPromoDiscount(0);
                setIsPromoApplied(false);
                alert('Promo applied, but discount is ₹0');
            }
        } catch (e) {
            alert(e?.response?.data?.message || 'Invalid or expired promo code');
            setPromoDiscount(0);
            setIsPromoApplied(false);
        }
    };

    const handleRemovePromo = () => {
        setPromoDiscount(0);
        setIsPromoApplied(false);
        setCouponCode('');
    };

    // Submit Guest Booking
    const handleSubmitBooking = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            const primaryService = selectedServices[0];
            const primaryServiceId = primaryService?._id || primaryService?.id;

            // Merge Date and selectedTime
            const [time, modifier] = selectedTime.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier) {
                if (hours === 12) hours = 0;
                if (modifier.toUpperCase() === 'PM') hours += 12;
            }
            const appointmentDateObj = new Date(selectedDate.date);
            appointmentDateObj.setHours(hours, minutes, 0, 0);

            const payload = {
                clientId: activeCustomer?._id,
                serviceId: primaryServiceId,
                staffId: selectedStaff?._id || selectedStaff?.id,
                outletId: selectedOutlet?._id || selectedOutlet?.id,
                appointmentDate: appointmentDateObj.toISOString(),
                time: selectedTime,
                duration: totalDuration,
                subtotal: totalPrice,
                promoDiscount,
                tax,
                totalPrice: finalPrice,
                tenantId,
                source: 'APP',
                status: 'pending',
                notes: `Booked via login-free share link. Client: ${customerName} (+91 ${customerPhone})`,
                paymentMethod: 'salon',
                paymentStatus: 'unpaid'
            };

            const res = await api.post('/bookings', payload);
            if (res.data?.success || res.data?.data) {
                setBookingComplete(true);
            } else {
                throw new Error('Booking creation failed');
            }
        } catch (err) {
            console.error('[SharedBooking] Submit booking failed:', err);
            alert(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Generate Calendar slots
    const calendarDays = useMemo(() => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDay = new Date(firstDayOfMonth);
        startDay.setDate(1 - firstDayOfMonth.getDay());

        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) {
            const d = new Date(startDay);
            d.setDate(startDay.getDate() + i);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            const dayHours = selectedOutlet?.workingHours?.find(wh => wh.day === dayName);
            const defaultOpen = dayName !== 'Sunday';

            const isCurrentMonth = d.getMonth() === month;
            const isPast = d < today;

            days.push({
                date: new Date(d),
                dayNum: d.getDate(),
                isOpen: (dayHours ? dayHours.isOpen : defaultOpen) && !isPast && isCurrentMonth,
                isToday: d.getTime() === today.getTime(),
                isCurrentMonth,
            });
        }
        return days;
    }, [viewMonth, selectedOutlet]);

    const timeSlots = useMemo(() => {
        return availableSlots.map(t => ({ time: t, available: true }));
    }, [availableSlots]);

    const finalGroups = useMemo(() => {
        const q = serviceSearch.toLowerCase().trim();
        const outletOid = selectedOutlet?._id || selectedOutlet?.id;

        return groupedServices.map(group => {
            const filtered = group.services.filter(s => {
                if (s.status === 'inactive') return false;
                if (outletOid && s.outletIds && s.outletIds.length > 0) {
                    if (!s.outletIds.some(id => String(id) === String(outletOid))) return false;
                }
                if (q && !s.name.toLowerCase().includes(q) && !group.name.toLowerCase().includes(q)) return false;
                return true;
            });
            return { ...group, services: filtered };
        }).filter(g => g.services.length > 0);
    }, [groupedServices, serviceSearch, selectedOutlet]);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        toggle: isLight ? '#EDF0F2' : '#1A1A1A',
    };

    // Self-contained styling since this page is outside AppLayout
    const containerStyle = {
        maxWidth: '430px',
        margin: '0 auto',
        minHeight: '100svh',
        background: isLight
            ? 'linear-gradient(to bottom, #FFFFFF 0%, #FBFBFB 100%)'
            : 'linear-gradient(to bottom, #1A1A1A 0%, #0F0F0F 100%)',
        fontFamily: "'Inter', sans-serif",
        color: colors.text,
        position: 'relative',
        width: '100%',
    };

    const inputStyle = {
        background: colors.card,
        borderColor: colors.border,
        color: colors.text,
    };

    if (isLoading) {
        return (
            <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <Loader2 className="w-10 h-10 animate-spin text-[#C8956C]" />
                <p style={{ color: colors.textMuted }} className="text-xs font-bold uppercase tracking-[0.2em]">LOADING EXPERIENCE</p>
            </div>
        );
    }

    if (bookingComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6"
                style={containerStyle}
            >
                <div className="w-24 h-24 rounded-full bg-[#C8956C]/10 flex items-center justify-center border border-[#C8956C]/20">
                    <Check className="w-12 h-12 text-[#C8956C]" strokeWidth={3} />
                </div>
                <div>
                    <h2 style={{ fontFamily: "'Libre Baskerville', serif", color: colors.text }} className="text-2xl font-bold tracking-tight">Booking Requested! 🎉</h2>
                    <p style={{ color: colors.textMuted }} className="text-[10px] uppercase tracking-[0.2em] mt-2 font-mono">
                        {selectedServices.map(s => s.name).join(' + ')} with {selectedStaff?.name}
                    </p>
                </div>

                <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-3xl p-6 w-full max-w-xs space-y-4 shadow-sm text-left">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span style={{ color: colors.textMuted }}>Date</span>
                        <span style={{ color: colors.text }}>{selectedDate?.date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
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
                        <span style={{ color: colors.textMuted }}>Outlet</span>
                        <span style={{ color: colors.text }}>{selectedOutlet?.name}</span>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t border-dashed border-black/10 dark:border-white/10 uppercase font-black tracking-tight">
                        <div className="flex justify-between text-xs opacity-40">
                            <span style={{ color: colors.text }}>Subtotal</span>
                            <span style={{ color: colors.text }}>₹{totalPrice.toLocaleString()}</span>
                        </div>
                        {promoDiscount > 0 && (
                            <div className="flex justify-between text-xs text-green-500">
                                <span>Discount</span>
                                <span>- ₹{promoDiscount}</span>
                            </div>
                        )}
                        <div className="space-y-1 py-1 border-t border-black/5 dark:border-white/5 opacity-60">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                <span>GST ({platformSettings?.serviceGst || 18}% - Excluding)</span>
                                <span>+ ₹{Math.round(tax).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-xl pt-2">
                            <span style={{ color: colors.textMuted }}>Total</span>
                            <span className="text-[#C8956C]">₹{Math.round(finalPrice).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <p style={{ color: colors.textMuted }} className="text-xs font-medium">Thank you for booking! We have successfully received your appointment.</p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 px-4 pb-32" style={containerStyle}>
            {/* Header / Back navigation */}
            <div className="pt-4 flex items-center justify-between">
                <button onClick={handleBack} style={{ color: colors.textMuted }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#C8956C] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
                </button>
                <div style={{ color: '#C8956C' }} className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Step {step + 1}/{STEPS.length}</div>
            </div>

            <StepIndicator currentStep={step} steps={STEPS} />

            <AnimatePresence mode="wait" custom={direction}>
                {step === 0 && (
                    <motion.div
                        key="step-0"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6 text-left"
                    >
                        <div className="flex flex-col gap-1">
                            <h2 style={{ fontFamily: "'Libre Baskerville', serif", color: colors.text }} className="text-xl font-bold uppercase tracking-tight">Customer <span className="text-[#C8956C]">Details</span></h2>
                            <p style={{ color: colors.textMuted }} className="text-[10px] uppercase tracking-widest font-bold">Please fill in your details to start booking</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label style={{ color: colors.textMuted }} className="text-[10px] font-black uppercase tracking-widest pl-1">Your Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={customerName}
                                    onChange={(e) => { setCustomerName(e.target.value); setCustomerError(''); }}
                                    style={inputStyle}
                                    className="w-full px-5 py-3.5 rounded-xl border text-sm font-semibold focus:border-[#C8956C] outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label style={{ color: colors.textMuted }} className="text-[10px] font-black uppercase tracking-widest pl-1">Mobile Number</label>
                                <div className="relative flex items-center">
                                    <span style={{ color: colors.textMuted }} className="absolute left-5 text-sm font-bold">+91</span>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        placeholder="9876543210"
                                        value={customerPhone}
                                        onChange={(e) => { setCustomerPhone(e.target.value.replace(/\D/g, '')); setCustomerError(''); }}
                                        style={inputStyle}
                                        className="w-full pl-14 pr-5 py-3.5 rounded-xl border text-sm font-semibold focus:border-[#C8956C] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {customerError && (
                                <p className="text-xs text-rose-500 font-semibold pl-1">{customerError}</p>
                            )}

                            <button
                                onClick={handleRegisterGuest}
                                className="w-full py-5 rounded-[20px] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-xl active:scale-[0.98]"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="step-1"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6 text-left"
                    >
                        <div className="flex flex-col gap-1">
                            <h2 style={{ fontFamily: "'Libre Baskerville', serif", color: colors.text }} className="text-xl font-bold uppercase tracking-tight">Select <span className="text-[#C8956C]">Outlet</span></h2>
                            <p style={{ color: colors.textMuted }} className="text-[10px] uppercase tracking-widest font-bold">Which branch would you like to visit?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
                            {outlets.map((o) => {
                                const isSelected = selectedOutlet && String(selectedOutlet._id || selectedOutlet.id) === String(o._id || o.id);
                                return (
                                    <button
                                        key={o._id || o.id}
                                        onClick={() => { setSelectedOutlet(o); setSelectedStaff(null); }}
                                        style={{
                                            background: isSelected ? 'rgba(200,149,108,0.1)' : colors.card,
                                            borderColor: isSelected ? '#C8956C' : colors.border
                                        }}
                                        className="w-full flex items-center gap-4 p-5 rounded-[24px] border-2 text-left transition-all shadow-sm"
                                    >
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                            <img
                                                src={getImageUrl(o.images?.[0] || o.image) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"}
                                                alt={o.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-bold truncate" style={{ color: colors.text }}>{o.name}</p>
                                            <p className="text-[10px] truncate mt-0.5" style={{ color: colors.textMuted }}>{typeof o.address === 'string' ? o.address : (o.address?.street || o.city)}</p>
                                        </div>
                                        {isSelected && <Check size={20} className="text-[#C8956C] shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => goTo(2)}
                            disabled={!selectedOutlet}
                            className="w-full py-5 rounded-[20px] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl"
                        >
                            Continue <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step-2"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6 text-left"
                    >
                        <div className="flex flex-col gap-1">
                            <h2 style={{ fontFamily: "'Libre Baskerville', serif", color: colors.text }} className="text-xl font-bold uppercase tracking-tight">Select <span className="text-[#C8956C]">Services</span></h2>
                            <p style={{ color: colors.textMuted }} className="text-[10px] uppercase tracking-widest font-bold">Services available at {selectedOutlet?.name}</p>
                        </div>

                        <div className="relative flex items-center gap-3 h-12 px-4 rounded-xl" style={{ border: `1px solid ${colors.border}`, background: isLight ? '#fff' : 'rgba(255,255,255,0.03)' }}>
                            <Search size={16} style={{ color: colors.textMuted }} />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={serviceSearch}
                                onChange={(e) => setServiceSearch(e.target.value)}
                                style={{ color: colors.text }}
                                className="w-full bg-transparent border-none outline-none text-sm placeholder:opacity-50"
                            />
                        </div>

                        <div className="space-y-6 max-h-[45vh] overflow-y-auto pr-1 no-scrollbar pb-4">
                            {finalGroups.map((group) => (
                                <div key={group._id || group.name} className="space-y-3">
                                    <h3 className="text-[10px] font-black text-[#C8956C] uppercase tracking-[0.2em] border-b border-[#C8956C]/10 pb-1">{group.name}</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {group.services.map((svc) => {
                                            const isSelected = selectedServices.some(s => (s._id || s.id) === (svc._id || svc.id));
                                            return (
                                                <div
                                                    key={svc._id || svc.id}
                                                    onClick={() => toggleService(svc)}
                                                    style={{
                                                        background: isSelected ? 'rgba(200,149,108,0.06)' : colors.card,
                                                        borderColor: isSelected ? '#C8956C' : colors.border
                                                    }}
                                                    className="p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all"
                                                >
                                                    <div className="text-left space-y-1">
                                                        <p className="text-sm font-bold" style={{ color: colors.text }}>{svc.name}</p>
                                                        <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: colors.textMuted }}>{svc.duration} min · ₹{svc.price}</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-[#C8956C] border-[#C8956C]' : ''}`} style={{ borderColor: isSelected ? '#C8956C' : colors.border }}>
                                                        {isSelected && <Check size={12} color="white" strokeWidth={4} />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedServices.length > 0 && (
                            <div className="p-4 rounded-2xl bg-[#C8956C]/5 border border-[#C8956C]/20 flex items-center justify-between mt-2 shadow-sm">
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase text-[#C8956C] tracking-widest">Selected Services</p>
                                    <p className="text-sm font-bold mt-0.5" style={{ color: colors.text }}>{selectedServices.length} Selected · ₹{totalPrice}</p>
                                </div>
                                <button onClick={() => setSelectedServices([])} className="text-[9px] font-black uppercase text-rose-500 tracking-wider hover:underline">Clear</button>
                            </div>
                        )}

                        <button
                            onClick={() => goTo(3)}
                            disabled={selectedServices.length === 0}
                            className="w-full py-5 rounded-[20px] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl"
                        >
                            Continue <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step-3"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6 text-left"
                    >
                        <div className="flex flex-col gap-1">
                            <h2 style={{ fontFamily: "'Libre Baskerville', serif", color: colors.text }} className="text-xl font-bold uppercase tracking-tight">Choose <span className="text-[#C8956C]">Expert</span></h2>
                            <p style={{ color: colors.textMuted }} className="text-[10px] uppercase tracking-widest font-bold">Stylists available at {selectedOutlet?.name}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto no-scrollbar">
                            {staffList.length === 0 && (
                                <div className="text-center py-16 px-6">
                                    <p style={{ color: colors.textMuted }} className="text-sm font-bold">No experts found for this branch</p>
                                </div>
                            )}
                            {staffList.map((s) => {
                                const isSelected = selectedStaff && String(selectedStaff._id || selectedStaff.id) === String(s._id || s.id);
                                return (
                                    <button
                                        key={s._id || s.id}
                                        onClick={() => setSelectedStaff(s)}
                                        style={{
                                            background: isSelected ? 'rgba(200,149,108,0.1)' : colors.card,
                                            borderColor: isSelected ? '#C8956C' : colors.border
                                        }}
                                        className="w-full flex items-center gap-5 p-5 rounded-[24px] border-2 transition-all shadow-sm"
                                    >
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                            {s.image ? (
                                                <img src={getImageUrl(s.image)} alt={s.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-[#C8956C] text-xl bg-[#C8956C]/5">
                                                    {s.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="text-lg font-bold" style={{ color: colors.text }}>{s.name}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#C8956C] mt-0.5">{s.role || 'Expert'}</p>
                                        </div>
                                        {isSelected && <Check size={24} className="text-[#C8956C] shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => goTo(4)}
                            disabled={!selectedStaff}
                            className="w-full py-5 rounded-[20px] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl"
                        >
                            Continue <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step-4"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <h2 style={{ fontFamily: "'Libre Baskerville', serif", color: colors.text }} className="text-xl font-bold uppercase tracking-tight text-left">Select <span className="text-[#C8956C]">Timeline</span></h2>

                        <div className="flex items-center justify-between px-2">
                            <h3 style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">{viewMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="p-2 rounded-xl text-text"><ChevronLeft size={14} /></button>
                                <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="p-2 rounded-xl text-text"><ChevronRight size={14} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 p-4 rounded-3xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                                <div key={idx} style={{ color: colors.text }} className="h-8 flex items-center justify-center text-[9px] font-black opacity-30 uppercase tracking-widest">{d}</div>
                            ))}
                            {calendarDays.map((d, i) => {
                                const isSelected = selectedDate?.date.toDateString() === d.date.toDateString();
                                const canSelect = d.isOpen && d.isCurrentMonth;
                                return (
                                    <button
                                        key={i}
                                        disabled={!canSelect}
                                        onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                                        style={{ 
                                            background: isSelected ? '#C8956C' : 'transparent', 
                                            color: isSelected ? '#fff' : colors.text
                                        }}
                                        className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${!canSelect ? 'opacity-20' : 'active:scale-95 hover:bg-[#C8956C]/10'}`}
                                    >
                                        {d.dayNum}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-4 text-left">
                            <p style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Available Slots</p>
                            {selectedDate ? (
                                <div className="grid grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                                    {timeSlots.map((slot, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedTime(slot.time)}
                                            style={{
                                                background: selectedTime === slot.time ? '#C8956C' : colors.card,
                                                borderColor: selectedTime === slot.time ? '#C8956C' : colors.border,
                                                color: selectedTime === slot.time ? '#fff' : colors.text,
                                            }}
                                            className={`py-3 rounded-2xl border text-[11px] font-bold transition-all ${selectedTime === slot.time ? 'shadow-lg shadow-[#C8956C]/20' : ''}`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                    {timeSlots.length === 0 && (
                                        <div className="col-span-3 py-8 text-center opacity-40 text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.text }}>No slots available for this day</div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-8 text-center border-2 border-dashed rounded-3xl opacity-20" style={{ borderColor: colors.border }}>
                                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.text }}>Select a date to view slots</p>
                                </div>
                            )}
                        </div>

                        {selectedDate && selectedTime && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="pt-6">
                                <button
                                    onClick={() => goTo(5)}
                                    className="w-full py-5 rounded-[20px] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-xl hover:opacity-90 active:scale-[0.98] transition-all"
                                >
                                    Continue to Checkout <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {step === 5 && (
                    <motion.div
                        key="step-5"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <h2 style={{ fontFamily: "'Libre Baskerville', serif", color: colors.text }} className="text-xl font-bold uppercase tracking-tight text-left">Confirm & <span className="text-[#C8956C]">Book</span></h2>

                        <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-[2rem] p-6 space-y-6 shadow-sm text-left">
                            <div className="space-y-3 pb-6 border-b border-black/5 dark:border-white/5">
                                {selectedServices.map((svc) => (
                                    <div key={svc.id || svc._id || svc.name} className="flex items-center gap-0">
                                        <div style={{ fontFamily: "'Poppins', sans-serif" }}>
                                            <h3 className="text-sm font-bold uppercase tracking-tight" style={{ color: colors.text }}>{svc.name}</h3>
                                            <p className="text-[8px] font-black uppercase tracking-widest mt-0.5 opacity-40" style={{ color: colors.textMuted }}>{svc.category} · {svc.duration} MIN</p>
                                        </div>
                                        <div className="ml-auto text-[11px] font-bold text-[#C8956C]">₹{svc.price}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span style={{ color: colors.textMuted }}>Date</span>
                                    <span style={{ color: colors.text }}>{selectedDate?.date.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
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
                                    <span style={{ color: colors.textMuted }}>Outlet</span>
                                    <span style={{ color: colors.text }}>{selectedOutlet?.name}</span>
                                </div>
                            </div>

                            {/* Coupon / Promo Entry */}
                            <div className="pt-2 space-y-3">
                                <p style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-[0.15em] opacity-50">Promo Code</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="ENTER COUPON CODE"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={isPromoApplied}
                                        style={{ background: colors.card, borderColor: isPromoApplied ? '#22c55e' : colors.border, color: colors.text }}
                                        className="flex-1 px-4 py-3 rounded-2xl border text-xs font-bold tracking-wider uppercase focus:border-[#C8956C] outline-none transition-all"
                                    />
                                    {isPromoApplied ? (
                                        <button type="button" onClick={handleRemovePromo} className="px-5 py-3 rounded-2xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 active:scale-95">Remove</button>
                                    ) : (
                                        <button type="button" onClick={applyPromo} disabled={!couponCode.trim()} className="px-5 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-20 active:scale-95">Apply</button>
                                    )}
                                </div>
                                {isPromoApplied && (
                                    <p className="text-xs font-bold text-green-500 flex items-center gap-1.5 mt-2 animate-bounce">
                                        <Check size={14} className="stroke-[3]" /> Coupon applied! You saved ₹{promoDiscount}
                                    </p>
                                )}
                            </div>

                            {/* Billing totals */}
                            <div className="space-y-2 pt-4 border-t border-dashed border-black/10 dark:border-white/10 uppercase font-black tracking-tight">
                                <div className="flex justify-between items-center opacity-40 text-xs">
                                    <span style={{ color: colors.text }}>Subtotal</span>
                                    <span style={{ color: colors.text }}>₹{totalPrice.toLocaleString()}</span>
                                </div>
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between items-center text-xs text-green-500">
                                        <span>Promo Discount</span>
                                        <span>- ₹{promoDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="space-y-1 py-1 border-t border-black/5 dark:border-white/5 opacity-60">
                                    <div className="flex justify-between items-center text-xs">
                                        <span style={{ color: colors.text }}>GST ({platformSettings?.serviceGst || 18}% - Excluding)</span>
                                        <span style={{ color: colors.text }}>+ ₹{Math.round(tax).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] pl-2 font-medium italic opacity-60" style={{ color: colors.text }}>
                                        <span>CGST ({(platformSettings?.serviceGst || 18) / 2}%)</span>
                                        <span>+ ₹{Math.round(tax / 2).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] pl-2 font-medium italic opacity-60" style={{ color: colors.text }}>
                                        <span>SGST ({(platformSettings?.serviceGst || 18) / 2}%)</span>
                                        <span>+ ₹{Math.round(tax / 2).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-2xl pt-2">
                                    <span style={{ color: colors.textMuted }}>Total</span>
                                    <span className="text-[#C8956C] px-1">₹{Math.round(finalPrice).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmitBooking}
                            disabled={submitting}
                            className="w-full py-5 rounded-[20px] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:opacity-90 active:scale-95 transition-all mt-4"
                        >
                            {submitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                            ) : (
                                <>Complete Booking <Check className="w-4 h-4" /></>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
