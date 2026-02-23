import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';

export default function ServiceCard({ service, onBook, index = 0 }) {
    const categoryColors = {
        Hair: 'bg-violet-50 text-violet-600',
        Skin: 'bg-rose-50 text-rose-600',
        Nails: 'bg-pink-50 text-pink-600',
        Spa: 'bg-emerald-50 text-emerald-600',
    };

    const badgeClass = categoryColors[service.category] || 'bg-gray-50 text-gray-600';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBook?.(service)}
            className="bg-white rounded-2xl border border-border/60 p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer active:bg-surface group"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${badgeClass}`}>
                            {service.category}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-text leading-snug truncate">{service.name}</h3>
                    {service.description && (
                        <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">{service.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-base font-extrabold text-primary">₹{service.price.toLocaleString()}</span>
                        <span className="flex items-center gap-1 text-[11px] text-text-muted font-medium">
                            <Clock className="w-3 h-3" /> {service.duration} min
                        </span>
                    </div>
                </div>

                <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </motion.div>
    );
}
