import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles, Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, MapPin, Crown, Star, Armchair, DoorClosed } from 'lucide-react';
import StepIndicator from '../../components/app/StepIndicator';
import { MOCK_SERVICES, MOCK_STAFF, MOCK_OUTLET, MOCK_OUTLETS, generateTimeSlots } from '../../data/appMockData';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import api from '../../services/api';

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
    const location = useLocation();
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
    const submittingRef = useRef(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [serviceSearch, setServiceSearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [viewMonth, setViewMonth] = useState(new Date());
    const [activeMembership, setActiveMembership] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [isPromoApplied, setIsPromoApplied] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('salon'); // 'salon' or 'online'
    const { customer } = useCustomerAuth();

    // Initial load for membership from backend
    useEffect(() => {
        let cancelled = false;
        const loadActiveMembership = async () => {
            try {
                const res = await api.get('/loyalty/membership/active');
                if (!cancelled) {
                    setActiveMembership(res.data || null);
                }
            } catch (e) {
                console.error("Failed to fetch active membership from backend", e);
                // Fallback to local storage for backward compatibility during transition
                const mem = localStorage.getItem('salon_active_membership');
                if (mem && !cancelled) {
                    try {
                        setActiveMembership(JSON.parse(mem));
                    } catch (err) {}
                }
            }
        };
        if (customer?._id) loadActiveMembership();
        return () => { cancelled = true; };
    }, [customer?._id]);

    // Load active coupon codes for quick selection (Customer view)
    useEffect(() => {
        let cancelled = false;
        const loadCoupons = async () => {
            try {
                const res = await api.get('/promotions/active', {
                    params: { _t: Date.now() },
                });
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res?.data?.data)
                        ? res.data.data
                        : [];
                const codes = list
                    .filter((p) => {
                        const mode = String(p?.activationMode ?? '').toUpperCase();
                        const couponRaw = p?.couponCode ?? p?.coupon_code ?? p?.code;
                        return Boolean(couponRaw) || mode === 'COUPON';
                    })
                    .map((p) => String(p.couponCode ?? p.coupon_code ?? p.code ?? p.name ?? 'OFFER').trim().toUpperCase().replace(/\s+/g, ''));
                if (!cancelled) setAvailableCoupons(codes.slice(0, 8));
            } catch (e) {
                if (!cancelled) setAvailableCoupons([]);
            }
        };
        if (customer?._id) loadCoupons();
        else setAvailableCoupons([]);
        return () => {
            cancelled = true;
        };
    }, [customer?._id]);

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // If user came from AppHomePage with a promo code, prefill it.
    useEffect(() => {
        const promoFromState = location?.state?.promoCode;
        if (!promoFromState) return;
        setCouponCode(String(promoFromState).toUpperCase());
        setIsPromoApplied(false);
        setPromoDiscount(0);
    }, [location?.state?.promoCode]);

    const [availabilityData, setAvailabilityData] = useState(null);
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    // Fetch live availability from backend whenever date or salon changes
    useEffect(() => {
        if (!selectedDate || !currentOutlet) {
            setAvailabilityData(null);
            return;
        }
        
        const fetchAvailability = async () => {
            setLoadingAvailability(true);
            try {
                // Use local date string instead of toISOString to avoid timezone shifts
                const d = selectedDate.date;
                const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
                
                const res = await api.get('/bookings/availability', {
                    params: {
                        outletId: currentOutlet._id || currentOutlet.id,
                        date: dateStr
                    }
                });
                setAvailabilityData(res.data);
            } catch (err) {
                console.error("[AppBookingPage] Failed to fetch availability:", err);
                // Set to empty result rather than null to allow fallback to available slots
                setAvailabilityData({ bookings: [] });
            } finally {
                setLoadingAvailability(false);
            }
        };
        
        fetchAvailability();
    }, [selectedDate, currentOutlet]);

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
            const svc = businessServices.find(s => String(s._id || s.id) === String(preSelectedServiceId));
            if (svc && !selectedServices.find(s => String(s._id || s.id) === String(preSelectedServiceId))) {
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
        const svcId = svc._id || svc.id;
        setSelectedServices(prev => {
            const exists = prev.find(s => (s._id || s.id) === svcId);
            if (exists) return prev.filter(s => (s._id || s.id) !== svcId);
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

    const applyPromo = async (codeOverride) => {
        const raw = codeOverride ?? couponCode;
        const code = String(raw || '').trim().toUpperCase();
        if (!code) return;

        try {
            const customerId = customer?._id;
            const res = await api.post('/promotions/validate-coupon', {
                couponCode: code,
                billAmount: totalPrice,
                customerId: customerId ? String(customerId) : undefined,
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
            const msg = e?.response?.data?.message || e?.message || 'Invalid or expired promo code';
            alert(msg);
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
        // Only show staff with 'stylist' role or designated as stylists
        const isStylist = s.role === 'stylist' || s.isStylist === true;
        if (!isStylist) return false;

        if (!currentOutlet) return true;
        const targetOutletId = String(currentOutlet._id || currentOutlet.id);
        const staffOutletId = String(s.outletId?._id || s.outletId || '');
        return staffOutletId === targetOutletId || staffOutletId === '';
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
            const dayHours = currentOutlet?.workingHours?.find(wh => wh.day === dayName);
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

    // Helper to check if a specific stylist is free at a given time
    const checkStylistAvailable = (staffId, timeStr, duration) => {
        // While loading, assume unavailable to prevent double-booking during transit
        if (loadingAvailability) return false;
        
        // If data fetch failed but we're not loading, default to true (optimistic)
        if (!availabilityData || !selectedDate) return true;
        
        const [time, modifier] = timeStr.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (h === 12) h = 0;
        if (modifier === 'PM') h += 12;

        const start = new Date(selectedDate.date);
        start.setHours(h, m, 0, 0);
        const end = new Date(start.getTime() + duration * 60000);

        const isOverlap = availabilityData.bookings?.some(b => {
            const sid = b.staffId?._id || b.staffId?.id || b.staffId;
            if (!sid || String(sid) !== String(staffId)) return false;
            
            const bStart = new Date(b.start);
            const bEnd = new Date(b.end);
            
            // Check for valid dates
            if (isNaN(bStart.getTime()) || isNaN(bEnd.getTime())) return false;
            
            return (start < bEnd && end > bStart);
        });

        return !isOverlap;
    };

    // Calculate dynamic time slots based on totalDuration and staff availability
    const timeSlots = useMemo(() => {
        if (!selectedDate || !currentOutlet) return [];
        const dayName = selectedDate.date.toLocaleDateString('en-US', { weekday: 'long' });
        const rawSlots = generateTimeSlots(dayName, totalDuration || 30, currentOutlet);
        
        // If still loading or no data yet, show slots as loading/disabled
        if (loadingAvailability || !availabilityData) {
            return rawSlots.map(s => ({ ...s, available: false }));
        }

        const salonStaff = staff;
        if (salonStaff.length === 0) return rawSlots.map(s => ({ ...s, available: false }));

        // Overlay actual availability: a slot is available if at least ONE stylist is free
        const evaluated = rawSlots.map(slot => {
            const availableCount = salonStaff.filter(s => 
                checkStylistAvailable(s._id || s.id, slot.time, totalDuration || 30)
            ).length;
            
            return { 
                ...slot, 
                available: availableCount > 0,
                availableCount // Useful for debugging
            };
        });

        console.log(`[AVAILABILITY] Evaluated ${rawSlots.length} slots for ${selectedDate.date.toDateString()}. Staff count: ${salonStaff.length}. Bookings: ${availabilityData.bookings.length}`);
        
        return evaluated;
    }, [selectedDate, totalDuration, currentOutlet, availabilityData, loadingAvailability, staff]);

    // Filter services by search
    const filteredServices = useMemo(() => {
        if (!serviceSearch.trim()) return services;
        const q = serviceSearch.toLowerCase();
        return services.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }, [services, serviceSearch]);

    // Submit booking

    const mergeDateAndTime = (dateObj, timeStr) => {
        if (!dateObj || !timeStr) return dateObj;
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        
        const merged = new Date(dateObj);
        merged.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return merged;
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        
        if (submittingRef.current) {
            console.warn('[AppBookingPage] Blocked double submission attempt');
            return;
        }
        
        submittingRef.current = true;
        setSubmitting(true);
        try {
            const primaryService = selectedServices?.[0];
            const customerId = customer?._id || customer?.id;
            const staffId = selectedStaff?.id || selectedStaff?._id;
            const serviceId = primaryService?._id || primaryService?.id;
            const outletId = currentOutlet?._id || currentOutlet?.id;

            if (!serviceId || !customerId || !staffId || !selectedDate?.date || !outletId) {
                throw new Error('Missing booking details (Service, Stylist, Date or Outlet)');
            }

            const appointmentDateObj = mergeDateAndTime(selectedDate.date, selectedTime);
            
            // Build Base Booking Data
            const baseBookingData = {
                clientId: customerId,
                serviceId: serviceId,
                staffId,
                outletId,
                appointmentDate: appointmentDateObj.toISOString(),
                time: selectedTime,
                duration: Number(totalDuration || primaryService.duration || 30),
                price: Number(finalPrice || 0),
                tenantId: currentOutlet?.tenantId || currentOutlet?.tenant_id || localStorage.getItem('active_tenant_id'),
                source: 'APP'
            };

            if (!baseBookingData.tenantId) {
                console.error('[AppBookingPage] CRITICAL: tenantId is missing from baseBookingData');
            }

            if (paymentMethod === 'online') {
                // 1. Create Razorpay Order
                const orderRes = await api.post('/bookings/payment/order', {
                    amount: finalPrice,
                    receipt: `bk_${customerId}_${Date.now().toString().slice(-8)}`
                });
                const order = orderRes.data;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_8sYbzHWidwe5Zw',
                    amount: order.amount,currency: order.currency,
                    name: 'Salon App',
                    description: `Booking for ${primaryService.name}`,
                    order_id: order.id,
                    handler: async function (response) {
                        try {
                            // Verify Payment
                            await api.post('/bookings/payment/verify', {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            });

                            // Finalize Booking
                            const res = await api.post('/bookings', {
                                ...baseBookingData,
                                status: 'confirmed',
                                paymentStatus: 'paid',
                                paymentMethod: 'online',
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id
                            });

                            finalizeBookingSuccess(res.data);
                        } catch (err) {
                            console.error('[AppBookingPage] Payment verification failed', err);
                            alert('Payment verification failed. Please contact support.');
                        } finally {
                            setSubmitting(false);
                            submittingRef.current = false;
                        }
                    },
                    prefill: {
                        name: customer?.name || '',
                        email: customer?.email || '',
                        contact: customer?.phone || ''
                    },
                    theme: { color: '#C8956C' },
                    modal: {
                        ondismiss: function() {
                            setSubmitting(false);
                            submittingRef.current = false;
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                // Salon Payment (Offline)
                const payload = {
                    ...baseBookingData,
                    status: 'confirmed',
                    notes: `Booked via customer app (Pay at Salon)${selectedTime ? ` at ${selectedTime}` : ''}`,
                    paymentMethod: 'salon',
                    paymentStatus: 'unpaid'
                };

                console.group('[AppBookingPage] SALON BOOKING AUDIT');
                console.log('Final Payload:', payload);
                console.log('Payload Type:', typeof payload);
                console.log('Endpoint: POST /v1/bookings');
                Object.keys(payload).forEach(key => {
                    console.log(`- ${key}:`, payload[key], `(${typeof payload[key]})`);
                });
                console.groupEnd();

                if (!payload.tenantId || payload.tenantId === 'undefined') {
                    console.error('[AppBookingPage] CRITICAL: tenantId is invalid in SALON payload');
                }

                const finalPayload = {
                    tenantId: payload.tenantId,
                    clientId: payload.clientId,
                    serviceId: payload.serviceId,
                    staffId: payload.staffId,
                    outletId: payload.outletId,
                    appointmentDate: payload.appointmentDate,
                    time: payload.time,
                    duration: payload.duration,
                    price: payload.price,
                    status: payload.status,
                    notes: payload.notes,
                    paymentMethod: payload.paymentMethod,
                    paymentStatus: payload.paymentStatus,
                    source: payload.source
                };

                console.log('[AppBookingPage] FINAL FINAL PAYLOAD:', JSON.stringify(finalPayload));

                const res = await api.post('/bookings', finalPayload);
                finalizeBookingSuccess(res.data);
            }
        } catch (err) {
            console.error('[AppBookingPage] Booking submission failed:', err);
            alert(err.response?.data?.message || 'Booking failed. Please try again.');
            setSubmitting(false);
            submittingRef.current = false;
        }
    };

    /**
     * Helper to finalize UI after backend success
     */
    const finalizeBookingSuccess = (bookingRes) => {
        const newBooking = {
            id: bookingRes._id || `BOK-${Date.now()}`,
            clientId: customer?._id || customer?.id,
            clientName: customer?.name || 'Client',
            phone: customer?.phone || '',
            services: selectedServices.map(s => ({ name: s.name, price: s.price, duration: s.duration })),
            totalPrice: finalPrice,
            totalDuration,
            date: selectedDate.date.toISOString(),
            appointmentDate: selectedDate.date.toISOString(),
            time: selectedTime,
            staffId: selectedStaff?.id || selectedStaff?._id,
            staffName: selectedStaff?.name,
            status: 'upcoming',
            timestamp: new Date().toISOString(),
            source: 'APP'
        };

        addBooking(newBooking);
        setBookingComplete(true);
        setSubmitting(false);
        submittingRef.current = false;
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
                                const svcId = svc._id || svc.id;
                                const isSelected = selectedServices.some(s => (s._id || s.id) === svcId);
                                return (
                                    <motion.button
                                        key={svcId}
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
                                                    {svc.resourceType && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-black/10 dark:bg-white/10" />
                                                            <span className="flex items-center gap-1.5 uppercase">
                                                                {svc.resourceType === 'room' ? <DoorClosed className="w-3 h-3 text-[#C8956C]" /> : <Armchair className="w-3 h-3 text-[#C8956C]" />}
                                                                {svc.resourceType}
                                                            </span>
                                                        </>
                                                    )}
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
                                <div className="grid grid-cols-4 gap-2.5 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1 relative min-h-[100px]">
                                    {loadingAvailability && (
                                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[1px] rounded-xl">
                                            <Loader2 className="w-6 h-6 animate-spin text-[#C8956C]" />
                                        </div>
                                    )}
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

                        <div className="grid grid-cols-1 gap-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-1 pb-8">
                            {staff.map((s, i) => {
                                const sid = s.id || s._id;
                                const isAvailable = checkStylistAvailable(sid, selectedTime, totalDuration || 30);
                                const isSelected = !!selectedStaff && (String(selectedStaff.id || selectedStaff._id) === String(sid));
                                
                                return (
                                    <motion.button
                                        key={sid || i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.08, type: 'spring', damping: 20 }}
                                        whileTap={isAvailable ? { scale: 0.98 } : {}}
                                        disabled={!isAvailable}
                                        onClick={() => setSelectedStaff(s)}
                                        style={{
                                            background: isSelected ? (isLight ? '#FFF9F5' : 'rgba(200,149,108,0.15)') : colors.card,
                                            borderColor: isSelected ? '#C8956C' : colors.border,
                                            fontFamily: "'Poppins', sans-serif"
                                        }}
                                        className={`w-full group flex flex-col p-0 rounded-[32px] border-2 transition-all duration-500 relative overflow-hidden ${isSelected ? 'shadow-2xl border-[#C8956C] -translate-y-1' : 'border-transparent shadow-sm'} ${!isAvailable ? 'opacity-40 grayscale-[0.5] cursor-not-allowed' : ''}`}
                                    >
                                        {/* Background Decoration */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                                        
                                        <div className="flex items-center gap-5 p-6 relative z-10 w-full">
                                            {/* Avatar Section */}
                                            <div className="relative shrink-0">
                                                <div className="w-20 h-20 rounded-[24px] overflow-hidden bg-white dark:bg-[#1E1E1E] border-2 flex items-center justify-center p-1 transition-all duration-500 transform group-hover:scale-105"
                                                     style={{ borderColor: isSelected ? '#C8956C' : 'rgba(0,0,0,0.05)' }}>
                                                    {s.image ? (
                                                        <img src={s.image} alt={s.name} className="w-full h-full object-cover rounded-[18px]" />
                                                    ) : (
                                                        <div className="w-full h-full rounded-[18px] flex items-center justify-center font-black text-[#C8956C] bg-primary/5 text-2xl">
                                                            {s.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Status Badge */}
                                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1A1A1A] p-1 rounded-full shadow-sm">
                                                    <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-[#1A1A1A] ${isAvailable ? 'bg-[#00D084]' : 'bg-red-500'}`} />
                                                </div>
                                            </div>
                                            
                                            {/* Info Section */}
                                            <div className="text-left flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <p className="text-[18px] font-black tracking-tight leading-tight truncate" style={{ color: colors.text }}>
                                                        {s.name}
                                                    </p>
                                                    {s.rating && (
                                                        <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full">
                                                            <Star size={10} className="text-amber-500 fill-amber-500" />
                                                            <span className="text-[10px] font-black text-amber-600">{s.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#C8956C] bg-[#C8956C]/10 px-2.5 py-1 rounded-lg">
                                                        {s.specialization || 'Master Artist'}
                                                    </span>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-40" style={{ color: colors.text }}>
                                                        {s.experience || '5+ Years EXP'}
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex items-center gap-4 opacity-70">
                                                    <div className="flex items-center gap-1.5">
                                                        <Sparkles size={12} className="text-[#C8956C]" />
                                                        <span className="text-[9px] font-black uppercase tracking-tighter">Certified</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {isAvailable ? (
                                                            <>
                                                                <Check size={12} className="text-[#00D084]" />
                                                                <span className="text-[9px] font-black uppercase tracking-tighter text-[#00D084]">Available</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock size={12} className="text-red-500" />
                                                                <span className="text-[9px] font-black uppercase tracking-tighter text-red-500">Booked for this slot</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Selection UI */}
                                            <div className="shrink-0 flex items-center justify-center w-12">
                                                {isSelected ? (
                                                    <motion.div 
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-10 h-10 rounded-full bg-[#C8956C] flex items-center justify-center shadow-lg shadow-[#C8956C]/30"
                                                    >
                                                        <Check size={20} color="white" strokeWidth={3} />
                                                    </motion.div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#C8956C]/20 group-hover:border-[#C8956C]/50 transition-colors" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom Action Bar (Only shows when selected or hover) */}
                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="bg-[#C8956C] w-full px-6 py-3 flex items-center justify-between"
                                                >
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                        <Star size={12} fill="white" /> TOP RATED EXPERT SELECTED
                                                    </p>
                                                    <span className="text-[9px] font-black text-white/80 uppercase tracking-tighter">EXCELLENT CHOICE</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
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
                            type="button"
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
                                        onClick={isPromoApplied ? () => { setIsPromoApplied(false); setPromoDiscount(0); setCouponCode(''); } : () => applyPromo()}
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

                                {!isPromoApplied && availableCoupons.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {availableCoupons.map(code => (
                                            <button
                                                key={code}
                                                type="button"
                                                onClick={() => {
                                                    setCouponCode(code);
                                                    applyPromo(code);
                                                }}
                                                className="px-3 py-1 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-[#C8956C]/30 text-[10px] font-black uppercase tracking-widest"
                                                style={{ color: colors.text }}
                                            >
                                                {code}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Payment Method Section */}
                            <div className="pt-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-3 opacity-50" style={{ color: colors.text }}>Payment Method</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('salon')}
                                        className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                                            paymentMethod === 'salon' 
                                            ? 'border-[#C8956C] bg-[#C8956C]/5' 
                                            : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5'
                                        }`}
                                    >
                                        <div className="relative z-10">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'salon' ? 'text-[#C8956C]' : 'opacity-60'}`} style={{ color: paymentMethod === 'salon' ? '#C8956C' : colors.text }}>Pay at Salon</p>
                                            <p className="text-[8px] font-medium mt-1 opacity-40 uppercase tracking-wider" style={{ color: colors.text }}>Cash or Card</p>
                                        </div>
                                        {paymentMethod === 'salon' && (
                                            <motion.div layoutId="active-pay" className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#C8956C] flex items-center justify-center">
                                                <Check size={10} color="white" strokeWidth={4} />
                                            </motion.div>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('online')}
                                        className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                                            paymentMethod === 'online' 
                                            ? 'border-[#C8956C] bg-[#C8956C]/5' 
                                            : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5'
                                        }`}
                                    >
                                        <div className="relative z-10">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'online' ? 'text-[#C8956C]' : 'opacity-60'}`} style={{ color: paymentMethod === 'online' ? '#C8956C' : colors.text }}>Pay Online</p>
                                            <p className="text-[8px] font-medium mt-1 opacity-40 uppercase tracking-wider" style={{ color: colors.text }}>Razorpay Secure</p>
                                        </div>
                                        {paymentMethod === 'online' && (
                                            <motion.div layoutId="active-pay" className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#C8956C] flex items-center justify-center">
                                                <Check size={10} color="white" strokeWidth={4} />
                                            </motion.div>
                                        )}
                                    </button>
                                </div>
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
