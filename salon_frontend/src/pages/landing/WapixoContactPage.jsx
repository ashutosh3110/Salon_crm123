import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles, Building2 } from 'lucide-react';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';
import SmoothScroll from '../../components/landing/wapixo/SmoothScroll';

export default function WapixoContactPage() {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        salonName: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#050505';
        return () => {
            document.body.style.backgroundColor = originalBg;
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mocking inquiry storage
        const inquiries = JSON.parse(localStorage.getItem('wapixo_inquiries') || '[]');
        const newInquiry = {
            ...formState,
            id: Date.now(),
            date: new Date().toISOString(),
            status: 'new',
        };
        localStorage.setItem('wapixo_inquiries', JSON.stringify([newInquiry, ...inquiries]));

        // Artificial delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setSubmitted(true);
    };

    const handleChange = (e) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <SmoothScroll>
            <div className="new-dark-theme" style={{ minHeight: '100vh', position: 'relative', fontFamily: "'Inter', sans-serif" }}>
                <WapixoNavbar />

                {/* Hero / Header Section */}
                <div style={{ paddingTop: '160px', paddingBottom: '80px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '400px', height: '400px', background: 'white', borderRadius: '50%', filter: 'blur(120px)' }} />
                        <div style={{ position: 'absolute', bottom: '-10%', right: '20%', width: '500px', height: '500px', background: 'white', borderRadius: '50%', filter: 'blur(140px)' }} />
                    </div>

                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.45em', marginBottom: '1.5rem' }}
                        >
                            Connection
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}
                        >
                            Let's Build Your<br />Masterpiece.
                        </motion.h1>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem) 120px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(2rem, 5vw, 4rem)' }}>

                    {/* Left: Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div style={{ marginBottom: '4rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '2rem', color: 'white' }}>Direct Channels</h2>
                            <div style={{ display: 'grid', gap: '2.5rem' }}>
                                <ContactMethod
                                    icon={Mail}
                                    label="Email for Proposals"
                                    value="hello@wapixo.io"
                                    desc="Always open for new collaborations."
                                />
                                <ContactMethod
                                    icon={Phone}
                                    label="Support Hotline"
                                    value="+91 98765 43210"
                                    desc="Mon-Fri, 9am - 7pm IST"
                                />
                                <ContactMethod
                                    icon={MapPin}
                                    label="Headquarters"
                                    value="DLF Cyber City, Phase III, Gurgaon, India"
                                    desc="Our surgical command center."
                                />
                            </div>
                        </div>

                        {/* Social / Extra Info */}
                        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <Sparkles size={18} color="rgba(255,255,255,0.5)" />
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fast Response</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
                                We typically respond to new salon inquiries within 24 business hours. Our experts are ready to audit your current workflow.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right: Inquiry Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        style={{
                            background: 'rgba(255,255,255,0.025)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '4px',
                            padding: 'clamp(1.5rem, 4vw, 3rem)',
                            position: 'relative',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
                        }}
                    >
                        {!submitted ? (
                            <>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 200, marginBottom: '2.5rem' }}>Submit Inquiry</h3>
                                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                                        <WapixoInput label="Name" name="name" placeholder="John Doe" value={formState.name} onChange={handleChange} required />
                                        <WapixoInput label="Work Email" name="email" type="email" placeholder="john@salon.com" value={formState.email} onChange={handleChange} required />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                                        <WapixoInput label="Salon Name" name="salonName" placeholder="Elite Cuts" value={formState.salonName} onChange={handleChange} required />
                                        <WapixoInput label="Phone Number" name="phone" placeholder="+91 ..." value={formState.phone} onChange={handleChange} required />
                                    </div>
                                    <WapixoTextarea label="Message" name="message" placeholder="Tell us about your outlets and current challenges..." value={formState.message} onChange={handleChange} required />

                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ backgroundColor: 'white', color: 'black', scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            marginTop: '1rem',
                                            padding: '1.1rem',
                                            background: 'transparent',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.2em',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {isSubmitting ? 'Sending Transmission...' : <>Send Inquiry <Send size={14} /></>}
                                    </motion.button>
                                </form>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
                            >
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                                    <MessageSquare size={24} color="#ffffff" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '1rem' }}>Transmission Received</h3>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', maxWidth: '300px', lineHeight: 1.6 }}>
                                    Your inquiry has been encrypted and sent to our team. Expect a response within one business day.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '2rem', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Send another inquiry
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                <WapixoFooter />
            </div>
        </SmoothScroll>
    );
}

function ContactMethod({ icon: Icon, label, value, desc }) {
    return (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
                <Icon size={18} color="rgba(255,255,255,0.7)" strokeWidth={1} />
            </div>
            <div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.4rem' }}>{label}</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 300, color: 'white', marginBottom: '0.25rem' }}>{value}</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>{desc}</p>
            </div>
        </div>
    );
}

function WapixoInput({ label, required, ...props }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {label} {required && <span style={{ color: 'rgba(255,255,255,0.2)' }}>*</span>}
            </label>
            <input
                {...props}
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '2px',
                    padding: '0.9rem',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
        </div>
    );
}

function WapixoTextarea({ label, required, ...props }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {label} {required && <span style={{ color: 'rgba(255,255,255,0.2)' }}>*</span>}
            </label>
            <textarea
                {...props}
                rows={5}
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '2px',
                    padding: '0.9rem',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'none',
                    transition: 'border 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
        </div>
    );
}
