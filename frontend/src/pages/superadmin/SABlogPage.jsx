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

    useEffect(() => {
        fetchPosts();
    }, []);

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
                    <div className="w-16 h-16 bg-black text-white flex items-center justify-center italic font-black text-2xl shadow-xl">
                        W
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Articles & <span className="text-primary">News</span></h1>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.3em] mt-2">Manage your blog posts and news updates</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-6 py-3 border border-border bg-surface regular-radius flex flex-col items-center">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Total Articles</span>
                        <span className="text-lg font-black italic leading-none">{posts.length}</span>
                    </div>
                    <button
                        onClick={() => {
                            setEditingPost(null);
                            setIsEditorOpen(true);
                        }}
                        className="px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all flex items-center gap-3 regular-radius shadow-2xl shadow-black/10 active:scale-[0.98]"
                    >
                        <Plus size={16} /> Create New Article
                    </button>
                </div>
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search article titles or categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-border pl-16 pr-6 py-5 text-xs font-bold uppercase tracking-widest outline-none regular-radius focus:ring-1 ring-primary/20 transition-all shadow-sm"
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
                                src={post.image.startsWith('http') ? post.image : `${api.defaults.baseURL.replace('/api', '')}/${post.image}`}
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
                                        onClick={() => { setEditingPost(post); setIsEditorOpen(true); }}
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
                            <h3 className="text-xl font-black italic tracking-tighter uppercase leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-8">
                                {post.title}
                            </h3>

                            <div className="pt-6 border-t border-border flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-surface text-black text-[10px] font-black italic flex items-center justify-center border border-border">
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditorOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 50 }} className="relative bg-white w-full max-w-3xl h-[92vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] regular-radius">

                            {/* Modal Hub Header */}
                            <div className="flex items-center justify-between px-10 py-8 border-b border-border bg-[#fafafa]">
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tight">
                                        Article <span className="text-primary">Editor</span>
                                    </h3>
                                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.2em] mt-0.5">Editing: {editingPost ? editingPost.title : 'New Article Entry'}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 bg-black text-white px-5 py-2.5 shadow-xl">
                                        <Globe size={14} className="text-primary" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Cloud Ready</span>
                                    </div>
                                    <button onClick={() => setIsEditorOpen(false)} className="w-12 h-12 flex items-center justify-center hover:bg-black/5 rounded-full transition-all border border-border">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <form id="article-form" onSubmit={(e) => handleSavePost(e, 'published')} className="flex-1 overflow-y-auto bg-white p-10">
                                <div className="max-w-2xl mx-auto space-y-8">
                                    
                                    {/* Title Section (Top) */}
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] block text-center mb-2">Article Headline</label>
                                        <input
                                            required name="title"
                                            defaultValue={editingPost?.title}
                                            className="w-full text-4xl font-black italic uppercase border-none outline-none placeholder:text-text-muted/30 focus:ring-0 px-0 bg-transparent text-center"
                                            placeholder="ENTER ARTICLE TITLE..."
                                        />
                                    </div>

                                    {/* Image Section (Middle) */}
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 justify-center">
                                            <ImageIcon size={14} className="text-primary" /> Feature Image
                                        </label>
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative group aspect-video bg-[#fafafa] border border-border flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-all shadow-sm regular-radius"
                                        >
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={handleImageChange} 
                                                className="hidden" 
                                                accept="image/*" 
                                            />
                                            {(previewUrl || editingPost?.image) ? (
                                                <img 
                                                    src={previewUrl || (editingPost?.image?.startsWith('http') ? editingPost.image : `${api.defaults.baseURL.replace('/api', '')}/${editingPost?.image}`)} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                                />
                                            ) : (
                                                <div className="text-center p-6">
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-text-muted group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Upload Media Asset</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Section (Bottom) */}
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                            <FileText size={12} className="text-primary" /> Article Intel
                                        </label>
                                        <textarea
                                            name="content"
                                            defaultValue={editingPost?.content}
                                            required
                                            className="w-full bg-[#fafafa] border border-border p-6 text-sm leading-relaxed focus:border-primary outline-none transition-all min-h-[140px] shadow-inner font-medium regular-radius"
                                            placeholder="Write your content here..."
                                        />
                                    </div>

                                    {/* Action Hub */}
                                    <div className="pt-8 grid grid-cols-2 gap-4">
                                        <button 
                                            type="button"
                                            onClick={(e) => handleSavePost(e, 'draft')}
                                            disabled={uploading}
                                            className="py-5 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all regular-radius disabled:opacity-50"
                                        >
                                            Save as Draft
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={uploading}
                                            className="py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group disabled:opacity-50 regular-radius"
                                        >
                                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                                            {uploading ? 'PUBLISHING...' : 'Publish Now'}
                                        </button>
                                    </div>
                                    
                                    <button type="button" onClick={() => setIsEditorOpen(false)} className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-red-500 transition-all text-center">
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
