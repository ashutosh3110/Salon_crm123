import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function PremiumIndex({ data }) {
    if (!data) return null;

    const {
        indexTitle = "index.",
        sections = [
            { id: "01", title: "GOLD STATEMENT", desc: "Gold has captivated civilizations for millennia, symbolizing wealth, power, and eternal beauty." },
            { id: "02", title: "WHITE GOLD", desc: "White gold is the perfect fusion of sophistication and versatility, offering a modern take on classic elegance." }
        ],
        welcomeTitle = "welcome",
        welcomeMessage = "Welcome to our exclusive Fine Jewelry Collection. Crafted with precision and passion, our pieces are designed to celebrate your most cherished moments.",
        whyChooseUs = [
            "Handcrafted luxury jewelry",
            "Ethically sourced gemstones & metals",
            "Timeless designs with modern elegance",
            "Seamless shopping experience"
        ],
        heroImage = "https://images.unsplash.com/photo-1627255139045-8fe3857ca29b?q=80&w=2070&auto=format&fit=crop",
        sideText = "Browse, Click, and Own the Perfect Piece.",
        pageNumbers = { left: "02.", right: "03." }
    } = data;

    const strokeStyle = {
        color: 'transparent',
        WebkitTextStroke: '1px rgba(0,0,0,0.8)',
        textShadow: '0 0 1px rgba(0,0,0,0.1)'
    };

    const whiteStrokeStyle = {
        color: 'transparent',
        WebkitTextStroke: '1px rgba(255,255,255,0.8)',
        textShadow: '0 0 1px rgba(255,255,255,0.1)'
    };

    return (
        <div className="h-full w-full flex bg-white font-serif overflow-hidden">
            {/* Left Content Area (45% Width) */}
            <div className="w-[45%] h-full p-10 lg:p-16 flex flex-col justify-between relative bg-white border-r border-black/5 overflow-y-auto no-scrollbar">
                <div className="space-y-12">
                    {/* Index Title */}
                    <div className="relative">
                        <motion.h1
                            className="text-8xl lg:text-9xl font-light tracking-tighter"
                            style={strokeStyle}
                        >
                            {indexTitle}
                        </motion.h1>
                        <div className="w-20 h-[2px] bg-black mt-2 mb-8" />
                    </div>

                    {/* Numeric Sections */}
                    <div className="grid grid-cols-2 gap-8 lg:gap-12">
                        {sections.map((s, idx) => (
                            <div key={idx} className="space-y-4">
                                <h2 className="text-5xl lg:text-6xl font-light tracking-tighter" style={strokeStyle}>
                                    {s.id}
                                </h2>
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-2">{s.title}</h3>
                                    <p className="text-[9px] font-sans text-black/70 leading-relaxed uppercase pr-4">
                                        {s.desc}
                                    </p>
                                </div>
                                <div className="w-6 h-6 bg-black flex items-center justify-center rounded-sm">
                                    <div className="w-1.5 h-1.5 rounded-full border border-white/60" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Welcome Section */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-7xl lg:text-8xl font-light tracking-tighter" style={strokeStyle}>
                            {welcomeTitle}
                        </h2>
                        <p className="text-[10px] font-sans text-black/60 leading-relaxed max-w-sm uppercase font-bold tracking-wider">
                            {welcomeMessage}
                        </p>
                    </div>

                    {/* Why Choose Us */}
                    <div className="space-y-6 pt-4 border-t border-black/5">
                        <h3 className="text-lg font-black uppercase tracking-tighter italic">Why Choose Us?</h3>
                        <ul className="space-y-2.5">
                            {whyChooseUs.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-[9px] font-sans font-black text-black/50 uppercase tracking-[0.2em]">
                                    <div className="w-1 h-1 rounded-full bg-black/40 mt-1" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Left Number */}
                <div className="mt-12 pt-8">
                    <h4 className="text-8xl font-light tracking-tighter opacity-10" style={strokeStyle}>
                        {pageNumbers.left}
                    </h4>
                </div>
            </div>

            {/* Right Hero Image (55% Width) */}
            <div className="w-[55%] h-full relative bg-zinc-100">
                <motion.div className="absolute inset-0">
                    <img
                        src={heroImage}
                        className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
                        alt="Hero Collection"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2069&auto=format&fit=crop"; }}
                    />
                    <div className="absolute inset-0 bg-black/10" />
                </motion.div>

                {/* Floating Elements on Image */}
                <div className="absolute inset-0 flex flex-col items-end p-10 lg:p-16">
                    <div className="flex flex-col items-center justify-between h-full">
                        {/* Side Vertical Text */}
                        <div className="origin-top-right rotate-90 translate-y-32 translate-x-2">
                            <p className="text-[10px] font-sans font-bold text-white uppercase tracking-[0.5em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                {sideText}
                            </p>
                        </div>

                        {/* Plus Button */}
                        <div className="bg-black p-5 lg:p-7 shadow-2xl cursor-pointer hover:bg-zinc-900 transition-all active:scale-95 group relative overflow-hidden">
                            <Plus className="w-10 h-10 text-white transition-transform group-hover:rotate-180 duration-500" />
                        </div>
                    </div>
                </div>

                {/* Bottom Right Number */}
                <div className="absolute bottom-10 right-10">
                    <h4 className="text-8xl font-light tracking-tighter opacity-50" style={whiteStrokeStyle}>
                        {pageNumbers.right}
                    </h4>
                </div>
            </div>
        </div>
    );
}
