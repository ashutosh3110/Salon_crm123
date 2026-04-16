import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Star, MapPin, Phone, Navigation2,
    Clock, ShieldCheck, Heart, Share2, Crown,
    Award, Camera, MessageSquare, Info, ArrowRight
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../data/appMockData';
import homeData from '../../data/appHomeData.json';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCMS } from '../../contexts/CMSContext';
import { useGender } from '../../contexts/GenderContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';

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
        categories: businessCategories 
    } = useBusiness();
    const { user } = useAuth();

    useEffect(() => {
        if (id) {
            fetchFeedbacks(null, id, 'Approved');
        }
    }, [id, fetchFeedbacks]);

    const g = (gender === 'men' || gender === 'women') ? gender : 'women';
    const isFavorite = isSalonLiked(id);

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Services');
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // Sync tab if state changes
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state?.activeTab]);

    // Outlet data and Carousel Timer
    const outlet = businessOutlets.find(o => o._id === id) || businessOutlets[0] || { name: 'Loading...', image: '', images: [] };

    useEffect(() => {
        const images = outlet.images?.length > 0 ? outlet.images : [outlet.image];
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImgIndex(prev => (prev + 1) % images.length);
        }, 4000); // 4 seconds auto-play

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
            // Store as base64 data URLs so backend can persist and admin can render images.
            const newImages = await Promise.all(files.map(fileToDataUrl));
            setReviewImages(prev => [...prev, ...newImages.filter(Boolean)]);
        } catch {
            // eslint-disable-next-line no-alert
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
            service: 'General Service', // Or dynamically set if booking found
            staffName: 'Unassigned',
            images: reviewImages,
            status: 'Pending'
        });

        if (!created) {
            // eslint-disable-next-line no-alert
            alert('Feedback submit failed. Please try again.');
            return;
        }

        setReviewRating(0);
        setReviewText('');
        setReviewerName('');
        setReviewImages([]);
        setIsWritingReview(false);
    };

    const TABS = ['Services', 'Lookbook', 'Reviews & Photos', 'About'];

    const handleShare = async () => {
        try {
            const shareText = `Check out ${outlet.name}! Use my code REFER500 to get ₹200 off your first visit.`;
            if (navigator.share) {
                await navigator.share({
                    title: outlet.name,
                    text: shareText,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
                alert("Referral link copied to clipboard!");
            }
        } catch (error) {
            console.log("Error sharing:", error);
        }
    };

    const fadeUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.background,
            color: colors.text,
            paddingBottom: '100px' // Space for sticky CTA
        }}>
            {/* ── HERO SECTION ── */}
            <div style={{ position: 'relative', height: '350px', width: '100%', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImgIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        src={outlet.images?.length > 0 ? outlet.images[currentImgIndex] : outlet.image}
                        alt={outlet.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
                    />
                </AnimatePresence>
                
                {/* Carousel Progress Bars */}
                {outlet.images?.length > 1 && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '20px',
                        right: '20px',
                        display: 'flex',
                        gap: '6px',
                        zIndex: 20
                    }}>
                        {outlet.images.map((_, i) => (
                            <div 
                                key={i} 
                                style={{ 
                                    flex: 1, 
                                    height: '2.5px', 
                                    background: i === currentImgIndex ? '#FFF' : 'rgba(255,255,255,0.3)',
                                    borderRadius: '2px',
                                    transition: 'all 0.5s ease'
                                }} 
                            />
                        ))}
                    </div>
                )}

                {/* Gradient Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.8) 100%)'
                }} />

                {/* Back Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/app')}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        left: '20px',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        background: 'none',
                        border: 'none',
                        outline: 'none'
                    }}
                >
                    <ChevronLeft size={24} />
                </motion.button>

                {/* Action Icons */}
                <div style={{ position: 'absolute', top: '15px', right: '20px', display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSalonLike(id)}
                        style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isFavorite ? '#FF4757' : '#FFF',
                            background: 'none',
                            border: 'none',
                            outline: 'none'
                        }}
                    >
                        <Heart size={20} fill={isFavorite ? '#FF4757' : 'none'} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShare}
                        style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFF',
                            background: 'none',
                            border: 'none',
                            outline: 'none'
                        }}
                    >
                        <Share2 size={20} />
                    </motion.button>
                </div>

                {/* Salon Basic Info (Overlay bottom) */}
                <div style={{ position: 'absolute', bottom: '24px', left: '20px', right: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ 
                            background: g === 'men' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(236, 72, 153, 0.2)', 
                            color: g === 'men' ? '#3B82F6' : '#EC4899', 
                            fontSize: '10px', 
                            fontWeight: 900, 
                            padding: '6px 12px', 
                            borderRadius: '100px', 
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            {g === 'men' ? 'Gentlemen Exclusive' : 'Ladies Special'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFD700' }}>
                            <Star size={14} fill="#FFD700" />
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>{outlet.rating}</span>
                        </div>
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#FFF', margin: '0 0 6px' }}>{outlet.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)' }}>
                        <MapPin size={14} />
                        <span style={{ fontSize: '13px' }}>{outlet.address}</span>
                    </div>
                </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            if (outlet.location) {
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${outlet.location.lat},${outlet.location.lng}`, '_blank');
                            } else {
                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(outlet.name + ' ' + outlet.address)}`, '_blank');
                            }
                        }}
                        style={{
                            flex: 1,
                            height: '42px',
                            background: colors.text,
                            color: colors.card,
                            borderRadius: '14px',
                            fontSize: '12px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            border: 'none'
                        }}
                    >
                        <Navigation2 size={16} />
                        Directions
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            if (outlet.phone) {
                                window.location.href = `tel:${outlet.phone.replace(/\s+/g, '')}`;
                            }
                        }}
                        style={{
                            flex: 1,
                            height: '42px',
                            background: colors.card,
                            color: colors.text,
                            borderRadius: '14px',
                            fontSize: '12px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            border: `1.5px solid ${colors.border}`
                        }}
                    >
                        <Phone size={16} />
                        Contact
                    </motion.button>
                </div>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/app/book?outletId=${id}${serviceIdFromQuery ? `&serviceId=${serviceIdFromQuery}` : ''}`)}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#C8956C',
                        color: '#FFF',
                        borderRadius: '14px',
                        fontSize: '13px',
                        fontWeight: 900,
                        border: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: '0 10px 25px rgba(200,149,108,0.2)'
                    }}
                >
                    Book Appointment Now
                </motion.button>
            </div>

            {/* ── TABS ── */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                background: colors.background,
                padding: '0 20px',
                borderBottom: `1px solid ${colors.border}`
            }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '16px 0',
                                background: 'none',
                                border: 'none',
                                position: 'relative',
                                color: activeTab === tab ? colors.text : colors.textMuted,
                                fontSize: '14px',
                                fontWeight: activeTab === tab ? 800 : 600,
                                cursor: 'pointer'
                            }}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#C8956C', borderRadius: '4px' }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TAB CONTENT ── */}
            <div style={{ padding: '24px 20px' }}>
                <AnimatePresence mode="wait">
                    {activeTab === 'Services' && (
                        <motion.div key="services" {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Crown size={20} color={g === 'men' ? '#3B82F6' : '#EC4899'} />
                                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                                    {g === 'men' ? "Gentlemen's Rituals" : "Ladies' Specials"}
                                </h3>
                            </div>
                            {businessServices
                                .filter(s => {
                                    const isMatch = (s.outletIds || []).map(oid => String(oid)).includes(String(id)) || String(s.outletId) === String(id) || s.outlet === 'All Outlets';
                                    const category = businessCategories.find(c => c.name === s.category);
                                    const genderMatch = !category || category.gender === 'both' || category.gender === g;
                                    return isMatch && genderMatch && s.status === 'active';
                                })
                                .slice(0, 10)
                                .map(service => (
                                <div key={service._id} style={{
                                    background: colors.card,
                                    padding: '16px',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: `1px solid ${colors.border}`
                                }}>
                                    <div>
                                        <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px' }}>{service.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '13px', color: colors.textMuted }}>{service.duration} mins</span>
                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: colors.border }} />
                                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#C8956C' }}>₹{service.price}</span>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => navigate(`/app/book?outletId=${id}&serviceId=${service._id}`)}
                                        style={{
                                            background: serviceIdFromQuery === service._id ? '#C8956C' : `${colors.accent}15`,
                                            color: serviceIdFromQuery === service._id ? '#FFF' : colors.accent,
                                            padding: '8px 16px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            fontSize: '12px',
                                            fontWeight: 800
                                        }}
                                    >
                                        {serviceIdFromQuery === service._id ? 'Selected' : 'Add'}
                                    </motion.button>
                                </div>
                            ))}
                            <button
                                onClick={() => navigate(`/app/book?outletId=${id}`)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: colors.accent,
                                    fontSize: '14px',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    margin: '8px auto',
                                    cursor: 'pointer'
                                }}
                            >
                                View Full Menu <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    )}

                    {activeTab === 'Lookbook' && (
                        <motion.div key="lookbook" {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Salon Lookbook</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 900, color: colors.accent, padding: '4px 12px', background: `${colors.accent}15`, borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent</span>
                                </div>
                            </div>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(2, 1fr)', 
                                gridAutoRows: 'minmax(180px, auto)',
                                gap: '12px' 
                            }}>
                                {(outlet.images && outlet.images.length > 0) ? (
                                    outlet.images.map((img, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileTap={{ scale: 0.98 }}
                                            style={{ 
                                                position: 'relative', 
                                                borderRadius: '24px', 
                                                overflow: 'hidden', 
                                                background: colors.border,
                                                gridColumn: idx % 3 === 0 ? 'span 2' : 'span 1', // Create a dynamic bento-like grid
                                                height: idx % 3 === 0 ? '240px' : '200px'
                                            }}
                                        >
                                            <img
                                                src={img}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                alt={`Salon Look ${idx}`}
                                            />
                                            <div style={{ 
                                                position: 'absolute', 
                                                bottom: 0, 
                                                left: 0, 
                                                right: 0, 
                                                padding: '16px', 
                                                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', 
                                                color: '#FFF',
                                                display: 'flex',
                                                alignItems: 'baseline',
                                                gap: '6px'
                                            }}>
                                                <Camera size={14} />
                                                <p style={{ fontSize: '11px', fontWeight: 800, margin: 0 }}>LOOK #{idx + 1}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div style={{ colSpan: '2', padding: '40px', textAlign: 'center', opacity: 0.5 }}>
                                        <ImageIcon size={40} style={{ marginBottom: '12px' }} />
                                        <p style={{ fontSize: '13px', fontWeight: 600 }}>No lookbook images yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Reviews & Photos' && (
                        <motion.div key="reviews" {...fadeUp}>
                            <div style={{ background: `${colors.accent}08`, padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 4px' }}>{outlet.rating}</h4>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill={i <= 4 ? colors.accent : 'none'} color={colors.accent} />)}
                                </div>
                                <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Based on 450+ verified reviews</p>
                            </div>

                            {!isWritingReview ? (
                                <button
                                    onClick={() => setIsWritingReview(true)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: colors.card,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '16px',
                                        color: colors.text,
                                        fontSize: '14px',
                                        fontWeight: 800,
                                        marginBottom: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <MessageSquare size={18} />
                                    Write a Review
                                </button>
                            ) : (
                                <div style={{ marginBottom: '24px', padding: '20px', background: colors.card, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
                                    <h5 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: colors.text }}>Your Experience</h5>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <button key={i} onClick={() => setReviewRating(i)} style={{ background: 'none', border: 'none', padding: 0 }}>
                                                <Star size={24} fill={reviewRating >= i ? colors.accent : 'none'} color={colors.accent} />
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={reviewerName}
                                        onChange={(e) => setReviewerName(e.target.value)}
                                        placeholder="Your Name (Optional)"
                                        style={{
                                            width: '100%',
                                            background: colors.background,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '12px',
                                            padding: '12px',
                                            color: colors.text,
                                            fontSize: '14px',
                                            marginBottom: '16px',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Tell us what you loved..."
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            background: colors.background,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '12px',
                                            padding: '12px',
                                            color: colors.text,
                                            fontSize: '14px',
                                            resize: 'none',
                                            marginBottom: '16px',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }} className="no-scrollbar">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => fileInputRef.current.click()}
                                            style={{
                                                width: '60px', height: '60px', borderRadius: '12px', border: `1px dashed ${colors.accent}`,
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                gap: '4px', background: 'none', color: colors.accent, flexShrink: 0, cursor: 'pointer'
                                            }}
                                        >
                                            <Camera size={18} />
                                            <span style={{ fontSize: '9px', fontWeight: 800 }}>Add</span>
                                        </motion.button>
                                        {reviewImages.map((imgUrl, index) => (
                                            <div key={index} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                                <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button
                                                    onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== index))}
                                                    style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#FFF', border: 'none', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => { setIsWritingReview(false); setReviewRating(0); setReviewText(''); setReviewImages([]); }}
                                            style={{ flex: 1, padding: '14px', background: colors.background, color: colors.text, borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: `1px solid ${colors.border}`, cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmitReview}
                                            disabled={reviewRating === 0 || !reviewText.trim()}
                                            style={{ flex: 1, padding: '14px', background: colors.accent, color: '#fff', borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: 'none', opacity: (reviewRating === 0 || !reviewText.trim()) ? 0.5 : 1 }}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            )}

                            {feedbacks.map(review => (
                                <div key={review.id} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${colors.border}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '12px', fontWeight: 800 }}>
                                                {review.customerName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: colors.text }}>{review.customerName}</p>
                                                <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>{review.date}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill={i <= review.rating ? colors.accent : 'none'} color={colors.accent} />)}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '8px 0', lineHeight: 1.5 }}>{review.comment}</p>
                                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }} className="no-scrollbar">
                                        {(review.images || []).map((imgUrl, idx) => (
                                            <div key={idx} style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                                <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Review" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'About' && (
                        <motion.div key="about" {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <section>
                                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>Description</h4>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', color: colors.textMuted, margin: 0 }}>
                                    Experience the pinnacle of hair and skin care at {outlet.name}. Our master stylists use only premium products to ensure you get the best results every time.
                                </p>
                            </section>

                            <section>
                                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>Working Hours</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {outlet.workingHours?.map(day => (
                                        <div key={day.day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                            <span style={{ color: colors.textMuted }}>{day.day}</span>
                                            <span style={{ fontWeight: 700, color: day.isOpen ? colors.text : '#FF4757' }}>
                                                {day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'Closed'}
                                            </span>
                                        </div>
                                    )) || <p style={{ fontSize: '13px', color: colors.textMuted }}>Open daily: 9 AM - 9 PM</p>}
                                </div>
                            </section>

                            <section>
                                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>Amenities</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                    {['Free Wi-Fi', 'Parking Area', 'AC', 'Coffee/Tea', 'Magazines', 'Sanitized Tools'].map(ami => (
                                        <div key={ami} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.textMuted }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.accent }} />
                                            {ami}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
