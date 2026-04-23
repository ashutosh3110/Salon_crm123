import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';
import { useTheme } from '../../contexts/ThemeContext';

import api, { API_BASE_URL } from '../../services/api';

export default function BlogPostDetailPage() {
    const { theme } = useTheme();
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200';
        if (url.startsWith('http')) return url;
        const backendUrl = api.defaults.baseURL.replace('/api', '');
        return `${backendUrl}/${url}`;
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await api.get(`/blogs/${slug}`);
                setPost(data);
            } catch (err) {
                console.error('Failed to fetch article:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();

        document.body.style.backgroundColor = 'var(--wapixo-bg)';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, [slug]);

    if (loading) {
        return (
            <div className="new-theme" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", color: 'var(--wapixo-text)', background: 'var(--wapixo-bg)' }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Synchronizing Narrative...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="new-theme" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", background: 'var(--wapixo-bg)' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 200, marginBottom: '2rem', color: 'var(--wapixo-text)' }}>Article Not Found</h2>
                    <button onClick={() => navigate('/blog')} style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--wapixo-text)', color: 'var(--wapixo-text)', paddingBottom: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        Return to Journal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="new-theme" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", background: 'var(--wapixo-bg)' }}>
            <WapixoNavbar />

            {/* Elegant Header - Matching Journal Style */}
            <div style={{ paddingTop: 'clamp(100px, 15vw, 160px)', paddingBottom: 'clamp(40px, 8vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: theme === 'dark' ? 0.1 : 0.05, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '-10%', left: '25%', width: '400px', height: '400px', background: 'var(--wapixo-text)', borderRadius: '50%', filter: 'blur(100px)' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '25%', width: '500px', height: '500px', background: 'var(--wapixo-text)', borderRadius: '50%', filter: 'blur(120px)' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 10, padding: '0 1.5rem', maxWidth: '1000px', margin: '0 auto' }}
                >
                    <span style={{ color: 'var(--wapixo-primary)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '1.5rem', display: 'block' }}>
                        Wapixo Journal Entry
                    </span>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 300, color: 'var(--wapixo-text)', lineHeight: 1.1, marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>
                        {post.title}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', color: 'var(--wapixo-text-muted)', fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        <span style={{ color: 'var(--wapixo-primary)' }}>By {post.author}</span>
                        <div style={{ height: '12px', width: '1px', background: 'var(--wapixo-border)' }} />
                        <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                    </div>
                </motion.div>
            </div>

            {/* Content Area */}
            <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 1.5rem) 60px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                    {/* Main Article Content */}
                    <div style={{ width: '100%' }}>
                        <div style={{ background: 'var(--wapixo-bg-alt)', padding: 'clamp(2rem, 5vw, 5rem)', border: '1px solid var(--wapixo-border)', borderRadius: '4px' }}>
                            <div style={{ aspectRatio: '16/9', overflow: 'hidden', border: '1px solid var(--wapixo-border)', marginBottom: '4rem' }}>
                                <img src={getImageUrl(post.image)} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>

                            <div
                                style={{
                                    color: 'var(--wapixo-text)',
                                    lineHeight: 1.8,
                                    fontSize: '1.1rem',
                                    fontWeight: 400,
                                    opacity: 0.8,
                                    whiteSpace: 'pre-wrap'
                                }}
                                className="blog-content-wapixo"
                            >
                                {post.content}
                            </div>

                            {/* Adding some basic styles for the inner HTML content */}
                            <style>{`
                                .blog-content-wapixo h3 {
                                    color: var(--wapixo-text);
                                    font-weight: 300;
                                    font-size: 1.75rem;
                                    margin-top: 3rem;
                                    margin-bottom: 1.5rem;
                                }
                                .blog-content-wapixo p {
                                    margin-bottom: 1.5rem;
                                }
                                .blog-content-wapixo p:first-of-type::first-letter {
                                    font-size: 3.5rem;
                                    float: left;
                                    margin-right: 0.75rem;
                                    line-height: 1;
                                    color: var(--wapixo-primary);
                                    font-weight: 300;
                                }
                            `}</style>

                            <div style={{ marginTop: '5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--wapixo-border)', display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                                <button
                                    onClick={() => navigate('/blog')}
                                    style={{ background: 'none', border: 'none', color: 'var(--wapixo-primary)', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer' }}
                                    onMouseOver={(e) => e.currentTarget.style.gap = '1.5rem'}
                                    onMouseOut={(e) => e.currentTarget.style.gap = '1rem'}
                                >
                                    <div style={{ height: '1px', width: '40px', background: 'var(--wapixo-primary)', opacity: 0.6 }} /> Back to Journal
                                </button>
                                <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
                                    {[1, 2].map(i => (
                                        <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--wapixo-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', color: 'var(--wapixo-text)' }} onMouseOver={(e) => { e.currentTarget.style.background = 'var(--wapixo-text)'; e.currentTarget.style.color = 'var(--wapixo-bg)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--wapixo-text)'; }}>
                                            <div style={{ fontSize: '10px' }}>{i === 1 ? 'FB' : 'TW'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Bottom Dark Section */}
            <div style={{ background: 'var(--wapixo-bg)', borderTop: '1px solid var(--wapixo-border)', textAlign: 'center', padding: '60px 0' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 300, color: 'var(--wapixo-text)', letterSpacing: '-0.02em', margin: 0 }}>Explore More Insights.</h2>
            </div>

            <WapixoFooter />
        </div>
    );
}
