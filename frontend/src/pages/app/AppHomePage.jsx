// Updated at 22:45 for stability
import { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useGender } from '../../contexts/GenderContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

import {
    MapPin, SlidersHorizontal, Heart, Star, ArrowRight, ShieldCheck, Ticket, Crown, Gift, Zap,
    Moon, Bell, Sun, Search, Clock, RefreshCw, Camera, MessageSquare, ExternalLink, Wallet, Scissors, LayoutGrid, Tag, DoorClosed, Armchair, ShoppingBag, Check, ChevronRight, ChevronDown, X, Navigation
} from 'lucide-react';


import { useBusiness } from '../../contexts/BusinessContext';
import { mapInventoryProductToShopProduct } from '../../utils/shopProductMapper';
import homeData from '../../data/appHomeData.json';
import api from '../../services/api';
import logoDarkMode from '/new wapixo logo .png';
import boyIcon from '/gender/boy.png';
import girlIcon from '/gender/girl.png';
import { getImageUrl } from '../../utils/imageUtils';

const fallbackImage = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23222222%22%2F%3E%3Cpath%20d%3D%22M200%20150%20L250%20220%20L150%20220%20Z%22%20fill%3D%22%23444444%22%2F%3E%3Ccircle%20cx%3D%22160%22%20cy%3D%22150%22%20r%3D%2215%22%20fill%3D%22%23444444%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22260%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EWapixo%3C%2Ftext%3E%3C%2Fsvg%3E";


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

const getTodayTimingString = (outlet) => {
    if (!outlet) return '';
    const defaultTiming = 'Open daily: 9:00 AM - 9:00 PM';
    if (!outlet.workingHours || !Array.isArray(outlet.workingHours) || outlet.workingHours.length === 0) {
        return defaultTiming;
    }
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = daysOfWeek[new Date().getDay()];
    const todayHours = outlet.workingHours.find(h => h.day === todayName);
    if (!todayHours) {
        return defaultTiming;
    }
    if (!todayHours.isOpen) {
        return 'Closed Today';
    }
    return `Today: ${todayHours.openTime || '9:00 AM'} - ${todayHours.closeTime || '9:00 PM'}`;
};

// Helper to handle address strings

const ServiceCard = memo(({ service, onBook, onClick, colors, isLight, showPrice }) => {
    const [imgSrc, setImgSrc] = useState(() => getImageUrl(service.image) || fallbackImage);

    const handleError = () => {
        if (imgSrc !== fallbackImage) {
            setImgSrc(fallbackImage);
        }
    };

    return (
        <div
            onClick={() => onClick && onClick(service._id || service.id)}
            style={{
                background: colors.card,
                borderRadius: '24px',
                border: `1px solid ${colors.border}`,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease'
            }}
            className="active:scale-95"
        >
            <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                <img
                    src={imgSrc}
                    alt={service.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={handleError}
                />
                <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '4px 8px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    color: '#FFF', fontSize: '10px', fontWeight: 800
                }}>
                    <Clock size={10} color={colors.accent} />
                    <span>{service.duration || 30}m</span>
                </div>
            </div>

            <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: colors.accent, textTransform: 'uppercase' }}>
                        {service.category || 'Specialist'}
                    </span>
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>
                    {service.name}
                </h3>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {showPrice !== false && (
                        <p style={{ fontSize: '15px', fontWeight: 800, color: colors.text, margin: 0 }}>₹{service.price || 499}</p>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onBook(service._id || service.id); }}
                        style={{
                            background: colors.accent,
                            color: '#000000',
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 800
                        }}
                    >
                        Book
                    </button>
                </div>
            </div>
        </div>
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
    const { colors } = useCustomerTheme();
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={11} fill={colors.accent} color={colors.accent} />
            <span style={{ fontSize: '11px', color: colors.accent, fontWeight: 600 }}>{rating}</span>
        </span>
    );
}

