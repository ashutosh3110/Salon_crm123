import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';

export default function WapixoBlog() {
    const { theme } = useTheme();
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    const getImageUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200';
        if (url.startsWith('http')) return url;
        const apiHost = API_BASE_URL.replace(/\/v1\/?$/, '');
        return `${apiHost}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await api.get('/blogs?isFeatured=true&status=published');
                setPosts(data.slice(0, 3));
            } catch (err) {
                console.error('Failed to fetch featured blogs:', err);
            }
        };
        fetchPosts();
    }, []);

    if (posts.length === 0) return null;

    return (
        <section style={{ padding: '100px 1.5rem', maxWidth: '1200px', margin: '0 auto', background: 'var(--wapixo-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                <div>
                    <span style={{ color: 'var(--wapixo-primary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4em' }}>The Journal</span>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 200, color: 'var(--wapixo-text)', letterSpacing: '-0.02em', marginTop: '1rem' }}>Latest Insights.</h2>
                </div>
                <button 
                    onClick={() => navigate('/blog')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--wapixo-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                    View All <div style={{ height: '1px', width: '30px', background: 'var(--wapixo-primary)', opacity: 0.6 }} />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                {posts.map((post, idx) => (
                    <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.8 }}
                        onClick={() => navigate(`/blog/${post.slug}`)}
                        style={{ cursor: 'pointer' }}
                        className="group"
                    >
                         <div style={{ aspectRatio: '16/10', overflow: 'hidden', border: '1px solid var(--wapixo-border)', marginBottom: '1.5rem' }}>
                            <img 
                                src={getImageUrl(post.image)} 
                                alt={post.title} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)', transition: 'all 0.8s ease' }} 
                                onMouseOver={(e) => {
                                    e.currentTarget.style.filter = 'grayscale(0%)';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.filter = 'grayscale(100%)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            />
                        </div>
                        <span style={{ color: 'var(--wapixo-primary)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em' }}>{post.category}</span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 200, color: 'var(--wapixo-text)', marginTop: '0.5rem', lineHeight: 1.4 }}>{post.title}</h3>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
