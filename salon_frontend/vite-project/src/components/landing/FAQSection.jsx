import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiMinus } from 'react-icons/hi';

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            q: "Is Wapixo cloud-based?",
            a: "Yes, Wapixo is 100% cloud-based. You can access your salon dashboard from any device with an internet connection — laptop, tablet, or phone."
        },
        {
            q: "Can I use it offline?",
            a: "Wapixo works best online to sync data in real-time. However, core billing features have an offline mode that syncs automatically as soon as your connection is back."
        },
        {
            q: "Do you provide a mobile app?",
            a: "Yes! We have dedicated apps for iOS and Android for salon owners to track daily performance and for staff to manage their schedules."
        },
        {
            q: "Is WhatsApp marketing included?",
            a: "WhatsApp appointment reminders and marketing campaigns are available in our Professional and Enterprise plans. It's the most effective way to engage clients."
        },
        {
            q: "Is my data safe and secure?",
            a: "Data security is our top priority. We use industry-standard 256-bit SSL encryption and perform daily backups on high-security Amazon AWS servers."
        },
        {
            q: "Is there a free trial available?",
            a: "Absolutely! You can start a 14-day full-access trial. No credit card required. Experience all features before you decide to subscribe."
        }
    ];

    const toggle = (i) => {
        setActiveIndex(activeIndex === i ? null : i);
    };

    return (
        <section id="faq" className="section-p bg-white">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary mb-6 text-center mx-auto w-fit">Help Center</h2>
                        <h3 className="text-4xl md:text-7xl font-black text-black leading-[1.1] tracking-tight">
                            Questions? <span className="text-primary italic">Answers.</span>
                        </h3>
                    </motion.div>
                </div>

                <div className="space-y-6">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={`rounded-[32px] overflow-hidden transition-all duration-500 border ${activeIndex === i
                                    ? 'bg-gray-50 border-primary/20 shadow-lg'
                                    : 'bg-white border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            <button
                                onClick={() => toggle(i)}
                                className="w-full flex items-center justify-between p-8 text-left outline-none"
                            >
                                <span className={`font-black text-xl md:text-2xl pr-8 transition-colors duration-300 ${activeIndex === i ? 'text-black' : 'text-gray-900'
                                    }`}>
                                    {faq.q}
                                </span>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${activeIndex === i
                                        ? 'bg-primary text-white rotate-180 shadow-lg shadow-primary/20'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {activeIndex === i ? <HiMinus className="w-6 h-6" /> : <HiPlus className="w-6 h-6" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {activeIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                    >
                                        <div className="px-8 pb-10 pt-0 text-gray-500 text-lg md:text-xl font-medium leading-relaxed border-t border-gray-100/50 mt-2 pt-6">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
