import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import SmoothScroll from '../../components/landing/wapixo/SmoothScroll';
import WapixoLoader from '../../components/landing/wapixo/WapixoLoader';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import AnimatedHero from '../../components/landing/wapixo/AnimatedHero';
import AppShowcase from '../../components/landing/wapixo/AppShowcase';
import MultiDeviceShowcase from '../../components/landing/wapixo/MultiDeviceShowcase';
import Features from '../../components/landing/wapixo/Features';
import ScissorsMorph from '../../components/landing/wapixo/ScissorsMorph';
import WapixoSolutions from '../../components/landing/wapixo/WapixoSolutions';
import WapixoPricing from '../../components/landing/wapixo/WapixoPricing';
import WapixoBlog from '../../components/landing/wapixo/WapixoBlog';
import WapixoNewsletter from '../../components/landing/wapixo/WapixoNewsletter';
import WapixoTestimonials from '../../components/landing/wapixo/WapixoTestimonials';
import WapixoFAQ from '../../components/landing/wapixo/WapixoFAQ';
import ChairSection from '../../components/landing/wapixo/ChairSection';
import GlobalCustomers from '../../components/landing/wapixo/GlobalCustomers';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';


export default function LandingPage() {
    const { theme } = useTheme();
    const [loaded, setLoaded] = useState(false);
    const [cmsData, setCmsData] = useState(null);
    const [testimonials, setTestimonials] = useState(null);

    useEffect(() => {
        fetchCMS();
    }, []);

    const fetchCMS = async () => {
        try {
            const [cmsRes, testRes] = await Promise.all([
                api.get('/cms'),
                api.get('/testimonials')
            ]);
            const sections = cmsRes.data?.data || cmsRes.data || {};
            setCmsData(sections);
            setTestimonials(testRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <>
            <Helmet>
                <title>Wapixo — Salon Management Software | Bookings, POS & CRM India</title>
                <meta name="description" content="Wapixo is India's #1 salon management software. Manage appointments, POS billing, staff payroll, inventory, WhatsApp automation, and customer loyalty programs — all in one cloud platform." />
                <meta name="keywords" content="salon management software india, salon CRM, salon billing software, hair salon software, beauty parlour software, salon appointment booking, salon POS system, wapixo" />
                <link rel="canonical" href="https://wapixo.com/" />
                <meta property="og:title" content="Wapixo — Complete Salon Management Software" />
                <meta property="og:description" content="India's #1 salon management platform. POS billing, appointments, staff payroll, inventory, WhatsApp automation & loyalty programs." />
                <meta property="og:url" content="https://wapixo.com/" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://wapixo.com/og-image.png" />
                <meta name="twitter:title" content="Wapixo — Complete Salon Management Software" />
                <meta name="twitter:description" content="India's #1 salon management platform — manage bookings, billing, staff & WhatsApp automation." />
            </Helmet>

            {/* Cinematic loader — preloads sequence, then fades out */}
            <WapixoLoader onComplete={() => setLoaded(true)} />


            {/* Main page content */}
            <SmoothScroll>
                <div className="new-theme" style={{ minHeight: '100vh', position: 'relative' }}>
                    <WapixoNavbar />
                    <AnimatedHero data={cmsData?.landing_hero} />
                    <AppShowcase data={cmsData?.landing_app_showcase} />
                    <MultiDeviceShowcase data={cmsData?.landing_multi_device_showcase} />
                    <Features data={cmsData?.landing_features} statsData={cmsData?.landing_stats} />
                    <ScissorsMorph data={cmsData?.landing_scissors_morph} />
                    <WapixoSolutions
                        data={cmsData?.landing_solutions}
                        header={cmsData?.landing_solutions_header}
                    />
                    <WapixoPricing />
                    <WapixoBlog />
                    <WapixoNewsletter />
                    <WapixoTestimonials data={testimonials} />
                    <WapixoFAQ data={cmsData?.landing_faqs} ctaData={cmsData?.landing_faq_cta} />
                    <GlobalCustomers data={cmsData?.landing_global_customers} />
                    <ChairSection data={cmsData?.landing_chair_section} />
                    <WapixoFooter data={cmsData?.site_footer} />
                </div>
            </SmoothScroll>
        </>
    );

}
