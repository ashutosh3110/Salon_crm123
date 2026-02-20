import { motion } from 'framer-motion';
import {
    HiOutlineUserGroup,
    HiOutlineCalendar,
    HiOutlineCreditCard,
    HiOutlineChatAlt2,
    HiOutlineHeart,
    HiOutlineDatabase,
    HiOutlineCurrencyRupee,
    HiOutlinePresentationChartLine,
    HiOutlineOfficeBuilding
} from 'react-icons/hi';

const FeaturesSection = () => {
    const features = [
        {
            icon: HiOutlineUserGroup,
            title: "CRM & Client History",
            desc: "Store complex client profiles, track preferences, and view visit history instantly.",
            delay: 0.05
        },
        {
            icon: HiOutlineCalendar,
            title: "Online Booking",
            desc: "24/7 calendar availability for clients. Reduce phone calls and fill your slots automatically.",
            delay: 0.1
        },
        {
            icon: HiOutlineCreditCard,
            title: "POS Billing",
            desc: "Generate professional invoices, handle splits, and support multiple payment methods.",
            delay: 0.15
        },
        {
            icon: HiOutlineChatAlt2,
            title: "WhatsApp Marketing",
            desc: "Send automated birthday wishes, appointment reminders, and promotional offers.",
            delay: 0.2
        },
        {
            icon: HiOutlineHeart,
            title: "Loyalty & Referrals",
            desc: "Run powerful reward programs that keep clients coming back and bringing friends.",
            delay: 0.25
        },
        {
            icon: HiOutlineDatabase,
            title: "Inventory Management",
            desc: "Track stock levels, set low-stock alerts, and manage supplier purchase orders.",
            delay: 0.3
        },
        {
            icon: HiOutlineCurrencyRupee,
            title: "Payroll & Commissions",
            desc: "Automatic commission calculation and simple payroll management for your staff.",
            delay: 0.35
        },
        {
            icon: HiOutlinePresentationChartLine,
            title: "Analytics & Reports",
            desc: "Detailed insights into revenue, top services, and staff performance at your fingertips.",
            delay: 0.4
        },
        {
            icon: HiOutlineOfficeBuilding,
            title: "Multi-Branch Support",
            desc: "Manage all your outlets from a single dashboard. Centralized control, decentralized profit.",
            delay: 0.45
        }
    ];

    return (
        <section id="features" className="section-p bg-white">
            <div className="container-custom">
                <div className="text-center max-w-4xl mx-auto mb-24 px-4 md:px-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary mb-6 underline decoration-primary/20 underline-offset-[12px] text-center mx-auto w-fit">Core Modules</h2>
                        <h3 className="text-4xl md:text-8xl font-black text-black mb-10 leading-[1.1] tracking-tight">
                            Everything to Scale <br />
                            Your <span className="text-primary italic">Beauty Empire.</span>
                        </h3>
                        <p className="text-base md:text-xl text-gray-500 leading-relaxed font-medium">
                            A robust suite of tools designed specifically for the beauty and wellness industry.
                            If your salon needs it, Wapixo has it.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: feature.delay }}
                            className="group p-10 rounded-[40px] bg-white border border-gray-100 hover:border-primary/20 transition-all duration-500 hover:shadow-premium relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-[20px] bg-gray-50 flex items-center justify-center mb-8 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500">
                                    <feature.icon className="w-8 h-8 text-black group-hover:text-primary transition-colors" />
                                </div>
                                <h4 className="text-xl font-black text-black mb-4 group-hover:text-primary transition-colors">{feature.title}</h4>
                                <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                            {/* Hover accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
