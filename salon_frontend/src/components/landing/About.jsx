import { Shield, Zap, Heart, Globe } from 'lucide-react';

const values = [
    {
        icon: Zap,
        title: 'Lightning Fast',
        desc: 'Optimized for speed so your reception never waits. POS billing in under 10 seconds.',
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        desc: 'Bank-grade encryption, role-based access, and complete data isolation per salon.',
    },
    {
        icon: Heart,
        title: 'Built for Salons',
        desc: 'Not a generic tool. Every feature is designed specifically for the beauty industry.',
    },
    {
        icon: Globe,
        title: 'Cloud Native',
        desc: 'Access from anywhere — desktop, tablet, or phone. No installations, no limits.',
    },
];

export default function About() {
    return (
        <section id="about" className="py-24 bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div>
                        <span className="text-sm font-semibold text-primary tracking-wide uppercase">
                            Why SalonCRM
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-text">
                            Built by Salon Experts,<br />
                            <span className="text-primary">For Salon Owners</span>
                        </h2>
                        <p className="mt-6 text-text-secondary leading-relaxed">
                            We understand the unique challenges of running a salon business. From managing
                            walk-ins to tracking product inventory, from retaining clients to growing revenue —
                            SalonCRM handles it all so you can focus on what you do best: making people look amazing.
                        </p>
                        <p className="mt-4 text-text-secondary leading-relaxed">
                            Trusted by 500+ salons across India, our platform processes over 50,000
                            appointments every month with 99.9% uptime.
                        </p>
                    </div>

                    {/* Right — Values Grid */}
                    <div className="grid sm:grid-cols-2 gap-5">
                        {values.map((value) => (
                            <div
                                key={value.title}
                                className="bg-white rounded-xl p-5 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                    <value.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-semibold text-text mb-1">{value.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
