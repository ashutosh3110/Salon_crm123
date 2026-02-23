import { motion } from 'framer-motion';
import {
    Scissors,
    Sparkles,
    Brush,
    DraftingCompass as Comb,
    Droplet,
    Flower2 as Flower,
    Heart,
    Palette,
    Wand2 as Wand,
    Flame
} from 'lucide-react';

const FloatingIcon = ({ icon: Icon, delay, x, y, size = 40 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: [0, 0.45, 0.45, 0],
            scale: [0.8, 1.1, 1.1, 0.8],
            x: [0, 45, -45, 0],
            y: [0, -55, 55, 0],
        }}
        transition={{
            duration: 14,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut"
        }}
        className="absolute pointer-events-none text-white/40"
        style={{ left: x, top: y }}
    >
        <Icon size={size} strokeWidth={1.3} />
    </motion.div>
);

const backgroundIcons = [
    { icon: Scissors, x: '5%', y: '10%', delay: 0 },
    { icon: Sparkles, x: '92%', y: '15%', delay: 1.5 },
    { icon: Brush, x: '10%', y: '85%', delay: 3 },
    { icon: Comb, x: '88%', y: '80%', delay: 4.5 },
    { icon: Droplet, x: '50%', y: '8%', delay: 6 },
    { icon: Flower, x: '75%', y: '88%', delay: 7.5 },
    { icon: Heart, x: '25%', y: '20%', delay: 2, size: 35 },
    { icon: Palette, x: '82%', y: '65%', delay: 4, size: 30 },
    { icon: Wand, x: '35%', y: '75%', delay: 5.5, size: 28 },
    { icon: Flame, x: '85%', y: '42%', delay: 1, size: 32 },
    { icon: Scissors, x: '12%', y: '50%', delay: 3.5, size: 26 },
    { icon: Sparkles, x: '45%', y: '85%', delay: 8, size: 30 },
    { icon: Brush, x: '68%', y: '25%', delay: 10, size: 25 },
];

const offers = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
        className: 'w-48 h-64 rounded-full -rotate-12 translate-y-8',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800',
        className: 'w-56 h-72 rounded-t-full -mt-20 rotate-6',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
        className: 'w-44 h-60 rounded-full rotate-12 translate-x-12',
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=800',
        className: 'w-52 h-64 rounded-b-full -translate-y-12 -rotate-6',
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800',
        className: 'w-60 h-80 rounded-t-full rotate-3 translate-x-8',
    },
    {
        id: 6,
        image: 'https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=800',
        className: 'w-48 h-64 rounded-full -rotate-12 -translate-y-4',
    }
];

export default function SpecialOffers() {
    return (
        <section className="pt-0 pb-24 bg-[#4A1D28] relative overflow-hidden">
            {/* Background Decorative Icons */}
            {backgroundIcons.map((item, idx) => (
                <FloatingIcon key={idx} {...item} />
            ))}

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />

            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto mb-20 pt-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                        Special Beauty <span className="text-primary-light italic font-serif">Offers.</span>
                    </h2>
                    <p className="text-sm text-white/60 leading-relaxed font-medium mb-10 max-w-xl mx-auto">
                        Unlock radiant transformations with our Special Beauty Offers tailored packages designed to pamper, enhance, and elevate your natural beauty.
                    </p>
                    <button className="bg-[#D4A373] hover:bg-[#C08C5D] text-white px-10 py-4 rounded-lg font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-900/10 transition-all hover:scale-105 active:scale-95">
                        View Packages
                    </button>
                </motion.div>

                {/* Animated Image Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center mt-12 pb-10 px-4">
                    {offers.map((offer, index) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                            whileInView={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                transition: { delay: index * 0.1, duration: 0.8, ease: "easeOut" }
                            }}
                            whileHover={{
                                scale: 1.05,
                                rotate: index % 2 === 0 ? 5 : -5,
                                transition: { duration: 0.3 }
                            }}
                            viewport={{ once: true }}
                            className={`relative overflow-hidden shadow-2xl ${offer.className} border-4 border-white`}
                        >
                            <img
                                src={offer.image}
                                alt="Offer"
                                className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply opacity-0 hover:opacity-100 transition-opacity duration-500" />
                        </motion.div>
                    ))}
                </div>

                {/* Background Decorative Circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none -z-10" />
            </div>
        </section>
    );
}
