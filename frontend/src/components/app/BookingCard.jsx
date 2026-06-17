import { memo } from 'react';
import { motion } from 'framer-motion';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { getImageUrl } from '../../utils/imageUtils';

const fallbackImage = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200";

const BookingCard = memo(({ booking, onTap, index = 0 }) => {
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const colors = {
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#718096' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
    };

    const statusConfig = {
        pending: {
            bg: '#FFF9E6',
            text: '#D97706',
            label: 'Pending'
        },
        confirmed: {
            bg: '#F0FDF4',
            text: '#16A34A',
            label: 'Confirmed'
        },
        completed: {
            bg: '#EFF6FF',
            text: '#2563EB',
            label: 'Completed'
        },
        cancelled: {
            bg: '#FEF2F2',
            text: '#DC2626',
            label: 'Cancelled'
        },
    };

    const status = statusConfig[booking.status] || statusConfig.pending;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        return booking.time || new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const outletName = booking.outlet?.name || 'Looks & Style Salon';
    const outletLocation = booking.outlet?.address
        ? `${booking.outlet.address.city || ''}, ${booking.outlet.address.state || ''}`.replace(/^,\s*/, '')
        : 'Azamgarh, UP';

    const serviceName = booking.service?.name || 'Hair Spa, Hair Cut & Style';
    const staffName = booking.staff?.name || 'Rahul Stylist';
    const priceAmount = booking.totalPrice || booking.price || 798;

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
                borderRadius: '16px',
                padding: '16px',
                boxShadow: isLight ? '0 4px 16px -4px rgba(0, 0, 0, 0.04)' : 'none',
                marginBottom: '4px'
            }}
            className="w-full text-left"
        >
            {/* Salon Info Header Row */}
            <div className="flex gap-3 items-start mb-2">
                <img
                    src={getImageUrl(booking.outlet?.image || booking.outlet?.images?.[0]) || fallbackImage}
                    alt={outletName}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        objectFit: 'cover'
                    }}
                    onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                />
                <div className="flex flex-col justify-center">
                    <h3 className="text-[14px] font-bold text-slate-900 leading-tight mb-0.5" style={{ color: colors.text }}>
                        {outletName}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400" style={{ color: colors.textMuted }}>
                        {outletLocation}
                    </p>
                </div>
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3">
                {/* Row 1 */}
                <div>
                    <p className="text-[11px] font-medium text-slate-400 mb-0" style={{ color: colors.textMuted }}>Date</p>
                    <p className="text-[12px] font-bold text-slate-800" style={{ color: colors.text }}>{formatDate(booking.appointmentDate)}</p>
                </div>
                <div>
                    <p className="text-[11px] font-medium text-slate-400 mb-0" style={{ color: colors.textMuted }}>Time</p>
                    <p className="text-[12px] font-bold text-slate-800" style={{ color: colors.text }}>{formatTime(booking.appointmentDate)}</p>
                </div>

                {/* Row 2 */}
                <div>
                    <p className="text-[11px] font-medium text-slate-400 mb-0" style={{ color: colors.textMuted }}>Service</p>
                    <p className="text-[12px] font-bold text-slate-800 truncate" style={{ color: colors.text }}>{serviceName}</p>
                </div>
                <div>
                    <p className="text-[11px] font-medium text-slate-400 mb-0" style={{ color: colors.textMuted }}>Staff</p>
                    <p className="text-[12px] font-bold text-slate-800 truncate" style={{ color: colors.text }}>{staffName}</p>
                </div>

                {/* Row 3 */}
                <div>
                    <p className="text-[11px] font-medium text-slate-400 mb-0" style={{ color: colors.textMuted }}>Price</p>
                    <p className="text-[16px] font-black text-slate-900 leading-none" style={{ color: colors.text }}>₹{priceAmount}</p>
                </div>
                <div className="flex items-end justify-start">
                    <span
                        style={{
                            background: status.bg,
                            color: status.text,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: '700',
                            display: 'inline-block'
                        }}
                    >
                        {status.label}
                    </span>
                </div>
            </div>

            {/* Buttons */}
            {['pending', 'confirmed'].includes(booking.status) && (
                <div className="flex gap-3 mt-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onTap?.(booking);
                        }}
                        style={{
                            flex: 1,
                            padding: '9px 0',
                            borderRadius: '10px',
                            background: '#F3F4F6',
                            color: '#1E293B',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Reschedule
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onTap?.(booking);
                        }}
                        style={{
                            flex: 1,
                            padding: '9px 0',
                            borderRadius: '10px',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </motion.div>
    );
});

BookingCard.displayName = 'BookingCard';
export default BookingCard;
