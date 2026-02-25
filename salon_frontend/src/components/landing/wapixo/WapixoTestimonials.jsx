import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

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
    return (
        <section style={{
            background: '#050505',
            padding: '100px 1.5rem 40px',
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

                {/* Testimonials Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
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
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Quote Icon */}
                            <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.05 }}>
                                <Quote size={40} color="#ffffff" />
                            </div>

                            {/* Stars */}
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill="#ffffff" color="#ffffff" style={{ opacity: 0.6 }} />
                                ))}
                            </div>

                            <p style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '1rem',
                                fontWeight: 300,
                                lineHeight: 1.8,
                                marginBottom: '3rem',
                                letterSpacing: '0.01em',
                                flex: 1
                            }}>
                                "{t.content}"
                            </p>

                            {/* Author Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)'
                                }}>
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
            </div>
        </section>
    );
}
