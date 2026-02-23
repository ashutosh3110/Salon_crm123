import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import siteData from '../../data/data.json';

export default function FeatureGallery() {
    const navigate = useNavigate();

    return (
        <section className="py-24 bg-surface/30 px-4">
            <div className="max-w-7xl mx-auto md:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
                    <h2 className="text-2xl md:text-5xl font-black text-text mb-4 md:mb-6 leading-tight">
                        Experience the <span className="text-primary italic">Power</span> of SalonCRM
                    </h2>
                    <p className="text-[13px] md:text-sm text-text-secondary font-medium opacity-80 max-w-2xl mx-auto">
                        Explore our comprehensive suite of tools designed to streamline every aspect of your salon operations.
                    </p>
                </div>

                {/* Bento Grid Gallery */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 auto-rows-[120px] md:auto-rows-[250px] grid-flow-dense">
                    {siteData.features.slice(0, 12).map((feature, index) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`group relative overflow-hidden rounded-none shadow-lg ${index === 0 ? 'col-span-2 row-span-2' :
                                index === 3 ? 'md:row-span-2' :
                                    index === 5 ? 'col-span-2' :
                                        index === 7 ? 'col-span-2' :
                                            index === 9 ? 'md:row-span-2' :
                                                index === 10 ? 'col-span-2' : ''
                                }`}
                        >
                            <img
                                src={feature.image}
                                alt={feature.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 left-0 p-3 md:p-6">
                                    <h3 className="text-[10px] md:text-lg font-black text-white mb-0.5 md:mb-1 uppercase tracking-wider">{feature.title}</h3>
                                    <p className="text-white/70 text-[8px] md:text-xs hidden md:group-hover:block md:line-clamp-2 transition-all duration-300">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Sparkle for Premium Feel */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="w-8 h-8 rounded-none bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                    <div className="w-2 h-2 bg-white rounded-none animate-ping" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA at the bottom of the section */}
                <div className="mt-10 md:mt-16 text-center">
                    <motion.button
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 0 20px rgba(184, 92, 92, 0.4), 0 0 40px rgba(184, 92, 92, 0.2)",
                            backgroundColor: "rgba(184, 92, 92, 0.05)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/register')}
                        className="relative px-8 md:px-12 py-3.5 md:py-4 bg-transparent text-primary rounded-full font-black tracking-[0.2em] text-[10px] md:text-xs uppercase border-2 border-primary shadow-[0_0_15px_rgba(184, 92, 92, 0.1)] transition-all duration-300"
                    >
                        START YOUR JOURNEY TODAY
                        {/* Static Subtle Reflection */}
                        <div className="absolute inset-0 rounded-full border border-primary/10 pointer-events-none" />
                    </motion.button>
                </div>
            </div>
        </section>
    );
}
