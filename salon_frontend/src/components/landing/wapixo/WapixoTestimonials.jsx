import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, X, Send, User, Building } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        name: 'Claudia Alves',
        role: 'CEO, Artistry Studio',
        content: 'Wapixo has completely transformed how we manage our multi-outlet salon. The precision in billing and the depth of analytics is unmatched in the industry.',
        image: 'https://i.pravatar.cc/150?u=claudia',
    },
    {
        id: 2,
        name: 'Priya Sharma',
        role: 'Director, Urban Gloss',
        content: 'The WhatsApp automation and smart scheduling have reduced our no-shows by 40%. It is not just a software; it is a growth partner for our business.',
        image: 'https://i.pravatar.cc/150?u=priya',
    },
    {
        id: 3,
        name: 'Rahul Varma',
        role: 'Founder, Elite Scissors',
        content: 'Managing inventory across 10 locations was a nightmare before Wapixo. Now, everything is synchronized with surgical precision. Truly impressive.',
        image: 'https://i.pravatar.cc/150?u=rahul',
    },
];

export default function WapixoTestimonials() {
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        setIsSubmitting(false);
        setSubmitted(true);
        setTimeout(() => {
            setShowForm(false);
            setSubmitted(false);
        }, 3000);
    };

    return (
        <section style={{
            background: '#050505',
            padding: '100px 1.5rem 100px',
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
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.45em', marginBottom: '1.5rem' }}
                    >
                        Success Stories
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}
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
                        marginBottom: '60px',
                        padding: '10px 5px 30px',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    <style>{`
                        .testimonial-container::-webkit-scrollbar { display: none; }
                        @media (min-width: 768px) {
                            .testimonial-container {
                                display: grid !important;
                                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)) !important;
                                overflow-x: visible !important;
                                scroll-snap-type: none !important;
                                padding: 0 !important;
                                gap: 2rem !important;
                                margin-bottom: 80px !important;
                            }
                        }
                    `}</style>
                    {testimonials.map((t, idx) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            style={{
                                background: 'rgba(255,255,255,0.01)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '4px',
                                padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1.2rem, 4vw, 2.5rem)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                                flex: '0 0 85%',
                                scrollSnapAlign: 'center',
                                minWidth: '280px'
                            }}
                            onMouseEnter={(e) => {
                                if (window.innerWidth >= 768) {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.05 }}>
                                <Quote size={40} color="#ffffff" />
                            </div>

                            <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill="#ffffff" color="#ffffff" style={{ opacity: 0.6 }} />
                                ))}
                            </div>

                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', fontWeight: 300, lineHeight: 1.8, marginBottom: '3rem', letterSpacing: '0.01em', flex: 1 }}>
                                "{t.content}"
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                                    <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)' }} />
                                </div>
                                <div>
                                    <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 400, margin: 0, letterSpacing: '0.02em' }}>{t.name}</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: 300, margin: '2px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.role}</p>
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
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#ffffff',
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
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.color = '#000000';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                        >
                            Share Your Journey
                        </motion.button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                maxWidth: '600px',
                                margin: '0 auto',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '3rem',
                                textAlign: 'left',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setShowForm(false)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>

                            {submitted ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', itemsCenter: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                        <Star size={32} color="#10b981" fill="#10b981" />
                                    </div>
                                    <h3 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 200, marginBottom: '0.5rem' }}>Thank You.</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 300 }}>Your story will inspire excellence.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ spaceY: '1.5rem' }}>
                                    <div style={{ marginBottom: '2.5rem' }}>
                                        <h3 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: 200, margin: '0 0 0.5rem 0' }}>Write Your Story.</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 300 }}>Share your Wapixo experience with the community.</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div style={{ position: 'relative' }}>
                                            <User size={14} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'rgba(255,255,255,0.2)' }} />
                                            <input
                                                required
                                                placeholder="Your Name"
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem 1rem 1rem 2.5rem', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                                            />
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <Building size={14} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'rgba(255,255,255,0.2)' }} />
                                            <input
                                                required
                                                placeholder="Salon / Role"
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem 1rem 1rem 2.5rem', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Rate Your Experience</p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    size={20}
                                                    fill={s <= (hoverRating || rating) ? '#ffffff' : 'transparent'}
                                                    color={s <= (hoverRating || rating) ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                                                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onMouseEnter={() => setHoverRating(s)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(s)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2.5rem' }}>
                                        <textarea
                                            required
                                            placeholder="Tell us how Wapixo transformed your business..."
                                            rows={4}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem', color: '#ffffff', fontSize: '0.9rem', outline: 'none', resize: 'none' }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        style={{
                                            width: '100%',
                                            background: '#ffffff',
                                            color: '#000000',
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
                                            transition: 'all 0.3s'
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

