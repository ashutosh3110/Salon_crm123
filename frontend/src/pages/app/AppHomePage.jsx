// Updated at 22:45 for stability
import { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import homeData from '../../data/appHomeData.json';
import api from '../../services/api';
import logoDarkMode from '/new wapixo logo .png';
import boyIcon from '/gender/boy.png';
import girlIcon from '/gender/girl.png';
import { getImageUrl } from '../../utils/imageUtils';


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

const fallbackImage = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23222222%22%2F%3E%3Cpath%20d%3D%22M200%20150%20L250%20220%20L150%20220%20Z%22%20fill%3D%22%23444444%22%2F%3E%3Ccircle%20cx%3D%22160%22%20cy%3D%22150%22%20r%3D%2215%22%20fill%3D%22%23444444%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22260%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EWapixo%3C%2Ftext%3E%3C%2Fsvg%3E";

const ServiceCard = memo(({ service, onBook, onClick, colors, isLight }) => {

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
                    src={getImageUrl(service.image) || fallbackImage}
                    alt={service.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    className="group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
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
});

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

const MembershipPlanCard = memo(({ plan, colors, isLight }) => {
    const isPlatinum = plan.name.toLowerCase().includes('platinum');
    const isGold = plan.name.toLowerCase().includes('gold') || plan.name.toLowerCase().includes('royale');

    const bgColor = isPlatinum ? 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)' :
        isGold ? 'linear-gradient(135deg, #F9D423 0%, #FFB703 100%)' :
            plan.gradient || colors.card;

    const textColor = isGold ? '#000' : '#FFF';
    const mutedColor = isGold ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
    const bulletColor = isGold ? '#000' : colors.accent;

    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            style={{
                flexShrink: 0,
                width: '260px',
                background: bgColor,
                borderRadius: '24px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                color: textColor,
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{isPlatinum ? '💎' : '👑'}</span>
                <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>{plan.name}</h3>
            </div>

            <div>
                <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 2px 0' }}>₹{plan.price}</h2>
                <p style={{ fontSize: '11px', fontWeight: 700, color: mutedColor, margin: 0 }}>Valid for {plan.duration} days</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                {/* Custom discount bullets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', color: bulletColor }}>•</span>
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>{plan.serviceDiscountValue}{plan.serviceDiscountType === 'percentage' ? '%' : '₹'} OFF on All Services</span>
                </div>
                {/* Benefits bullets */}
                {(plan.benefits || []).slice(0, 2).map((benefit, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px', color: bulletColor }}>•</span>
                        <span style={{ fontSize: '11px', fontWeight: 700 }}>{benefit}</span>
                    </div>
                ))}
            </div>

            <motion.button
                whileTap={{ scale: 0.95 }}
                style={{
                    marginTop: '8px',
                    width: '100%',
                    height: '42px',
                    background: isGold ? '#000' : '#FFF',
                    color: isGold ? '#FFF' : '#000',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}
            >
                Join Now
            </motion.button>
        </motion.div>
    );
});

const Particle = ({ i }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0]
        }}
        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity }}
        style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: '#C8956C',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
        }}
    />
);

const Skeleton = ({ width, height, borderRadius = '12px', margin = '0' }) => (
    <div style={{
        width,
        height,
        borderRadius,
        margin,
        background: 'linear-gradient(90deg, #1A1411 25%, #2A211B 50%, #1A1411 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear'
    }} />
);

