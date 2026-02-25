import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        id: 1,
        question: 'How does the 14-day free trial work?',
        answer: 'You get full access to all SalonCRM features for 14 days. No credit card is required to start. You can upgrade any time during or after the trial.'
    },
    {
        id: 2,
        question: 'Can I manage multiple salon locations?',
        answer: 'Absolutely. SalonCRM is built for scale. Whether you have 2 or 200 outlets, you can manage them all from a single dashboard with location-specific reporting.'
    },
    {
        id: 3,
        question: 'Is my customer data secure?',
        answer: 'Your data is our priority. We use bank-grade AES-256 encryption, regular backups, and complete data isolation per salon to ensure total privacy.'
    },
    {
        id: 4,
        question: 'Can I migrate my data from another software?',
        answer: 'Yes, we provide free dedicated migration support. Our team will help you export, sanitize, and import your existing client and product data safely.'
    },
    {
        id: 5,
        question: 'Does SalonCRM work on mobile devices?',
        answer: 'Yes, SalonCRM is fully responsive and cloud-native. It works seamlessly on iPads, Android tablets, iPhones, and Android smartphones.'
    }
];

const FAQItem = ({ faq, isOpen, toggle }) => {
    return (
        <div style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '1.5rem 0',
            cursor: 'pointer'
        }} onClick={toggle}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <h3 style={{
                    color: isOpen ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    fontSize: '1.1rem',
                    fontWeight: 300,
                    margin: 0,
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.01em'
                }}>
                    {faq.question}
                </h3>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                    <ChevronDown size={20} strokeWidth={1} />
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '0.95rem',
                            lineHeight: 1.7,
                            margin: '1.5rem 0 0.5rem 0',
                            maxWidth: '90%',
                            fontWeight: 300
                        }}>
                            {faq.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function WapixoFAQ() {
    const [openId, setOpenId] = useState(1);

    return (
        <section style={{
            background: '#050505',
            padding: '60px 1.5rem 120px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.45em', marginBottom: '1.5rem' }}
                    >
                        Inquiry
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}
                    >
                        Clarified.
                    </motion.h2>
                </div>

                {/* FAQ List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    {faqs.map((faq) => (
                        <FAQItem
                            key={faq.id}
                            faq={faq}
                            isOpen={openId === faq.id}
                            toggle={() => setOpenId(openId === faq.id ? null : faq.id)}
                        />
                    ))}
                </motion.div>

                {/* CTA Callout */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    style={{
                        marginTop: '100px',
                        textAlign: 'center',
                        padding: '3rem',
                        border: '1px solid rgba(255,255,255,0.05)',
                        background: 'rgba(255,255,255,0.01)',
                        borderRadius: '4px'
                    }}
                >
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 300 }}>
                        Still have questions? Our experts are here to guide you.
                    </p>
                    <button style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '0.75rem 2rem',
                        borderRadius: '100px',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'white';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        }}
                    >
                        Contact Support
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
