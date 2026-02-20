import { motion } from 'framer-motion';
import {
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineCubeTransparent,
    HiOutlineUsers,
    HiOutlineSpeakerphone,
    HiOutlineChartBar
} from 'react-icons/hi';

const ProblemsSection = () => {
    const problems = [
        {
            icon: HiOutlineClipboardList,
            title: "Manual Registers",
            desc: "Still using notebooks? You're losing precious data and time tracking clients manually.",
            delay: 0.1
        },
        {
            icon: HiOutlineClock,
            title: "Missed Appointments",
            desc: "No-shows cost money. Without automated reminders, clients easily forget their slots.",
            delay: 0.2
        },
        {
            icon: HiOutlineCubeTransparent,
            title: "Inventory Stock Loss",
            desc: "Products go missing or expire. Hidden losses can eat up to 15% of your profits monthly.",
            delay: 0.3
        },
        {
            icon: HiOutlineUsers,
            title: "Staff Tracking Issues",
            desc: "Managing attendance and commissions manually leads to errors and staff frustration.",
            delay: 0.4
        },
        {
            icon: HiOutlineSpeakerphone,
            title: "Zero Marketing",
            desc: "New clients come but don't return because you have no way to reach them via WhatsApp.",
            delay: 0.5
        },
        {
            icon: HiOutlineChartBar,
            title: "No Growth Insights",
            desc: "Running a business without reports is like driving blind. You don't know your true profit.",
            delay: 0.6
        }
    ];

    return (
        <section id="problems" className="section-p bg-white">
            <div className="container-custom">
                <div className="max-w-4xl mb-20 px-4 md:px-0">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                            <span className="w-10 h-[2px] bg-primary"></span>
                            The Reality Check
                        </h2>
                        <h3 className="text-4xl md:text-7xl font-black text-black mb-8 leading-[1.1] tracking-tight">
                            Still Managing Your Salon <br />
                            the <span className="text-primary italic underline decoration-black/5 decoration-8 underline-offset-8">Old Way?</span>
                        </h3>
                        <p className="text-base md:text-xl text-gray-500 max-w-3xl leading-relaxed font-medium">
                            Paper registers, manual logs, and missed calls are silent killers of business growth.
                            It's time to digitize your operations and unlock professional efficiency.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {problems.map((prob, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: prob.delay, duration: 0.5 }}
                            className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-2 h-0 bg-primary group-hover:h-full transition-all duration-500" />

                            <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                <prob.icon className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                            </div>

                            <h4 className="text-xl font-bold text-black mb-3">{prob.title}</h4>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {prob.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemsSection;