const HomeSkeleton = ({ colors }) => (
    <div style={{ padding: '20px 16px' }}>
        <style>{`
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        `}</style>
        {/* Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <Skeleton width="120px" height="24px" />
            <div style={{ display: 'flex', gap: '12px' }}>
                <Skeleton width="32px" height="32px" borderRadius="50%" />
                <Skeleton width="32px" height="32px" borderRadius="50%" />
            </div>
        </div>
        {/* Banner Skeleton */}
        <Skeleton width="100%" height="180px" borderRadius="24px" margin="0 0 30px 0" />
        {/* Horizontal Sections Skeletons */}
        {[1, 2, 3].map(i => (
            <div key={i} style={{ marginBottom: '30px' }}>
                <Skeleton width="150px" height="20px" margin="0 0 16px 0" />
                <div style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
                    <Skeleton width="160px" height="120px" borderRadius="20px" />
                    <Skeleton width="160px" height="120px" borderRadius="20px" />
                    <Skeleton width="160px" height="120px" borderRadius="20px" />
                </div>
            </div>
        ))}
    </div>
);

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
        services: contextServices,
        products: contextProducts,
        feedbacks: contextReviews,
        banners: contextBanners,
        nearbyOutlets: contextNearby,
        loyaltyPlans: contextPlans,
        categories: contextCategories,
        loyaltySettings: contextLoyalty,
        isInitializing: isContextInitializing
    } = useBusiness();

    const [selectedServiceCategory, setSelectedServiceCategory] = useState('');
    
    const [pageBanners, setPageBanners] = useState([]);
    const [nearestOutlets, setNearestOutlets] = useState([]);
    const [outletServices, setOutletServices] = useState([]);
    const [outletProducts, setOutletProducts] = useState([]);
    const [trustedReviews, setTrustedReviews] = useState([]);
    const [outletPlans, setOutletPlans] = useState([]);
    const [loyaltyRule, setLoyaltyRule] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [userLocation, setUserLocation] = useState(null);

    const services = useMemo(() => (outletServices || []), [outletServices]);
    const products = useMemo(() => (outletProducts || []), [outletProducts]);
    const reviews = useMemo(() => (trustedReviews || []).slice(0, 10), [trustedReviews]);
    const banners = pageBanners || [];
    const membershipPlans = outletPlans || [];
    const categories = useMemo(() => {
        if (!outletServices || outletServices.length === 0) return [];
        const uniqueCatNames = [...new Set(outletServices.map(s => s.category).filter(Boolean))];
        return uniqueCatNames.map(name => ({
            name,
            status: 'active',
            gender: 'both' // Fallback
        }));
    }, [outletServices]);

    // Pre-select first category
    useEffect(() => {
        if (!selectedServiceCategory && categories?.length > 0) {
            const firstCat = categories.find(c => c.status === 'active');
            if (firstCat) setSelectedServiceCategory(firstCat.name);
        }
    }, [categories, selectedServiceCategory]);

    // Pre-select first category when categories load
    useEffect(() => {
        if (!selectedServiceCategory && categories?.length > 0) {
            const firstCat = categories.find(c => c.status === 'active' && (c.gender === 'both' || !gender || c.gender === gender));
            if (firstCat) setSelectedServiceCategory(firstCat.name);
        }
    }, [categories, gender, selectedServiceCategory]);

    // FETCH STATIC DATA (Banners, Loyalty Rules)
    const fetchStaticData = useCallback(async (sid) => {
        try {
            const query = sid ? `?tenantId=${sid}` : '';
            const [bRes, lRes] = await Promise.all([
                api.get(`/banners${query}`),
                api.get(`/loyalty-rules${query}`)
            ]);
            setPageBanners(bRes.data?.data || []);
            setLoyaltyRule(lRes.data?.data || lRes.data || null);
        } catch (err) {
            console.error('Static data fetch error:', err);
        }
    }, []);

    // FETCH OUTLET-SPECIFIC DATA
    const fetchOutletSpecificData = useCallback(async () => {
        if (!activeOutletId) {
            setIsLoadingData(false);
            return;
        }
        setIsLoadingData(true);
        try {
            const [sRes, pRes, rRes, plRes] = await Promise.all([
                api.get(`/services/outlet/${activeOutletId}`),
                api.get(`/products/outlet/${activeOutletId}`),
                api.get(`/reviews/trusted/${activeOutletId}`),
                api.get(`/membership-plans/${activeOutletId}`)
            ]);
            setOutletServices(sRes.data?.data || []);
            setOutletProducts(pRes.data?.data || []);
            setTrustedReviews(rRes.data?.data || []);
            setOutletPlans(plRes.data?.data || []);
        } catch (error) {
            console.error('Outlet data fetch error:', error);
        } finally {
            setIsLoadingData(false);
        }
    }, [activeOutletId]);

    // NEAREST OUTLETS
    const fetchNearest = useCallback(async (lat, lng) => {
        if (lat && lng) setUserLocation({ lat, lng });
        try {
            let url = '/outlets/nearest';
            if (lat && lng) url += `?lat=${lat}&lng=${lng}`;
            const res = await api.get(url);
            setNearestOutlets(res.data?.data || []);
        } catch (err) {}
    }, []);

    useEffect(() => {
        fetchStaticData(activeSalonId);
    }, [fetchStaticData, activeSalonId]);

    useEffect(() => {
        fetchOutletSpecificData();
    }, [fetchOutletSpecificData]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchNearest(pos.coords.latitude, pos.coords.longitude),
                () => fetchNearest()
            );
        } else {
            fetchNearest();
        }
    }, [fetchNearest]);

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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchStaticData(), fetchOutletSpecificData()]);
        setRefreshing(false);
    }, [fetchStaticData, fetchOutletSpecificData]);

    const filteredPopularServices = useMemo(() => {
        return (services || []).filter(s => {
            if (!s.outletIds || s.outletIds.length === 0) {
                // Common service for all outlets
            } else if (s.outletIds && Array.isArray(s.outletIds) && s.outletIds.length > 0) {
                if (!s.outletIds.map(id => String(id)).includes(String(activeOutletId))) return false;
            } else if (s.outletId && s.outletId !== 'all' && String(s.outletId) !== String(activeOutletId)) {
                return false;
            }
            const cat = categories?.find(c => c.name === s.category);
            if (!cat) return true;
            if (!gender) return true;
            return cat.gender === 'both' || cat.gender === gender;
        }).slice(0, 6);
    }, [activeOutletId, services, gender, categories]);

    const filteredPromos = useMemo(() => {
        return (banners || [])
            .filter((p) => {
                const isActive = p.status?.toLowerCase() === 'active' || p.status === undefined;
                const matchesGender = !p.gender || p.gender === 'all' || p.gender === g;
                
                let matchesOutlet = true;
                if (p.outletId && String(p.outletId).trim() !== '' && String(p.outletId) !== 'all' && activeOutletId) {
                    matchesOutlet = String(p.outletId) === String(activeOutletId);
                }

                return isActive && matchesGender && matchesOutlet;
            })
            .map((p) => {
                const validity = (p.validityText && String(p.validityText).trim())
                    || (p.tag && String(p.tag).trim())
                    || (p.description && String(p.description).trim());
                return {
                    id: `banner-${p._id || p.id}`,
                    title: p.title,
                    subtitle: validity ? validity.toUpperCase() : 'EXCLUSIVE OFFER',
                    img: p.image,
                    btnText: (p.btnText && String(p.btnText).trim()) || 'Apply',
                    outletId: p.outletId,
                    isCmsBanner: true,
                };
            });
    }, [banners, g]);

    const handleBannerClick = (banner) => {
        if (banner && banner.outletId && banner.outletId !== 'all') {
            setActiveOutletId(banner.outletId);
        }
    };

    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % (PLACEHOLDERS?.length || 1));
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (filteredPromos.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentPromoIndex((prev) => (prev + 1) % filteredPromos.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [filteredPromos.length]);

    // Reset banner index when gender changes
    useEffect(() => {
        setCurrentPromoIndex(0);
    }, [g]);

    if (isLoadingData) {
        return (
            <div style={{ background: colors.background, minHeight: '100vh' }}>
                <HomeSkeleton colors={colors} />
            </div>
        );
    }
    console.log(getImageUrl(''));

    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            <style>{`
                .search-input::placeholder {
                    color: ${isLight ? '#555' : 'rgba(255,255,255,0.6)'};
                    opacity: 0.8;
                }
            `}</style>
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                style={{
                    background: colors.bg,
                    minHeight: '100svh',
                    color: colors.text,
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
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}
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
                            </div>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: colors.text, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {activeOutlet?.name || 'Wapixo Salon'}
                                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '12px' }}>📍</motion.span>
                            </h3>
                        </div>
                    </motion.div>

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
                                loading="lazy"
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
                                    style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(135deg, #1a120c 0%, #2d2118 50%, #0d0805 100%)',
                                        display: 'flex', alignItems: 'flex-end',
                                    }}
                                >
                                    {filteredPromos[currentPromoIndex]?.img || filteredPromos[currentPromoIndex]?.image ? (
                                        <img
                                            src={getImageUrl(filteredPromos[currentPromoIndex].img || filteredPromos[currentPromoIndex].image)}
                                            alt="Promo"
                                            loading="lazy"
                                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, borderRadius: '24px' }}
                                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                        />
                                    ) : null}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(12,8,5,0.92) 0%, rgba(12,8,5,0.75) 42%, rgba(12,8,5,0.25) 100%)', borderRadius: '24px' }} />
                                    <div 
                                        style={{ position: 'relative', padding: '20px', zIndex: 2, width: '100%', cursor: 'pointer' }}
                                        onClick={() => handleBannerClick(filteredPromos[currentPromoIndex])}
                                    >
                                        <p style={{ fontSize: '10px', color: '#C8956C', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800 }}>
                                            {filteredPromos[currentPromoIndex]?.subtitle}
                                        </p>
                                        <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 14px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                                            {filteredPromos[currentPromoIndex]?.title?.split('\n').map((l, i) => (<span key={i}>{l}{i === 0 && <br />}</span>))}
                                        </h3>
                                        <motion.span 
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                display: 'inline-block',
                                                background: colors.accent, border: 'none', borderRadius: '22px 5px 22px 5px',
                                                padding: '10px 26px', color: '#fff', fontSize: '12px', fontWeight: 800,
                                                boxShadow: '0 8px 24px rgba(200,149,108,0.35)',
                                                textTransform: 'uppercase', letterSpacing: '0.06em',
                                            }}>
                                            {filteredPromos[currentPromoIndex]?.btnText}
                                        </motion.span>
                                    </div>
                                </motion.div>
                            ) : (
                                <div style={{ height: '100%', background: 'rgba(200,149,108,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <p style={{ color: colors.textMuted, fontSize: '12px' }}>No banners available</p>
                                </div>
                            )}
                        </AnimatePresence>

                    </div>
                </motion.div>


                {/* ── OTHER NEAREST SALONS ── */}
                <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Crown size={20} color={colors.accent} />
                            <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Nearby Outlets</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.accent }}></div>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.accent, opacity: 0.3 }}></div>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.accent, opacity: 0.1 }}></div>
                        </div>
                    </div>

                    <div 
                        className="app-scroll no-scrollbar" 
                        style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            overflowX: 'auto', 
                            paddingBottom: '20px', 
                            marginLeft: '-16px', 
                            paddingLeft: '16px', 
                            marginRight: '-16px', 
                            paddingRight: '16px',
                            scrollSnapType: 'x mandatory'
                        }}
                    >
                        {(() => {
                            // If nearestOutlets is empty, we show all active outlets from the business context as fallback
                            const sourceOutlets = (nearestOutlets && nearestOutlets.length > 0) 
                                ? nearestOutlets 
                                : (outlets || []); 

                            const otherSalons = sourceOutlets
                                .filter(o => String(o._id || o.id) !== String(activeOutletId))
                                .map(o => {
                                    const dist = userLocation && o.location?.coordinates?.length === 2
                                        ? calculateDistance(userLocation.lat, userLocation.lng, o.location.coordinates[1], o.location.coordinates[0])
                                        : null;
                                    return { ...o, calculatedDist: dist };
                                });

                            const sortedSalons = [...otherSalons].sort((a, b) => {
                                if (a.calculatedDist !== null && b.calculatedDist !== null) return a.calculatedDist - b.calculatedDist;
                                return 0;
                            });

                            if (sortedSalons.length === 0) {
                                return (
                                    <div style={{ width: '100%', padding: '40px 20px', textAlign: 'center', background: 'rgba(200,149,108,0.05)', borderRadius: '24px' }}>
                                        <div className="w-12 h-12 bg-[#C8956C]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MapPin size={24} color={colors.accent} className="opacity-40" />
                                        </div>
                                        <p style={{ color: colors.textMuted, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            Exploring new horizons
                                        </p>
                                        <p style={{ color: colors.textMuted, fontSize: '10px', marginTop: '4px', opacity: 0.6 }}>
                                            Stay tuned for more outlets nearby
                                        </p>
                                    </div>
                                );
                            }

                            return sortedSalons.map(outlet => (
                                <motion.div
                                    key={outlet._id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setActiveOutletId(outlet._id);
                                    }}
                                    style={{
                                        flexShrink: 0,
                                        width: '160px', // Adjusted for "two on screen" feel with partial third
                                        background: colors.card,
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        border: `1px solid ${colors.border}`,
                                        boxShadow: isLight ? '0 8px 24px rgba(0,0,0,0.04)' : '0 8px 30px rgba(0,0,0,0.2)',
                                        position: 'relative',
                                        scrollSnapAlign: 'start'
                                    }}
                                >
                                    <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                                        <img
                                            src={getImageUrl(outlet.images?.[0] || outlet.image) || fallbackImage}
                                            alt={outlet.name}
                                            loading="lazy"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'rgba(0,0,0,0.6)',
                                            backdropFilter: 'blur(8px)',
                                            padding: '3px 6px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            color: '#FFF'
                                        }}>
                                            <Star size={10} fill="#C8956C" color="#C8956C" />
                                            <span style={{ fontSize: '9px', fontWeight: 900 }}>{outlet.rating || '4.8'}</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: '12px' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: colors.text, margin: '0 0 2px', lineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, overflow: 'hidden' }}>
                                            {outlet.name}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <MapPin size={10} color={colors.accent} />
                                            <span style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 700 }}>
                                                {outlet.calculatedDist !== undefined && outlet.calculatedDist !== null
                                                    ? `${outlet.calculatedDist.toFixed(1)} km`
                                                    : 'Near you'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ));
                        })()}
                    </div>
                </motion.div>



                {/* ── 5. SERVICES (Filtered list) ── */}
                <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Scissors size={20} color={colors.accent} />
                        <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Services</span>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedServiceCategory}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="app-scroll no-scrollbar"
                            style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' }}
                        >
                            {(() => {
                                const sourceServices = services || [];
                                const filtered = sourceServices.filter(s =>
                                    s.status === 'active' &&
                                    (!selectedServiceCategory || s.category === selectedServiceCategory)
                                );
                                if (filtered.length === 0) {
                                    return (
                                        <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>
                                            No services found
                                        </div>
                                    );
                                }
                                return filtered.map(service => (
                                    <div key={service._id || service.id} style={{ flexShrink: 0, width: '200px', scrollSnapAlign: 'start' }}>
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
                <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShoppingBag size={20} color={colors.accent} />
                            <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Products</span>
                        </div>
                        <button
                            onClick={() => navigate('/app/shop')}
                            style={{ fontSize: '11px', fontWeight: 700, color: colors.accent, background: 'none', border: 'none' }}
                        >
                            Shop All
                        </button>
                    </div>
                    
                    {products.length === 0 ? (
                        <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>
                            No products available
                        </div>
                    ) : (
                        <div
                            className="app-scroll no-scrollbar"
                            style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' }}
                        >
                            {products.filter(p => p.isShopProduct).slice(0, 15).map(product => (
                                <motion.div
                                    key={product._id || product.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(`/app/product/${product._id || product.id}`)}
                                    style={{
                                        flexShrink: 0, width: '125px', background: colors.card,
                                        borderRadius: '20px', border: `1px solid ${colors.border}`,
                                        overflow: 'hidden', scrollSnapAlign: 'start'
                                    }}
                                >
                                    <div style={{ height: '100px', position: 'relative' }}>
                                        <img
                                            src={getImageUrl(product.appImage || product.image) || fallbackImage}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                                        />
                                        <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.4)', padding: '2px 5px', borderRadius: '4px', color: '#FFF', fontSize: '7px', fontWeight: 900 }}>
                                            {product.brand}
                                        </div>
                                    </div>
                                    <div style={{ padding: '10px' }}>
                                        <p style={{ fontSize: '11px', fontWeight: 800, color: colors.text, margin: '0 0 2px', lineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, overflow: 'hidden' }}>
                                            {product.name}
                                        </p>
                                        <p style={{ fontSize: '12px', fontWeight: 900, color: colors.accent, margin: 0 }}>
                                            ₹{product.sellingPrice || product.price}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
                {/* ── 6. TRUSTED REVIEWS ── */}
                <motion.div variants={fadeUp} style={{ padding: '32px 16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                        <MessageSquare size={20} color={colors.accent} />
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0 }}>Reviews</h3>
                            <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>What our gold members say</p>
                        </div>
                    </div>
                    <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px', scrollSnapType: 'x mandatory' }}>
                        {(() => {
                            const displayReviews = reviews || [];
                            if (displayReviews.length === 0) {
                                return (
                                    <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>
                                        No reviews available
                                    </div>
                                );
                            }
                            return displayReviews.map((rev) => (
                                <div
                                    key={rev._id || rev.id}
                                    style={{
                                        flexShrink: 0, width: '240px', background: colors.card,
                                        padding: '16px', borderRadius: '24px', border: `1px solid ${colors.border}`,
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.03)', scrollSnapAlign: 'start'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', gap: '3px' }}>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star
                                                    key={s}
                                                    size={10}
                                                    fill={s <= rev.rating ? colors.accent : 'none'}
                                                    color={s <= rev.rating ? colors.accent : colors.textMuted}
                                                    strokeWidth={2.5}
                                                />
                                            ))}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ display: 'block', fontSize: '8px', fontWeight: 900, color: colors.accent, marginBottom: '2px', letterSpacing: '0.05em' }}>VERIFIED</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '12px', color: colors.text, margin: '0 0 12px', fontStyle: 'italic', lineHeight: 1.4, lineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>
                                        "{rev.comment}"
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '9px', fontWeight: 800 }}>
                                            {(rev.customerId?.name || rev.customerName || 'U')[0]}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '10px', fontWeight: 800, color: colors.text, margin: 0 }}>
                                                {rev.customerId?.name || rev.customerName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </motion.div>

                {/* ── 7. MEMBERSHIP PLANS ── */}
                <motion.div variants={fadeUp} style={{ padding: '0 16px 32px' }}>
                    <div style={{ color: colors.accent, fontSize: '10px', fontWeight: 900, marginBottom: '6px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        Premium Memberships
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Crown size={20} color={colors.accent} />
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0 }}>Membership</h3>
                                <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>Elevate your status with our tiered privileges</p>
                            </div>
                        </div>
                    </div>
                    {membershipPlans.length === 0 ? (
                        <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>
                            No membership plans available
                        </div>
                    ) : (
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
                    )}
                </motion.div>

                {/* ── 8. LOYALTY RULES ── */}
                <motion.div variants={fadeUp} style={{ padding: '0 16px 32px' }}>
                    <div style={{ color: colors.accent, fontSize: '10px', fontWeight: 900, marginBottom: '6px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        Loyalty Program
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                        <Gift size={20} color={colors.accent} />
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0 }}>Loyalty</h3>
                            <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>Turn your visits into rewards</p>
                        </div>
                    </div>

                    {!loyaltyRule || !loyaltyRule.active ? (
                        <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>
                            Loyalty rewards currently unavailable
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '12px', background: `${colors.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={16} color={colors.accent} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '8px', fontWeight: 900, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>Earn Rate</p>
                                    <h4 style={{ fontSize: '14px', fontWeight: 900, color: colors.text, margin: 0 }}>₹{loyaltyRule.pointsRate || 100} = 1 PT</h4>
                                </div>
                            </div>

                            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '12px', background: `${colors.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Star size={16} color={colors.accent} fill={colors.accent} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '8px', fontWeight: 900, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>Value</p>
                                    <h4 style={{ fontSize: '14px', fontWeight: 900, color: colors.text, margin: 0 }}>1 PT = ₹{loyaltyRule.redeemValue || 1}</h4>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

            </motion.div>
        </div>
    );
};

