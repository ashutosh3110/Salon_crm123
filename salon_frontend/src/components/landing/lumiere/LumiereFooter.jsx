import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const footerLinks = {
    Product: ['Features', 'Pricing', 'Changelog'],
    Company: ['About', 'Blog', 'Careers'],
    Legal: ['Privacy', 'Terms', 'Cookies'],
};

export default function LumiereFooter() {
    return (
        <footer
            style={{
                background: '#050505',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: 'clamp(3rem, 6vw, 6rem) clamp(1.5rem, 5vw, 5rem) clamp(2rem, 4vw, 3rem)',
            }}
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Top row */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '3rem',
                    marginBottom: 'clamp(3rem, 6vw, 5rem)',
                }}>
                    {/* Brand */}
                    <div style={{ maxWidth: '280px' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src="/1-removebg-preview.png"
                                alt="Wapixo Logo"
                                style={{
                                    height: '150px',
                                    width: 'auto',
                                    filter: 'brightness(0) invert(1)'
                                }}
                            />
                        </Link>
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 300,
                            fontSize: '0.82rem',
                            color: 'rgba(255,255,255,0.35)',
                            lineHeight: 1.7,
                            marginTop: '1rem',
                        }}>
                            Powering smart businesses with intelligent salon management.
                        </p>
                    </div>

                    {/* Links */}
                    <div style={{
                        display: 'flex',
                        gap: 'clamp(2rem, 5vw, 5rem)',
                        flexWrap: 'wrap',
                    }}>
                        {Object.entries(footerLinks).map(([group, items]) => (
                            <div key={group}>
                                <p style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontWeight: 300,
                                    fontSize: '0.7rem',
                                    color: 'rgba(255,255,255,0.35)',
                                    letterSpacing: '0.25em',
                                    textTransform: 'uppercase',
                                    marginBottom: '1rem',
                                }}>
                                    {group}
                                </p>
                                {items.map((item) => (
                                    <div key={item} style={{ marginBottom: '0.6rem' }}>
                                        <a
                                            href={`/${item.toLowerCase()}`}
                                            style={{
                                                fontFamily: "'Inter', sans-serif",
                                                fontWeight: 300,
                                                fontSize: '0.85rem',
                                                color: 'rgba(255,255,255,0.5)',
                                                textDecoration: 'none',
                                                transition: 'color 0.2s',
                                            }}
                                            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                                            onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.5)')}
                                        >
                                            {item}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom row */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                }}>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 300,
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.25)',
                        margin: 0,
                    }}>
                        © {new Date().getFullYear()} Wapixo. All rights reserved.
                    </p>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 200,
                        fontSize: '0.7rem',
                        color: 'rgba(255,255,255,0.2)',
                        letterSpacing: '0.2em',
                        margin: 0,
                    }}>
                        POWERING SMART BUSINESSES
                    </p>
                </div>
            </div>
        </footer>
    );
}
