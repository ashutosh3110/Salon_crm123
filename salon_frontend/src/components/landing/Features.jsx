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

const features = [
    {
        icon: Users,
        title: 'Client & CRM',
        desc: 'Complete client profiles, visit history, preferences, tags, and non-returning customer detection.',
    },
    {
        icon: CalendarCheck,
        title: 'Booking & Scheduling',
        desc: 'Calendar view, staff allocation, walk-in queue, and automated WhatsApp/SMS reminders.',
    },
    {
        icon: CreditCard,
        title: 'POS & Billing',
        desc: 'Fast reception billing with packages, discounts, gift vouchers, and split payments.',
    },
    {
        icon: Gift,
        title: 'Loyalty & Referrals',
        desc: 'Points earn/redeem system, referral tracking, discount combos, and bundled offerings.',
    },
    {
        icon: Package,
        title: 'Inventory Management',
        desc: 'Barcode support, outlet-wise stock tracking, low-stock alerts, and audit tools.',
    },
    {
        icon: BarChart3,
        title: 'Analytics & Reports',
        desc: 'Revenue, profit, employee, outlet-wise analytics with automated day-end reports.',
    },
    {
        icon: UserPlus,
        title: 'HR & Payroll',
        desc: 'Attendance, shifts, commissions, targets, automated payroll, and performance tracking.',
    },
    {
        icon: Store,
        title: 'Multi-Outlet',
        desc: 'Manage multiple salon branches from a single dashboard with outlet-level controls.',
    },
    {
        icon: Bell,
        title: 'Automation',
        desc: 'Automated reminders, due-payment alerts, and template-based messaging workflows.',
    },
    {
        icon: Megaphone,
        title: 'Marketing',
        desc: 'WhatsApp campaigns, email newsletters, social media sharing of offers and bookings.',
    },
    {
        icon: ShieldCheck,
        title: 'Role-Based Access',
        desc: '8 user roles from Owner to Stylist with granular feature-level permissions.',
    },
    {
        icon: Layers,
        title: 'Retail Sales',
        desc: 'In-salon product sales with POS integration, auto stock sync, and combined invoicing.',
    },
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-sm font-semibold text-primary tracking-wide uppercase">
                        Everything You Need
                    </span>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-text">
                        Powerful Features for Modern Salons
                    </h2>
                    <p className="mt-4 text-text-secondary leading-relaxed">
                        From appointment booking to payroll, SalonCRM covers every aspect of your salon operations in one unified platform.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group bg-white rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-default"
                        >
                            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:shadow-md transition-all duration-300">
                                <feature.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="font-semibold text-text text-base mb-2">{feature.title}</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
