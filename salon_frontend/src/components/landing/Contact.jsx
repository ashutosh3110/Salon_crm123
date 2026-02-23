import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you! We will get back to you within 24 hours.');
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    return (
        <section id="contact" className="py-24 bg-[#FDF9F8] relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 relative">

                {/* Visual Plate Background */}
                <div className="absolute inset-0 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.06)] rounded-none translate-x-3 translate-y-3 -z-10" />

                <div className="bg-white rounded-none flex flex-col lg:flex-row overflow-visible min-h-[550px] shadow-xl border border-black/5">

                    {/* Left Info Panel - Overlapping Theme Style */}
                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:w-[38%] bg-primary text-white p-10 md:p-14 lg:-ml-10 lg:my-10 shadow-2xl flex flex-col justify-center relative z-20"
                    >
                        <h2 className="text-2xl font-black mb-10 tracking-tight uppercase">Contact Us</h2>

                        <div className="space-y-8">
                            <div className="flex items-start gap-5">
                                <MapPin className="w-5 h-5 shrink-0 mt-1 opacity-80" />
                                <p className="text-sm font-medium leading-relaxed">
                                    Ahmedabad, Gujarat, India<br />
                                    Main Business District
                                </p>
                            </div>

                            <div className="flex items-center gap-5">
                                <Mail className="w-5 h-5 shrink-0 opacity-80" />
                                <p className="text-sm font-medium">hello@saloncrm.in</p>
                            </div>

                            <div className="flex items-center gap-5">
                                <Phone className="w-5 h-5 shrink-0 opacity-80" />
                                <p className="text-sm font-medium">+91 98765 43210</p>
                            </div>
                        </div>

                        {/* Aesthetic Divider */}
                        <div className="mt-12 w-12 h-1 bg-white/20" />
                    </motion.div>

                    {/* Right Form Panel */}
                    <div className="flex-1 p-8 md:p-12 lg:p-16 bg-white">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-4xl font-serif italic text-primary mb-2">Get in Touch</h1>
                            <p className="text-text-secondary text-sm font-medium mb-10">Feel free to drop us a line below!</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-[#f8fafc] border-none px-6 py-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Your Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-[#f8fafc] border-none px-6 py-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                                    />
                                </div>

                                <textarea
                                    name="message"
                                    placeholder="Typing your message here..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full bg-[#f8fafc] border-none px-6 py-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 resize-none"
                                />

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="bg-primary text-white font-black text-xs uppercase tracking-[0.2em] px-12 py-4 rounded-full shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
                                >
                                    <Send className="w-3 h-3" />
                                    Send
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
