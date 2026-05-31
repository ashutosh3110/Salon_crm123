import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showAddModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showAddModal]);

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
                    { id: `rem-5d-${Date.now()}`, label: '5 Days Before', daysBefore: 5, active: true, sentAt: null },
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
        <div className="p-4 sm:p-5 space-y-4 animate-reveal">
            <style>{`
                /* Fix visibility of Bridal Modal in Light Mode */
                html:not(.dark) .bridal-modal-container h4 {
                    color: #0f172a !important;
                }
                html:not(.dark) .bridal-modal-container p {
                    color: #475569 !important;
                }
                html:not(.dark) .bridal-modal-container label {
                    color: #475569 !important;
                }
                html:not(.dark) .bridal-modal-container button:not(.bg-primary) {
                    color: #0f172a !important;
                    border-color: #cbd5e1 !important;
                }
                html:not(.dark) .bridal-modal-container svg {
                    color: #475569 !important;
                    stroke: #475569 !important;
                    fill: none !important;
                }
                html:not(.dark) .bridal-modal-container .bg-primary\\/10 svg {
                    color: #b4912b !important;
                    stroke: #b4912b !important;
                }
            `}</style>
            
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-alt/10 p-4 border border-border rounded-2xl">
                <div className="text-left">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-text">Bridal Booking Reminders</h4>
                    <p className="text-[10px] font-semibold text-text-muted">View scheduled pre-wedding and wedding day automated alerts.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(var(--color-primary),0.3)] hover:brightness-110 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.5)] transition-all cursor-pointer whitespace-nowrap"
                >
                    <Plus className="w-3.5 h-3.5" /> Add Booking
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-text-muted space-y-3">
                    <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Loading Bridal Records...</span>
                </div>
            ) : bridalBookings.length === 0 ? (
                <div className="border-2 border-dashed border-border py-16 flex flex-col items-center justify-center text-center space-y-3 bg-surface rounded-2xl">
                    <AlertCircle size={40} className="text-border" />
                    <div className="space-y-0.5">
                        <p className="text-base font-black uppercase italic opacity-25">No Bridal Reminders Scheduled</p>
                        <p className="text-[9px] font-black uppercase opacity-25 tracking-widest">Bridal bookings will automatically appear here to trigger scheduled reminders.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bridalBookings.map((b) => (
                        <div key={b._id || b.id} className="bg-surface border border-border rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative group">
                            {/* Delete button */}
                            <button
                                onClick={() => handleDelete(b._id || b.id)}
                                className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-rose-600 transition-colors bg-surface-alt hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100"
                                title="Delete bridal record"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="text-left space-y-3">
                                <div className="space-y-0.5 pr-8">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-black uppercase tracking-tight text-text">{b.clientName}</h3>
                                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                                    </div>
                                    <p className="text-[9px] text-text-muted font-bold tracking-widest flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-text-muted/60" /> {b.clientPhone}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 border-y border-border py-3">
                                    <div className="space-y-0.5">
                                        <span className="text-[8px] font-black uppercase text-text-muted tracking-wider">Service/Context</span>
                                        <p className="text-[11px] font-black uppercase tracking-tighter text-text">{b.service || 'Bridal Makeup'}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-[8px] font-black uppercase text-text-muted tracking-wider">Event Date</span>
                                        <p className="text-[11px] font-black uppercase tracking-tighter text-primary flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {formatDate(b.eventDate)}
                                        </p>
                                    </div>
                                </div>

                                {/* Reminders checklist */}
                                <div className="space-y-1.5">
                                    <span className="text-[8px] font-black uppercase text-text-muted tracking-wider">Reminder Milestones</span>
                                    <div className="space-y-1">
                                        {(b.reminders || []).map((r) => (
                                            <div
                                                key={r._id || r.id}
                                                className={`flex items-center justify-between p-2 border rounded-xl text-[9px] uppercase font-black tracking-wider transition-all ${
                                                    r.active
                                                        ? 'border-border bg-surface shadow-sm'
                                                        : 'border-border bg-surface-alt/10 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={r.active}
                                                        onChange={() => toggleReminder(b._id || b.id, r._id || r.id)}
                                                        className="w-3.5 h-3.5 accent-primary cursor-pointer"
                                                    />
                                                    <span>{r.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {r.sentAt ? (
                                                        <span className="text-emerald-650 font-bold lowercase tracking-tight flex items-center gap-1 text-[8px]">
                                                            sent: {new Date(r.sentAt).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-amber-500 font-bold tracking-tight text-[8px]">pending</span>
                                                    )}
                                                    <button
                                                        onClick={() => handleSendManualWhatsApp(b, r.label)}
                                                        className="text-emerald-500 hover:text-emerald-600 transition-colors uppercase font-black bg-emerald-500/10 px-2 py-1.5 rounded-lg border border-emerald-500/20 text-[8px]"
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

            {showAddModal && createPortal(
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bridal-modal-container bg-surface rounded-2xl w-full max-w-md shadow-2xl relative overflow-y-auto max-h-[90vh] border border-border" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-text uppercase tracking-widest">Add Bridal Event</h4>
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Schedule pre-wedding reminder</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded-xl bg-surface-alt hover:bg-rose-50 text-text-muted hover:text-rose-500 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAddBridal} className="p-6 space-y-5">
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Bride Name *</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="Enter client name"
                                    value={newBridal.clientName}
                                    onChange={(e) => setNewBridal({ ...newBridal, clientName: e.target.value })}
                                    className="w-full bg-surface-alt border border-border px-4 py-3.5 text-xs font-black text-text outline-none focus:bg-surface focus:border-primary transition-all rounded-2xl"
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="10-digit mobile"
                                    value={newBridal.clientPhone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setNewBridal({ ...newBridal, clientPhone: val });
                                    }}
                                    className="w-full bg-surface-alt border border-border px-4 py-3.5 text-xs font-black text-text outline-none focus:bg-surface focus:border-primary transition-all rounded-2xl"
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Service Booking / Event Date *</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={newBridal.eventDate}
                                    onChange={(e) => setNewBridal({ ...newBridal, eventDate: e.target.value })}
                                    className="w-full bg-surface-alt border border-border px-4 py-3.5 text-xs font-black text-text outline-none focus:bg-surface focus:border-primary transition-all rounded-2xl"
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Service / Context</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Bridal Makeup & Hair"
                                    value={newBridal.service}
                                    onChange={(e) => setNewBridal({ ...newBridal, service: e.target.value })}
                                    className="w-full bg-surface-alt border border-border px-4 py-3.5 text-xs font-black text-text outline-none focus:bg-surface focus:border-primary transition-all rounded-2xl"
                                />
                            </div>

                            <div className="flex gap-3 pt-6 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 border border-border font-black text-[10px] uppercase tracking-widest bg-surface hover:bg-surface-alt transition-all text-text rounded-2xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-primary-foreground py-3 font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(var(--color-primary),0.3)] hover:brightness-110 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.5)] transition-all rounded-2xl"
                                >
                                    Save Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
