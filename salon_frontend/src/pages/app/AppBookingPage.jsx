import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles, Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, MapPin, Crown, Star, Armchair, DoorClosed, Zap, Wallet, CreditCard } from 'lucide-react';
import StepIndicator from '../../components/app/StepIndicator';
import { MOCK_SERVICES, MOCK_STAFF, MOCK_OUTLET, MOCK_OUTLETS, generateTimeSlots } from '../../data/appMockData';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useGender } from '../../contexts/GenderContext';
import { useWallet } from '../../contexts/WalletContext';
import api from '../../services/api';

const STEPS = ['Service', 'Stylist', 'Date & Time', 'Confirm'];

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
    const { gender: appGender } = useGender();
    const isLight = theme === 'light';

    const preSelectedServiceId = searchParams.get('serviceId');
    const outletId = searchParams.get('outletId');
    const { 
        activeOutlet, 
        outlets, 
        services: businessServices, 
        groupedServices,
        staff: businessStaff,
        fetchGroupedServices,
        fetchStaff,
        loyaltySettings,
        activeSalonId,
        salon
    } = useBusiness();

    const [selectedOutlet, setSelectedOutlet] = useState(() => {
        const found = outlets.find(o => String(o.id || o._id) === String(outletId));
        return found || activeOutlet || null;
    });

    useEffect(() => {
        if (!selectedOutlet && outlets.length > 0) {
            const found = outlets.find(o => String(o.id || o._id) === String(outletId));
            if (found) setSelectedOutlet(found);
            else if (activeOutlet) setSelectedOutlet(activeOutlet);
        }
    }, [outlets, outletId, activeOutlet, selectedOutlet]);

    const currentOutlet = selectedOutlet;

    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Pre-select service from query
    useEffect(() => {
        if (preSelectedServiceId && businessServices.length > 0) {
            const svc = businessServices.find(s => String(s._id || s.id) === String(preSelectedServiceId));
            if (svc) {
                setSelectedServices([svc]);
                setStep(1); // Auto-advance to Stylist
            }
        }
    }, [preSelectedServiceId, businessServices]);
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
    const [paymentMethod, setPaymentMethod] = useState('salon'); // 'salon', 'online' or 'wallet'
    const { balance, refreshWallet } = useWallet();
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

    // Razorpay Script loading disabled for Mock/Offline mode to prevent 1000+ network requests.
    // If production is needed, uncomment the script loading logic.

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
        const tid = activeSalonId || localStorage.getItem('active_salon_id');
        if (tid) {
            fetchGroupedServices(tid);
            fetchStaff(tid);
        }
    }, [activeSalonId, fetchGroupedServices, fetchStaff]);

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

    const outletStaff = useMemo(() => {
        if (!currentOutlet) return [];
        return (businessStaff || []).filter(s => {
            const sRole = String(s.role || '').toLowerCase();
            const isStylist = sRole === 'stylist' || s.isStylist === true;
            if (!isStylist) return false;
            
            const targetOutletId = String(currentOutlet._id || currentOutlet.id);
            const staffOutlets = (s.outletIds || [s.outletId]).filter(Boolean);
            
            // If staff has no outlets assigned, they might be global staff
            if (staffOutlets.length === 0) return true;
            
            return staffOutlets.some(id => {
                const oid = id && typeof id === 'object' ? id._id : id;
                return String(oid || '') === targetOutletId;
            });
        });
    }, [businessStaff, currentOutlet]);

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

        const salonStaff = outletStaff;
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
    }, [selectedDate, totalDuration, currentOutlet, availabilityData, loadingAvailability, outletStaff]);

    const finalGroups = useMemo(() => {
        const q = serviceSearch.toLowerCase().trim();
        
        let groups = (groupedServices || []).map(group => {
            const filteredGroupServices = group.services.filter(s => {
                // Status check
                if (s.status !== 'active') return false;
                
                // Gender match - using appGender from useGender
                const sG = (s.gender || 'both').toLowerCase();
                const currentG = appGender ? appGender.toLowerCase() : null;
                const genderMatch = sG === 'both' || !currentG || sG === currentG;
                if (!genderMatch) return false;
                
                // Search match
                if (q && !s.name.toLowerCase().includes(q) && !group.name.toLowerCase().includes(q)) return false;

                return true;
            });

            return { ...group, services: filteredGroupServices };
        }).filter(group => group.services.length > 0);

        return groups;
    }, [groupedServices, serviceSearch]);

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
                tenantId: currentOutlet?.tenantId || currentOutlet?.tenant_id || activeSalonId || localStorage.getItem('active_salon_id'),
                source: 'APP'
            };

            if (!baseBookingData.tenantId) {
                console.error('[AppBookingPage] CRITICAL: tenantId is missing from baseBookingData');
            }
            if (paymentMethod === 'wallet') {
                // Wallet Payment
                if (balance < finalPrice) {
                    alert('Insufficient wallet balance. Please add money or choose another method.');
                    setSubmitting(false);
                    submittingRef.current = false;
                    return;
                }

                const payload = {
                    ...baseBookingData,
                    status: 'confirmed',
                    paymentMethod: 'wallet',
                    paymentStatus: 'paid',
                    notes: `Paid via Wallet${selectedTime ? ` at ${selectedTime}` : ''}`
                };

                const res = await api.post('/bookings', payload);
                await refreshWallet(); // Refresh balance
                finalizeBookingSuccess(res.data.data || res.data);
            } else {
                // Salon Payment (Offline)
                const payload = {
                    ...baseBookingData,
                    status: 'confirmed',
                    notes: `Booked via customer app (Pay at Salon)${selectedTime ? ` at ${selectedTime}` : ''}`,
                    paymentMethod: 'salon',
                    paymentStatus: 'unpaid'
                };
                
                const res = await api.post('/bookings', payload);
                finalizeBookingSuccess(res.data.data || res.data);
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
        <div className="space-y-6 px-4 pb-32" style={{ background: colors.bg, minHeight: '100svh' }}>
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
                {/* STEP 0: Service Selection */}
                {step === 0 && (
                    <motion.div
                        key="step-0"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
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

                        <div className="flex flex-col gap-4 mb-4">
                            <div
                                style={{
                                    background: isLight
                                        ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                                        : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                                    borderRadius: '20px 6px 20px 6px',
                                    padding: '0 16px',
                                    height: '52px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <Search size={18} style={{ color: colors.textMuted }} />
                                <input
                                    type="text"
                                    value={serviceSearch}
                                    onChange={(e) => setServiceSearch(e.target.value)}
                                    placeholder="Search services..."
                                    style={{ background: 'transparent', border: 'none', outline: 'none', color: colors.text, width: '100%', fontSize: '14px', fontWeight: 600 }}
                                />
                            </div>
                        </div>

                        <div className="space-y-10 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1 pb-4">
                            {finalGroups.map((group) => (
                                <div key={group._id || group.id} className="space-y-4">
                                    <div className="flex items-center gap-3 sticky top-0 z-10 bg-inherit py-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8956C]">{group.name}</h3>
                                        <div className="h-px flex-1 bg-gradient-to-r from-[#C8956C]/30 to-transparent" />
                                    </div>
                                    <div className="space-y-2.5">
                                        {group.services.map((svc) => {
                                            const svcId = svc._id || svc.id;
                                            const isSelected = selectedServices.some(s => (s._id || s.id) === svcId);
                                            return (
                                                <motion.button
                                                    key={svcId}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => toggleService(svc)}
                                                    style={{
                                                        background: isSelected ? 'rgba(200,149,108,0.1)' : colors.card,
                                                        borderColor: isSelected ? '#C8956C' : colors.border
                                                    }}
                                                    className="w-full text-left p-5 rounded-2xl border transition-all shadow-sm"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold uppercase" style={{ color: colors.text }}>{svc.name}</p>
                                                            <p className="text-[9px] mt-1.5 flex items-center gap-2 font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                                                                <Clock className="w-3 h-3 text-[#C8956C]" /> {svc.duration} MIN
                                                                {svc.resourceType && ` · ${svc.resourceType}`}
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
                                </div>
                            ))}

                            {finalGroups.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search size={24} className="opacity-20" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">No services found</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => goTo(1)}
                            disabled={selectedServices.length === 0}
                            className="w-full py-5 rounded-[20px] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl mt-4"
                        >
                            Continue ({selectedServices.length}) <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {/* STEP 1: Stylist */}
                {step === 1 && (
                    <motion.div
                        key="step-1"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                            Choose <span className="text-[#C8956C]">Expert</span>
                        </h2>

                        <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-8">
                            {outletStaff.map((s, i) => {
                                const sid = s._id || s.id;
                                const isSelected = !!selectedStaff && String(selectedStaff._id || selectedStaff.id) === String(sid);
                                return (
                                    <motion.button
                                        key={sid || i}
                                        onClick={() => setSelectedStaff(s)}
                                        style={{
                                            background: isSelected ? 'rgba(200,149,108,0.1)' : colors.card,
                                            borderColor: isSelected ? '#C8956C' : colors.border
                                        }}
                                        className="w-full flex items-center gap-5 p-5 rounded-[24px] border-2 transition-all"
                                    >
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            {s.image ? (
                                                <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-[#C8956C] text-xl">
                                                    {s.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="text-lg font-bold" style={{ color: colors.text }}>{s.name}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#C8956C]">{s.role || 'Staff'}</p>
                                        </div>
                                        {isSelected && <Check size={24} className="text-[#C8956C]" />}
                                    </motion.button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => goTo(2)}
                            disabled={!selectedStaff}
                            className="w-full py-5 rounded-[20px] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl mt-4"
                        >
                            Continue <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {/* STEP 2: Date & Time */}
                {step === 2 && (
                    <motion.div
                        key="step-2"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                            Select <span className="text-[#C8956C]">Timeline</span>
                        </h2>

                        <div className="grid grid-cols-7 gap-1 p-4 rounded-3xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50">
                            {calendarDays.map((d, i) => {
                                const isSelected = selectedDate?.date.toDateString() === d.date.toDateString();
                                const canSelect = d.isOpen && d.isCurrentMonth;
                                return (
                                    <button
                                        key={i}
                                        disabled={!canSelect}
                                        onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                                        style={{ background: isSelected ? '#C8956C' : 'transparent', color: isSelected ? '#fff' : (canSelect ? colors.text : colors.textMuted) }}
                                        className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold ${!canSelect ? 'opacity-10' : ''}`}
                                    >
                                        {d.dayNum}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: colors.text }}>Enter Manual Time</p>
                            <div
                                style={{
                                    background: isLight
                                        ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                                        : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                                    borderRadius: '20px 6px 20px 6px',
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    border: `1px solid ${colors.border}`
                                }}
                            >
                                <Clock size={18} style={{ color: '#C8956C' }} />
                                <input
                                    type="text"
                                    value={selectedTime || ''}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    placeholder="e.g. 10:30 AM"
                                    style={{ background: 'transparent', border: 'none', outline: 'none', color: colors.text, width: '100%', fontSize: '15px', fontWeight: 700, letterSpacing: '0.1em' }}
                                />
                            </div>
                            <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest pl-1">Format: HH:MM AM/PM (e.g., 11:00 AM)</p>
                        </div>

                        <button
                            onClick={() => goTo(3)}
                            disabled={!selectedDate || !selectedTime || selectedTime.length < 4}
                            className="w-full py-5 rounded-[20px] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl"
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {/* STEP 3: Confirm */}
                {step === 3 && (
                    <motion.div
                        key="step-3"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
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

                            <div className="hidden">
                                {/* Promo Code Disabled */}
                            </div>

                            {/* Payment Method Section */}
                            <div className="pt-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-3 opacity-50" style={{ color: colors.text }}>Payment Method</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod('salon')}
                                        className="p-4 rounded-2xl border transition-all text-left relative overflow-hidden"
                                        style={{ 
                                            borderColor: paymentMethod === 'salon' ? '#C8956C' : colors.border,
                                            background: paymentMethod === 'salon' ? '#C8956C08' : 'transparent'
                                        }}
                                    >
                                        <div className="relative z-10">
                                            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: paymentMethod === 'salon' ? '#C8956C' : colors.textMuted }}>Pay at Salon</p>
                                            <p className="text-[7px] font-medium mt-0.5 opacity-40 uppercase tracking-wider" style={{ color: colors.text }}>In-store payment</p>
                                        </div>
                                        {paymentMethod === 'salon' && (
                                            <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#C8956C] flex items-center justify-center">
                                                <Check size={8} color="white" strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('wallet')}
                                        className="p-4 rounded-2xl border transition-all text-left relative overflow-hidden"
                                        style={{ 
                                            borderColor: paymentMethod === 'wallet' ? '#C8956C' : colors.border,
                                            background: paymentMethod === 'wallet' ? '#C8956C08' : 'transparent'
                                        }}
                                    >
                                        <div className="relative z-10">
                                            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: paymentMethod === 'wallet' ? '#C8956C' : colors.textMuted }}>Digital Wallet</p>
                                            <p className="text-[7px] font-medium mt-0.5 opacity-40 uppercase tracking-wider" style={{ color: colors.text }}>Bal: ₹{balance?.toFixed(0)}</p>
                                        </div>
                                        {paymentMethod === 'wallet' && (
                                            <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#C8956C] flex items-center justify-center">
                                                <Check size={8} color="white" strokeWidth={4} />
                                            </div>
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
                                {loyaltySettings?.active && (
                                    <div className="flex justify-between items-center py-2 px-3 mt-2 rounded-xl bg-[#C8956C]/5 border border-[#C8956C]/20">
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-[#C8956C]" fill="#C8956C" />
                                            <span style={{ color: colors.text, fontSize: '10px' }} className="font-bold uppercase tracking-widest">Loyalty Earned</span>
                                        </div>
                                        <span className="text-[#C8956C] font-black">{Math.floor(finalPrice / (loyaltySettings.pointsRate || 100))} Points</span>
                                    </div>
                                )}
                            </div>
                        </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full py-5 rounded-[20px] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all mt-8"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        Complete Booking <Check className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                    </motion.div>
                )
                }
            </AnimatePresence >
        </div >
    );
}
