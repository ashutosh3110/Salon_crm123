import { motion } from 'framer-motion';
import { Calendar, BarChart3, Users, Sparkles, Clock, Shield } from 'lucide-react';

const features = [
    {
        icon: Calendar,
        title: 'Smart Booking',
        desc: 'Real-time scheduling with zero conflicts. Your clients book 24/7.',
    },
    {
        icon: BarChart3,
        title: 'Advanced Analytics',
        desc: 'Revenue insights, peak hours, and growth metrics at a glance.',
    },
    {
        icon: Users,
        title: 'Client Management',
        desc: 'Complete client histories, preferences, and loyalty tracking.',
    },
    {
        icon: Sparkles,
        title: 'Loyalty Engine',
        desc: 'Automated rewards and referral programs that retain clients.',
    },
    {
        icon: Clock,
        title: 'Staff Scheduling',
        desc: 'Shift management, commissions, and performance tracking.',
    },
    {
        icon: Shield,
        title: 'Multi-Outlet',
        desc: 'Manage every branch from one powerful dashboard.',
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function Features() {
    return (
        <section
            id="features"
            style={{
                background: '#050505',
                padding: 'clamp(5rem, 10vw, 10rem) clamp(1.5rem, 5vw, 5rem)',
            }}
        >
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 6rem)' }}
            >
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 300,
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    marginBottom: '1.25rem',
                }}>
                    Capabilities
                </p>
                <h2 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 200,
                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    margin: 0,
                }}>
                    Precision Tools for<br />the Modern Artist.
                </h2>
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 300,
                    fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)',
                    color: 'rgba(255,255,255,0.45)',
                    marginTop: '1.5rem',
                    maxWidth: '500px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    lineHeight: 1.7,
                }}>
                    Streamlined booking. Advanced analytics. Elegant client management.<br />Designed for the elite.
                </p>
            </motion.div>

            {/* Feature grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1px',
                    maxWidth: '1100px',
                    margin: '0 auto',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                {features.map(({ icon: Icon, title, desc }) => (
                    <motion.div
                        key={title}
                        variants={itemVariants}
                        whileHover={{ background: 'rgba(255,255,255,0.04)' }}
                        style={{
                            padding: 'clamp(2rem, 4vw, 3rem)',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            cursor: 'default',
                            transition: 'background 0.3s ease',
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                        }}>
                            <Icon size={18} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
                        </div>
                        <h3 style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 300,
                            fontSize: '1.05rem',
                            color: '#ffffff',
                            margin: '0 0 0.75rem 0',
                            letterSpacing: '-0.01em',
                        }}>
                            {title}
                        </h3>
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 300,
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.4)',
                            margin: 0,
                            lineHeight: 1.7,
                        }}>
                            {desc}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Stats strip */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'clamp(2rem, 6vw, 6rem)',
                    marginTop: 'clamp(4rem, 8vw, 8rem)',
                    flexWrap: 'wrap',
                }}
            >
                {[
                    { value: '10K+', label: 'Salons Worldwide' },
                    { value: '98%', label: 'Client Retention' },
                    { value: '3x', label: 'Revenue Growth' },
                ].map(({ value, label }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 200,
                            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                            color: '#ffffff',
                            letterSpacing: '-0.03em',
                        }}>
                            {value}
                        </div>
                        <div style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 300,
                            fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.35)',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            marginTop: '0.5rem',
                        }}>
                            {label}
                        </div>
                    </div>
                ))}
            </motion.div>
        </section>
    );
}
