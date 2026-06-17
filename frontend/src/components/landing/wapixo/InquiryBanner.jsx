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
                    className={`fixed z-[9999] bottom-4 right-4 w-[240px] sm:w-[320px] flex flex-col overflow-hidden rounded-2xl border backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0f0f0f]/90 border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.6)]' : 'bg-white/95 border-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.1)]'}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    {/* Banner Image Container */}
                    <div className="relative w-full h-[80px] sm:h-[120px] overflow-hidden shrink-0">
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
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />

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
                                width: '22px',
                                height: '22px',
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
                            <X size={10} />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-2.5 sm:p-4 flex flex-col gap-2 sm:gap-3">
                        <div>
                            <h4 style={{
                                margin: '0 0 2px 0',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: 'var(--wapixo-text)',
                                letterSpacing: '-0.01em'
                            }}>
                                {bannerData.title}
                            </h4>
                            <p style={{
                                margin: 0,
                                fontSize: '0.65rem',
                                color: 'var(--wapixo-text-muted)',
                                lineHeight: '1.25',
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
                                    padding: '8px',
                                    background: 'var(--wapixo-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
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
