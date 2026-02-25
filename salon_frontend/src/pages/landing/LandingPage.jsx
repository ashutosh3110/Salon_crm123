import { useState, useEffect } from 'react';
import SmoothScroll from '../../components/landing/wapixo/SmoothScroll';
import WapixoLoader from '../../components/landing/wapixo/WapixoLoader';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import HeroScroll from '../../components/landing/wapixo/HeroScroll';
import Features from '../../components/landing/wapixo/Features';
import ScissorsMorph from '../../components/landing/wapixo/ScissorsMorph';
import WapixoAbout from '../../components/landing/wapixo/WapixoAbout';
import WapixoSolutions from '../../components/landing/wapixo/WapixoSolutions';
import WapixoPricing from '../../components/landing/wapixo/WapixoPricing';
import WapixoTestimonials from '../../components/landing/wapixo/WapixoTestimonials';
import WapixoFAQ from '../../components/landing/wapixo/WapixoFAQ';
import ChairSection from '../../components/landing/wapixo/ChairSection';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';

export default function LandingPage() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#050505';
        return () => {
            document.body.style.backgroundColor = originalBg;
        };
    }, []);

    return (
        <>
            {/* Cinematic loader — preloads sequence, then fades out */}
            <WapixoLoader onComplete={() => setLoaded(true)} />

            {/* Main page content */}
            <SmoothScroll>
                <div className="new-dark-theme" style={{ minHeight: '100vh', position: 'relative' }}>
                    <WapixoNavbar />
                    <div style={{ paddingTop: '60px' }}>
                        <HeroScroll />
                    </div>
                    <Features />
                    <ScissorsMorph />
                    <WapixoAbout />
                    <WapixoSolutions />
                    <WapixoPricing />
                    <WapixoTestimonials />
                    <WapixoFAQ />
                    <ChairSection />
                    <WapixoFooter />
                </div>
            </SmoothScroll>
        </>
    );
}
