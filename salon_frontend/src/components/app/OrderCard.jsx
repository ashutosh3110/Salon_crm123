import { motion } from 'framer-motion';
import { Package, Calendar, CreditCard } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function OrderCard({ order, onTap, index = 0 }) {
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
        processing: {
            bg: isLight ? 'bg-blue-100' : 'bg-blue-500/10',
            text: isLight ? 'text-blue-700' : 'text-blue-400',
            label: 'Processing'
        },
        shipped: {
            bg: isLight ? 'bg-indigo-100' : 'bg-indigo-500/10',
            text: isLight ? 'text-indigo-700' : 'text-indigo-400',
            label: 'Shipped'
        },
        delivered: {
            bg: isLight ? 'bg-emerald-100' : 'bg-emerald-500/10',
            text: isLight ? 'text-emerald-700' : 'text-emerald-400',
            label: 'Delivered'
        },
        cancelled: {
            bg: isLight ? 'bg-gray-100' : 'bg-white/5',
            text: isLight ? 'text-gray-500' : 'text-white/40',
            label: 'Cancelled'
        },
    };

    const status = statusConfig[order.status] || statusConfig.pending;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTap?.(order)}
            style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.02)' : 'none'
            }}
            className={`rounded-2xl p-5 cursor-pointer hover:border-[#C8956C]/30 transition-all ${order.status === 'cancelled' ? 'opacity-70' : ''}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black uppercase tracking-tight truncate" style={{ color: colors.text }}>
                        Order #{order._id.slice(-6).toUpperCase()}
                    </h4>
                    <p className="text-[10px] mt-1 flex items-center gap-1.5 font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                        <Package className="w-3 h-3 text-[#C8956C]" /> {order.items?.length || 0} Products
                    </p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shrink-0 border border-current opacity-80 ${status.bg} ${status.text}`}
                >
                    {status.label}
                </span>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar py-1">
                {order.items?.map((item, i) => (
                    <div key={i} className="shrink-0 w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 overflow-hidden">
                        <img 
                            src={item.productId?.image || 'https://via.placeholder.com/150'} 
                            alt={item.productId?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t" style={{ borderTopColor: colors.border }}>
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                    <Calendar className="w-3 h-3 text-[#C8956C]" />
                    {formatDate(order.createdAt)}
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                    <CreditCard className="w-3 h-3 text-[#C8956C]" />
                    {order.paymentMethod?.toUpperCase()}
                </span>
                <span className="ml-auto text-sm font-black text-[#C8956C] tracking-tighter">₹{(order.totalAmount || 0).toLocaleString()}</span>
            </div>
        </motion.div>
    );
}
