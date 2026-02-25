import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
    {
        name: 'Free',
        price: '₹0',
        period: 'forever',
        desc: 'Perfect to get started with a single salon.',
        features: [
            '2 Staff Members',
            '10 Products',
            '5 Services',
            '1 Outlet',
            'Basic Booking',
            'POS Billing',
        ],
        cta: 'Get Started',
        popular: false,
    },
    {
        name: 'Basic',
        price: '₹1,499',
        period: '/mo',
        desc: 'For growing salons that need more power.',
        features: [
            '10 Staff Members',
            '100 Products',
            '50 Services',
            '2 Outlets',
            'Analytics Dashboard',
            'Loyalty Program',
            'Promotions',
            'Email Support',
        ],
        cta: 'Start Free Trial',
        popular: false,
    },
    {
        name: 'Premium',
        price: '₹3,999',
        period: '/mo',
        desc: 'The most popular choice for established salons.',
        features: [
            '50 Staff Members',
            '1,000 Products',
            '500 Services',
            '10 Outlets',
            'Advanced Analytics',
            'HR & Payroll',
            'WhatsApp Campaigns',
            'Priority Support',
        ],
        cta: 'Start Free Trial',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        desc: 'For salon chains with unlimited needs.',
        features: [
            'Unlimited Staff',
            'Unlimited Products',
            'Unlimited Services',
            'Unlimited Outlets',
            'Dedicated Manager',
            'API Access',
            'SLA Guarantee',
            'Custom Branding',
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

export default function WapixoPricing() {
    return (
        <section id="pricing" style={{ background: '#050505', padding: '100px 1.5rem', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '60%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '1rem' }}
                    >
                        Investment
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}
                    >
                        Simple. Transparent. Precision.
                    </motion.h2>
                </div>

                {/* Plans Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', alignItems: 'stretch' }}>
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            style={{
                                background: plan.popular ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                border: plan.popular ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '4px',
                                padding: '2rem 1.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = plan.popular ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)';
                                e.currentTarget.style.borderColor = plan.popular ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)';
                            }}
                        >
                            {plan.popular && (
                                <div style={{ position: 'absolute', top: '1.5rem', right: '2rem' }}>
                                    <span style={{ color: '#ffffff', fontSize: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.5 }}>
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 300, color: '#ffffff', marginBottom: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    {plan.name}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '2.2rem', fontWeight: 200, color: '#ffffff' }}>{plan.price}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>{plan.period}</span>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.6, marginTop: '0.75rem' }}>
                                    {plan.desc}
                                </p>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1 }}>
                                {plan.features.map((feature) => (
                                    <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>
                                        <Check size={13} style={{ opacity: 0.4 }} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link to="/register" style={{ textDecoration: 'none' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02, background: plan.popular ? '#ffffff' : 'rgba(255,255,255,0.1)' }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '100px',
                                        border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                        background: plan.popular ? '#ffffff' : 'transparent',
                                        color: plan.popular ? '#050505' : '#ffffff',
                                        fontSize: '0.8rem',
                                        fontWeight: plan.popular ? 500 : 400,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {plan.cta}
                                </motion.button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
