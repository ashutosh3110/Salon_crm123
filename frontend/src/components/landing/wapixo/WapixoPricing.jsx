import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Users, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';

export default function WapixoPricing() {
    const { theme } = useTheme();
    const [fetchedPlans, setFetchedPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly');

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const res = await api.get('/plans?isActive=true');
                if (res.data.success) {
                    const data = res.data.data;
                    const list = Array.isArray(data) ? data : (data.results || []);
                    // Normalize price: DB stores price in `price` field; monthlyPrice may be 0
                    const normalized = list.map(p => ({
                        ...p,
                        // Use monthlyPrice if set, else fall back to price
                        displayMonthly: p.monthlyPrice > 0 ? p.monthlyPrice : (p.price || 0),
                        displayYearly: p.yearlyPrice || 0,
                        // Parse description lines into feature bullets
                        featureLines: p.description
                            ? p.description.split('\n').map(l => l.trim()).filter(Boolean)
                            : [],
                    }));
                    // Sort by displayMonthly ascending (free first)
                    normalized.sort((a, b) => a.displayMonthly - b.displayMonthly);
                    setFetchedPlans(normalized);
                }
            } catch (err) {
                console.error('Error fetching plans:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, []);

    const featureLabels = {
        pos: 'POS & Billing',
        appointments: 'Bookings & Calendar',
        inventory: 'Inventory Management',
        marketing: 'Marketing Hub',
        payroll: 'HR & Payroll',
        crm: 'Customer CRM',
        mobileApp: 'Mobile App',
        reports: 'Advanced Analytics',
        whatsapp: 'WhatsApp Automation',
        loyalty: 'Loyalty Program',
        finance: 'Finance & Expense',
        feedback: 'Digital Feedback',
    };

    const getDisplayPrice = (plan) => {
        if (billingCycle === 'yearly' && plan.displayYearly > 0) {
            return plan.displayYearly;
        }
        return plan.displayMonthly;
    };

    const hasYearlyOption = fetchedPlans.some(p => p.displayYearly > 0);

    return (
        <section
            id="pricing"
            style={{
                background: 'var(--wapixo-bg)',
                padding: '80px 1.5rem 100px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Inter', sans-serif",
            }}
        >
            {/* Background Glow */}
            <div
                style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(200,149,108,0.04) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: hasYearlyOption ? '32px' : '48px' }}>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            color: 'var(--wapixo-primary)',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.4em',
                            marginBottom: '1rem',
                        }}
                    >
                        Investment
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 200,
                            color: 'var(--wapixo-text)',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                            margin: 0,
                        }}
                    >
                        Simple. Transparent. Precision.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        style={{
                            marginTop: '1rem',
                            color: 'var(--wapixo-text-muted)',
                            fontSize: '0.95rem',
                            fontWeight: 300,
                            maxWidth: '480px',
                            margin: '1rem auto 0',
                        }}
                    >
                        Choose the plan that fits your salon. Upgrade anytime, cancel anytime.
                    </motion.p>
                </div>

                {/* Billing Toggle — only if yearly plans exist */}
                {hasYearlyOption && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            marginBottom: '48px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '0.8rem',
                                color: billingCycle === 'monthly' ? 'var(--wapixo-text)' : 'var(--wapixo-text-muted)',
                                fontWeight: billingCycle === 'monthly' ? 500 : 300,
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                            }}
                            onClick={() => setBillingCycle('monthly')}
                        >
                            Monthly
                        </span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            style={{
                                width: '44px',
                                height: '24px',
                                borderRadius: '12px',
                                background: billingCycle === 'yearly' ? 'var(--wapixo-primary)' : 'var(--wapixo-border)',
                                border: 'none',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background 0.3s',
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: billingCycle === 'yearly' ? '23px' : '3px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: '#fff',
                                    transition: 'left 0.3s',
                                }}
                            />
                        </button>
                        <span
                            style={{
                                fontSize: '0.8rem',
                                color: billingCycle === 'yearly' ? 'var(--wapixo-text)' : 'var(--wapixo-text-muted)',
                                fontWeight: billingCycle === 'yearly' ? 500 : 300,
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                            onClick={() => setBillingCycle('yearly')}
                        >
                            Yearly
                            <span
                                style={{
                                    background: 'var(--wapixo-primary)',
                                    color: '#fff',
                                    fontSize: '0.55rem',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Save
                            </span>
                        </span>
                    </motion.div>
                )}

                {/* Loading Skeleton */}
                {loading && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '1.2rem',
                        }}
                    >
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                style={{
                                    background: 'var(--wapixo-bg-alt)',
                                    border: '1px solid var(--wapixo-border)',
                                    borderRadius: '12px',
                                    padding: '1.5rem 1.25rem',
                                    height: '380px',
                                    opacity: 0.4,
                                    animation: 'pulse 2s ease-in-out infinite',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* No Plans */}
                {!loading && fetchedPlans.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '60px',
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: '0.95rem',
                            fontWeight: 300,
                        }}
                    >
                        Pricing plans coming soon. Please check back later.
                    </div>
                )}

                {/* Plans Grid */}
                {!loading && fetchedPlans.length > 0 && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '1.2rem',
                            alignItems: 'stretch',
                        }}
                    >
                        {fetchedPlans.map((plan, idx) => {
                            const displayPrice = getDisplayPrice(plan);
                            const isFree = displayPrice === 0;
                            const isPopular = plan.popular;

                            return (
                                <motion.div
                                    key={plan._id || plan.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.7 }}
                                    style={{
                                        '--spotlight-x': '50%',
                                        '--spotlight-y': '0%',
                                        '--spotlight-opacity': 0,
                                        background:
                                            (theme === 'dark'
                                                ? `radial-gradient(circle at var(--spotlight-x) var(--spotlight-y), rgba(255,255,255,var(--spotlight-opacity)), transparent 65%), `
                                                : '') +
                                            (isPopular ? 'var(--wapixo-bg-alt)' : 'var(--wapixo-bg)'),
                                        border: isPopular
                                            ? '1.5px solid var(--wapixo-primary)'
                                            : '1px solid var(--wapixo-border)',
                                        borderRadius: '16px',
                                        padding: '1.75rem 1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: isPopular
                                            ? '0 20px 60px rgba(200,149,108,0.12)'
                                            : 'none',
                                    }}
                                    onMouseMove={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
                                        e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.setProperty('--spotlight-opacity', '0.18');
                                        if (!isPopular) e.currentTarget.style.borderColor = 'rgba(200,149,108,0.4)';
                                        e.currentTarget.style.boxShadow = theme === 'dark'
                                            ? '0 24px 60px rgba(0,0,0,0.5)'
                                            : '0 24px 60px rgba(0,0,0,0.08)';
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.setProperty('--spotlight-opacity', '0');
                                        e.currentTarget.style.borderColor = isPopular
                                            ? 'var(--wapixo-primary)'
                                            : 'var(--wapixo-border)';
                                        e.currentTarget.style.boxShadow = isPopular
                                            ? '0 20px 60px rgba(200,149,108,0.12)'
                                            : 'none';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {/* Popular Badge */}
                                    {isPopular && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '1.25rem',
                                                right: '1.25rem',
                                                background: 'var(--wapixo-primary)',
                                                color: '#fff',
                                                fontSize: '0.55rem',
                                                fontWeight: 700,
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                            }}
                                        >
                                            Most Popular
                                        </div>
                                    )}

                                    {/* Plan Name */}
                                    <h3
                                        style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: isPopular ? 'var(--wapixo-primary)' : 'var(--wapixo-text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.15em',
                                            marginBottom: '0.75rem',
                                        }}
                                    >
                                        {plan.name}
                                    </h3>

                                    {/* Price */}
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                        {isFree ? (
                                            <span
                                                style={{
                                                    fontSize: '2.4rem',
                                                    fontWeight: 200,
                                                    color: 'var(--wapixo-text)',
                                                    lineHeight: 1,
                                                }}
                                            >
                                                Free
                                            </span>
                                        ) : (
                                            <>
                                                <span style={{ fontSize: '1rem', fontWeight: 300, color: 'var(--wapixo-text-muted)', alignSelf: 'flex-start', marginTop: '6px' }}>
                                                    ₹
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '2.8rem',
                                                        fontWeight: 200,
                                                        color: 'var(--wapixo-text)',
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {displayPrice.toLocaleString('en-IN')}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        color: 'var(--wapixo-text-muted)',
                                                        fontWeight: 300,
                                                    }}
                                                >
                                                    /{billingCycle === 'yearly' && plan.displayYearly > 0 ? 'yr' : 'mo'}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Yearly savings note */}
                                    {billingCycle === 'yearly' && plan.displayYearly > 0 && plan.displayMonthly > 0 && (
                                        <p style={{ fontSize: '0.72rem', color: 'var(--wapixo-primary)', fontWeight: 400, marginBottom: '0.5rem' }}>
                                            Save ₹{((plan.displayMonthly * 12) - plan.displayYearly).toLocaleString('en-IN')} vs monthly
                                        </p>
                                    )}



                                    {/* Limits */}
                                    {plan.limits && (plan.limits.staffLimit > 0 || plan.limits.outletLimit > 0) && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                marginBottom: '1.25rem',
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '8px',
                                                border: '1px solid var(--wapixo-border)',
                                            }}
                                        >
                                            {plan.limits.staffLimit > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Users size={12} color="var(--wapixo-primary)" />
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--wapixo-text-muted)', fontWeight: 400 }}>
                                                        {plan.limits.staffLimit} Staff
                                                    </span>
                                                </div>
                                            )}
                                            {plan.limits.outletLimit > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Building2 size={12} color="var(--wapixo-primary)" />
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--wapixo-text-muted)', fontWeight: 400 }}>
                                                        {plan.limits.outletLimit} Outlet{plan.limits.outletLimit > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Features from description lines */}
                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', flex: 1 }}>
                                        {plan.featureLines && plan.featureLines.length > 0
                                            ? plan.featureLines.map((line, i) => (
                                                <li
                                                    key={i}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '0.6rem',
                                                        marginBottom: '0.45rem',
                                                        fontSize: '0.78rem',
                                                        color: 'var(--wapixo-text-muted)',
                                                        fontWeight: 400,
                                                        lineHeight: 1.4,
                                                    }}
                                                >
                                                    <Check size={12} color="var(--wapixo-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                                    {/* Strip leading emoji/bullet chars */}
                                                    {line.replace(/^[\p{Emoji}✓•\-\*?]+\s*/u, '')}
                                                </li>
                                            ))
                                            : plan.features && typeof plan.features === 'object'
                                            ? Object.entries(plan.features)
                                                .filter(([, v]) => v === true)
                                                .map(([key]) => (
                                                    <li
                                                        key={key}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.6rem',
                                                            marginBottom: '0.45rem',
                                                            fontSize: '0.78rem',
                                                            color: 'var(--wapixo-text-muted)',
                                                            fontWeight: 400,
                                                        }}
                                                    >
                                                        <Check size={12} color="var(--wapixo-primary)" />
                                                        {featureLabels[key] || key}
                                                    </li>
                                                ))
                                            : null}
                                    </ul>

                                    {/* CTA Button */}
                                    <Link
                                        to="/register"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '0.75rem 1.25rem',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            textDecoration: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.25s ease',
                                            background: isPopular
                                                ? 'var(--wapixo-primary)'
                                                : 'transparent',
                                            color: isPopular ? '#fff' : 'var(--wapixo-text)',
                                            border: isPopular
                                                ? '1.5px solid var(--wapixo-primary)'
                                                : '1px solid var(--wapixo-border)',
                                            letterSpacing: '0.02em',
                                        }}
                                        onMouseEnter={e => {
                                            if (!isPopular) {
                                                e.currentTarget.style.background = 'var(--wapixo-primary)';
                                                e.currentTarget.style.color = '#fff';
                                                e.currentTarget.style.borderColor = 'var(--wapixo-primary)';
                                            } else {
                                                e.currentTarget.style.opacity = '0.88';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isPopular) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'var(--wapixo-text)';
                                                e.currentTarget.style.borderColor = 'var(--wapixo-border)';
                                            } else {
                                                e.currentTarget.style.opacity = '1';
                                            }
                                        }}
                                    >
                                        {isFree ? (
                                            <>Start Free</>
                                        ) : (
                                            <>
                                                <Zap size={13} />
                                                Get Started
                                            </>
                                        )}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Bottom Note */}
                {!loading && fetchedPlans.length > 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        style={{
                            textAlign: 'center',
                            marginTop: '2.5rem',
                            fontSize: '0.78rem',
                            color: 'var(--wapixo-text-muted)',
                            fontWeight: 300,
                        }}
                    >
                        All plans include 14-day free trial · No credit card required · Cancel anytime
                    </motion.p>
                )}
            </div>
        </section>
    );
}
