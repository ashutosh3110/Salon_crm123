import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { getImageUrl } from '../../../utils/imageUtils';

export default function WapixoBlog() {
    const { theme } = useTheme();
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await api.get('/blogs?isFeatured=true&status=published');
                if (Array.isArray(data)) {
                    setPosts(data.slice(0, 3));
                } else {
                    console.error('Expected array for blogs, received:', data);
                    setPosts([]);
                }
            } catch (err) {
                console.error('Failed to fetch featured blogs:', err);
                setPosts([]);
            }
        };
        fetchPosts();
    }, []);

    if (!Array.isArray(posts) || posts.length === 0) return null;

    return (
        <section style={{ padding: 'clamp(40px, 6vw, 80px) 1.5rem', maxWidth: '1200px', margin: '0 auto', background: 'var(--wapixo-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }} className="blog-header-row">
                <div>
                    <span style={{ color: 'var(--wapixo-primary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4em' }}>The Journal</span>
                    <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 200, fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)', color: 'var(--wapixo-text)', letterSpacing: '-0.035em', lineHeight: 1.05, margin: '0 0 1.25rem 0' }}>Latest Insights.</h2>
                </div>
                <button 
                    onClick={() => navigate('/blog')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--wapixo-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                    View All <div style={{ height: '1px', width: '30px', background: 'var(--wapixo-primary)', opacity: 0.6 }} />
                </button>
            </div>

            <div className="blog-grid-container" style={{ gap: '40px' }}>
                {posts.map((post, idx) => (
                    <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.8 }}
                        onClick={() => navigate(`/blog/${post.slug}`)}
                        style={{ cursor: 'pointer' }}
                        className="group blog-card"
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

            <style>{`
                .blog-grid-container {
                    display: flex !important;
                    overflow-x: auto !important;
                    scroll-snap-type: x mandatory !important;
                    padding: 10px 5px 30px !important;
                    gap: 1.5rem !important;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .blog-grid-container::-webkit-scrollbar {
                    display: none;
                }
                .blog-card {
                    flex: 0 0 85% !important;
                    scroll-snap-align: center;
                    min-width: 280px;
                }
                @media (min-width: 768px) {
                    .blog-grid-container {
                        display: grid !important;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
                        gap: 40px !important;
                        overflow-x: visible !important;
                        padding: 0 !important;
                    }
                    .blog-card {
                        flex: none !important;
                    }
                }
                @media (max-width: 480px) {
                    .blog-header-row {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 1rem !important;
                        margin-bottom: 30px !important;
                    }
                }
            `}</style>
        </section>
    );
}
