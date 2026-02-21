import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import Pricing from '../../components/landing/Pricing';
import About from '../../components/landing/About';
import Contact from '../../components/landing/Contact';
import Footer from '../../components/landing/Footer';

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <About />
            <Contact />
            <Footer />
        </div>
    );
}
