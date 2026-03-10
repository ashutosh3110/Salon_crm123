import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Star, MapPin, Phone, Navigation2,
    Clock, ShieldCheck, Heart, Share2, Crown,
    Award, Camera, MessageSquare, Info, ArrowRight
} from 'lucide-react';
import { MOCK_OUTLETS, MOCK_SERVICES } from '../../data/appMockData';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useFavorites } from '../../contexts/FavoritesContext';

export default function SalonProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const serviceIdFromQuery = searchParams.get('serviceId');
    const { colors, isLight } = useCustomerTheme();

    // Find outlet from mock data
    const outlet = MOCK_OUTLETS.find(o => o._id === id) || MOCK_OUTLETS[0];

    const [activeTab, setActiveTab] = useState('Services');
    const { isSalonLiked, toggleSalonLike } = useFavorites();
    const isFavorite = isSalonLiked(id);

    const [isWritingReview, setIsWritingReview] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewsData, setReviewsData] = useState([
        { id: 1, name: 'Phoebe Buffay', time: '2 days ago', rating: 5, text: "Absolutely loved the experience! The staff was very professional and the ambiance was perfect." },
        { id: 2, name: 'Rachel Green', time: '1 week ago', rating: 4, text: "Great service, but had to wait 10 mins despite my appointment." }
    ]);

    const handleSubmitReview = () => {
        if (reviewRating === 0 || reviewText.trim() === '') return;
        setReviewsData([{ id: Date.now(), name: 'You', time: 'Just now', rating: reviewRating, text: reviewText }, ...reviewsData]);
        setReviewRating(0);
        setReviewText('');
        setIsWritingReview(false);
    };

    const TABS = ['Services', 'Wall', 'Reviews', 'About'];

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: outlet.name,
                    text: `Check out ${outlet.name} and book an appointment!`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
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
            <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                <img
                    src={outlet.image}
                    alt={outlet.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

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
                        <span style={{ background: '#C8956C', color: '#FFF', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase' }}>
                            Top Rated 2024
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
                                <Crown size={20} color="#C8956C" />
                                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Most Popular Services</h3>
                            </div>
                            {MOCK_SERVICES.slice(0, 5).map(service => (
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
                            <button style={{
                                background: 'none',
                                border: 'none',
                                color: colors.accent,
                                fontSize: '14px',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                margin: '8px auto'
                            }}>
                                View Full Menu <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    )}

                    {activeTab === 'Wall' && (
                        <motion.div key="wall" {...fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} style={{ height: '180px', borderRadius: '16px', overflow: 'hidden', background: colors.border }}>
                                    <img src={`https://images.unsplash.com/photo-${1560066980 + i}?w=400&q=80`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'Reviews' && (
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
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => { setIsWritingReview(false); setReviewRating(0); setReviewText(''); }}
                                            style={{ flex: 1, padding: '14px', background: colors.background, color: colors.text, borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: `1px solid ${colors.border}` }}
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

                            {reviewsData.map(review => (
                                <div key={review.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${colors.border}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <h5 style={{ fontWeight: 800, margin: 0 }}>{review.name}</h5>
                                        <span style={{ fontSize: '11px', color: colors.textMuted }}>{review.time}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= review.rating ? colors.accent : 'none'} color={colors.accent} />)}
                                    </div>
                                    <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0, fontStyle: 'italic' }}>
                                        "{review.text}"
                                    </p>
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
