import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import getImageUrl from '../../../utils/imageUtils';

export default function InquiryBanner({ data }) {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(false);

    const bannerData = data || {
        badge_text: 'SPECIAL INQUIRY',
        title: 'Need Custom Salon CRM?',
        desc: 'Get a custom walkthrough and check features designed exclusively to scale your salon business.',
        button_text: 'Send Inquiry',
        image_url: '/banner.jpeg',
        delay_seconds: 5
    };

    const resolveImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
        if (url.startsWith('/') && !url.includes('uploads')) return url;
        return getImageUrl(url);
    };

    useEffect(() => {
        // Check if user already dismissed it in the current session
        const isDismissed = sessionStorage.getItem('wapixo-inquiry-banner-dismissed');
        if (isDismissed) return;

        const delay = (bannerData.delay_seconds ?? 5) * 1000;

        // Trigger after dynamic delay
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [bannerData.delay_seconds]);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('wapixo-inquiry-banner-dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        zIndex: 9999,
                        width: '320px',
                        maxWidth: 'calc(100vw - 48px)',
                        background: theme === 'dark'
                            ? 'rgba(15, 15, 15, 0.85)'
                            : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid var(--wapixo-border)',
                        borderRadius: '16px',
                        boxShadow: theme === 'dark'
                            ? '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                            : '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        fontFamily: "'Inter', sans-serif"
                    }}
                >
                    {/* Banner Image Container */}
                    <div style={{ position: 'relative', width: '100%', height: '140px', overflow: 'hidden' }}>
                        <img
                            src={resolveImageUrl(bannerData.image_url)}
                            alt={bannerData.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.6s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        {/* Overlay Gradient */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4) 100%)',
                            pointerEvents: 'none'
                        }} />

                        {/* Top badge */}
                        {bannerData.badge_text && (
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                background: 'rgba(180, 145, 43, 0.9)', // Theme gold primary
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                            }}>
                                {bannerData.badge_text}
                            </div>
                        )}

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                zIndex: 10
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
                            aria-label="Dismiss banner"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div style={{ padding: '16px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <h4 style={{
                                margin: '0 0 4px 0',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: 'var(--wapixo-text)',
                                letterSpacing: '-0.01em'
                            }}>
                                {bannerData.title}
                            </h4>
                            <p style={{
                                margin: 0,
                                fontSize: '0.78rem',
                                color: 'var(--wapixo-text-muted)',
                                lineHeight: '1.4',
                                fontWeight: 400
                            }}>
                                {bannerData.desc}
                            </p>
                        </div>

                        <Link
                            to="/contact"
                            onClick={handleClose}
                            style={{ textDecoration: 'none' }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: 'var(--wapixo-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.25s ease',
                                    boxShadow: '0 4px 15px rgba(180, 145, 43, 0.2)'
                                }}
                            >
                                {bannerData.button_text} <Send size={12} />
                            </motion.button>
                        </Link>
                    </div>

                    <style>{`
                        .inquiry-banner-title {
                            color: var(--wapixo-text) !important;
                            font-family: 'Inter', sans-serif !important;
                            font-weight: 600 !important;
                            font-style: normal !important;
                        }
                        .inquiry-banner-desc {
                            color: var(--wapixo-text-muted) !important;
                            font-family: 'Inter', sans-serif !important;
                            font-weight: 300 !important;
                            font-style: normal !important;
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
