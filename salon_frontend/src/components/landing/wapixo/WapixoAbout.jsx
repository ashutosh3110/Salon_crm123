import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function WapixoAbout() {
    const containerRef = useRef(null);

    // Mouse tracking for 3D tilt effect on the image
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    // Rotation values for the 3D tilt
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

    // Parallax values for the glass overlay and floating card
    const glassX = useTransform(mouseXSpring, [-0.5, 0.5], [15, -15]);
    const glassY = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]);
    const metricX = useTransform(mouseXSpring, [-0.5, 0.5], [-20, 20]);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = (mouseX / width) - 0.5;
        const yPct = (mouseY / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <section style={{
            background: '#050505',
            padding: 'clamp(60px, 10vw, 120px) clamp(1rem, 4vw, 1.5rem)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background cinematic elements */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity: 0.4
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '40%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-10%',
                    width: '40%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }} />
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>

                    {/* Visual Side with Interactive 3D Tilt */}
                    <motion.div
                        ref={containerRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'relative',
                            perspective: '2000px',
                            cursor: 'crosshair'
                        }}
                    >
                        <motion.div
                            style={{
                                position: 'relative',
                                aspectRatio: '1/1',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.05)',
                                rotateX,
                                rotateY,
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            <motion.img
                                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200"
                                alt="Salon Mastery"
                                whileHover={{ scale: 1.05, filter: 'grayscale(0.4) contrast(1.1)', opacity: 1 }}
                                transition={{ duration: 0.6 }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    filter: 'grayscale(1) contrast(1.1)',
                                    opacity: 0.8
                                }}
                            />
                            {/* Inner Sharp Frame Overlay - Parallax Interaction */}
                            <motion.div style={{
                                position: 'absolute',
                                inset: '1.5rem',
                                border: '1px solid rgba(255,255,255,0.12)',
                                pointerEvents: 'none',
                                x: glassX,
                                y: glassY,
                                z: 50
                            }} />
                        </motion.div>

                        {/* Floating Metric Card - Reverse Parallax */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            style={{
                                position: 'absolute',
                                bottom: '-1.5rem',
                                right: 'clamp(0rem, 2vw, -1rem)',
                                background: 'rgba(10,10,10,0.9)',
                                backdropFilter: 'blur(20px)',
                                padding: '1.2rem 1.8rem',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '2px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                x: metricX,
                                z: 100
                            }}
                        >
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 0.4rem 0' }}>Trusted By</p>
                            <h4 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 200, margin: 0 }}>500+ Salons</h4>
                        </motion.div>
                    </motion.div>

                    {/* Content Side */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span style={{
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '0.7rem',
                                fontWeight: 300,
                                textTransform: 'uppercase',
                                letterSpacing: '0.45em',
                                display: 'block',
                                marginBottom: '1.5rem'
                            }}>
                                The Vision
                            </span>
                            <h2 style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                                fontWeight: 200,
                                color: '#ffffff',
                                letterSpacing: '-0.03em',
                                lineHeight: 1.05,
                                margin: '0 0 2rem 0'
                            }}>
                                Defined by Artists.<br />Driven by Data.
                            </h2>
                            <div style={{
                                width: '40px',
                                height: '1px',
                                background: 'rgba(255,255,255,0.2)',
                                marginBottom: '2rem'
                            }} />
                            <p style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '1.1rem',
                                fontWeight: 300,
                                lineHeight: 1.6,
                                marginBottom: '1.5rem',
                                letterSpacing: '0.01em'
                            }}>
                                Wapixo isn't just a management tool—it's a symphony of efficiency. We understand the heartbeat of the beauty industry, from the precision of a cut to the complexity of a multi-outlet empire.
                            </p>
                            <p style={{
                                color: 'rgba(255,255,255,0.35)',
                                fontSize: '0.95rem',
                                fontWeight: 300,
                                lineHeight: 1.7
                            }}>
                                Our platform empowers owners to reclaim their time and creators to focus on their craft. With over 50,000 monthly appointments handled with surgical precision, we are the silent engine behind India's most successful salons.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '3.5rem' }}>
                                <motion.div
                                    whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.15)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    style={{
                                        padding: '1.5rem',
                                        background: 'rgba(255,255,255,0.01)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '4px',
                                        transition: 'all 0.4s ease'
                                    }}
                                >
                                    <h5 style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 300, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Precision POS</h5>
                                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', lineHeight: 1.5, margin: 0 }}>Billing in under 10 seconds. Optimized for high-frequency receptions.</p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.15)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    style={{
                                        padding: '1.5rem',
                                        background: 'rgba(255,255,255,0.01)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '4px',
                                        transition: 'all 0.4s ease'
                                    }}
                                >
                                    <h5 style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 300, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Real-time CRM</h5>
                                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', lineHeight: 1.5, margin: 0 }}>Every client preference, captured and analyzed for retention.</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
