import React, { useState, useEffect } from 'react';
import {
    Bell,
    Calendar,
    Plus,
    Trash2,
    MessageSquare,
    RefreshCw,
    X,
    User,
    Phone,
    Heart,
    Clock,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { useBusiness } from '../../../contexts/BusinessContext';

export default function BridalRemindersView() {
    const { salon } = useBusiness();
    const [loading, setLoading] = useState(true);
    const [bridalBookings, setBridalBookings] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBridal, setNewBridal] = useState({
        clientName: '',
        clientPhone: '',
        eventName: '',
        eventDate: '',
        service: 'Bridal Makeup'
    });

    const loadBridalState = async () => {
        setLoading(true);
        try {
            const res = await api.get('/reminders-links/state');
            setBridalBookings(res.data?.bridalBookings || []);
        } catch (err) {
            console.error('Failed to load bridal bookings:', err);
            toast.error('Failed to load bridal bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBridalState();
    }, []);

    const handleAddBridal = async (e) => {
        e.preventDefault();
        if (!newBridal.clientName || !newBridal.clientPhone || !newBridal.eventDate) {
            return toast.error('Please fill in all mandatory fields');
        }
        if (newBridal.clientPhone.replace(/\D/g, '').length !== 10) {
            return toast.error('Phone number must be exactly 10 digits');
        }

        const toastId = toast.loading('Adding bridal event...');
        try {
            await api.post('/reminders-links/bridal-bookings', {
                ...newBridal,
                clientName: newBridal.clientName.toUpperCase(),
                eventName: newBridal.eventName.toUpperCase(),
                reminders: [
                    { id: `rem-30d-${Date.now()}`, label: '30 Days Before', daysBefore: 30, active: true, sentAt: null },
                    { id: `rem-1d-${Date.now()}`, label: '1 Day Before', daysBefore: 1, active: true, sentAt: null },
                    { id: `rem-0d-${Date.now()}`, label: 'Same Day', daysBefore: 0, active: true, sentAt: null }
                ]
            });
            toast.success('Bridal booking added successfully!', { id: toastId });
            setShowAddModal(false);
            setNewBridal({ clientName: '', clientPhone: '', eventName: '', eventDate: '', service: 'Bridal Makeup' });
            loadBridalState();
        } catch (err) {
            console.error('Failed to add bridal event:', err);
            toast.error(err.response?.data?.message || 'Failed to add bridal event', { id: toastId });
        }
    };

    const handleDelete = async (bookingId) => {
        if (!confirm('Are you sure you want to delete this bridal booking?')) return;
        const toastId = toast.loading('Deleting bridal booking...');
        try {
            await api.delete(`/reminders-links/bridal-bookings/${bookingId}`);
            toast.success('Deleted successfully', { id: toastId });
            loadBridalState();
        } catch (err) {
            console.error('Failed to delete bridal booking:', err);
            toast.error(err.response?.data?.message || 'Failed to delete booking', { id: toastId });
        }
    };

    const toggleReminder = async (bookingId, remId) => {
        try {
            await api.patch(`/reminders-links/bridal-bookings/${bookingId}/reminders/${remId}/toggle`);
            loadBridalState();
            toast.success('Reminder toggled successfully');
        } catch (err) {
            console.error('Failed to toggle reminder:', err);
            toast.error('Failed to toggle reminder');
        }
    };

    const handleSendManualWhatsApp = (booking, reminderLabel) => {
        const salonName = salon?.businessName || salon?.name || 'Our Salon';
        let text = `Hi ${booking.clientName}, `;
        if (reminderLabel === 'Same Day') {
            text += `Today is your big day! 👰✨ Your Bridal Service Booking (${booking.service || 'Bridal Special'}) is scheduled for today. We are excited to make you look stunning for your wedding! - ${salonName}`;
        } else {
            text += `Gentle reminder regarding your upcoming Bridal Service Booking (${booking.service || 'Bridal Special'}) scheduled on ${new Date(booking.eventDate).toLocaleDateString()}. We look forward to serving you! - ${salonName}`;
        }
        const phone = booking.clientPhone ? booking.clientPhone.replace(/\D/g, '') : '';
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="p-8 space-y-6 animate-reveal">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-alt/10 p-6 border border-border">
                <div className="text-left">
                    <h4 className="text-xs font-black uppercase tracking-widest text-text">Bridal Booking Reminders</h4>
                    <p className="text-[11px] font-semibold text-text-muted">Manage scheduled pre-wedding and wedding day automated alerts.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/95 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 rounded-none"
                >
                    <Plus className="w-4 h-4" /> Add Event
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-text-muted space-y-4">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Loading Bridal Records...</span>
                </div>
            ) : bridalBookings.length === 0 ? (
                <div className="border-2 border-dashed border-border py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white">
                    <AlertCircle size={48} className="text-border" />
                    <div className="space-y-1">
                        <p className="text-lg font-black uppercase italic opacity-25">No Bridal Reminders Scheduled</p>
                        <p className="text-[10px] font-black uppercase opacity-25 tracking-widest">Add your first bridal service package to trigger automated reminders.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bridalBookings.map((b) => (
                        <div key={b._id || b.id} className="bg-white border-2 border-text p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all relative">
                            {/* Delete button */}
                            <button
                                onClick={() => handleDelete(b._id || b.id)}
                                className="absolute top-4 right-4 p-2 text-text-muted hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100"
                                title="Delete bridal record"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="text-left space-y-4">
                                <div className="space-y-1 pr-8">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black uppercase tracking-tight text-text">{b.clientName}</h3>
                                        <Heart className="w-4 h-4 text-rose-500 fill-current" />
                                    </div>
                                    <p className="text-[10px] text-text-muted font-bold tracking-widest flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-text-muted/60" /> {b.clientPhone}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-y border-border py-4">
                                    <div className="space-y-0.5">
                                        <span className="text-[9px] font-black uppercase text-text-muted tracking-wider">Service/Context</span>
                                        <p className="text-xs font-black uppercase tracking-tighter text-text">{b.service || 'Bridal Makeup'}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-[9px] font-black uppercase text-text-muted tracking-wider">Event Date</span>
                                        <p className="text-xs font-black uppercase tracking-tighter text-primary flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" /> {formatDate(b.eventDate)}
                                        </p>
                                    </div>
                                </div>

                                {/* Reminders checklist */}
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black uppercase text-text-muted tracking-wider">Reminder Milestones</span>
                                    <div className="space-y-1.5">
                                        {(b.reminders || []).map((r) => (
                                            <div
                                                key={r._id || r.id}
                                                className={`flex items-center justify-between p-3 border-2 text-[10px] uppercase font-black italic tracking-wider transition-all ${
                                                    r.active
                                                        ? 'border-text bg-white'
                                                        : 'border-border bg-surface-alt/5 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={r.active}
                                                        onChange={() => toggleReminder(b._id || b.id, r._id || r.id)}
                                                        className="w-4 h-4 accent-primary cursor-pointer border-2"
                                                    />
                                                    <span>{r.label}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {r.sentAt ? (
                                                        <span className="text-emerald-600 font-bold lowercase tracking-tight flex items-center gap-1">
                                                            sent: {new Date(r.sentAt).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-amber-500 font-bold tracking-tight">pending</span>
                                                    )}
                                                    <button
                                                        onClick={() => handleSendManualWhatsApp(b, r.label)}
                                                        className="text-emerald-500 hover:text-emerald-600 transition-colors uppercase font-black"
                                                    >
                                                        SEND WA
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Bridal Event Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-y-auto max-h-[90vh] hide-scrollbar border border-slate-200/50" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center">
                            <h4 className="text-[11px] font-black text-slate-900 uppercase flex items-center gap-2 tracking-widest">
                                <Calendar className="w-4 h-4 text-slate-800" /> Add Bridal Event
                            </h4>
                            <button type="button" onClick={() => setShowAddModal(false)} className="p-1 border-2 border-text hover:bg-rose-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAddBridal} className="p-6 space-y-4">
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Bride Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter client name"
                                    value={newBridal.clientName}
                                    onChange={(e) => setNewBridal({ ...newBridal, clientName: e.target.value })}
                                    className="w-full bg-surface-alt/5 border-2 border-text p-3 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-primary transition-all rounded-none"
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="10-digit mobile"
                                    value={newBridal.clientPhone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setNewBridal({ ...newBridal, clientPhone: val });
                                    }}
                                    className="w-full bg-surface-alt/5 border-2 border-text p-3 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-primary transition-all rounded-none"
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Service Booking / Event Date</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={newBridal.eventDate}
                                    onChange={(e) => setNewBridal({ ...newBridal, eventDate: e.target.value })}
                                    className="w-full bg-surface-alt/5 border-2 border-text p-3 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-primary transition-all rounded-none"
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Service / Context</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Bridal Makeup & Hair"
                                    value={newBridal.service}
                                    onChange={(e) => setNewBridal({ ...newBridal, service: e.target.value })}
                                    className="w-full bg-surface-alt/5 border-2 border-text p-3 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-primary transition-all rounded-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3.5 border-2 border-text font-black text-[10px] uppercase tracking-widest bg-white hover:bg-surface-alt/20 transition-all text-text-muted rounded-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-text text-white border-2 border-text py-3.5 font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:border-primary hover:text-white transition-all rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    Save Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
