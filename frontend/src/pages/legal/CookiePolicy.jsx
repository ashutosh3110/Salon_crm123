import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';
import { useTheme } from '../../contexts/ThemeContext';

export default function CookiePolicy() {
    const [cmsData, setCmsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const response = await api.get('/cms');
                if (response.data && response.data.legal_cookies) {
                    setCmsData(response.data.legal_cookies);
                }
            } catch (error) {
                console.error('Error fetching CMS:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCMS();
    }, []);

    const title = cmsData?.title || "Cookie Policy";
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
                        <h2>1. What are Cookies?</h2>
                        <p>
                            Cookies are small text files that are stored on your computer or mobile device when you visit a website.
                            They are widely used to make websites work more efficiently and provide information to the owners of the site.
                        </p>
                    </section>

                    <section>
                        <h2>2. How We Use Cookies</h2>
                        <p>
                            We use cookies to enhance your experience on our website, remember your login details, and gather analytics that help us improve our services.
                        </p>
                    </section>

                    <section>
                        <h2>3. Types of Cookies</h2>
                        <ul>
                            <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
                            <li><strong>Analytical Cookies:</strong> Help us understand how visitors interact with our website.</li>
                            <li><strong>Functional Cookies:</strong> Remember your preferences and settings.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Managing Cookies</h2>
                        <p>
                            Most web browsers allow you to control cookies through their settings. However, disabling certain cookies may impact your user experience.
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
                        Privacy Protocol
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
                        .legal-content-wapixo strong {
                            color: var(--wapixo-text);
                            font-weight: 600;
                        }
                    `}</style>
                </motion.div>
            </main>

            {/* Bottom Section */}
            <div style={{ background: 'var(--wapixo-bg)', borderTop: '1px solid var(--wapixo-border)', padding: '80px 0', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 300, color: 'var(--wapixo-text)', letterSpacing: '-0.02em', margin: 0 }}>Optimized Browsing.</h2>
            </div>

            <WapixoFooter />
        </div>
    );
};
