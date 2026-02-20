import { motion } from 'framer-motion';
import { HiStar } from 'react-icons/hi';

const TestimonialsSection = () => {
    const testimonials = [
        {
            name: "Priya Sharma",
            salon: "Luxe Beauty Studio",
            city: "Mumbai",
            text: "Wapixo transformed how we run our salon. Before, we were using registers. Now everything is digital, fast, and documented. My staff loves it!",
            avatar: "https://i.pravatar.cc/150?u=priya"
        },
        {
            name: "Rahul Verma",
            salon: "Gentlemen's Lounge",
            city: "Delhi",
            text: "The WhatsApp reminders alone have reduced our no-shows by 40%. It's like having a full-time assistant working for us 24/7.",
            avatar: "https://i.pravatar.cc/150?u=rahul"
        },
        {
            name: "Anita Patel",
            salon: "Glow Salon",
            city: "Ahmedabad",
            text: "I manage 3 outlets across the city from my home. Wapixo gives me real-time reports and absolute control over inventory. Highly recommended!",
            avatar: "https://i.pravatar.cc/150?u=anita"
        }
    ];

    return (
        <section className="section-p bg-gray-50 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <div className="container-custom relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary mb-6 text-center mx-auto w-fit">Wall of Love</h2>
                        <h3 className="text-4xl md:text-7xl font-black text-black mb-6 leading-[1.1] tracking-tight">
                            Trusted by <span className="text-primary italic">Salon Owners</span> <br />Across India.
                        </h3>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {testimonials.map((test, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            className="bg-white p-10 rounded-[40px] shadow-premium hover:shadow-2xl transition-all duration-500 relative group border border-gray-100"
                        >
                            <div className="flex gap-1.5 mb-8">
                                {[...Array(5)].map((_, j) => (
                                    <HiStar key={j} className="w-5 h-5 text-primary" />
                                ))}
                            </div>

                            <p className="text-xl font-bold text-black leading-relaxed mb-10 italic relative z-10">
                                "{test.text}"
                            </p>

                            <div className="flex items-center gap-5 border-t border-gray-100 pt-8">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex-shrink-0">
                                    <img src={test.avatar} alt={test.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-black text-black text-lg truncate">{test.name}</h4>
                                    <p className="text-xs text-gray-400 font-black uppercase tracking-widest truncate">{test.salon} • {test.city}</p>
                                </div>
                            </div>

                            <div className="absolute top-6 right-10 text-8xl font-serif text-black/5 select-none transition-colors group-hover:text-primary/10">"</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
