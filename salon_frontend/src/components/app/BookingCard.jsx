import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function BookingCard({ booking, onTap, index = 0 }) {
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const colors = {
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
    };

    const statusConfig = {
        pending: {
            bg: isLight ? 'bg-amber-100' : 'bg-amber-500/10',
            text: isLight ? 'text-amber-700' : 'text-amber-400',
            label: 'Pending'
        },
        confirmed: {
            bg: isLight ? 'bg-blue-100' : 'bg-blue-500/10',
            text: isLight ? 'text-blue-700' : 'text-blue-400',
            label: 'Confirmed'
        },
        completed: {
            bg: isLight ? 'bg-emerald-100' : 'bg-emerald-500/10',
            text: isLight ? 'text-emerald-700' : 'text-emerald-400',
            label: 'Completed'
        },
        cancelled: {
            bg: isLight ? 'bg-gray-100' : 'bg-white/5',
            text: isLight ? 'text-gray-500' : 'text-white/40',
            label: 'Cancelled'
        },
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
            style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.02)' : 'none'
            }}
            className={`rounded-2xl p-5 cursor-pointer hover:border-[#C8956C]/30 transition-all ${booking.status === 'cancelled' ? 'opacity-70' : ''}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black uppercase tracking-tight truncate" style={{ color: colors.text }}>{booking.service?.name}</h4>
                    <p className="text-[10px] mt-1 flex items-center gap-1.5 font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                        <User className="w-3 h-3 text-[#C8956C]" /> {booking.staff?.name}
                    </p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shrink-0 border border-current opacity-80 ${status.bg} ${status.text}`}
                >
                    {status.label}
                </span>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t" style={{ borderTopColor: colors.border }}>
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                    <Calendar className="w-3 h-3 text-[#C8956C]" />
                    {formatDate(booking.appointmentDate)}
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                    <Clock className="w-3 h-3 text-[#C8956C]" />
                    {formatTime(booking.appointmentDate)}
                </span>
                <span className="ml-auto text-sm font-black text-[#C8956C] tracking-tighter">₹{booking.price?.toLocaleString()}</span>
            </div>
        </motion.div>
    );
}
