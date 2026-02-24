import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Search, Zap, Star, ShieldCheck } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../data/appMockData';

const CategoryCard = ({ category, index }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/app/shop?category=${encodeURIComponent(category.name)}`)}
            className={`group relative overflow-hidden rounded-[32px] p-6 cursor-pointer border border-border/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 ${category.color}`}
        >
            <div className="flex justify-between items-start z-10 relative">
                <div className="space-y-4">
                    <div className="text-4xl">{category.icon}</div>
                    <div>
                        <h3 className="text-xl font-black text-text tracking-tighter group-hover:text-primary transition-colors">{category.name}</h3>
                        <p className="text-[10px] text-text-muted mt-1 font-bold tracking-wide uppercase">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-xl border border-border/20 w-fit">
                        <span className="text-[10px] font-black text-text tracking-tighter">{category.count} Products</span>
                        <ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute -bottom-6 -right-6 text-9xl opacity-[0.03] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 select-none">
                {category.icon}
            </div>
        </motion.div>
    );
};

export default function AppProductCategoriesPage() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-[2px] w-8 bg-primary rounded-full"></div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Explore Collections</span>
                </div>
                <h1 className="text-4xl font-black text-text tracking-tighter leading-[0.9] text-black">Browse All<br /><span className="text-primary/90 italic">Categories</span></h1>
                <p className="text-xs text-text-muted mt-3 font-medium leading-relaxed max-w-[280px]">Curated collections of the world's finest salon and professional care products.</p>
            </div>

            {/* Quick Stats Overlay (Floating) */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
                <div className="bg-surface border border-border/60 rounded-3xl p-4 flex items-center gap-3 min-w-[160px] shadow-sm bg-white">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Star className="w-5 h-5 fill-amber-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-tight">Top Rated</p>
                        <p className="text-sm font-black text-text italic tracking-tighter">4.9/5 Store</p>
                    </div>
                </div>
                <div className="bg-surface border border-border/60 rounded-3xl p-4 flex items-center gap-3 min-w-[180px] shadow-sm bg-white">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="w-5 h-5 fill-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-tight">Authenticity</p>
                        <p className="text-sm font-black text-text italic tracking-tighter">100% Genuine</p>
                    </div>
                </div>
            </div>

            {/* Grid of Categories */}
            <div className="grid grid-cols-1 gap-4">
                {PRODUCT_CATEGORIES.map((cat, i) => (
                    <CategoryCard key={cat._id} category={cat} index={i} />
                ))}
            </div>

            {/* Footer Upsell */}
            <div className="mt-8 bg-black rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl">
                <div className="relative z-10 space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Zap className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black tracking-tighter leading-tight italic">Unsure what fits<br />your hair type?</h4>
                        <p className="text-[11px] text-white/60 font-medium mt-1">Chat with our experts for a personalized regime.</p>
                    </div>
                    <button className="flex items-center gap-2 group/btn text-xs font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                        Consult Now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 right-10 text-9xl opacity-10 font-black italic scale-150 translate-y-1/4 pointer-events-none">SALON</div>
            </div>

            {/* Search Trigger */}
            <div className="fixed bottom-24 right-6 pointer-events-none">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 rounded-[24px] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 pointer-events-auto border-4 border-background/20 backdrop-blur-sm"
                >
                    <Search className="w-6 h-6" />
                </motion.button>
            </div>
        </div>
    );
}
