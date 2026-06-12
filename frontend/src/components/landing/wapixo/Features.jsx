import { motion } from 'framer-motion';
import { Calendar, BarChart3, Users, Sparkles, Clock, Shield } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

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

export default function Features({ data, statsData }) {
    const { theme } = useTheme();
    // Merge static icons with dynamic content if data exists
    const defaultIcons = [Calendar, BarChart3, Users, Sparkles, Clock, Shield];

    const displayFeatures = data && data.length > 0
        ? data.map((item, i) => ({
            icon: defaultIcons[i % defaultIcons.length],
            title: item.title,
            desc: item.desc
        }))
        : features;

    const statsToDisplay = statsData ? [
        { value: statsData.stat1_value || '10K+', label: statsData.stat1_label || 'Salons Worldwide' },
        { value: statsData.stat2_value || '98%', label: statsData.stat2_label || 'Client Retention' },
        { value: statsData.stat3_value || '3x', label: statsData.stat3_label || 'Revenue Growth' },
    ] : [
        { value: '10K+', label: 'Salons Worldwide' },
        { value: '98%', label: 'Client Retention' },
        { value: '3x', label: 'Revenue Growth' },
    ];

    return (
        <section
            id="features"
            style={{
                background: 'var(--wapixo-bg)',
                padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.5rem, 5vw, 5rem)',
            }}
        >
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    color: 'var(--wapixo-primary)',
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    marginBottom: '1.25rem',
                }}>
                    Capabilities
                </p>
                <h2 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 200,
                    fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
                    color: 'var(--wapixo-text)',
                    letterSpacing: '-0.035em',
                    lineHeight: 1.05,
                    margin: '0 0 1.25rem 0',
                }}>
                    Precision Tools for<br />the Modern Artist.
                </h2>
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 300,
                    fontSize: '1rem',
                    color: 'var(--wapixo-text-muted)',
                    margin: '0 auto 2.25rem auto',
                    maxWidth: '420px',
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
                className="features-grid-container"
                style={{
                    display: 'grid',
                    gap: '1px',
                    maxWidth: '1100px',
                    margin: '0 auto',
                    border: '1px solid var(--wapixo-border)',
                }}
            >
                {displayFeatures.map(({ icon: Icon, title, desc }) => (
                    <motion.div
                        key={title}
                        variants={itemVariants}
                        style={{
                            padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                            background: 'var(--wapixo-bg)',
                            border: '1px solid var(--wapixo-border)',
                            cursor: 'default',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            zIndex: 1
                        }}
                        onMouseEnter={(e) => {
                            if (window.innerWidth >= 768) {
                                e.currentTarget.style.zIndex = '10';
                                e.currentTarget.style.background = 'var(--wapixo-bg-alt)';
                                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 15px 40px rgba(0, 0, 0, 0.1), 0 0 15px rgba(180, 145, 43, 0.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.zIndex = '1';
                            e.currentTarget.style.background = 'var(--wapixo-bg)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '1px solid var(--wapixo-border)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                        }}>
                            <Icon size={18} color="var(--wapixo-primary)" strokeWidth={1.5} />
                        </div>
                        <h3 style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 500,
                            fontSize: '1.05rem',
                            color: 'var(--wapixo-text)',
                            margin: '0 0 0.75rem 0',
                            letterSpacing: '-0.01em',
                        }}>
                            {title}
                        </h3>
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 400,
                            fontSize: '0.85rem',
                            color: 'var(--wapixo-text-muted)',
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
                    marginTop: 'clamp(3rem, 5vw, 5rem)',
                    flexWrap: 'wrap',
                }}
            >
                {statsToDisplay.map(({ value, label }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 200,
                            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                            color: 'var(--wapixo-primary)',
                            letterSpacing: '-0.03em',
                        }}>
                            {value}
                        </div>
                        <div style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 400,
                            fontSize: '0.75rem',
                            color: 'var(--wapixo-text-muted)',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            marginTop: '0.5rem',
                        }}>
                            {label}
                        </div>
                    </div>
                ))}
            </motion.div>

            <style>{`
                .features-grid-container {
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                }
                @media (max-width: 768px) {
                    .features-grid-container {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .features-grid-container > div {
                        padding: 1.25rem 1rem !important;
                    }
                    .features-grid-container h3 {
                        font-size: 0.95rem !important;
                    }
                    .features-grid-container p {
                        font-size: 0.75rem !important;
                    }
                }
                @media (max-width: 480px) {
                    .features-grid-container {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .features-grid-container > div {
                        padding: 1rem 0.6rem !important;
                    }
                    .features-grid-container h3 {
                        font-size: 0.82rem !important;
                        margin-bottom: 0.5rem !important;
                    }
                    .features-grid-container p {
                        font-size: 0.68rem !important;
                        line-height: 1.5 !important;
                    }
                }
            `}</style>
        </section>
    );
}
