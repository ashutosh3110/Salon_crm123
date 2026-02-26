import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Bell, UserCheck, Smartphone } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const POLICY_SECTIONS = [
    {
        title: "Information We Collect",
        content: "We collect information you provide directly to us, such as when you create or modify your account, book services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, and payment method."
    },
    {
        title: "How We Use Information",
        content: "We use the information we collect to: provide, maintain, and improve our services, including to facilitate bookings and send related information; process payments; send you communications we think will be of interest to you; and monitor and analyze trends and usage."
    },
    {
        title: "Sharing of Information",
        content: "We may share information about you as following: with your consent; with salon partners to facilitate your bookings; with third-party vendors, consultants and other service providers who need access to such information to carry out work on our behalf."
    },
    {
        title: "Data Security",
        content: "We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction."
    }
];

export default function AppPrivacyPolicyPage() {
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


            <div style={{ padding: '24px 16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>

                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>Your Data is Secure</h2>
                    <p style={{ fontSize: '13px', color: colors.textMuted, maxWidth: '280px', margin: '0 auto' }}>
                        Last Updated: February 26, 2026. Please read our policy carefully.
                    </p>
                </div>

                {/* Features Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
                    {[
                        { icon: <Lock size={16} />, label: "Encrypted" },
                        { icon: <Eye size={16} />, label: "Private" },
                        { icon: <UserCheck size={16} />, label: "Your Choice" }
                    ].map((f, i) => (
                        <div key={i} style={{ background: colors.card, padding: '12px', borderRadius: '16px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
                            <div style={{ color: colors.accent, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{f.icon}</div>
                            <span style={{ fontSize: '10px', fontWeight: 700 }}>{f.label}</span>
                        </div>
                    ))}
                </div>

                {/* Content Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {POLICY_SECTIONS.map((section, i) => (
                        <div key={i}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px', color: colors.accent }}>{section.title}</h3>
                            <p style={{ fontSize: '14px', lineHeight: '1.6', color: colors.textMuted, margin: 0 }}>
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
