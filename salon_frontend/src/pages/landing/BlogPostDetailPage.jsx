import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';

import axios from 'axios';

export default function BlogPostDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200';
        if (url.startsWith('http')) return url;
        // Prefix with backend URL for local uploads
        return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await axios.get(`http://localhost:3000/v1/blogs/${slug}`);
                setPost(data);
            } catch (err) {
                console.error('Failed to fetch article:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();

        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#050505';
        return () => {
            document.body.style.backgroundColor = originalBg;
        };
    }, [slug]);

    if (loading) {
        return (
            <div className="new-dark-theme" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", color: '#ffffff' }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Synchronizing Narrative...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="new-dark-theme" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 200, marginBottom: '2rem' }}>Article Not Found</h2>
                    <button onClick={() => navigate('/blog')} style={{ background: 'none', border: 'none', borderBottom: '1px solid #ffffff', color: '#ffffff', paddingBottom: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        Return to Journal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="new-dark-theme" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
            <WapixoNavbar />

            {/* Elegant Header - Matching Journal Style */}
            <div style={{ paddingTop: 'clamp(100px, 15vw, 160px)', paddingBottom: 'clamp(40px, 8vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '-10%', left: '25%', width: '400px', height: '400px', background: '#ffffff', borderRadius: '50%', filter: 'blur(100px)' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '25%', width: '500px', height: '500px', background: '#ffffff', borderRadius: '50%', filter: 'blur(120px)' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 10, padding: '0 1.5rem', maxWidth: '1000px', margin: '0 auto' }}
                >
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '1.5rem', display: 'block' }}>
                        {post.category} Journal
                    </span>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 200, color: '#ffffff', lineHeight: 1.1, marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>
                        {post.title}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        <span>By {post.author}</span>
                        <div style={{ height: '12px', width: '1px', background: 'rgba(255,255,255,0.15)' }} />
                        <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                    </div>
                </motion.div>
            </div>

            {/* Content Area */}
            <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 1.5rem) 60px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                    {/* Main Article Content */}
                    <div style={{ width: '100%' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'clamp(2rem, 5vw, 5rem)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                            <div style={{ aspectRatio: '16/9', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '4rem' }}>
                                <img src={getImageUrl(post.image)} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>

                            <div
                                style={{
                                    color: 'rgba(255,255,255,0.6)',
                                    lineHeight: 1.8,
                                    fontSize: '1.1rem',
                                    fontWeight: 300
                                }}
                                className="blog-content-wapixo"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* Adding some basic styles for the inner HTML content */}
                            <style>{`
                                .blog-content-wapixo h3 {
                                    color: #ffffff;
                                    font-weight: 200;
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
                                    color: #ffffff;
                                    font-weight: 200;
                                }
                            `}</style>

                            <div style={{ marginTop: '5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                                <button
                                    onClick={() => navigate('/blog')}
                                    style={{ background: 'none', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer' }}
                                    onMouseOver={(e) => e.currentTarget.style.gap = '1.5rem'}
                                    onMouseOut={(e) => e.currentTarget.style.gap = '1rem'}
                                >
                                    <div style={{ height: '1px', width: '40px', background: 'rgba(255,255,255,0.3)' }} /> Back to Journal
                                </button>
                                <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
                                    {[1, 2].map(i => (
                                        <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseOver={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#050505'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#ffffff'; }}>
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
            <div style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)', py: '60px', textAlign: 'center', padding: '60px 0' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>Explore More Insights.</h2>
            </div>

            <WapixoFooter />
        </div>
    );
}

