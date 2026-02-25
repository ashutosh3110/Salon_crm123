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
                className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6"
                style={{ background: '#141414', minHeight: '100svh' }}
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
                        className="text-2xl font-black text-white uppercase italic tracking-tighter"
                    >
                        Booking Confirmed! 🎉
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-[10px] text-white/40 mt-2 font-black uppercase tracking-[0.2em]"
                    >
                        {selectedService?.name} with {selectedStaff?.name}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-[#1A1A1A] rounded-[2rem] border border-white/5 p-6 w-full max-w-xs space-y-4"
                >
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-white/30">Date</span>
                        <span className="text-white">
                            {selectedDate?.date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-white/30">Time</span>
                        <span className="text-white">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-white/30">Duration</span>
                        <span className="text-white">{selectedService?.duration} min</span>
                    </div>
                    <div className="flex justify-between text-base pt-4 border-t border-dashed border-white/10 uppercase font-black tracking-tighter">
                        <span className="text-white/60">Total</span>
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
                        className="w-full py-4 rounded-none bg-[#C8956C] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#C8956C]/20 active:scale-95 transition-all"
                    >
                        My Bookings
                    </button>
                    <button
                        onClick={() => navigate('/app')}
                        className="w-full py-3 rounded-none bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
                    >
                        Go Home
                    </button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 px-4 pb-12" style={{ background: '#141414', minHeight: '100svh' }}>
            {/* Back Button */}
            <div className="pt-10 flex items-center justify-between">
                <button onClick={() => step > 0 ? goTo(step - 1) : navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {step > 0 ? 'Back' : 'Cancel'}
                </button>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8956C] italic">Step {step + 1}/4</div>
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
                                placeholder="SEARCH PROTOCOL..."
                                className="w-full px-5 py-4 rounded-none border border-white/10 bg-[#1A1A1A] text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-[#C8956C] transition-all text-white placeholder:text-white/10"
                            />
                        </div>
                        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1">
                            {filteredServices.map((svc) => (
                                <motion.button
                                    key={svc._id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setSelectedService(svc); goTo(1); }}
                                    className={`w-full text-left p-5 rounded-none border transition-all duration-300 ${selectedService?._id === svc._id
                                        ? 'border-[#C8956C] bg-[#C8956C]/10'
                                        : 'border-white/5 bg-[#1A1A1A] hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight italic">{svc.name}</p>
                                            <p className="text-[9px] text-white/30 mt-1.5 flex items-center gap-2 font-black uppercase tracking-widest">
                                                <span>{svc.category}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/10" />
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
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Select <span className="text-[#C8956C]">Timeline</span></h2>

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
                                        className={`flex flex-col items-center py-4 px-4 rounded-none min-w-[65px] text-center transition-all border ${!d.isOpen
                                            ? 'opacity-20 cursor-not-allowed border-transparent bg-white/5'
                                            : selectedDate === d
                                                ? 'border-[#C8956C] bg-[#C8956C]/10'
                                                : 'border-white/5 bg-[#1A1A1A] hover:border-white/20'
                                            }`}
                                    >
                                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedDate === d ? 'text-[#C8956C]' : 'text-white/30'}`}>{d.label}</span>
                                        <span className={`text-xl font-black tracking-tighter ${selectedDate === d ? 'text-white' : 'text-white/60'}`}>{d.dayNum}</span>
                                        <span className="text-[8px] font-black uppercase text-white/20 mt-1 tracking-widest">{d.month}</span>
                                        {d.isToday && <div className="w-1 h-1 rounded-full bg-[#C8956C] mt-2" />}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Available Protocols</p>
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
                                            className={`py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all border ${!slot.available
                                                ? 'opacity-10 cursor-not-allowed bg-transparent border-white/5 text-white/20 line-through'
                                                : selectedTime === slot.time
                                                    ? 'border-[#C8956C] bg-[#C8956C] text-white shadow-[0_0_20px_rgba(200,149,108,0.3)]'
                                                    : 'border-white/5 bg-[#1A1A1A] text-white/60 hover:border-white/20'
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
                            className="w-full py-4 rounded-none bg-[#C8956C] text-white text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-[#C8956C]/10 active:scale-95 transition-all"
                        >
                            Next Protocol <ArrowRight className="w-4 h-4" />
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
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Choose <span className="text-[#C8956C]">Expert</span></h2>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                            {staff.map((s, i) => (
                                <motion.button
                                    key={s._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedStaff(s)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-none border transition-all duration-300 ${selectedStaff?._id === s._id
                                        ? 'border-[#C8956C] bg-[#C8956C]/10'
                                        : 'border-white/5 bg-[#1A1A1A] hover:border-white/20'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black text-[#C8956C] uppercase tracking-tighter">
                                            {s.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-sm font-black text-white uppercase tracking-tight italic">{s.name}</p>
                                        <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mt-1">{s.specialization} SPECIALIST</p>
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
                            className="w-full py-4 rounded-none bg-[#C8956C] text-white text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-20 shadow-xl shadow-[#C8956C]/10 active:scale-95 transition-all"
                        >
                            Finalize <ArrowRight className="w-4 h-4" />
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
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Confirm <span className="text-[#C8956C]">Session</span></h2>

                        <div className="bg-[#1A1A1A] rounded-[2rem] border border-white/5 p-6 space-y-6">
                            <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                                <div className="w-14 h-14 rounded-2xl bg-[#C8956C]/10 border border-[#C8956C]/20 flex items-center justify-center">
                                    <Sparkles className="w-7 h-7 text-[#C8956C]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">{selectedService?.name}</h3>
                                    <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">{selectedService?.category} · {selectedService?.duration} MIN</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="text-white/30">Date</span>
                                    <span className="text-white">
                                        {selectedDate?.date.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="text-white/30">Time</span>
                                    <span className="text-white">{selectedTime}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="text-white/30">Stylist</span>
                                    <span className="text-white">{selectedStaff?.name}</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-2xl pt-6 border-t border-dashed border-white/10 uppercase font-black tracking-tighter">
                                <span className="text-white/60">Total</span>
                                <span className="text-[#C8956C]">₹{selectedService?.price?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full py-5 rounded-none bg-[#C8956C] text-white text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-[#C8956C]/20 active:scale-95 transition-all"
                            >
                                {submitting ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Authorizing...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5" /> Execute Booking</>
                                )}
                            </button>

                            <p className="text-[8px] text-white/20 text-center uppercase tracking-widest font-black leading-relaxed">
                                Tokenized confirmation will be dispatched to <br />
                                your secure communications line
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
