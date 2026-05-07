import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';

export default function WapixoPricing() {
    const { theme } = useTheme();
    const [fetchedPlans, setFetchedPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const res = await api.get('/plans?isActive=true');
                if (res.data.success) {
                    const data = res.data.data;
                    const list = Array.isArray(data) ? data : (data.results || []);
                    // Sort plans by price
                    const sorted = list.sort((a, b) => (a.price || a.monthlyPrice || 0) - (b.price || b.monthlyPrice || 0));
                    
                    // Map to standardize fields if needed
                    const normalized = sorted.map(p => ({
                        ...p,
                        monthlyPrice: p.monthlyPrice || p.price || 0
                    }));
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

    // If still loading, showing nothing or keeping loading state
    if (loading) return null;

    const hasPlans = fetchedPlans.length > 0;

    const featureLabels = {
        pos: 'POS Billing',
        appointments: 'Appointments',
        inventory: 'Inventory',
        marketing: 'Marketing',
        payroll: 'Payroll',
        crm: 'Customer CRM',
        mobileApp: 'Mobile App',
        reports: 'Reports',
        whatsapp: 'WhatsApp',
        loyalty: 'Loyalty',
        finance: 'Finance',
        feedback: 'Feedback'
    };
    return (
        <section id="pricing" style={{ background: 'var(--wapixo-bg)', padding: '60px 1.5rem 80px', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '60%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ color: 'var(--wapixo-primary)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '1rem' }}
                    >
                        Investment
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 200, color: 'var(--wapixo-text)', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}
                    >
                        Simple. Transparent. Precision.
                    </motion.h2>
                </div>

                {/* Plans Grid */}
                {!hasPlans ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: 300 }}>
                        No active subscription plans found. Please check back later.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', alignItems: 'stretch' }}>
                        {fetchedPlans.map((plan, idx) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.8 }}
                                style={{
                                    '--spotlight-x': '50%',
                                    '--spotlight-y': '0%',
                                    '--spotlight-opacity': 0,
                                    background:
                                        (theme === 'dark' ? `radial-gradient(circle at var(--spotlight-x) var(--spotlight-y), rgba(255,255,255,var(--spotlight-opacity)), transparent 65%), ` : '') +
                                        (plan.popular ? 'var(--wapixo-bg-alt)' : 'var(--wapixo-bg)'),
                                    border: plan.popular ? '2px solid var(--wapixo-primary)' : '1px solid var(--wapixo-border)',
                                    borderRadius: '12px',
                                    padding: '1.5rem 1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: plan.popular ? '0 20px 40px rgba(180, 145, 43, 0.1)' : '0 0 0 rgba(0,0,0,0)',
                                }}
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                e.currentTarget.style.setProperty('--spotlight-x', `${x}px`);
                                e.currentTarget.style.setProperty('--spotlight-y', `${y}px`);
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.setProperty('--spotlight-opacity', '0.22');
                                e.currentTarget.style.borderColor = 'var(--wapixo-text-muted)';
                                e.currentTarget.style.boxShadow = theme === 'dark' ? '0 18px 45px rgba(0,0,0,0.7)' : '0 18px 45px rgba(0,0,0,0.05)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.setProperty('--spotlight-opacity', '0');
                                e.currentTarget.style.borderColor = 'var(--wapixo-border)';
                                e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {plan.popular && (
                                <div style={{ position: 'absolute', top: '1.5rem', right: '2rem' }}>
                                    <span style={{ color: 'var(--wapixo-text)', fontSize: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.5 }}>
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div style={{ marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--wapixo-text)', marginBottom: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                     {plan.name}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '2.2rem', fontWeight: 200, color: 'var(--wapixo-text)' }}>
                                        {plan.monthlyPrice === 0 ? 'Free' : `₹${plan.monthlyPrice}`}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--wapixo-text-muted)', fontWeight: 300 }}>
                                        {plan.monthlyPrice === 0 ? 'forever' : '/mo'}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--wapixo-text-muted)', fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.6, marginTop: '0.75rem' }}>
                                    {plan.description || `Perfect for ${plan.name.toLowerCase()} salons.`}
                                </p>
                            </div>
                             <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', flex: 1 }}>
                                {plan.features && typeof plan.features === 'object' && !Array.isArray(plan.features) ? (
                                     Object.entries(plan.features)
                                         .filter(([_, value]) => value === true)
                                         .map(([key, _]) => (
                                             <li key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--wapixo-text-muted)', fontWeight: 400 }}>
                                                 <Check size={11} color="var(--wapixo-primary)" style={{ opacity: 1 }} />
                                                 {featureLabels[key] || key}
                                             </li>
                                         ))
                                 ) : Array.isArray(plan.features) ? (
                                     plan.features.map((feature) => (
                                         <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--wapixo-text-muted)', fontWeight: 400 }}>
                                             <Check size={11} color="var(--wapixo-primary)" style={{ opacity: 1 }} />
                                             {feature}
                                         </li>
                                     ))
                                 ) : null}
 
                                 {/* Show Limits as well */}
                                 {plan.limits && (
                                     <>
                                         <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--wapixo-text-muted)', fontWeight: 400 }}>
                                             <Check size={11} color="var(--wapixo-text)" style={{ opacity: 0.4 }} />
                                             {plan.limits.staffLimit} Staff Members
                                         </li>
                                         <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--wapixo-text-muted)', fontWeight: 400 }}>
                                             <Check size={11} color="var(--wapixo-text)" style={{ opacity: 0.4 }} />
                                             {plan.limits.outletLimit} Outlet{plan.limits.outletLimit > 1 ? 's' : ''}
                                         </li>
                                     </>
                                 )}
                            </ul>


                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    </section>
);
}
