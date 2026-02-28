import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function AppSplashScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const { theme } = useCustomerTheme();
    const navigate = useNavigate();
    const isLight = theme === 'light';

    useEffect(() => {
        // We will now handle completion based on video duration
        // Progress will be updated via onTimeUpdate event
    }, [onComplete]);

    const handleVideoTimeUpdate = (e) => {
        const video = e.target;
        const currentProgress = (video.currentTime / video.duration) * 100;
        setProgress(currentProgress);
    };

    const handleVideoEnded = () => {
        setProgress(100);
        setTimeout(() => {
            navigate('/app/login');
            onComplete && onComplete();
        }, 800);
    };

    const colors = {
        bg: isLight ? '#FFFFFF' : '#141414',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        bar: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        accent: '#C8956C'
    };

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                background: '#000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            {/* Background Video */}
            <video
                autoPlay
                muted
                playsInline
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onError={handleVideoEnded}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.6
                }}
            >
                <source src="/video/splash_video.mp4" type="video/mp4" />
            </video>

            {/* Dark Overlay for better contrast */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(0,0,0,0.7) 100%)', zIndex: 1 }} />

            {/* Top Logo Section */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    zIndex: 10
                }}
            >
                <img
                    src={isLight ? '/2-removebg-preview.png' : '/1-removebg-preview.png'}
                    alt="Salon Logo"
                    style={{
                        height: '110px',
                        width: 'auto',
                        margin: '0 auto',
                        filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
                    }}
                />
            </motion.div>


        </motion.div>
    );
}
