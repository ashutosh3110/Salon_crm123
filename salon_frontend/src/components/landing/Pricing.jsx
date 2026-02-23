import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
    {
        name: 'Free',
        price: '₹0',
        period: 'forever',
        desc: 'Perfect to get started with a single salon.',
        features: [
            '2 Staff Members',
            '10 Products',
            '5 Services',
            '1 Outlet',
            'Basic Booking',
            'POS Billing',
        ],
        cta: 'Get Started',
        popular: false,
    },
    {
        name: 'Basic',
        price: '₹1,499',
        period: '/month',
        desc: 'For growing salons that need more power.',
        features: [
            '10 Staff Members',
            '100 Products',
            '50 Services',
            '2 Outlets',
            'Analytics Dashboard',
            'Loyalty Program',
            'Promotions',
            'Email Support',
        ],
        cta: 'Start Free Trial',
        popular: false,
    },
    {
        name: 'Premium',
        price: '₹3,999',
        period: '/month',
        desc: 'The most popular choice for established salons.',
        features: [
            '50 Staff Members',
            '1,000 Products',
            '500 Services',
            '10 Outlets',
            'Advanced Analytics',
            'HR & Payroll',
            'WhatsApp Campaigns',
            'Priority Support',
            'Custom Branding',
        ],
        cta: 'Start Free Trial',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        desc: 'For salon chains with unlimited needs.',
        features: [
            'Unlimited Staff',
            'Unlimited Products',
            'Unlimited Services',
            'Unlimited Outlets',
            'Everything in Premium',
            'Dedicated Account Manager',
            'API Access',
            'SLA Guarantee',
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-text">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                        Start free and scale as you grow. No hidden fees, no surprises.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-xl p-5 border transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] ${plan.popular
                                ? 'bg-white border-primary shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] scale-[1.01]'
                                : 'bg-white border-border shadow-md hover:border-primary/30'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-base font-bold text-text">{plan.name}</h3>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-2xl font-extrabold text-text">{plan.price}</span>
                                    {plan.period && (
                                        <span className="text-xs text-text-muted">{plan.period}</span>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-text-secondary line-clamp-2">{plan.desc}</p>
                            </div>

                            <ul className="space-y-2 mb-6">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-[13px] text-text-secondary">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/register"
                                className={`block text-center w-full py-2 rounded-lg font-bold text-xs transition-all duration-200 ${plan.popular
                                    ? 'btn-primary shadow-lg shadow-primary/20'
                                    : 'border-2 border-primary/20 text-primary hover:border-primary hover:bg-primary/5'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
