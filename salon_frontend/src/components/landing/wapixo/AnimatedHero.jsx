import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';

export default function AnimatedHero() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const appointments = [
        { id: 1, name: 'Priya Sharma',  service: 'Hair Spa',     time: '10:00 AM', initial: 'P', color: '#B4912B' },
        { id: 2, name: 'Rahul Verma',   service: 'Classic Fade', time: '11:30 AM', initial: 'R', color: '#6366f1' },
        { id: 3, name: 'Simran Kaur',   service: 'Manicure',     time: '1:00 PM',  initial: 'S', color: '#ec4899' },
    ];

    const stats = [
        { label: 'Salons',   value: '500+' },
        { label: 'Bookings', value: '50K+' },
        { label: 'Uptime',   value: '99.9%' },
    ];

    const borderStyle = `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`;

    return (
        <section style={{
            minHeight: 'calc(100vh - 64px)',
            width: '100%',
            background: 'var(--wapixo-bg)',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Right side dot-grid layer */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                backgroundImage: isDark
                    ? 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)'
                    : 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* Container */}
            <div
                className="hero-container"
                style={{
                    maxWidth: '1200px',
                    width: '100%',
                    margin: '0 auto',
                    padding: '0 clamp(1.5rem, 5vw, 5rem)',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
                    gap: '5rem',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* ── LEFT: TEXT ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: 'relative' }}
                >
                    {/* Overline */}
                    <p style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.45em',
                        textTransform: 'uppercase',
                        color: 'var(--wapixo-primary)',
                        margin: '0 0 1.25rem 0',
                    }}>
                        Salon Management · Wapixo
                    </p>

                    {/* Headline */}
                    <h1 style={{
                        fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
                        fontWeight: 200,
                        color: 'var(--wapixo-text)',
                        letterSpacing: '-0.035em',
                        lineHeight: 1.05,
                        margin: '0 0 1.25rem 0',
                    }}>
                        Run your salon<br />
                        <span style={{ fontWeight: 500 }}>without the chaos.</span>
                    </h1>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: '1rem',
                        fontWeight: 300,
                        color: 'var(--wapixo-text-muted)',
                        lineHeight: 1.7,
                        maxWidth: '420px',
                        margin: '0 0 2.25rem 0',
                    }}>
                        Book appointments, track revenue, and manage your team — all from one surgical command center.
                    </p>

                    {/* CTAs */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    background: 'var(--wapixo-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.85rem 2.4rem',
                                    borderRadius: '100px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    letterSpacing: '0.04em',
                                    boxShadow: '0 8px 24px rgba(180, 145, 43, 0.25)',
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                Start Free Trial
                            </motion.button>
                        </Link>

                        <Link to="/login" style={{
                            color: 'var(--wapixo-text)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            textDecoration: 'none',
                            opacity: 0.7,
                            letterSpacing: '0.01em',
                        }}>
                            Sign in →
                        </Link>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', marginBottom: '2rem' }}>
                        {stats.map((stat, i) => (
                            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--wapixo-text)', lineHeight: 1.2 }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--wapixo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                        {stat.label}
                                    </div>
                                </div>
                                {i !== stats.length - 1 && (
                                    <div style={{ height: '24px', width: '1px', background: 'var(--wapixo-border)', opacity: 0.4 }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Trust Line */}
                    <div style={{ 
                        paddingTop: '1.5rem', 
                        borderTop: borderStyle,
                        display: 'inline-block'
                    }}>
                        <p style={{ 
                            fontSize: '0.7rem', 
                            color: 'var(--wapixo-text-muted)', 
                            fontWeight: 400, 
                            margin: 0,
                            letterSpacing: '0.02em',
                            opacity: 0.8
                        }}>
                            Trusted by salons across India, UAE, and the UK.
                        </p>
                    </div>
                </motion.div>

                {/* Vertical Divider Line (Desktop only) */}
                <div style={{
                    position: 'absolute',
                    left: '52%',
                    top: '15%',
                    bottom: '15%',
                    width: '1px',
                    background: 'var(--wapixo-border)',
                    opacity: 0.15,
                    display: 'none'
                }} className="desktop-divider" />

                {/* ── RIGHT: APP WIDGET ── */}
                <motion.div
                    className="hero-widget"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}
                >
                    {/* Primary Appointment Card */}
                    <div style={{
                        background: isDark ? '#0D0D0D' : '#FFFFFF',
                        border: borderStyle,
                        borderRadius: '20px',
                        padding: '1.75rem',
                        width: '100%',
                        maxWidth: '420px',
                        boxShadow: isDark ? '0 30px 60px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.05)',
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--wapixo-text)', marginBottom: '2px' }}>
                                    Live Schedule
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--wapixo-text-muted)' }}>
                                    Today · {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                            <div style={{
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                color: 'var(--wapixo-primary)',
                                background: isDark ? 'rgba(180,145,43,0.1)' : 'rgba(180,145,43,0.05)',
                                border: `1px solid ${isDark ? 'rgba(180,145,43,0.2)' : 'rgba(180,145,43,0.1)'}`,
                                padding: '4px 12px',
                                borderRadius: '100px',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                            }}>
                                Active
                            </div>
                        </div>

                        {/* Appointments */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
                            {appointments.map((appt, i) => (
                                <div key={appt.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.9rem 0',
                                    borderBottom: i !== appointments.length - 1 ? borderStyle : 'none',
                                    opacity: i === 2 ? 0.5 : 1,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '12px',
                                            background: `${appt.color}15`,
                                            color: appt.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }}>
                                            {appt.initial}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--wapixo-text)' }}>
                                                {appt.name}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--wapixo-text-muted)' }}>
                                                {appt.service}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        color: 'var(--wapixo-text-muted)',
                                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: borderStyle
                                    }}>
                                        {appt.time}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Revenue Strip */}
                        <div style={{
                            padding: '1.25rem',
                            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                            borderRadius: '12px',
                            border: borderStyle,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--wapixo-text-muted)' }}>
                                    Revenue Target
                                </span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--wapixo-text)' }}>
                                    ₹42,500
                                </span>
                            </div>
                            <div style={{ height: '5px', width: '100%', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '71%' }}
                                    transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                                    style={{ height: '100%', background: 'var(--wapixo-primary)', borderRadius: '10px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Secondary Companion Card: Quick Stats */}
                    <div style={{
                        width: '100%',
                        maxWidth: '420px',
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        border: borderStyle,
                        borderRadius: '16px',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        {[
                            { label: 'Books', val: 18 },
                            { label: 'New', val: 5 },
                            { label: 'Wait', val: '12m' }
                        ].map((stat, i) => (
                            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--wapixo-text)' }}>{stat.val}</div>
                                    <div style={{ fontSize: '0.62rem', color: 'var(--wapixo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                                </div>
                                {i !== 2 && <div style={{ width: '1px', height: '15px', background: 'var(--wapixo-border)', opacity: 0.3 }} />}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Responsive */}
            <style>{`
                @media (min-width: 1025px) {
                    .desktop-divider { display: block !important; }
                }
                @media (max-width: 1024px) {
                    .hero-container {
                        grid-template-columns: 1fr !important;
                        gap: 4rem !important;
                        text-align: center;
                        padding-top: 4rem;
                        padding-bottom: 4rem;
                    }
                    .hero-container > div:first-child {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                }
                @media (max-width: 768px) {
                    .hero-widget {
                        display: none !important;
                    }
                    section {
                        min-height: auto !important;
                        height: auto !important;
                        padding-top: 8rem;
                        padding-bottom: 6rem;
                    }
                }
            `}</style>
        </section>
    );
}
