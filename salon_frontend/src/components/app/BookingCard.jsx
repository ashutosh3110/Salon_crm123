import { motion } from 'framer-motion';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';

export default function BookingCard({ booking, onTap, index = 0 }) {
    const statusConfig = {
        pending: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Pending' },
        confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'Confirmed' },
        completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: 'Completed' },
        cancelled: { bg: 'bg-surface-alt', text: 'text-text-muted', label: 'Cancelled' },
    };

    const status = statusConfig[booking.status] || statusConfig.pending;

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTap?.(booking)}
            className={`bg-surface rounded-2xl border p-4 cursor-pointer hover:shadow-sm transition-all ${booking.status === 'cancelled' ? 'border-border/40 opacity-70' : 'border-border/60'
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-text truncate">{booking.service?.name}</h4>
                    <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3" /> {booking.staff?.name}
                    </p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg shrink-0 ${status.bg} ${status.text}`}>
                    {status.label}
                </span>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
                <span className="flex items-center gap-1 text-xs text-text-secondary font-medium">
                    <Calendar className="w-3 h-3 text-text-muted" />
                    {formatDate(booking.appointmentDate)}
                </span>
                <span className="flex items-center gap-1 text-xs text-text-secondary font-medium">
                    <Clock className="w-3 h-3 text-text-muted" />
                    {formatTime(booking.appointmentDate)}
                </span>
                <span className="ml-auto text-sm font-extrabold text-primary">₹{booking.price?.toLocaleString()}</span>
            </div>
        </motion.div>
    );
}
