import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const navItems = ['Features', 'Pricing', 'Blog', 'Contact'];

export default function WapixoNavbar() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setIsMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const linkStyle = {
        fontFamily: "'Inter', sans-serif",
        fontWeight: 400,
        fontSize: '0.85rem',
        color: 'var(--wapixo-text-muted)',
        letterSpacing: '0.04em',
        textDecoration: 'none',
        transition: 'color 0.25s ease',
    };

    return (
        <>
            <motion.nav
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
                style={{
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 clamp(1rem, 4vw, 4rem)',
                    height: '64px',
                    background: theme === 'dark' ? 'rgba(5, 5, 5, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderBottom: '1px solid var(--wapixo-border)',
                }}
            >
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 1010 }}>
                    <img
                        src={theme === 'dark' ? "/new wapixo logo .png" : "/new black wapixo logo .png"}
                        alt="Wapixo Logo"
                        style={{
                            height: 'clamp(120px, 35vw, 180px)',
                            width: 'auto',
                            maxWidth: '70vw',
                            objectFit: 'contain',
                            transform: 'translateY(2px)',
                            filter: isDark ? 'drop-shadow(0 0 15px rgba(0,0,0,0.7))' : 'none',
                            transition: 'all 0.4s ease'
                        }}
                    />
                </Link>

                {/* Desktop Nav Links — centered */}
                <div style={{
                    display: 'flex',
                    gap: '3rem',
                    alignItems: 'center',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
                    className="hidden-mobile-nav"
                >
                    {navItems.map((item) => (
                        item === 'Contact' || item === 'Blog' ? (
                            <Link
                                key={item}
                                to={`/${item.toLowerCase()}`}
                                style={linkStyle}
                                onMouseEnter={(e) => (e.target.style.color = 'var(--wapixo-text)')}
                                onMouseLeave={(e) => (e.target.style.color = 'var(--wapixo-text-muted)')}
                            >
                                {item}
                            </Link>
                        ) : (
                            <a
                                key={item}
                                href={`/#${item.toLowerCase()}`}
                                style={linkStyle}
                                onMouseEnter={(e) => (e.target.style.color = 'var(--wapixo-text)')}
                                onMouseLeave={(e) => (e.target.style.color = 'var(--wapixo-text-muted)')}
                            >
                                {item}
                            </a>
                        )
                    ))}
                </div>

                {/* Desktop Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden-mobile-nav">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'none',
                            border: '1px solid var(--wapixo-border)',
                            borderRadius: '8px',
                            color: 'var(--wapixo-text)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--wapixo-border)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                        {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
                    </button>

                    <Link to="/register" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                                fontSize: '0.8rem',
                                color: 'white',
                                background: 'var(--wapixo-primary)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.6rem 1.2rem',
                                cursor: 'pointer',
                                letterSpacing: '0.04em',
                                transition: 'all 0.25s ease',
                                boxShadow: '0 4px 15px rgba(180, 145, 43, 0.2)'
                            }}
                        >
                            Get Started
                        </motion.button>
                    </Link>
                </div>

                {/* Mobile Actions Container */}
                <div style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }} className="show-mobile-nav">
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'none',
                            border: '1px solid var(--wapixo-border)',
                            borderRadius: '8px',
                            color: 'var(--wapixo-text)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
                    </button>

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            background: 'none',
                            border: '1px solid var(--wapixo-border)',
                            borderRadius: '8px',
                            color: 'var(--wapixo-text)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2010,
                        }}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Full-Screen Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{
                            position: 'fixed',
                            top: '0',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'var(--wapixo-bg)',
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
                            zIndex: 1999,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2rem',
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        {navItems.map((item, idx) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                {item === 'Contact' || item === 'Blog' ? (
                                    <Link
                                        to={`/${item.toLowerCase()}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        style={{
                                            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                                            fontWeight: 200,
                                            color: 'var(--wapixo-text-muted)',
                                            textDecoration: 'none',
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {item}
                                    </Link>
                                ) : (
                                    <a
                                        href={`/#${item.toLowerCase()}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        style={{
                                            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                                            fontWeight: 200,
                                            color: 'var(--wapixo-text-muted)',
                                            textDecoration: 'none',
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {item}
                                    </a>
                                )}
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: navItems.length * 0.05 }}
                            style={{ marginTop: '1rem' }}
                        >
                            <Link to="/register" style={{ textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
                                <button
                                    style={{
                                        background: 'var(--wapixo-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.8rem 2.5rem',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        letterSpacing: '0.04em',
                                    }}
                                >
                                    Get Started
                                </button>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive CSS */}
            <style>{`
                @media (min-width: 768px) {
                    .hidden-mobile-nav { display: flex !important; }
                    .show-mobile-nav { display: none !important; }
                }
                @media (max-width: 767px) {
                    .hidden-mobile-nav { display: none !important; }
                    .show-mobile-nav { display: flex !important; }
                }
            `}</style>
        </>
    );
}
