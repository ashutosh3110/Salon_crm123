import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';
import { useTheme } from '../../contexts/ThemeContext';

export default function PrivacyPolicy() {
    const [cmsData, setCmsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const response = await api.get('/cms');
                if (response.data && response.data.legal_privacy) {
                    setCmsData(response.data.legal_privacy);
                }
            } catch (error) {
                console.error('Error fetching CMS:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCMS();
    }, []);

    const title = cmsData?.title || "Privacy Policy";
    const lastUpdated = cmsData?.last_updated || "February 21, 2026";
    const content = cmsData?.content;

    return (
        <LegalLayout title={title}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#B85C5C]"></div>
                </div>
            ) : content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
                <>
                    <section>
                        <h2>1. Introduction</h2>
                        <p>
                            Welcome to the Salon CRM platform. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and safeguard your data.
                        </p>
                    </section>

                    <section>
                        <h2>2. Information Collection</h2>
                        <p>
                            We collect various types of information to provide and improve our services to you:
                        </p>
                        <ul>
                            <li>Personal identification information (Name, email address, phone number).</li>
                            <li>Payment information and transaction history for salon services.</li>
                            <li>Usage data and technical device information when you access our platform.</li>
                            <li>Professional salon-related data provided by business owners.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. How We Use Your Data</h2>
                        <p>
                            Your data is used to facilitate bookings, process transactions, and communicate with you about your appointments. We also use aggregated, non-identifiable data to analyze platform performance and improve our features.
                        </p>
                    </section>

                    <section>
                        <h2>4. Data Security</h2>
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.
                        </p>
                    </section>
                </>
            )}
            <div style={{ marginTop: '5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--wapixo-border)', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', fontWeight: 500, color: 'var(--wapixo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    Last Updated: {lastUpdated}
                </p>
            </div>
        </LegalLayout>
    );
}

const LegalLayout = ({ title, children }) => {
    const { theme } = useTheme();
    
    useEffect(() => {
        document.body.style.backgroundColor = 'var(--wapixo-bg)';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    return (
        <div className="new-theme" style={{ background: 'var(--wapixo-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", color: 'var(--wapixo-text)' }}>
            <WapixoNavbar />

            {/* Elegant Header */}
            <div style={{ paddingTop: 'clamp(100px, 15vw, 140px)', paddingBottom: 'clamp(40px, 8vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: theme === 'dark' ? 0.1 : 0.05, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '400px', height: '400px', background: 'var(--wapixo-text)', borderRadius: '50%', filter: 'blur(120px)' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '20%', width: '500px', height: '500px', background: 'var(--wapixo-text)', borderRadius: '50%', filter: 'blur(140px)' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 10, padding: '0 1rem' }}
                >
                    <p style={{ color: 'var(--wapixo-text-muted)', fontSize: '0.65rem', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '1.5rem', display: 'block' }}>
                        Security Protocol
                    </p>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 300, color: 'var(--wapixo-text)', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
                        {title}.
                    </h1>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 1.5rem) 60px', width: '100%' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{ background: 'var(--wapixo-bg-alt)', padding: 'clamp(2rem, 5vw, 5rem)', border: '1px solid var(--wapixo-border)', borderRadius: '8px' }}
                >
                    <div style={{ color: 'var(--wapixo-text-muted)', lineHeight: 1.8, fontSize: '1.05rem', fontWeight: 400 }} className="legal-content-wapixo">
                        {children}
                    </div>

                    <style>{`
                        .legal-content-wapixo h2 {
                            color: var(--wapixo-text);
                            font-weight: 300;
                            font-size: 1.75rem;
                            margin-top: 3.5rem;
                            margin-bottom: 1.5rem;
                            letter-spacing: -0.01em;
                        }
                        .legal-content-wapixo p {
                            margin-bottom: 1.5rem;
                        }
                        .legal-content-wapixo ul {
                            list-style-type: none;
                            padding-left: 0;
                            margin-bottom: 1.5rem;
                        }
                        .legal-content-wapixo li {
                            margin-bottom: 0.75rem;
                            display: flex;
                            align-items: flex-start;
                            gap: 0.75rem;
                        }
                        .legal-content-wapixo li::before {
                            content: "—";
                            color: var(--wapixo-text-muted);
                            opacity: 0.3;
                        }
                    `}</style>
                </motion.div>
            </main>

            {/* Bottom Section */}
            <div style={{ background: 'var(--wapixo-bg)', borderTop: '1px solid var(--wapixo-border)', padding: '80px 0', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 300, color: 'var(--wapixo-text)', letterSpacing: '-0.02em', margin: 0 }}>Secure & Trusted.</h2>
            </div>

            <WapixoFooter />
        </div>
    );
};
