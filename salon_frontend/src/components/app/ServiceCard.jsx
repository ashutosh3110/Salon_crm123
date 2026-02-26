import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function ServiceCard({ service, onBook, index = 0 }) {
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const colors = {
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        surface: isLight ? '#F8F9FA' : '#242424',
    };

    const categoryColors = {
        Hair: isLight ? 'bg-violet-500/10 text-violet-600' : 'bg-violet-500/20 text-violet-400',
        Skin: isLight ? 'bg-rose-500/10 text-rose-600' : 'bg-rose-500/20 text-rose-400',
        Nails: isLight ? 'bg-pink-500/10 text-pink-600' : 'bg-pink-500/20 text-pink-400',
        Spa: isLight ? 'bg-emerald-500/10 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400',
    };

    const badgeClass = categoryColors[service.category] || (isLight ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-400');

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBook?.(service)}
            style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
            }}
            className="rounded-2xl p-5 shadow-sm active:bg-opacity-80 transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-widest ${badgeClass}`}>
                            {service.category}
                        </span>
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-tight italic" style={{ color: colors.text, fontFamily: "'Inter', sans-serif" }}>
                        {service.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="text-base font-black text-[#C8956C] tracking-tighter">₹{service.price.toLocaleString()}</span>
                        <span className="w-1 h-1 rounded-full bg-black/10 dark:bg-white/10" />
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: colors.textMuted }}>
                            <Clock className="w-3.5 h-3.5 text-[#C8956C]" /> {service.duration} MIN
                        </span>
                    </div>
                </div>

                <div className="shrink-0 w-10 h-10 rounded-2xl bg-[#C8956C]/5 flex items-center justify-center group-hover:bg-[#C8956C]/10 transition-colors">
                    <ChevronRight className="w-5 h-5 text-[#C8956C] group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </motion.div>
    );
}
