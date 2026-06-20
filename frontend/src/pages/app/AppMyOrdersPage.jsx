import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import OrderCard from '../../components/app/OrderCard';
import { PackageX, Loader2, ChevronLeft } from 'lucide-react';
import AppBackButton from '../../components/app/AppBackButton';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import api from '../../services/api';

const OrderSkeleton = () => {
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const bg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    
    return (
        <div 
            className="rounded-2xl p-5 border animate-pulse"
            style={{ 
                background: isLight ? '#FFFFFF' : '#1A1A1A',
                borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'
            }}
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-md" style={{ background: bg }} />
                    <div className="h-3 w-1/2 rounded-md" style={{ background: bg }} />
                </div>
                <div className="h-7 w-24 rounded-lg" style={{ background: bg }} />
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {[1, 2, 3].map(i => (
                    <div key={i} className="shrink-0 w-12 h-12 rounded-xl" style={{ background: bg }} />
                ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderTopColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }}>
                <div className="h-3 w-16 rounded-md" style={{ background: bg }} />
                <div className="h-4 w-20 rounded-md" style={{ background: bg }} />
            </div>
        </div>
    );
};

export default function AppMyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/me');
                if (res.data?.success) {
                    setOrders(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch orders', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 pb-24 min-h-svh"
            style={{ background: colors.bg }}
        >
            {/* Header */}
            <div className="sticky top-0 z-50 pt-6 pb-6 flex items-center gap-4" style={{ background: colors.bg }}>
                <AppBackButton />
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: colors.text, fontFamily: "'SF Pro Display', sans-serif" }}>
                        My <span className="text-[#C8956C]">Orders</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest mt-0.5 opacity-60 font-bold" style={{ color: colors.textMuted }}>Product Purchase History</p>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
                    </div>
                ) : orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: colors.card, border: `1px dashed ${colors.border}` }}
                        className="text-center py-20 rounded-3xl"
                    >
                        <div style={{ background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', border: `1px solid ${colors.border}` }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PackageX className="w-8 h-8 opacity-20" style={{ color: colors.text }} />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: colors.text }}>No Orders Found</p>
                        <p className="text-[10px] mt-2 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed opacity-40" style={{ color: colors.textMuted }}>
                            You haven't purchased any products yet.
                        </p>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/app/shop')}
                            className="mt-8 px-8 py-3 bg-[#C8956C] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#C8956C]/20"
                        >
                            Explore Shop
                        </motion.button>
                    </motion.div>
                ) : (
                    orders.map((order, i) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            index={i}
                            onTap={(o) => navigate(`/app/orders/${o._id}`)}
                        />
                    ))
                )}
            </div>
        </motion.div>
    );
}
