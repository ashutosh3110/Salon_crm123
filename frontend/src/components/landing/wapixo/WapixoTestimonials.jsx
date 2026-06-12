import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, X, Send, User, Building } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { getImageUrl } from '../../../utils/imageUtils';
import api from '../../../services/api';

import landingData from '../../../data/landingMockData.json';

const testimonials = landingData.testimonials.map((t, i) => ({ ...t, id: i + 1 }));

export default function WapixoTestimonials({ data }) {
    const { theme } = useTheme();
    const displayTestimonials = data && data.length > 0 ? data : testimonials;
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.target);
            formData.append('rating', rating);
            
            await api.post('/testimonials', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setSubmitted(true);
            setTimeout(() => {
                setShowForm(false);
                setSubmitted(false);
                setRating(5);
            }, 3000);
        } catch (error) {
            console.error("Error submitting testimonial", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <section style={{
            background: 'var(--wapixo-bg)',
            padding: 'clamp(40px, 5vw, 60px) 1.5rem',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Spotlights */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity: 0.3
            }}>
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
                    filter: 'blur(80px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '10%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
                    filter: 'blur(80px)'
                }} />
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ color: 'var(--wapixo-primary)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.45em', marginBottom: '1.5rem' }}
                    >
                        Success Stories
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 200, fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)', color: 'var(--wapixo-text)', letterSpacing: '-0.035em', lineHeight: 1.05, margin: '0 0 1.25rem 0' }}
                    >
                        Voices of Excellence.
                    </motion.h2>
                </div>

                {/* Testimonials Grid / Carousel */}
                <div
                    className="testimonial-container"
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: '1.5rem',
                        marginBottom: '40px',
                        padding: '10px 5px 30px',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    <style>{`
                        .testimonial-container::-webkit-scrollbar { display: none; }
                        .testimonial-card { flex: 0 0 85%; }
                        @media (min-width: 768px) {
                            .testimonial-container {
                                display: flex !important;
                                overflow-x: auto !important;
                                scroll-snap-type: x mandatory !important;
                                padding: 10px 5px 30px !important;
                                gap: 2rem !important;
                                margin-bottom: 40px !important;
                            }
                            .testimonial-card {
                                flex: 0 0 calc(33.333% - 1.33rem) !important;
                            }
                        }
                    `}</style>
                    {displayTestimonials.map((t, idx) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            className="testimonial-card"
                            style={{
                                background: 'var(--wapixo-bg)',
                                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(180, 145, 43, 0.4)',
                                borderRadius: '12px',
                                padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1.2rem, 4vw, 2.5rem)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                                scrollSnapAlign: 'center',
                                minWidth: '280px',
                                boxShadow: theme === 'dark' ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.08), 0 0 10px rgba(180, 145, 43, 0.05)'
                            }}
                             onMouseEnter={(e) => {
                                if (window.innerWidth >= 768) {
                                    e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(180, 145, 43, 0.6)';
                                    e.currentTarget.style.background = 'var(--wapixo-bg-alt)';
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = theme === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 15px 40px rgba(0, 0, 0, 0.1), 0 0 15px rgba(180, 145, 43, 0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(180, 145, 43, 0.4)';
                                e.currentTarget.style.background = 'var(--wapixo-bg)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = theme === 'dark' ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.08), 0 0 10px rgba(180, 145, 43, 0.05)';
                            }}
                        >
                            <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.05 }}>
                                <Quote size={40} color="#ffffff" />
                            </div>

                             <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill="var(--wapixo-primary)" color="var(--wapixo-primary)" style={{ opacity: 1 }} />
                                ))}
                            </div>

                             <p style={{ color: 'var(--wapixo-text)', fontSize: '1rem', fontWeight: 400, lineHeight: 1.8, marginBottom: '3rem', letterSpacing: '0.01em', flex: 1 }}>
                                "{t.content}"
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                {t.image && (
                                    <img 
                                        src={getImageUrl(t.image)} 
                                        alt={t.name} 
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                                    />
                                )}
                                 <div>
                                    <h4 style={{ color: 'var(--wapixo-text)', fontSize: '0.95rem', fontWeight: 400, margin: 0, letterSpacing: '0.02em' }}>{t.name}</h4>
                                    <p style={{ color: 'var(--wapixo-text-muted)', fontSize: '0.75rem', fontWeight: 400, margin: '2px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action */}
                <div style={{ textAlign: 'center' }}>
                    {!showForm ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowForm(true)}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--wapixo-primary)',
                                color: 'var(--wapixo-text)',
                                padding: '1rem 3rem',
                                 borderRadius: '100px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.3em',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--wapixo-primary)';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--wapixo-text)';
                            }}
                        >
                            Share Your Journey
                        </motion.button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                maxWidth: '500px',
                                margin: '0 auto',
                                background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255, 255, 255, 0.95)',
                                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(180, 145, 43, 0.4)',
                                boxShadow: theme === 'dark' ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.08), 0 0 10px rgba(180, 145, 43, 0.05)',
                                borderRadius: '12px',
                                padding: '2rem',
                                textAlign: 'left',
                                position: 'relative',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <button
                                onClick={() => setShowForm(false)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'var(--wapixo-primary)', cursor: 'pointer', transition: 'all 0.3s' }}
                                onMouseEnter={(e) => {
                                    if (theme !== 'dark') e.currentTarget.style.filter = 'drop-shadow(0 0 5px rgba(180,145,43,0.5))';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.filter = 'none';
                                }}
                            >
                                <X size={20} />
                            </button>

                            {submitted ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: theme === 'dark' ? 'none' : '0 0 20px rgba(16, 185, 129, 0.4)' }}>
                                        <Star size={32} color="#10b981" fill="#10b981" style={{ filter: theme === 'dark' ? 'none' : 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.6))' }} />
                                    </div>
                                    <h3 style={{ color: theme === 'dark' ? '#ffffff' : 'var(--wapixo-text)', fontSize: '1.5rem', fontWeight: 200, marginBottom: '0.5rem' }}>Thank You.</h3>
                                    <p style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--wapixo-text-muted)', fontSize: '0.9rem', fontWeight: 300 }}>Your story will inspire excellence.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <h3 style={{ color: theme === 'dark' ? '#ffffff' : 'var(--wapixo-primary)', fontSize: '1.5rem', fontWeight: 200, margin: '0 0 0.25rem 0', textShadow: theme === 'dark' ? 'none' : '0 0 5px rgba(180,145,43,0.1)' }}>Write Your Story.</h3>
                                        <p style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'var(--wapixo-text-muted)', fontSize: '0.8rem', fontWeight: 300 }}>Share your Wapixo experience with the community.</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ position: 'relative' }}>
                                            <User size={14} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'var(--wapixo-primary)' }} />
                                            <input
                                                required
                                                name="name"
                                                placeholder="Your Name"
                                                style={{ width: '100%', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(180, 145, 43, 0.03)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(180, 145, 43, 0.3)', borderRadius: '8px', padding: '1rem 1rem 1rem 2.5rem', color: 'var(--wapixo-text)', fontSize: '0.9rem', outline: 'none', transition: 'box-shadow 0.3s', boxShadow: theme === 'dark' ? 'none' : 'inset 0 0 5px rgba(180,145,43,0.1)' }}
                                            />
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <Building size={14} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'var(--wapixo-primary)' }} />
                                            <input
                                                required
                                                name="role"
                                                placeholder="Salon / Role"
                                                style={{ width: '100%', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(180, 145, 43, 0.03)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(180, 145, 43, 0.3)', borderRadius: '8px', padding: '1rem 1rem 1rem 2.5rem', color: 'var(--wapixo-text)', fontSize: '0.9rem', outline: 'none', transition: 'box-shadow 0.3s', boxShadow: theme === 'dark' ? 'none' : 'inset 0 0 5px rgba(180,145,43,0.1)' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            style={{ width: '100%', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(180, 145, 43, 0.03)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(180, 145, 43, 0.3)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--wapixo-text)', fontSize: '0.9rem', outline: 'none' }}
                                        />
                                        <p style={{ color: 'var(--wapixo-text-muted)', fontSize: '0.7rem', marginTop: '4px' }}>Optional: Upload your profile photo</p>
                                    </div>

                                    <div>
                                        <p style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'var(--wapixo-primary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', textShadow: theme === 'dark' ? 'none' : '0 0 2px rgba(180,145,43,0.1)' }}>Rate Your Experience</p>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    size={20}
                                                    fill={s <= (hoverRating || rating) ? (theme === 'dark' ? '#ffffff' : 'var(--wapixo-primary)') : 'transparent'}
                                                    color={s <= (hoverRating || rating) ? (theme === 'dark' ? '#ffffff' : 'var(--wapixo-primary)') : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(180,145,43,0.3)')}
                                                    style={{ cursor: 'pointer', transition: 'all 0.2s', filter: s <= (hoverRating || rating) && theme !== 'dark' ? 'drop-shadow(0 0 5px rgba(180,145,43,0.6))' : 'none' }}
                                                    onMouseEnter={() => setHoverRating(s)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(s)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <textarea
                                            required
                                            name="content"
                                            placeholder="Tell us how Wapixo transformed your business..."
                                            rows={4}
                                            style={{ width: '100%', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(180, 145, 43, 0.03)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(180, 145, 43, 0.3)', borderRadius: '8px', padding: '1rem', color: 'var(--wapixo-text)', fontSize: '0.9rem', outline: 'none', resize: 'none', transition: 'box-shadow 0.3s', boxShadow: theme === 'dark' ? 'none' : 'inset 0 0 5px rgba(180,145,43,0.1)' }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="testimonial-submit-btn"
                                        style={{
                                            width: '100%',
                                            background: theme === 'dark' ? '#ffffff' : 'var(--wapixo-primary)',
                                            color: theme === 'dark' ? '#000000' : '#ffffff',
                                            border: 'none',
                                            padding: '1.1rem',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.2rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            opacity: isSubmitting ? 0.7 : 1,
                                            transition: 'all 0.3s',
                                            boxShadow: theme === 'dark' ? 'none' : '0 4px 15px rgba(180, 145, 43, 0.2)',
                                            marginTop: '0.5rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (theme !== 'dark' && !isSubmitting) e.currentTarget.style.boxShadow = '0 6px 20px rgba(180, 145, 43, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (theme !== 'dark' && !isSubmitting) e.currentTarget.style.boxShadow = '0 4px 15px rgba(180, 145, 43, 0.2)';
                                        }}
                                    >
                                        {isSubmitting ? 'Transmitting...' : (
                                            <>
                                                Send Testimonial <Send size={14} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}

