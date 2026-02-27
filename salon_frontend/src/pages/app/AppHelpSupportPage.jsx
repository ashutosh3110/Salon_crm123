import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, MessageCircle, Mail, Phone, ExternalLink, ChevronRight, HelpCircle, Search, FileText } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const FAQ_ITEMS = [
    { question: "How do I book an appointment?", answer: "You can book an appointment by selecting a service, choosing your preferred expert, and picking a time slot that works for you." },
    { question: "Can I cancel my booking?", answer: "Yes, you can cancel your booking up to 2 hours before the scheduled time through the 'My Bookings' section." },
    { question: "What are loyalty points?", answer: "Loyalty points are earned with every service and product purchase. You can redeem them for discounts and exclusive offers." },
    { question: "How do I update my profile?", answer: "Go to the 'Profile' section from the navigation bar to update your contact details and preferences." }
];

export default function AppHelpSupportPage() {
    const navigate = useNavigate();
    const [activeFaq, setActiveFaq] = useState(null);
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
        accent: '#C8956C'
    };

    return (
        <div style={{ background: colors.bg, minHeight: '100svh', color: colors.text }}>
            {/* Header */}
            <div style={{
                padding: '20px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'sticky',
                top: 0,
                background: colors.bg,
                zIndex: 10,
                borderBottom: `1px solid ${colors.border}`
            }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', padding: 0 }}
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <h1 style={{ fontSize: '18px', fontWeight: 800 }}>Help & Support</h1>
            </div>

            <div style={{ padding: '24px 16px' }}>
                {/* Search Bar */}
                <div style={{
                    background: colors.card,
                    borderRadius: '16px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: `1px solid ${colors.border}`,
                    marginBottom: '32px'
                }}>
                    <Search size={18} color={colors.textMuted} />
                    <input
                        type="text"
                        placeholder="Search for help..."
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: colors.text, fontSize: '14px', width: '100%' }}
                    />
                </div>



                {/* FAQ Section */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <HelpCircle size={18} color={colors.accent} />
                        <h2 style={{ fontSize: '18px', fontWeight: 900, fontFamily: "'Playfair Display', serif", margin: 0 }}>Frequently Asked Questions</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {FAQ_ITEMS.map((item, i) => {
                            const isOpen = activeFaq === i;
                            return (
                                <motion.div
                                    key={i}
                                    style={{
                                        background: colors.card,
                                        borderRadius: '20px 6px 20px 6px',
                                        border: isOpen ? `1.5px solid ${colors.accent}` : `1px solid ${colors.border}`,
                                        overflow: 'hidden',
                                        transition: 'border 0.3s ease'
                                    }}
                                >
                                    <button
                                        onClick={() => setActiveFaq(isOpen ? null : i)}
                                        style={{
                                            width: '100%',
                                            padding: '16px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            gap: '12px'
                                        }}
                                    >
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            color: isOpen ? colors.accent : colors.text,
                                            lineHeight: 1.4
                                        }}>
                                            {item.question}
                                        </span>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 90 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronRight size={18} color={isOpen ? colors.accent : colors.textMuted} />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            >
                                                <div style={{
                                                    padding: '0 20px 20px',
                                                    fontSize: '13px',
                                                    color: colors.textMuted,
                                                    lineHeight: 1.6,
                                                    borderTop: `1px solid ${colors.border}`,
                                                    paddingTop: '16px',
                                                    margin: '0 20px'
                                                }}>
                                                    {item.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Contact Section */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: colors.textMuted, marginBottom: '16px' }}>Still need help?</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            { icon: MessageCircle, label: 'Chat Support', sub: 'Instant help', color: '#C8956C' },
                            { icon: Mail, label: 'Email Us', sub: '24hr response', color: colors.textMuted }
                        ].map((item, i) => (
                            <motion.button
                                key={i}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    background: colors.card,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '20px 6px 20px 6px',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    gap: '8px'
                                }}
                            >
                                <item.icon size={20} color={item.color} />
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: colors.text }}>{item.label}</p>
                                    <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>{item.sub}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
