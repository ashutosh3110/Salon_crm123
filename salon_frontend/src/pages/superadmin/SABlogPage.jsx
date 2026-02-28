import { useState } from 'react';
import {
    Plus, Search, Filter, MoreHorizontal, Edit2,
    Trash2, Eye, Globe, Lock, Clock, Calendar,
    CheckCircle2, AlertCircle, FileText, Image as ImageIcon,
    ChevronLeft, ChevronRight, Save, X, Sparkles,
    MousePointer2, Share2, SearchCode, Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ["Growth", "Marketing", "Operations", "Insights", "Product"];

const INITIAL_POSTS = [
    {
        id: 1,
        category: "Growth",
        title: "How to Scale Your Salon to Multiple Outlets",
        slug: "scale-your-salon-multi-outlet",
        excerpt: "Learn the essential strategies for managing operations across different locations without losing quality.",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
        date: "Feb 15, 2026",
        status: "published",
        isFeatured: true,
        author: "Wapixo HQ",
        reads: 2450
    },
    {
        id: 2,
        category: "Marketing",
        title: "Automated WhatsApp Marketing for Beauty Businesses",
        slug: "automated-whatsapp-marketing",
        excerpt: "Discover how automated reminders and campaigns can increase your booking rate by up to 40%.",
        image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=800",
        date: "Feb 10, 2026",
        status: "published",
        isFeatured: false,
        author: "Wapixo HQ",
        reads: 1890
    },
    {
        id: 3,
        category: "Operations",
        title: "The Future of POS in the Salon Industry",
        slug: "future-of-pos-salon",
        excerpt: "Why traditional billing is dead and how modern cloud-based systems are changing the game.",
        image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=800",
        date: "Feb 05, 2026",
        status: "draft",
        isFeatured: false,
        author: "Business Lead",
        reads: 0
    }
];

export default function SABlogPage() {
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [toast, setToast] = useState(null);



    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to decommission this editorial? This action is irreversible.")) {
            setPosts(posts.filter(p => p.id !== id));
            showToast("Editorial purged from ecosystem.");
        }
    };

    const handleSavePost = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const postData = {
            id: editingPost?.id || Date.now(),
            title: formData.get('title'),
            slug: formData.get('slug'),
            category: formData.get('category'),
            excerpt: formData.get('excerpt'),
            status: formData.get('status'),
            isFeatured: formData.get('isFeatured') === 'on',
            author: formData.get('author') || "Wapixo HQ",
            date: editingPost?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            reads: editingPost?.reads || 0,
            image: editingPost?.image || "https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200"
        };

        if (editingPost) {
            setPosts(posts.map(p => p.id === editingPost.id ? postData : p));
        } else {
            setPosts([postData, ...posts]);
        }

        setIsEditorOpen(false);
        setEditingPost(null);
        showToast(editingPost ? "Protocol updated." : "Editorial deployed.");
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
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Wapixo <span className="text-primary">Journal</span></h1>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.3em] mt-2">Editorial Command & Deployment Hub</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-6 py-3 border border-border bg-surface regular-radius flex flex-col items-center">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Total Units</span>
                        <span className="text-lg font-black italic leading-none">{posts.length}</span>
                    </div>
                    <button
                        onClick={() => {
                            setEditingPost(null);
                            setIsEditorOpen(true);
                        }}
                        className="px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all flex items-center gap-3 regular-radius shadow-2xl shadow-black/10 active:scale-[0.98]"
                    >
                        <Plus size={16} /> Deploy New Narrative
                    </button>
                </div>
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search narrative titles or categories..."
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
                            {f === 'all' ? 'All Units' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                    <motion.div
                        layout
                        key={post.id}
                        className="group bg-white border border-border regular-radius overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all duration-700"
                    >
                        {/* Preview Asset */}
                        <div className="relative h-64 overflow-hidden bg-black">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                            />
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <span className="px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest">
                                    {post.category}
                                </span>
                                {post.isFeatured && (
                                    <span className="px-3 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-primary/30">
                                        <Sparkles size={10} /> Signature Post
                                    </span>
                                )}
                            </div>
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
                                        <Edit2 size={12} /> Configure
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
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
                                <Calendar size={12} /> {post.date}
                            </div>
                            <h3 className="text-xl font-black italic tracking-tighter uppercase leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-4">
                                {post.title}
                            </h3>
                            <p className="text-xs text-text-muted leading-relaxed font-medium line-clamp-3 mb-8">
                                {post.excerpt}
                            </p>

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
                                <div className="flex items-center gap-1.5 text-text-muted bg-surface px-3 py-1.5 regular-radius border border-border/50">
                                    <Eye size={12} className="text-primary" />
                                    <span className="text-[10px] font-black italic">{post.reads}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Editorial Configurator Modal */}
            <AnimatePresence>
                {isEditorOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditorOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 50 }} className="relative bg-white w-full max-w-6xl h-[92vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]">

                            {/* Modal Hub Header */}
                            <div className="flex items-center justify-between px-10 py-8 border-b border-border bg-[#fafafa]">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                                        The <span className="text-primary">Narrative</span> Forge
                                    </h3>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.3em] mt-1">Configuring: {editingPost ? editingPost.slug : 'New Operational Unit'}</p>
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

                            <form onSubmit={handleSavePost} className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                                {/* Left: Editorial Content Area */}
                                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar border-r border-border bg-white">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <input
                                                required name="title"
                                                defaultValue={editingPost?.title}
                                                className="w-full text-4xl font-black italic uppercase border-none outline-none placeholder:text-text-muted/20 focus:ring-0 px-0"
                                                placeholder="ENTER NARRATIVE TITLE..."
                                            />
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted tracking-[0.2em] uppercase">
                                                <span>WAPIXO.IO/JOURNAL/</span>
                                                <input name="slug" defaultValue={editingPost?.slug} required className="bg-surface border-b border-border px-3 py-1 outline-none text-black focus:border-primary transition-all min-w-[240px] font-black" placeholder="url-slug-string" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Megaphone size={14} className="text-primary" /> Primary Narrative Body (Supports Cinematic Assets)
                                            </label>
                                            <textarea
                                                className="w-full bg-[#fafafa] border border-border p-10 text-sm leading-loose focus:border-primary outline-none transition-all min-h-[500px] shadow-inner font-medium"
                                                placeholder="# Provide the surgical breakdown of this editorial..."
                                            />
                                        </div>

                                        {/* SEO / Indexing */}
                                        <div className="p-10 border border-border bg-[#fafafa] space-y-6">
                                            <div className="flex items-center gap-3 border-b border-border pb-4">
                                                <SearchCode size={20} className="text-primary" />
                                                <span className="text-xs font-black uppercase tracking-widest italic">SEO Optimization Meta</span>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-text-muted uppercase italic">Metadata Focus Title</label>
                                                    <input className="w-full bg-white border border-border px-5 py-4 text-xs font-bold outline-none focus:border-primary" placeholder="Max 60 chars" maxLength={60} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-text-muted uppercase italic">Metadata Narrative Snippet</label>
                                                    <textarea className="w-full bg-white border border-border px-5 py-4 text-xs font-medium outline-none focus:border-primary min-h-[120px] resize-none leading-relaxed" placeholder="Max 160 chars" maxLength={160} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Sidebar Configuration */}
                                <div className="w-full lg:w-[400px] overflow-y-auto p-10 space-y-10 bg-[#fafafa] border-l border-border">
                                    {/* Asset Upload */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                            <ImageIcon size={16} className="text-primary" /> Narrative Visual Hero
                                        </label>
                                        <div className="relative group aspect-video bg-black/5 border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-all shadow-sm">
                                            {editingPost?.image ? (
                                                <img src={editingPost.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                                            ) : (
                                                <div className="text-center p-6">
                                                    <ImageIcon size={32} className="text-text-muted mx-auto mb-3" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Deploy Visual Protocol</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Category & Status */}
                                    <div className="space-y-6 mt-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest italic leading-none block px-1">Tactical Category</label>
                                            <select name="category" defaultValue={editingPost?.category || "Growth"} className="w-full bg-white border border-border px-5 py-4 text-xs font-black uppercase outline-none cursor-pointer focus:ring-2 ring-primary/10 transition-all appearance-none">
                                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest italic leading-none block px-1">Operational Status</label>
                                            <select name="status" defaultValue={editingPost?.status || "published"} className="w-full bg-white border border-border px-5 py-4 text-xs font-black uppercase outline-none cursor-pointer focus:ring-2 ring-primary/10 transition-all appearance-none">
                                                <option value="published">DEPLOY INSTANTLY</option>
                                                <option value="draft">STAGING / DRAFT</option>
                                            </select>
                                        </div>
                                        <div className="pt-4 flex items-center gap-4 bg-white p-6 border border-border shadow-sm">
                                            <input type="checkbox" name="isFeatured" defaultChecked={editingPost?.isFeatured} id="feat" className="w-5 h-5 accent-primary cursor-pointer" />
                                            <label htmlFor="feat" className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer">Mark as Signature Post</label>
                                        </div>
                                    </div>

                                    {/* Excerpt */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Surgical Narrative Excerpt</label>
                                        <textarea
                                            name="excerpt"
                                            defaultValue={editingPost?.excerpt}
                                            className="w-full bg-white border border-border p-6 text-xs font-bold leading-relaxed focus:border-primary outline-none transition-all h-[180px] resize-none shadow-sm placeholder:italic"
                                            placeholder="Provide a condensed summary of the editorial thesis..."
                                        />
                                    </div>

                                    {/* Action Hub */}
                                    <div className="pt-10 border-t border-border space-y-4">
                                        <button type="submit" className="w-full py-6 bg-black text-white text-[11px] font-black uppercase tracking-[0.5em] hover:bg-primary transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group active:scale-[0.98]">
                                            <Save size={18} /> INITIALIZE DEPLOYMENT
                                        </button>
                                        <button type="button" onClick={() => setIsEditorOpen(false)} className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-red-500 transition-all text-center">
                                            ABORT MISSION
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
