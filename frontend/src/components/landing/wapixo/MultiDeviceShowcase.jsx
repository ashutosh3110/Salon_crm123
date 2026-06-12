import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { getImageUrl } from '../../../utils/imageUtils';

export default function MultiDeviceShowcase({ data }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const overline = data?.overline || 'Unified Ecosystem';
    const headlinePart1 = data?.headline_part1 || 'One platform.';
    const headlinePart2 = data?.headline_part2 || 'All devices.';
    const desc = data?.desc || 'Manage bookings, view live dashboard analytics, update catalog styles, and run your client membership programs seamlessly from desktop, tablet, and mobile.';
    const monitorImageUrl = data?.monitor_image_url ? getImageUrl(data.monitor_image_url) : '/image1.png';
    const laptopImageUrl = data?.laptop_image_url ? getImageUrl(data.laptop_image_url) : '/image1.png';
    const tabletImageUrl = data?.tablet_image_url ? getImageUrl(data.tablet_image_url) : '/image1.png';
    const phoneImageUrl = data?.phone_image_url ? getImageUrl(data.phone_image_url) : '/image1.png';

    return (
        <section
            id="multi-device-showcase"
            style={{
                background: isDark ? 'var(--wapixo-bg, #050505)' : 'var(--wapixo-bg-alt, #fdf9f4)',
                padding: 'clamp(60px, 8vw, 100px) 1.5rem',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'background 0.3s ease'
            }}
        >
            {/* Background Neon Glows */}
            <div style={{
                position: 'absolute',
                bottom: '10%',
                left: '-10%',
                width: 'clamp(300px, 40vw, 550px)',
                aspectRatio: '1',
                borderRadius: '50%',
                background: isDark
                    ? 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
                filter: 'blur(70px)',
                pointerEvents: 'none',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                top: '10%',
                right: '-10%',
                width: 'clamp(300px, 45vw, 600px)',
                aspectRatio: '1',
                borderRadius: '50%',
                background: isDark
                    ? 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                filter: 'blur(80px)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Title / Header of the Showcase */}
            <div style={{ zIndex: 2, textAlign: 'center', marginBottom: '50px', maxWidth: '800px' }}>
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ color: '#B4912B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.35em', marginBottom: '1rem' }}
                >
                    {overline}
                </motion.p>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    style={{ fontWeight: 200, fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: isDark ? '#ffffff' : 'var(--wapixo-text, #0f172a)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 1.25rem 0' }}
                >
                    {headlinePart1} <span style={{ fontWeight: 500 }}>{headlinePart2}</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    style={{ color: isDark ? '#a3a3a3' : 'var(--wapixo-text-muted, #475569)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', fontWeight: 300, lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}
                >
                    {desc}
                </motion.p>
            </div>

            {/* Device Layout Wrapper */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '1100px',
                height: 'clamp(450px, 70vw, 720px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1
            }} className="devices-viewport">



                {/* 1. MONITOR (Desktop Center-Back) */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        top: '5%',
                        width: '64%',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                    className="device-monitor"
                >
                    {/* Monitor Screen Frame */}
                    <div style={{
                        width: '100%',
                        aspectRatio: '16/10',
                        background: '#121212',
                        borderRadius: '16px 16px 0 0',
                        border: '10px solid #1a1a1a',
                        borderBottomWidth: '12px',
                        boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.6)' : '0 15px 35px -12px rgba(0,0,0,0.12)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {/* Monitor Content: Dynamic Image */}
                        <img
                            src={monitorImageUrl}
                            alt="Monitor Dashboard Screen"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                    </div>

                    {/* Monitor Stand */}
                    <div style={{
                        width: '18%',
                        height: '40px',
                        background: '#2b2b2b',
                        boxShadow: 'inset 0 10px 10px rgba(0,0,0,0.5)',
                        position: 'relative',
                        zIndex: 1
                    }} />
                    <div style={{
                        width: '32%',
                        height: '8px',
                        background: '#1a1a1a',
                        borderRadius: '4px 4px 0 0',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.6)'
                    }} />
                </motion.div>

                {/* 2. LAPTOP (Bottom-Left Foreground) */}
                <motion.div
                    initial={{ opacity: 0, x: -50, y: 30 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        bottom: '8%',
                        left: '1%',
                        width: '45%',
                        zIndex: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                    className="device-laptop"
                >
                    {/* Laptop Screen */}
                    <div style={{
                        width: '90%',
                        aspectRatio: '16/10',
                        background: '#0a0a0a',
                        borderRadius: '12px 12px 0 0',
                        border: '8px solid #0d0d0d',
                        boxShadow: isDark ? '0 20px 40px -10px rgba(0,0,0,0.5)' : '0 12px 25px -10px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {/* Laptop Dashboard Content: Dynamic Image */}
                        <img
                            src={laptopImageUrl}
                            alt="Laptop Dashboard Screen"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                    </div>
                    {/* Laptop Keyboard / Base */}
                    <div style={{
                        width: '100%',
                        height: '12px',
                        background: '#c0c0c0',
                        borderRadius: '0 0 8px 8px',
                        borderBottom: '4px solid #999',
                        boxShadow: isDark ? '0 15px 30px rgba(0,0,0,0.4)' : '0 10px 20px rgba(0,0,0,0.08)',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '15%',
                            height: '4px',
                            background: '#777',
                            borderRadius: '0 0 4px 4px'
                        }} />
                    </div>
                </motion.div>

                {/* 3. TABLET (Right-Middle Foreground) */}
                <motion.div
                    initial={{ opacity: 0, x: 50, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        right: '4%',
                        top: '25%',
                        width: '26%',
                        zIndex: 3,
                        background: '#0c0c0c',
                        borderRadius: '24px',
                        padding: '8px',
                        border: '4px solid #1a1a1a',
                        boxShadow: isDark ? '0 30px 60px -15px rgba(0,0,0,0.6)' : '0 15px 30px -12px rgba(0,0,0,0.12)'
                    }}
                    className="device-tablet"
                >
                    {/* Tablet Screen */}
                    <div style={{
                        width: '100%',
                        aspectRatio: '3/4',
                        background: '#f8fafc',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {/* Tablet Content: Dynamic Image */}
                        <img
                            src={tabletImageUrl}
                            alt="Tablet Project Screen"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                    </div>
                </motion.div>

                {/* 4. SMARTPHONE (Center-Right Foreground, overlaying monitor and tablet) */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        right: '25%',
                        bottom: '2%',
                        width: '18%',
                        zIndex: 5,
                        background: '#0d0d0d',
                        borderRadius: '2rem',
                        padding: '4px',
                        border: '3px solid #1a1a1a',
                        boxShadow: isDark ? '0 35px 70px -10px rgba(0,0,0,0.6)' : '0 15px 35px -10px rgba(0,0,0,0.12)'
                    }}
                    className="device-phone"
                >
                    {/* Phone Screen showing public/image1.png */}
                    <div style={{
                        width: '100%',
                        aspectRatio: '9/19.5',
                        borderRadius: '1.8rem',
                        overflow: 'hidden',
                        position: 'relative',
                        background: '#fcf8f5'
                    }}>
                        {/* Dynamic Island */}
                        <div style={{
                            position: 'absolute',
                            top: '4px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '35%',
                            height: '14px',
                            background: '#000000',
                            borderRadius: '99px',
                            zIndex: 10
                        }} className="dynamic-island" />

                        {/* Image inside Phone Frame */}
                        <img
                            src={phoneImageUrl}
                            alt="Mobile app layout"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                    </div>
                </motion.div>

            </div>

            {/* Custom Responsive Styles via global/scoped css */}
            <style>{`
                @media (max-width: 768px) {
                    .devices-viewport {
                        height: 520px !important;
                    }
                    .device-monitor {
                        width: 75% !important;
                        top: 10% !important;
                    }
                    .device-monitor > div:first-child {
                        border-width: 5px !important;
                        border-radius: 8px 8px 0 0 !important;
                    }
                    .device-monitor > div:nth-child(2) {
                        height: 20px !important;
                    }
                    .device-monitor > div:last-child {
                        height: 4px !important;
                    }

                    .device-laptop {
                        width: 50% !important;
                        bottom: 12% !important;
                    }
                    .device-laptop > div:first-child {
                        border-width: 4px !important;
                        border-radius: 6px 6px 0 0 !important;
                    }
                    .device-laptop > div:last-child {
                        height: 6px !important;
                        border-bottom-width: 2px !important;
                    }

                    .device-tablet {
                        width: 32% !important;
                        top: 22% !important;
                        right: 2% !important;
                        border-width: 2px !important;
                        border-radius: 12px !important;
                        padding: 4px !important;
                    }
                    .device-tablet > div {
                        border-radius: 9px !important;
                    }

                    .device-phone {
                        width: 22% !important;
                        right: 22% !important;
                        bottom: 6% !important;
                        border-width: 2px !important;
                        border-radius: 1.25rem !important;
                        padding: 3px !important;
                    }
                    .device-phone > div {
                        border-radius: 1.05rem !important;
                    }
                    .device-phone .dynamic-island {
                        height: 8px !important;
                        top: 2px !important;
                    }
                }
                @media (max-width: 480px) {
                    .devices-viewport {
                        height: 400px !important;
                    }
                    .device-monitor {
                        width: 85% !important;
                        top: 15% !important;
                    }
                    .device-monitor > div:first-child {
                        border-width: 3px !important;
                        border-radius: 6px 6px 0 0 !important;
                    }
                    .device-monitor > div:nth-child(2) {
                        height: 12px !important;
                    }
                    .device-monitor > div:last-child {
                        height: 3px !important;
                    }

                    .device-laptop {
                        width: 55% !important;
                        bottom: 15% !important;
                        left: -2% !important;
                    }
                    .device-laptop > div:first-child {
                        border-width: 3px !important;
                        border-radius: 5px 5px 0 0 !important;
                    }
                    .device-laptop > div:last-child {
                        height: 4px !important;
                        border-bottom-width: 1px !important;
                    }

                    .device-tablet {
                        width: 36% !important;
                        top: 25% !important;
                        right: -2% !important;
                        border-width: 1.5px !important;
                        border-radius: 10px !important;
                        padding: 3px !important;
                    }
                    .device-tablet > div {
                        border-radius: 7px !important;
                    }

                    .device-phone {
                        width: 25% !important;
                        right: 18% !important;
                        bottom: 8% !important;
                        border-width: 1.5px !important;
                        border-radius: 1rem !important;
                        padding: 2px !important;
                    }
                    .device-phone > div {
                        border-radius: 0.85rem !important;
                    }
                    .device-phone .dynamic-island {
                        height: 6px !important;
                        top: 1.5px !important;
                    }
                }
            `}</style>
        </section>
    );
}
