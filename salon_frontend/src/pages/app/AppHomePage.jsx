import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { motion } from 'framer-motion';
import { CalendarPlus, Star, Clock, MapPin, Phone, ChevronRight, Sparkles, Gift, ArrowRight } from 'lucide-react';
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
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
            {/* Quick Book CTA */}
            <motion.div
                variants={fadeUp}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/app/book')}
                className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-5 text-white cursor-pointer relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-4" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarPlus className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">Quick Book</span>
                    </div>
                    <h3 className="text-lg font-extrabold leading-tight">Book your next<br />appointment</h3>
                    <p className="text-white/60 text-xs mt-1.5">Choose from 12+ premium services</p>
                    <div className="flex items-center gap-1.5 mt-3 text-sm font-bold">
                        Book Now <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </motion.div>

            {/* Loyalty Points Strip */}
            <motion.div
                variants={fadeUp}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/app/loyalty')}
                className="bg-white rounded-2xl border border-border/60 p-4 flex items-center justify-between cursor-pointer hover:shadow-sm transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Star className="w-5.5 h-5.5 text-amber-500" fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-[11px] text-text-muted font-medium">Loyalty Points</p>
                        <p className="text-lg font-extrabold text-text">{loyaltyPoints} <span className="text-xs font-medium text-text-muted">pts</span></p>
                    </div>
                </div>
                <ChevronRight className="w-4.5 h-4.5 text-text-muted" />
            </motion.div>

            {/* Upcoming Appointment */}
            {upcomingBooking && (
                <motion.div variants={fadeUp}>
                    <h3 className="text-sm font-bold text-text mb-2.5 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" /> Upcoming
                    </h3>
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/app/bookings')}
                        className="bg-white rounded-2xl border border-border/60 p-4 cursor-pointer hover:shadow-sm transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-text">{upcomingBooking.service?.name}</h4>
                                <p className="text-xs text-text-muted mt-0.5">with {upcomingBooking.staff?.name}</p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg ${upcomingBooking.status === 'confirmed' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                {upcomingBooking.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
                            <span className="text-xs font-semibold text-text-secondary">
                                📅 {formatDate(upcomingBooking.appointmentDate)}
                            </span>
                            <span className="text-xs font-semibold text-text-secondary">
                                🕐 {formatTime(upcomingBooking.appointmentDate)}
                            </span>
                            <span className="text-xs font-semibold text-text-secondary">
                                ⏱️ {upcomingBooking.duration} min
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Active Promotions */}
            {activePromos.length > 0 && (
                <motion.div variants={fadeUp}>
                    <h3 className="text-sm font-bold text-text mb-2.5 flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-primary" /> Offers for You
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                        {activePromos.map((promo, i) => (
                            <motion.div
                                key={promo._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="flex-shrink-0 w-[260px] bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/10 p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                        {promo.type === 'PERCENTAGE' ? `${promo.value}% Off` : `₹${promo.value} Off`}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-text">{promo.name}</h4>
                                <p className="text-xs text-text-muted mt-1 line-clamp-2">{promo.description}</p>
                                {promo.couponCode && (
                                    <div className="mt-2.5 bg-white/80 rounded-lg px-3 py-1.5 border border-dashed border-primary/30 text-center">
                                        <span className="text-xs font-bold text-primary tracking-widest">{promo.couponCode}</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Featured Services */}
            <motion.div variants={fadeUp}>
                <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-sm font-bold text-text">Popular Services</h3>
                    <button onClick={() => navigate('/app/services')} className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                        View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                    {featuredServices.map((service, i) => (
                        <motion.div
                            key={service._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + i * 0.06 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => navigate(`/app/book?serviceId=${service._id}`)}
                            className="bg-white rounded-xl border border-border/60 p-3 cursor-pointer hover:shadow-sm transition-all"
                        >
                            <p className="text-xs font-bold text-text truncate">{service.name}</p>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-extrabold text-primary">₹{service.price.toLocaleString()}</span>
                                <span className="text-[10px] text-text-muted font-medium">{service.duration}m</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Salon Info */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-border/60 p-4 space-y-3">
                <h3 className="text-sm font-bold text-text">Visit Us</h3>
                <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-text-secondary leading-relaxed">{MOCK_OUTLET.address}</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <a href={`tel:${MOCK_OUTLET.phone}`} className="text-xs text-primary font-semibold">{MOCK_OUTLET.phone}</a>
                </div>
                <div className="pt-2 border-t border-border/40">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Working Hours</p>
                    <div className="space-y-1">
                        {MOCK_OUTLET.workingHours.filter(d => d.isOpen).slice(0, 3).map(d => (
                            <div key={d.day} className="flex justify-between text-xs text-text-secondary">
                                <span className="font-medium">{d.day}</span>
                                <span>{d.openTime} – {d.closeTime}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
