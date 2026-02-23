import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { motion } from 'framer-motion';
import { Plus, Star, Clock, MapPin, Phone, ChevronRight, Sparkles, Gift, ArrowRight, Calendar } from 'lucide-react';
import { MOCK_SERVICES, MOCK_BOOKINGS, MOCK_OUTLET, MOCK_PROMOTIONS, MOCK_LOYALTY_WALLET } from '../../data/appMockData';

export default function AppHomePage() {
    const { customer } = useCustomerAuth();
    const navigate = useNavigate();

    // TODO: Replace with api.get('/bookings?clientId=...&status=pending,confirmed')
    const upcomingBooking = MOCK_BOOKINGS.find(b => ['pending', 'confirmed'].includes(b.status) && new Date(b.appointmentDate) > new Date());

    // TODO: Replace with api.get('/services?status=active&limit=4')
    const featuredServices = MOCK_SERVICES.slice(0, 4);

    // TODO: Replace with api.get('/promotions?isActive=true')
    const activePromos = MOCK_PROMOTIONS.filter(p => p.isActive);

    // TODO: Replace with api.get('/loyalty/wallet/:customerId')
    const loyaltyPoints = MOCK_LOYALTY_WALLET.totalPoints;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
    const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 pb-10">
            {/* Hero & Quick Actions Group */}
            <div className="space-y-4">
                {/* Quick Book CTA */}
                <motion.div
                    variants={fadeUp}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/app/book')}
                    className="bg-gradient-to-br from-primary via-primary to-primary-dark rounded-3xl p-6 text-white cursor-pointer relative overflow-hidden shadow-xl shadow-primary/20"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-12 translate-x-12 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-8 blur-xl" />

                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Plus className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/90">Quick Booking</span>
                        </div>
                        <h3 className="text-2xl font-extrabold leading-tight tracking-tight">Ready for a<br />new look?</h3>
                        <p className="text-white/70 text-sm mt-2 max-w-[180px] leading-relaxed">Book elite grooming services in seconds.</p>

                        <div className="flex items-center gap-2 mt-5 bg-white/20 backdrop-blur-md w-fit pl-4 pr-3 py-2 rounded-xl text-xs font-bold border border-white/10">
                            Book Now <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </motion.div>

                {/* Loyalty Mini Strip */}
                <motion.div
                    variants={fadeUp}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/app/loyalty')}
                    className="bg-surface rounded-2xl border border-border/40 p-4 flex items-center justify-between cursor-pointer active:bg-surface-alt transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Loyalty Rewards</p>
                            <p className="text-base font-extrabold text-text">{loyaltyPoints} <span className="text-[10px] font-bold text-text-muted">POINTS</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-alt border border-border/60">
                        <span className="text-[10px] font-bold text-primary">REDEEM</span>
                        <ChevronRight className="w-3 h-3 text-primary" />
                    </div>
                </motion.div>
            </div>

            {/* Upcoming Appointment */}
            {upcomingBooking && (
                <motion.div variants={fadeUp} className="space-y-3">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] px-1">Upcoming</h3>
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/app/bookings')}
                        className="bg-surface rounded-3xl border border-border/40 p-5 shadow-sm active:bg-surface-alt transition-all relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${upcomingBooking.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {upcomingBooking.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-base font-extrabold text-text leading-tight">{upcomingBooking.service?.name}</h4>
                                <p className="text-xs text-text-muted font-medium mt-0.5">with {upcomingBooking.staff?.name}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4 text-text-muted" />
                                </div>
                                <span className="text-xs font-bold text-text-secondary">{formatDate(upcomingBooking.appointmentDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4 text-text-muted" />
                                </div>
                                <span className="text-xs font-bold text-text-secondary">{formatTime(upcomingBooking.appointmentDate)}</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Active Promotions */}
            {activePromos.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-4">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] px-1">Exclusive Offers</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4">
                        {activePromos.map((promo, i) => (
                            <motion.div
                                key={promo._id}
                                className="flex-shrink-0 w-[280px] bg-surface-alt rounded-3xl border border-border/40 p-5 relative overflow-hidden group"
                            >
                                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                        {promo.type === 'PERCENTAGE' ? `${promo.value}% SAVINGS` : `₹${promo.value} OFF`}
                                    </span>
                                </div>
                                <h4 className="text-lg font-extrabold text-text leading-tight">{promo.name}</h4>
                                <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">{promo.description}</p>

                                {promo.couponCode && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="px-3 py-1.5 rounded-lg border border-dashed border-primary/30 bg-primary/5">
                                            <span className="text-xs font-bold text-primary tracking-widest">{promo.couponCode}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-text-muted flex items-center gap-1 uppercase">TAP TO COPY <ArrowRight className="w-3 h-3" /></span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Popular Services Section */}
            <motion.div variants={fadeUp} className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em]">Popular Services</h3>
                    <button onClick={() => navigate('/app/services')} className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors uppercase tracking-wider">
                        Explore All
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {featuredServices.map((service, i) => (
                        <motion.div
                            key={service._id}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => navigate(`/app/book?serviceId=${service._id}`)}
                            className="bg-surface rounded-3xl border border-border/40 p-4 cursor-pointer hover:border-primary/30 transition-all shadow-sm group"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-surface-alt flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                                <Sparkles className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
                            </div>
                            <h4 className="text-sm font-extrabold text-text line-clamp-1">{service.name}</h4>
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-base font-extrabold text-primary">₹{service.price}</span>
                                <div className="w-6 h-6 rounded-lg bg-surface-alt flex items-center justify-center">
                                    <ChevronRight className="w-4 h-4 text-text-muted" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Minimal Footer / Salon Info */}
            <motion.div variants={fadeUp} className="bg-surface-alt rounded-3xl p-6 space-y-5 border border-border/20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-surface flex items-center justify-center shadow-sm">
                        <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-text">Our Location</h3>
                        <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{MOCK_OUTLET.address}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/10">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-text-muted" />
                        <span className="text-[10px] font-bold text-text-secondary uppercase">Open Now</span>
                    </div>
                    <a href={`tel:${MOCK_OUTLET.phone}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">
                        <Phone className="w-3.5 h-3.5" /> Call Us
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
}
