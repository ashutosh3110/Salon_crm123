import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const comparisons = [
    {
        id: 1,
        problem: 'Fragmented Operations',
        problemDesc: 'Using multiple disconnected apps for billing, booking, and staff management leads to data silos and chaos.',
        solution: 'Unified Ecosystem',
        solutionDesc: 'A single, surgical command center for every aspect of your salon. One platform, zero friction.',
    },
    {
        id: 2,
        problem: 'The "No-Show" Drain',
        problemDesc: 'Forgotten appointments mean empty chairs and lost revenue that never comes back.',
        solution: 'Autonomous Reminders',
        solutionDesc: 'Automated WhatsApp and SMS workflows that keep your chairs full and your schedule precise.',
    },
    {
        id: 3,
        problem: 'Inventory Blindness',
        problemDesc: 'Manual stock tracking leads to wastage, theft, and emergency re-orders.',
        solution: 'Precision Analytics',
        solutionDesc: 'Real-time barcode synchronization across outlets. Know every drop, every bottle, every gram.',
    },
    {
        id: 4,
        problem: 'Growth Guesswork',
        problemDesc: 'Scaling without data is gambling. Most owners don’t know their true profit-per-service.',
        solution: 'Actionable Intelligence',
        solutionDesc: 'Deep-dive analytics that reveal exactly which services and staff drive your growth strategy.',
    },
];

export default function WapixoSolutions() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    return (
        <section style={{
            background: '#050505',
            padding: 'clamp(60px, 10vw, 120px) clamp(1rem, 4vw, 1.5rem)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Glows */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity: 0.3
            }}>
                <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)',
                    filter: 'blur(80px)'
                }} />
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.45em', marginBottom: '1.5rem' }}
                    >
                        The Transition
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}
                    >
                        From Chaos to Command.
                    </motion.h2>
                </div>

                {/* Comparison Vertical Flow */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                    {comparisons.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '3rem',
                                alignItems: 'center',
                                paddingBottom: '4rem',
                                borderBottom: idx !== comparisons.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none'
                            }}
                        >
                            {/* Problem Side */}
                            <div style={{ opacity: 0.8, transition: 'opacity 0.5s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <XCircle size={18} color="rgba(255,255,255,0.6)" strokeWidth={1} />
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Legacy Systems</span>
                                </div>
                                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 300, marginBottom: '1rem', letterSpacing: '0.02em' }}>{item.problem}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 300 }}>{item.problemDesc}</p>
                            </div>

                            {/* Center Arrow — Hidden on Mobile */}
                            {!isMobile && (
                                <motion.div
                                    animate={{
                                        x: [0, 15, 0],
                                        opacity: [0.2, 0.6, 0.2]
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    style={{ display: 'flex', justifyContent: 'center' }}
                                >
                                    <ArrowRight size={48} strokeWidth={0.5} color="#ffffff" style={{ opacity: 0.8 }} />
                                </motion.div>
                            )}

                            {/* Solution Side */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                style={{
                                    background: 'rgba(255,255,255,0.025)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '4px',
                                    padding: '2.5rem',
                                    position: 'relative',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <CheckCircle2 size={18} color="#ffffff" strokeWidth={1} style={{ opacity: 0.8 }} />
                                    <span style={{ color: '#ffffff', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.8 }}>The Wapixo Standard</span>
                                </div>
                                <h3 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 300, marginBottom: '1rem', letterSpacing: '0.02em' }}>{item.solution}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.7, fontWeight: 300 }}>{item.solutionDesc}</p>

                                {/* Aesthetic Glow Accent */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '100px',
                                    height: '100px',
                                    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.05), transparent 70%)',
                                    pointerEvents: 'none'
                                }} />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
