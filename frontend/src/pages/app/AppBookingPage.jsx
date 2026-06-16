import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles, Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, MapPin, Crown, Star, Armchair, DoorClosed, Zap, Wallet, CreditCard, User } from 'lucide-react';
import StepIndicator from '../../components/app/StepIndicator';
import { MOCK_SERVICES, MOCK_STAFF, MOCK_OUTLET, MOCK_OUTLETS, generateTimeSlots } from '../../data/appMockData';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useGender } from '../../contexts/GenderContext';
import { useWallet } from '../../contexts/WalletContext';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const STEPS = ['Details', 'Outlet', 'Services', 'Stylist', 'Book'];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

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
        fetchOutlets,
        loyaltySettings,
        activeSalonId,
        setActiveSalonId,
        salon,
        fetchServices,
        isInitializing,
        platformSettings,
        fetchPlatformSettings
    } = useBusiness();

    useEffect(() => {
        if (!platformSettings) {
            fetchPlatformSettings();
        }
    }, [platformSettings, fetchPlatformSettings]);

    const [selectedOutlet, setSelectedOutlet] = useState(() => {
        const found = outlets.find(o => String(o.id || o._id) === String(outletId));
        return found || activeOutlet || null;
    });

    useEffect(() => {
        if (!selectedOutlet && outlets.length > 0) {
            const found = outlets.find(o => String(o.id || o._id) === String(outletId));
            if (found) setSelectedOutlet(found);
            else if (activeOutlet) setSelectedOutlet(activeOutlet);
            else if (outlets.length === 1) setSelectedOutlet(outlets[0]); // Auto-select if only one outlet
        }
    }, [outlets, outletId, activeOutlet, selectedOutlet]);

    const currentOutlet = selectedOutlet;

    const initializeBookingData = useCallback(async () => {
        const urlId = searchParams.get('tenantId') || searchParams.get('salonId');
        const effectiveTid = urlId || activeSalonId || localStorage.getItem('active_salon_id');

        if (urlId && urlId !== activeSalonId) {
            setActiveSalonId(urlId);
            localStorage.setItem('active_salon_id', urlId);
        }

        if (!effectiveTid) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const fetchPromises = [
                fetchStaff?.(effectiveTid),
                fetchOutlets?.(effectiveTid),
                fetchGroupedServices?.(effectiveTid),
                api.get('/loyalty/membership/active'),
                api.get('/promotions/active', { params: { _t: Date.now() } })
            ];

            if (preSelectedServiceId) {
                fetchPromises.push(fetchServices?.(effectiveTid, null));
            } else {
                fetchPromises.push(fetchServices?.(effectiveTid));
            }

            if (!platformSettings) {
                fetchPromises.push(fetchPlatformSettings());
            }

            const results = await Promise.all(fetchPromises);

            // Set membership if it was in the promises
            const memRes = results.find(r => r?.config?.url === '/loyalty/membership/active');
            if (memRes) {
                setActiveMembership(memRes.data?.data || memRes.data || null);
            }

            // Set coupons
            const couponRes = results.find(r => r?.config?.url === '/promotions/active');
            if (couponRes) {
                const list = Array.isArray(couponRes?.data) ? couponRes.data : (Array.isArray(couponRes?.data?.data) ? couponRes.data.data : []);
                const codes = list
                    .filter(p => (p?.couponCode || p?.activationMode === 'COUPON'))
                    .map(p => String(p.couponCode || p.code || 'OFFER').trim().toUpperCase());
                setAvailableCoupons(codes.slice(0, 8));
            }

        } catch (err) {
            console.error('[AppBookingPage] Initialization failed:', err);
        } finally {
            // Smooth transition
            setTimeout(() => setIsLoading(false), 300);
        }
    }, [activeSalonId, preSelectedServiceId, searchParams, fetchStaff, fetchOutlets, fetchServices, fetchPlatformSettings, platformSettings]);

    useEffect(() => {
        initializeBookingData();
    }, [initializeBookingData]);

    const [step, setStep] = useState(() => {
        const s = searchParams.get('step');
        return s ? parseInt(s, 10) : 0;
    });

    // Scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        // Also target the main layout if it's the scroll container
        const main = document.querySelector('main');
        if (main) main.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [step]);
    const [direction, setDirection] = useState(1);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(() => {
        const id = searchParams.get('staffId');
        if (id && businessStaff?.length > 0) {
            return businessStaff.find(s => String(s._id || s.id) === id) || null;
        }
        return null;
    });

    // Sync selectedStaff if it was in URL but businessStaff wasn't loaded yet
    useEffect(() => {
        const id = searchParams.get('staffId');
        if (id && businessStaff?.length > 0 && !selectedStaff) {
            const found = businessStaff.find(s => String(s._id || s.id) === id);
            if (found) setSelectedStaff(found);
        }
    }, [businessStaff, searchParams]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Auto-select first outlet if none selected and outlets are available
    useEffect(() => {
        if (!selectedOutlet && outlets.length > 0) {
            setSelectedOutlet(outlets[0]);
        }
    }, [outlets, selectedOutlet]);

    const discoveryAttempted = useRef(null);

    // Pre-select service from query - Optimized to prevent infinite loops
    useEffect(() => {
        const discoverAndSelect = async () => {
            if (!preSelectedServiceId || discoveryAttempted.current === preSelectedServiceId) return;

            const targetId = String(preSelectedServiceId).trim();

            // 1. Try to find in existing list
            let svc = (businessServices || []).find(s => String(s._id || s.id || '').trim() === targetId);

            // 2. If not found in current list, fetch directly from server to discover/confirm salon
            if (!svc) {
                try {
                    const res = await api.get(`/services/${targetId}`);
                    const foundSvc = res.data?.data || res.data;
                    if (foundSvc) {
                        svc = foundSvc;
                        const discoveredSalonId = String(svc.salonId?._id || svc.salonId || '');

                        // If it belongs to a different salon or no salon is set, switch context
                        if (discoveredSalonId && String(discoveredSalonId) !== String(activeSalonId)) {
                            console.log("[AppBookingPage] Switching to discovered salon:", discoveredSalonId);
                            setActiveSalonId(discoveredSalonId);
                            localStorage.setItem('active_salon_id', discoveredSalonId);

                            // Mark as attempted to prevent re-entering this block for the same ID
                            discoveryAttempted.current = targetId;

                            // Fetch core data for the new salon context
                            fetchStaff?.(discoveredSalonId);
                            fetchOutlets?.(discoveredSalonId);
                            fetchServices?.(discoveredSalonId, null);
                        }
                    }
                } catch (err) {
                    console.error("[AppBookingPage] Failed to discover service details:", err);
                }
            }

            if (svc) {
                setSelectedServices([svc]);
                discoveryAttempted.current = targetId; // Mark as done

                if (outletId && outlets?.length > 0) {
                    const found = outlets.find(o => String(o.id || o._id) === String(outletId));
                    if (found) setSelectedOutlet(found);
                }
            }
        };

        discoverAndSelect();
    }, [preSelectedServiceId, businessServices, activeSalonId, setActiveSalonId]);
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
    const { customer, isCustomerAuthenticated, loading: authLoading, requestOtp, customerLogin, updateCustomer, customerLogout } = useCustomerAuth();

    const isPreselected = Boolean(preSelectedServiceId);

    const STEPS = useMemo(() => {
        if (isPreselected) {
            if (!isCustomerAuthenticated) {
                return ['Details', 'Stylist', 'Slots', 'Confirm & Book'];
            }
            return ['Stylist', 'Slots', 'Confirm & Book'];
        }
        if (!isCustomerAuthenticated) {
            return ['Details', 'Outlet', 'Services', 'Stylist', 'Slots', 'Confirm & Book'];
        }
        return ['Outlet', 'Services', 'Stylist', 'Slots', 'Confirm & Book'];
    }, [isPreselected, isCustomerAuthenticated]);

    const virtualStep = useMemo(() => {
        if (isPreselected) {
            if (!isCustomerAuthenticated) {
                if (step === 0) return 0; // Details
                if (step === 3) return 1; // Stylist
                if (step === 4) return 2; // Slots
                if (step === 5) return 3; // Confirm & Book
                return 0;
            } else {
                if (step === 3) return 0; // Stylist
                if (step === 4) return 1; // Slots
                if (step === 5) return 2; // Confirm & Book
                return 0;
            }
        }
        if (isCustomerAuthenticated) {
            return Math.max(0, step - 1);
        }
        return step;
    }, [isPreselected, isCustomerAuthenticated, step]);

    const handleBack = () => {
        if (isPreselected) {
            if (step === 5) {
                goTo(4); // from Confirm & Book to Slots
            } else if (step === 4) {
                goTo(3); // from Slots to Stylist
            } else if (step === 3) {
                if (!isCustomerAuthenticated) {
                    goTo(0); // from Stylist to Details
                } else {
                    navigate(-1);
                }
            } else {
                navigate(-1);
            }
        } else {
            const minStep = isCustomerAuthenticated ? 1 : 0;
            if (step > minStep) goTo(step - 1);
            else navigate(-1);
        }
    };

    // Inline login and registration states
    const [detailName, setDetailName] = useState(customer?.name || '');
    const [detailPhone, setDetailPhone] = useState(customer?.phone || '');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVal, setOtpVal] = useState(['', '', '', '']);
    const [otpCd, setOtpCd] = useState(0);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    // Geolocation states
    const [userCoords, setUserCoords] = useState(null);
    const [locLoading, setLocLoading] = useState(false);
    const [locError, setLocError] = useState('');

    useEffect(() => {
        if (customer) {
            setDetailName(customer.name || '');
            setDetailPhone(customer.phone || '');
        }
    }, [customer]);

    useEffect(() => {
        if (otpCd > 0) {
            const t = setTimeout(() => setOtpCd(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [otpCd]);

    const handleSendOtp = async () => {
        if (!detailName.trim()) {
            setOtpError('Please enter your name');
            return;
        }
        if (detailPhone.length !== 10) {
            setOtpError('Enter a valid 10-digit mobile number');
            return;
        }
        setOtpLoading(true);
        setOtpError('');
        try {
            const urlId = searchParams.get('tenantId') || searchParams.get('salonId');
            const effectiveTid = urlId || activeSalonId || localStorage.getItem('active_salon_id') || 'system';
            await requestOtp(detailPhone, effectiveTid);
            setOtpSent(true);
            setOtpCd(30);
        } catch (err) {
            setOtpError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const code = otpVal.join('');
        if (code.length !== 4) {
            setOtpError('Enter the 4-digit OTP');
            return;
        }
        setOtpLoading(true);
        setOtpError('');
        try {
            const urlId = searchParams.get('tenantId') || searchParams.get('salonId');
            const effectiveTid = urlId || activeSalonId || localStorage.getItem('active_salon_id') || 'system';
            const oId = currentOutlet?._id || currentOutlet?.id || '';
            const cust = await customerLogin(detailPhone, code, effectiveTid, oId);

            if (cust && (cust.name === 'Guest' || cust.name === 'Guest Customer' || !cust.name || cust.isNewUser)) {
                await updateCustomer({ name: detailName.trim() });
            }

            // Sync local state name and phone
            setDetailName(detailName.trim());
            setDetailPhone(detailPhone);

            // Advance to next step based on context
            if (preSelectedServiceId) {
                goTo(3);
            } else {
                goTo(1);
            }
        } catch (err) {
            setOtpError(err.message || 'Verification failed');
            setOtpVal(['', '', '', '']);
            otpRefs[0].current?.focus();
        } finally {
            setOtpLoading(false);
        }
    };

    const handleOtpChange = (i, v) => {
        if (v.length > 1) v = v.slice(-1);
        if (!/^\d*$/.test(v)) return;
        const n = [...otpVal]; n[i] = v; setOtpVal(n);
        if (v && i < 3) otpRefs[i + 1].current?.focus();
    };

    const handleOtpKey = (i, e) => {
        if (e.key === 'Backspace' && !otpVal[i] && i > 0) otpRefs[i - 1].current?.focus();
    };

    const handleGetLocation = () => {
        setLocLoading(true);
        setLocError('');
        if (!navigator.geolocation) {
            setLocError('Geolocation is not supported by your browser');
            setLocLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserCoords(coords);
                setLocLoading(false);
            },
            (err) => {
                setLocError('Location access was denied or failed');
                setLocLoading(false);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const outletsWithDistance = useMemo(() => {
        if (!userCoords) return outlets.map(o => ({ ...o, distanceKm: null }));
        return outlets.map(o => {
            const lon = o.location?.coordinates?.[0] || o.longitude;
            const lat = o.location?.coordinates?.[1] || o.latitude;
            const dist = calculateDistance(userCoords.lat, userCoords.lng, lat, lon);
            return { ...o, distanceKm: dist };
        });
    }, [outlets, userCoords]);

    // Initial load for membership from backend
    useEffect(() => {
        let cancelled = false;
        const loadActiveMembership = async () => {
            try {
                const res = await api.get('/loyalty/membership/active');
                if (!cancelled) {
                    setActiveMembership(res.data?.data || res.data || null);
                }
            } catch (e) {
                console.error("Failed to fetch active membership from backend", e);
                // Fallback to local storage for backward compatibility during transition
                const mem = localStorage.getItem('salon_active_membership');
                if (mem && !cancelled) {
                    try {
                        setActiveMembership(JSON.parse(mem));
                    } catch (err) { }
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

    // Auto-skip steps based on auth status
    useEffect(() => {
        if (!isLoading && !authLoading) {
            const isPreselectedFlow = Boolean(preSelectedServiceId);
            if (isPreselectedFlow) {
                if (isCustomerAuthenticated) {
                    if (step < 3) {
                        goTo(3);
                    }
                } else {
                    if (step !== 0) {
                        goTo(0);
                    }
                }
            } else {
                if (isCustomerAuthenticated) {
                    if (step === 0) {
                        goTo(1);
                    }
                } else {
                    if (step !== 0) {
                        goTo(0);
                    }
                }
            }
        }
    }, [isLoading, authLoading, isCustomerAuthenticated, preSelectedServiceId, step]);

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

    const [loadingAvailability, setLoadingAvailability] = useState(false);

    // Fetch live availability from backend whenever date or salon changes
    useEffect(() => {
        if (!selectedDate || !currentOutlet || !selectedStaff || selectedServices.length === 0) {
            setAvailableSlots([]);
            return;
        }

        const fetchSlots = async () => {
            setLoadingAvailability(true);
            try {
                // Use local date string instead of toISOString to avoid timezone shifts
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

                // Filter past slots if today is selected
                const now = new Date();
                const isToday = d.getFullYear() === now.getFullYear() &&
                    d.getMonth() === now.getMonth() &&
                    d.getDate() === now.getDate();

                if (isToday) {
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    // Show slots starting at least 15 mins from now
                    setAvailableSlots(allSlots.filter(slot => {
                        const [hours, minutes] = slot.split(':').map(Number);
                        const slotMinutes = hours * 60 + minutes;
                        return slotMinutes > currentMinutes + 15;
                    }));
                } else {
                    setAvailableSlots(allSlots);
                }
            } catch (err) {
                console.error("[AppBookingPage] Failed to fetch slots:", err);
                setAvailableSlots([]);
            } finally {
                setLoadingAvailability(false);
            }
        };

        fetchSlots();
    }, [selectedDate, currentOutlet, selectedStaff, selectedServices]);

    const colors = {
        bg: (step === 1 || step === 2 || step === 3 || step === 4 || step === 5) ? '#FFFFFF' : (isLight ? '#FCF9F6' : '#0F0F0F'),
        card: (step === 1 || step === 2 || step === 3 || step === 4 || step === 5) ? '#FFFFFF' : (isLight ? '#FFFFFF' : '#1A1A1A'),
        text: (step === 1 || step === 2 || step === 3 || step === 4 || step === 5) ? '#1A1A1A' : (isLight ? '#1A1A1A' : '#ffffff'),
        textMuted: (step === 1 || step === 2 || step === 3 || step === 4 || step === 5) ? '#666' : (isLight ? '#666' : 'rgba(255,255,255,0.4)'),
        border: (step === 1 || step === 2 || step === 3 || step === 4 || step === 5) ? 'rgba(0,0,0,0.1)' : (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'),
        toggle: (step === 1 || step === 2 || step === 3 || step === 4 || step === 5) ? '#EDF0F2' : (isLight ? '#EDF0F2' : '#1A1A1A'),
        input: (step === 1 || step === 2 || step === 3 || step === 4 || step === 5) ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : (isLight ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)'),
    };

    if (isInitializing || authLoading) {
        return (
            <div style={{ background: colors.bg, minHeight: '100svh' }} className="p-4 space-y-6">
                <style>{`
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                    .shimmer {
                        background: ${isLight ? 'linear-gradient(90deg, #F3EAE3 25%, #E8ECEF 50%, #F3EAE3 75%)' : 'linear-gradient(90deg, #1A1411 25%, #2A211B 50%, #1A1411 75%)'};
                        background-size: 200% 100%;
                        animation: shimmer 1.5s infinite linear;
                    }
                `}</style>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full shimmer" />
                    <div className="h-6 w-32 shimmer rounded" />
                </div>
                <div className="h-12 w-full rounded-2xl shimmer" />
                <div className="aspect-[16/9] w-full rounded-3xl shimmer" />
                <div className="space-y-4">
                    <div className="h-4 w-1/4 shimmer rounded" />
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl shimmer" />)}
                    </div>
                </div>
            </div>
        );
    }

    // Pre-select service from query
    // Redundant fetches removed as data is part of initial-data

    // Redundant pre-selection effect removed (consolidated above)

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
        const plan = activeMembership.planId || activeMembership.plan;
        if (!plan) return 0;

        let discount = 0;
        if (plan.serviceDiscountValue > 0) {
            if (plan.serviceDiscountType === 'percentage') {
                discount = (totalPrice * plan.serviceDiscountValue) / 100;
            } else {
                discount = plan.serviceDiscountValue;
            }
        }
        return Math.floor(discount);
    }, [activeMembership, totalPrice]);

    const outletStaff = useMemo(() => {
        if (!businessStaff) return [];

        const targetSalonId = String(activeSalonId || salon?._id || '');
        const activeOid = String(currentOutlet?._id || currentOutlet?.id || '');

        return (businessStaff || []).filter(s => {
            // Robust stylist check: Explicit flag OR role check (including 'Stylish' typo/variant)
            const isStylistRole = ['stylist', 'stylish', 'expert', 'beautician', 'hairdresser', 'barber'].includes(String(s.role || '').toLowerCase());
            const isStylist = s.isStylist !== false && (s.isStylist === true || isStylistRole);

            if (!isStylist) return false;

            // Basic status checks: Only show active & approved experts
            if (s.status === 'inactive' || s.isActive === false) return false;
            if (s.profileStatus && s.profileStatus !== 'Approved') return false;

            // Salon check - must match the active salon
            const sSalonId = String(s.salonId?._id || s.salonId || '');
            if (sSalonId && targetSalonId && sSalonId !== targetSalonId) return false;

            // Outlet check
            const sOutletId = String(s.outletId?._id || s.outletId || '');
            if (activeOid && sOutletId && sOutletId !== activeOid) return false;

            return true;
        });
    }, [businessStaff, activeSalonId, salon?._id, currentOutlet]);

    const billingBreakdown = useMemo(() => {
        let totalTax = 0;
        let totalFinal = 0;
        let totalTaxable = 0;
        let isAnyInclusive = false;
        let isAnyExclusive = false;

        selectedServices.forEach(s => {
            const sGst = Number(s.gst !== undefined && s.gst !== null ? s.gst : (platformSettings?.serviceGst || 18));
            const isInclusive = s.isInclusiveTax === true || String(s.isInclusiveTax) === 'true';

            if (isInclusive) {
                isAnyInclusive = true;
            } else {
                isAnyExclusive = true;
            }

            // Proportion of this service's price relative to total un-discounted price
            const proportion = totalPrice > 0 ? (s.price / totalPrice) : 0;
            const allocatedMembership = membershipDiscount * proportion;
            const allocatedPromo = promoDiscount * proportion;
            const netPrice = Math.max(0, s.price - allocatedMembership - allocatedPromo);

            if (isInclusive) {
                const serviceTaxable = netPrice / (1 + (sGst / 100));
                const serviceTax = netPrice - serviceTaxable;
                totalTaxable += serviceTaxable;
                totalTax += serviceTax;
                totalFinal += netPrice;
            } else {
                const serviceTax = netPrice * (sGst / 100);
                totalTaxable += netPrice;
                totalTax += serviceTax;
                totalFinal += (netPrice + serviceTax);
            }
        });

        const roundedTax = Number(totalTax.toFixed(2));
        const roundedCGST = Number((roundedTax / 2).toFixed(2));
        const roundedSGST = Number((roundedTax - roundedCGST).toFixed(2));
        const roundedFinal = Number(totalFinal.toFixed(2));
        const roundedTaxable = Number(totalTaxable.toFixed(2));

        return {
            taxable: roundedTaxable,
            tax: roundedTax,
            finalPrice: roundedFinal,
            cgst: roundedCGST,
            sgst: roundedSGST,
            isAnyInclusive,
            isAnyExclusive
        };
    }, [selectedServices, totalPrice, membershipDiscount, promoDiscount, platformSettings]);

    const { tax, finalPrice, cgst, sgst } = billingBreakdown;

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

    const handleRemovePromo = () => {
        setPromoDiscount(0);
        setIsPromoApplied(false);
        setCouponCode('');
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

        // Persist step and core IDs in URL
        const newParams = new URLSearchParams(searchParams);
        newParams.set('step', newStep);
        if (selectedStaff) {
            newParams.set('staffId', selectedStaff._id || selectedStaff.id);
        }
        navigate({ search: newParams.toString() }, { replace: true });
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
    const checkStylistAvailable = (staff, timeStr, duration) => {
        if (loadingAvailability || !selectedDate) return false;
        if (!staff) return false;

        // 1. Check Staff Specific Availability (Working Hours for that staff)
        const dayName = selectedDate.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const staffAvailability = staff.availability?.days?.[dayName] || [];

        // Convert timeStr (e.g. "10:30") to minutes from midnight
        const [h, m] = timeStr.split(':').map(Number);
        const slotStartInMinutes = h * 60 + m;
        const slotEndInMinutes = slotStartInMinutes + duration;

        // If staff has defined availability, they MUST be within one of their shifts
        if (staff.availability && staffAvailability.length > 0) {
            const isInShift = staffAvailability.some(shift => {
                const [sh, sm] = shift.start.split(':').map(Number);
                const [eh, em] = shift.end.split(':').map(Number);
                const shiftStart = sh * 60 + sm;
                const shiftEnd = eh * 60 + em;
                return slotStartInMinutes >= shiftStart && slotEndInMinutes <= shiftEnd;
            });
            if (!isInShift) return false;
        }

        // 2. Check overlap with existing bookings
        if (!availabilityData) return true;

        const start = new Date(selectedDate.date);
        start.setHours(h, m, 0, 0);
        const end = new Date(start.getTime() + duration * 60000);

        const isOverlap = availabilityData.bookings?.some(b => {
            const sid = b.staffId?._id || b.staffId?.id || b.staffId;
            if (String(sid) !== String(staff._id || staff.id)) return false;

            const bStart = new Date(b.appointmentDate || b.start);
            const bEnd = new Date(new Date(bStart).getTime() + (b.duration || 30) * 60000);

            if (isNaN(bStart.getTime()) || isNaN(bEnd.getTime())) return false;

            return (start < bEnd && end > bStart);
        });

        return !isOverlap;
    };

    // Calculate dynamic time slots based on availableSlots state
    const timeSlots = useMemo(() => {
        if (!selectedDate || !currentOutlet) return [];

        if (loadingAvailability) {
            return []; // Or show loading state
        }

        // Map the backend slots (strings) to the format expected by the UI
        return availableSlots.map(t => ({
            time: t,
            available: true
        }));
    }, [selectedDate, currentOutlet, loadingAvailability, availableSlots]);

    const finalGroups = useMemo(() => {
        const q = serviceSearch.toLowerCase().trim();
        const activeOid = currentOutlet?._id || currentOutlet?.id;

        let groups = (groupedServices || []).map(group => {
            const filteredGroupServices = group.services.filter(s => {
                // Status check - be lenient (only block if explicitly inactive)
                if (s.status === 'inactive') return false;

                // Outlet check: service must either be global or specifically mapped to current outlet
                if (activeOid && s.outletIds && s.outletIds.length > 0) {
                    const isAvailableAtOutlet = s.outletIds.some(id => String(id) === String(activeOid));
                    if (!isAvailableAtOutlet) return false;
                }

                // Gender match - be lenient (using appGender from useGender)
                const sG = String(s.gender || 'both').toLowerCase();
                const currentG = appGender ? appGender.toLowerCase() : null;
                const genderMatch = sG === 'both' || !currentG || sG === currentG || !s.gender;
                if (!genderMatch) return false;

                // Search match
                if (q && !s.name.toLowerCase().includes(q) && !group.name.toLowerCase().includes(q)) return false;

                return true;
            });

            return { ...group, services: filteredGroupServices };
        }).filter(group => group.services.length > 0);

        return groups;
    }, [groupedServices, serviceSearch, currentOutlet, appGender]);

    // Submit booking

    const mergeDateAndTime = (dateObj, timeStr) => {
        if (!dateObj || !timeStr) return dateObj;

        // Handle both "12:00" (24h) and "12:00 PM" (12h) formats
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier) {
            // 12-hour format logic
            if (hours === 12) hours = 0;
            if (modifier.toUpperCase() === 'PM') hours += 12;
        }
        // If no modifier, assume 24-hour format and keep hours as is

        const merged = new Date(dateObj);
        merged.setHours(hours, minutes, 0, 0);
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
                subtotal: Number(totalPrice || 0),
                membershipDiscount: Number(membershipDiscount || 0),
                promoDiscount: Number(promoDiscount || 0),
                tax: Number(tax || 0),
                totalPrice: Number(finalPrice || 0),
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
                    status: 'pending',
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
                    status: 'pending',
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

    // Loading state with a full-screen loader
    if (isLoading || authLoading) {
        return (
            <div style={{
                background: colors.bg,
                minHeight: '100svh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px'
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="w-10 h-10 text-[#C8956C]" />
                </motion.div>
                <p style={{ color: colors.textMuted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em' }}>
                    PREPARING YOUR EXPERIENCE
                </p>
            </div>
        );
    }

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
                        Booking Requested! 🎉
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
                    <div className="space-y-2 pt-4 border-t border-dashed border-black/10 dark:border-white/10 italic">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest opacity-40">
                            <span>{billingBreakdown.isAnyInclusive ? 'Subtotal (Incl. GST)' : 'Subtotal'}</span>
                            <span>₹{totalPrice.toLocaleString()}</span>
                        </div>
                        {membershipDiscount > 0 && (
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-[#C8956C]">
                                <span>Discount</span>
                                <span>- ₹{membershipDiscount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="space-y-1 py-1 border-t border-black/5 dark:border-white/5 opacity-60">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                <span>GST ({billingBreakdown.isAnyInclusive ? 'Included' : 'Excluding'})</span>
                                <span>{billingBreakdown.isAnyInclusive ? '' : '+ '}₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[9px] pl-2 font-medium italic opacity-60">
                                <span>CGST ({billingBreakdown.isAnyInclusive ? 'Included' : `${(platformSettings?.serviceGst || 18) / 2}%`})</span>
                                <span>{billingBreakdown.isAnyInclusive ? '' : '+ '}₹{cgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[9px] pl-2 font-medium italic opacity-60">
                                <span>SGST ({billingBreakdown.isAnyInclusive ? 'Included' : `${(platformSettings?.serviceGst || 18) / 2}%`})</span>
                                <span>{billingBreakdown.isAnyInclusive ? '' : '+ '}₹{sgst.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-base pt-2 uppercase font-black tracking-tighter">
                            <span style={{ color: colors.textMuted }}>Total Payable</span>
                            <span className="text-[#C8956C]">₹{finalPrice.toFixed(2)}</span>
                        </div>
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



    const styleOverride = (step === 1 || step === 2 || step === 3 || step === 4 || step === 5) ? {
        '--app-bg': '#FFFFFF',
        '--app-text': '#1A1A1A',
        '--app-text-muted': '#666666',
        '--app-border': 'rgba(0,0,0,0.1)',
        '--app-accent': '#B4912B',
    } : {};

    return (
        <div className="space-y-6 px-4 pb-32" style={{ background: colors.bg, minHeight: '100svh', ...styleOverride }}>
            {/* Back Button */}
            <div className="pt-4 flex items-center justify-between">
                <button
                    onClick={handleBack}
                    style={{ color: colors.textMuted, fontFamily: "'Poppins', sans-serif" }}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${(step === 1 || step === 2 || step === 3 || step === 4 || step === 5) ? 'hover:text-[#B4912B]' : 'hover:text-[#C8956C]'}`}
                >
                    <ArrowLeft className="w-4 h-4" /> {((isPreselected && step === 3 && isCustomerAuthenticated) || step === 0) ? 'Cancel' : 'Back'}
                </button>
                <div
                    className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono"
                    style={{ color: (step === 1 || step === 2 || step === 3 || step === 4 || step === 5) ? '#B4912B' : '#C8956C', fontFamily: "'Poppins', sans-serif" }}
                >
                    Step {virtualStep + 1}/{STEPS.length}
                </div>
            </div>

            {/* Step Indicator */}
            <div className="py-2">
                <StepIndicator currentStep={virtualStep} steps={STEPS} accentColor={(step === 1 || step === 2 || step === 3 || step === 4 || step === 5) ? '#B4912B' : '#C8956C'} />
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait" custom={direction}>
                {step === 0 && (
                    <motion.div
                        key="step-0"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {isCustomerAuthenticated ? (
                            <div className="space-y-6">
                                <div className="p-6 rounded-[2rem] bg-surface-alt/10 border border-[#C8956C]/20 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[#C8956C]/10 flex items-center justify-center border border-[#C8956C]/20">
                                            <User className="text-[#C8956C]" size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold uppercase tracking-widest text-[#C8956C]">Logged In Profile</p>
                                            <p className="text-lg font-bold text-text mt-0.5">{customer?.name}</p>
                                            <p className="text-xs text-text-muted mt-0.5">+91 {customer?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                                        <p className="text-[10px] text-text-muted font-medium">Not your account?</p>
                                        <button
                                            onClick={customerLogout}
                                            className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                                        >
                                            Switch Account
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => isPreselected ? goTo(3) : goTo(1)}
                                    style={{ backgroundColor: '#B4912B', color: '#000000' }}
                                    className="w-full py-3 rounded-[20px] text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-xl transition-all active:scale-[0.98]"
                                >
                                    Continue to {isPreselected ? 'Stylist' : 'Outlet'} <ArrowRight size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 text-left">
                                <div className="flex flex-col gap-0">
                                    <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                                        Customer <span className="text-[#C8956C]">Details</span>
                                    </h2>
                                    <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mt-1">Please enter your details to proceed</p>
                                </div>

                                {!otpSent ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Your Name</label>
                                            <input
                                                type="text"
                                                value={detailName}
                                                onChange={(e) => { setDetailName(e.target.value); setOtpError(''); }}
                                                placeholder="e.g. John Doe"
                                                className="w-full px-5 py-3.5 rounded-xl border border-border text-sm font-semibold focus:border-[#C8956C] outline-none transition-all bg-surface hover:border-[#C8956C]/40"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Mobile Number</label>
                                            <div className="relative flex items-center">
                                                <span className="absolute left-5 text-sm font-bold text-text-muted">+91</span>
                                                <input
                                                    type="tel"
                                                    maxLength={10}
                                                    value={detailPhone}
                                                    onChange={(e) => { setDetailPhone(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                                                    placeholder="9876543210"
                                                    className="w-full pl-14 pr-5 py-3.5 rounded-xl border border-[#C8956C]/20 focus:border-[#C8956C] hover:border-[#C8956C]/40 text-sm font-semibold outline-none transition-all bg-surface"
                                                />
                                            </div>
                                        </div>

                                        {otpError && (
                                            <p className="text-xs text-rose-500 font-semibold pl-1">{otpError}</p>
                                        )}

                                        <button
                                            onClick={handleSendOtp}
                                            disabled={otpLoading}
                                            style={{ backgroundColor: '#B4912B', color: '#000000' }}
                                            className="w-full py-3 rounded-[20px] text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl transition-all active:scale-[0.98] mt-4"
                                        >
                                            {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'} <ArrowRight size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-2xl bg-[#C8956C]/5 border border-[#C8956C]/10 text-center">
                                            <p className="text-xs font-semibold text-text-muted">OTP sent to +91 {detailPhone}</p>
                                            <button
                                                onClick={() => setOtpSent(false)}
                                                className="text-[10px] font-black uppercase text-[#C8956C] tracking-wider mt-1 hover:underline"
                                            >
                                                Change Number
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block text-center">Enter 4-Digit OTP</label>
                                            <div className="flex justify-center gap-4">
                                                {[0, 1, 2, 3].map((idx) => (
                                                    <input
                                                        key={idx}
                                                        ref={otpRefs[idx]}
                                                        type="text"
                                                        maxLength={1}
                                                        inputMode="numeric"
                                                        value={otpVal[idx]}
                                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                        onKeyDown={(e) => handleOtpKey(idx, e)}
                                                        className="w-12 h-14 rounded-xl border-2 border-border text-center text-xl font-bold focus:border-[#C8956C] outline-none bg-surface transition-all"
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {otpError && (
                                            <p className="text-xs text-rose-500 font-semibold text-center">{otpError}</p>
                                        )}

                                        <div className="text-center">
                                            {otpCd > 0 ? (
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Resend OTP in {otpCd}s</p>
                                            ) : (
                                                <button
                                                    onClick={handleSendOtp}
                                                    className="text-[10px] font-black uppercase text-[#C8956C] tracking-widest hover:underline"
                                                >
                                                    Resend OTP
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleVerifyOtp}
                                            disabled={otpLoading}
                                            style={{ backgroundColor: '#B4912B', color: '#000000' }}
                                            className="w-full py-3 rounded-[20px] text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl transition-all active:scale-[0.98]"
                                        >
                                            {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Continue'} <Check size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="step-1"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="space-y-6 text-left">
                            <div className="flex flex-col gap-0">
                                <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                                    Select <span className="text-[#C8956C]">Outlet</span>
                                </h2>
                                <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mt-1">Which branch would you like to visit?</p>
                            </div>

                            {/* Geolocation Button */}
                            <div className="p-5 rounded-3xl bg-surface-alt/10 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-left">
                                    <p className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                                        <MapPin className="text-[#C8956C]" size={14} /> Geolocation Helper
                                    </p>
                                    <p className="text-[10px] text-text-muted mt-0.5 font-medium leading-relaxed">
                                        Allow location to show outlets closest to your current location first.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={locLoading}
                                    className="px-5 py-2.5 bg-[#C8956C] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[#C8956C]/10 hover:shadow-[#C8956C]/20 active:scale-95 transition-all flex items-center gap-2 shrink-0"
                                >
                                    {locLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find Nearest'}
                                </button>
                            </div>

                            {locError && (
                                <p className="text-xs text-rose-500 font-semibold pl-1">{locError}</p>
                            )}

                            {/* Outlets Lists */}
                            <div className="space-y-6">
                                {userCoords && (
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-[#C8956C] uppercase tracking-[0.2em] pl-1">Nearest Outlets</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {outletsWithDistance
                                                .filter(o => o.distanceKm !== null)
                                                .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
                                                .map((o) => {
                                                    const isSelected = selectedOutlet && String(selectedOutlet._id || selectedOutlet.id) === String(o._id || o.id);
                                                    return (
                                                        <motion.button
                                                            key={o._id || o.id}
                                                            onClick={() => handleSelectOutlet(o)}
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
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23222222%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EWapixo%3C%2Ftext%3E%3C%2Fsvg%3E";
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-base font-bold text-text truncate">{o.name}</p>
                                                                <p className="text-[10px] text-text-muted truncate mt-0.5">{typeof o.address === 'string' ? o.address : (o.address?.street || o.city)}</p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="text-[8px] bg-[#C8956C]/10 text-[#C8956C] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                                                                        {o.distanceKm ? `${o.distanceKm.toFixed(1)} km away` : 'Branch'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {isSelected && <Check size={20} className="text-[#C8956C] shrink-0" />}
                                                        </motion.button>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">All Outlets</h3>
                                    <div className="grid grid-cols-1 gap-4 max-h-[40vh] overflow-y-auto no-scrollbar">
                                        {outlets.map((o) => {
                                            const isSelected = selectedOutlet && String(selectedOutlet._id || selectedOutlet.id) === String(o._id || o.id);
                                            return (
                                                <motion.button
                                                    key={o._id || o.id}
                                                    onClick={() => handleSelectOutlet(o)}
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
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23222222%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EWapixo%3C%2Ftext%3E%3C%2Fsvg%3E";
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-bold text-text truncate">{o.name}</p>
                                                        <p className="text-[10px] text-text-muted truncate mt-0.5">{typeof o.address === 'string' ? o.address : (o.address?.street || o.city)}</p>
                                                    </div>
                                                    {isSelected && <Check size={20} className="text-[#C8956C] shrink-0" />}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => goTo(2)}
                                disabled={!selectedOutlet}
                                style={{ backgroundColor: '#B4912B', color: '#000000' }}
                                className="w-full py-3 rounded-[20px] text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl transition-all active:scale-[0.98] mt-8"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step-2"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="space-y-6 text-left">
                            <div className="flex flex-col gap-0">
                                <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                                    Select <span className="text-[#B4912B]">Services</span>
                                </h2>
                                <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mt-1">Available at {selectedOutlet?.name}</p>
                            </div>

                            {/* Search bar */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[#B4912B]/5 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className={`relative flex items-center gap-3 border h-12 px-4 rounded-xl group-focus-within:border-[#B4912B]/50 transition-all ${isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-white/[0.03] border-white/[0.05]'}`}>
                                    <Search size={16} className={`${isLight ? 'text-neutral-400' : 'text-white/20'} group-focus-within:text-[#B4912B] transition-colors`} />
                                    <input
                                        type="text"
                                        placeholder="Search services..."
                                        value={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.value)}
                                        className={`w-full bg-transparent border-none outline-none text-sm placeholder:opacity-50 ${isLight ? 'text-neutral-900 placeholder:text-neutral-900' : 'text-white placeholder:text-white'}`}
                                    />
                                </div>
                            </div>

                            {/* Services Group List */}
                            <div className="space-y-6 max-h-[45vh] overflow-y-auto pr-1 no-scrollbar pb-4">
                                {finalGroups.length === 0 && (
                                    <div className="text-center py-12 opacity-50">
                                        <p className="text-sm font-bold uppercase tracking-widest text-text-muted">No services found</p>
                                    </div>
                                )}
                                {finalGroups.map((group) => (
                                    <div key={group._id || group.name} className="space-y-3">
                                        <h3 className="text-[10px] font-black text-[#C8956C] uppercase tracking-[0.2em] pl-1 border-b border-[#C8956C]/20 pb-1">{group.name}</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {group.services.map((svc) => {
                                                const isSelected = selectedServices.some(s => (s._id || s.id) === (svc._id || svc.id));
                                                return (
                                                    <div
                                                        key={svc._id || svc.id}
                                                        onClick={() => toggleService(svc)}
                                                        style={{
                                                            background: isSelected ? 'rgba(231,208,110,0.1)' : colors.card,
                                                            borderColor: isSelected ? '#B4912B' : colors.border
                                                        }}
                                                        className="p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:border-[#B4912B]/40"
                                                    >
                                                        <div className="text-left space-y-1">
                                                            <p className="text-sm font-bold" style={{ color: colors.text }}>{svc.name}</p>
                                                            <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest">
                                                                {svc.duration} min · ₹{svc.price} {svc.isInclusiveTax ? 'incl. GST' : '+ GST'}
                                                            </p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#B4912B] border-[#B4912B]' : 'border-border'}`}>
                                                            {isSelected && <Check size={12} color="black" strokeWidth={4} />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Floating Selection Bar */}
                            {selectedServices.length > 0 && (
                                <div className="p-4 rounded-2xl bg-[#B4912B]/10 border border-[#B4912B]/30 flex items-center justify-between mt-2 shadow-sm">
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase text-[#B4912B] tracking-widest">Selected Package</p>
                                        <p className="text-sm font-bold text-text mt-0.5">{selectedServices.length} Service(s) · ₹{totalPrice}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedServices([])}
                                        className="text-[9px] font-black uppercase text-rose-500 tracking-wider hover:underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => goTo(3)}
                                disabled={selectedServices.length === 0}
                                style={{ backgroundColor: '#B4912B', color: '#000000' }}
                                className="w-full py-3 rounded-[20px] text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl transition-all active:scale-[0.98] mt-4"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step-3"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="space-y-6 text-left">
                            <div className="flex flex-col gap-0">
                                <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                                    Choose <span className="text-[#B4912B]">Expert</span>
                                </h2>
                                <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mt-1">Available experts at {selectedOutlet?.name}</p>
                            </div>

                            {/* Stylist Grid */}
                            <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto no-scrollbar pb-2">
                                {outletStaff.length === 0 && (
                                    <div className="text-center py-16 px-6">
                                        <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <User size={24} className="opacity-20" />
                                        </div>
                                        <p className="text-sm font-bold opacity-50 mb-2">No experts found</p>
                                        <p className="text-[10px] opacity-30 font-medium uppercase tracking-widest">Please assign staff in the admin panel.</p>
                                    </div>
                                )}
                                {outletStaff.map((s, i) => {
                                    const sid = s._id || s.id;
                                    const isSelected = !!selectedStaff && String(selectedStaff._id || selectedStaff.id) === String(sid);
                                    return (
                                        <motion.button
                                            key={sid || i}
                                            onClick={() => setSelectedStaff(s)}
                                            style={{
                                                background: isSelected ? 'rgba(231,208,110,0.1)' : colors.card,
                                                borderColor: isSelected ? '#B4912B' : colors.border
                                            }}
                                            className="w-full flex items-center gap-3.5 p-3 px-4 rounded-2xl border-2 transition-all shadow-sm"
                                        >
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                                {s.image ? (
                                                    <img src={getImageUrl(s.image)} alt={s.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-[#B4912B] text-base bg-[#B4912B]/5">
                                                        {s.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="text-sm font-bold" style={{ color: colors.text }}>{s.name}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-[#B4912B] mt-0.5">{s.role || 'Expert'}</p>
                                            </div>
                                            {isSelected && <Check size={18} className="text-[#B4912B] flex-shrink-0" />}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => goTo(4)}
                                disabled={!selectedStaff}
                                style={{ backgroundColor: '#B4912B', color: '#000000' }}
                                className="w-full py-3 rounded-[20px] text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl transition-all active:scale-[0.98]"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
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
                        <h2 className="text-xl font-bold uppercase tracking-tight text-left" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                            Select <span className="text-[#B4912B]">Timeline</span>
                        </h2>

                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.text }}>{currentMonthLabel}</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrevMonth}
                                    style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                                    className="p-2 rounded-xl hover:text-[#B4912B] transition-colors"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={handleNextMonth}
                                    style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                                    className="p-2 rounded-xl hover:text-[#B4912B] transition-colors"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 p-4 rounded-3xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                                <div key={idx} className="h-8 flex items-center justify-center text-[9px] font-black opacity-30 uppercase tracking-widest" style={{ color: colors.text }}>
                                    {d}
                                </div>
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
                                            background: isSelected ? '#B4912B' : 'transparent',
                                            color: isSelected ? '#000000' : colors.text,
                                            position: 'relative'
                                        }}
                                        className={`h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${!canSelect ? 'opacity-20' : 'active:scale-95 hover:bg-[#B4912B]/10'}`}
                                    >
                                        {d.dayNum}
                                        {d.isToday && !isSelected && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '4px',
                                                width: '3px',
                                                height: '3px',
                                                borderRadius: '50%',
                                                background: '#B4912B'
                                            }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-4 text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: colors.text }}>Available Slots</p>

                            {selectedDate ? (
                                <div className="grid grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                                    {timeSlots.filter(slot => slot.available).map((slot, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedTime(slot.time)}
                                            style={{
                                                background: selectedTime === slot.time ? '#B4912B' : colors.card,
                                                borderColor: selectedTime === slot.time ? '#B4912B' : colors.border,
                                                color: selectedTime === slot.time ? '#000000' : colors.text,
                                            }}
                                            className={`py-3 rounded-2xl border text-[11px] font-bold transition-all ${selectedTime === slot.time ? 'shadow-lg shadow-[#B4912B]/20' : ''}`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                    {timeSlots.filter(slot => slot.available).length === 0 && (
                                        <div className="col-span-3 py-8 text-center opacity-40 text-[10px] font-bold uppercase tracking-widest">
                                            No slots available for this day
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-8 text-center border-2 border-dashed rounded-3xl opacity-20" style={{ borderColor: colors.border }}>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Select a date to view slots</p>
                                </div>
                            )}
                        </div>

                        {selectedDate && selectedTime && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="pt-6 animate-fade-in"
                            >
                                <button
                                    onClick={() => goTo(5)}
                                    style={{ backgroundColor: '#B4912B', color: '#000000' }}
                                    className="w-full py-3 rounded-[20px] text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] transition-all"
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
                        <h2 className="text-xl font-bold uppercase tracking-tight text-left" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                            Confirm & <span className="text-[#B4912B]">Book</span>
                        </h2>

                        <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-[2rem] p-6 space-y-6 shadow-sm text-left">
                            {/* Services List / Cart */}
                            <div className="space-y-3 pb-6 border-b border-black/5 dark:border-white/5">
                                {selectedServices.map((svc) => (
                                    <div key={svc.id || svc._id || svc.name} className="flex items-center gap-0">
                                        <div style={{ fontFamily: "'Poppins', sans-serif" }}>
                                            <h3 className="text-sm font-bold uppercase tracking-tight" style={{ color: colors.text }}>{svc.name}</h3>
                                            <p className="text-[8px] font-black uppercase tracking-widest mt-0.5 opacity-40" style={{ color: colors.textMuted }}>{svc.category} · {svc.duration} MIN</p>
                                        </div>
                                        <div className="ml-auto text-[11px] font-bold text-[#C8956C] flex flex-col items-end" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                            <span>₹{svc.price}</span>
                                            <span className="text-[7px] font-bold text-text-muted uppercase tracking-tighter opacity-60">
                                                {svc.isInclusiveTax ? 'incl. GST' : '+ GST'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Timeline & details */}
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
                                    <span style={{ color: colors.textMuted }}>Outlet</span>
                                    <span style={{ color: colors.text }}>{selectedOutlet?.name || 'Not selected'}</span>
                                </div>
                            </div>

                            {activeMembership && membershipDiscount > 0 && (
                                <div
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
                                </div>
                            )}

                            {/* Coupon / Promo Code Section */}
                            <div className="pt-2 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-50" style={{ color: colors.text }}>Promo Code</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="ENTER COUPON CODE"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={isPromoApplied}
                                        className="flex-1 px-4 py-3 rounded-2xl border text-xs font-bold tracking-wider uppercase focus:border-[#C8956C] outline-none transition-all"
                                        style={{
                                            background: colors.card,
                                            borderColor: isPromoApplied ? '#22c55e' : colors.border,
                                            color: colors.text
                                        }}
                                    />
                                    {isPromoApplied ? (
                                        <button
                                            type="button"
                                            onClick={handleRemovePromo}
                                            className="px-5 py-3 rounded-2xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all border border-rose-500/20 active:scale-95"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => applyPromo()}
                                            disabled={!couponCode.trim()}
                                            style={{ backgroundColor: '#B4912B', color: '#000000' }}
                                            className="px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all disabled:opacity-20 active:scale-95"
                                        >
                                            Apply
                                        </button>
                                    )}
                                </div>
                                {isPromoApplied && (
                                    <p className="text-xs font-bold text-green-500 flex items-center gap-1.5 mt-2 animate-bounce">
                                        <Check size={14} className="stroke-[3]" /> Coupon applied! You saved ₹{promoDiscount}
                                    </p>
                                )}
                            </div>

                            {/* Payment Method Selection */}
                            <div className="pt-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-3 opacity-50" style={{ color: colors.text }}>Payment Method</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod('salon')}
                                        className="p-4 rounded-2xl border transition-all text-left relative overflow-hidden"
                                        style={{
                                            borderColor: paymentMethod === 'salon' ? '#B4912B' : colors.border,
                                            background: paymentMethod === 'salon' ? 'rgba(231, 208, 110, 0.1)' : 'transparent'
                                        }}
                                    >
                                        <div className="relative z-10">
                                            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: paymentMethod === 'salon' ? '#B4912B' : colors.textMuted }}>Pay at Salon</p>
                                            <p className="text-[7px] font-medium mt-0.5 opacity-40 uppercase tracking-wider" style={{ color: colors.text }}>In-store payment</p>
                                        </div>
                                        {paymentMethod === 'salon' && (
                                            <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#B4912B] flex items-center justify-center">
                                                <Check size={8} color="black" strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('wallet')}
                                        className="p-4 rounded-2xl border transition-all text-left relative overflow-hidden"
                                        style={{
                                            borderColor: paymentMethod === 'wallet' ? '#B4912B' : colors.border,
                                            background: paymentMethod === 'wallet' ? 'rgba(231, 208, 110, 0.1)' : 'transparent'
                                        }}
                                    >
                                        <div className="relative z-10">
                                            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: paymentMethod === 'wallet' ? '#B4912B' : colors.textMuted }}>Digital Wallet</p>
                                            <p className="text-[7px] font-medium mt-0.5 opacity-40 uppercase tracking-wider" style={{ color: colors.text }}>Bal: ₹{balance?.toFixed(0)}</p>
                                        </div>
                                        {paymentMethod === 'wallet' && (
                                            <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#B4912B] flex items-center justify-center">
                                                <Check size={8} color="black" strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Billing totals */}
                            <div className="space-y-2 pt-4 border-t border-dashed border-black/10 dark:border-white/10 uppercase font-black tracking-tight">
                                <div className="flex justify-between items-center opacity-40 text-xs">
                                    <span style={{ color: colors.text }}>{billingBreakdown.isAnyInclusive ? 'Subtotal (Incl. GST)' : 'Subtotal'}</span>
                                    <span style={{ color: colors.text }}>₹{totalPrice.toLocaleString()}</span>
                                </div>
                                {membershipDiscount > 0 && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[#C8956C]">
                                            Membership ({(activeMembership?.planId || activeMembership?.plan)?.name})
                                            <span className="ml-2 px-1 py-0.5 rounded bg-[#C8956C]/10 border border-[#C8956C]/20 text-[8px] font-black">
                                                {(activeMembership?.planId || activeMembership?.plan)?.serviceDiscountValue}
                                                {(activeMembership?.planId || activeMembership?.plan)?.serviceDiscountType === 'percentage' ? '%' : '₹'} OFF
                                            </span>
                                        </span>
                                        <span className="text-[#C8956C]">- ₹{membershipDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-green-500">Promo Discount</span>
                                        <span className="text-green-500">- ₹{promoDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="space-y-1 py-1 border-t border-black/5 dark:border-white/5 opacity-60">
                                    <div className="flex justify-between items-center text-xs">
                                        <span style={{ color: colors.text }}>GST ({billingBreakdown.isAnyInclusive ? 'Included' : 'Excluding'})</span>
                                        <span style={{ color: colors.text }}>{billingBreakdown.isAnyInclusive ? '' : '+ '}₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] pl-2 font-medium italic opacity-60">
                                        <span>CGST ({billingBreakdown.isAnyInclusive ? 'Included' : `${(platformSettings?.serviceGst || 18) / 2}%`})</span>
                                        <span>{billingBreakdown.isAnyInclusive ? '' : '+ '}₹{cgst.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] pl-2 font-medium italic opacity-60">
                                        <span>SGST ({billingBreakdown.isAnyInclusive ? 'Included' : `${(platformSettings?.serviceGst || 18) / 2}%`})</span>
                                        <span>{billingBreakdown.isAnyInclusive ? '' : '+ '}₹{sgst.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-2xl pt-2">
                                    <span style={{ color: colors.textMuted }}>Total</span>
                                    <span className="text-[#B4912B] px-1">₹{finalPrice.toFixed(2)}</span>
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
                            style={{ backgroundColor: '#B4912B', color: '#000000' }}
                            className="w-full py-3 rounded-[20px] text-[12px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:opacity-90 active:scale-95 transition-all mt-4"
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
                )}
            </AnimatePresence >
        </div >
    );
}
