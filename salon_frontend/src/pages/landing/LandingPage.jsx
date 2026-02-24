import { useState } from 'react';
import SmoothScroll from '../../components/landing/lumiere/SmoothScroll';
import LumiereLoader from '../../components/landing/lumiere/LumiereLoader';
import LumiereNavbar from '../../components/landing/lumiere/LumiereNavbar';
import HeroScroll from '../../components/landing/lumiere/HeroScroll';
import Features from '../../components/landing/lumiere/Features';
import ScissorsMorph from '../../components/landing/lumiere/ScissorsMorph';
import ChairSection from '../../components/landing/lumiere/ChairSection';
import LumiereFooter from '../../components/landing/lumiere/LumiereFooter';

export default function LandingPage() {
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            {/* Cinematic loader — preloads sequence, then fades out */}
            <LumiereLoader onComplete={() => setLoaded(true)} />

            {/* Main page content */}
            <SmoothScroll>
                <div style={{ background: '#050505', minHeight: '100vh', position: 'relative' }}>
                    <LumiereNavbar />
                    <div style={{ paddingTop: '60px' }}>
                        <HeroScroll />
                    </div>
                    <Features />
                    <ScissorsMorph />
                    <ChairSection />
                    <LumiereFooter />
                </div>
            </SmoothScroll>
        </>
    );
}
