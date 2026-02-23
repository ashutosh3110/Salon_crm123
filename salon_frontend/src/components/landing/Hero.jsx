import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Calendar, CreditCard } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-secondary blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-secondary opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/10" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Cloud-Based Salon Management
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                            Run Your Salon
                            <span className="block text-primary mt-1">Smarter, Not Harder</span>
                        </h1>

                        <p className="mt-6 text-lg text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
                            All-in-one CRM platform to manage appointments, clients, billing,
                            inventory, staff, and grow your salon business — from anywhere.
                        </p>

                        {/* CTAs */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                to="/register"
                                className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base"
                            >
                                Get Started Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a
                                href="#features"
                                className="btn-secondary inline-flex items-center justify-center px-8 py-3.5 text-base"
                            >
                                Explore Features
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                            {[
                                { value: '500+', label: 'Salons' },
                                { value: '50K+', label: 'Appointments' },
                                { value: '99.9%', label: 'Uptime' },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <div className="text-2xl font-bold text-text">{stat.value}</div>
                                    <div className="text-sm text-text-muted">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Feature Cards */}
                    <div className="relative">
                        {/* Main Card */}
                        <div className="relative bg-white rounded-2xl shadow-xl border border-border p-6 space-y-4">
                            {/* Mini Dashboard Preview */}
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-text">Today's Overview</h3>
                                    <p className="text-sm text-text-muted">Monday, Feb 21</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Bookings', value: '12', color: 'bg-primary/10 text-primary' },
                                    { label: 'Revenue', value: '₹24.5K', color: 'bg-success/10 text-success' },
                                    { label: 'Clients', value: '8 new', color: 'bg-warning/10 text-warning' },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-xl bg-surface p-3 text-center">
                                        <div className={`text-lg font-bold`}>{item.value}</div>
                                        <div className="text-xs text-text-muted mt-0.5">{item.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Appointment List */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-text-secondary">Upcoming</h4>
                                {[
                                    { time: '10:00 AM', client: 'Priya S.', service: 'Hair Spa', stylist: 'Neha' },
                                    { time: '11:30 AM', client: 'Rahul M.', service: 'Haircut', stylist: 'Amit' },
                                    { time: '01:00 PM', client: 'Sneha K.', service: 'Facial', stylist: 'Neha' },
                                ].map((appt, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-alt transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                                {appt.client[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-text">{appt.client}</div>
                                                <div className="text-xs text-text-muted">{appt.service} • {appt.stylist}</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-text-secondary bg-secondary px-2 py-1 rounded-md">
                                            {appt.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Card — POS */}
                        <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg border border-border p-4 w-52 hidden lg:block">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">Quick Bill</span>
                            </div>
                            <div className="text-2xl font-bold text-text">₹1,850</div>
                            <div className="text-xs text-success font-medium mt-1">✓ Payment Received</div>
                        </div>

                        {/* Floating Card — Loyalty */}
                        <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-border p-4 w-48 hidden lg:block">
                            <div className="text-xs text-text-muted mb-1">Loyalty Points</div>
                            <div className="text-xl font-bold text-primary">2,450 pts</div>
                            <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
