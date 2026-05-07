import { useState } from 'react';
import { Camera, Image as ImageIcon, Plus, Filter, LayoutGrid, List, Heart, MessageSquare, Share2, MoreHorizontal, Activity, Zap, Shield, X, CheckCircle2, Upload, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import stylistData from '../../data/stylistMockData.json';

const galleryItems = stylistData.gallery.items;
const categories = stylistData.gallery.categories;

export default function StylistGalleryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('grid');
    const [activeCategory, setActiveCategory] = useState('ALL_VECTORS');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [likedItems, setLikedItems] = useState(new Set());

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const toggleLike = (id) => {
        const newLiked = new Set(likedItems);
        if (newLiked.has(id)) newLiked.delete(id);
        else newLiked.add(id);
        setLikedItems(newLiked);
    };

    const filteredItems = galleryItems.filter(item => {
        const matchesCategory = activeCategory === 'ALL_VECTORS' || item.category === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-4 text-left font-black">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Camera className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">My Portfolio</span>
                    </div>
                    <h1 className="text-2xl font-black text-text tracking-tighter uppercase">Hair Style Gallery</h1>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5 italic">Keep your best work updated</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-5 py-3.5 bg-primary text-white font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add New Style
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface border border-border p-1.5 shadow-inner">
                <div className="flex flex-col md:flex-row items-center gap-3 w-full">
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2.5 text-[8px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-text-muted hover:text-text hover:bg-surface-alt'}`}
                            >
                                {cat.replace('_VECTORS', '')}
                            </button>
                        ))}
                    </div>

                    <div className="relative group/search flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted/50 group-focus-within/search:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by category or style..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border text-[8px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/30 shadow-inner"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-1 border-l border-border/20 pl-4 h-8">
                    <button
                        onClick={() => setView('grid')}
                        className={`p-1.5 transition-all ${view === 'grid' ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                    >
                        <LayoutGrid className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`p-1.5 transition-all ${view === 'list' ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                    >
                        <List className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>

            {/* Gallery Matrix */}
            <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`group bg-surface border border-border overflow-hidden relative ${view === 'list' ? 'flex items-center' : ''}`}
                        >
                            <div className={`relative overflow-hidden ${view === 'list' ? 'w-48 h-32 shrink-0' : 'aspect-square'}`}>
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="h-0.5 w-12 bg-white" />
                                </div>
                            </div>

                            <div className="p-6 flex-1 relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1 italic">[{item.category.replace('_VECTORS', '')}]</p>
                                        <h3 className="text-sm font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-[9px] text-text-muted uppercase tracking-widest mt-1">DATE: {item.date}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleLike(item.id)}
                                            className={`p-2 border border-border transition-all ${likedItems.has(item.id) ? 'bg-rose-500/10 border-rose-500 text-rose-500' : 'text-text-muted hover:text-rose-500'}`}
                                        >
                                            <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'fill-rose-500' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/10">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-text-muted flex items-center gap-1.5 uppercase hover:text-primary cursor-pointer transition-colors">
                                            <MessageSquare className="w-3.5 h-3.5" /> 24
                                        </span>
                                        <span className="text-[10px] font-black text-text-muted flex items-center gap-1.5 uppercase transition-colors">
                                            <Heart className="w-3.5 h-3.5" /> {likedItems.has(item.id) ? item.likes + 1 : item.likes}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => showToast(`Gallery link copied: ${item.title}`)}
                                            className="p-1.5 hover:text-primary transition-colors"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 hover:text-primary transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUploadModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg rounded-none border border-border shadow-2xl relative p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 -translate-y-4 translate-x-4 animate-pulse">
                                <Disc className="w-32 h-32 text-primary" />
                            </div>
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Upload Photo</h2>
                                    <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest">Add a photo of your recent work</p>
                                </div>
                                <button onClick={() => setShowUploadModal(false)} className="w-10 h-10 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setShowUploadModal(false);
                                    showToast("New photo successfully added to gallery.");
                                }}
                                className="space-y-6 relative z-10"
                            >
                                <div className="border-2 border-dashed border-border p-12 text-center hover:border-primary/50 transition-all group cursor-pointer bg-background/50">
                                    <Upload className="w-10 h-10 text-text-muted group-hover:text-primary mx-auto mb-4 transition-all" />
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] group-hover:text-text">Click to select image file</p>
                                    <p className="text-[8px] text-text-muted/60 uppercase mt-2 italic">Supporting: JPEG, PNG, WEBP</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Style Name</label>
                                        <input required type="text" placeholder="e.g. Blonde Balayage" className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Style Category</label>
                                        <select required className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none appearance-none">
                                            {categories.slice(1).map(c => <option key={c} value={c}>{c.replace('_VECTORS', '')}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">Upload to Gallery</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
