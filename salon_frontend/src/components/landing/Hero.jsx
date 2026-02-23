import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Sparkles,
    Calendar,
    CreditCard,
    Check,
    Star,
    Smartphone,
    BarChart3,
    Quote,
    Zap,
    Shield,
    Heart,
    Globe,
    Users,
    Layers,
    MapPin,
    Mail,
    Phone,
    Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDE_DURATION = 5000;

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 6);
        }, SLIDE_DURATION);
        return () => clearInterval(timer);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    const slideTransition = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.5, ease: "easeInOut" }
    };

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-[#FDF9F8]">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl opacity-60" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-3xl opacity-40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/5 opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/10" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left"
                    >


                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif italic text-text leading-tight tracking-tight">
                            Elevate Your <span className="text-primary not-italic font-black">Salon</span>
                            <span className="block text-primary/80 not-italic font-black mt-1">Smarter, Faster.</span>
                        </h1>

                        <p className="mt-6 text-sm text-text-secondary leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium opacity-80">
                            The ultimate toolkit for modern salon scaling. Manage appointments,
                            billing, and analytics with cinematic efficiency.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                to="/register"
                                className="px-8 py-3.5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-none shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                to="/#features"
                                className="px-8 py-3.5 bg-white text-primary font-black text-[10px] uppercase tracking-[0.2em] rounded-none border border-primary/20 shadow-lg shadow-black/5 hover:scale-105 transition-transform"
                            >
                                Learn More
                            </Link>
                        </div>

                        <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm mx-auto lg:mx-0 border-t border-black/5 pt-8">
                            {[
                                { value: '500+', label: 'Salons' },
                                { value: '50K+', label: 'Bookings' },
                                { value: '99.9%', label: 'Uptime' },
                            ].map((stat, idx) => (
                                <div key={stat.label}>
                                    <div className="text-xl font-black text-primary italic">{stat.value}</div>
                                    <div className="text-[9px] uppercase font-black tracking-widest text-text-muted mt-1 opacity-60">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right — Animated Feature Carousel Preview */}
                    <div className="relative min-h-[450px] md:min-h-[600px] flex items-center justify-center scale-100 md:scale-100 overflow-visible">

                        <AnimatePresence mode="wait">
                            {currentSlide === 0 && (
                                <motion.div key="dashboard" {...slideTransition} className="w-full">
                                    <DashboardPreview cardVariants={cardVariants} />
                                </motion.div>
                            )}
                            {currentSlide === 1 && (
                                <motion.div key="contact" {...slideTransition} className="w-full">
                                    <ContactPreview cardVariants={cardVariants} />
                                </motion.div>
                            )}
                            {currentSlide === 2 && (
                                <motion.div key="pricing" {...slideTransition} className="w-full">
                                    <PricingPreview cardVariants={cardVariants} />
                                </motion.div>
                            )}
                            {currentSlide === 3 && (
                                <motion.div key="testimonial" {...slideTransition} className="w-full">
                                    <TestimonialPreview cardVariants={cardVariants} />
                                </motion.div>
                            )}
                            {currentSlide === 4 && (
                                <motion.div key="features" {...slideTransition} className="w-full">
                                    <FeaturesTeaser cardVariants={cardVariants} />
                                </motion.div>
                            )}
                            {currentSlide === 5 && (
                                <motion.div key="showcase" {...slideTransition} className="w-full">
                                    <FeaturesShowcase cardVariants={cardVariants} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Slide Indicators */}
                        <div className="absolute -bottom-8 md:-bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3">
                            {[0, 1, 2, 3, 4, 5].map((idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-1 transition-all duration-500 rounded-full ${currentSlide === idx ? 'w-8 md:w-12 bg-primary' : 'w-2 md:w-4 bg-primary/20'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// --- Preview Sub-Components ---

function DashboardPreview({ cardVariants }) {
    return (
        <div className="relative w-full max-w-lg mx-auto">
            {/* Main Dashboard Card */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-black/5 p-8 space-y-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-text">Today's Overview</h3>
                        <p className="text-sm text-text-muted">Monday, Feb 21</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Bookings', value: '12' },
                        { label: 'Revenue', value: '₹24.5K' },
                        { label: 'Clients', value: '8 new' },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-[#F8F9FA] rounded-2xl p-4 text-center border border-black/5">
                            <div className="text-xl font-bold text-text">{item.value}</div>
                            <div className="text-[10px] uppercase font-bold text-text-muted mt-1 tracking-wider">{item.label}</div>
                        </div>
                    ))}
                </div>

                {/* Appointment List */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Upcoming</h4>
                    {[
                        { name: 'Priya S.', service: 'Hair Spa • Neha', time: '10:00 AM', color: 'bg-primary/10 text-primary' },
                        { name: 'Rahul M.', service: 'Haircut • Amit', time: '11:30 AM', color: 'bg-primary/10 text-primary' },
                    ].map((appt, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FA] border border-transparent hover:border-black/5 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full ${appt.color} flex items-center justify-center font-bold text-sm`}>
                                    {appt.name[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-text">{appt.name}</div>
                                    <div className="text-[11px] font-medium text-text-muted">{appt.service}</div>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-text-secondary bg-white px-3 py-1.5 rounded-full shadow-sm border border-black/5">
                                {appt.time}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Bill Card */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute -bottom-6 -left-4 md:-bottom-10 md:-left-10 bg-white rounded-2xl shadow-2xl border border-black/5 p-4 md:p-6 w-40 md:w-56 z-20"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Quick Bill</span>
                </div>
                <div className="text-3xl font-bold text-text mb-1">₹1,850</div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-[10px] font-bold text-success uppercase">Payment Received</span>
                </div>
            </motion.div>

            {/* Loyalty Card */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute -top-4 -right-4 md:-top-6 md:-right-10 bg-white rounded-2xl shadow-2xl border border-black/5 p-4 md:p-5 w-40 md:w-52 z-20"
            >
                <div className="text-[10px] font-bold uppercase text-text-muted mb-2 tracking-widest">Loyalty Points</div>
                <div className="text-2xl font-serif italic text-primary">2,450 pts</div>
                <div className="w-full bg-[#F8F9FA] h-2 rounded-full mt-4 overflow-hidden border border-black/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="bg-primary h-full rounded-full"
                    />
                </div>
            </motion.div>
        </div>
    );
}

function PricingPreview({ cardVariants }) {
    const plans = [
        {
            name: 'Free',
            price: '₹0',
            duration: 'forever',
            desc: 'Perfect to get started with a single salon.',
            features: ['2 Staff Members', '10 Products', '5 Services', '1 Outlet', 'Basic Booking', 'POS Billing'],
            button: 'Get Started',
            popular: false
        },
        {
            name: 'Basic',
            price: '₹1,499',
            duration: '/month',
            desc: 'For growing salons that need more power.',
            features: ['10 Staff Members', '100 Products', '50 Services', '2 Outlets', 'Analytics Dashboard', 'Loyalty Program', 'Promotions', 'Email Support'],
            button: 'Start Free Trial',
            popular: false
        },
        {
            name: 'Premium',
            price: '₹3,999',
            duration: '/month',
            desc: 'The most popular choice for established salons.',
            features: ['50 Staff Members', '1,000 Products', '500 Services', '10 Outlets', 'Advanced Analytics', 'HR & Payroll', 'WhatsApp Campaigns', 'Priority Support', 'Custom Branding'],
            button: 'Start Free Trial',
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            duration: '',
            desc: 'For salon chains with unlimited needs.',
            features: ['Unlimited Staff', 'Unlimited Products', 'Unlimited Services', 'Unlimited Outlets', 'Everything in Premium', 'Dedicated Account Manager', 'API Access', 'SLA Guarantee'],
            button: 'Contact Sales',
            popular: false
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:flex lg:items-start lg:justify-center gap-2 md:gap-4 w-full lg:w-[140%] lg:-ml-[20%] scale-100 lg:scale-[0.65] origin-top lg:origin-center py-2 md:py-10 px-2 lg:px-0">
            {plans.map((plan, idx) => (
                <motion.div
                    key={plan.name}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className={`relative bg-white rounded-2xl md:rounded-[2rem] p-3 md:p-6 shadow-xl flex flex-col ${plan.popular ? 'border-2 border-primary ring-4 ring-primary/5 z-10' : 'border border-black/5'
                        } ${idx === 2 ? 'col-span-2 sm:col-span-1 mx-auto w-1/2 sm:w-full md:w-[260px]' : 'w-full md:w-[260px]'}`}
                >
                    {plan.popular && (
                        <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 z-20">
                            <span className="bg-primary text-white text-[7px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest px-2 md:px-4 py-1 md:py-1.5 rounded-full md:rounded-xl shadow-lg shadow-primary/30 whitespace-nowrap box-border inline-block">
                                Most Popular
                            </span>
                        </div>
                    )}

                    <div className="mb-3 md:mb-6">
                        <h3 className="text-sm md:text-xl font-bold text-text mb-0.5 md:mb-1">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg md:text-3xl font-black text-text tracking-tighter">{plan.price}</span>
                            <span className="text-[10px] md:text-xs text-text-muted/60">{plan.duration}</span>
                        </div>
                        <p className="text-[9px] md:text-[11px] font-medium text-text-muted mt-1.5 md:mt-2 leading-tight">
                            {plan.desc}
                        </p>
                    </div>

                    <ul className="space-y-1 md:space-y-2 mb-4 md:mb-8 flex-grow">
                        {plan.features.map(f => (
                            <li key={f} className="flex items-start gap-1 md:gap-2">
                                <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary shrink-0 mt-0.5" />
                                <span className="text-[9px] md:text-[11px] font-medium text-text-secondary line-clamp-1">{f}</span>
                            </li>
                        ))}
                    </ul>

                    <button className={`w-full py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs transition-all ${plan.popular
                        ? 'bg-primary text-white shadow-xl shadow-primary/20'
                        : 'bg-white border border-primary/20 text-primary shadow-sm'
                        }`}>
                        {plan.button}
                    </button>
                </motion.div>
            ))}
        </div>
    );
}

function TestimonialPreview({ cardVariants }) {
    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-white px-8 pt-14 pb-10 rounded-xl shadow-[0_15px_40px_-12px_rgba(0,0,0,0.1)] border border-border/40 relative flex flex-col items-center text-center">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-[6px] border-[#FDF9F8] shadow-lg overflow-hidden">
                    <img
                        src="https://i.pravatar.cc/150?u=priya"
                        alt="Customer"
                        className="w-full h-full object-cover"
                    />
                </div>
                <p className="text-lg text-text leading-relaxed font-medium mb-6">
                    "Managing our salon became so much easier after switching to SalonCRM. The booking system is intuitive and our clients love the automated reminders."
                </p>
                <div className="w-16 h-px bg-primary/20 mb-6" />
                <h4 className="text-2xl font-normal text-primary" style={{ fontFamily: "'Dancing Script', cursive" }}>
                    Priya Sharma
                </h4>
                <div className="flex gap-1 mt-4">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-text text-text" />)}
                </div>
            </div>
        </motion.div>
    );
}

function FeaturesTeaser({ cardVariants }) {
    const features = [
        {
            icon: Zap,
            title: 'Lightning Fast',
            desc: 'Optimized for speed so your reception never waits. POS billing in under 10 seconds.',
            image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=800'
        },
        {
            icon: Shield,
            title: 'Enterprise Security',
            desc: 'Bank-grade encryption, role-based access, and complete data isolation per salon.',
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
        },
        {
            icon: Heart,
            title: 'Built for Salons',
            desc: 'Not a generic tool. Every feature is designed specifically for the beauty industry.',
            image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800'
        },
        {
            icon: Globe,
            title: 'Cloud Native',
            desc: 'Access from anywhere — desktop, tablet, or phone. No installations, no limits.',
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 w-full p-2">
            {features.map((feat, idx) => (
                <motion.div
                    key={feat.title}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="group relative h-64 bg-white rounded-none p-6 border border-black/5 overflow-hidden flex flex-col justify-end cursor-default shadow-xl"
                >
                    {/* Background Image Reveal */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={feat.image}
                            alt={feat.title}
                            className="w-full h-full object-cover grayscale scale-110 opacity-0 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-100 transition-all duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#4A1D28] via-[#4A1D28]/40 to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-500" />
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
                        <div className="mb-4 transition-all duration-500 group-hover:scale-110">
                            <feat.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-text mb-2 group-hover:text-white transition-colors duration-300">
                            {feat.title}
                        </h3>
                        <p className="text-[11px] font-medium text-text-secondary leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                            {feat.desc}
                        </p>
                    </div>

                    {/* Animated Accent Border */}
                    <div className="absolute bottom-0 left-0 h-1 bg-primary w-0 group-hover:w-full transition-all duration-700 ease-out" />
                </motion.div>
            ))}
        </div>
    );
}

function FeaturesShowcase({ cardVariants }) {
    const [index, setIndex] = useState(0);
    const showcases = [
        {
            title: 'CLIENT & CRM',
            icon: Users,
            image: 'https://images.unsplash.com/photo-1560066922-19e013624838?auto=format&fit=crop&q=80&w=800'
        },
        {
            title: 'POS & BILLING',
            icon: CreditCard,
            image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800'
        },
        {
            title: 'INVENTORY Management',
            icon: Layers,
            image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=800'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % showcases.length);
        }, 3500);
        return () => clearInterval(timer);
    }, [showcases.length]);

    return (
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full max-w-4xl mx-auto">
            {/* Left — Visual Showcase */}
            <div className="relative flex-1 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                        className="relative w-full h-[280px] md:h-[450px] rounded-t-full overflow-hidden shadow-2xl border-x border-t border-black/5"
                    >
                        <img
                            src={showcases[index].image}
                            alt={showcases[index].title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />

                        {/* Floating Label Card inside the image area */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[85%] bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center z-20 border border-black/5"
                        >
                            <div className="w-12 h-12 bg-[#B85C5C] rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-[#B85C5C]/20">
                                {(() => {
                                    const Icon = showcases[index].icon;
                                    return <Icon className="w-6 h-6 text-white" />;
                                })()}
                            </div>
                            <h3 className="text-sm font-black tracking-[0.15em] text-text uppercase">
                                {showcases[index].title}
                            </h3>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Right — Vertical Heading List */}
            <div className="flex flex-row md:flex-col gap-4 md:gap-8 w-full md:w-48 shrink-0 justify-center overflow-x-auto no-scrollbar py-2">
                {showcases.map((s, i) => (
                    <button
                        key={s.title}
                        onClick={() => setIndex(i)}
                        className="group text-left relative py-2 outline-none"
                    >
                        <span className={`block text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${index === i ? 'text-[#B85C5C] scale-105' : 'text-text-muted/40 group-hover:text-text-muted/60'
                            }`}>
                            {s.title.split(' ')[0]}
                            <span className="block text-[14px] mt-0.5">{s.title.split(' ').slice(1).join(' ')}</span>
                        </span>

                        {/* Active Line Indicator */}
                        {index === i && (
                            <motion.div
                                layoutId="activeFeature"
                                className="absolute -bottom-1 md:-bottom-auto md:-left-6 top-auto md:top-1/2 -translate-y-0 md:-translate-y-1/2 w-full md:w-1.5 h-0.5 md:h-full bg-[#B85C5C] rounded-full"
                            />
                        )}
                    </button>
                ))}

                {/* Many More Link */}
                <a
                    href="#features"
                    className="group text-left relative py-2 outline-none opacity-40 hover:opacity-100 transition-opacity"
                >
                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-primary">
                        And
                    </span>
                    <span className="block text-[14px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary mt-0.5">
                        MANY MORE...
                    </span>
                </a>
            </div>
        </div>
    );
}

function ContactPreview({ cardVariants }) {
    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[auto] md:min-h-[450px] border border-black/5"
        >
            {/* Left Content — Maroon Branding */}
            <div className="w-full md:w-[45%] bg-[#B85C5C] p-10 md:p-8 flex flex-col justify-center text-white relative overflow-hidden">
                <div className="relative z-10 space-y-8">
                    <h2 className="text-xl font-black uppercase tracking-[0.25em] mb-4 whitespace-nowrap">Contact Us</h2>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group cursor-default">
                            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-bold leading-none whitespace-nowrap">Ahmedabad, Gujarat, India</p>
                                <p className="text-[9px] uppercase font-bold tracking-widest opacity-60 mt-1 whitespace-nowrap">Main Business District</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group cursor-default">
                            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-bold leading-none lowercase whitespace-nowrap">hello@saloncrm.in</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group cursor-default">
                            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-bold leading-none whitespace-nowrap">+91 98765 43210</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-10 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Visual Flair */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Right Content — Form Simulation */}
            <div className="flex-1 p-10 bg-white flex flex-col justify-center">
                <div className="mb-8">
                    <h3 className="text-3xl font-serif italic text-[#B85C5C]">Get in Touch</h3>
                    <p className="text-[13px] text-text-secondary mt-1 font-medium">Feel free to drop us a line below!</p>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-black/5 text-text-secondary/40 text-[11px] font-bold">Your Name</div>
                        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-black/5 text-text-secondary/40 text-[11px] font-bold">Your Email</div>
                    </div>
                    <div className="bg-[#F8FAFC] p-4 h-20 md:h-24 rounded-xl border border-black/5 text-text-secondary/40 text-[11px] font-bold leading-relaxed">
                        Typing your message here...
                    </div>

                    <button className="w-fit flex items-center gap-3 px-8 py-3 bg-[#B85C5C] text-white rounded-none shadow-lg shadow-[#B85C5C]/20 hover:scale-105 transition-transform font-black text-[10px] uppercase tracking-[0.2em]">
                        <Send className="w-3 h-3" />
                        Send
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
