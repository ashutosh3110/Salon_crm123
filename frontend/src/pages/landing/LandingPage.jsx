import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import SmoothScroll from '../../components/landing/wapixo/SmoothScroll';
import WapixoLoader from '../../components/landing/wapixo/WapixoLoader';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import AnimatedHero from '../../components/landing/wapixo/AnimatedHero';
import AppShowcase from '../../components/landing/wapixo/AppShowcase';
import Features from '../../components/landing/wapixo/Features';
import ScissorsMorph from '../../components/landing/wapixo/ScissorsMorph';
import WapixoSolutions from '../../components/landing/wapixo/WapixoSolutions';
import WapixoPricing from '../../components/landing/wapixo/WapixoPricing';
import WapixoBlog from '../../components/landing/wapixo/WapixoBlog';
import WapixoTestimonials from '../../components/landing/wapixo/WapixoTestimonials';
import WapixoFAQ from '../../components/landing/wapixo/WapixoFAQ';
import ChairSection from '../../components/landing/wapixo/ChairSection';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';

export default function LandingPage() {
    const { theme } = useTheme();
    const [loaded, setLoaded] = useState(false);
    const [cmsData, setCmsData] = useState(null);

    useEffect(() => {
        fetchCMS();
    }, []);

    const fetchCMS = async () => {
        try {
            const response = await api.get('/cms');
            setCmsData(response.data);
        } catch (error) {
            console.error('Error fetching CMS:', error);
        }
    };

    return (
        <>
            {/* Cinematic loader — preloads sequence, then fades out */}
            <WapixoLoader onComplete={() => setLoaded(true)} />

            {/* Main page content */}
            <SmoothScroll>
                <div className="new-theme" style={{ minHeight: '100vh', position: 'relative' }}>
                    <WapixoNavbar />
                    <AnimatedHero />
                    <AppShowcase />
                    <Features data={cmsData?.landing_features} />
                    <ScissorsMorph />
                    <WapixoSolutions />
                    <WapixoPricing />
                    <WapixoBlog />
                    <WapixoTestimonials data={cmsData?.landing_testimonials} />
                    <WapixoFAQ data={cmsData?.landing_faqs} />
                    <ChairSection />
                    <WapixoFooter />
                </div>
            </SmoothScroll>
        </>
    );
}
