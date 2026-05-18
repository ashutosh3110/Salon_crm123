import { useState, useEffect, useRef } from 'react';
import {
    Plus, Search, Filter, MoreHorizontal, Edit2,
    Trash2, Eye, Globe, Lock, Clock, Calendar,
    CheckCircle2, AlertCircle, FileText, Image as ImageIcon,
    ChevronLeft, ChevronRight, Save, X, Sparkles,
    MousePointer2, Share2, SearchCode, Megaphone, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';


export default function SABlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [toast, setToast] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    const [contentLength, setContentLength] = useState(0);
    const [wordCount, setWordCount] = useState(0);

    const openEditor = (post = null) => {
        setEditingPost(post);
        setContentLength(post?.content?.length || 0);
        setWordCount(post?.content?.split(/\s+/).filter(Boolean).length || 0);
        setSelectedImage(null);
        setPreviewUrl('');
        setIsEditorOpen(true);
    };

    const handleContentChange = (e) => {
        const val = e.target.value;
        setContentLength(val.length);
        setWordCount(val.trim().split(/\s+/).filter(Boolean).length);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        if (isEditorOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.paddingRight = '5px';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isEditorOpen]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/blogs');
            setPosts(data);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            showToast("Failed to fetch articles.");
        } finally {
            setLoading(false);
        }
    };



    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to decommission this editorial? This action is irreversible.")) {
            try {
                await api.delete(`/blogs/${id}`);
                setPosts(posts.filter(p => p._id !== id));
                showToast("Article deleted.");
            } catch (err) {
                console.error('Delete failed:', err);
                showToast("Delete failed.");
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSavePost = async (e, forcedStatus = null) => {
        if (e) e.preventDefault();
        setUploading(true);
        try {
            const form = document.getElementById('article-form');
            const formData = new FormData(form);
            let imageUrl = editingPost?.image || "https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200";

            if (selectedImage) {
                const imageFormData = new FormData();
                imageFormData.append('image', selectedImage);
                const { data: uploadRes } = await api.post('/blogs/upload-image', imageFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = uploadRes.url;
            }

            const postData = {
                title: formData.get('title'),
                content: formData.get('content'),
                author: "Wapixo HQ",
                image: imageUrl,
                status: forcedStatus || 'published'
            };

            if (editingPost) {
                const { data: updated } = await api.patch(`/blogs/${editingPost._id}`, postData);
                setPosts(posts.map(p => p._id === editingPost._id ? updated : p));
            } else {
                const { data: created } = await api.post('/blogs', postData);
                setPosts([created, ...posts]);
            }

            setIsEditorOpen(false);
            setEditingPost(null);
            setSelectedImage(null);
            setPreviewUrl('');
            showToast(forcedStatus === 'draft' ? "Article saved as draft." : "Article published.");
        } catch (err) {
            console.error('Save failed:', err);
            showToast("Failed to save article.");
        } finally {
            setUploading(false);
        }
    };

    const filteredPosts = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        if (filter === 'all') return matchesSearch;
        return matchesSearch && p.status === filter;
    });

    return (
        <div className="space-y-6 pb-20 sa-panel min-h-screen bg-[#fafafa]">
            {/* Toast feedback */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="fixed top-20 right-8 bg-black text-white px-8 py-4 shadow-2xl z-[100] flex items-center gap-4 border-l-4 border-primary"
                    >
                        <CheckCircle2 size={18} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header / Command Center */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-border p-8 regular-radius shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-black text-2xl shadow-xl">
                        W
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Articles & <span className="text-primary">News</span></h1>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.3em] mt-2">Manage your blog posts and news updates</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-6 py-3 border border-border bg-surface regular-radius flex flex-col items-center">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Total Articles</span>
                        <span className="text-lg font-black leading-none">{posts.length}</span>
                    </div>
                    <button
                        onClick={() => openEditor(null)}
                        className="px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all flex items-center gap-3 regular-radius shadow-2xl shadow-black/10 active:scale-[0.98]"
                    >
                        <Plus size={16} /> Create New Article
                    </button>
                </div>
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-border text-text-secondary shrink-0 shadow-sm">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search article titles or categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-white border border-border px-6 py-4.5 text-xs font-bold uppercase tracking-widest outline-none regular-radius focus:ring-1 ring-primary/20 transition-all shadow-sm"
                    />
                </div>
                <div className="flex bg-white p-2 border border-border regular-radius shadow-sm">
                    {['all', 'published', 'draft'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all regular-radius
                                ${filter === f ? 'bg-black text-white shadow-lg' : 'bg-transparent text-text-muted hover:text-text'}
                            `}
                        >
                            {f === 'all' ? 'All Articles' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white border border-border regular-radius shadow-sm">
                    <Loader2 size={40} className="text-primary animate-spin mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Loading Articles...</p>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white border border-border regular-radius shadow-sm">
                    <AlertCircle size={40} className="text-text-muted mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">No articles found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => (
                        <motion.div
                            layout
                            key={post._id}
                            className="group bg-white border border-border regular-radius overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all duration-700"
                        >
                        {/* Preview Asset */}
                        <div className="relative h-64 overflow-hidden bg-black">
                            <img
                                src={getImageUrl(post.image)}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
                            />
                            <div className="absolute top-6 right-6">
                                <span className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest shadow-xl border border-white/10 backdrop-blur-md
                                    ${post.status === 'published' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}
                                `}>
                                    {post.status === 'published' ? 'Deployed' : 'Staging'}
                                </span>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent translate-y-full group-hover:translate-y-0 transition-all duration-500">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => openEditor(post)}
                                        className="flex-1 bg-white text-black py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-2 regular-radius shadow-xl"
                                    >
                                        <Edit2 size={12} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post._id)}
                                        className="w-12 h-12 bg-red-600/90 text-white flex items-center justify-center hover:bg-black transition-all shadow-xl"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Narrative Intel */}
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-4">
                                <Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </div>
                            <h3 className="text-xl font-black tracking-tighter uppercase leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-8">
                                {post.title}
                            </h3>

                            <div className="pt-6 border-t border-border flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-surface text-black text-[10px] font-black flex items-center justify-center border border-border">
                                        {post.author[0]}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-text uppercase tracking-widest">{post.author}</div>
                                        <div className="text-[8px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Editor Unit</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                </div>
            )}

            {/* Editorial Configurator Modal */}
            <AnimatePresence>
                {isEditorOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setIsEditorOpen(false)} 
                            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.96, y: 30 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.96, y: 30 }} 
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative bg-[#fafafa] w-full max-w-3xl h-[92vh] overflow-hidden flex flex-col shadow-2xl rounded-3xl border border-border"
                        >

                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-white shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-text uppercase tracking-tight flex items-center gap-2">
                                            Article <span className="text-primary font-black">Studio</span>
                                        </h3>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
                                            {editingPost ? 'Refining Editorial Piece' : 'Drafting New Article Entry'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-xl border border-emerald-100 shadow-sm animate-pulse">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[9px] font-black uppercase tracking-wider">Cloud Synchronized</span>
                                    </div>
                                    <button 
                                        onClick={() => setIsEditorOpen(false)} 
                                        className="w-10 h-10 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded-full transition-all border border-border hover:border-red-200"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <form id="article-form" onSubmit={(e) => handleSavePost(e, 'published')} className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="max-w-2xl mx-auto space-y-6">
                                    
                                    {/* Headline Card */}
                                    <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-3">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            <Megaphone className="w-3.5 h-3.5 text-primary" /> Article Headline
                                        </label>
                                        <input
                                            required 
                                            name="title"
                                            defaultValue={editingPost?.title}
                                            className="w-full bg-slate-50/50 border border-border rounded-xl px-4 py-3.5 text-lg font-bold text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="Write a compelling headline..."
                                        />
                                    </div>

                                    {/* Cover Media Card */}
                                    <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-3">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            <ImageIcon className="w-3.5 h-3.5 text-primary" /> Cover Media Asset
                                        </label>
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative group aspect-video bg-slate-50 border-2 border-dashed border-border hover:border-primary/55 rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all hover:bg-slate-100/50"
                                        >
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={handleImageChange} 
                                                className="hidden" 
                                                accept="image/*" 
                                            />
                                            {(previewUrl || editingPost?.image) ? (
                                                <div className="w-full h-full relative">
                                                    <img 
                                                        src={previewUrl || getImageUrl(editingPost?.image)} 
                                                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" 
                                                        alt="Preview"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                                        <span className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                                            Replace Asset
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center p-6 space-y-2.5">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto text-text-muted group-hover:text-primary group-hover:scale-110 transition-all shadow-sm border border-border">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-text">Choose Cover Image</span>
                                                        <p className="text-[9px] text-text-muted font-semibold mt-1">PNG, JPG, WEBP up to 10MB</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Intel Slate (Content Editor) */}
                                    <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-primary" /> Story Intel
                                            </label>
                                            <div className="flex items-center gap-2 text-[9px] text-text-muted font-bold uppercase tracking-wider">
                                                <span>Words: <strong className="text-text">{wordCount}</strong></span>
                                                <span className="text-border">|</span>
                                                <span>Chars: <strong className="text-text">{contentLength}</strong></span>
                                            </div>
                                        </div>
                                        <textarea
                                            name="content"
                                            defaultValue={editingPost?.content}
                                            onChange={handleContentChange}
                                            required
                                            className="w-full bg-slate-50/50 border border-border rounded-xl p-4 text-sm leading-relaxed text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[180px] font-medium"
                                            placeholder="Write your article narrative here..."
                                        />
                                    </div>

                                    {/* Action Hub */}
                                    <div className="pt-4 grid grid-cols-2 gap-4">
                                        <button 
                                            type="button"
                                            onClick={(e) => handleSavePost(e, 'draft')}
                                            disabled={uploading}
                                            className="py-4 bg-white border border-border text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 active:scale-[0.98] transition-all rounded-xl shadow-sm disabled:opacity-50"
                                        >
                                            Save as Draft
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={uploading}
                                            className="py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary active:scale-[0.98] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2.5 group disabled:opacity-50 rounded-xl"
                                        >
                                            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                                            {uploading ? 'PUBLISHING...' : 'Publish Article'}
                                        </button>
                                    </div>
                                    
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditorOpen(false)} 
                                        className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all text-center"
                                    >
                                        Discard Entry
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
