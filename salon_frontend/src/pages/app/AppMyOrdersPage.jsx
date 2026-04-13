import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import OrderCard from '../../components/app/OrderCard';
import { PackageX, Loader2, ChevronLeft } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import api from '../../services/api';

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
            <div className="pt-12 pb-6 flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                >
                    <ChevronLeft size={20} style={{ color: colors.text }} />
                </button>
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
                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: colors.text }} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Loading orders...</p>
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
                        />
                    ))
                )}
            </div>
        </motion.div>
    );
}
