import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';

const blogPosts = [
    {
        id: 1,
        category: "Growth",
        title: "How to Scale Your Salon to Multiple Outlets",
        excerpt: "Learn the essential strategies for managing operations across different locations without losing quality.",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
        date: "Feb 15, 2026"
    },
    {
        id: 2,
        category: "Marketing",
        title: "Automated WhatsApp Marketing for Beauty Businesses",
        excerpt: "Discover how automated reminders and campaigns can increase your booking rate by up to 40%.",
        image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=800",
        date: "Feb 10, 2026"
    },
    {
        id: 3,
        category: "Operations",
        title: "The Future of POS in the Salon Industry",
        excerpt: "Why traditional billing is dead and how modern cloud-based systems are changing the game.",
        image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=800",
        date: "Feb 05, 2026"
    }
];

export default function BlogPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#050505';
        return () => {
            document.body.style.backgroundColor = originalBg;
        };
    }, []);

    return (
        <div className="new-dark-theme" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
            <WapixoNavbar />

            {/* Elegant Header - Matching Wapixo Ref */}
            <div style={{ paddingTop: 'clamp(100px, 15vw, 160px)', paddingBottom: 'clamp(40px, 8vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '400px', height: '400px', background: '#ffffff', borderRadius: '50%', filter: 'blur(120px)' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '20%', width: '500px', height: '500px', background: '#ffffff', borderRadius: '50%', filter: 'blur(140px)' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ position: 'relative', zIndex: 10, padding: '0 1rem' }}
                >
                    <p style={{ fontWeight: 300, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                        Insights & stories
                    </p>
                    <h1 style={{ fontWeight: 200, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
                        Our Journal.
                    </h1>
                </motion.div>
            </div>

            {/* Featured Post (Signature Style) */}
            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 100px 1.5rem', width: '100%' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    onClick={() => navigate('/blog/1')}
                    style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}
                    className="group"
                >
                    <div style={{ aspectRatio: 'clamp(16, 18, 21)/9', overflow: 'hidden', minHeight: '200px' }}>
                        <img
                            src="https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200"
                            alt="Featured Blog"
                            style={{ width: '100%', height: '100%', objectCover: 'cover', transition: 'transform 1.5s ease', filter: 'grayscale(100%) brightness(0.7)' }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.filter = 'grayscale(0%) brightness(0.9)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.filter = 'grayscale(100%) brightness(0.7)';
                            }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 60%)' }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '1.5rem' }}>Latest Insight</span>
                            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 200, color: '#ffffff', maxWidth: '800px', marginBottom: '2.5rem', lineHeight: 1.2 }}>
                                The Art of Salon Experience: More Than Just a Service.
                            </h2>
                            <button
                                style={{
                                    background: '#ffffff',
                                    color: '#050505',
                                    padding: '0.8rem 2rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    borderRadius: '8px',
                                    border: 'none',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer'
                                }}
                            >
                                Read Article
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Grid of Journal Posts */}
                <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'center' }}>

                    {/* Blog Feed */}
                    <div style={{ width: '100%', maxWidth: '800px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
                            {blogPosts.map((post, idx) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                                    onClick={() => navigate(`/blog/${post.id}`)}
                                    style={{ cursor: 'pointer', paddingBottom: '60px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                                    className="group"
                                >
                                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.3em', display: 'block', marginBottom: '1.25rem' }}>
                                        {post.category} — {post.date}
                                    </span>
                                    <h3 style={{ fontSize: '2rem', fontWeight: 200, color: '#ffffff', marginBottom: '1.25rem', lineHeight: 1.3, transition: 'color 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'} onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}>
                                        {post.title}
                                    </h3>
                                    <p style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 300, fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                        {post.excerpt}
                                    </p>
                                    <div style={{ aspectRatio: '16/9', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '2rem' }}>
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)', transition: 'all 0.8s ease' }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.filter = 'grayscale(0%)';
                                                e.currentTarget.style.transform = 'scale(1.02)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.filter = 'grayscale(100%)';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ffffff', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                        Continue Reading <div style={{ height: '1px', width: '40px', background: 'rgba(255,255,255,0.3)' }} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* Bottom Dark Section */}
            <div style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '100px 1.5rem', textAlign: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.4em', display: 'block', marginBottom: '1.5rem' }}>Subscribe</span>
                <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>Join the Inner Circle.</h2>
            </div>

            <WapixoFooter />
        </div>
    );
}

