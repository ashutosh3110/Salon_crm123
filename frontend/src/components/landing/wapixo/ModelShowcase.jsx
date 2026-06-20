import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import api from '../../../services/api';

export default function ModelShowcase() {
    const { theme } = useTheme();

    const [cmsData, setCmsData] = useState({
        headline_part1: 'Smart tools for',
        headline_part2: 'modern salons',
        desc: 'Elevate your client experience with Wapixo. Seamlessly manage appointments, track staff performance in real-time, and automate your marketing—all from one intuitive dashboard.',
        primary_cta: 'Get Started Free',
        secondary_cta: 'Watch Demo',
        image_url: '/women%20wapixo.png'
    });

    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const response = await api.get('/cms');
                if (response.data?.success && response.data?.data?.landing_model_showcase) {
                    setCmsData(prev => ({...prev, ...response.data.data.landing_model_showcase}));
                }
            } catch (err) {
                console.error("Failed to fetch CMS data for ModelShowcase:", err);
            }
        };
        fetchCMS();
    }, []);

    const floatAnim = (yOffset = -15, duration = 4, delay = 0) => ({
        y: [0, yOffset, 0],
        transition: {
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay
        }
    });

    return (
        <section className="relative w-full overflow-hidden py-16 sm:py-24 bg-[var(--wapixo-bg)]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    
                    {/* Left Column: Image with Floating Cards */}
                    <div className="relative w-full lg:w-1/2 flex justify-center items-center">
                        
                        {/* Main Image Container with Curved Edges (Horizontal & Compact) */}
                        <div className="relative w-full max-w-[600px] lg:max-w-[650px] h-[260px] sm:h-[400px] bg-[#E1EDFA] dark:bg-[#1E293B]/60 rounded-[30px] sm:rounded-[50px] overflow-hidden shadow-2xl flex items-center justify-center">
                            {/* Model Image */}
                            <motion.img 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                src={cmsData.image_url}
                                alt="Salon Professional"
                                className="relative z-10 w-full h-full object-cover object-center"
                            />
                        </div>

                        {/* Floating Cards (positioned relative to the left column wrapper) */}
                        <div className="absolute inset-0 pointer-events-none">
                            
                            {/* Left Card 1: Today's Appointments */}
                            <motion.div 
                                animate={floatAnim(-8, 4.5, 0)}
                                className="absolute z-20 -left-[2%] sm:left-[-10%] top-[10%] w-[120px] sm:w-[170px] bg-white dark:bg-slate-800 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-2 sm:p-3 pointer-events-auto"
                            >
                                <p className="text-[0.55rem] sm:text-[0.7rem] text-slate-600 dark:text-slate-300 mb-1">Today's Appointments</p>
                                <div className="flex items-baseline gap-1 sm:gap-2">
                                    <h3 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white">56</h3>
                                    <span className="text-green-500 text-[0.5rem] sm:text-[0.55rem] font-semibold flex items-center">+60% <ArrowUpRight size={8} className="sm:w-[10px] sm:h-[10px]" /></span>
                                </div>
                            </motion.div>

                            {/* Right Card 1: Staff Avatar */}
                            <motion.div 
                                animate={floatAnim(-10, 5, 1)}
                                className="absolute z-20 -right-[2%] sm:right-[-5%] top-[15%] sm:top-[20%] bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-2 sm:p-3 flex items-center gap-1.5 sm:gap-2 pr-3 sm:pr-6 pointer-events-auto"
                            >
                                <div className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] rounded-full overflow-hidden bg-pink-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                                    <img src="https://ui-avatars.com/api/?name=Katrin&background=FDF2F8&color=EC4899" alt="Staff" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="text-[0.65rem] sm:text-[0.85rem] font-semibold text-slate-800 dark:text-white mb-0.5">Katrin</h4>
                                    <p className="text-[0.5rem] sm:text-[0.65rem] text-green-600 font-medium flex items-center gap-0.5 sm:gap-1">
                                        5 Appointments <CheckCircle2 size={8} className="sm:w-[10px] sm:h-[10px] text-green-500 fill-green-100" />
                                    </p>
                                </div>
                            </motion.div>

                            {/* Left Card 2: Top Services */}
                            <motion.div 
                                animate={floatAnim(-6, 4, 2)}
                                className="absolute z-20 left-[2%] sm:left-[5%] bottom-[-5%] sm:bottom-[-10%] w-[130px] sm:w-[220px] bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-2 sm:p-4 pointer-events-auto"
                            >
                                <h4 className="text-[0.65rem] sm:text-[0.85rem] font-medium text-slate-800 dark:text-white mb-2 sm:mb-3">Top Services</h4>
                                <div className="flex flex-col gap-1.5 sm:gap-3">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="w-5 h-5 sm:w-8 sm:h-8 rounded sm:rounded-md overflow-hidden bg-slate-100 shrink-0">
                                            <img src="/massage.png" alt="service" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="text-[0.55rem] sm:text-[0.75rem] font-medium text-slate-800 dark:text-white leading-none sm:leading-normal">Head massage</p>
                                            </div>
                                            <p className="text-[0.45rem] sm:text-[0.55rem] text-slate-500 leading-none sm:leading-normal">$110 &bull; 45 mins</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="w-5 h-5 sm:w-8 sm:h-8 rounded sm:rounded-md overflow-hidden bg-slate-100 shrink-0">
                                            <img src="/padicur.png" alt="service" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="text-[0.55rem] sm:text-[0.75rem] font-medium text-slate-800 dark:text-white leading-none sm:leading-normal">Pedicure</p>
                                            </div>
                                            <p className="text-[0.45rem] sm:text-[0.55rem] text-slate-500 leading-none sm:leading-normal">$60 &bull; 1 hr</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* SVG Decorators */}
                            <svg className="absolute right-[5%] top-[15%] w-[50px] h-[50px] text-blue-500 hidden sm:block z-10" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M 30 70 C 20 20, 60 40, 80 15" />
                                <path d="M 65 15 L 80 15 L 80 30" />
                            </svg>
                            <svg className="absolute left-[15%] bottom-[20%] w-[20px] h-[20px] text-cyan-400 z-10 hidden sm:block" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
                                <circle cx="50" cy="50" r="40" />
                            </svg>
                        </div>
                    </div>

                    {/* Right Column: Text Content */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left mt-8 lg:mt-0">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            style={{ color: 'var(--wapixo-text)' }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-serif italic leading-tight mb-6 tracking-tight"
                        >
                            {cmsData.headline_part1} <span style={{ color: 'var(--wapixo-primary)' }}>{cmsData.headline_part2}</span>
                        </motion.h2>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            style={{ color: 'var(--wapixo-text-muted)' }}
                            className="text-lg sm:text-xl mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0"
                        >
                            {cmsData.desc}
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                        >
                            <button 
                                style={{ backgroundColor: 'var(--wapixo-primary)', color: 'var(--wapixo-bg)' }}
                                className="px-8 py-4 rounded-full font-medium transition-all hover:scale-105 shadow-lg w-full sm:w-auto"
                            >
                                {cmsData.primary_cta}
                            </button>
                            <button 
                                style={{ borderColor: 'var(--wapixo-border)', color: 'var(--wapixo-text)' }}
                                className="px-8 py-4 border-2 rounded-full font-medium transition-all hover:bg-[var(--wapixo-bg-alt)] w-full sm:w-auto flex items-center justify-center gap-2"
                            >
                                {cmsData.secondary_cta} <ArrowUpRight size={18} style={{ color: 'var(--wapixo-primary)' }} />
                            </button>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            style={{ color: 'var(--wapixo-text-muted)' }}
                            className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} style={{ color: 'var(--wapixo-primary)' }} /> No credit card required
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} style={{ color: 'var(--wapixo-primary)' }} /> Cancel anytime
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
