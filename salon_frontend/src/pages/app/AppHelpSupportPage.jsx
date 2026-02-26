import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
                    style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '8px' }}
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
                <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Frequently Asked Questions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {FAQ_ITEMS.map((item, i) => (
                        <motion.div
                            key={i}
                            whileTap={{ scale: 0.99 }}
                            style={{
                                background: colors.card,
                                padding: '16px',
                                borderRadius: '16px',
                                border: `1px solid ${colors.border}`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{item.question}</p>
                                <ChevronRight size={18} color={colors.textMuted} />
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
}
