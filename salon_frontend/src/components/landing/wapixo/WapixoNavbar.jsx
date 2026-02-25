import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navItems = ['Features', 'Pricing', 'Blog', 'Contact'];

export default function WapixoNavbar() {
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

    const getLinkProps = (item) => {
        const isPage = item === 'Contact' || item === 'Blog';
        return isPage
            ? { as: Link, to: `/${item.toLowerCase()}` }
            : { as: 'a', href: `/#${item.toLowerCase()}` };
    };

    const linkStyle = {
        fontFamily: "'Inter', sans-serif",
        fontWeight: 300,
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.06em',
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
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 clamp(1rem, 4vw, 4rem)',
                    height: '60px',
                    background: 'rgba(5, 5, 5, 0.75)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 1010 }}>
                    <img
                        src="/1-removebg-preview.png"
                        alt="Wapixo Logo"
                        style={{
                            height: 'clamp(80px, 15vw, 150px)',
                            width: 'auto',
                            filter: 'brightness(0) invert(1)',
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
                                onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                                onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.55)')}
                            >
                                {item}
                            </Link>
                        ) : (
                            <a
                                key={item}
                                href={`/#${item.toLowerCase()}`}
                                style={linkStyle}
                                onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                                onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.55)')}
                            >
                                {item}
                            </a>
                        )
                    ))}
                </div>

                {/* Desktop CTA */}
                <Link to="/register" style={{ textDecoration: 'none', flexShrink: 0 }} className="hidden-mobile-nav">
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

                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="show-mobile-nav"
                    style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        padding: '0.45rem',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1010,
                    }}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
                </button>
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
                            top: '60px',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(5, 5, 5, 0.98)',
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
                            zIndex: 999,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2.5rem',
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        {navItems.map((item, idx) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.07 }}
                            >
                                {item === 'Contact' || item === 'Blog' ? (
                                    <Link
                                        to={`/${item.toLowerCase()}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        style={{
                                            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                                            fontWeight: 200,
                                            color: 'rgba(255,255,255,0.7)',
                                            textDecoration: 'none',
                                            letterSpacing: '-0.01em',
                                            transition: 'color 0.25s ease',
                                        }}
                                        onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                                        onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
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
                                            color: 'rgba(255,255,255,0.7)',
                                            textDecoration: 'none',
                                            letterSpacing: '-0.01em',
                                            transition: 'color 0.25s ease',
                                        }}
                                        onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                                        onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
                                    >
                                        {item}
                                    </a>
                                )}
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: navItems.length * 0.07 }}
                            style={{ marginTop: '1rem' }}
                        >
                            <Link to="/register" style={{ textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
                                <button
                                    style={{
                                        background: '#ffffff',
                                        color: '#050505',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.85rem 2.5rem',
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
