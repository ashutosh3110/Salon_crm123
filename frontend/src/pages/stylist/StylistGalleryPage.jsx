import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Image as ImageIcon, Plus, LayoutGrid, List, Heart, X, Upload, Disc, Search, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { API_BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';

const defaultCategories = ['HAIR CUT', 'HAIR COLOR', 'BRIDAL', 'FACIAL', 'NAIL ART'];

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${API_BASE_URL}/${cleanUrl}`;
};

export default function StylistGalleryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('grid');
    const [galleryItems, setGalleryItems] = useState([]);
    const [categories, setCategories] = useState(['ALL']);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [likedItems, setLikedItems] = useState(new Set());

    // Form inputs
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(defaultCategories[0]);
    const [customCategory, setCustomCategory] = useState('');

    const toggleLike = (id) => {
        const newLiked = new Set(likedItems);
        if (newLiked.has(id)) newLiked.delete(id);
        else newLiked.add(id);
        setLikedItems(newLiked);
    };

    const fetchGallery = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/gallery/me');
            if (res.data && res.data.success) {
                const items = res.data.data || [];
                setGalleryItems(items);

                // Build unique categories list dynamically
                const uniqCats = new Set(['ALL']);
                items.forEach(item => {
                    if (item.category) uniqCats.add(item.category.toUpperCase());
                });
                // Ensure default categories are present in the unique list
                defaultCategories.forEach(c => uniqCats.add(c.toUpperCase()));
                setCategories(Array.from(uniqCats));
            }
        } catch (err) {
            console.error('Error fetching gallery:', err);
            toast.error('Failed to load portfolio items');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select an image file');
            return;
        }

        const categoryToSend = selectedCategory === 'CUSTOM' 
            ? customCategory.trim().toUpperCase() 
            : selectedCategory.toUpperCase();

        if (!categoryToSend) {
            toast.error('Please specify a category');
            return;
        }

        setUploading(true);
        try {
            // 1. Upload file
            const formData = new FormData();
            formData.append('image', file);
            
            const uploadRes = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data && uploadRes.data.success) {
                const imageUrl = uploadRes.data.url;

                // 2. Create gallery document
                const galleryRes = await api.post('/gallery', {
                    title,
                    description,
                    category: categoryToSend,
                    imageUrl
                });

                if (galleryRes.data && galleryRes.data.success) {
                    toast.success('Portfolio item uploaded successfully!');
                    setShowUploadModal(false);
                    // Clear fields
                    setFile(null);
                    setPreviewUrl(null);
                    setTitle('');
                    setDescription('');
                    setSelectedCategory(defaultCategories[0]);
                    setCustomCategory('');
                    // Refresh data
                    fetchGallery();
                }
            }
        } catch (err) {
            console.error('Gallery upload error:', err);
            toast.error(err.response?.data?.message || 'Failed to upload portfolio item');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;
        try {
            const res = await api.delete(`/gallery/${id}`);
            if (res.data && res.data.success) {
                toast.success('Portfolio item deleted');
                setGalleryItems(prev => prev.filter(item => item._id !== id));
            }
        } catch (err) {
            console.error('Gallery delete error:', err);
            toast.error('Failed to delete item');
        }
    };

    const filteredItems = galleryItems.filter(item => {
        const itemCat = (item.category || '').toUpperCase();
        const matchesCategory = activeCategory === 'ALL' || itemCat === activeCategory;
        const matchesSearch = 
            (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            itemCat.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-4 text-left font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Camera className="w-4 h-4 text-[#7C3AED]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C3AED]">My Portfolio</span>
                    </div>
                    <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Style Gallery</h1>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5 italic">Keep your portfolio updated with your best work</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-[#7C3AED] text-white font-bold text-[11px] uppercase tracking-[0.1em] shadow-md shadow-[#7C3AED]/20 hover:scale-[1.02] transition-all active:scale-95 w-full md:w-auto rounded-xl justify-center shrink-0"
                >
                    <Plus className="w-4 h-4" /> Add New Style
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                                    activeCategory === cat 
                                        ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative group/search w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by category or style..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold focus:outline-none focus:border-[#7C3AED] transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-1.5 border-t border-slate-200 dark:border-slate-800 pt-2 h-8">
                    <button
                        onClick={() => setView('grid')}
                        className={`p-1.5 rounded transition-all ${view === 'grid' ? 'text-[#7C3AED] bg-[#7C3AED]/10' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`p-1.5 rounded transition-all ${view === 'list' ? 'text-[#7C3AED] bg-[#7C3AED]/10' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
                    <span className="text-[13px] font-medium">Loading portfolio...</span>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-[13px] font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No portfolio styles found.
                </div>
            ) : (
                /* Gallery Matrix */
                <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => {
                            const isLiked = likedItems.has(item._id);
                            return (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl overflow-hidden relative shadow-sm hover:shadow-md transition-all ${
                                        view === 'list' ? 'flex items-center gap-3 p-2' : ''
                                    }`}
                                >
                                    <div className={`relative overflow-hidden bg-slate-50 dark:bg-slate-900 ${
                                        view === 'list' ? 'w-24 h-24 rounded-xl shrink-0' : 'aspect-square w-full'
                                    }`}>
                                        <img 
                                            src={getImageUrl(item.imageUrl)} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200';
                                            }}
                                        />
                                    </div>

                                    <div className={`p-4 flex-1 relative flex flex-col justify-between ${view === 'list' ? 'h-full py-1' : ''}`}>
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <div>
                                                    <span className="text-[8px] font-black text-[#7C3AED] bg-[#7C3AED]/10 px-1.5 py-0.5 rounded uppercase tracking-wider block w-max">
                                                        {item.category}
                                                    </span>
                                                    <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">{item.title}</h3>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-1 rounded bg-slate-50 hover:bg-red-50 hover:text-red-500 dark:bg-slate-700 dark:hover:bg-red-950/20 text-slate-400 transition"
                                                    title="Delete Style"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            {item.description && (
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700/50 mt-1">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleLike(item._id)}
                                                    className={`flex items-center gap-1 text-[10px] font-bold transition-all ${
                                                        isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                                                    }`}
                                                >
                                                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                                    {isLiked ? (item.likes || 0) + 1 : (item.likes || 0)}
                                                </button>
                                            </div>
                                            <span className="text-[9px] text-slate-400 font-bold">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' }) : ''}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !uploading && setShowUploadModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl relative p-6 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] -translate-y-4 translate-x-4">
                                <Disc className="w-24 h-24 text-[#7C3AED] animate-spin-slow" />
                            </div>
                            <div className="flex items-center justify-between mb-6 relative z-10 shrink-0">
                                <div>
                                    <h2 className="text-[16px] font-bold text-slate-950 dark:text-white uppercase tracking-tight">Upload Style</h2>
                                    <p className="text-[9px] font-bold text-[#7C3AED] mt-0.5 uppercase tracking-widest">Add photo reference of your recent work</p>
                                </div>
                                <button disabled={uploading} onClick={() => setShowUploadModal(false)} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleUploadSubmit} className="space-y-4 relative z-10 flex-1 overflow-y-auto no-scrollbar">
                                {/* File Uploader */}
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                        className="hidden" 
                                        id="gallery-file-input"
                                        disabled={uploading}
                                    />
                                    <label 
                                        htmlFor="gallery-file-input"
                                        className="block border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 text-center hover:border-[#7C3AED]/50 rounded-xl transition-all group cursor-pointer bg-slate-50 dark:bg-slate-850/50"
                                    >
                                        {previewUrl ? (
                                            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-black">
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider">
                                                    Change Image
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#7C3AED] mx-auto mb-2 transition-all" />
                                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-800">Click to select image file</p>
                                                <p className="text-[8px] text-slate-400 uppercase mt-1 italic">JPG, PNG, WEBP</p>
                                            </>
                                        )}
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Style Title</label>
                                        <input 
                                            required 
                                            type="text" 
                                            disabled={uploading}
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Blonde Balayage" 
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold outline-none focus:border-[#7C3AED] text-slate-900 dark:text-slate-100" 
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Description (Optional)</label>
                                        <textarea 
                                            disabled={uploading}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe the hair structure, technique or products used..." 
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold outline-none focus:border-[#7C3AED] text-slate-900 dark:text-slate-100 h-16 resize-none" 
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Category</label>
                                        <div className="relative">
                                            <select 
                                                required
                                                disabled={uploading}
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold outline-none appearance-none rounded-xl text-slate-900 dark:text-slate-100"
                                            >
                                                {defaultCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                                <option value="CUSTOM">OTHER / CUSTOM CATEGORY...</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-450" />
                                        </div>
                                    </div>

                                    {selectedCategory === 'CUSTOM' && (
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Specify Custom Category</label>
                                            <input 
                                                required 
                                                type="text" 
                                                disabled={uploading}
                                                value={customCategory}
                                                onChange={(e) => setCustomCategory(e.target.value)}
                                                placeholder="e.g. SHAVING" 
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold outline-none focus:border-[#7C3AED] text-slate-900 dark:text-slate-100" 
                                            />
                                        </div>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={uploading}
                                    className="w-full py-3 bg-[#7C3AED] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl shadow-lg shadow-[#7C3AED]/10 hover:bg-[#6D28D9] transition-all flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading style...
                                        </>
                                    ) : 'Upload to Gallery'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Added extra padding at the bottom so it doesn't get covered by the mobile navbar */}
            <div className="h-20 lg:h-0 flex-shrink-0" />
        </div>
    );
}
