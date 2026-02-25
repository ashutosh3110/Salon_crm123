import { motion } from 'framer-motion';
import { useEffect } from 'react';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';

const LegalLayout = ({ title, children }) => {
    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#050505';
        return () => {
            document.body.style.backgroundColor = originalBg;
        };
    }, []);

    return (
        <div className="new-dark-theme" style={{ background: 'radial-gradient(circle at 50% 0%, #111111 0%, #050505 70%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
            <WapixoNavbar />

            {/* Elegant Cinematic Header */}
            <div style={{ paddingTop: 'clamp(80px, 12vw, 100px)', paddingBottom: 'clamp(40px, 8vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 10, padding: '0 1rem' }}
                >
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '1.5rem', display: 'block' }}>
                        Salon Ecosystem
                    </p>
                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
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
                    style={{ background: 'rgba(255,255,255,0.02)', padding: 'clamp(2rem, 5vw, 5rem)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}
                >
                    <div style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '1.1rem', fontWeight: 300 }} className="legal-content-wapixo">
                        {children}
                    </div>

                    <style>{`
                        .legal-content-wapixo h2 {
                            color: #ffffff;
                            font-weight: 200;
                            font-size: 1.5rem;
                            margin-top: 3rem;
                            margin-bottom: 1.25rem;
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
                            color: rgba(255,255,255,0.3);
                        }
                    `}</style>

                    <div style={{ marginTop: '5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                        <p style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                            Last Updated: February 21, 2026
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* Bottom Dark Section */}
            <div style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 0', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>Partnership & Growth.</h2>
            </div>

            <WapixoFooter />
        </div>
    );
};

export default function TermsOfService() {
    return (
        <LegalLayout title="Terms of Service">
            <section>
                <h2>1. Agreement to Terms</h2>
                <p>
                    By accessing or using Salon CRM, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
            </section>

            <section>
                <h2>2. Use License</h2>
                <p>
                    Permission is granted to temporarily use the materials on the Salon CRM platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials.
                </p>
            </section>

            <section>
                <h2>3. User Obligations</h2>
                <p>
                    Users must provide accurate, current, and complete information during the registration process and keep their account information updated. Users are responsible for maintaining the confidentiality of their account and password.
                </p>
            </section>

            <section>
                <h2>4. Limitations</h2>
                <p>
                    In no event shall Salon CRM or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our platform.
                </p>
            </section>
        </LegalLayout>
    );
}

