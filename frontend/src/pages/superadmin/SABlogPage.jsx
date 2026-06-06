import { useState, useEffect, useRef, useMemo } from 'react';
import {
    Plus, Search, Filter, MoreHorizontal, Edit2,
    Trash2, Eye, Globe, Lock, Clock, Calendar,
    CheckCircle2, AlertCircle, FileText, Image as ImageIcon,
    ChevronLeft, ChevronRight, Save, X, Sparkles,
    MousePointer2, Share2, SearchCode, Megaphone, Loader2,
    BookOpen, CheckSquare, Square, ChevronDown, ListFilter, ArrowUpDown,
    XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from '../../components/superadmin/CustomDropdown';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const BLOG_CATEGORIES = [
    'Marketing',
    'Business',
    'Growth',
    'Product Updates',
    'Tutorials',
    'Announcements'
];

export default function SABlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // 'all' | 'published' | 'draft' | categories
    const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'oldest' | 'views' | 'alpha'
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [toast, setToast] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    // Selected items for bulk actions
    const [selectedIds, setSelectedIds] = useState([]);

    // Custom form states for SEO and Categories
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formCategory, setFormCategory] = useState('Marketing');
    const [formSlug, setFormSlug] = useState('');
    const [formMetaDesc, setFormMetaDesc] = useState('');

    const openEditor = (post = null) => {
        setEditingPost(post);
        setFormTitle(post?.title || '');
        setFormContent(post?.content || '');
        setFormCategory(post?.category || 'Marketing');
        setFormSlug(post?.slug || (post?.title ? generateSlug(post.title) : ''));
        setFormMetaDesc(post?.metaDescription || '');
        setSelectedImage(null);
        setPreviewUrl('');
        setIsEditorOpen(true);
    };

    const generateSlug = (title) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const wordCount = useMemo(() => {
        return formContent.trim().split(/\s+/).filter(Boolean).length;
    }, [formContent]);

    const readTime = useMemo(() => {
        return Math.ceil(wordCount / 200) || 1;
    }, [wordCount]);

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
            setPosts(data || []);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            showToast("Failed to fetch articles.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to decommission this article?")) {
            try {
                await api.delete(`/blogs/${id}`);
                setPosts(posts.filter(p => p._id !== id));
                setSelectedIds(prev => prev.filter(item => item !== id));
                showToast("Article deleted.");
            } catch (err) {
                console.error('Delete failed:', err);
                showToast("Delete failed.", 'error');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`Delete ${selectedIds.length} selected articles permanently?`)) {
            try {
                setLoading(true);
                await Promise.all(selectedIds.map(id => api.delete(`/blogs/${id}`)));
                setPosts(posts.filter(p => !selectedIds.includes(p._id)));
                setSelectedIds([]);
                showToast("Selected articles deleted.");
            } catch (err) {
                showToast("Bulk delete failed.", 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBulkPublish = async (status = 'published') => {
        if (selectedIds.length === 0) return;
        try {
            setLoading(true);
            await Promise.all(selectedIds.map(id => {
                const current = posts.find(p => p._id === id);
                return api.patch(`/blogs/${id}`, { ...current, status });
            }));
            setPosts(posts.map(p => selectedIds.includes(p._id) ? { ...p, status } : p));
            setSelectedIds([]);
            showToast(`Selected articles marked as ${status}.`);
        } catch (err) {
            showToast("Bulk status change failed.", 'error');
        } finally {
            setLoading(false);
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
                title: formTitle,
                content: formContent,
                author: "Wapixo HQ",
                image: imageUrl,
                category: formCategory,
                slug: formSlug || generateSlug(formTitle),
                metaDescription: formMetaDesc,
                status: forcedStatus || editingPost?.status || 'published'
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
            showToast("Failed to save article.", 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleTextFormat = (formatType) => {
        const textarea = document.getElementById('story-intel-textarea');
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        let replacement = '';

        switch (formatType) {
            case 'bold':
                replacement = `**${selectedText || 'bold text'}**`;
                break;
            case 'italic':
                replacement = `*${selectedText || 'italic text'}*`;
                break;
            case 'h1':
                replacement = `\n# ${selectedText || 'Heading 1'}\n`;
                break;
            case 'h2':
                replacement = `\n## ${selectedText || 'Heading 2'}\n`;
                break;
            case 'list':
                replacement = `\n* ${selectedText || 'List item'}\n`;
                break;
            case 'link':
                replacement = `[${selectedText || 'link text'}](https://example.com)`;
                break;
            default:
                return;
        }

        const newContent = text.substring(0, start) + replacement + text.substring(end);
        setFormContent(newContent);
        // Reset cursor location
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + replacement.length, start + replacement.length);
        }, 10);
    };

    // Calculate Analytics
    const analytics = useMemo(() => {
        const total = posts.length;
        const published = posts.filter(p => p.status === 'published').length;
        const drafts = posts.filter(p => p.status === 'draft').length;
        const totalViews = posts.reduce((acc, p) => acc + (p.views || (p.title?.length * 15 || 0)), 0);
        return { total, published, drafts, totalViews };
    }, [posts]);

    // Sorting & Filtering logic
    const processedPosts = useMemo(() => {
        let items = posts.filter(p => {
            const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || 
                                  p.category?.toLowerCase().includes(search.toLowerCase());
            
            if (filter === 'all') return matchesSearch;
            if (filter === 'published' || filter === 'draft') {
                return matchesSearch && p.status === filter;
            }
            return matchesSearch && p.category === filter;
        });

        // Sorting
        if (sortBy === 'latest') {
            items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'oldest') {
            items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === 'views') {
            items.sort((a, b) => (b.views || b.title?.length * 15) - (a.views || a.title?.length * 15));
        } else if (sortBy === 'alpha') {
            items.sort((a, b) => a.title.localeCompare(b.title));
        }

        return items;
    }, [posts, search, filter, sortBy]);

    // Featured Article (Latest published one)
    const featuredArticle = useMemo(() => {
        return posts.find(p => p.status === 'published');
    }, [posts]);

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === processedPosts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(processedPosts.map(p => p._id));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-6 space-y-6 pb-20">
            
            {/* Toast Feedback */}
            {toast && (
                <div className="fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-2xl backdrop-blur-xl bg-white/90 border border-white shadow-2xl text-sm font-semibold animate-in slide-in-from-right-4 duration-300">
                    {toast.type === 'error'
                        ? <XCircle className="w-5 h-5 shrink-0 text-red-600" />
                        : <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />}
                    <span className={toast.type === 'error' ? 'text-red-600' : 'text-emerald-600'}>
                        {toast.msg}
                    </span>
                </div>
            )}

            {/* Header Redesign */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                   <h1 className="text-2xl font-black text-text tracking-tight mt-1">Articles & Updates</h1>
                   <p className="text-sm text-slate-500 mt-2 font-medium">Draft, optimize, and publish news resources to WAPixo network salons.</p>
                </div>
                
                <button 
                    onClick={() => openEditor(null)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B4912B] via-[#C69F32] to-[#8B6F23] text-white text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#B4912B]/20 shrink-0"
                >
                    <Plus className="w-4 h-4 text-white" /> 
                    <span>Create Article</span>
                </button>
            </div>

            {/* Top Analytics Dashboard Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Articles</p>
                    <h3 className="text-3xl font-black mt-2 text-slate-800">{analytics.total}</h3>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Published</p>
                    <h3 className="text-3xl font-black mt-2 text-emerald-600">{analytics.published}</h3>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Drafts</p>
                    <h3 className="text-3xl font-black mt-2 text-amber-600">{analytics.drafts}</h3>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Views</p>
                    <h3 className="text-3xl font-black mt-2 text-[#B4912B]">
                        {analytics.totalViews >= 1000 ? `${(analytics.totalViews / 1000).toFixed(1)}K` : analytics.totalViews}
                    </h3>
                </div>
            </div>

            {/* Featured Article Story Banner */}
            {featuredArticle && !search && filter === 'all' && (
                <div className="relative bg-white/80 backdrop-blur-xl border border-white rounded-[32px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300 p-6 flex flex-col lg:flex-row gap-6">
                    <div className="relative lg:w-1/2 aspect-video lg:h-64 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                        <img 
                            src={getImageUrl(featuredArticle.image)} 
                            alt={featuredArticle.title} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 flex gap-1.5">
                            <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                FEATURED STORY
                            </span>
                            <span className="px-3 py-1 bg-white/95 text-slate-800 text-[9px] font-black uppercase tracking-widest rounded-full backdrop-blur-md">
                                {featuredArticle.category || 'General'}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                                <span>Published</span>
                                <span>•</span>
                                <span>{new Date(featuredArticle.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                <span>•</span>
                                <span>{featuredArticle.author || 'Wapixo HQ'}</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-2.5 hover:text-[#B4912B] transition-colors leading-tight">
                                {featuredArticle.title}
                            </h2>
                            <p className="text-slate-500 text-sm mt-3 leading-relaxed line-clamp-3">
                                {featuredArticle.metaDescription || featuredArticle.content?.substring(0, 180)}...
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-slate-400 text-[11px] font-bold">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.ceil((featuredArticle.content?.split(/\s+/).filter(Boolean).length || 0) / 200)} min read</span>
                                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {featuredArticle.views || featuredArticle.title?.length * 15} Views</span>
                            </div>
                            <button 
                                onClick={() => openEditor(featuredArticle)}
                                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow"
                            >
                                Edit Article
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar, Search, Sort & Bulk Actions */}
            <div className="relative z-20 flex flex-col lg:flex-row gap-3 bg-white/50 backdrop-blur rounded-3xl p-3 border border-slate-200/50 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full lg:flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search blogs by title or category tag..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#B4912B] transition-all"
                    />
                </div>

                {/* Filters, Categories and Sorting */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    
                    {/* Status / Category Dropdown */}
                    <div className="w-44">
                        <CustomDropdown
                            value={filter}
                            onChange={setFilter}
                            placeholder="All Categories"
                            options={[
                                { value: 'all', label: 'All Articles' },
                                { value: 'published', label: 'Published' },
                                { value: 'draft', label: 'Drafts' },
                                ...BLOG_CATEGORIES.map(c => ({ value: c, label: c })),
                            ]}
                        />
                    </div>

                    {/* Sorting dropdown */}
                    <div className="w-44">
                        <CustomDropdown
                            value={sortBy}
                            onChange={setSortBy}
                            placeholder="Sort By"
                            options={[
                                { value: 'latest', label: 'Latest First' },
                                { value: 'oldest', label: 'Oldest First' },
                                { value: 'views', label: 'Most Viewed' },
                                { value: 'alpha', label: 'Alphabetical A-Z' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Bulk actions banner */}
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-[#B4912B]/10 rounded-2xl border border-[#B4912B]/20 animate-in slide-in-from-top-3 duration-250">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#B4912B] uppercase tracking-wider">{selectedIds.length} articles selected</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleBulkPublish('published')} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold">
                            Publish Selected
                        </button>
                        <button onClick={() => handleBulkPublish('draft')} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold">
                            Move to Draft
                        </button>
                        <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold">
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Articles List / Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white/80 border border-slate-200 rounded-[32px] shadow-sm animate-pulse">
                    <Loader2 size={40} className="text-[#B4912B] animate-spin mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Articles...</p>
                </div>
            ) : processedPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[32px] text-center p-8 shadow-sm">
                    <FileText className="w-20 h-20 text-slate-200 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">No articles created yet</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Start publishing informative contents, feature updates and guides for salons.</p>
                    <button onClick={() => openEditor(null)} className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B4912B] to-[#8B6F23] text-white text-xs font-bold shadow-lg shadow-[#B4912B]/20 hover:brightness-110">
                        Create First Article
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Checkbox to Select All */}
                    <div className="flex items-center gap-2 pl-4">
                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            {selectedIds.length === processedPosts.length ? <CheckSquare className="w-4 h-4 text-[#B4912B]" /> : <Square className="w-4 h-4" />}
                            <span>Select All Shown ({processedPosts.length})</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {processedPosts.map((post) => {
                            const isSelected = selectedIds.includes(post._id);
                            return (
                                <motion.div
                                    layout
                                    key={post._id}
                                    className={`relative flex flex-col bg-white/80 backdrop-blur-xl border rounded-[24px] overflow-hidden hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ${isSelected ? 'border-[#B4912B] ring-2 ring-[#B4912B]/10' : 'border-white/30'}`}
                                >
                                    {/* Cover Media asset */}
                                    <div className="relative h-48 overflow-hidden bg-slate-900">
                                        <img
                                            src={getImageUrl(post.image)}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                        
                                        {/* Selection trigger */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleSelect(post._id); }}
                                            className="absolute top-4 left-4 p-1.5 bg-white/90 rounded-lg backdrop-blur-sm z-10 text-[#B4912B]"
                                        >
                                            {isSelected ? <CheckSquare className="w-4.5 h-4.5" /> : <Square className="w-4.5 h-4.5 text-slate-400" />}
                                        </button>

                                        <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                                            <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md border border-white/20
                                                ${post.status === 'published' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}
                                            `}>
                                                {post.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                            {post.category && (
                                                <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full bg-slate-900/80 text-white border border-white/10 backdrop-blur-md">
                                                    {post.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info Body */}
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                <Calendar className="w-3 h-3" /> 
                                                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                            </div>
                                            <h3 className="text-base font-black text-slate-800 leading-snug group-hover:text-[#B4912B] transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-slate-500 text-xs mt-2.5 leading-relaxed line-clamp-2 h-8">
                                                {post.metaDescription || post.content?.replace(/[#*`[\]]/g, '').substring(0, 100)}...
                                            </p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-100">
                                            {/* Metrics bar */}
                                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-4">
                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.ceil((post.content?.split(/\s+/).filter(Boolean).length || 0) / 200) || 1} min read</span>
                                                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.views || post.title?.length * 15} Views</span>
                                            </div>

                                            {/* Action bottom line */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center rounded-lg border border-slate-200">
                                                        {post.author ? post.author[0] : 'W'}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{post.author || 'Wapixo HQ'}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditor(post)}
                                                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post._id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Editorial Configurator Modal (Clean Single-Column Layout) */}
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
                            initial={{ opacity: 0, scale: 0.98, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.98, y: 20 }} 
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative bg-white w-full max-w-3xl h-[85vh] overflow-hidden flex flex-col shadow-2xl rounded-[32px] border border-white"
                        >

                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50 shrink-0">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                        Blog <span className="text-[#B4912B]">CMS Workspace</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {editingPost ? 'Edit your Article' : 'Draft a New Article Entry'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsEditorOpen(false)} 
                                    className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form & Scrollable Editor Workspace */}
                            <form id="article-form" onSubmit={(e) => handleSavePost(e, 'published')} className="flex-1 overflow-y-auto p-8 space-y-6">
                                
                                {/* Category and Title Input Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Article Category</label>
                                        <select 
                                            value={formCategory}
                                            onChange={(e) => setFormCategory(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#B4912B] focus:bg-white outline-none transition-all"
                                        >
                                            {BLOG_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Article Title *</label>
                                        <input
                                            required 
                                            name="title"
                                            value={formTitle}
                                            onChange={(e) => {
                                                setFormTitle(e.target.value);
                                                if (!editingPost) setFormSlug(generateSlug(e.target.value));
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 placeholder:text-slate-400/50 focus:outline-none focus:bg-white focus:border-[#B4912B] transition-all"
                                            placeholder="Write an attention-grabbing title..."
                                        />
                                    </div>
                                </div>

                                {/* Cover Image Upload */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Cover Image</label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative group h-48 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#B4912B] rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all hover:bg-slate-100/30"
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
                                                    className="w-full h-full object-cover" 
                                                    alt="Preview"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                                    <span className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-xl shadow">
                                                        Change Cover Media
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-6 space-y-2">
                                                <ImageIcon size={24} className="mx-auto text-slate-300" />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Add Cover Media</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Markdown Helper Editor with Toolbar */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase font-sans">Intel Content *</label>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase font-sans">{wordCount} words | {readTime} min read</span>
                                    </div>
                                    
                                    {/* Simple formatting toolbar */}
                                    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 border border-slate-200 rounded-t-xl">
                                        {['h1', 'h2', 'bold', 'italic', 'list', 'link'].map(fmt => (
                                            <button
                                                key={fmt}
                                                type="button"
                                                onClick={() => handleTextFormat(fmt)}
                                                className="px-2.5 py-1 hover:bg-white text-[10px] font-black uppercase border border-transparent hover:border-slate-200 rounded-lg text-slate-600 transition-all"
                                            >
                                                {fmt}
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        id="story-intel-textarea"
                                        name="content"
                                        value={formContent}
                                        onChange={(e) => setFormContent(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border-t-0 border border-slate-200 rounded-b-xl p-4 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400/50 focus:outline-none focus:bg-white focus:border-[#B4912B] transition-all min-h-[250px]"
                                        placeholder="Write your article markdown content here..."
                                    />
                                </div>

                            </form>

                            {/* Modal Footer / Action Buttons */}
                            <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 bg-slate-50 shrink-0">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditorOpen(false)} 
                                    className="px-5 py-2.5 text-xs text-slate-500 font-bold uppercase tracking-wider hover:text-slate-850 hover:bg-slate-200/50 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <div className="flex items-center gap-3">
                                    <button 
                                        type="button"
                                        onClick={(e) => handleSavePost(e, 'draft')}
                                        disabled={uploading}
                                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                                    >
                                        Save as Draft
                                    </button>
                                    <button 
                                        type="submit" 
                                        form="article-form"
                                        disabled={uploading}
                                        className="px-6 py-2.5 bg-gradient-to-r from-[#B4912B] via-[#C69F32] to-[#8B6F23] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#B4912B]/10"
                                    >
                                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                                        <span>Publish Post</span>
                                    </button>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
