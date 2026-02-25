import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGender } from '../../contexts/GenderContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { ArrowRight, Sparkles } from 'lucide-react';

const MEN_IMG = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80';
const WOMEN_IMG = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80';

export default function GenderSelectPage() {
    const navigate = useNavigate();
    const { setGender } = useGender();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const pick = (g) => {
        setGender(g);
        navigate('/app', { replace: true });
    };

    const colors = {
        bg: isLight ? '#F8F9FA' : '#141414',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
    };

    return (
        <div
            className="min-h-screen flex flex-col relative overflow-hidden"
            style={{ background: colors.bg, color: colors.text, fontFamily: "'Inter', sans-serif" }}
        >
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] opacity-20 pointer-events-none">
                <div
                    className="absolute inset-0 blur-[100px]"
                    style={{ background: `radial-gradient(circle at center, #C8956C 0%, transparent 70%)` }}
                />
            </div>

            {/* Header */}
            <header className="pt-20 px-8 pb-10 text-center relative z-10 transition-all">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-[#C8956C] to-[#A06844] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#C8956C]/20"
                >
                    <Sparkles className="text-white w-8 h-8" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-black italic tracking-tighter mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Personalize <span className="text-[#C8956C]">Experience</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40"
                >
                    Select your ritual preference
                </motion.p>
            </header>

            {/* Selection Areas */}
            <div className="flex-1 flex flex-col gap-4 px-6 pb-12 relative z-10">
                {/* Men Option */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pick('men')}
                    className="flex-1 relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl shadow-black/10"
                >
                    <img src={MEN_IMG} alt="Men" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Curation for</p>
                                <h2 className="text-4xl font-black text-white italic tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>Gentlemen</h2>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:bg-[#C8956C] transition-all duration-300">
                                <ArrowRight className="text-white w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Women Option */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pick('women')}
                    className="flex-1 relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl shadow-black/10"
                >
                    <img src={WOMEN_IMG} alt="Women" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Curation for</p>
                                <h2 className="text-4xl font-black text-white italic tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>Ladiess</h2>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:bg-[#C8956C] transition-all duration-300">
                                <ArrowRight className="text-white w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="text-center py-8 px-6 opacity-30">
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">
                    Settings can be adjusted in your profile at any time
                </p>
            </footer>
        </div>
    );
}
