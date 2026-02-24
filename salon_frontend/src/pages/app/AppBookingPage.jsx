import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import StepIndicator from '../../components/app/StepIndicator';
import { MOCK_SERVICES, MOCK_STAFF, MOCK_OUTLET, generateTimeSlots } from '../../data/appMockData';

const STEPS = ['Service', 'Date & Time', 'Stylist', 'Confirm'];

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function AppBookingPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const preSelectedServiceId = searchParams.get('serviceId');

    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [serviceSearch, setServiceSearch] = useState('');

    // Pre-select service from query
    useEffect(() => {
        if (preSelectedServiceId) {
            const svc = MOCK_SERVICES.find(s => s._id === preSelectedServiceId);
            if (svc) {
                setSelectedService(svc);
                setStep(1);
            }
        }
    }, [preSelectedServiceId]);

    // TODO: Replace with api.get('/services?status=active')
    const services = MOCK_SERVICES;

    // TODO: Replace with api.get('/users?role=stylist')
    const staff = MOCK_STAFF;

    const goTo = (newStep) => {
        setDirection(newStep > step ? 1 : -1);
        setStep(newStep);
    };

    // Generate next 14 days
    const dateOptions = useMemo(() => {
        const dates = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            const dayHours = MOCK_OUTLET.workingHours.find(wh => wh.day === dayName);
            dates.push({
                date: new Date(d),
                label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
                dayNum: d.getDate(),
                month: d.toLocaleDateString('en-IN', { month: 'short' }),
                isOpen: dayHours?.isOpen ?? false,
                isToday: i === 0,
            });
        }
        return dates;
    }, []);

    // Generate time slots for selected date
    const timeSlots = useMemo(() => {
        if (!selectedDate) return [];
        const dayName = selectedDate.date.toLocaleDateString('en-US', { weekday: 'long' });
        return generateTimeSlots(dayName, selectedService?.duration || 30);
    }, [selectedDate, selectedService]);

    // Filter services by search
    const filteredServices = useMemo(() => {
        if (!serviceSearch.trim()) return services;
        const q = serviceSearch.toLowerCase();
        return services.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }, [services, serviceSearch]);

    // Submit booking
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // TODO: Replace with api.post('/bookings', {
            //   clientId: customer._id,
            //   serviceId: selectedService._id,
            //   staffId: selectedStaff._id,
            //   appointmentDate: combinedDateTime,
            //   duration: selectedService.duration,
            //   price: selectedService.price,
            //   notes: '',
            // })
            await new Promise(r => setTimeout(r, 1500)); // Simulate API
            setBookingComplete(true);
        } catch {
            console.error('Booking failed');
        } finally {
            setSubmitting(false);
        }
    };

    // Success screen
    if (bookingComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center space-y-5"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
                    >
                        <Check className="w-10 h-10 text-emerald-500" strokeWidth={3} />
                    </motion.div>
                </motion.div>
                <div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl font-extrabold text-text"
                    >
                        Booking Confirmed! 🎉
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-sm text-text-muted mt-1.5"
                    >
                        {selectedService?.name} with {selectedStaff?.name}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-surface rounded-2xl border border-border/60 p-4 w-full max-w-xs space-y-2"
                >
                    <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Date</span>
                        <span className="font-semibold text-text">
                            {selectedDate?.date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Time</span>
                        <span className="font-semibold text-text">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Duration</span>
                        <span className="font-semibold text-text">{selectedService?.duration} min</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-dashed border-border">
                        <span className="font-bold text-text">Total</span>
                        <span className="font-extrabold text-primary">₹{selectedService?.price?.toLocaleString()}</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-3 w-full max-w-xs"
                >
                    <button
                        onClick={() => navigate('/app/bookings')}
                        className="flex-1 py-3 rounded-xl bg-surface border border-border text-sm font-bold text-text hover:bg-surface-alt transition-colors"
                    >
                        My Bookings
                    </button>
                    <button
                        onClick={() => navigate('/app')}
                        className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                    >
                        Go Home
                    </button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Back Button */}
            <button onClick={() => step > 0 ? goTo(step - 1) : navigate(-1)} className="flex items-center gap-1 text-sm text-text-muted hover:text-text transition-colors">
                <ArrowLeft className="w-4 h-4" /> {step > 0 ? 'Back' : 'Cancel'}
            </button>

            {/* Step Indicator */}
            <StepIndicator currentStep={step} steps={STEPS} />

            {/* Step Content */}
            <AnimatePresence mode="wait" custom={direction}>
                {/* STEP 0: Select Service */}
                {step === 0 && (
                    <motion.div
                        key="step-0"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-4"
                    >
                        <input
                            type="text"
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            placeholder="Search services…"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all text-text"
                        />
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-thin pr-1">
                            {filteredServices.map((svc) => (
                                <motion.button
                                    key={svc._id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setSelectedService(svc); goTo(1); }}
                                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${selectedService?._id === svc._id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border/60 bg-surface hover:border-primary/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-text">{svc.name}</p>
                                            <p className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                                                <span>{svc.category}</span>
                                                <span>·</span>
                                                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {svc.duration} min</span>
                                            </p>
                                        </div>
                                        <span className="text-sm font-extrabold text-primary">₹{svc.price.toLocaleString()}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* STEP 1: Date & Time */}
                {step === 1 && (
                    <motion.div
                        key="step-1"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-5"
                    >
                        <h2 className="text-lg font-extrabold text-text">Pick a Date & Time</h2>

                        {/* Date Picker - Horizontal Scroll */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                            {dateOptions.map((d, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    whileTap={{ scale: 0.93 }}
                                    disabled={!d.isOpen}
                                    onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                                    className={`flex flex-col items-center py-2.5 px-3 rounded-xl min-w-[54px] text-center transition-all border-2 ${!d.isOpen
                                        ? 'opacity-40 cursor-not-allowed border-transparent bg-background/50'
                                        : selectedDate === d
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border/60 bg-surface hover:border-primary/20'
                                        }`}
                                >
                                    <span className="text-[10px] font-bold text-text-muted uppercase">{d.label}</span>
                                    <span className={`text-lg font-extrabold ${selectedDate === d ? 'text-primary' : 'text-text'}`}>{d.dayNum}</span>
                                    <span className="text-[9px] text-text-muted">{d.month}</span>
                                    {d.isToday && <span className="text-[8px] font-bold text-primary mt-0.5">TODAY</span>}
                                </motion.button>
                            ))}
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                <p className="text-xs font-bold text-text-secondary">Available Slots</p>
                                <div className="grid grid-cols-4 gap-2 max-h-[35vh] overflow-y-auto scrollbar-thin pr-1">
                                    {timeSlots.map((slot, i) => (
                                        <motion.button
                                            key={slot.time}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                            whileTap={{ scale: 0.93 }}
                                            disabled={!slot.available}
                                            onClick={() => setSelectedTime(slot.time)}
                                            className={`py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${!slot.available
                                                ? 'opacity-30 cursor-not-allowed bg-background border-transparent text-text-muted line-through'
                                                : selectedTime === slot.time
                                                    ? 'border-primary bg-primary text-white shadow-sm'
                                                    : 'border-border/60 bg-surface text-text-secondary hover:border-primary/20'
                                                }`}
                                        >
                                            {slot.time}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <button
                            onClick={() => goTo(2)}
                            disabled={!selectedDate || !selectedTime}
                            className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                        >
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                {/* STEP 2: Choose Stylist */}
                {step === 2 && (
                    <motion.div
                        key="step-2"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-4"
                    >
                        <h2 className="text-lg font-extrabold text-text">Choose your Stylist</h2>
                        <div className="space-y-2.5">
                            {staff.map((s, i) => (
                                <motion.button
                                    key={s._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedStaff(s)}
                                    className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border-2 transition-all ${selectedStaff?._id === s._id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border/60 bg-surface hover:border-primary/20'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-primary">
                                            {s.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-sm font-bold text-text">{s.name}</p>
                                        <p className="text-xs text-text-muted">{s.specialization} Specialist</p>
                                    </div>
                                    {selectedStaff?._id === s._id && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                                        >
                                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        <button
                            onClick={() => goTo(3)}
                            disabled={!selectedStaff}
                            className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                        >
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                {/* STEP 3: Confirm */}
                {step === 3 && (
                    <motion.div
                        key="step-3"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-5"
                    >
                        <h2 className="text-lg font-extrabold text-text">Confirm Booking</h2>

                        <div className="bg-surface rounded-2xl border border-border/60 p-5 space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-text">{selectedService?.name}</h3>
                                    <p className="text-xs text-text-muted">{selectedService?.category} · {selectedService?.duration} min</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Date</span>
                                    <span className="font-semibold text-text">
                                        {selectedDate?.date.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Time</span>
                                    <span className="font-semibold text-text">{selectedTime}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Stylist</span>
                                    <span className="font-semibold text-text">{selectedStaff?.name}</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-lg pt-3 border-t border-dashed border-border">
                                <span className="font-bold text-text">Total</span>
                                <span className="font-extrabold text-primary">₹{selectedService?.price?.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full py-4 rounded-2xl bg-primary text-white text-base font-bold flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                        >
                            {submitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Booking...</>
                            ) : (
                                <><Sparkles className="w-5 h-5" /> Confirm Booking</>
                            )}
                        </button>

                        <p className="text-[11px] text-text-muted text-center">
                            A confirmation will be sent to your registered phone number
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
