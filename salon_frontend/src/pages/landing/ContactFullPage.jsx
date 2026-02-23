import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Printer, Send } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

export default function ContactFullPage() {
    return (
        <div className="min-h-screen bg-[#FDF9F8] flex flex-col pt-20">
            <Navbar />

            <main className="flex-1 flex items-center justify-center p-4 py-20 lg:py-32">
                <div className="w-full max-w-5xl relative">

                    {/* Shadow Background Plate */}
                    <div className="absolute inset-0 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.1)] rounded-none translate-x-4 translate-y-4 -z-10" />

                    <div className="bg-white rounded-none shadow-2xl flex flex-col lg:flex-row overflow-visible min-h-[600px]">

                        {/* Left Info Panel - Overlapping Style */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="lg:w-[40%] bg-primary text-white p-10 md:p-16 lg:-ml-12 lg:my-12 shadow-2xl flex flex-col justify-center relative z-20"
                        >
                            <h2 className="text-3xl font-black mb-12 tracking-tight">Contact Us</h2>

                            <div className="space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-6 h-6 shrink-0 mt-1">
                                        <MapPin className="w-full h-full" />
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed">
                                        32, Avenue de New York<br />
                                        321994, New York, USA
                                    </p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-6 h-6 shrink-0">
                                        <Mail className="w-full h-full" />
                                    </div>
                                    <p className="text-sm font-medium">hello@saloncrm.in</p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-6 h-6 shrink-0">
                                        <Phone className="w-full h-full" />
                                    </div>
                                    <p className="text-sm font-medium">+91 98765 43210</p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-6 h-6 shrink-0">
                                        <Printer className="w-full h-full" />
                                    </div>
                                    <p className="text-sm font-medium">+91 98765 43211</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Form Panel */}
                        <div className="flex-1 p-10 md:p-16 lg:p-20 bg-white">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h1 className="text-4xl font-black text-[#1e293b] mb-2 tracking-tight italic">Get in Touch</h1>
                                <p className="text-text-secondary text-sm font-medium mb-12">Feel free to drop us a line below!</p>

                                <form className="space-y-6">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            className="w-full bg-[#f8fafc] border-none px-6 py-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Your Email"
                                            className="w-full bg-[#f8fafc] border-none px-6 py-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            placeholder="Typing your message here..."
                                            rows={6}
                                            className="w-full bg-[#f8fafc] border-none px-6 py-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 resize-none"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02, backgroundColor: '#B85C5C' }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-primary text-white font-black text-xs uppercase tracking-[0.2em] px-12 py-4 rounded-full shadow-lg shadow-primary/20 transition-all"
                                    >
                                        Send
                                    </motion.button>
                                </form>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
