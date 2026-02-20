import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiCheck, HiOutlineReceiptTax, HiOutlineTruck, HiOutlineSparkles } from 'react-icons/hi';
import Button from '../ui/Button';

const PricingSection = () => {
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: "Basic",
            price: isAnnual ? "799" : "999",
            icon: HiOutlineReceiptTax,
            desc: "For small salons & individual stylists.",
            features: [
                "1 Outlet",
                "Up to 5 Staff Members",
                "500 WhatsApp Credits/mo",
                "Basic CRM & Client Management",
                "Standard POS Billing",
                "Email Support"
            ],
            color: "gray",
            cta: "Start Free Trial",
            popular: false
        },
        {
            name: "Professional",
            price: isAnnual ? "1999" : "2499",
            icon: HiOutlineSparkles,
            desc: "The perfect fit for growing salons.",
            features: [
                "Up to 3 Outlets",
                "Up to 15 Staff Members",
                "2,000 WhatsApp Credits/mo",
                "Full CRM + Client History",
                "POS + Inventory Management",
                "Analytics & Reporting",
                "Loyalty & Referrals",
                "Priority Chat Support"
            ],
            color: "primary",
            cta: "Start 14-Day Free Trial",
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            icon: HiOutlineTruck,
            desc: "Scale your beauty empire with us.",
            features: [
                "Unlimited Outlets",
                "Unlimited Staff Members",
                "Unlimited WhatsApp Credits",
                "Custom Module Development",
                "White-label Reports",
                "API Access",
                "Dedicated Account Manager",
                "On-site Training"
            ],
            color: "black",
            cta: "Contact Sales",
            popular: false
        }
    ];

    return (
        <section id="pricing" className="py-24 bg-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#E9E9E9] rounded-bl-[100px] -z-1" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 rounded-tr-[100px] -z-1" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-black mb-6">Simple, <span className="text-primary italic">Transparent</span> Pricing.</h2>
                        <p className="text-gray-500 max-w-xl mx-auto mb-10">Choose the plan that fits your salon's growth. No hidden fees, cancel anytime.</p>

                        {/* Toggle */}
                        <div className="flex items-center justify-center gap-4">
                            <span className={`text-sm font-bold ${!isAnnual ? 'text-black' : 'text-gray-400'}`}>Monthly</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className="w-14 h-8 rounded-full bg-gray-200 p-1 relative flex items-center transition-colors"
                            >
                                <motion.div
                                    animate={{ x: isAnnual ? 24 : 0 }}
                                    className="w-6 h-6 rounded-full bg-primary"
                                />
                            </button>
                            <span className={`text-sm font-bold ${isAnnual ? 'text-black' : 'text-gray-400'}`}>
                                Annual <span className="text-primary ml-1">(Save 20%)</span>
                            </span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative p-8 rounded-3xl border ${plan.popular
                                    ? 'bg-white border-primary border-2 shadow-2xl scale-105 z-10'
                                    : 'bg-[#E9E9E9]/40 border-gray-200'
                                } flex flex-col h-full hover-lift transition-all duration-300`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-6 rounded-full shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${plan.popular ? 'bg-primary/10 text-primary' : 'bg-white text-gray-500 shadow-sm border border-gray-100'
                                    }`}>
                                    <plan.icon className="w-6 h-6" />
                                </div>
                                <h4 className="text-2xl font-black text-black mb-2">{plan.name}</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">{plan.desc}</p>
                            </div>

                            <div className="mb-8 p-4 rounded-2xl bg-white/50 ring-1 ring-black/5">
                                <span className="text-4xl font-black text-black">
                                    {plan.price !== "Custom" ? `₹${plan.price}` : "Custom"}
                                </span>
                                {plan.price !== "Custom" && (
                                    <span className="text-gray-400 font-bold text-sm ml-1">/mo</span>
                                )}
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feat, j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            <HiCheck className="w-3 h-3" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-600">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                fullWidth
                                className={`rounded-xl h-14 font-bold ${plan.popular
                                        ? 'bg-primary text-white hover:bg-primary-dark border-none'
                                        : plan.name === "Enterprise"
                                            ? 'bg-black text-white hover:bg-gray-900 border-none'
                                            : 'bg-white text-black border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {plan.cta}
                            </Button>
                        </motion.div>
                    ))}
                </div>

                <p className="text-center mt-12 text-gray-400 text-sm font-semibold">
                    Pricing excludes 18% GST. All plans include 256-bit data encryption.
                </p>
            </div>
        </section>
    );
};

export default PricingSection;
