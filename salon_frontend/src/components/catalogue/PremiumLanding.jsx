import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

export default function PremiumLanding({ data }) {
    if (!data) return null;

    const {
        backgroundImage,
        titleText,
        brandLogo,
        tagline,
        accentColor,
        socialLinks
    } = data;

    // Split title by \n or use default
    const titleLines = titleText.split('\n');

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black font-serif select-none">
            {/* Background Image */}
            <motion.div className="absolute inset-0">
                <img
                    src={backgroundImage || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop"}
                    alt="Premium Catalog Background"
                    className="h-full w-full object-cover grayscale brightness-75"
                />
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            </motion.div>

            {/* Vertical Outlined Title */}
            <div className="absolute left-12 bottom-12 z-10 hidden md:block">
                <motion.div
                    className="flex flex-col items-start origin-bottom-left"
                    style={{ transform: 'rotate(-90deg) translateY(100%)' }}
                >
                    {titleLines.map((line, idx) => (
                        <h1
                            key={idx}
                            className="text-8xl lg:text-9xl font-light tracking-tighter leading-none whitespace-nowrap"
                            style={{
                                color: 'transparent',
                                WebkitTextStroke: `1px ${accentColor || '#ffffff'}`,
                                textShadow: idx === 0 ? 'none' : `0 0 1px ${accentColor || '#ffffff'}`,
                                opacity: 0.8
                            }}
                        >
                            {line}
                        </h1>
                    ))}
                    {/* The circle 'o' as seen in the screenshot */}
                    <div className="absolute -right-12 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 rounded-full border border-white opacity-60" />
                    </div>
                </motion.div>
            </div>

            {/* Mobile Title (not vertical) */}
            <div className="absolute left-8 bottom-32 z-10 md:hidden">
                {titleLines.map((line, idx) => (
                    <h1
                        key={idx}
                        className="text-6xl font-light tracking-tighter leading-tight"
                        style={{
                            color: 'transparent',
                            WebkitTextStroke: `1px ${accentColor || '#ffffff'}`,
                            opacity: 0.8
                        }}
                    >
                        {line}
                    </h1>
                ))}
            </div>

            {/* Bottom Right Brand & Socials */}
            <div className="absolute bottom-12 right-12 z-20 flex flex-col items-end gap-8">
                {/* Brand Info */}
                <motion.div className="flex items-center gap-4 text-white text-right">
                    <div className="max-w-[150px]">
                        <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] opacity-80 leading-relaxed">
                            {tagline || "Discover timeless elegance - Shop Now!"}
                        </p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center">
                        {brandLogo ? (
                            <img src={brandLogo} alt="Logo" className="w-8 h-8 object-contain invert" />
                        ) : (
                            <svg viewBox="0 0 100 100" className="w-10 h-10 fill-white">
                                <path d="M50 10 C 25 10 10 25 10 50 C 10 75 25 90 50 90 C 75 90 90 75 90 50 C 90 25 75 10 50 10 Z M50 20 C 65 20 80 35 80 55 C 80 70 70 80 50 80 C 35 80 25 70 25 55 C 25 45 35 30 50 20 Z" />
                            </svg>
                        )}
                    </div>
                </motion.div>

                {/* Social Icons */}
                <motion.div className="flex gap-6 text-white">
                    {socialLinks?.facebook && <a href={socialLinks.facebook} target="_blank" rel="noreferrer"><Facebook className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" /></a>}
                    {socialLinks?.twitter && <a href={socialLinks.twitter} target="_blank" rel="noreferrer"><Twitter className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" /></a>}
                    {socialLinks?.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noreferrer"><Linkedin className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" /></a>}
                    {socialLinks?.instagram && <a href={socialLinks.instagram} target="_blank" rel="noreferrer"><Instagram className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" /></a>}
                    {socialLinks?.youtube && <a href={socialLinks.youtube} target="_blank" rel="noreferrer"><Youtube className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" /></a>}
                </motion.div>
            </div>

            {/* Interactive Scroll Hint */}
            <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="w-[1px] h-12 bg-white/20" />
                <span className="text-[8px] uppercase tracking-[0.5em] text-white/40">Scroll</span>
            </motion.div>
        </div>
    );
}
