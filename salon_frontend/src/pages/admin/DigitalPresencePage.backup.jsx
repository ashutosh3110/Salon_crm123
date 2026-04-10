import { useState, useEffect } from 'react';
import {
    Globe, Share2, Plus, Trash2, Edit3, Save,
    MoreVertical, Eye, QrCode, MessageSquare,
    Facebook, Instagram, Copy, CheckCircle,
    Zap, Palette, Layout, Search, ArrowRight,
    XCircle, Smartphone, ExternalLink, RefreshCw,
    Store, Scissors, Sparkles, User, Star, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { MOCK_SERVICES } from '../../data/appMockData';
import api from '../../services/mock/mockApi';

/* ─── Components ───────────────────────────────────────────────────────── */

function TabButton({ active, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${active
                ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-surface border-border text-text-muted hover:border-primary/30 hover:text-primary'
                }`}
        >
            {label}
        </button>
    );
}

function SectionHeader({ title, desc }) {
    return (
        <div className="flex items-center gap-4 mb-8">
            <div>
                <h2 className="text-xl font-black text-text tracking-tight uppercase">{title}</h2>
                <p className="text-xs text-text-muted font-medium">{desc}</p>
            </div>
        </div>
    );
}

/* ─── Main Page ────────────────────────────────────────────────────────── */

export default function DigitalPresence() {
    const [activeTab, setActiveTab] = useState('builder');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [catalogue, setCatalogue] = useState({
        slug: '',
        title: '',
        description: '',
        isPublished: false,
        pages: [{ title: 'Home', slug: 'home', icon: 'Layout', sections: [] }],
        theme: { primaryColor: '#AD0B2A', fontStyle: 'Inter', layout: 'grid' },
        socialLinks: { instagram: '', facebook: '', whatsapp: '', website: '' }
    });
    const [services, setServices] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [activeSectionIndex, setActiveSectionIndex] = useState(null);
    const [copyStatus, setCopyStatus] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const localCatalogue = localStorage.getItem('digital_catalogue');
            if (localCatalogue) {
                setCatalogue(JSON.parse(localCatalogue));
            } else {
                setCatalogue(prev => ({
                    ...prev,
                    slug: `salon-${Math.random().toString(36).substring(7)}`,
                    title: 'Our Premium Menu',
                    description: 'Welcome to our salon. Browse our services below.',
                    pages: [
                        {
                            title: 'Hair',
                            slug: 'hair',
                            icon: 'Scissors',
                            sections: [
                                {
                                    title: 'Haircuts',
                                    items: [
                                        { type: 'service', refId: 'srv-001', displayName: 'Classic Haircut', price: 500, highlight: false },
                                        { type: 'service', refId: 'srv-002', displayName: 'Hair Coloring', price: 2500, highlight: false }
                                    ]
                                }
                            ]
                        },
                        {
                            title: 'Skin',
                            slug: 'skin',
                            icon: 'Sparkles',
                            sections: [
                                {
                                    title: 'Facials',
                                    items: [
                                        { type: 'service', refId: 'srv-005', displayName: 'Facial — Gold', price: 1800, highlight: false }
                                    ]
                                }
                            ]
                        }
                    ]
                }));
            }
            setServices(MOCK_SERVICES);
        } catch (error) {
            console.error('Error fetching data:', error);
            setServices(MOCK_SERVICES);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Simulate save delay
            await new Promise(resolve => setTimeout(resolve, 800));
            localStorage.setItem('digital_catalogue', JSON.stringify(catalogue));
            alert('Progress saved to browser storage!');
        } catch (error) {
            alert('Error saving locally');
        } finally {
            setSaving(false);
        }
    };

    const togglePublish = async () => {
        const newStatus = !catalogue.isPublished;
        const newCatalogue = { ...catalogue, isPublished: newStatus };
        setCatalogue(newCatalogue);
        localStorage.setItem('digital_catalogue', JSON.stringify(newCatalogue));
    };

    const addPage = () => {
        const newPage = {
            title: `New Page ${catalogue.pages.length + 1}`,
            slug: `page-${catalogue.pages.length + 1}`,
            icon: 'Layout',
            sections: []
        };
        setCatalogue(prev => ({
            ...prev,
            pages: [...prev.pages, newPage]
        }));
        setCurrentPageIndex(catalogue.pages.length);
    };

    const removePage = (idx) => {
        if (catalogue.pages.length <= 1) return;
        setCatalogue(prev => ({
            ...prev,
            pages: prev.pages.filter((_, i) => i !== idx)
        }));
        if (currentPageIndex >= idx && currentPageIndex > 0) {
            setCurrentPageIndex(prev => prev - 1);
        }
    };

    const addSection = () => {
        const newPages = [...catalogue.pages];
        newPages[currentPageIndex].sections.push({ title: 'New Section', items: [] });
        setCatalogue(prev => ({ ...prev, pages: newPages }));
    };

    const removeSection = (index) => {
        const newPages = [...catalogue.pages];
        newPages[currentPageIndex].sections = newPages[currentPageIndex].sections.filter((_, i) => i !== index);
        setCatalogue(prev => ({ ...prev, pages: newPages }));
    };

    const addItemToSection = (sectionIndex, item) => {
        const newPages = [...catalogue.pages];
        newPages[currentPageIndex].sections[sectionIndex].items.push({
            type: 'service',
            refId: item._id,
            displayName: item.name,
            price: item.price,
            highlight: false
        });
        setCatalogue(prev => ({ ...prev, pages: newPages }));
        setShowPicker(false);
    };

    const removeItemFromSection = (sectionIndex, itemIdx) => {
        const newPages = [...catalogue.pages];
        newPages[currentPageIndex].sections[sectionIndex].items.splice(itemIdx, 1);
        setCatalogue(prev => ({ ...prev, pages: newPages }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    };

    const publicUrl = `${window.location.origin}/c/${catalogue.slug}`;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 mr-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Digital Presence</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Build your online identity and share your catalogue with the world</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-primary-foreground text-sm font-black hover:brightness-110 transition-all shadow-xl shadow-primary/25 active:scale-95 disabled:opacity-50 leading-none"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        SAVE CHANGES
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                <TabButton active={activeTab === 'builder'} label="Catalogue Builder" onClick={() => setActiveTab('builder')} />
                <TabButton active={activeTab === 'share'} label="Share & Link" onClick={() => setActiveTab('share')} />
                <TabButton active={activeTab === 'social'} label="Social Integration" onClick={() => setActiveTab('social')} />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'builder' && (
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm">
                                    <div className="space-y-4 mb-8 pb-8 border-b border-border">
                                        <div>
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Catalogue Title</label>
                                            <input
                                                type="text"
                                                value={catalogue.title}
                                                onChange={(e) => setCatalogue({ ...catalogue, title: e.target.value })}
                                                placeholder="e.g. Our Service Menu"
                                                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Menu Pages</label>
                                            <button onClick={addPage} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
                                                <Plus className="w-3 h-3" /> Add Page
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                                            {catalogue.pages.map((page, idx) => (
                                                <div key={idx} className="relative group shrink-0">
                                                    <button
                                                        onClick={() => setCurrentPageIndex(idx)}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${currentPageIndex === idx
                                                            ? 'bg-primary border-primary text-primary-foreground'
                                                            : 'bg-surface border-border text-text-muted hover:border-primary/30'
                                                            }`}
                                                    >
                                                        {page.title}
                                                    </button>
                                                    {catalogue.pages.length > 1 && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removePage(idx); }}
                                                            className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <XCircle className="w-2.5 h-2.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-surface/50 rounded-2xl border border-border">
                                        <div>
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">Page Name</label>
                                            <input
                                                type="text"
                                                value={catalogue.pages[currentPageIndex]?.title || ''}
                                                onChange={(e) => {
                                                    const newPages = [...catalogue.pages];
                                                    newPages[currentPageIndex].title = e.target.value;
                                                    setCatalogue({ ...catalogue, pages: newPages });
                                                }}
                                                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">Page Icon</label>
                                            <select
                                                value={catalogue.pages[currentPageIndex]?.icon || 'Layout'}
                                                onChange={(e) => {
                                                    const newPages = [...catalogue.pages];
                                                    newPages[currentPageIndex].icon = e.target.value;
                                                    setCatalogue({ ...catalogue, pages: newPages });
                                                }}
                                                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none"
                                            >
                                                <option value="Layout">Layout</option>
                                                <option value="Scissors">Scissors</option>
                                                <option value="Sparkles">Sparkles</option>
                                                <option value="User">User</option>
                                                <option value="Star">Star</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Sections on this Page</label>
                                            <button onClick={addSection} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
                                                <Plus className="w-3 h-3" /> Add Section
                                            </button>
                                        </div>

                                        {catalogue.pages[currentPageIndex]?.sections.map((section, idx) => (
                                            <div key={idx} className="p-6 rounded-2xl border border-border bg-surface/30 relative group">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <input
                                                        type="text"
                                                        value={section.title}
                                                        onChange={(e) => {
                                                            const newPages = [...catalogue.pages];
                                                            newPages[currentPageIndex].sections[idx].title = e.target.value;
                                                            setCatalogue({ ...catalogue, pages: newPages });
                                                        }}
                                                        className="bg-transparent text-sm font-black uppercase tracking-tight border-b-2 border-transparent focus:border-primary focus:outline-none w-full"
                                                    />
                                                    <button onClick={() => removeSection(idx)} className="p-2 text-text-muted hover:text-error transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    {section.items.map((item, itemIdx) => (
                                                        <div key={itemIdx} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border/50 shadow-sm transition-all hover:border-primary/30">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                                                    <Layout className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-bold text-text">{item.displayName}</div>
                                                                    <div className="text-[10px] text-text-muted font-bold">₹{item.price}</div>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => removeItemFromSection(idx, itemIdx)} className="p-1.5 hover:bg-error/10 rounded-lg text-text-muted hover:text-error hover:scale-110 transition-all">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => { setActiveSectionIndex(idx); setShowPicker(true); }}
                                                        className="w-full py-3 rounded-xl border-2 border-dashed border-border text-text-muted text-[10px] font-black uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all"
                                                    >
                                                        + Add Service/Product
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm sticky top-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xs font-black text-text uppercase tracking-widest">Live Preview</h3>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${catalogue.isPublished ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-tight">{catalogue.isPublished ? 'Live' : 'Draft'}</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800 aspect-[9/16] overflow-hidden">
                                        <div className="w-full h-full bg-white rounded-[2rem] overflow-y-auto no-scrollbar flex flex-col">
                                            <div className="h-24 bg-primary shrink-0 relative">
                                                <div className="absolute inset-0 bg-black/20" />
                                            </div>
                                            <div className="p-4 -mt-8 relative z-10 flex flex-col items-center flex-1">
                                                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg border border-border flex items-center justify-center mb-3">
                                                    <Store className="w-8 h-8 text-primary" />
                                                </div>
                                                <h4 className="text-sm font-black text-text text-center uppercase tracking-tight">{catalogue.title || 'Your Salon'}</h4>

                                                <div className="w-full flex items-center gap-2 overflow-x-auto py-4 no-scrollbar border-b border-border mb-4">
                                                    {catalogue.pages.map((p, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setCurrentPageIndex(idx)}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${currentPageIndex === idx ? 'bg-primary text-primary-foreground' : 'bg-surface text-text-muted'}`}
                                                        >
                                                            {p.title}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="w-full space-y-6">
                                                    {catalogue.pages[currentPageIndex]?.sections.map((s, idx) => (
                                                        <div key={idx} className="space-y-3">
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-1">{s.title}</div>
                                                            <div className="space-y-2">
                                                                {s.items.map((item, i) => (
                                                                    <div key={i} className="flex justify-between items-center bg-surface/50 p-2 rounded-lg">
                                                                        <div className="text-[10px] font-bold text-text line-clamp-1">{item.displayName}</div>
                                                                        <div className="text-[10px] font-black text-primary">₹{item.price}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-8 mb-4 w-full px-4">
                                                    <div className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest text-center">BOOK APPOINTMENT</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-center text-text-muted font-bold mt-4 uppercase tracking-widest">Mobile View Interactive</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'share' && (
                        <div className="max-w-3xl mx-auto space-y-8">
                            <SectionHeader title="Your Shareable Link" desc="This link is public and can be accessed by anyone to browse your services." icon={Globe} />
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 block">Public URL Slug</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-2 overflow-hidden">
                                                <span className="text-text-muted whitespace-nowrap">/c/</span>
                                                <input
                                                    type="text"
                                                    value={catalogue.slug}
                                                    onChange={(e) => setCatalogue({ ...catalogue, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                                    className="bg-transparent w-full focus:outline-none"
                                                />
                                            </div>
                                            <button onClick={() => copyToClipboard(publicUrl)} className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-all">
                                                {copyStatus ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-black text-text uppercase tracking-tight">Public Visibility</h4>
                                            <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Allow anyone to view this menu</p>
                                        </div>
                                        <button onClick={togglePublish} className={`pill-toggle relative w-14 h-7 rounded-full transition-colors ${catalogue.isPublished ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${catalogue.isPublished ? 'translate-x-7' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm flex flex-col items-center text-center">
                                    <div className="w-48 h-48 p-4 border-2 border-primary/20 rounded-3xl flex items-center justify-center mb-6 bg-white">
                                        <QRCodeSVG value={publicUrl} size={150} />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const canvas = document.querySelector('svg');
                                            const svgData = new XMLSerializer().serializeToString(canvas);
                                            const canvasElement = document.createElement("canvas");
                                            const ctx = canvasElement.getContext("2d");
                                            const img = new Image();
                                            img.onload = () => {
                                                canvasElement.width = 1000; canvasElement.height = 1000;
                                                ctx.fillStyle = "white"; ctx.fillRect(0, 0, 1000, 1000);
                                                ctx.drawImage(img, 100, 100, 800, 800);
                                                const pngFile = canvasElement.toDataURL("image/png");
                                                const downloadLink = document.createElement("a");
                                                downloadLink.download = `QR-${catalogue.slug}.png`; downloadLink.href = pngFile; downloadLink.click();
                                            };
                                            img.src = "data:image/svg+xml;base64," + btoa(svgData);
                                        }}
                                        className="px-6 py-2.5 bg-slate-900 text-white dark:bg-slate-800 dark:text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <QrCode className="w-3.5 h-3.5" /> DOWNLOAD PNG
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <SectionHeader title="Social Integration" desc="Boost your reach by sharing your catalogue across all social platforms." icon={Share2} />
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { label: 'WhatsApp', icon: MessageSquare, color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400', btn: 'bg-emerald-600', action: () => window.open(`https://wa.me/?text=Check out our catalogue: ${publicUrl}`, '_blank') },
                                    { label: 'Instagram', icon: Instagram, color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400', btn: 'bg-rose-600', action: () => copyToClipboard(publicUrl) },
                                    { label: 'Facebook', icon: Facebook, color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400', btn: 'bg-blue-600', action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${publicUrl}`, '_blank') },
                                ].map(s => (
                                    <div key={s.label} className="bg-surface rounded-3xl border border-border p-6 shadow-sm hover:shadow-xl transition-all group text-center">
                                        <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                                            <s.icon className="w-7 h-7" />
                                        </div>
                                        <h4 className="text-sm font-black text-text uppercase tracking-tight mb-4">{s.label}</h4>
                                        <button onClick={s.action} className={`w-full py-3 ${s.btn} text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                                            {s.label === 'Instagram' ? 'COPY LINK' : `SHARE TO ${s.label.toUpperCase()}`}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {showPicker && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPicker(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-surface rounded-[2rem] border border-border w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="px-8 py-6 border-b border-border flex items-center justify-between shrink-0">
                                <h3 className="text-lg font-black text-text uppercase tracking-tight">Pick a Service</h3>
                                <button onClick={() => setShowPicker(false)} className="p-2 hover:bg-surface rounded-full">
                                    <XCircle className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {services.map(s => (
                                    <button
                                        key={s._id}
                                        onClick={() => addItemToSection(activeSectionIndex, s)}
                                        className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-primary/30 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><Layout className="w-5 h-5" /></div>
                                            <div>
                                                <div className="text-sm font-bold text-text">{s.name}</div>
                                                <div className="text-[10px] text-text-muted font-bold uppercase">{s.category}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-black text-primary italic">₹{s.price}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}


