import React, { useEffect, useMemo, useState } from 'react';
import {
    X,
    User,
    Phone,
    Scissors,
    UserPlus,
    Calendar as CalendarIcon,
    Clock,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';

export default function BookingModal({ isOpen, onClose }) {
    const { services, staff, customers, addBooking, outlets, fetchServices } = useBusiness();

    const [formData, setFormData] = useState({
        clientId: '',
        serviceId: '',
        staffId: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        outletId: outlets[0]?._id || 'mock-1',
        notes: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchServices?.();
        }
    }, [isOpen, fetchServices]);

    const activeServices = useMemo(() => {
        return (services || []).filter((s) => (s?.status || 'active') === 'active');
    }, [services]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const selectedService = activeServices.find(s => (s._id || s.id) === formData.serviceId);
            const payload = {
                clientId: formData.clientId,
                serviceId: formData.serviceId,
                staffId: formData.staffId,
                appointmentDate: new Date(`${formData.date}T${formData.time}`).toISOString(),
                duration: Number(selectedService?.duration || 60),
                status: 'pending',
                price: Number(selectedService?.price || 0),
                notes: formData.notes,
            };

            await addBooking(payload);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                setFormData({
                    clientId: '',
                    serviceId: '',
                    staffId: '',
                    date: new Date().toISOString().split('T')[0],
                    time: '10:00',
                    outletId: outlets[0]?._id || 'mock-1',
                    notes: ''
                });
                setLoading(false);
            }, 1200);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to create booking';
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-surface rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
                {/* Header */}
                <div className="px-6 py-4 bg-surface border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-text">New Appointment</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-alt transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {success ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-text">Booking Created!</h3>
                            <p className="text-sm text-text-secondary mt-1">The appointment has been added to your schedule.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Customer</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <select
                                            required
                                            value={formData.clientId}
                                            onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-alt transition-all"
                                        >
                                            <option value="">Select customer...</option>
                                            {(customers || []).map(c => (
                                                <option key={c._id} value={c._id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Source</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            disabled
                                            type="text"
                                            value="ADMIN PANEL"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt text-sm opacity-70"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Select Service</label>
                                <div className="relative">
                                    <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <select
                                        required
                                        value={formData.serviceId}
                                        onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-alt transition-all"
                                    >
                                        <option value="">Choose a service...</option>
                                        {activeServices.map(s => (
                                            <option key={s._id || s.id} value={s._id || s.id}>{s.name} - ₹{s.price}</option>
                                        ))}
                                    </select>
                                </div>
                                {activeServices.length === 0 && (
                                    <p className="text-[11px] text-amber-600 mt-1">
                                        No active services found. Please create or activate a service first.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Assign Staff</label>
                                <div className="relative">
                                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <select
                                        required
                                        value={formData.staffId}
                                        onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-alt transition-all"
                                    >
                                        <option value="">Select staff member...</option>
                                        {staff.map(s => (
                                            <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Date</label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            required
                                            type="date"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            required
                                            type="time"
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing...' : 'Confirm Appointment'}
                                </button>
                            </div>
                            {error && (
                                <div className="text-xs font-semibold text-rose-600 mt-2">{error}</div>
                            )}
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
