import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useGender } from '../../contexts/GenderContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, SlidersHorizontal, Heart, Star, ArrowRight, ShieldCheck, Ticket, Crown, Gift, Zap,
    Moon, Bell, Sun, Search, Clock, RefreshCw, Camera, MessageSquare, ExternalLink, Wallet, Scissors, LayoutGrid, Tag, DoorClosed, Armchair
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useWallet } from '../../contexts/WalletContext';
import { useCMS } from '../../contexts/CMSContext';
import homeData from '../../data/appHomeData.json';
import mockServicesPageData from '../../data/mockServicesPageData.json';
import api from '../../services/mock/mockApi';
import logoLightMode from '/new black wapixo logo .png';
import logoDarkMode from '/new wapixo logo .png';
import boyIcon from '/gender/boy.png';
import girlIcon from '/gender/girl.png';
import SalonMapView from '../../components/app/SalonMapView';

const { PLACEHOLDERS } = homeData;

const ServiceCard = ({ service, onBook, colors, isLight }) => {
    const fallbackImage = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop";
    
    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            style={{
                background: colors.card,
                borderRadius: '24px',
                border: `1.5px solid ${colors.border}`,
                boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.02)' : '0 10px 30px rgba(0,0,0,0.2)'
            }}
            className="group overflow-hidden flex flex-col h-full"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                    src={service.image || fallbackImage}
                    alt={service.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm font-black uppercase text-[8px] tracking-tighter">
                        <Clock size={10} className="text-[#C8956C]" />
                        <span>{service.duration}m</span>
                    </div>
                    {service.resourceType && (
                        <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm font-black uppercase text-[8px] tracking-tighter">
                            {service.resourceType === 'room' ? <DoorClosed size={10} className="text-[#C8956C]" /> : <Armchair size={10} className="text-[#C8956C]" />}
                            <span>{service.resourceType}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-3 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#C8956C]">{service.category}</span>
                    <div className="flex items-center gap-0.5">
                        <Star size={8} fill="#C8956C" color="#C8956C" />
                        <span className="text-[9px] font-bold">4.9</span>
                    </div>
                </div>

                <h3 className="text-[13px] font-bold mb-0.5 line-clamp-1" style={{ color: colors.text }}>{service.name}</h3>
                <p className="text-[10px] mb-3 line-clamp-2 leading-tight" style={{ color: colors.textMuted }}>{service.description || "Premium salon service for your beauty and wellness."}</p>

                <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                        <span className="text-[8px] opacity-40 font-bold uppercase tracking-tighter">Starts from</span>
                        <span className="text-sm font-black text-[#C8956C]">₹{service.price}</span>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onBook(service._id || service.id)}
                        style={{
                            background: '#C8956C',
                            borderRadius: '12px 4px 12px 4px',
                            boxShadow: '0 6px 12px rgba(200,149,108,0.2)'
                        }}
                        className="px-3.5 py-1.5 text-white text-[9px] font-black uppercase tracking-wider"
                    >
                        Book
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

function HeartBtn({ size = 20 }) {
    const [liked, setLiked] = useState(false);
    return (
        <motion.button
            whileTap={{ scale: 0.75 }}
            onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
        >
            <Heart size={size} strokeWidth={2}
                color={liked ? '#e53e3e' : 'rgba(255,255,255,0.55)'}
                fill={liked ? '#e53e3e' : 'none'}
            />
        </motion.button>
    );
}

function StarRow({ rating }) {
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={11} fill="#C8956C" color="#C8956C" />
            <span style={{ fontSize: '11px', color: '#C8956C', fontWeight: 600 }}>{rating}</span>
        </span>
    );
}

const Particle = ({ i }) => {
    const size = Math.random() * 3 + 1;
    return (
        <motion.div
            initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
            }}
            animate={{
                y: [null, Math.random() * -100 - 50],
                opacity: [0, 0.6, 0]
            }}
            transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
            }}
            style={{
                position: 'fixed',
                width: size,
                height: size,
                background: '#C8956C',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 1001,
            }}
        />
    );
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } } };

