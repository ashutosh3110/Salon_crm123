import React, { useState } from 'react';
import {
    X,
    User,
    Calendar as CalendarIcon,
    Clock,
    Store,
    Shield,
    FileText,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    UserPlus,
    XCircle,
    Info
} from 'lucide-react';

const statusColors = {
    upcoming: 'bg-blue-50 text-blue-600 border-blue-100',
    confirmed: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    completed: 'bg-green-50 text-green-600 border-green-100',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
    'no-show': 'bg-red-50 text-red-600 border-red-100',
};

export default function BookingDetailModal({ booking, onClose, onUpdateStatus, onReassign, onReschedule }) {
    const [notes, setNotes] = useState(booking?.notes || '');
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    if (!booking) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 bg-surface border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-text">Booking Details</h2>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">ID: {booking._id?.slice(-8) || 'N/A'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-alt transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Basic Info */}
                    <div className="space-y-6">
                        <section>
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block">Customer</label>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center text-primary font-bold text-lg border-2 border-white shadow-sm">
                                    {booking.client?.name?.[0] || 'C'}
                                </div>
                                <div>
                                    <p className="font-bold text-text text-lg">{booking.client?.name}</p>
                                    <p className="text-xs text-text-secondary">{booking.client?.phone || 'No phone'}</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-surface rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <CalendarIcon className="w-4 h-4 text-text-muted" />
                                <span className="font-medium text-text">
                                    {booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'No Date'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="w-4 h-4 text-text-muted" />
                                <span className="font-medium text-text">
                                    {booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleTimeString('en-IN', { timeStyle: 'short' }) : '--:--'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Store className="w-4 h-4 text-text-muted" />
                                <span className="font-medium text-text">{booking.outletName || 'Main Outlet'}</span>
                            </div>
                        </section>

                        <section>
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block">Service(s)</label>
                            <div className="p-3 rounded-xl border border-border bg-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-sm text-text">{booking.service?.name || 'Unknown Service'}</span>
                                </div>
                                <span className="font-bold text-sm text-primary">₹{booking.service?.price || 0}</span>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Status & Actions */}
                    <div className="space-y-6">
                        <section>
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block">Status</label>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs uppercase tracking-widest ${statusColors[booking.status]}`}>
                                {booking.status === 'upcoming' && <RotateCcw className="w-3.5 h-3.5" />}
                                {booking.status === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {booking.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                {booking.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {booking.status === 'no-show' && <AlertCircle className="w-3.5 h-3.5" />}
                                {booking.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
                                {booking.status}
                            </div>
                        </section>

                        <section>
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block">Assigned Staff</label>
                            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-white group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-[10px] font-bold">
                                        {booking.staff?.name?.split(' ').map(n => n[0]).join('') || '?'}
                                    </div>
                                    <span className="font-semibold text-sm text-text">{booking.staff?.name}</span>
                                </div>
                                <button className="p-1.5 rounded-lg hover:bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all">
                                    <UserPlus className="w-4 h-4" />
                                </button>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Admin Actions</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(booking.status === 'upcoming' || booking.status === 'pending') && (
                                    <button
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 border border-green-100 text-[11px] font-bold text-green-600 hover:bg-green-100 transition-all col-span-2"
                                        onClick={() => onUpdateStatus?.(booking._id, 'confirmed')}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRM APPOINTMENT
                                    </button>
                                )}
                                <button
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-[11px] font-bold text-text hover:bg-surface-alt transition-all"
                                    onClick={() => onReschedule?.(booking)}
                                >
                                    <RotateCcw className="w-3.5 h-3.5 text-blue-500" /> RESCHEDULE
                                </button>
                                <button
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-[11px] font-bold text-text hover:bg-surface-alt transition-all"
                                    onClick={() => onUpdateStatus?.(booking._id, 'no-show')}
                                >
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" /> NO-SHOW
                                </button>
                                <button
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-[11px] font-bold text-red-500 hover:bg-red-50 hover:border-red-100 transition-all col-span-2"
                                    onClick={() => onUpdateStatus?.(booking._id, 'cancelled')}
                                >
                                    <XCircle className="w-3.5 h-3.5" /> CANCEL BOOKING
                                </button>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="p-6 bg-surface border-t border-border mt-2">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Internal Notes (Admin Only)
                        </label>
                        {!isEditingNotes && (
                            <button
                                onClick={() => setIsEditingNotes(true)}
                                className="text-primary text-[10px] font-bold hover:underline"
                            >
                                EDIT NOTES
                            </button>
                        )}
                    </div>
                    {isEditingNotes ? (
                        <div className="space-y-3">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm min-h-[100px]"
                                placeholder="Add internal notes about this booking..."
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsEditingNotes(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-text-secondary hover:bg-surface-alt transition">Cancel</button>
                                <button
                                    onClick={() => {
                                        setIsEditingNotes(false);
                                        // Save logic here
                                    }}
                                    className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition"
                                >
                                    Save Notes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl bg-white border border-border/50 text-sm text-text-secondary">
                            {notes || 'No internal notes added yet.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
