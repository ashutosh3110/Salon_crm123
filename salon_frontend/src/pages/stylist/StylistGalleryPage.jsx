import { Plus, Grid, List, Camera, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const myGallery = [
    { id: 1, title: 'Icy Blonde Global', category: 'Hair Colour', date: '20 Feb 2024', image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&q=80&w=400', likes: 45 },
    { id: 2, title: 'Bridal Low Bun', category: 'Styling', date: '18 Feb 2024', image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=400', likes: 128 },
    { id: 3, title: 'Classic Fade', category: 'Hair Cut', date: '15 Feb 2024', image: 'https://images.unsplash.com/photo-1503910397258-41d3e21aa3d6?auto=format&fit=crop&q=80&w=400', likes: 32 },
    { id: 4, title: 'Sunset Balayage', category: 'Hair Colour', date: '10 Feb 2024', image: 'https://images.unsplash.com/photo-1620331311520-246422ff83f9?auto=format&fit=crop&q=80&w=400', likes: 89 },
    { id: 5, title: 'Bob Cut with Fringe', category: 'Hair Cut', date: '05 Feb 2024', image: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f47c?auto=format&fit=crop&q=80&w=400', likes: 54 },
    { id: 6, title: 'Engagement Makeup', category: 'Makeup', date: '01 Feb 2024', image: 'https://images.unsplash.com/photo-1481338618367-577bd20bbcfa?auto=format&fit=crop&q=80&w=400', likes: 210 },
];

export default function StylistGalleryPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Portfolio Gallery</h1>
                    <p className="text-sm text-text-muted font-medium">Showcase your best work and build your brand</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                    <Camera className="w-4 h-4" /> Upload New Work
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {['All Work', 'Hair Cut', 'Hair Colour', 'Styling', 'Makeup'].map((cat, i) => (
                        <button
                            key={cat}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-primary text-white shadow-md' : 'bg-surface border border-border/40 text-text-secondary hover:bg-surface-alt'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="hidden sm:flex items-center bg-surface border border-border/40 rounded-xl p-1 gap-1">
                    <button className="p-1.5 bg-background border border-border/10 rounded-lg shadow-sm text-primary">
                        <Grid className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-text-muted hover:text-text">
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGallery.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-square overflow-hidden bg-background">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-1.5">
                                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                                        <span className="text-sm font-bold">{item.likes}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.category}</span>
                                <span className="text-[10px] font-bold text-text-muted">{item.date}</span>
                            </div>
                            <h3 className="text-sm font-bold text-text group-hover:text-primary transition-colors">{item.title}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
