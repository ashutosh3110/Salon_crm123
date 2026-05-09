import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, FileText, Scale, Info, CheckCircle2 } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const TERMS_SECTIONS = [
    {
        title: "1. Agreement to Terms",
        content: "By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
    },
    {
        title: "2. Use of Services",
        content: "You may use our services only for lawful purposes and in accordance with these Terms. You agree not to use our services in any way that violates any applicable local or international law or regulation."
    },
    {
        title: "3. User Accounts",
        content: "To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account."
    },
    {
        title: "4. Bookings and Payments",
        content: "All bookings made through our platform are subject to availability. Prices for services are subject to change without notice. Payments must be made through our authorized payment methods."
    },
    {
        title: "5. Intellectual Property",
        content: "The services and their original content, features, and functionality are and will remain the exclusive property of our platform and its licensors."
    }
];

export default function AppTermsPage() {
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
                    style={{ background: 'none', border: 'none', padding: 0 }}
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <h1 style={{ fontSize: '18px', fontWeight: 800 }}>Terms of Service</h1>
            </div>

            <div style={{ padding: '24px 16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>Legal Framework</h2>
                    <p style={{ fontSize: '13px', color: colors.textMuted, maxWidth: '280px', margin: '0 auto' }}>
                        Last Updated: February 21, 2026. Please read these terms carefully before using our platform.
                    </p>
                </div>

                {/* Features Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
                    {[
                        { icon: <Scale size={16} />, label: "Fair Use" },
                        { icon: <ShieldCheck size={16} />, label: "Protected" },
                        { icon: <CheckCircle2 size={16} />, label: "Compliance" }
                    ].map((f, i) => (
                        <div key={i} style={{ background: colors.card, padding: '12px', borderRadius: '16px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
                            <div style={{ color: colors.accent, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{f.icon}</div>
                            <span style={{ fontSize: '10px', fontWeight: 700 }}>{f.label}</span>
                        </div>
                    ))}
                </div>

                {/* Content Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {TERMS_SECTIONS.map((section, i) => (
                        <div key={i}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px', color: colors.accent }}>{section.title}</h3>
                            <p style={{ fontSize: '14px', lineHeight: '1.6', color: colors.textMuted, margin: 0 }}>
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>
                
                <div style={{ marginTop: '40px', padding: '20px', borderRadius: '20px', background: colors.card, border: `1px solid ${colors.border}`, textAlign: 'center' }}>
                    <Info size={24} style={{ color: colors.accent, marginBottom: '12px' }} />
                    <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>
                        If you have any questions regarding these terms, please contact our support team.
                    </p>
                </div>

            </div>
        </div>
    );
}