export default function AppHomePage() {
    const { customer } = useCustomerAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { gender, setGender } = useGender();
    const { theme, colors, isLight } = useCustomerTheme();
    const { activeOutlet, activeOutletId, outlets, setActiveOutletId, services, categories: businessCategories } = useBusiness();
    const { bookings } = useBookingRegistry();
    const { shopCategories, products } = useInventory();
    const { balance, initializeWallet } = useWallet();
    const { banners, lookbook: cmsLookbook, experts } = useCMS();
    const { isInitializing, fetchCustomerInitialData } = useBusiness();

    // ── PULL TO REFRESH LOGIC ──
    const [pullDistance, setPullDistance] = useState(0);
    const [isPulling, setIsPulling] = useState(false);
    const touchStart = useRef(0);
    const pullThreshold = 75;

    useEffect(() => {
        const handleTouchStart = (e) => {
            if (window.scrollY === 0) {
                touchStart.current = e.touches[0].clientY;
            } else {
                touchStart.current = 0;
            }
        };

        const handleTouchMove = (e) => {
            if (touchStart.current === 0) return;
            const touchY = e.touches[0].clientY;
            const delta = touchY - touchStart.current;

            if (delta > 0 && window.scrollY === 0) {
                setIsPulling(true);
                // Apply rubber-band resistance
                const distance = Math.pow(delta, 0.8);
                setPullDistance(Math.min(distance, 120));
                
                // Prevent browser default scroll-down (important for mobile)
                if (delta > 10 && e.cancelable) e.preventDefault();
            }
        };

        const handleTouchEnd = async () => {
            if (!isPulling) return;
            
            if (pullDistance >= pullThreshold) {
                // Trigger Refresh
                try {
                    await fetchCustomerInitialData(true);
                } catch (e) {
                    console.error('Refresh failed:', e);
                }
            }
            
            // Animate back
            setPullDistance(0);
            setIsPulling(false);
            touchStart.current = 0;
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isPulling, pullDistance, fetchCustomerInitialData]);

    const [reviews, setReviews] = useState([]);
    const [couponOffers, setCouponOffers] = useState([]);
    const [membershipPlans, setMembershipPlans] = useState([]);
    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

    // ── FETCH DYNAMIC REVIEWS ──
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await api.get('/feedbacks?status=Approved');
                if (res.data?.success) {
                    setReviews(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            }
        };
        fetchReviews();
    }, []);

    // Fallback if gender is null
    const g = (gender === 'men' || gender === 'women') ? gender : 'women';

    // Only show approved experts for this outlet
    // Only show approved STYLISTS for this particular outlet
    const approvedExperts = experts.filter(e => 
        e.status === 'Approved' && 
        (e.role === 'stylist' || !e.role || e.role === 'Hair Stylist') && // Filter out admin/manager etc.
        e.outletId === activeOutletId
    );

    const displayExperts = approvedExperts;

    const lastBooking = bookings.length > 0 ? bookings[0] : null;

    const [showWelcome, setShowWelcome] = useState(location.state?.justLoggedIn || false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [showExpertModal, setShowExpertModal] = useState(false);

    const [isMapView, setIsMapView] = useState(false);
    const [referralReward, setReferralReward] = useState(200);
    const [rotations, setRotations] = useState({});

    // Loyalty card is backend-driven via WalletContext balance.
    const nextRewardPoints = 3000;
    const currentPoints = Math.max(0, Number(balance || 0));
    const rewardProgressPct = Math.max(0, Math.min(100, Math.round((currentPoints / nextRewardPoints) * 100)));



    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % (PLACEHOLDERS?.length || 1));
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    // Exclusive offers (Promo Codes) should come from backend (activationMode=COUPON)
    useEffect(() => {
        let cancelled = false;
        const loadOffers = async () => {
            const fallbackOffers = [
                { id: 'mock1', subtitle: 'On your first service', discount: '₹200 Cashback', code: 'WELCOME200', hasCouponCode: true },
                { id: 'mock2', subtitle: 'Treat yourself!', discount: 'Gift Voucher Worth ₹500', code: 'BDAYLOVE', hasCouponCode: true }
            ];

            if (!customer?._id) {
                setCouponOffers(fallbackOffers);
                return;
            }
            try {
                const res = await api.get('/promotions/active', {
                    params: { _t: Date.now() },
                });
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res?.data?.data)
                        ? res.data.data
                        : Array.isArray(res?.data?.results)
                            ? res.data.results
                            : [];

                const coupons = list
                    .slice(0, 6)
                    .map((p) => {
                        const couponRaw = p.couponCode ?? p.coupon_code ?? p.code;
                        const hasCouponCode = Boolean(couponRaw);
                        const code = hasCouponCode
                            ? String(couponRaw).trim().toUpperCase().replace(/\s+/g, '')
                            : 'AUTO';
                        let discount = p.name || code;
                        const promoType = String(p.type ?? '').toUpperCase();
                        if (promoType === 'PERCENTAGE') discount = `Flat ${p.value}% OFF`;
                        else if (promoType === 'FLAT') discount = `₹${p.value} OFF`;
                        else if (promoType === 'COMBO') discount = 'Combo Deal';

                        let subtitle = 'Limited time offer';
                        if (p.startTime && p.endTime) {
                            subtitle = `${p.startTime} - ${p.endTime}`;
                        } else if (p.startDate && p.endDate) {
                            const s = new Date(p.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                            const e = new Date(p.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                            subtitle = `Valid ${s} - ${e}`;
                        }

                        return {
                            id: String(p._id || code),
                            subtitle,
                            discount,
                            code,
                            hasCouponCode,
                        };
                    });

                if (!cancelled) {
                    setCouponOffers(coupons.length > 0 ? coupons : fallbackOffers);
                }
            } catch {
                if (!cancelled) setCouponOffers(fallbackOffers);
            }
        };

        loadOffers();
        return () => {
            cancelled = true;
        };
    }, [customer?._id]);

    useEffect(() => {
        if (showWelcome) {
            const timer = setTimeout(() => setShowWelcome(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [showWelcome]);

    useEffect(() => {
        if (customer?._id) {
            initializeWallet(customer._id);
        }
    }, [customer?._id]);

    useEffect(() => {
        let cancelled = false;
        const loadMembershipPlans = async () => {
            try {
                const res = await api.get('/loyalty/membership-plans');
                const list = res?.data?.data || res?.data || [];
                const rows = Array.isArray(list) ? list : [];
                const mapped = rows
                    .filter((p) => p?.isActive !== false)
                    .map((p) => ({
                        id: p._id || p.id,
                        name: p.name || 'Membership',
                        price: Number(p.price || 0),
                        duration: Number(p.duration || 30),
                        benefits: Array.isArray(p.benefits) ? p.benefits : [],
                        gradient: p.gradient || '',
                        icon: p.icon || 'star',
                        isPopular: !!p.isPopular,
                    }));
                if (!cancelled) setMembershipPlans(mapped);
            } catch {
                if (!cancelled) setMembershipPlans([]);
            }
        };

        loadMembershipPlans();

        const loadReferralSettings = async () => {
            if (!customer?._id) return;
            try {
                const res = await api.get('/loyalty/referral-settings');
                if (!cancelled && res?.data?.success) {
                    setReferralReward(res.data.data.referrerReward || 200);
                }
            } catch (err) {
                console.error('Error loading referral settings:', err);
            }
        };

        loadReferralSettings();

        return () => {
            cancelled = true;
        };
    }, [customer?._id]);


    const filteredPopularServices = useMemo(() => {
        return (services || []).filter(s => {
            // Filter by outlet (Multi-outlet support)
            if (s.outletIds && Array.isArray(s.outletIds) && s.outletIds.length > 0) {
                if (!s.outletIds.map(id => String(id)).includes(String(activeOutletId))) return false;
            } else if (s.outletId && s.outletId !== 'all' && String(s.outletId) !== String(activeOutletId)) {
                // Legacy support for singular outletId
                return false;
            }

            // Filter by gender
            const cat = businessCategories.find(c => c.name === s.category);
            if (!cat) return true;
            if (!g) return true;
            return cat.gender === 'both' || cat.gender === g;
        }).slice(0, 6);
    }, [activeOutletId, services, g, businessCategories]);

    const filteredMembershipPlans = useMemo(() => {
        return membershipPlans;
    }, [membershipPlans]);

    const filteredShopCategories = useMemo(() => {
        if (!shopCategories || shopCategories.length === 0) return [];
        
        // Debugging logs (User can see this in console if they look)
        console.log(`[AppHomePage] Categories: ${shopCategories.length}, Products: ${products.length}, Gender: ${g}`);

        // If products are not yet loaded, show all categories for that tenant as a fallback
        if (!products || products.length === 0) return shopCategories;

        return shopCategories.filter(cat => {
            const catNameLower = String(cat.name || '').toLowerCase().trim();
            const catIdStr = String(cat.id || '');

            // A category should show if it has at least one product matching the gender
            const matchingProducts = products.filter(p => {
                const pCatLower = String(p.category || '').toLowerCase().trim();
                const pAppCatStr = String(p.appCategory || '');
                
                const isMatch = (pAppCatStr === catIdStr || pCatLower === catNameLower);
                return isMatch && (p.gender === 'all' || p.gender === g);
            });
            
            return matchingProducts.length > 0;
        });
    }, [shopCategories, products, g]);

    /** Hero carousel = App CMS **Banners** tab only (no POS/coupon promos, no lookbook — those have their own UI below). */
    const filteredPromos = useMemo(() => {
        return banners
            .filter((p) => p.status === 'Active' && (p.gender === 'all' || p.gender === g))
            .map((p) => {
                const validity = (p.validityText && String(p.validityText).trim())
                    || (p.tag && String(p.tag).trim())
                    || (p.description && String(p.description).trim());
                return {
                    id: `banner-${p.id}`,
                    title: p.title,
                    subtitle: validity ? validity.toUpperCase() : 'EXCLUSIVE OFFER',
                    img: p.image,
                    btnText: (p.btnText && String(p.btnText).trim()) || 'Apply',
                    link: p.link || '/app/book',
                    isCmsBanner: true,
                };
            });
    }, [banners, g]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentPromoIndex(prev => (filteredPromos.length > 0 ? (prev + 1) % filteredPromos.length : 0));
        }, 5000);
        return () => clearInterval(timer);
    }, [filteredPromos.length, g]);

    // Reset index when gender changes
    useEffect(() => {
        setCurrentPromoIndex(0);
    }, [g]);

    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            <style>{`
                .search-input::placeholder {
                    color: ${isLight ? '#555' : 'rgba(255,255,255,0.6)'};
                    opacity: 0.8;
                }
            `}</style>
            <AnimatePresence>
                {showWelcome && (
                    <motion.div
                        key="premium-welcome-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 2000,
                            background: '#0a0a0a',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Dynamic Background */}
                        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    x: [0, 50, 0],
                                    y: [0, -30, 0]
                                }}
                                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute', width: '600px', height: '600px',
                                    background: 'radial-gradient(circle, rgba(200,149,108,0.12) 0%, transparent 70%)',
                                    filter: 'blur(80px)', top: '-10%', left: '-10%'
                                }}
                            />
                            <motion.div
                                animate={{
                                    scale: [1.3, 1, 1.3],
                                    x: [0, -40, 0],
                                    y: [0, 40, 0]
                                }}
                                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute', width: '700px', height: '700px',
                                    background: 'radial-gradient(circle, rgba(160,104,68,0.08) 0%, transparent 70%)',
                                    filter: 'blur(100px)', bottom: '-15%', right: '-15%'
                                }}
                            />
                        </div>

                        {/* Particles */}
                        {[...Array(15)].map((_, i) => <Particle key={i} i={i} />)}

                        {/* Main Content Card */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                textAlign: 'center',
                                zIndex: 20,
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            {/* Sophisticated Icon Container */}
                            <motion.div
                                initial={{ rotate: -15, scale: 0.5, opacity: 0 }}
                                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 15 }}
                                style={{ position: 'relative', marginBottom: '40px' }}
                            >
                                <div style={{
                                    width: '140px',
                                    height: '140px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    <img
                                        src={logoDarkMode}
                                        alt="Logo"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />

                                    {/* Ambient Glow */}
                                    <motion.div
                                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        style={{
                                            position: 'absolute',
                                            inset: -10,
                                            background: 'radial-gradient(circle, rgba(200,149,108,0.3) 0%, transparent 70%)',
                                            zIndex: -1
                                        }}
                                    />
                                </div>
                            </motion.div>

                            {/* Text Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                            >
                                <motion.span
                                    initial={{ letterSpacing: '0.2em', opacity: 0 }}
                                    animate={{ letterSpacing: '0.5em', opacity: 0.8 }}
                                    transition={{ delay: 0.8, duration: 1.5, ease: 'easeOut' }}
                                    style={{
                                        display: 'block',
                                        color: '#C8956C',
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        marginBottom: '12px',
                                        fontFamily: "'SF Pro Text', sans-serif"
                                    }}
                                >
                                    Experience The Ritual
                                </motion.span>

                                <h1 style={{
                                    fontSize: '52px',
                                    fontWeight: 900,
                                    margin: 0,
                                    color: '#FFFFFF',
                                    fontFamily: "'SF Pro Display', sans-serif",
                                    letterSpacing: '-0.03em',
                                    lineHeight: 1,
                                    fontStyle: 'italic',
                                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'
                                }}>
                                    {customer?.name?.split(' ')[0] || 'Guest'}
                                </h1>

                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 120, opacity: 1 }}
                                    transition={{ delay: 1.2, duration: 1.2, ease: 'easeInOut' }}
                                    style={{
                                        height: '1px',
                                        background: 'linear-gradient(90deg, transparent, #C8956C, #A06844, transparent)',
                                        margin: '24px auto',
                                        boxShadow: '0 0 10px rgba(200,149,108,0.3)'
                                    }}
                                />

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5, duration: 1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}
                                >
                                    <ShieldCheck size={14} />
                                    <span>Verified Premium Member</span>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Subtle Loader */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2, duration: 1 }}
                            style={{
                                position: 'absolute',
                                bottom: '60px',
                                width: '200px',
                                height: '2px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '1px',
                                overflow: 'hidden'
                            }}
                        >
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    width: '100px',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, #C8956C, transparent)'
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                style={{
                    background: colors.bg,
                    minHeight: '100svh',
                    color: colors.text,
                    filter: showWelcome ? 'blur(10px) brightness(0.5)' : 'none',
                    scale: showWelcome ? 0.98 : 1,
                    transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                <motion.div
                    variants={fadeUp}
                    style={{
                        padding: '16px 16px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/app/salon/${activeOutletId}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            background: isLight ? '#FFF' : '#242424',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            border: `1px solid ${colors.border}`
                        }}>
                            <MapPin size={18} color="#C8956C" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <p style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Selection</p>
                                <ExternalLink size={10} color={colors.textMuted} />
                            </div>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: colors.text, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {activeOutlet?.name || 'Wapixo Salon'}
                                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '12px' }}>📍</motion.span>
                            </h3>
                        </div>
                    </motion.div>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMapView(!isMapView)}
                        style={{
                            background: isMapView ? '#C8956C' : (isLight ? '#FFF' : '#242424'),
                            color: isMapView ? '#FFF' : colors.text,
                            padding: '8px 12px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: `1.5px solid ${isMapView ? '#C8956C' : colors.border}`,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                    >
                        {isMapView ? 'List View' : 'Map View'}
                    </motion.button>
                </motion.div>

                {/* ── SEARCH BAR ── */}
                <motion.div variants={fadeUp} style={{ padding: '10px 16px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div
                        style={{
                            flex: 1,
                            background: isLight
                                ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                                : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                            boxShadow: isLight
                                ? 'inset 0 1px 3px rgba(0,0,0,0.03)'
                                : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                            borderRadius: '20px 6px 20px 6px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 14px',
                            height: '42px',
                            gap: '10px',
                            border: isFocused ? `1.5px solid ${colors.accent}` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        <Search size={18} color={isFocused ? colors.accent : (isLight ? '#444' : 'rgba(255,255,255,0.7)')} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder={isFocused ? "" : (PLACEHOLDERS?.[placeholderIndex] || "Search...")}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: isLight ? '#000' : '#FFF',
                                fontSize: '14px',
                                width: '100%',
                                height: '100%',
                                fontWeight: 500
                            }}
                        />
                    </div>
                </motion.div>

                {/* ── GENDER TABS ── */}
                <motion.div variants={fadeUp} style={{ padding: '0 16px 12px', display: 'flex', gap: '0', borderBottom: `1px solid ${colors.border}` }}>
                    {['men', 'women'].map((tab) => (
                        <motion.button
                            key={tab}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setGender(tab)}
                            style={{
                                flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '15px', fontWeight: g === tab ? 700 : 400,
                                color: g === tab ? (isLight ? '#000' : '#fff') : colors.textMuted,
                                transition: 'all 0.2s', textTransform: 'capitalize',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                position: 'relative'
                            }}
                        >
                            <img
                                src={tab === 'men' ? boyIcon : girlIcon}
                                alt={tab}
                                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                            />
                            {tab === 'men' ? 'Men' : 'Women'}
                            {g === tab && (
                                <motion.div
                                    layoutId="genderUnderline"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    style={{
                                        position: 'absolute', bottom: '-1px', left: '15%', right: '15%', height: '3px', background: '#C8956C', borderRadius: '4px',
                                        zIndex: 1
                                    }}
                                />
                            )}
                        </motion.button>
                    ))}
                </motion.div>

                {/* ── PROMO BANNER (CAROUSEL) ── */}
                <motion.div variants={fadeUp} style={{ padding: '20px 16px 0', position: 'relative' }}>
                    <div style={{ position: 'relative', height: '170px', borderRadius: '24px', overflow: 'hidden' }}>
                        <AnimatePresence mode="wait">
                            {filteredPromos.length > 0 ? (
                                <motion.div
                                    key={`${g}-${currentPromoIndex}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    onClick={() => {
                                        const current = filteredPromos[currentPromoIndex];
                                        if (current?.isLookbook) {
                                            navigate(`/app/salon/${activeOutletId}`, { state: { activeTab: 'Lookbook' } });
                                        } else if (current?.couponCode) {
                                            navigate('/app/book', { state: { promoCode: current.couponCode } });
                                        } else {
                                            navigate(current?.link || '/app/book');
                                        }
                                    }}
                                    style={{
                                        position: 'absolute', inset: 0, cursor: 'pointer',
                                        background: 'linear-gradient(135deg, #1a120c 0%, #2d2118 50%, #0d0805 100%)',
                                        display: 'flex', alignItems: 'flex-end',
                                    }}
                                >
                                    {filteredPromos[currentPromoIndex]?.img ? (
                                        <img
                                            src={filteredPromos[currentPromoIndex].img}
                                            alt="Promo"
                                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, borderRadius: '24px' }}
                                        />
                                    ) : null}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(12,8,5,0.92) 0%, rgba(12,8,5,0.75) 42%, rgba(12,8,5,0.25) 100%)', borderRadius: '24px' }} />
                                    <div style={{ position: 'relative', padding: '20px', zIndex: 2, width: '100%' }}>
                                        <p style={{ fontSize: '10px', color: '#C8956C', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800 }}>
                                            {filteredPromos[currentPromoIndex]?.subtitle}
                                        </p>
                                        <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 14px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                                            {filteredPromos[currentPromoIndex]?.title?.split('\n').map((l, i) => (<span key={i}>{l}{i === 0 && <br />}</span>))}
                                        </h3>
                                        <span style={{
                                            display: 'inline-block',
                                            background: colors.accent, border: 'none', borderRadius: '22px 5px 22px 5px',
                                            padding: '10px 26px', color: '#fff', fontSize: '12px', fontWeight: 800,
                                            cursor: 'pointer', boxShadow: '0 8px 24px rgba(200,149,108,0.35)',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                        }}>
                                            {filteredPromos[currentPromoIndex]?.btnText}
                                        </span>
                                    </div>
                                </motion.div>
                            ) : (
                                <div style={{ height: '100%', background: 'rgba(200,149,108,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <p style={{ color: colors.textMuted, fontSize: '12px' }}>No exclusive offers available for this salon yet.</p>
                                </div>
                            )}
                        </AnimatePresence>

                    </div>
                </motion.div>

                {/* ── ONE-TAP REBOOK (NEW) ── */}
                {lastBooking && (
                    <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                        <div style={{
                            background: isLight ? 'linear-gradient(135deg, #FDFCFB 0%, #F5EEE6 100%)' : 'linear-gradient(135deg, #1A1614 0%, #120E0C 100%)',
                            borderRadius: '24px',
                            padding: '18px',
                            border: `1.5px solid ${colors.border}`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '14px',
                                        background: isLight ? '#FFF' : '#2A2A2A',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                    }}>
                                        <RefreshCw size={20} color={colors.accent} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: colors.text, margin: 0 }}>One-Tap Rebook</h4>
                                        <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>Re-live your last ritual</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                    <div style={{ background: `${colors.accent}15`, color: colors.accent, padding: '4px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 900 }}>
                                        LAST: {new Date(lastBooking.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => navigate(`/app/salon/${lastBooking.outletId || activeOutletId}`)}
                                        style={{ background: 'none', border: 'none', color: colors.accent, fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                                    >
                                        Visit Salon <ExternalLink size={12} />
                                    </motion.button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                                {lastBooking.services?.map((s, idx) => (
                                    <span key={idx} style={{ fontSize: '11px', fontWeight: 600, background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '10px', color: colors.text }}>
                                        {s.name}
                                    </span>
                                ))}
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate(`/app/book?serviceId=${lastBooking.services?.[0]?._id || ''}&outletId=${lastBooking.outletId || ''}`)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: colors.text,
                                    color: colors.card,
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontSize: '13px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            >
                                Re-Book Services <ArrowRight size={16} />
                            </motion.button>

                            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', fontSize: '120px', opacity: 0.03, color: colors.accent, pointerEvents: 'none' }}>
                                <RefreshCw size={120} />
                            </div>
                        </div>
                    </motion.div>
                )}



                {/* ── MAP VIEW (NEW) ── */}
                <AnimatePresence>
                    {isMapView && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            style={{ padding: '0 16px' }}
                        >
                            <SalonMapView
                                outlets={outlets}
                                selectedOutlet={activeOutlet || outlets[0]}
                                onSelect={(o) => navigate(`/app/salon-selection`)}
                                onViewProfile={(outlet) => {
                                    navigate(`/app/salon/${outlet._id}`);
                                }}
                                colors={colors}
                                isLight={isLight}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── OTHER NEAREST SALONS ── */}
                {!isMapView && (
                    <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Crown size={20} color={colors.accent} />
                                <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Other Nearest Salons</span>
                            </div>
                        </div>
                        <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '14px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                            {(() => {
                                const otherOutlets = outlets.filter(o => o._id !== activeOutletId);
                                const mockSalons = (homeData.GENDER_DATA[gender]?.salons || []).map(s => ({
                                    ...s,
                                    _id: `mock-${s.id}`,
                                    image: s.img,
                                    distance: s.dist,
                                    isMock: true
                                }));
                                
                                // Show real salons first, then mocks if we have fewer than 3
                                const displaySalons = otherOutlets.length >= 3 ? otherOutlets : [...otherOutlets, ...mockSalons];

                                return displaySalons.map(outlet => (
                                    <motion.div
                                        key={outlet._id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            if (outlet.isMock) return;
                                            setActiveOutletId(outlet._id);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    style={{
                                        flexShrink: 0,
                                        width: '240px',
                                        background: colors.card,
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        border: `1px solid ${colors.border}`,
                                        boxShadow: isLight ? '0 10px 20px rgba(0,0,0,0.05)' : '0 10px 20px rgba(0,0,0,0.2)',
                                        position: 'relative',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ height: '120px', width: '100%', position: 'relative' }}>
                                        <img src={outlet.image} alt={outlet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            background: 'rgba(255,255,255,0.9)',
                                            backdropFilter: 'blur(4px)',
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Star size={12} fill="#C8956C" color="#C8956C" />
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#000' }}>{outlet.rating}</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: '14px' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: colors.text, margin: '0 0 4px', lineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, overflow: 'hidden' }}>
                                            {outlet.name}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                            <MapPin size={12} color={colors.textMuted} />
                                            <span style={{ fontSize: '11px', color: colors.textMuted }}>{outlet.distance} · {outlet.address.split(',')[0]}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {['Luxury', 'Top Rated'].map(tag => (
                                                <span key={tag} style={{ fontSize: '9px', fontWeight: 800, color: colors.accent, background: `${colors.accent}15`, padding: '2px 8px', borderRadius: '4px' }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                                ));
                            })()}
                        </div>
                    </motion.div>
                )}

                {/* ── EXCLUSIVE OFFERS (live promotions only — no JSON mock) ── */}
                {couponOffers.length > 0 && (
                <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Ticket size={18} color="#C8956C" />
                            <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Exclusive Offers</span>
                        </div>
                    </div>
                    <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                        {couponOffers.map(offer => (
                            <motion.div
                                key={offer.id}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    flexShrink: 0,
                                    width: '220px',
                                    background: isLight ? '#FFFBF8' : 'rgba(20, 15, 10, 0.4)',
                                    borderRadius: '24px',
                                    padding: '16px',
                                    border: `1.5px dashed ${isLight ? '#C8956C' : '#C8956C'}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    position: 'relative',
                                    justifyContent: 'center'
                                }}
                                onClick={() => {
                                    // Send user to booking page with prefilled promo code.
                                    if (offer.hasCouponCode) {
                                        navigate('/app/book', { state: { promoCode: offer.code } });
                                    } else {
                                        navigate('/app/book');
                                    }
                                }}
                            >
                                <p style={{ fontSize: '11px', color: isLight ? '#777' : colors.textMuted, margin: 0, fontWeight: 500 }}>
                                    {offer.subtitle}
                                </p>
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: 900,
                                    color: isLight ? '#2D2D2A' : '#FFF',
                                    margin: 0,
                                    fontFamily: "'Playfair Display', serif",
                                    letterSpacing: '-0.01em'
                                }}>
                                    {offer.discount}
                                </h3>
                                <div style={{
                                    background: isLight ? '#EDF1F4' : 'rgba(255,255,255,0.05)',
                                    padding: '5px 12px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    color: '#C8956C',
                                    width: 'max-content',
                                    marginTop: '2px',
                                    letterSpacing: '0.02em'
                                }}>
                                    {offer.code}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
                )}

                {/* ── STYLIST LOOKBOOK (CMS only, no mock) ── */}
                {!isMapView && cmsLookbook.filter((l) => l.status === 'Active' && (l.gender === 'all' || l.gender === g)).length > 0 && (
                    <motion.div variants={fadeUp} style={{ padding: '32px 16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Camera size={20} color={colors.accent} />
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0 }}>Stylist Lookbook</h3>
                                    <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>Trending rituals of the week</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', background: isLight ? '#F1F3F5' : '#2A2A2A', padding: '4px', borderRadius: '12px' }}>
                                <button style={{ fontSize: '10px', fontWeight: 800, color: '#8B4513', background: '#F8EDE3', border: 'none', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer' }}>Trending</button>
                                <button style={{ fontSize: '10px', fontWeight: 800, color: colors.textMuted, background: 'none', border: 'none', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer' }}>Classics</button>
                            </div>
                        </div>
                        <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '10px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                            {cmsLookbook.filter((l) => l.status === 'Active' && (l.gender === 'all' || l.gender === g)).map((item) => (
                                <motion.div
                                    key={item.id}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate(`/app/salon/${activeOutletId}`, { state: { activeTab: 'Lookbook', lookId: item.id } })}
                                    style={{
                                        flexShrink: 0,
                                        width: '200px',
                                        height: '260px',
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        background: isLight ? '#F1F3F5' : '#2A2A2A'
                                    }}
                                >
                                    <img
                                        src={item.image}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        alt={item.title}
                                        onError={(e) => {
                                            e.target.style.visibility = 'hidden';
                                        }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.8))' }} />
                                    <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '8px', fontWeight: 900, color: '#FFF', background: 'rgba(200,149,108,0.8)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{item.tag}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', fontWeight: 800, color: '#FFF', margin: 0 }}>{item.title}</p>
                                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>by Wapixo Studio</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── TOP CUSTOMER REVIEWS (NEW PANELS) ── */}
                {!isMapView && (
                    <motion.div variants={fadeUp} style={{ padding: '32px 16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                            <MessageSquare size={20} color={colors.accent} />
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0 }}>Trusted Reviews</h3>
                                <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>What our gold members say</p>
                            </div>
                        </div>
                        <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                            {(() => {
                                const displayReviews = reviews.length > 0 ? reviews : homeData.REVIEWS;
                                return displayReviews.map((rev) => (
                                    <div
                                        key={rev._id || rev.id}
                                        style={{
                                            flexShrink: 0, width: '280px', background: colors.card,
                                            padding: '20px', borderRadius: '24px', border: `1px solid ${colors.border}`,
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.03)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star 
                                                        key={s} 
                                                        size={10} 
                                                        fill={s <= rev.rating ? colors.accent : 'none'} 
                                                        color={s <= rev.rating ? colors.accent : colors.textMuted} 
                                                    />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '10px', color: colors.textMuted }}>
                                                {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: colors.text, margin: '0 0 14px', fontStyle: 'italic', lineHeight: 1.5 }}>
                                            "{rev.comment}"
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '10px', fontWeight: 800 }}>
                                                {(rev.customerName || 'U')[0]}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '11px', fontWeight: 800, color: colors.text, margin: 0, truncate: 'true' }}>{rev.customerName}</p>
                                                <p style={{ fontSize: '9px', color: colors.textMuted, margin: 0 }}>for {rev.service}</p>
                                            </div>
                                        </div>

                                        {rev.response && (
                                            <div style={{ 
                                                marginTop: '12px', 
                                                padding: '10px', 
                                                background: isLight ? '#FDF8F3' : 'rgba(200, 149, 108, 0.05)', 
                                                borderRadius: '12px',
                                                border: `1px solid ${isLight ? '#F3E5D8' : 'rgba(200, 149, 108, 0.2)'}`
                                            }}>
                                                <p style={{ fontSize: '9px', fontWeight: 900, color: '#C8956C', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salon Response</p>
                                                <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0, fontStyle: 'italic' }}>{rev.response}</p>
                                            </div>
                                        )}
                                    </div>
                                ));
                            })()}
                        </div>
                    </motion.div>
                )}

                {/* ── CATEGORIES (SHOP-STYLE UI) ── */}
                {filteredShopCategories.length > 0 && (
                <motion.div variants={fadeUp} style={{ padding: '20px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>Categories</span>
                        <button style={{ fontSize: '12px', color: '#C8956C', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.02em' }} onClick={() => navigate('/app/categories')}>See All</button>
                    </div>
                    <div className="app-scroll no-scrollbar" style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        overflowX: 'auto', 
                        paddingBottom: '24px', 
                        marginLeft: '-16px', 
                        paddingLeft: '16px', 
                        marginRight: '-16px', 
                        paddingRight: '16px',
                        marginTop: '12px'
                    }}>
                        {filteredShopCategories.map((cat) => (
                            <motion.div
                                key={cat.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setRotations(prev => ({ ...prev, [cat.name]: (prev[cat.name] || 0) + 360 }));
                                    setTimeout(() => navigate(`/app/shop?category=${cat.name}`), 100);
                                }}
                                style={{
                                    flexShrink: 0, 
                                    width: '90px',
                                    padding: '12px 4px', 
                                    textAlign: 'center', 
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <motion.div
                                    animate={{ rotateY: rotations[cat.name] || 0 }}
                                    transition={{ duration: 0.6, type: 'spring', damping: 20, stiffness: 100 }}
                                    style={{
                                        width: '64px', 
                                        height: '64px', 
                                        borderRadius: '50%',
                                        overflow: 'hidden', 
                                        margin: '0 auto 0',
                                        border: isLight ? '2.5px solid rgba(0,0,0,0.05)' : '2.5px solid rgba(255,255,255,0.1)',
                                        boxShadow: isLight ? '0 6px 15px rgba(0,0,0,0.08)' : '0 6px 15px rgba(0,0,0,0.4)',
                                        padding: '2px',
                                        perspective: '1000px',
                                        background: colors.card
                                    }}>
                                    <img 
                                        src={cat.image || cat.img} 
                                        alt={cat.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                                    />
                                </motion.div>
                                <div style={{
                                    padding: '5px 14px',
                                    borderRadius: '16px 4px 16px 4px',
                                    background: 'linear-gradient(135deg, #C8956C 0%, #A06844 100%)',
                                    position: 'absolute',
                                    bottom: '-4px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    zIndex: 2,
                                    width: 'max-content',
                                    border: 'none',
                                    boxShadow: '0 6px 15px rgba(200,149,108,0.4)'
                                }}>
                                    <p style={{
                                        fontSize: '9px',
                                        fontWeight: 800,
                                        color: '#FFFFFF',
                                        margin: 0,
                                        whiteSpace: 'nowrap',
                                        letterSpacing: '0.01em',
                                        textTransform: 'uppercase'
                                    }}>
                                        {cat.name}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
                )}







                {/* ── SERVICE CATEGORIES ── */}
                <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <LayoutGrid size={20} color={colors.accent} />
                            <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Service Categories</span>
                        </div>
                        <button
                            style={{ fontSize: '12px', color: colors.accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => navigate('/app/services')}
                        >
                            View All
                        </button>
                    </div>
                    <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                        {(() => {
                            const sourceServices = services?.length > 0 ? services : mockServicesPageData.services;
                            return (sourceServices || [])
                                .filter(s => s.status === 'active')
                                .slice(0, 4)
                                .map(service => (
                                    <div key={service._id || service.id} style={{ flexShrink: 0, width: '220px' }}>
                                        <ServiceCard
                                            service={service}
                                            onBook={(id) => navigate(`/app/book?serviceId=${id}`)}
                                            colors={colors}
                                            isLight={isLight}
                                        />
                                    </div>
                                ));
                        })()}
                    </div>
                </motion.div>

                {/* ── MEMBERSHIP PLANS (NEW) ── */}
                <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Crown size={20} color={colors.accent} />
                            <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Membership Hub</span>
                        </div>
                    </div>
                    <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '14px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                        {filteredMembershipPlans.length > 0 ? filteredMembershipPlans.map(plan => {
                            const isPlatinum = plan.name.toLowerCase().includes('platinum');
                            const isGold = plan.name.toLowerCase().includes('gold');
                            const isSilver = plan.name.toLowerCase().includes('silver');
                            const badgeIcon = plan.icon === 'crown' ? '👑' : (plan.icon === 'gem' ? '💎' : '⭐');

                            const planGradient = isPlatinum
                                ? 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)'
                                : isGold
                                    ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'
                                    : 'linear-gradient(135deg, #E0E0E0 0%, #B0B0B0 100%)';

                            const textColor = (isGold || isSilver) ? '#000' : '#FFF';
                            const mutedColor = (isGold || isSilver) ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';

                            return (
                                <motion.div
                                    key={plan.id}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/app/membership')}
                                    style={{
                                        cursor: 'pointer',
                                        flexShrink: 0, width: '210px',
                                        background: plan.gradient || planGradient,
                                        borderRadius: '20px', padding: '14px 14px 12px',
                                        boxShadow: isLight ? '0 10px 20px rgba(0,0,0,0.1)' : '0 10px 20px rgba(0,0,0,0.4)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Subtle Overlay Glow */}
                                    <div style={{
                                        position: 'absolute', top: '-10%', right: '-10%',
                                        width: '80px', height: '80px',
                                        background: 'rgba(255,255,255,0.2)',
                                        filter: 'blur(25px)', borderRadius: '50%'
                                    }} />

                                    {plan.isPopular && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(0,0,0,0.7)',
                                            color: '#FFD700',
                                            fontSize: '9px',
                                            padding: '3px 7px',
                                            borderRadius: '999px',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                        }}>
                                            Popular
                                        </span>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '14px' }}>{badgeIcon}</span>
                                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: textColor, margin: 0, fontFamily: "'Playfair Display', serif" }}>{plan.name}</h3>
                                    </div>
                                    <div style={{ color: isPlatinum ? colors.accent : (isGold ? '#6B4F00' : '#444'), fontWeight: 900, fontSize: '18px', marginBottom: '8px' }}>
                                        ₹{Number(plan.price || 0).toLocaleString('en-IN')}
                                    </div>
                                    <p style={{ fontSize: '10px', fontWeight: 700, color: mutedColor, margin: '0 0 8px' }}>
                                        Valid for {plan.duration || 30} days
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {plan.benefits.slice(0, 3).map((b, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '3.5px', height: '3.5px', borderRadius: '50%', background: textColor }} />
                                                <p style={{ fontSize: '10px', color: mutedColor, margin: 0, fontWeight: 500 }}>{b}</p>
                                            </div>
                                        ))}
                                        {plan.benefits.length === 0 && (
                                            <p style={{ fontSize: '10px', color: mutedColor, margin: 0, fontWeight: 500 }}>Premium member benefits included</p>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div style={{ width: '100%', padding: '20px', textAlign: 'center', background: colors.card, borderRadius: '24px', border: `1px solid ${colors.border}` }}>
                                <p style={{ color: colors.textMuted, fontSize: '11px', fontWeight: 600 }}>No membership plans found for this location.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── LOYALTY POINTS SUMMARY CARD (MOVED BELOW MEMBERSHIP) ── */}
                <motion.div variants={fadeUp} style={{ padding: '20px 16px 0' }}>
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/app/loyalty')}
                        style={{
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #1e1e1e, #333)',
                            borderRadius: '24px', padding: '20px', position: 'relative', overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: `1px solid ${colors.border}`
                        }}
                    >
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: colors.accent, borderRadius: '50%', filter: 'blur(40px)', opacity: 0.3 }}
                        />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, margin: '0 0 4px' }}>Gold Loyalty Member</p>
                                    <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                                        {currentPoints.toLocaleString()} <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>Points</span>
                                    </h2>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Next reward at {nextRewardPoints} pts</span>
                                    <span style={{ color: colors.accent, fontSize: '12px', fontWeight: 700 }}>{rewardProgressPct}%</span>
                                </div>
                                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${rewardProgressPct}%` }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        style={{ height: '100%', background: colors.accent, borderRadius: '3px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ── WALLET HUB (Quick Access - MOVED BELOW LOYALTY) ── */}
                {customer && (
                    <motion.div variants={fadeUp} style={{ padding: '24px 16px 8px' }}>
                        <div
                            onClick={() => navigate('/app/wallet')}
                            style={{
                                background: '#1A1A1A',
                                borderRadius: '24px',
                                padding: '20px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                color: '#FFF',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                cursor: 'pointer'
                            }}
                        >
                            {/* Decorative Background */}
                            <div style={{
                                position: 'absolute', top: '-50%', right: '-10%',
                                width: '120px', height: '120px',
                                background: 'radial-gradient(circle, rgba(200,149,108,0.2) 0%, transparent 70%)',
                                borderRadius: '50%'
                            }} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <Wallet size={14} color="#C8956C" />
                                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                                        Wapixo Wallet
                                    </p>
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>
                                    ₹{balance.toLocaleString()}
                                </h2>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    background: '#C8956C',
                                    color: '#FFF',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '12px 4px 12px 4px',
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    zIndex: 1
                                }}
                            >
                                Manage
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* ── POPULAR EXPERTS (CMS / staff only, no mock) ── */}
                {displayExperts.length > 0 && (
                <motion.div variants={fadeUp} style={{ padding: '20px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>Popular Experts</span>
                        <button
                            style={{ fontSize: '12px', color: colors.accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => navigate('/app/experts')}
                        >
                            View All
                        </button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6" style={{ margin: '0 -16px', padding: '0 16px' }}>
                        {displayExperts.map((expert) => (
                            <motion.div
                                key={expert.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSelectedExpert(expert);
                                    setShowExpertModal(true);
                                }}
                                style={{
                                    flexShrink: 0,
                                    width: '120px',
                                    background: isLight ? '#FFF' : '#1A1A1A',
                                    borderRadius: '24px',
                                    padding: '16px 8px',
                                    textAlign: 'center',
                                    border: `1px solid ${isLight ? '#F3F4F6' : '#262626'}`,
                                    boxShadow: isLight ? '0 6px 20px rgba(0,0,0,0.03)' : 'none'
                                }}
                            >
                                <div style={{
                                    width: '70px',
                                    height: '70px',
                                    margin: '0 auto 12px',
                                    position: 'relative'
                                }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                                        <img
                                            src={expert.img}
                                            alt={expert.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-8px',
                                        background: '#C8956C',
                                        padding: '2px 6px',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                        color: '#FFF',
                                        fontSize: '9px',
                                        fontWeight: 800,
                                        boxShadow: '0 2px 6px rgba(200, 149, 108, 0.3)'
                                    }}>
                                        <Star size={8} fill="#FFF" color="#FFF" />
                                        <span>{expert.rating || '4.9'}</span>
                                    </div>
                                </div>
                                <h4 style={{ fontSize: '13px', fontWeight: 800, color: colors.text, margin: '0 0 2px', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{expert.name}</h4>
                                <p style={{ fontSize: '11px', color: colors.textMuted, fontWeight: 500 }}>{expert.role || 'Hair Stylist'}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
                )}

                {/* ── LOYALTY + REFERRAL (ORIGINAL BOTTOM STYLE) ── */}
                <motion.div variants={fadeUp} style={{ padding: '20px 16px 32px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/app/loyalty')}
                            style={{
                                flex: 1, background: colors.card, borderRadius: '16px', padding: '16px', cursor: 'pointer',
                                border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px',
                            }}
                        >
                            <div style={{ width: 38, height: 38, borderRadius: '12px', background: 'rgba(200,149,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>⭐</div>
                            <div>
                                <p style={{ fontSize: '10px', color: colors.textMuted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Loyalty</p>
                                <p style={{ fontSize: '16px', fontWeight: 800, color: '#C8956C', margin: 0 }}>{currentPoints.toLocaleString()} pts</p>
                            </div>
                        </motion.div>
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/app/referrals')}
                            style={{
                                flex: 1, background: colors.card, borderRadius: '16px', padding: '16px', cursor: 'pointer',
                                border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px',
                            }}
                        >
                            <div style={{ width: 38, height: 38, borderRadius: '12px', background: 'rgba(200,149,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>🎁</div>
                            <div>
                                <p style={{ fontSize: '10px', color: colors.textMuted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Refer</p>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: colors.text, margin: 0 }}>Earn ₹{referralReward}</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ── EXPERT DETAIL MODAL ── */}
            < AnimatePresence >
                {selectedExpert && showExpertModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowExpertModal(false)}
                            style={{ position: 'absolute', inset: 0, background: isLight ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                width: '100%',
                                maxWidth: '430px',
                                background: colors.card,
                                borderRadius: '32px 32px 0 0',
                                position: 'relative',
                                zIndex: 10001,
                                paddingTop: '12px',
                                paddingBottom: '30px',
                                px: '20px',
                                border: `1px solid ${colors.border}`
                            }}
                        >
                            {/* Drawer Handle */}
                            <div style={{ width: '40px', height: '4px', background: isLight ? '#DDD' : '#333', borderRadius: '2px', margin: '0 auto 20px' }} />

                            <div style={{ padding: '0 24px' }}>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                                    <img
                                        src={selectedExpert.img}
                                        alt={selectedExpert.name}
                                        style={{ width: '100px', height: '100px', borderRadius: '24px', objectFit: 'cover' }}
                                    />
                                    <div style={{ flex: 1, pt: '10px' }}>
                                        <h3 style={{ fontSize: '22px', fontWeight: 900, color: colors.text, margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>{selectedExpert.name}</h3>
                                        <p style={{ fontSize: '14px', color: colors.accent, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.05em' }}>{selectedExpert.role}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={14} fill={colors.accent} color={colors.accent} />
                                            <span style={{ fontSize: '14px', fontWeight: 700 }}>{selectedExpert.rating}</span>
                                            <span style={{ fontSize: '12px', color: colors.textMuted, ml: '4px' }}>(120+ Reviews)</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ flex: 1, background: isLight ? '#F9FAFB' : '#1A1A1A', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '10px', color: isLight ? '#6B7280' : '#888', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Experience</p>
                                        <p style={{ fontSize: '16px', fontWeight: 900, color: colors.text }}>{selectedExpert.experience || '5 Years'}</p>
                                    </div>
                                    <div style={{ flex: 1, background: isLight ? '#F9FAFB' : '#1A1A1A', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '10px', color: isLight ? '#6B7280' : '#888', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Clients</p>
                                        <p style={{ fontSize: '16px', fontWeight: 900, color: colors.text }}>{selectedExpert.clients || '500+'}</p>
                                    </div>
                                </div>

                                <h5 style={{ fontSize: '12px', fontWeight: 800, color: colors.text, marginBottom: '8px', textTransform: 'uppercase' }}>Profile Bio</h5>
                                <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '24px' }}>
                                    {selectedExpert.bio || 'A dedicated professional committed to delivering excellence.'}
                                </p>

                                <h5 style={{ fontSize: '12px', fontWeight: 800, color: colors.text, marginBottom: '12px', textTransform: 'uppercase' }}>Specializations</h5>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                                    {(selectedExpert.specializations || ["Precision Cut", "Style Master"]).map((spec, idx) => (
                                        <span key={idx} style={{
                                            padding: '6px 12px',
                                            background: isLight ? '#FFF7ED' : '#2A1F14',
                                            color: '#C8956C',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.02em'
                                        }}>
                                            {spec}
                                        </span>
                                    ))}
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setShowExpertModal(false);
                                        navigate(`/app/book?expertId=${selectedExpert.id}`);
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '56px',
                                        background: colors.accent,
                                        color: '#FFF',
                                        borderRadius: '16px',
                                        border: 'none',
                                        fontSize: '14px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        boxShadow: `0 10px 20px ${colors.accent}40`,
                                        mt: '10px'
                                    }}
                                >
                                    Book Appointment
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
