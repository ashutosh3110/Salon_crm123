import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import Pricing from '../../components/landing/Pricing';
import SpecialOffers from '../../components/landing/SpecialOffers';
import About from '../../components/landing/About';
import Contact from '../../components/landing/Contact';
import FAQ from '../../components/landing/FAQ';
import Testimonials from '../../components/landing/Testimonials';
import FeatureGallery from '../../components/landing/FeatureGallery';
import ContactPreview from '../../components/landing/ContactPreview';
import Footer from '../../components/landing/Footer';

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <SpecialOffers />
            <About />
            <Contact />
            <FAQ />
            <Testimonials />
            <FeatureGallery />
            <ContactPreview />
            <Footer />
        </div>
    );
}
