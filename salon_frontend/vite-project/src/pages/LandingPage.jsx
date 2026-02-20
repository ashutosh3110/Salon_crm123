import { useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ProblemsSection from '../components/landing/ProblemsSection';
import SolutionSection from '../components/landing/SolutionSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ScreenshotsSection from '../components/landing/ScreenshotsSection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

// Styles
import '../styles/landing.css';

const LandingPage = () => {
    useEffect(() => {
        // Change title and meta for SEO
        document.title = "Wapixo | All-in-One Salon Management Software";

        // Scroll to top on load
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="landing-page-container bg-white selection:bg-primary/20 selection:text-primary">
            <Navbar />
            <main>
                <HeroSection />
                <ProblemsSection />
                <SolutionSection />
                <FeaturesSection />
                <ScreenshotsSection />
                <PricingSection />
                <TestimonialsSection />
                <FAQSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
