import {
    Users,
    CalendarCheck,
    CreditCard,
    Package,
    BarChart3,
    Gift,
    Bell,
    Store,
    Megaphone,
    ShieldCheck,
    UserPlus,
    Layers,
} from 'lucide-react';
import siteData from '../../data/data.json';

// Icon Mapping for JSON data
const IconMap = {
    Users,
    CalendarCheck,
    CreditCard,
    Package,
    BarChart3,
    Gift,
    Bell,
    Store,
    Megaphone,
    ShieldCheck,
    UserPlus,
    Layers,
};

export default function Features() {
    return (
        <section id="features" className="py-24 bg-[#FDF9F8] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] translate-y-1/3" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#B85C5C 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                        The Unified Solution
                    </span>
                    <h2 className="mt-6 text-4xl sm:text-5xl font-black text-text mb-6 tracking-tight">
                        Grow Your <span className="text-primary italic">Business.</span>
                    </h2>
                    <div className="w-16 h-1 w-primary bg-primary/20 mx-auto rounded-full mb-6" />
                    <p className="text-sm text-text-secondary leading-relaxed font-medium">
                        The ultimate toolkit for modern salon scaling. Everything you need to manage your salon efficiently and grow your brand.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {siteData.features.map((feature) => {
                        const Icon = IconMap[feature.icon] || Layers;
                        return (
                            <div
                                key={feature.id}
                                className="group h-[320px] [perspective:1500px]"
                            >
                                <div className="relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

                                    {/* Front Side */}
                                    <div className="absolute inset-0 bg-transparent [backface-visibility:hidden] flex flex-col">
                                        {/* Arched Image Container */}
                                        <div className="relative flex-1 rounded-t-[80px] overflow-hidden border border-primary/10">
                                            <img
                                                src={feature.image}
                                                alt={feature.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        </div>

                                        {/* Title Box */}
                                        <div className="relative -mt-10 mx-5 bg-white backdrop-blur-xl border border-white rounded-2xl p-4 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 group-hover:shadow-[0_15px_50px_-12px_rgba(0,0,0,0.15)] group-hover:-translate-y-1 text-center z-10">
                                            <div className="flex items-center justify-center gap-2.5 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:rotate-[360deg]">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <h3 className="font-extrabold text-text text-[12px] uppercase tracking-wider">{feature.title}</h3>
                                            </div>
                                            <div className="relative mx-auto w-12 h-1 bg-primary/10 rounded-full overflow-hidden">
                                                <div className="absolute inset-0 w-0 group-hover:w-full bg-primary transition-all duration-700 ease-out" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div className="absolute inset-0 h-full w-full rounded-[30px] bg-primary p-6 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center text-center shadow-xl overflow-hidden">
                                        <div className="absolute -top-4 -right-4 p-4 opacity-5">
                                            <Icon className="w-24 h-24" />
                                        </div>

                                        <Icon className="w-8 h-8 mb-4 bg-white/20 p-1.5 rounded-lg" />
                                        <h3 className="font-bold text-sm mb-2 uppercase tracking-wide px-2 leading-tight">{feature.title}</h3>
                                        <p className="text-[12px] font-medium leading-relaxed opacity-90 px-2 line-clamp-4">
                                            {feature.desc}
                                        </p>

                                        <div className="mt-5 pt-4 border-t border-white/10 w-full flex flex-col items-center gap-1">
                                            <div className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-60">SalonCRM Tech</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
