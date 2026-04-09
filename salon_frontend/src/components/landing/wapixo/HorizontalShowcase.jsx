import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

export default function HorizontalShowcase() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const cards = [
        { title: 'Boutique Management', desc: 'Enterprise-grade control for your salon operations.', img: '/image1.png' },
        { title: 'Smart Discovery', desc: 'Find and book the elite stylists in your city.', img: '/image1.png' },
        { title: 'Loyalty Programs', desc: 'Digital rewards and membership tiers for clients.', img: '/image1.png' }
    ];

    return (
        <section style={{
            minHeight: '80vh',
            width: '100%',
            background: isDark ? '#050505' : '#F5F5F7',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem'
        }}>
            {/* The Bottom-to-Top Curtain Animation */}
            <motion.div
                initial={{ y: '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: isDark ? '#0a0a0a' : '#FFFFFF',
                    zIndex: 0,
                }}
            />

            <div style={{
                maxWidth: '1200px',
                width: '100%',
                zIndex: 1,
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                        fontWeight: 300,
                        letterSpacing: '-0.02em',
                        color: 'var(--wapixo-text)',
                        marginBottom: '4rem',
                        textTransform: 'uppercase'
                    }}>
                        Discover Our <br />
                        <span style={{ fontWeight: 600 }}>Elite Interface</span>
                    </h2>
                </motion.div>

                {/* Horizontal Cards Container */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2.5rem',
                    width: '100%'
                }} className="showcase-grid">
                    {cards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 + (i * 0.2), duration: 0.8, ease: 'easeOut' }}
                            style={{
                                background: isDark ? 'rgba(255,255,255,0.03)' : '#fcfcfc',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                                borderRadius: '24px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem',
                                boxShadow: isDark ? '0 30px 60px -12px rgba(0,0,0,0.4)' : '0 30px 60px -12px rgba(0,0,0,0.05)',
                                transition: 'transform 0.3s ease'
                            }}
                            whileHover={{ y: -10 }}
                        >
                            {/* Image Frame (Horizontal Screenshot Style) */}
                            <div style={{
                                width: '100%',
                                aspectRatio: '16/10',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                position: 'relative'
                            }}>
                                <img 
                                    src={card.img} 
                                    alt={card.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'top'
                                    }}
                                />
                                {/* Glass Overlay on Image */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.1) 100%)'
                                }} />
                            </div>

                            <div style={{ textAlign: 'left' }}>
                                <h3 style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 600,
                                    color: 'var(--wapixo-text)',
                                    margin: '0 0 0.5rem 0'
                                }}>
                                    {card.title}
                                </h3>
                                <p style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--wapixo-text-muted)',
                                    lineHeight: 1.5,
                                    fontWeight: 400,
                                    margin: 0
                                }}>
                                    {card.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .showcase-grid {
                        grid-template-columns: 1fr !important;
                        gap: 2rem !important;
                    }
                }
            `}</style>
        </section>
    );
}
