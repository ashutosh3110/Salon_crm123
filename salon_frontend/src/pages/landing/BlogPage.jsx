import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';
import { useTheme } from '../../contexts/ThemeContext';

import api, { API_BASE_URL } from '../../services/api';

export default function BlogPage() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200';
        if (url.startsWith('http')) return url;
        const backendUrl = api.defaults.baseURL.replace('/api', '');
        return `${backendUrl}/${url}`;
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await api.get('/blogs?status=published');
                setPosts(data);
            } catch (err) {
                console.error('Failed to fetch journal feed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();

        document.body.style.backgroundColor = 'var(--wapixo-bg)';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    return (
        <div className="new-theme" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", background: 'var(--wapixo-bg)' }}>
            <WapixoNavbar />

            {/* Elegant Header - Matching Wapixo Ref */}
            <div style={{ paddingTop: 'clamp(100px, 15vw, 160px)', paddingBottom: 'clamp(40px, 8vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: theme === 'dark' ? 0.15 : 0.05, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '400px', height: '400px', background: 'var(--wapixo-text)', borderRadius: '50%', filter: 'blur(120px)' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '20%', width: '500px', height: '500px', background: 'var(--wapixo-text)', borderRadius: '50%', filter: 'blur(140px)' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ position: 'relative', zIndex: 10, padding: '0 1rem' }}
                >
                    <p style={{ fontWeight: 400, fontSize: '0.7rem', color: 'var(--wapixo-text-muted)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                        Insights & stories
                    </p>
                    <h1 style={{ fontWeight: 300, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'var(--wapixo-text)', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
                        Our Journal.
                    </h1>
                </motion.div>
            </div>

            {/* Featured Post (Signature Style) */}
            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 100px 1.5rem', width: '100%' }}>
                {posts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        onClick={() => navigate(`/blog/${posts[0].slug}`)}
                        style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', border: '1px solid var(--wapixo-border)' }}
                        className="group"
                    >
                        <div style={{ aspectRatio: 'clamp(16, 18, 21)/9', overflow: 'hidden', minHeight: '200px' }}>
                            <img
                                src={getImageUrl(posts[0].image)}
                                alt={posts[0].title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 1.5s ease', filter: 'grayscale(100%) brightness(0.7)' }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.filter = 'grayscale(0%) brightness(0.9)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.filter = 'grayscale(100%) brightness(0.7)';
                                }}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: theme === 'dark' ? 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 60%)' : 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 60%)' }} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                                <span style={{ color: 'var(--wapixo-text-muted)', fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '1.5rem' }}>Signature Piece</span>
                                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 300, color: 'var(--wapixo-text)', maxWidth: '800px', marginBottom: '2.5rem', lineHeight: 1.2 }}>
                                    {posts[0].title}
                                </h2>
                                <button
                                    style={{
                                        background: 'var(--wapixo-primary)',
                                        color: 'white',
                                        padding: '0.8rem 2rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        borderRadius: '8px',
                                        border: 'none',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 20px rgba(180, 145, 43, 0.2)'
                                    }}
                                >
                                    Read Full Narrative
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Grid of Journal Posts */}
                <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'center' }}>

                    {/* Blog Feed */}
                    <div style={{ width: '100%', maxWidth: '800px' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--wapixo-text-muted)' }}>
                                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Syncing Journal Feed...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--wapixo-text-muted)' }}>
                                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4em' }}>No narratives documented yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
                                {posts.map((post, idx) => (
                                    <motion.div
                                        key={post._id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1, duration: 0.8 }}
                                        onClick={() => navigate(`/blog/${post.slug}`)}
                                        style={{ cursor: 'pointer', paddingBottom: '60px', borderBottom: '1px solid var(--wapixo-border)' }}
                                        className="group"
                                    >
                                        <span style={{ color: 'var(--wapixo-text-muted)', fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3em', display: 'block', marginBottom: '1.25rem' }}>
                                            Insight — {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                        </span>
                                        <h3 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--wapixo-text)', marginBottom: '1.25rem', lineHeight: 1.3, transition: 'color 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--wapixo-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--wapixo-text)'}>
                                            {post.title}
                                        </h3>
                                        <p style={{ color: 'var(--wapixo-text-muted)', fontWeight: 400, fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {post.content}
                                        </p>
                                        <div style={{ aspectRatio: '16/9', overflow: 'hidden', border: '1px solid var(--wapixo-border)', marginBottom: '2rem' }}>
                                            <img
                                                src={getImageUrl(post.image)}
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--wapixo-primary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                            Continue Reading <div style={{ height: '1px', width: '40px', background: 'var(--wapixo-primary)' }} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </section>

            {/* Bottom Dark Section */}
            <div style={{ background: 'var(--wapixo-bg)', borderTop: '1px solid var(--wapixo-border)', padding: '100px 1.5rem', textAlign: 'center' }}>
                <span style={{ color: 'var(--wapixo-text-muted)', fontSize: '0.7rem', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.4em', display: 'block', marginBottom: '1.5rem' }}>Subscribe</span>
                <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: 'var(--wapixo-text)', letterSpacing: '-0.02em', margin: 0 }}>Join the Inner Circle.</h2>
            </div>

            <WapixoFooter />
        </div>
    );
}
