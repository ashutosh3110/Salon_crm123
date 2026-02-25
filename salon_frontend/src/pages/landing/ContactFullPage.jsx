import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Printer, Send } from 'lucide-react';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';

export default function ContactFullPage() {
    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#050505';
        return () => {
            document.body.style.backgroundColor = originalBg;
        };
    }, []);

    return (
        <div className="min-h-screen new-dark-theme flex flex-col pt-20 selection:bg-primary/30 selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <WapixoNavbar />

            <main className="flex-1 flex items-center justify-center p-4 py-20 lg:py-32">
                <div className="w-full max-w-5xl relative">

                    {/* Shadow Background Plate */}
                    <div className="absolute inset-0 bg-primary/5 shadow-[0_30px_100px_rgba(0,0,0,0.5)] rounded-none hidden lg:block translate-x-4 translate-y-4 -z-10" />

                    <div className="bg-[#0A0A0A] rounded-none shadow-2xl flex flex-col lg:flex-row overflow-visible min-h-[600px] border border-white/5">

                        {/* Left Info Panel - Overlapping Style */}
                        <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="lg:w-[40%] bg-primary text-white p-8 md:p-16 lg:-ml-12 lg:my-12 shadow-2xl flex flex-col justify-center relative z-20"
                        >
                            <h2 className="text-3xl font-black mb-12 tracking-tight uppercase italic">Contact <span className="text-white/40">Us.</span></h2>

                            <div className="space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-6 h-6 shrink-0 mt-1">
                                        <MapPin className="w-full h-full" strokeWidth={1} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Location</p>
                                        <p className="text-sm font-medium leading-relaxed">
                                            32, Avenue de New York<br />
                                            321994, New York, USA
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-6 h-6 shrink-0">
                                        <Mail className="w-full h-full" strokeWidth={1} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Email</p>
                                        <p className="text-sm font-medium">hello@saloncrm.in</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-6 h-6 shrink-0">
                                        <Phone className="w-full h-full" strokeWidth={1} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Direct Line</p>
                                        <p className="text-sm font-medium">+91 98765 43210</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 h-1 w-12 bg-white/20 rounded-full" />
                        </motion.div>

                        {/* Right Form Panel */}
                        <div className="flex-1 p-8 md:p-16 lg:p-20 bg-[#0A0A0A]">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase italic">Get in <span className="text-primary">Touch.</span></h1>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-12">Initialize communication sequence</p>

                                <form className="space-y-6">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            className="w-full bg-white/[0.02] border border-white/5 px-6 py-4 rounded-none text-sm font-medium focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-white/10 text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Your Email"
                                            className="w-full bg-white/[0.02] border border-white/5 px-6 py-4 rounded-none text-sm font-medium focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-white/10 text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            placeholder="Typing your message here..."
                                            rows={6}
                                            className="w-full bg-white/[0.02] border border-white/5 px-6 py-4 rounded-none text-sm font-medium focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-white/10 text-white outline-none resize-none"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02, backgroundColor: '#ffffff', color: '#000000' }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] px-12 py-4 rounded-none shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
                                    >
                                        <span>Send Transmission</span>
                                        <Send className="w-3 h-3" />
                                    </motion.button>
                                </form>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </main>

            <WapixoFooter />
        </div>
    );
}

