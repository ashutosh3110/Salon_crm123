import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Star, MapPin, Phone, Navigation2,
    Clock, ShieldCheck, Heart, Share2, Crown,
    Award, Camera, MessageSquare, Info, ArrowRight,
    Instagram, Bookmark, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
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
                toast.success('Referral link copied to clipboard!');
            }
        } catch (error) {
            console.log('Error sharing:', error);
            if (error.name !== 'AbortError') {
                toast.error('Could not share link');
            }
        }
    };

    const handleToggleFavorite = () => {
        toggleSalonLike(id);
        if (!isFavorite) {
            toast.success('Saved to favorites!');
        } else {
            toast.success('Removed from favorites');
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
        { label: 'Call', icon: Phone, action: handleCall },
        { label: 'Direction', icon: Navigation2, action: handleDirections },
        { label: 'Save', icon: Bookmark, action: handleToggleFavorite },
        { label: 'Share', icon: Upload, action: handleShare },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#1A1A1A', paddingBottom: '40px', fontFamily: "'Inter', -apple-system, sans-serif" }}>

            {/* ── HERO IMAGE ── */}
            <div style={{ position: 'relative', height: '320px', width: '100%' }}>
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
                            position: 'absolute'
                        }}
                        onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                </AnimatePresence>

                {/* Top dark overlay for icons */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)', zIndex: 10 }} />
                
                {/* Bottom dark overlay for counter */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', zIndex: 10 }} />

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{ position: 'absolute', top: '40px', left: '20px', zIndex: 20, background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: 0 }}
                >
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>

                {/* Share + Heart */}
                <div style={{ position: 'absolute', top: '40px', right: '20px', display: 'flex', gap: '20px', zIndex: 20 }}>
                    <button onClick={handleShare} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: 0 }}>
                        <Share2 size={24} strokeWidth={2} />
                    </button>
                    <button onClick={handleToggleFavorite} style={{ background: 'none', border: 'none', color: isFavorite ? '#FF4757' : '#FFF', cursor: 'pointer', padding: 0 }}>
                        <Heart size={24} fill={isFavorite ? '#FF4757' : 'none'} strokeWidth={2} />
                    </button>
                </div>

                {/* Image Counter */}
                <div style={{ position: 'absolute', bottom: '40px', left: '20px', zIndex: 20, color: '#FFF', fontSize: '14px', fontWeight: 600 }}>
                    {currentImgIndex + 1}/{heroImages.length || 1}
                </div>
            </div>

            {/* ── SALON IDENTITY ── */}
            <div style={{ position: 'relative', marginTop: '-24px', zIndex: 30, background: '#FFF', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px 30px 0', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Circular Logo */}
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#000', border: '2px solid #D9A05B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D9A05B', fontSize: '20px', fontWeight: 900, flexShrink: 0, overflow: 'hidden' }}>
                    {heroImages[0] ? <img src={getImageUrl(heroImages[0])} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} /> : outlet.name?.charAt(0) || 'L'}
                </div>

                <div style={{ flex: 1, paddingTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{outlet.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                            <Star size={14} fill="#F59E0B" color="#F59E0B" />
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{outletRating}</span>
                            <span style={{ fontSize: '12px', color: '#888' }}>({feedbacks?.filter(f => f.status === 'Approved').length || 235})</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <MapPin size={14} color="#888" strokeWidth={2} />
                        <span style={{ fontSize: '12px', color: '#666' }}>
                            {getAddressString(outlet.address)?.split(',')[0] || 'Connaught Place, New Delhi'} • {outlet.calculatedDist ? `${outlet.calculatedDist.toFixed(1)} km` : '0.6 km'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid #22C55E' }} />
                            <span style={{ fontSize: '12px', color: '#22C55E', fontWeight: 500 }}>Open</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#888" strokeWidth={2} />
                        <span style={{ fontSize: '12px', color: '#444', fontWeight: 500 }}>{getTodayTimingString(outlet)}</span>
                    </div>
                </div>
            </div>

            {/* ── QUICK ACTION BUTTONS ── */}
            <div style={{ padding: '24px 30px 24px', background: '#FFF', display: 'flex', justifyContent: 'space-between' }}>
                {quickActions.map(({ label, icon: Icon, action }) => (
                    <motion.button
                        key={label}
                        whileTap={{ scale: 0.92 }}
                        onClick={action}
                        style={{
                            flex: 1, background: 'none', border: 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: '8px', cursor: 'pointer', padding: 0
                        }}
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#1A1A1A'
                        }}>
                            <Icon size={22} strokeWidth={1.5} fill={label === 'Save' && isFavorite ? '#1A1A1A' : 'none'} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#1A1A1A' }}>{label}</span>
                    </motion.button>
                ))}
            </div>

            <div style={{ padding: '20px 30px' }}>
                    <motion.div key="services" {...fadeUp} style={{ padding: '20px 0' }}>
                        {/* Top Services Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', margin: 0 }}>Services</h3>
                            <button
                                onClick={() => navigate(`/app/book?outletId=${id}`)}
                                style={{ background: 'none', border: 'none', color: accent, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                See All
                            </button>
                        </div>

                        {/* Horizontal Service Cards */}
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', margin: '0 -30px', paddingLeft: '30px', paddingRight: '30px' }} className="no-scrollbar">
                            {outletServices.length === 0 && (
                                <div style={{ width: '100%', textAlign: 'center', padding: '20px', color: '#AAA', fontSize: '13px' }}>
                                    No services available for this outlet.
                                </div>
                            )}
                            {outletServices.slice(0, 8).map((service, idx) => (
                                <motion.div
                                    key={service._id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate(`/app/book?outletId=${id}&serviceId=${service._id}`)}
                                    style={{
                                        width: '105px', flexShrink: 0,
                                        borderRadius: '12px', border: '1px solid #F0F0F0',
                                        background: '#FFF', overflow: 'hidden', cursor: 'pointer',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    <div style={{ width: '100%', height: '90px', background: '#F8F9FA' }}>
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
                                    <div style={{ padding: '8px 10px' }}>
                                        <h4 style={{ fontSize: '12px', fontWeight: 500, color: '#333', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {service.name}
                                        </h4>
                                        <p style={{ fontSize: '13px', color: '#1A1A1A', margin: 0, fontWeight: 800 }}>
                                            {outlet?.showServicePrice !== false && salon?.showServicePrice !== false && service.price ? `₹${service.price}` : '-'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* ── OFFERS SECTION ── */}
                        <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', margin: '0 0 12px' }}>Offers</h3>
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%', borderRadius: '16px', overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer'
                                }}
                            >
                                <img src="/banner.jpeg" alt="Offer Banner" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                            </motion.div>
                        </div>

                        {/* Book Appointment CTA */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/app/book?outletId=${id}`)}
                            style={{
                                width: '100%', height: '54px',
                                background: '#B4912B', color: '#FFF',
                                borderRadius: '12px', fontSize: '16px',
                                fontWeight: 700, border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Book Appointment
                        </motion.button>
                    </motion.div>
            </div>

        </div>
    );
}