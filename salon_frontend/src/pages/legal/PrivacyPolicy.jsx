import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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
                <h2 style={{ fontSize: '1.75rem', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>Secure & Trusted.</h2>
            </div>

            <WapixoFooter />
        </div>
    );
};

export default function PrivacyPolicy() {
    return (
        <LegalLayout title="Privacy Policy">
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
        </LegalLayout>
    );
}

