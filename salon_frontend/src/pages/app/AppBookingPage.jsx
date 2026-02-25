import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles, Loader2 } from 'lucide-react';
import StepIndicator from '../../components/app/StepIndicator';
import { MOCK_SERVICES, MOCK_STAFF, MOCK_OUTLET, generateTimeSlots } from '../../data/appMockData';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const STEPS = ['Service', 'Date & Time', 'Stylist', 'Confirm'];

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function AppBookingPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

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

    const colors = {
        bg: isLight ? '#F8F9FA' : '#141414',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        toggle: isLight ? '#EDF0F2' : '#1A1A1A',
        input: isLight ? '#FFFFFF' : '#1A1A1A',
    };

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
                className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6"
                style={{ background: colors.bg, minHeight: '100svh' }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-24 h-24 rounded-full bg-[#C8956C]/10 flex items-center justify-center border border-[#C8956C]/20"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
                    >
                        <Check className="w-12 h-12 text-[#C8956C]" strokeWidth={3} />
                    </motion.div>
                </motion.div>
                <div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-2xl font-black italic tracking-tighter"
                    >
                        Booking Confirmed! 🎉
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-[10px] uppercase tracking-[0.2em] mt-2 opacity-60"
                        style={{ color: colors.textMuted }}
                    >
                        {selectedService?.name} with {selectedStaff?.name}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                    className="rounded-3xl p-6 w-full max-w-xs space-y-4 shadow-sm"
                >
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span style={{ color: colors.textMuted }}>Date</span>
                        <span style={{ color: colors.text }}>
                            {selectedDate?.date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span style={{ color: colors.textMuted }}>Time</span>
                        <span style={{ color: colors.text }}>{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span style={{ color: colors.textMuted }}>Duration</span>
                        <span style={{ color: colors.text }}>{selectedService?.duration} min</span>
                    </div>
                    <div className="flex justify-between text-base pt-4 border-t border-dashed border-black/10 dark:border-white/10 uppercase font-black tracking-tighter">
                        <span style={{ color: colors.textMuted }}>Total</span>
                        <span className="text-[#C8956C]">₹{selectedService?.price?.toLocaleString()}</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col gap-3 w-full max-w-xs pt-4"
                >
                    <button
                        onClick={() => navigate('/app/bookings')}
                        className="w-full py-4 rounded-xl bg-[#C8956C] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#C8956C]/20 active:scale-95 transition-all"
                    >
                        My Bookings
                    </button>
                    <button
                        onClick={() => navigate('/app')}
                        style={{ background: colors.toggle, border: `1px solid ${colors.border}`, color: colors.textMuted }}
                        className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#C8956C] transition-colors"
                    >
                        Go Home
                    </button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 px-4 pb-12" style={{ background: colors.bg, minHeight: '100svh' }}>
            {/* Back Button */}
            <div className="pt-10 flex items-center justify-between">
                <button onClick={() => step > 0 ? goTo(step - 1) : navigate(-1)} style={{ color: colors.textMuted }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#C8956C] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {step > 0 ? 'Back' : 'Cancel'}
                </button>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8956C] italic font-mono">Step {step + 1}/4</div>
            </div>

            {/* Step Indicator */}
            <div className="py-2">
                <StepIndicator currentStep={step} steps={STEPS} />
            </div>

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
                        className="space-y-6"
                    >
                        <div className="relative group">
                            <input
                                type="text"
                                value={serviceSearch}
                                onChange={(e) => setServiceSearch(e.target.value)}
                                placeholder="SEARCH SERVICES..."
                                style={{ background: colors.input, border: `1px solid ${colors.border}`, color: colors.text }}
                                className="w-full px-5 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-[#C8956C] transition-all placeholder:opacity-40 shadow-sm"
                            />
                        </div>
                        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1">
                            {filteredServices.map((svc) => (
                                <motion.button
                                    key={svc._id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setSelectedService(svc); goTo(1); }}
                                    style={{
                                        background: selectedService?._id === svc._id ? 'rgba(200,149,108,0.1)' : colors.card,
                                        borderColor: selectedService?._id === svc._id ? '#C8956C' : colors.border
                                    }}
                                    className="w-full text-left p-5 rounded-2xl border transition-all duration-300 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-tight italic" style={{ color: colors.text }}>{svc.name}</p>
                                            <p className="text-[9px] mt-1.5 flex items-center gap-2 font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                                                <span>{svc.category}</span>
                                                <span className="w-1 h-1 rounded-full bg-black/10 dark:bg-white/10" />
                                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#C8956C]" /> {svc.duration} MIN</span>
                                            </p>
                                        </div>
                                        <span className="text-sm font-black text-[#C8956C] tracking-tighter">₹{svc.price.toLocaleString()}</span>
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
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Select <span className="text-[#C8956C]">Timeline</span>
                            </h2>

                            {/* Date Picker - Horizontal Scroll */}
                            <div className="flex gap-2.5 overflow-x-auto pb-4 custom-scrollbar -mx-1 px-1">
                                {dateOptions.map((d, i) => (
                                    <motion.button
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        whileTap={{ scale: 0.93 }}
                                        disabled={!d.isOpen}
                                        onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                                        style={{
                                            background: selectedDate === d ? 'rgba(200,149,108,0.1)' : colors.card,
                                            borderColor: selectedDate === d ? '#C8956C' : colors.border
                                        }}
                                        className={`flex flex-col items-center py-4 px-4 rounded-2xl min-w-[70px] text-center transition-all border shadow-sm ${!d.isOpen ? 'opacity-20' : ''}`}
                                    >
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedDate === d ? 'text-[#C8956C]' : (isLight ? 'text-gray-400' : 'text-white/30')}`}>{d.label}</span>
                                        <span className={`text-xl font-black tracking-tighter ${selectedDate === d ? (isLight ? 'text-[#1A1A1A]' : 'text-white') : (isLight ? 'text-gray-400' : 'text-white/60')}`}>{d.dayNum}</span>
                                        <span className="text-[8px] font-black uppercase opacity-40 mt-1 tracking-widest">{d.month}</span>
                                        {d.isToday && <div className="w-1 h-1 rounded-full bg-[#C8956C] mt-2" />}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Available Slots</p>
                                <div className="grid grid-cols-4 gap-2.5 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                                    {timeSlots.map((slot, i) => (
                                        <motion.button
                                            key={slot.time}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                            whileTap={{ scale: 0.93 }}
                                            disabled={!slot.available}
                                            onClick={() => setSelectedTime(slot.time)}
                                            style={{
                                                background: selectedTime === slot.time ? '#C8956C' : colors.card,
                                                borderColor: selectedTime === slot.time ? '#C8956C' : colors.border,
                                                color: selectedTime === slot.time ? '#fff' : (slot.available ? colors.text : colors.textMuted)
                                            }}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${!slot.available ? 'opacity-10' : ''}`}
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
                            className="w-full py-4 rounded-xl bg-[#C8956C] text-white text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-[#C8956C]/10 active:scale-95 transition-all"
                        >
                            Next <ArrowRight className="w-4 h-4" />
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
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-black uppercase italic tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Choose <span className="text-[#C8956C]">Expert</span>
                        </h2>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                            {staff.map((s, i) => (
                                <motion.button
                                    key={s._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedStaff(s)}
                                    style={{
                                        background: selectedStaff?._id === s._id ? 'rgba(200,149,108,0.1)' : colors.card,
                                        borderColor: selectedStaff?._id === s._id ? '#C8956C' : colors.border
                                    }}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 shadow-sm"
                                >
                                    <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black text-[#C8956C] uppercase tracking-tighter">
                                            {s.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-sm font-black uppercase tracking-tight italic" style={{ color: colors.text }}>{s.name}</p>
                                        <p className="text-[9px] uppercase font-black tracking-widest mt-1 opacity-40" style={{ color: colors.textMuted }}>{s.specialization} SPECIALIST</p>
                                    </div>
                                    {selectedStaff?._id === s._id && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 rounded-full bg-[#C8956C] flex items-center justify-center shadow-[0_0_15px_rgba(200,149,108,0.4)]"
                                        >
                                            <Check className="w-3 h-3 text-white" strokeWidth={4} />
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        <button
                            onClick={() => goTo(3)}
                            disabled={!selectedStaff}
                            className="w-full py-4 rounded-xl bg-[#C8956C] text-white text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-20 shadow-xl shadow-[#C8956C]/10 active:scale-95 transition-all"
                        >
                            Review <ArrowRight className="w-4 h-4" />
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
                        className="space-y-8"
                    >
                        <h2 className="text-xl font-black uppercase italic tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Confirm <span className="text-[#C8956C]">Session</span>
                        </h2>

                        <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-[2rem] p-6 space-y-6 shadow-sm">
                            <div className="flex items-center gap-4 pb-6 border-b border-black/5 dark:border-white/5">
                                <div className="w-14 h-14 rounded-2xl bg-[#C8956C]/10 border border-[#C8956C]/20 flex items-center justify-center">
                                    <Sparkles className="w-7 h-7 text-[#C8956C]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tighter" style={{ color: colors.text }}>{selectedService?.name}</h3>
                                    <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-40" style={{ color: colors.textMuted }}>{selectedService?.category} · {selectedService?.duration} MIN</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span style={{ color: colors.textMuted }}>Date</span>
                                    <span style={{ color: colors.text }}>
                                        {selectedDate?.date.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span style={{ color: colors.textMuted }}>Time</span>
                                    <span style={{ color: colors.text }}>{selectedTime}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span style={{ color: colors.textMuted }}>Stylist</span>
                                    <span style={{ color: colors.text }}>{selectedStaff?.name}</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-2xl pt-6 border-t border-dashed border-black/10 dark:border-white/10 uppercase font-black tracking-tighter">
                                <span style={{ color: colors.textMuted }}>Total</span>
                                <span className="text-[#C8956C]">₹{selectedService?.price?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full py-5 rounded-2xl bg-[#C8956C] text-white text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-[#C8956C]/20 active:scale-95 transition-all"
                            >
                                {submitting ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5" /> Confirm Booking</>
                                )}
                            </button>

                            <p className="text-[9px] text-center uppercase tracking-widest font-bold leading-relaxed opacity-40" style={{ color: colors.textMuted }}>
                                Secure booking confirmation will be sent <br />
                                to your registered mobile number
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
