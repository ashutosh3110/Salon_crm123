// Updated at 22:45 for stability
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useGender } from '../../contexts/GenderContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, SlidersHorizontal, Heart, Star, ArrowRight, ShieldCheck, Ticket, Crown, Gift, Zap,
    Moon, Bell, Sun, Search, Clock, RefreshCw, Camera, MessageSquare, ExternalLink, Wallet, Scissors, LayoutGrid, Tag, DoorClosed, Armchair, ShoppingBag
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useCMS } from '../../contexts/CMSContext';
import homeData from '../../data/appHomeData.json';
import api from '../../services/api';
import logoDarkMode from '/new wapixo logo .png';
import boyIcon from '/gender/boy.png';
import girlIcon from '/gender/girl.png';
import SalonMapView from '../../components/app/SalonMapView';


const { PLACEHOLDERS } = homeData;

const getAddressString = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    if (typeof addr === 'object') {
        const { street, city, state, pincode } = addr;
        return [street, city, state, pincode].filter(Boolean).join(', ');
    }
    return '';
};

const ServiceCard = ({ service, onBook, onClick, colors, isLight }) => {
    const fallbackImage = "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1000&auto=format&fit=crop";
    
    return (
        <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => onClick && onClick(service._id || service.id)}
            style={{
                background: colors.card,
                borderRadius: '28px',
                border: `1px solid ${colors.border}`,
                boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.03)' : '0 10px 40px rgba(0,0,0,0.25)',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
            className="group"
        >
            <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                <img
                    src={service.image || fallbackImage}
                    alt={service.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    className="group-hover:scale-110 transition-transform duration-700"
                />
                <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                    padding: '4px 10px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    color: '#FFF', fontSize: '10px', fontWeight: 800
                }}>
                    <Clock size={10} color="#C8956C" />
                    <span>{service.duration || 30}m</span>
                </div>
            </div>

            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#C8956C', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {service.category || 'Specialist'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Star size={10} fill="#C8956C" color="#C8956C" />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: colors.text }}>4.9</span>
                    </div>
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: 800, color: colors.text, margin: '0 0 4px', lineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, overflow: 'hidden' }}>
                    {service.name}
                </h3>
                <p style={{ fontSize: '11px', color: colors.textMuted, lineHeight: '1.4', margin: '0 0 16px', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
                    {service.description || "Indulge in our premium salon service designed for your wellness."}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontSize: '8px', color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Starts from</p>
                        <p style={{ fontSize: '16px', fontWeight: 900, color: colors.text, margin: 0 }}>₹{service.price || 499}</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => onBook(service._id || service.id)}
                        style={{
                            background: 'linear-gradient(135deg, #C8956C 0%, #A06844 100%)',
                            color: '#FFF',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '12px 4px 12px 4px',
                            fontSize: '11px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            boxShadow: '0 4px 12px rgba(200,149,108,0.2)'
                        }}
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

const MembershipPlanCard = ({ plan, colors, isLight }) => {
    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            style={{
                flexShrink: 0,
                width: '280px',
                background: plan.gradient || colors.card,
                borderRadius: '32px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                color: '#FFF',
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                border: plan.isPopular ? `2px solid #C8956C` : 'none'
            }}
        >
            {plan.isPopular && (
                <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: '#C8956C', padding: '4px 12px',
                    borderRadius: '20px', fontSize: '9px', fontWeight: 900,
                    textTransform: 'uppercase', letterSpacing: '0.1em'
                }}>Most Popular</div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 4px', textTransform: 'uppercase', italic: 'italic' }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 900 }}>₹{plan.price}</span>
                    <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 700 }}>/ {plan.duration} DAYS</span>
                </div>
            </div>

            <div style={{ spaceY: '10px', marginBottom: '24px' }}>
                {(plan.benefits || []).slice(0, 3).map((benefit, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={10} color="#FFF" />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.9 }}>{benefit}</span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ 
                    flex: 1, background: 'rgba(255,255,255,0.1)', 
                    padding: '8px', borderRadius: '16px', textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p style={{ fontSize: '8px', fontWeight: 900, margin: '0 0 2px', opacity: 0.6 }}>SERVICES</p>
                    <p style={{ fontSize: '12px', fontWeight: 900 }}>{plan.serviceDiscountValue}{plan.serviceDiscountType === 'percentage' ? '%' : '₹'} OFF</p>
                </div>
                <div style={{ 
                    flex: 1, background: 'rgba(255,255,255,0.1)', 
                    padding: '8px', borderRadius: '16px', textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p style={{ fontSize: '8px', fontWeight: 900, margin: '0 0 2px', opacity: 0.6 }}>PRODUCTS</p>
                    <p style={{ fontSize: '12px', fontWeight: 900 }}>{plan.productDiscountValue}{plan.productDiscountType === 'percentage' ? '%' : '₹'} OFF</p>
                </div>
            </div>
            
            <motion.button 
                whileTap={{ scale: 0.95 }}
                style={{
                    marginTop: '24px', width: '100%', py: '12px',
                    height: '48px', background: '#FFF', color: '#000',
                    border: 'none', borderRadius: '16px', fontSize: '11px',
                    fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em'
                }}
            >
                Get Started
            </motion.button>
        </motion.div>
    );
};

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
    // Fallback if gender is null
    const g = (gender === 'men' || gender === 'women') ? gender : 'women';

    const { theme, colors, isLight } = useCustomerTheme();
    const { 
        activeOutlet, 
        activeOutletId, 
        activeSalonId,
        outlets, 
        setActiveOutletId, 
        services, 
        categories,
        isInitializing,
        fetchCustomerInitialData,
        feedbacks: reviews = []
    } = useBusiness();
    const { products, productCategories } = useInventory();
    const { banners } = useCMS();

    const [selectedServiceCategory, setSelectedServiceCategory] = useState('');
    const [membershipPlans, setMembershipPlans] = useState([]);
    const [loyaltyRule, setLoyaltyRule] = useState(null);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [dynamicReviews, setDynamicReviews] = useState([]);

    const lastFetchedSid = useRef(null);
    useEffect(() => {
        const fetchPlans = async () => {
            const sid = activeSalonId || activeOutlet?.salonId || localStorage.getItem('active_salon_id');
            if (!sid) {
                return;
            }
            if (lastFetchedSid.current === sid) return;
            lastFetchedSid.current = sid;

            setLoadingPlans(true);
            try {
                const [mRes, lRes, fRes] = await Promise.all([
                    api.get(`/loyalty/membership-plans/public?salonId=${sid}`),
                    api.get(`/loyalty/settings/public?salonId=${sid}`),
                    api.get(`/feedbacks?salonId=${sid}&status=Approved`)
                ]);
                
                if (mRes.data?.success) {
                    console.log(`[Home] Salon: ${sid}, Plans: ${mRes.data.data?.length}`);
                    setMembershipPlans(mRes.data.data);
                }
                if (lRes.data?.success) {
                    setLoyaltyRule(lRes.data.data);
                }
                if (fRes.data?.success) {
                    setDynamicReviews(fRes.data.data);
                }
            } catch (err) {
                console.error('[Home] Failed to fetch loyalty/review data', err);
            } finally {
                setLoadingPlans(false);
            }
        };
        fetchPlans();
    }, [activeSalonId, activeOutlet?.salonId]);

    // Pre-select first category when categories load
    useEffect(() => {
        if (!selectedServiceCategory && categories?.length > 0) {
            const firstCat = (categories || []).find(c => c.status === 'active' && (c.gender === 'both' || !gender || c.gender === gender));
            setSelectedServiceCategory('All');
        }
    }, [categories, gender, selectedServiceCategory]);

    // ── GEOLOCATION LOGIC ──
    const [userLocation, setUserLocation] = useState(null);
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log('Location access denied or error')
            );
        }
    }, []);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

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

    const [nearestOutlets, setNearestOutlets] = useState([]);
    const [nearestOutletsLoading, setNearestOutletsLoading] = useState(false);

    // ── 2. FETCH NEAREST SALONS (OUTLETS) ──

    useEffect(() => {
        const fetchNearby = async () => {
            if (!userLocation) return;
            setNearestOutletsLoading(true);
            try {
                const res = await api.get('/outlets/nearby', {
                    params: {
                        lat: userLocation.lat,
                        lng: userLocation.lng,
                        radius: 50 // 50km
                    }
                });
                if (res.data?.success) {
                    setNearestOutlets(res.data.data);
                }
            } catch (err) {
                console.error('Nearby API Error:', err);
            } finally {
                setNearestOutletsLoading(false);
            }
        };
        fetchNearby();
    }, [userLocation]);



    // Banners, categories, and inventory are already handled by BusinessContext, InventoryContext, and CMSContext
    // No other API calls here to keep things smooth




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
            const cat = categories?.find(c => c.name === s.category);
            if (!cat) return true;  
            if (!gender) return true;
            return cat.gender === 'both' || cat.gender === gender;
        }).slice(0, 6);
    }, [activeOutletId, services, gender, categories]);


    /** Hero carousel = App CMS **Banners** tab only (no POS/coupon promos, no lookbook — those have their own UI below). */
    const filteredPromos = useMemo(() => {
        return banners
            .filter((p) => p.status === 'Active' && (!p.gender || p.gender === 'all' || p.gender === g))
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
                    link: p.link || '/app/booking',
                    isCmsBanner: true,
                };
            });
    }, [banners, g]);

    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
    const [showWelcome, setShowWelcome] = useState(location.state?.justLoggedIn || false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [isMapView, setIsMapView] = useState(false);
    const [selectedMapOutlet, setSelectedMapOutlet] = useState(null);

    useEffect(() => {
        if (activeOutlet && !selectedMapOutlet) setSelectedMapOutlet(activeOutlet);
    }, [activeOutlet]);

    useEffect(() => {
        if (showWelcome) {
            const timer = setTimeout(() => setShowWelcome(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [showWelcome]);

    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % (PLACEHOLDERS?.length || 1));
        }, 2000);
        return () => clearInterval(timer);
    }, []);



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
                                            navigate('/app/booking', { state: { promoCode: current.couponCode } });
                                        } else {
                                            navigate(current?.link || '/app/booking');
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
                                selectedOutlet={selectedMapOutlet || activeOutlet || outlets[0]}
                                onSelect={(o) => setSelectedMapOutlet(o)}
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
                                const otherOutlets = outlets
                                    .filter(o => o._id !== activeOutletId)
                                    .map(o => {
                                        const dist = userLocation && o.location?.coordinates?.length === 2 
                                            ? calculateDistance(userLocation.lat, userLocation.lng, o.location.coordinates[1], o.location.coordinates[0])
                                            : null;
                                        return { ...o, calculatedDist: dist };
                                    });

                                // Sort real salons by distance if available
                                const sortedReal = [...otherOutlets].sort((a, b) => {
                                    if (a.calculatedDist !== null && b.calculatedDist !== null) return a.calculatedDist - b.calculatedDist;
                                    if (a.calculatedDist !== null) return -1;
                                    if (b.calculatedDist !== null) return 1;
                                    return 0;
                                });

                                const mockSalons = (homeData.GENDER_DATA[gender]?.salons || []).map(s => ({
                                    ...s,
                                    _id: `mock-${s.id}`,
                                    image: s.img,
                                    distance: s.dist,
                                    isMock: true
                                }));
                                
                                // Show sorted real salons first, then mocks if we have fewer than 3
                                const displaySalons = sortedReal.length >= 3 ? sortedReal : [...sortedReal, ...mockSalons];

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
                                        <img 
                                            src={outlet.images?.[0] || outlet.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"} 
                                            alt={outlet.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
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
                                            <span style={{ fontSize: '11px', color: colors.textMuted }}>
                                                {outlet.calculatedDist !== undefined && outlet.calculatedDist !== null 
                                                    ? `${outlet.calculatedDist.toFixed(1)} km` 
                                                    : (outlet.distance || '0.5 km')} · {getAddressString(outlet.address).split(',')[0]}
                                            </span>
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

                {/* ── 3. SERVICE CATEGORIES EXPLORER ── */}
                <motion.div variants={fadeUp} style={{ padding: '32px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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

                    <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                        {['All', ...(categories || []).filter(c => c.status === 'active' && (c.gender === 'both' || !gender || c.gender === gender)).map(c => c.name)].map((catName) => {
                            const isActive = selectedServiceCategory === catName;
                            const catObj = (categories || []).find(c => c.name === catName);
                            const iconMap = {
                                'Haircuts': 'https://cdn-icons-png.flaticon.com/512/2916/2916035.png',
                                'Styling': 'https://cdn-icons-png.flaticon.com/512/3228/3228741.png',
                                'Coloring': 'https://cdn-icons-png.flaticon.com/512/2916/2916086.png',
                                'Facial': 'https://cdn-icons-png.flaticon.com/512/3228/3228741.png',
                                'All': 'https://cdn-icons-png.flaticon.com/512/10410/10410884.png'
                            };

                            return (
                                <motion.div
                                    key={catName}
                                    style={{
                                        flexShrink: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    onClick={() => navigate(`/app/services?category=${encodeURIComponent(catName)}`)}
                                >
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '20px',
                                        background: colors.card,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `1.5px solid ${isActive ? colors.accent : colors.border}`,
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <img
                                            src={catObj?.image || iconMap[catName] || iconMap['All']}
                                            style={{ width: '32px', height: '32px' }}
                                            alt={catName}
                                        />
                                    </div>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: isActive ? colors.accent : colors.textMuted,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.02em'
                                    }}>
                                        {catName}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── 4. PRODUCT CATEGORIES ── */}
                {productCategories.length > 0 && (
                    <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Tag size={18} color="#C8956C" />
                                <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Product Categories</span>
                            </div>
                        </div>
                        <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                            {productCategories.filter(c => c.status === 'active').map((cat) => (
                                <motion.div
                                    key={cat._id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(`/app/shop?category=${encodeURIComponent(cat.name)}`)}
                                    style={{
                                        flexShrink: 0,
                                        width: '160px',
                                        height: '100px',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        border: `1px solid ${colors.border}`,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <img 
                                        src={cat.image || "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800"} 
                                        alt={cat.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                                    <span style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', fontSize: '12px', fontWeight: 900, color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {cat.name}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── 5. SERVICES (Filtered list) ── */}
                <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Scissors size={20} color={colors.accent} />
                        <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Trending Rituals</span>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedServiceCategory}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="app-scroll-y no-scrollbar"
                            style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px' }}
                        >
                            {(() => {
                                const sourceServices = services || [];
                                const filtered = sourceServices.filter(s =>
                                    s.status === 'active' &&
                                    (selectedServiceCategory === 'All' || !selectedServiceCategory || s.category === selectedServiceCategory)
                                );
                                if (filtered.length === 0) return null;
                                return filtered.map(service => (
                                    <div key={service._id || service.id} style={{ flexShrink: 0, width: '260px' }}>
                                        <ServiceCard
                                            service={service}
                                            onBook={(id) => navigate(`/app/booking?serviceId=${id}`)}
                                            onClick={(id) => navigate(`/app/service/${id}`)}
                                            colors={colors}
                                            isLight={isLight}
                                        />
                                    </div>
                                ));
                            })()}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* ── 5.5 PRODUCTS (Luxe Essentials) ── */}
                {products.length > 0 && (
                    <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShoppingBag size={20} color={colors.accent} />
                                <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Luxe Essentials</span>
                            </div>
                            <button 
                                onClick={() => navigate('/app/shop')}
                                style={{ fontSize: '11px', fontWeight: 700, color: colors.accent, background: 'none', border: 'none' }}
                            >
                                Shop All
                            </button>
                        </div>
                        <div 
                            className="app-scroll no-scrollbar"
                            style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px' }}
                        >
                            {products.filter(p => p.isShopProduct).slice(0, 6).map(product => (
                                <motion.div
                                    key={product._id || product.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(`/app/product/${product._id || product.id}`)}
                                    style={{
                                        flexShrink: 0, width: '160px', background: colors.card,
                                        borderRadius: '24px', border: `1px solid ${colors.border}`,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ height: '120px', position: 'relative' }}>
                                        <img 
                                            src={product.appImage || product.image || "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=400"} 
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '6px', color: '#FFF', fontSize: '8px', fontWeight: 900 }}>
                                            {product.brand}
                                        </div>
                                    </div>
                                    <div style={{ padding: '12px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 800, color: colors.text, margin: '0 0 4px', lineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, overflow: 'hidden' }}>
                                            {product.name}
                                        </p>
                                        <p style={{ fontSize: '13px', fontWeight: 900, color: colors.accent, margin: 0 }}>
                                            ₹{product.sellingPrice || product.price}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── 6. TRUSTED REVIEWS ── */}
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
                                const displayReviews = dynamicReviews.length > 0 ? dynamicReviews : homeData.REVIEWS;
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
                                                {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
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
                                                <p style={{ fontSize: '9px', color: colors.textMuted, margin: 0 }}>for {rev.targetName || 'Service'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </motion.div>
                )}

                {/* ── 7. MEMBERSHIP PLANS ── */}
                {!isMapView && membershipPlans.length > 0 && (
                    <motion.div variants={fadeUp} style={{ padding: '0 16px 32px' }}>
                        <div style={{ color: colors.accent, fontSize: '10px', fontWeight: 900, marginBottom: '6px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            Membership Rituals
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Crown size={20} color={colors.accent} />
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0 }}>Exclusive Rituals</h3>
                                    <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>Elevate your status with our tiered privileges</p>
                                </div>
                            </div>
                        </div>
                        <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                            {membershipPlans.filter(p => p.isActive !== false).map((plan) => (
                                <MembershipPlanCard 
                                    key={plan._id || plan.id} 
                                    plan={plan} 
                                    colors={colors} 
                                    isLight={isLight} 
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── 8. LOYALTY RULES ── */}
                {!isMapView && loyaltyRule && loyaltyRule.active && (
                    <motion.div variants={fadeUp} style={{ padding: '0 16px 32px' }}>
                        <div style={{ color: colors.accent, fontSize: '10px', fontWeight: 900, marginBottom: '6px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            Loyalty Protocol
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                            <Gift size={20} color={colors.accent} />
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0 }}>Point Redemption</h3>
                                <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>Turn your visits into rewards</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                             <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                 <div style={{ width: '32px', height: '32px', borderRadius: '12px', background: `${colors.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Zap size={16} color={colors.accent} />
                                 </div>
                                 <div>
                                     <p style={{ fontSize: '8px', fontWeight: 900, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>Earn Rate</p>
                                     <h4 style={{ fontSize: '14px', fontWeight: 900, color: colors.text, margin: 0 }}>₹{loyaltyRule.pointsRate} = 1 PT</h4>
                                 </div>
                             </div>

                             <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                 <div style={{ width: '32px', height: '32px', borderRadius: '12px', background: `${colors.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Star size={16} color={colors.accent} fill={colors.accent} />
                                 </div>
                                 <div>
                                     <p style={{ fontSize: '8px', fontWeight: 900, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>Value</p>
                                     <h4 style={{ fontSize: '14px', fontWeight: 900, color: colors.text, margin: 0 }}>1 PT = ₹{loyaltyRule.redeemValue}</h4>
                                 </div>
                             </div>
                        </div>
                    </motion.div>
                )}

            </motion.div>
        </div>
    );
    
}
