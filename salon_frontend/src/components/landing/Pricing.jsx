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
        <section id="pricing" className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-sm font-semibold text-primary tracking-wide uppercase">
                        Pricing Plans
                    </span>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-text">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="mt-4 text-text-secondary leading-relaxed">
                        Start free and scale as you grow. No hidden fees, no surprises.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${plan.popular
                                    ? 'bg-white border-primary shadow-lg scale-[1.02]'
                                    : 'bg-white border-border hover:border-primary/30'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-text">{plan.name}</h3>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-3xl font-extrabold text-text">{plan.price}</span>
                                    {plan.period && (
                                        <span className="text-sm text-text-muted">{plan.period}</span>
                                    )}
                                </div>
                                <p className="mt-2 text-sm text-text-secondary">{plan.desc}</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <span className="text-sm text-text-secondary">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/register"
                                className={`block text-center w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${plan.popular
                                        ? 'btn-primary'
                                        : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
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