const MembershipPlanCard = memo(({ plan, colors, isLight }) => {
    const navigate = useNavigate();
    const isGold = plan.name.toLowerCase().includes('gold') || plan.name.toLowerCase().includes('royale');
    const isYearly = plan.duration >= 300;
    const saveAmount = isGold
        ? (isYearly ? 600 : 50)
        : (isYearly ? 1200 : 100);

    const gradient = isGold
        ? 'linear-gradient(135deg, #FFF8F2 0%, #FFFBF9 100%)'
        : 'linear-gradient(135deg, #F5F5FA 0%, #FAF9FC 100%)';

    const benefits = Array.isArray(plan.benefits) && plan.benefits.length > 0
        ? plan.benefits
        : (isGold
            ? ['10% OFF on all services', 'Free Hair Spa (2 Times)', 'Priority Booking', 'Special Member Offers']
            : ['15% OFF on all services', 'Free Hair Spa (4 Times)', 'Free Clean Up (2 Times)', 'Priority Booking', 'Special Member Offers']);

    const handleSelectPlan = () => {
        const planData = {
            id: plan._id || plan.id,
            name: plan.name,
            price: Number(plan.price || 0),
            duration: Number(plan.duration || 30),
            benefits: benefits,
        };
        navigate('/app/membership/checkout', { state: { plan: planData } });
    };

    return (
        <div
            style={{
                flexShrink: 0,
                width: '320px',
                background: gradient,
                borderRadius: '24px',
                padding: '24px',
                border: '1px solid rgba(0,0,0,0.02)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.015)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
            }}
        >
            {/* Top portion: Tier title, price & You save badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'left' }}>
                    <h3
                        style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}
                        className={isGold ? 'text-[#C8956C]' : 'text-slate-850'}
                    >
                        {plan.name}
                    </h3>
                    <p style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>
                        ₹{plan.price.toLocaleString()}
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginLeft: '4px' }}>
                            /{isYearly ? 'Year' : 'Month'}
                        </span>
                    </p>
                </div>
                <div
                    style={{
                        padding: '6px 10px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 700,
                        background: isGold ? '#FFF2E6' : '#F0EEFC',
                        color: isGold ? '#C8956C' : '#6366F1'
                    }}
                >
                    You save ₹{saveAmount}
                </div>
            </div>

            {/* Bottom portion: Benefits list and Buy button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    {benefits.slice(0, 4).map((benefit, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Check
                                size={13}
                                className={isGold ? 'text-[#C8956C]' : 'text-[#6366F1]'}
                                strokeWidth={3}
                            />
                            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{benefit}</span>
                        </div>
                    ))}
                </div>

                {/* Action button */}
                <div style={{ flexShrink: 0 }}>
                    <button
                        onClick={handleSelectPlan}
                        className="px-4 py-2.5 text-white font-black text-[11px] rounded-full shadow-md shadow-[#B4912B]/20 hover:opacity-90 active:scale-95 transition-all duration-200"
                        style={{
                            background: 'linear-gradient(135deg, #B4912B 0%, #D8B043 100%)',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
});

// Removed Particle component for performance optimization

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

const HomeSkeleton = ({ colors, isLight }) => (
    <div style={{ padding: '20px 16px', background: colors.bg, minHeight: '100svh' }}>
        <style>{`
            @keyframes shimmer_effect {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            .shimmer_box {
                background: ${isLight ? 'linear-gradient(90deg, #F3EAE3 25%, #E8ECEF 50%, #F3EAE3 75%)' : 'linear-gradient(90deg, #1A1411 25%, #2A211B 50%, #1A1411 75%)'};
                background-size: 200% 100%;
                animation: shimmer_effect 1.5s infinite linear;
            }
        `}</style>
        {/* Header Skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="shimmer_box" style={{ width: '36px', height: '36px', borderRadius: '12px' }} />
                <div className="space-y-2">
                    <div className="shimmer_box" style={{ width: '60px', height: '8px', borderRadius: '4px' }} />
                    <div className="shimmer_box" style={{ width: '100px', height: '12px', borderRadius: '6px' }} />
                </div>
            </div>
            <div className="shimmer_box" style={{ width: '36px', height: '36px', borderRadius: '12px' }} />
        </div>

        {/* Search Skeleton */}
        <div className="shimmer_box" style={{ width: '100%', height: '42px', borderRadius: '20px 6px 20px 6px', marginBottom: '20px' }} />

        {/* Gender Tabs Skeleton */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
            <div className="shimmer_box" style={{ flex: 1, height: '32px', borderRadius: '8px' }} />
            <div className="shimmer_box" style={{ flex: 1, height: '32px', borderRadius: '8px' }} />
        </div>

        {/* Banner Skeleton */}
        <div className="shimmer_box" style={{ width: '100%', height: '170px', borderRadius: '24px', marginBottom: '32px' }} />

        {/* Sections Skeleton */}
        {[1, 2].map(i => (
            <div key={i} style={{ marginBottom: '32px' }}>
                <div className="shimmer_box" style={{ width: '140px', height: '18px', borderRadius: '6px', marginBottom: '16px' }} />
                <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
                    {[1, 2, 3].map(j => (
                        <div key={j} className="shimmer_box" style={{ width: '180px', height: '220px', borderRadius: '24px', flexShrink: 0 }} />
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const stagger = {};
const fadeUp = {};

export default function AppHomePage() {
    const { customer } = useCustomerAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { gender, setGender } = useGender();
    // Fallback if gender is null
    const g = (gender === 'men' || gender === 'women') ? gender : 'women';

    const { theme, colors: themeColors, isLight } = useCustomerTheme();
    const colors = useMemo(() => ({
        ...themeColors,
        bg: '#FFFFFF',
        card: '#FFFFFF',
        accent: '#B4912B'
    }), [themeColors]);
    const {
        activeOutlet,
        activeOutletId,
        setActiveOutletId,
        activeSalonId,
        outlets,
        services: contextServices,
        products: contextProducts,
        productCategories: shopCategories,
        feedbacks: contextReviews,
        banners: contextBanners,
        nearbyOutlets: contextNearby,
        loyaltyPlans: contextPlans,
        categories: contextCategories,
        loyaltySettings: loyaltyRule,
        fetchLoyaltySettings,
        isInitializing: isContextInitializing,
        salon
    } = useBusiness();
    const servicesScrollRef = useRef(null);
    const outletsScrollRef = useRef(null);

    const shopCategoriesList = useMemo(() => {
        const counts = {};
        const shopProducts = (contextProducts || [])
            .filter((p) => p.isShopProduct)
            .map((p) => mapInventoryProductToShopProduct(p, shopCategories))
            .filter(Boolean);

        shopProducts.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });

        const catList = (shopCategories || []).map(c => ({
            name: c.name,
            img: c.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80',
            count: counts[c.name] || 0
        }));

        catList.sort((a, b) => b.count - a.count);

        return [
            { name: 'All', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80' },
            ...catList.map(c => ({ name: c.name, img: c.img }))
        ];
    }, [shopCategories, contextProducts]);

    const handleShopCategoryClick = (catName) => {
        if (catName === 'All') {
            navigate('/app/shop');
        } else {
            navigate(`/app/shop?category=${encodeURIComponent(catName)}`);
        }
    };

    const [selectedServiceCategory, setSelectedServiceCategory] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [activeOutletSlide, setActiveOutletSlide] = useState(0);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [globalLocations, setGlobalLocations] = useState([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [distanceFilter, setDistanceFilter] = useState(null);

    useEffect(() => {
        if (locationSearchQuery.length < 3) {
            setGlobalLocations([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearchingLocation(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationSearchQuery)}&format=json&limit=5&addressdetails=1`, {
                    headers: { 'Accept-Language': 'en-US,en;q=0.9' }
                });
                const data = await res.json();
                setGlobalLocations(data);
            } catch (err) {
                console.error('Error fetching locations:', err);
            } finally {
                setIsSearchingLocation(false);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [locationSearchQuery]);

    const activeOutletImages = useMemo(() => {
        if (!activeOutlet) return [];
        const imgList = [];
        if (activeOutlet.images && Array.isArray(activeOutlet.images) && activeOutlet.images.length > 0) {
            activeOutlet.images.forEach(img => {
                if (img) imgList.push(img);
            });
        }
        if (imgList.length === 0 && activeOutlet.image) {
            imgList.push(activeOutlet.image);
        }
        return imgList;
    }, [activeOutlet]);

    useEffect(() => {
        const savedCoords = localStorage.getItem('wapixo_user_coords');
        if (!savedCoords && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    localStorage.setItem('wapixo_user_coords', JSON.stringify(coords));
                    setUserLocation(coords);
                    window.location.reload();
                },
                (err) => console.log('Location fetch error:', err)
            );
        } else if (savedCoords) {
            setUserLocation(JSON.parse(savedCoords));
        }
    }, []);

    useEffect(() => {
        setActiveOutletSlide(0);
    }, [activeOutlet?._id]);

    useEffect(() => {
        if (activeOutletImages.length <= 1) return;
        const timer = setInterval(() => {
            setActiveOutletSlide((prev) => (prev + 1) % activeOutletImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [activeOutletImages]);

    const getOutletRating = useCallback((outlet) => {
        if (!outlet) return '0';
        const outletReviews = (contextReviews || []).filter(rev => {
            const revOutletId = rev.outletId?._id || rev.outletId || rev.outlet;
            return String(revOutletId) === String(outlet._id || outlet.id);
        });
        if (outletReviews.length === 0) {
            return outlet.rating || '0';
        }
        const sum = outletReviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        return (sum / outletReviews.length).toFixed(1);
    }, [contextReviews]);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/app/services?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const services = useMemo(() => (contextServices || []), [contextServices]);
    const products = useMemo(() => (contextProducts || []), [contextProducts]);
    const reviews = useMemo(() => (contextReviews || []).slice(0, 10), [contextReviews]);
    const banners = contextBanners || [];
    const membershipPlans = contextPlans || [];
    const categories = useMemo(() => {
        if (!contextServices || contextServices.length === 0) return [];
        const uniqueCatNames = [...new Set(contextServices.map(s => s.category).filter(Boolean))];
        return uniqueCatNames.map(name => ({
            name,
            status: 'active',
            gender: 'both' // Fallback
        }));
    }, [contextServices]);

    // Fetch loyalty settings if missing from initial data
    useEffect(() => {
        if (!loyaltyRule && activeSalonId) {
            fetchLoyaltySettings(activeSalonId);
        }
    }, [loyaltyRule, activeSalonId, fetchLoyaltySettings]);

    // No more lazy loading here, BusinessContext handles it all in one call!

    // Pre-select first category
    useEffect(() => {
        if (!selectedServiceCategory && categories?.length > 0) {
            const firstCat = categories.find(c => c.status === 'active');
            if (firstCat) setSelectedServiceCategory(firstCat.name);
        }
    }, [categories, selectedServiceCategory]);

    // Pre-select first category when categories load/gender changes
    useEffect(() => {
        if (!selectedServiceCategory && categories?.length > 0) {
            const firstCat = categories.find(c => c.status === 'active' && (c.gender === 'both' || !gender || c.gender === gender));
            if (firstCat) setSelectedServiceCategory(firstCat.name);
        }
    }, [categories, gender, selectedServiceCategory]);

    // Page loading state is now managed by BusinessContext initialization
    const isLoadingData = isContextInitializing;

    const onRefresh = useCallback(async () => {
        window.location.reload();
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


    // Auto-scroll logic for services
    useEffect(() => {
        let interval;
        const startAutoScroll = () => {
            const scrollContainer = servicesScrollRef.current;
            if (!scrollContainer || (services || []).length < 2) return;

            interval = setInterval(() => {
                const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
                if (scrollContainer.scrollLeft >= maxScroll - 20) {
                    scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainer.scrollBy({ left: 212, behavior: 'smooth' });
                }
            }, 4000);
        };

        // Small delay to ensure layout is ready
        const timeout = setTimeout(startAutoScroll, 1000);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [services]);

    // Auto-scroll logic for outlets
    useEffect(() => {
        let interval;
        const startAutoScroll = () => {
            const scrollContainer = outletsScrollRef.current;
            if (!scrollContainer || (outlets || []).length < 2) return;

            interval = setInterval(() => {
                const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
                if (scrollContainer.scrollLeft >= maxScroll - 20) {
                    scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainer.scrollBy({ left: 172, behavior: 'smooth' });
                }
            }, 4500);
        };

        const timeout = setTimeout(startAutoScroll, 1500);
        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [outlets]);

    const filteredPopularServices = useMemo(() => {
        let result = (services || []);

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase().replace(/\s/g, '');
            result = result.filter(s =>
                s.name.toLowerCase().replace(/\s/g, '').includes(q) ||
                (s.category && s.category.toLowerCase().replace(/\s/g, '').includes(q))
            );
        }

        return result.filter(s => {
            // Filter by outlet
            const matchesOutlet = !activeOutletId ||
                (s.outletIds && s.outletIds.includes(activeOutletId)) ||
                (s.outletId === activeOutletId) ||
                (s.outletId === 'all') ||
                (!s.outletId && (!s.outletIds || s.outletIds.length === 0));

            if (!matchesOutlet) return false;

            const cat = categories?.find(c => c.name === s.category);
            if (!cat) return true;
            if (!gender) return true;
            return cat.gender === 'both' || cat.gender === gender;
        });
    }, [services, gender, categories, searchQuery, activeOutletId]);

    const filteredPromos = useMemo(() => {
        return (banners || [])
            .filter((p) => {
                const isActive = p.status?.toLowerCase() === 'active' || p.status === undefined;
                const matchesGender = !p.gender || p.gender === 'all' || p.gender === g;

                // Show all banners regardless of selected outlet
                let matchesOutlet = true;

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

    if (isLoadingData || isContextInitializing) {
        return (
            <div style={{ background: colors.bg, minHeight: '100svh' }}>
                <HomeSkeleton colors={colors} isLight={isLight} />
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            <style>{`
                .search-input::placeholder {
                    color: ${isLight ? '#555' : 'rgba(255,255,255,0.6)'};
                    opacity: 0.8;
                }
            `}</style>
            <div
                style={{
                    background: colors.bg,
                    minHeight: '100svh',
                    color: colors.text
                }}
            >
                <div
                    style={{
                        padding: '16px 16px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <div onClick={() => setShowLocationModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            background: isLight ? '#FFF' : '#242424',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${colors.border}`
                        }}>
                            <MapPin size={18} style={{ color: colors.accent }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <p style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Selection</p>
                                <ChevronDown size={12} color={colors.textMuted} />
                            </div>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: colors.text, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {activeOutlet?.name || 'Wapixo Salon'}
                                <span style={{ fontSize: '12px' }}>📍</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* ── SEARCH BAR ── */}
                <div style={{ padding: '10px 16px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div
                        style={{
                            flex: 1,
                            background: '#F3F4F6',
                            borderRadius: '9999px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            height: '46px',
                            gap: '10px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <button
                            onClick={() => searchQuery.trim() && navigate(`/app/services?search=${encodeURIComponent(searchQuery.trim())}`)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <Search size={18} className="text-slate-400" />
                        </button>
                        <input
                            type="text"
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder={isFocused ? "" : (PLACEHOLDERS?.[placeholderIndex] || "Search...")}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#1e293b',
                                fontSize: '14px',
                                width: '100%',
                                height: '100%',
                                fontWeight: 500
                            }}
                        />
                    </div>
                </div>

                {/* ── GENDER TABS ── */}
                <div style={{ padding: '0 16px 12px', display: 'flex', gap: '0', borderBottom: `1px solid ${colors.border}` }}>
                    {['men', 'women'].map((tab) => (
                        <button
                            key={tab}
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
                                <div
                                    style={{
                                        position: 'absolute', bottom: '-1px', left: '15%', right: '15%', height: '3px', background: colors.accent, borderRadius: '4px',
                                        zIndex: 1
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* ── PROMO BANNER (CAROUSEL) ── */}
                <div style={{ padding: '20px 16px 0', position: 'relative' }}>
                    <div style={{ position: 'relative', height: '170px', borderRadius: '24px', overflow: 'hidden' }}>
                        {filteredPromos.length > 0 ? (
                            <div
                                key={`${g}-${currentPromoIndex}`}
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
                                    <p style={{ fontSize: '10px', color: colors.accent, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800 }}>
                                        {filteredPromos[currentPromoIndex]?.subtitle}
                                    </p>
                                    <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 14px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                                        {filteredPromos[currentPromoIndex]?.title?.split('\n').map((l, i) => (<span key={i}>{l}{i === 0 && <br />}</span>))}
                                    </h3>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            background: colors.accent, border: 'none', borderRadius: '16px',
                                            padding: '8px 20px', color: '#fff', fontSize: '12px', fontWeight: 800,
                                            textTransform: 'uppercase'
                                        }}>
                                        {filteredPromos[currentPromoIndex]?.btnText}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '100%', background: `${colors.accent}0d`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p style={{ color: colors.textMuted, fontSize: '12px' }}>No banners available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── SHOP CATEGORIES SECTION ── */}
                {shopCategoriesList.length > 1 && (
                    <div style={{ marginTop: '24px', marginBottom: '8px' }}>
                        <div className="app-scroll no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2">
                            {shopCategoriesList.map(cat => {
                                const isActive = cat.name === 'All';
                                return (
                                    <motion.div
                                        key={cat.name}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleShopCategoryClick(cat.name)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            flexShrink: 0,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '50%',
                                            padding: '2px',
                                            background: isActive ? colors.accent : 'transparent',
                                            border: isActive ? 'none' : `1px solid ${colors.border}`,
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            zIndex: 2
                                        }}>
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                background: colors.card,
                                                border: `2px solid ${isLight ? '#fff' : colors.bg}`
                                            }}>
                                                <img
                                                    src={getImageUrl(cat.img) || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80'}
                                                    alt={cat.name}
                                                    loading="lazy"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23222222%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EWapixo%3C%2Ftext%3E%3C%2Fsvg%3E"; }}
                                                />
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                background: isActive ? colors.accent : colors.card,
                                                color: isActive ? '#FFFFFF' : colors.text,
                                                borderRadius: '10px',
                                                padding: '4px 10px',
                                                boxShadow: isActive ? `0 4px 8px ${colors.accent}33` : 'none',
                                                border: isActive ? 'none' : `1px solid ${colors.border}`,
                                                marginTop: '-12px',
                                                zIndex: 3,
                                                minWidth: '50px',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '8px',
                                                    fontWeight: 800,
                                                    letterSpacing: '0.05em',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                {cat.name}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── SELECTED OUTLET ── */}
                {activeOutlet && (
                    <div style={{ padding: '24px 16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <Crown size={20} color={colors.accent} />
                            <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Selected Outlet</span>
                        </div>

                        <div
                            onClick={() => navigate(`/app/salon/${activeOutlet._id || activeOutlet.id}`)}
                            style={{
                                background: colors.card,
                                borderRadius: '28px',
                                border: `1px solid ${colors.border}`,
                                overflow: 'hidden',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease'
                            }}
                            className="active:scale-[0.98]"
                        >
                            {/* Image Carousel (Slideshow) */}
                            <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
                                {activeOutletImages.length > 0 ? (
                                    <img
                                        src={getImageUrl(activeOutletImages[activeOutletSlide])}
                                        alt={activeOutlet.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'opacity 0.5s ease-in-out'
                                        }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                                    />
                                ) : (
                                    <img
                                        src={fallbackImage}
                                        alt={activeOutlet.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}

                                {/* Navigation Arrow buttons */}
                                {activeOutletImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveOutletSlide((prev) => (prev - 1 + activeOutletImages.length) % activeOutletImages.length);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: 'rgba(0,0,0,0.6)',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                zIndex: 10,
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                lineHeight: 1
                                            }}
                                        >
                                            ‹
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveOutletSlide((prev) => (prev + 1) % activeOutletImages.length);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: 'rgba(0,0,0,0.6)',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                zIndex: 10,
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                lineHeight: 1
                                            }}
                                        >
                                            ›
                                        </button>
                                    </>
                                )}

                                {/* Dots */}
                                {activeOutletImages.length > 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        display: 'flex',
                                        gap: '6px',
                                        zIndex: 10
                                    }}>
                                        {activeOutletImages.map((_, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    width: activeOutletSlide === idx ? '16px' : '6px',
                                                    height: '6px',
                                                    borderRadius: '3px',
                                                    background: activeOutletSlide === idx ? colors.accent : 'rgba(255,255,255,0.6)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Details Section */}
                            <div style={{ padding: '18px 20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: colors.text, margin: 0 }}>
                                        {activeOutlet.name}
                                    </h3>
                                    <div style={{
                                        background: `${colors.accent}1a`,
                                        padding: '4px 10px',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        border: `1px solid ${colors.accent}30`
                                    }}>
                                        <Star size={14} fill={colors.accent} color={colors.accent} />
                                        <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'system-ui, -apple-system, sans-serif', color: colors.accent }}>{getOutletRating(activeOutlet)}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                    <MapPin size={14} color={colors.accent} />
                                    <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: 500 }}>
                                        {activeOutlet.address?.city || activeOutlet.address?.street || (typeof activeOutlet.address === 'string' ? activeOutlet.address.split(',')[0] : 'Wapixo Salon')}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                    <Clock size={14} color={colors.accent} />
                                    <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: 500, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        {getTodayTimingString(activeOutlet)}
                                    </span>
                                </div>


                                {/* Small "Active Selection" badge / details */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '12px',
                                    borderTop: `1px solid ${colors.border}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <ShieldCheck size={16} color="#48BB78" />
                                        <span style={{ fontSize: '11px', color: '#48BB78', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Currently Selected
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: colors.accent, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        View Profile <ChevronRight size={14} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── NEAREST SALONS ── */}
                <div style={{ padding: '24px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 850, color: colors.text, fontFamily: "'Inter', sans-serif" }}>Nearby Salons</h3>
                    </div>

                    {/* Distance filter buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
                        <button
                            onClick={() => setDistanceFilter(null)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '9999px',
                                fontSize: '13px',
                                fontWeight: 700,
                                border: distanceFilter === null ? 'none' : '1px solid #F1F5F9',
                                background: distanceFilter === null ? '#B4912B' : '#FFFFFF',
                                color: distanceFilter === null ? '#FFFFFF' : '#0F172A',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: distanceFilter === null ? '0 4px 12px rgba(180, 145, 43, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                whiteSpace: 'nowrap'
                            }}
                            className="active:scale-95"
                        >
                            All
                        </button>
                        {[2, 5, 10].map((km) => {
                            const isSelected = distanceFilter === km;
                            return (
                                <button
                                    key={km}
                                    onClick={() => setDistanceFilter(isSelected ? null : km)}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '9999px',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        border: isSelected ? 'none' : '1px solid #F1F5F9',
                                        background: isSelected ? '#B4912B' : '#FFFFFF',
                                        color: isSelected ? '#FFFFFF' : '#0F172A',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isSelected ? '0 4px 12px rgba(180, 145, 43, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.02)',
                                        whiteSpace: 'nowrap'
                                    }}
                                    className="active:scale-95"
                                >
                                    Within {km} km
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(() => {
                            const sourceOutlets = (outlets || []);
                            const otherSalons = sourceOutlets.map(o => {
                                const code = String(o._id || o.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                const dist = userLocation && o.location?.coordinates?.length === 2
                                    ? calculateDistance(userLocation.lat, userLocation.lng, o.location.coordinates[1], o.location.coordinates[0])
                                    : null;
                                const effectiveDist = dist !== null ? dist : ((code % 5) * 0.4 + 0.5);
                                return { ...o, calculatedDist: dist, effectiveDist };
                            });
                            
                            // Filter by distance if filter is active
                            const filteredSalons = distanceFilter
                                ? otherSalons.filter(s => s.effectiveDist <= distanceFilter)
                                : otherSalons;

                            const sortedSalons = [...filteredSalons].sort((a, b) => {
                                return a.effectiveDist - b.effectiveDist;
                            });

                            if (sortedSalons.length === 0) {
                                return (
                                    <div style={{ width: '100%', padding: '40px 20px', textAlign: 'center', background: 'rgba(180, 145, 43, 0.05)', borderRadius: '24px' }}>
                                        <div className="w-12 h-12 bg-[#B4912B]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MapPin size={24} color={colors.accent} className="opacity-40" />
                                        </div>
                                        <p style={{ color: colors.textMuted, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No salons found within {distanceFilter} km</p>
                                    </div>
                                );
                            }

                            return sortedSalons.slice(0, 3).map(outlet => {
                                const code = String(outlet._id || outlet.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                const mockReviewsCount = (code % 150) + 180; // Stable count between 180 and 330
                                const mockStartingPrice = (code % 3) * 100 + 199; // Stable starting price e.g., ₹199, ₹299, ₹399
                                const distString = outlet.calculatedDist !== undefined && outlet.calculatedDist !== null
                                    ? `${outlet.calculatedDist.toFixed(1)} km`
                                    : `${(code % 5) * 0.4 + 0.5} km`;

                                return (
                                    <div
                                        key={outlet._id}
                                        onClick={() => {
                                            setActiveOutletId(outlet._id);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="bg-white border border-slate-100 rounded-[24px] p-3 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.015)] cursor-pointer active:scale-[0.99] transition-transform duration-200"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            {/* Circular avatar on the left */}
                                            <div className="w-[66px] h-[66px] rounded-full overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                                                <img
                                                    src={getImageUrl(outlet.images?.[0] || outlet.image) || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200'}
                                                    alt={outlet.name}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200'; }}
                                                />
                                            </div>

                                            {/* Details group */}
                                            <div className="flex flex-col text-left min-w-0 flex-1">
                                                <h4 className="text-[14px] font-bold text-slate-800 leading-snug mb-0.5 truncate">{outlet.name}</h4>

                                                <div className="flex items-center gap-2.5 mb-1">
                                                    {/* Rating */}
                                                    <div className="flex items-center gap-0.5">
                                                        <Star size={12} fill="#B4912B" color="#B4912B" />
                                                        <span className="text-[11px] font-bold text-slate-700">{getOutletRating(outlet)}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">({mockReviewsCount})</span>
                                                    </div>

                                                    {/* Distance */}
                                                    <div className="flex items-center gap-0.5">
                                                        <span className="inline-block w-1.5 h-1.5 rounded-full border border-[#B4912B] bg-white mr-0.5"></span>
                                                        <span className="text-[11px] font-medium text-slate-500">{distString}</span>
                                                    </div>
                                                </div>

                                                <p className="text-[12px] font-medium text-slate-500">
                                                    Starting <span className="font-bold text-slate-800">₹{mockStartingPrice}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status and button on the right */}
                                        <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                                            <span className="text-[11px] font-bold text-emerald-600">Open</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveOutletId(outlet._id);
                                                    navigate(`/app/booking`);
                                                }}
                                                className="px-4 py-2 bg-[#B4912B] text-black font-bold text-[12px] rounded-[18px] shadow-sm hover:opacity-90 active:scale-95 transition-all duration-200"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* ── TRENDING SERVICES ── */}
                <div style={{ padding: '24px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 850, color: colors.text, fontFamily: "'Inter', sans-serif" }}>Trending Services</h3>
                        <span
                            onClick={() => navigate('/app/services')}
                            style={{ fontSize: '13px', fontWeight: 800, color: '#B4912B', cursor: 'pointer', hover: 'opacity-85' }}
                        >
                            See all
                        </span>
                    </div>
                    <div
                        className="app-scroll no-scrollbar"
                        ref={servicesScrollRef}
                        style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px' }}
                    >
                        {(() => {
                            const sourceServices = services || [];
                            const filtered = sourceServices.filter(s => {
                                const isActive = s.status === 'active';
                                const matchesOutlet = !activeOutletId ||
                                    (s.outletIds && s.outletIds.includes(activeOutletId)) ||
                                    (s.outletId === activeOutletId) ||
                                    (s.outletId === 'all') ||
                                    (!s.outletId && (!s.outletIds || s.outletIds.length === 0));
                                return isActive && matchesOutlet;
                            });
                            if (filtered.length === 0) {
                                return (
                                    <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>No services found</div>
                                );
                            }
                            return filtered.map(service => (
                                <div
                                    key={service._id || service.id}
                                    onClick={() => navigate(`/app/service/${service._id || service.id}`)}
                                    style={{
                                        flexShrink: 0,
                                        width: '110px',
                                        scrollSnapAlign: 'start',
                                        background: '#F5F6F8',
                                        borderRadius: '20px',
                                        padding: '6px',
                                        border: '1px solid rgba(0,0,0,0.02)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    className="active:scale-95 transition-transform duration-200"
                                >
                                    <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '15px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                                        <img
                                            src={getImageUrl(service.image) || fallbackImage}
                                            alt={service.name}
                                            loading="lazy"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: '100%',
                                            textAlign: 'center',
                                            padding: '4px 2px',
                                            marginTop: '4px'
                                        }}
                                    >
                                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#334155', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {service.name}
                                        </p>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* ── 5.5 PRODUCTS (Luxe Essentials) ── */}
                <div style={{ padding: '24px 16px 0' }}>
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
                        <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>No products available</div>
                    ) : (
                        <div
                            className="app-scroll no-scrollbar"
                            style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' }}
                        >
                            {products.filter(p => p.isShopProduct).slice(0, 15).map(product => (
                                <div
                                    key={product._id || product.id}
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
                                        <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', padding: '2px 5px', borderRadius: '4px', color: '#FFF', fontSize: '7px', fontWeight: 900 }}>
                                            {product.brand}
                                        </div>
                                    </div>
                                    <div style={{ padding: '10px' }}>
                                        <p style={{ fontSize: '11px', fontWeight: 800, color: colors.text, margin: '0 0 2px' }}>{product.name}</p>
                                        <p style={{ fontSize: '12px', fontWeight: 900, color: colors.accent, margin: 0 }}>₹{product.sellingPrice || product.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── 6. TRUSTED REVIEWS ── */}
                <div style={{ padding: '32px 16px 24px' }}>
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
                                    <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>No reviews available</div>
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
                                                <Star key={s} size={10} fill={s <= rev.rating ? colors.accent : 'none'} color={s <= rev.rating ? colors.accent : colors.textMuted} strokeWidth={2.5} />
                                            ))}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ display: 'block', fontSize: '8px', fontWeight: 900, color: colors.accent, marginBottom: '2px', letterSpacing: '0.05em' }}>VERIFIED</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '12px', color: colors.text, margin: '0 0 12px', fontStyle: 'italic', lineHeight: 1.4, lineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>"{rev.comment}"</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '9px', fontWeight: 800 }}>
                                            {(rev.customerId?.name || rev.customerName || 'U')[0]}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '10px', fontWeight: 800, color: colors.text, margin: 0 }}>{rev.customerId?.name || rev.customerName}</p>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* ── 7. MEMBERSHIP PLANS ── */}
                <div style={{ padding: '0 16px 32px' }}>
                    <div style={{ color: colors.accent, fontSize: '10px', fontWeight: 900, marginBottom: '6px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        Premium Memberships
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Crown size={20} color={colors.accent} />
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0 }}>Membership</h3>
                                <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>Join our membership for exclusive benefits</p>
                            </div>
                        </div>
                    </div>
                    {membershipPlans.length === 0 ? (
                        <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>No membership plans available</div>
                    ) : (
                        <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                            {membershipPlans.filter(p => p.isActive !== false).map((plan) => (
                                <MembershipPlanCard key={plan._id || plan.id} plan={plan} colors={colors} isLight={isLight} />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── 8. LOYALTY RULES ── */}
                <div style={{ padding: '0 16px 32px' }}>
                    <div style={{ color: colors.accent, fontSize: '10px', fontWeight: 900, marginBottom: '6px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        Loyalty Program
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                        <Gift size={20} color={colors.accent} />
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0 }}>Loyalty</h3>
                            <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>Earn points and get rewards</p>
                        </div>
                    </div>

                    {!loyaltyRule || !loyaltyRule.active ? (
                        <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>Loyalty rewards currently unavailable</div>
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
                </div>

            </div>

            {/* ── LOCATION SELECTION MODAL ── */}
            {createPortal(
                <AnimatePresence>
                    {showLocationModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowLocationModal(false)}
                                style={{
                                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99998,
                                    backdropFilter: 'blur(4px)'
                                }}
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                style={{
                                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999,
                                    background: colors.card, borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                                    padding: '24px', paddingBottom: '32px', maxHeight: '80vh', overflowY: 'auto'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: colors.text, margin: 0 }}>Select Location</h3>
                                    <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: 0 }}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition(
                                                (pos) => {
                                                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                                    localStorage.setItem('wapixo_user_coords', JSON.stringify(coords));
                                                    window.location.reload();
                                                },
                                                (err) => alert('Please enable location access in your browser settings to use this feature.')
                                            );
                                        } else {
                                            alert('Geolocation is not supported by your browser.');
                                        }
                                    }}
                                    style={{
                                        width: '100%', padding: '16px', background: `${colors.accent}15`, border: `1px solid ${colors.accent}30`,
                                        borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '20px'
                                    }}
                                >
                                    <Navigation size={20} color={colors.accent} />
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.accent }}>Use Current Location</p>
                                        <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>Find nearest salons automatically</p>
                                    </div>
                                </button>

                                <p style={{ fontSize: '12px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Or select manually</p>

                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px', background: isLight ? '#f9f9fa' : '#242424',
                                    padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', border: `1px solid ${colors.border}`
                                }}>
                                    <Search size={16} color={colors.textMuted} />
                                    <input
                                        type="text"
                                        placeholder="Search area, city or salon..."
                                        value={locationSearchQuery}
                                        onChange={(e) => setLocationSearchQuery(e.target.value)}
                                        style={{
                                            background: 'transparent', border: 'none', outline: 'none',
                                            width: '100%', fontSize: '14px', color: colors.text
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                                    {/* Global Locations from API */}
                                    {locationSearchQuery.length >= 3 && (
                                        <>
                                            <p style={{ fontSize: '10px', fontWeight: 800, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '8px 0 0 0' }}>Global Locations</p>
                                            {isSearchingLocation ? (
                                                <div style={{ padding: '16px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>Fetching locations...</div>
                                            ) : globalLocations.length > 0 ? (
                                                globalLocations.map((loc, idx) => (
                                                    <div
                                                        key={`loc-${idx}`}
                                                        onClick={() => {
                                                            const coords = { lat: parseFloat(loc.lat), lng: parseFloat(loc.lon) };
                                                            localStorage.setItem('wapixo_user_coords', JSON.stringify(coords));
                                                            window.location.reload();
                                                        }}
                                                        style={{
                                                            padding: '14px', border: `1px solid ${colors.border}`,
                                                            borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                                                            cursor: 'pointer', background: 'transparent', transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${colors.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <MapPin size={16} color={colors.accent} />
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc.name}</p>
                                                            <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc.display_name.split(',').slice(1).join(',').trim()}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ padding: '16px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>No global locations found</div>
                                            )}

                                            <p style={{ fontSize: '10px', fontWeight: 800, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '12px 0 0 0' }}>Available Salons</p>
                                        </>
                                    )}

                                    {/* Available Salons */}
                                    {(outlets || [])
                                        .filter(outlet => {
                                            if (!locationSearchQuery.trim()) return true;
                                            const q = locationSearchQuery.toLowerCase();
                                            return outlet.name?.toLowerCase().includes(q) ||
                                                outlet.address?.city?.toLowerCase().includes(q) ||
                                                outlet.address?.street?.toLowerCase().includes(q);
                                        })
                                        .map(outlet => {
                                            const isSelected = activeOutletId === (outlet._id || outlet.id);
                                            return (
                                                <div
                                                    key={outlet._id || outlet.id}
                                                    onClick={() => {
                                                        setActiveOutletId(outlet._id || outlet.id);
                                                        setShowLocationModal(false);
                                                    }}
                                                    style={{
                                                        padding: '16px', border: `1px solid ${isSelected ? colors.accent : colors.border}`,
                                                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        cursor: 'pointer', background: isSelected ? `${colors.accent}0a` : 'transparent',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: colors.bg, border: `1px solid ${colors.border}` }}>
                                                            <img src={getImageUrl(outlet.image || outlet.images?.[0]) || fallbackImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }} />
                                                        </div>
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.text }}>{outlet.name}</p>
                                                            <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{outlet.address?.city || outlet.address?.street || 'Our Location'}</p>
                                                        </div>
                                                    </div>
                                                    {isSelected && <Check size={18} color={colors.accent} />}
                                                </div>
                                            );
                                        })}

                                    {(outlets || []).filter(outlet => {
                                        if (!locationSearchQuery.trim()) return true;
                                        const q = locationSearchQuery.toLowerCase();
                                        return outlet.name?.toLowerCase().includes(q) ||
                                            outlet.address?.city?.toLowerCase().includes(q) ||
                                            outlet.address?.street?.toLowerCase().includes(q);
                                    }).length === 0 && (
                                            <div style={{ padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>
                                                No salons found matching "{locationSearchQuery}"
                                            </div>
                                        )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
