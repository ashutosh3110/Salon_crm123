import { getImageUrl } from '../../../utils/imageUtils';
import { useTheme } from '../../../contexts/ThemeContext';

export default function GlobalCustomers({ data = {} }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const heading = data?.heading || 'Meet our global customers';
    const subtitle = data?.subtitle || 'Trusted by 3000+ salon/spa\'s worldwide';
    const logos = data?.logos && data.logos.length > 0 ? data.logos : ['/hair_styling_promo.png'];

    const resolveLogoUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
        if (url.startsWith('/') && !url.includes('uploads')) return url;
        return getImageUrl(url);
    };

    // Duplicate logos to ensure we have a seamless infinite marquee effect
    const marqueeLogos = [...logos, ...logos, ...logos, ...logos];

    return (
        <section className="global-customers-section">
            <div className="global-customers-container">
                <h2 className="global-customers-heading">
                    {heading}
                </h2>
                <p className="global-customers-subtitle">
                    {subtitle}
                </p>
            </div>

            {/* Scrolling Marquee Container */}
            <div className="global-marquee-container">
                <div className="marquee-track">
                    {marqueeLogos.map((logo, idx) => (
                        <div key={idx} className="marquee-logo-wrapper">
                            <img
                                src={resolveLogoUrl(logo)}
                                alt={`Customer Logo ${idx}`}
                                className="marquee-logo"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'; // hide broken images gracefully
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .global-customers-section {
                    background: ${isDark ? 'var(--wapixo-bg-alt, #0f0f0f)' : '#ffffff'};
                    padding: 5rem 1.5rem;
                    text-align: center;
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                    position: relative;
                    width: 100%;
                    transition: background 0.3s ease;
                }
                .global-customers-container {
                    max-width: 1200px;
                    margin: 0 auto 3.5rem auto;
                }
                .global-customers-heading {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: ${isDark ? 'var(--wapixo-text, #ffffff)' : '#1a1a1a'};
                    margin-bottom: 0.75rem;
                    letter-spacing: -0.03em;
                    line-height: 1.25;
                }
                .global-customers-subtitle {
                    font-size: 1.1rem;
                    color: ${isDark ? 'var(--wapixo-text-muted, #a0aec0)' : '#4a5568'};
                    font-weight: 400;
                    margin: 0;
                    opacity: 0.85;
                    line-height: 1.5;
                }
                .global-marquee-container {
                    display: flex;
                    overflow: hidden;
                    width: 100%;
                    position: relative;
                    padding: 1rem 0;
                    mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
                }
                .marquee-track {
                    display: flex;
                    gap: 6rem;
                    align-items: center;
                    flex-shrink: 0;
                    min-width: 100%;
                    animation: scroll-marquee 25s linear infinite;
                }
                .marquee-logo-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .marquee-logo {
                    height: 52px;
                    width: auto;
                    object-fit: contain;
                    mix-blend-mode: ${isDark ? 'screen' : 'multiply'};
                    opacity: ${isDark ? 0.85 : 0.7};
                    filter: ${isDark ? 'invert(1) grayscale(100%)' : 'grayscale(100%)'};
                }

                @keyframes scroll-marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }

                /* Responsive Tablet View */
                @media (max-width: 1024px) {
                    .global-customers-section {
                        padding: 4rem 1.5rem;
                    }
                    .global-customers-heading {
                        font-size: 2.1rem;
                    }
                    .global-customers-subtitle {
                        font-size: 1rem;
                    }
                    .marquee-track {
                        gap: 4.5rem;
                    }
                    .marquee-logo {
                        height: 44px;
                    }
                    .global-marquee-container {
                        mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
                        -webkit-mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
                    }
                }

                /* Responsive Mobile View */
                @media (max-width: 640px) {
                    .global-customers-section {
                        padding: 3rem 1.25rem;
                    }
                    .global-customers-container {
                        margin-bottom: 2.25rem;
                    }
                    .global-customers-heading {
                        font-size: 1.65rem;
                        line-height: 1.3;
                    }
                    .global-customers-subtitle {
                        font-size: 0.9rem;
                        margin-top: 0.5rem;
                        line-height: 1.4;
                    }
                    .marquee-track {
                        gap: 3.5rem;
                        animation-duration: 18s; /* faster marquee scroll for smaller screen */
                    }
                    .marquee-logo {
                        height: 36px;
                    }
                    .global-marquee-container {
                        mask-image: linear-gradient(to right, transparent, white 6%, white 94%, transparent);
                        -webkit-mask-image: linear-gradient(to right, transparent, white 6%, white 94%, transparent);
                    }
                }
            `}</style>
        </section>
    );
}
