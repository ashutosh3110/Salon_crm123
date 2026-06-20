import React from 'react';
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ScissorsMorph({ data }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleCanPlay = () => {
            video.playbackRate = 1.5;
            video.play().catch(() => { });
        };

        video.addEventListener('canplay', handleCanPlay);
        return () => video.removeEventListener('canplay', handleCanPlay);
    }, []);

    return (
        <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-black">
            {/* Background Video */}
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                style={{ filter: 'brightness(0.7)' }}
            >
                <source src="/video/tools video no watermark.mp4" type="video/mp4" />
            </video>

            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

            {/* Content Overlay */}
            <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <p className="text-sm font-semibold tracking-[0.4em] text-[#B4912B] uppercase mb-6">
                        {data?.overline || 'Crafted for Artists'}
                    </p>
                    <h2 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 200,
                        fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
                        letterSpacing: '-0.035em',
                        lineHeight: 1.05,
                        margin: '0 0 1.25rem 0',
                    }} className="text-white text-white-force">
                        {data?.title || 'Precision Tools for'} <br />
                        <span style={{ fontWeight: 500 }}>{data?.subtitle || 'The Modern Artist.'}</span>
                    </h2>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 300,
                        fontSize: '1rem',
                        margin: '0 auto 2.25rem auto',
                        maxWidth: '420px',
                        lineHeight: 1.7,
                    }} className="text-white/60 text-white-muted-force">
                        {data?.desc || "Elevate your craft with the industry's most refined equipment. Performance meet elegance in every cut and style."}
                    </p>
                </motion.div>

            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-0" />
        </section>
    );
}
