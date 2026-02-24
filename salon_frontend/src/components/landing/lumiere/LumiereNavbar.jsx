import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LumiereNavbar() {
    return (
        <motion.nav
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 clamp(1.5rem, 5vw, 4rem)',
                height: '60px',
                background: 'rgba(5, 5, 5, 0.45)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
        >
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <img
                    src="/1-removebg-preview.png"
                    alt="Wapixo Logo"
                    style={{
                        height: '150px',
                        width: 'auto',
                        filter: 'brightness(0) invert(1)',
                    }}
                />
            </Link>

            {/* Nav Links — centered */}
            <div style={{
                display: 'flex',
                gap: '3rem',
                alignItems: 'center',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
            }}>
                {['Features', 'Pricing', 'Contact'].map((item) => (
                    <a
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 300,
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.55)',
                            letterSpacing: '0.06em',
                            textDecoration: 'none',
                            transition: 'color 0.25s ease',
                        }}
                        onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                        onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.55)')}
                    >
                        {item}
                    </a>
                ))}
            </div>

            {/* CTA */}
            <Link to="/register" style={{ textDecoration: 'none', flexShrink: 0 }}>
                <motion.button
                    whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.95)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        color: '#050505',
                        background: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.65rem 1.5rem',
                        cursor: 'pointer',
                        letterSpacing: '0.04em',
                        transition: 'background 0.25s ease',
                    }}
                >
                    Get Started
                </motion.button>
            </Link>
        </motion.nav>
    );
}
