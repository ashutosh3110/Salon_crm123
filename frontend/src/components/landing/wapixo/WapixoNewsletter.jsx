import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from 'react-hot-toast';

export default function WapixoNewsletter() {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        // Simulate subscription or post to backend if needed
        setTimeout(() => {
            toast.success('Thank you for subscribing to our newsletter!');
            setEmail('');
            setIsSubmitting(false);
        }, 800);
    };

    return (
        <section style={{
            background: 'var(--wapixo-bg)',
            padding: '40px 1.5rem',
            borderTop: '1px solid var(--wapixo-border)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Subtle glow background */}
            <div style={{ position: 'absolute', inset: 0, opacity: theme === 'dark' ? 0.08 : 0.02, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'var(--wapixo-primary)', borderRadius: '50%', filter: 'blur(100px)' }} />
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <motion.h2 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        fontFamily: "'Playfair Display', 'Georgia', serif",
                        fontStyle: 'italic',
                        fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)',
                        fontWeight: 400,
                        color: 'var(--wapixo-primary)',
                        marginBottom: '0.5rem',
                        letterSpacing: '0.02em'
                    }}
                >
                    Join Our Newsletter
                </motion.h2>

                <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
                        color: 'var(--wapixo-text-muted)',
                        fontWeight: 300,
                        lineHeight: 1.5,
                        marginBottom: '1.25rem',
                        maxWidth: '480px',
                        margin: '0 auto 1.25rem'
                    }}
                >
                    Subscribe to receive updates on our latest collections and spiritual insights.
                </motion.p>

                <motion.form 
                    onSubmit={handleSubscribe}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '0.75rem',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '460px',
                        margin: '0 auto'
                    }}
                    className="newsletter-form"
                >
                    <input 
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            background: theme === 'dark' ? '#0d0d0d' : '#f9f9f9',
                            border: '1px solid var(--wapixo-border)',
                            borderRadius: '8px',
                            padding: '0.7rem 1.1rem',
                            color: 'var(--wapixo-text)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            width: '100%',
                            transition: 'border 0.3s ease',
                            fontFamily: "'Inter', sans-serif"
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--wapixo-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--wapixo-border)'}
                    />
                    <motion.button 
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02, backgroundColor: '#a07c22' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            background: '#B4912B',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.7rem 1.8rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.3s ease',
                            whiteSpace: 'nowrap',
                            fontFamily: "'Inter', sans-serif"
                        }}
                    >
                        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                    </motion.button>
                </motion.form>
            </div>

            <style>{`
                @media (max-width: 480px) {
                    .newsletter-form {
                        flex-direction: column !important;
                        gap: 1rem !important;
                    }
                    .newsletter-form input {
                        text-align: center;
                    }
                    .newsletter-form button {
                        width: 100% !important;
                    }
                }
            `}</style>
        </section>
    );
}
