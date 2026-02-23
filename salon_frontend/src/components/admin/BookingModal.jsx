import React, { useState } from 'react';
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
    const { services, staff, addBooking, outlets } = useBusiness();

    const [formData, setFormData] = useState({
        clientName: '',
        clientPhone: '',
        serviceId: '',
        staffId: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        outletId: outlets[0]?._id || 'mock-1',
        notes: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
        const selectedStaff = staff.find(s => s._id === formData.staffId);
        const selectedOutlet = outlets.find(o => o._id === formData.outletId);

        const newBooking = {
            client: {
                name: formData.clientName,
                phone: formData.clientPhone
            },
            service: {
                name: selectedService?.name || 'Unknown Service',
                price: selectedService?.price || 0
            },
            staff: {
                _id: selectedStaff?._id,
                name: selectedStaff?.name || 'Unassigned'
            },
            appointmentDate: new Date(`${formData.date}T${formData.time}`).getTime(),
            status: 'upcoming',
            outletName: selectedOutlet?.name || 'Main Salon',
            source: 'Admin',
            notes: formData.notes
        };

        addBooking(newBooking);

        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            onClose();
            setFormData({
                clientName: '',
                clientPhone: '',
                serviceId: '',
                staffId: '',
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                outletId: outlets[0]?._id || 'mock-1',
                notes: ''
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
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
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-text">Booking Created!</h3>
                            <p className="text-sm text-text-secondary mt-1">The appointment has been added to your schedule.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Customer Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            required
                                            type="text"
                                            value={formData.clientName}
                                            onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            required
                                            type="tel"
                                            value={formData.clientPhone}
                                            onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="+91 00000 00000"
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
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-white transition-all"
                                    >
                                        <option value="">Choose a service...</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Assign Staff</label>
                                <div className="relative">
                                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <select
                                        required
                                        value={formData.staffId}
                                        onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-white transition-all"
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
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing...' : 'Confirm Appointment'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
