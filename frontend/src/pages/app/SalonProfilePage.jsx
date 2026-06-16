import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Star, MapPin, Phone, Navigation2,
    Clock, ShieldCheck, Heart, Share2, Crown,
    Award, Camera, MessageSquare, Info, ArrowRight,
    Instagram
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../data/appMockData';
import homeData from '../../data/appHomeData.json';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCMS } from '../../contexts/CMSContext';
import { useGender } from '../../contexts/GenderContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import { getImageUrl } from '../../utils/imageUtils';

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
    if (!outlet?.workingHours || outlet.workingHours.length === 0) return 'Open daily: 9:00 AM - 9:00 PM';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const todayHours = outlet.workingHours.find(h => h.day === today);
    if (!todayHours || !todayHours.isOpen) return 'Closed today';
    return `Open · Closes ${todayHours.closeTime}`;
};

export default function SalonProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { colors, isLight } = useCustomerTheme();
    const { isSalonLiked, toggleSalonLike } = useFavorites();
    const { lookbook } = useCMS();
    const { gender } = useGender();
    const {
        feedbacks,
        addFeedback,
        fetchFeedbacks,
        services: businessServices,
        outlets: businessOutlets,
        categories: businessCategories,
        salon
    } = useBusiness();
    const { user } = useAuth();

    useEffect(() => {
        if (id) {
            fetchFeedbacks(null, id, 'Approved');
        }
    }, [id, fetchFeedbacks]);

    const g = (gender === 'men' || gender === 'women') ? gender : 'women';
    const isFavorite = isSalonLiked(id);

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'About');
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state?.activeTab]);

    const outlet = businessOutlets.find(o => o._id === id) || businessOutlets[0] || { name: 'Loading...', image: '', images: [] };

    useEffect(() => {
        const images = outlet.images?.length > 0 ? outlet.images : [outlet.image];
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImgIndex(prev => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [outlet.images, outlet.image]);

    const serviceIdFromQuery = searchParams.get('serviceId');

    const [isWritingReview, setIsWritingReview] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewerName, setReviewerName] = useState('');
    const [reviewImages, setReviewImages] = useState([]);
    const fileInputRef = useRef(null);

    const fileToDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        try {
            const newImages = await Promise.all(files.map(fileToDataUrl));
            setReviewImages(prev => [...prev, ...newImages.filter(Boolean)]);
        } catch {
            alert('Could not read selected image(s). Please try another file.');
        }
    };

    const handleSubmitReview = async () => {
        if (reviewRating === 0 || reviewText.trim() === '') return;
        const created = await addFeedback({
            outletId: id,
            customerName: reviewerName.trim() || user?.name || 'Anonymous User',
            rating: reviewRating,
            comment: reviewText.trim(),
            service: 'General Service',
            staffName: 'Unassigned',
            images: reviewImages,
            status: 'Pending'
        });
        if (!created) {
            alert('Feedback submit failed. Please try again.');
            return;
        }
        setReviewRating(0);
        setReviewText('');
        setReviewerName('');
        setReviewImages([]);
        setIsWritingReview(false);
    };

    const TABS = ['About', 'Services', 'Gallery', 'Reviews'];

    const handleShare = async () => {
        try {
            const shareText = `Check out ${outlet.name}! Use my code REFER500 to get ₹200 off your first visit.`;
            if (navigator.share) {
                await navigator.share({ title: outlet.name, text: shareText, url: window.location.href });
            } else {
                await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
                alert('Referral link copied to clipboard!');
            }
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const handleCall = () => {
        if (outlet.phone) {
            window.location.href = `tel:${outlet.phone.replace(/\s+/g, '')}`;
        }
    };

    const handleDirections = () => {
        if (outlet.location) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${outlet.location.lat},${outlet.location.lng}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(outlet.name + ' ' + getAddressString(outlet.address))}`, '_blank');
        }
    };

    const handleWhatsApp = () => {
        const phone = outlet.whatsapp || outlet.phone || '';
        const cleanPhone = phone.replace(/\D/g, '');
        const text = encodeURIComponent(`Hi! I'd like to book an appointment at ${outlet.name}.`);
        if (cleanPhone) {
            window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
        }
    };

    const handleInstagram = () => {
        const insta = outlet.instagram || outlet.social?.instagram || '';
        if (insta) {
            window.open(insta.startsWith('http') ? insta : `https://instagram.com/${insta}`, '_blank');
        }
    };

    const outletServices = businessServices.filter(s => {
        const isMatch = (!s.outletIds || s.outletIds.length === 0) ||
            (s.outletIds).map(oid => String(oid)).includes(String(id)) ||
            String(s.outletId) === String(id) ||
            s.outlet === 'All Outlets';
        const category = businessCategories.find(c => c.name === s.category);
        const genderMatch = !category || category.gender === 'both' || category.gender === g;
        return isMatch && genderMatch && s.status === 'active';
    });

    const accent = colors.accent || '#B4912B';
    const heroImages = outlet.images?.length > 0 ? outlet.images : (outlet.image ? [outlet.image] : []);
    const outletRating = outlet.rating || '4.8';

    const fadeUp = {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, y: -10 }
    };

    const quickActions = [
        { label: 'Call', icon: Phone, bg: '#FBBF24', color: '#fff', action: handleCall },
        { label: 'WhatsApp', icon: MessageSquare, bg: '#22C55E', color: '#fff', action: handleWhatsApp },
        { label: 'Instagram', icon: Instagram, bg: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', action: handleInstagram },
        { label: 'Directions', icon: Navigation2, bg: '#3B82F6', color: '#fff', action: handleDirections },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#1A1A1A', paddingBottom: '40px', fontFamily: "'Inter', -apple-system, sans-serif" }}>

            {/* ── HERO IMAGE ── */}
            <div style={{ position: 'relative', height: '260px', width: '100%' }}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImgIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        src={getImageUrl(heroImages[currentImgIndex] || heroImages[0])}
                        alt={outlet.name}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            borderRadius: '0 0 28px 28px',
                            position: 'absolute'
                        }}
                        onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                </AnimatePresence>

                {/* Dark overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 50%)',
                    borderRadius: '0 0 28px 28px'
                }} />

                {/* Progress bars */}
                {heroImages.length > 1 && (
                    <div style={{ position: 'absolute', top: '12px', left: '16px', right: '16px', display: 'flex', gap: '4px', zIndex: 10 }}>
                        {heroImages.map((_, i) => (
                            <div key={i} style={{
                                flex: 1, height: '2px', borderRadius: '2px',
                                background: i === currentImgIndex ? '#FFF' : 'rgba(255,255,255,0.35)',
                                transition: 'all 0.4s ease'
                            }} />
                        ))}
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        position: 'absolute', top: '16px', left: '16px', zIndex: 20,
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.3)', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#FFF', cursor: 'pointer', backdropFilter: 'blur(8px)'
                    }}
                >
                    <ChevronLeft size={22} />
                </button>

                {/* Heart + Share */}
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '10px', zIndex: 20 }}>
                    <button
                        onClick={() => toggleSalonLike(id)}
                        style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'rgba(0,0,0,0.3)', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isFavorite ? '#FF4757' : '#FFF', cursor: 'pointer',
                            backdropFilter: 'blur(8px)'
                        }}
                    >
                        <Heart size={18} fill={isFavorite ? '#FF4757' : 'none'} />
                    </button>
                    <button
                        onClick={handleShare}
                        style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'rgba(0,0,0,0.3)', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#FFF', cursor: 'pointer', backdropFilter: 'blur(8px)'
                        }}
                    >
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* ── SALON IDENTITY ── */}
            <div style={{ padding: '0 20px', marginTop: '-28px', position: 'relative', zIndex: 10 }}>
                {/* Circular Avatar */}
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #DFAC2C 0%, #B98514 100%)',
                    border: '3px solid #FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', fontWeight: 900, color: '#FFF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    marginBottom: '12px',
                    overflow: 'hidden'
                }}>
                    {heroImages[0] ? (
                        <img
                            src={getImageUrl(heroImages[0])}
                            alt={outlet.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        outlet.name?.charAt(0) || 'S'
                    )}
                </div>

                {/* Name */}
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A', margin: '0 0 6px' }}>
                    {outlet.name}
                </h1>

                {/* Rating row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Star size={15} fill={accent} color={accent} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{outletRating}</span>
                    <span style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>
                        ({feedbacks?.filter(f => f.status === 'Approved').length || 0} Reviews)
                    </span>
                </div>

                {/* Type tag */}
                <span style={{
                    fontSize: '12px', color: '#555', fontWeight: 500
                }}>
                    {outlet.type || 'Unisex Salon'}
                </span>
            </div>

            {/* ── QUICK ACTION BUTTONS ── */}
            <div style={{ padding: '20px 20px 0', display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                {quickActions.map(({ label, icon: Icon, bg, color, action }) => (
                    <motion.button
                        key={label}
                        whileTap={{ scale: 0.92 }}
                        onClick={action}
                        style={{
                            flex: 1, height: '64px', borderRadius: '16px',
                            background: bg, color, border: 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: '4px', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Icon size={20} strokeWidth={2} />
                        <span style={{ fontSize: '10px', fontWeight: 700 }}>{label}</span>
                    </motion.button>
                ))}
            </div>

            {/* ── TAB BAR ── */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: '#FFFFFF',
                padding: '16px 20px 0',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                marginTop: '20px'
            }}>
                <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }} className="no-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '10px 16px', background: 'none', border: 'none',
                                position: 'relative', whiteSpace: 'nowrap',
                                color: activeTab === tab ? '#1A1A1A' : '#999',
                                fontSize: '14px', fontWeight: activeTab === tab ? 700 : 500,
                                cursor: 'pointer', transition: 'color 0.2s'
                            }}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTabBar"
                                    style={{
                                        position: 'absolute', bottom: 0, left: '16px', right: '16px',
                                        height: '2.5px', background: accent, borderRadius: '2px'
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TAB CONTENT ── */}
            <AnimatePresence mode="wait">

                {/* ABOUT TAB */}
                {activeTab === 'About' && (
                    <motion.div key="about" {...fadeUp} style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Description */}
                        <p style={{ fontSize: '14px', lineHeight: '1.65', color: '#444', margin: 0 }}>
                            {outlet.description || `${outlet.name} is a premium salon offering world-class services with top professionals and luxury products.`}
                        </p>

                        {/* Location */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MapPin size={16} color={accent} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', color: '#555', fontWeight: 500 }}>
                                {getAddressString(outlet.address) || 'Location not available'}
                            </span>
                        </div>

                        {/* Hours */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={16} color={accent} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', color: '#555', fontWeight: 500 }}>
                                {getTodayTimingString(outlet)}
                            </span>
                        </div>

                        {/* Working hours breakdown */}
                        {outlet.workingHours?.length > 0 && (
                            <div style={{
                                background: '#F9F9F9', borderRadius: '16px', padding: '16px',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Working Hours</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {outlet.workingHours.map(day => (
                                        <div key={day.day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                            <span style={{ color: '#888', fontWeight: 500 }}>{day.day}</span>
                                            <span style={{ fontWeight: 700, color: day.isOpen ? '#1A1A1A' : '#FF4757' }}>
                                                {day.isOpen ? `${day.openTime} – ${day.closeTime}` : 'Closed'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Amenities */}
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Amenities</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                {['Free Wi-Fi', 'Parking Area', 'AC', 'Coffee/Tea', 'Magazines', 'Sanitized Tools'].map(ami => (
                                    <div key={ami} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent, flexShrink: 0 }} />
                                        {ami}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* SERVICES TAB */}
                {activeTab === 'Services' && (
                    <motion.div key="services" {...fadeUp} style={{ padding: '20px 20px' }}>
                        {/* Top Services Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1A1A1A', margin: 0 }}>Top Services</h3>
                            <button
                                onClick={() => navigate(`/app/book?outletId=${id}`)}
                                style={{ background: 'none', border: 'none', color: accent, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                See all
                            </button>
                        </div>

                        {/* Service List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {outletServices.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAA', fontSize: '13px' }}>
                                    No services available for this outlet.
                                </div>
                            )}
                            {outletServices.slice(0, 10).map((service, idx) => (
                                <motion.div
                                    key={service._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                        padding: '14px 0',
                                        borderBottom: idx < outletServices.slice(0, 10).length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none'
                                    }}
                                >
                                    {/* Circular image */}
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '50%',
                                        overflow: 'hidden', flexShrink: 0,
                                        background: '#F0F0F0',
                                        border: '1px solid rgba(0,0,0,0.06)'
                                    }}>
                                        <img
                                            src={getImageUrl(service.image || heroImages[0])}
                                            alt={service.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={e => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=f0f0f0&color=888&size=56`;
                                            }}
                                        />
                                    </div>

                                    {/* Name + duration */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {service.name}
                                        </h4>
                                        <p style={{ fontSize: '12px', color: '#888', margin: 0, fontWeight: 500 }}>
                                            {service.duration} min
                                            {outlet?.showServicePrice !== false && salon?.showServicePrice !== false && service.price && (
                                                <span style={{ color: accent, fontWeight: 700, marginLeft: '8px' }}>₹{service.price}</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Outlined Book pill button */}
                                    <motion.button
                                        whileTap={{ scale: 0.93 }}
                                        onClick={() => navigate(`/app/book?outletId=${id}&serviceId=${service._id}`)}
                                        style={{
                                            padding: '8px 20px',
                                            borderRadius: '100px',
                                            border: `1.5px solid ${accent}`,
                                            background: serviceIdFromQuery === service._id ? accent : 'transparent',
                                            color: serviceIdFromQuery === service._id ? '#FFF' : accent,
                                            fontSize: '12px', fontWeight: 700,
                                            cursor: 'pointer', flexShrink: 0,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {serviceIdFromQuery === service._id ? 'Selected' : 'Book'}
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Book Appointment CTA */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/app/book?outletId=${id}${serviceIdFromQuery ? `&serviceId=${serviceIdFromQuery}` : ''}`)}
                            style={{
                                width: '100%', height: '50px', marginTop: '20px',
                                background: accent, color: '#FFF',
                                borderRadius: '14px', fontSize: '14px',
                                fontWeight: 800, border: 'none',
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                                boxShadow: `0 8px 24px ${accent}40`,
                                cursor: 'pointer'
                            }}
                        >
                            Book Appointment
                        </motion.button>
                    </motion.div>
                )}

                {/* GALLERY TAB */}
                {activeTab === 'Gallery' && (
                    <motion.div key="gallery" {...fadeUp} style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1A1A1A', margin: 0 }}>Gallery</h3>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: accent, padding: '4px 12px', background: `${accent}15`, borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {heroImages.length} Photos
                            </span>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gridAutoRows: 'minmax(160px, auto)',
                            gap: '10px'
                        }}>
                            {heroImages.length > 0 ? (
                                heroImages.map((img, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            position: 'relative', borderRadius: '18px',
                                            overflow: 'hidden', background: '#F0F0F0',
                                            gridColumn: idx % 3 === 0 ? 'span 2' : 'span 1',
                                            height: idx % 3 === 0 ? '220px' : '180px'
                                        }}
                                    >
                                        <img
                                            src={getImageUrl(img)}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            alt={`Gallery ${idx + 1}`}
                                        />
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                            padding: '12px 14px',
                                            background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
                                            color: '#FFF', display: 'flex', alignItems: 'center', gap: '5px'
                                        }}>
                                            <Camera size={12} />
                                            <p style={{ fontSize: '10px', fontWeight: 700, margin: 0 }}>Look #{idx + 1}</p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div style={{ gridColumn: 'span 2', padding: '60px 20px', textAlign: 'center', color: '#AAA', fontSize: '13px' }}>
                                    No gallery images yet.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'Reviews' && (
                    <motion.div key="reviews" {...fadeUp} style={{ padding: '20px' }}>
                        {/* Rating Summary */}
                        <div style={{
                            background: `${accent}10`, padding: '20px', borderRadius: '20px',
                            textAlign: 'center', marginBottom: '20px',
                            border: `1px solid ${accent}20`
                        }}>
                            <h4 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 4px', color: '#1A1A1A' }}>{outletRating}</h4>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '6px' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={18} fill={i <= Math.round(outletRating) ? accent : 'none'} color={accent} />
                                ))}
                            </div>
                            <p style={{ fontSize: '12px', color: '#888', margin: 0, fontWeight: 500 }}>
                                Based on {feedbacks?.filter(f => f.status === 'Approved').length || 0} verified reviews
                            </p>
                        </div>

                        {/* Write Review Button */}
                        {!isWritingReview ? (
                            <button
                                onClick={() => setIsWritingReview(true)}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: '#F5F5F5', border: '1px solid rgba(0,0,0,0.08)',
                                    borderRadius: '14px', color: '#444',
                                    fontSize: '14px', fontWeight: 700,
                                    marginBottom: '20px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <MessageSquare size={17} />
                                Write a Review
                            </button>
                        ) : (
                            <div style={{ marginBottom: '20px', padding: '20px', background: '#F9F9F9', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.07)' }}>
                                <h5 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', color: '#1A1A1A' }}>Your Experience</h5>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <button key={i} onClick={() => setReviewRating(i)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                                            <Star size={26} fill={reviewRating >= i ? accent : 'none'} color={accent} />
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={reviewerName}
                                    onChange={e => setReviewerName(e.target.value)}
                                    placeholder="Your Name (Optional)"
                                    style={{
                                        width: '100%', background: '#FFFFFF',
                                        border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px',
                                        padding: '12px 14px', color: '#1A1A1A', fontSize: '14px',
                                        marginBottom: '12px', fontFamily: 'inherit', boxSizing: 'border-box'
                                    }}
                                />
                                <textarea
                                    value={reviewText}
                                    onChange={e => setReviewText(e.target.value)}
                                    placeholder="Tell us what you loved..."
                                    rows={3}
                                    style={{
                                        width: '100%', background: '#FFFFFF',
                                        border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px',
                                        padding: '12px 14px', color: '#1A1A1A', fontSize: '14px',
                                        resize: 'none', marginBottom: '12px',
                                        fontFamily: 'inherit', boxSizing: 'border-box'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto' }} className="no-scrollbar">
                                    <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => fileInputRef.current.click()}
                                        style={{
                                            width: '56px', height: '56px', borderRadius: '12px',
                                            border: `1.5px dashed ${accent}`, display: 'flex',
                                            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            gap: '3px', background: 'none', color: accent, flexShrink: 0, cursor: 'pointer'
                                        }}
                                    >
                                        <Camera size={16} />
                                        <span style={{ fontSize: '8px', fontWeight: 800 }}>Add</span>
                                    </motion.button>
                                    {reviewImages.map((imgUrl, index) => (
                                        <div key={index} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                            <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button
                                                onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== index))}
                                                style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#FFF', border: 'none', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => { setIsWritingReview(false); setReviewRating(0); setReviewText(''); setReviewImages([]); }}
                                        style={{ flex: 1, padding: '13px', background: '#EFEFEF', color: '#444', borderRadius: '12px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={reviewRating === 0 || !reviewText.trim()}
                                        style={{ flex: 1, padding: '13px', background: accent, color: '#FFF', borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: 'none', opacity: (reviewRating === 0 || !reviewText.trim()) ? 0.5 : 1, cursor: 'pointer' }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Review List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {feedbacks.filter(f => f.status === 'Approved').map((review, idx, arr) => (
                                <div key={review.id} style={{
                                    paddingBottom: '18px', marginBottom: '18px',
                                    borderBottom: idx < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: accent, display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', color: '#FFF', fontSize: '14px', fontWeight: 800, flexShrink: 0
                                            }}>
                                                {review.customerName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#1A1A1A' }}>{review.customerName}</p>
                                                <p style={{ fontSize: '11px', color: '#AAA', margin: 0 }}>{review.date}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} size={13} fill={i <= review.rating ? accent : 'none'} color={accent} />
                                            ))}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#555', margin: '0 0 10px', lineHeight: 1.55 }}>{review.comment}</p>
                                    {(review.images || []).length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }} className="no-scrollbar">
                                            {review.images.map((imgUrl, idx) => (
                                                <div key={idx} style={{ width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                                    <img src={getImageUrl(imgUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Review" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {feedbacks.filter(f => f.status === 'Approved').length === 0 && (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#AAA', fontSize: '13px' }}>
                                    No reviews yet. Be the first to review!
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
