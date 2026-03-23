import { useState } from 'react';
import { useCMS } from '../../contexts/CMSContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout,
    Image as ImageIcon,
    Plus,
    Trash2,
    Edit,
    Eye,
    Smartphone,
    Tag,
    Zap,
    X,
    XCircle,
    Upload,
    ArrowRight,
    Star,
    Clock,
    User,
    UserCircle,
    Camera,
    MapPin
} from 'lucide-react';

/** Shrink large uploads so base64 fits MongoDB document limits */
async function compressImageFile(file, maxWidth = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            try {
                const canvas = document.createElement('canvas');
                let w = img.naturalWidth || img.width;
                let h = img.naturalHeight || img.height;
                if (w > maxWidth) {
                    h = Math.round((h * maxWidth) / w);
                    w = maxWidth;
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality));
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Could not read image'));
        };
        img.src = url;
    });
}

export default function MarketingCMSPage() {
    const {
        banners, addBanner, updateBanner, deleteBanner, toggleBannerStatus,
        offers, addOffer, updateOffer, deleteOffer, toggleOfferStatus,
        lookbook, addLookbookItem, updateLookbookItem, deleteLookbookItem, toggleLookbookStatus,
        experts, approveExpertProfile, rejectExpertProfile, deleteExpertProfile, pendingExpertsCount,
        cmsLoading, fetchAppCMS,
    } = useCMS();
    const { outlets } = useBusiness();

    const [activeTab, setActiveTab] = useState('banners');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('banner'); // 'banner', 'offer', or 'lookbook'
    const [selectedGender, setSelectedGender] = useState('all'); // 'all', 'men', 'women'
    const [editingId, setEditingId] = useState(null);
    const [showPreviewInfo, setShowPreviewInfo] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        link: '/app/book',
        gender: 'all',
        description: '',
        tag: '',
        code: '',
        expiry: '',
        validityText: '',
        btnText: 'Apply',
        image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop'
    });

    const resetForm = () => {
        setFormData({
            title: '',
            link: '/app/book',
            gender: 'all',
            description: '',
            tag: '',
            code: '',
            expiry: '',
            validityText: '',
            btnText: 'Apply',
            image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop'
        });
        setEditingId(null);
    };

    const [saving, setSaving] = useState(false);

    const handlePublish = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                if (modalType === 'banner') await updateBanner(editingId, formData);
                else if (modalType === 'offer') await updateOffer(editingId, formData);
                else await updateLookbookItem(editingId, formData);
            } else {
                const newItem = { ...formData, status: modalType === 'offer' ? 'Live' : 'Active' };
                if (modalType === 'banner') await addBanner(newItem);
                else if (modalType === 'offer') await addOffer(newItem);
                else await addLookbookItem(newItem);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Failed to save. Please try again.';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            if (type === 'banner') await deleteBanner(id);
            else if (type === 'offer') await deleteOffer(id);
            else await deleteLookbookItem(id);
        } catch (err) {
            console.error(err);
            alert('Failed to delete. Please try again.');
        }
    };

    const handleEdit = (type, item) => {
        setModalType(type);
        setFormData({
            title: item.title,
            link: item.link || '/app/book',
            gender: item.gender || 'all',
            description: item.description || '',
            tag: item.tag || '',
            code: item.code || '',
            expiry: item.expiry || '',
            validityText: item.validityText || '',
            btnText: item.btnText || 'Apply',
            image: item.image || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop'
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (type, id) => {
        try {
            if (type === 'banner') await toggleBannerStatus(id);
            else if (type === 'offer') await toggleOfferStatus(id);
            else await toggleLookbookStatus(id);
        } catch (err) {
            console.error(err);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const dataUrl = await compressImageFile(file);
            setFormData((prev) => ({ ...prev, image: dataUrl }));
        } catch (err) {
            console.error(err);
            alert(err?.message || 'Could not process image.');
        } finally {
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-left font-black leading-none">
                    <h1 className="text-4xl font-black text-text uppercase tracking-tight leading-none mb-2">App CMS</h1>
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-primary"></span>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Marketing & Brand Presence</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => {
                            fetchAppCMS();
                            setShowPreviewInfo(true);
                            setTimeout(() => setShowPreviewInfo(false), 3000);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-surface border border-border/40 rounded-none text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-surface-alt transition-all relative"
                    >
                        <Smartphone className="w-4 h-4" /> Preview App
                        <AnimatePresence>
                            {showPreviewInfo && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute -bottom-12 left-0 right-0 py-2 bg-primary text-white text-[8px] font-black text-center uppercase tracking-widest z-50 shadow-xl"
                                >
                                    App Sync Active
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                    <button
                        onClick={() => {
                            let type = 'banner';
                            if (activeTab === 'offers') type = 'offer';
                            if (activeTab === 'lookbook') type = 'lookbook';
                            setModalType(type);
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-none text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" /> New {activeTab === 'banners' ? 'Banner' : activeTab === 'offers' ? 'Offer' : 'Look'}
                    </button>
                </div>
            </div>

            {/* Navigation & Filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border/40 pb-4">
                <div className="flex gap-8 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'banners', label: 'App Banners', icon: ImageIcon },
                        { id: 'offers', label: 'Exclusive Offers', icon: Tag },
                        { id: 'lookbook', label: 'Stylist Lookbook', icon: Camera },
                        { id: 'experts', label: 'Expert Profiles', icon: UserCircle },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-text-muted hover:text-text'
                                }`}
                        >
                            {tab.label}
                            {tab.id === 'experts' && pendingExpertsCount > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded-full animate-pulse">
                                    {pendingExpertsCount}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <motion.div layoutId="tab-underline" className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex bg-surface-alt p-1 rounded-none border border-border/40">
                    {[
                        { id: 'all', label: 'All Protocols' },
                        { id: 'men', label: 'Men\'s Sector' },
                        { id: 'women', label: 'Women\'s Sector' },
                    ].map((g) => (
                        <button
                            key={g.id}
                            onClick={() => setSelectedGender(g.id)}
                            className={`px-6 py-2 text-[8px] font-black uppercase tracking-widest transition-all ${selectedGender === g.id ? 'bg-primary text-primary-foreground shadow-lg' : 'text-text-muted hover:text-text'
                                }`}
                        >
                            {g.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            {cmsLoading && (
                <div className="py-20 text-center text-text-muted font-bold uppercase tracking-widest">Loading...</div>
            )}
            <AnimatePresence mode="wait">
                {!cmsLoading && activeTab === 'banners' && (
                    <motion.div
                        key="banners"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {banners
                            .filter(b => selectedGender === 'all' || b.gender === selectedGender)
                            .map((banner) => (
                                <div key={banner.id} className="group bg-surface border border-border/40 rounded-none overflow-hidden hover:border-primary/40 transition-all text-left">
                                    <div className="aspect-[21/9] relative overflow-hidden bg-background">
                                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto z-10">
                                                <button 
                                                    onClick={() => window.open(banner.image, '_blank')}
                                                    title="View Creative"
                                                    className="p-2 bg-white text-black hover:bg-emerald-500 hover:text-white transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleEdit('banner', banner)}
                                                    title="Edit Banner"
                                                    className="p-2 bg-white text-black hover:bg-primary hover:text-white transition-colors"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete('banner', banner.id)}
                                                    title="Delete Banner"
                                                    className="p-2 bg-white text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                        </div>
                                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                            <button 
                                                onClick={() => handleToggleStatus('banner', banner.id)}
                                                className={`text-[8px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest transition-all ${banner.status === 'Active' ? 'bg-emerald-500 text-white dark:text-primary-foreground' : 'bg-surface-alt text-text-muted border border-border hover:bg-primary hover:text-white'
                                                }`}
                                            >
                                                {banner.status}
                                            </button>
                                            <span className="text-[8px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest bg-white/10 text-white backdrop-blur-md border border-white/20">
                                                {banner.gender === 'all' ? 'All' : banner.gender === 'men' ? 'Men' : 'Women'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-sm font-black text-text uppercase tracking-tight mb-1">{banner.title}</h3>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest break-all">Link: {banner.link}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <button 
                                                onClick={() => handleEdit('banner', banner)}
                                                className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all outline-none"
                                            >
                                                Edit Details <ArrowRight className="w-3 h-3" />
                                            </button>
                                            <div className="flex items-center gap-1 opacity-50">
                                                {banner.gender === 'all' ? <Layout className="w-3 h-3" /> : banner.gender === 'men' ? <User className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
                                                <span className="text-[8px] font-bold uppercase">{banner.gender === 'all' ? 'all' : banner.gender}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {/* New Banner Slot */}
                        <button
                            onClick={() => { setModalType('banner'); resetForm(); setIsModalOpen(true); }}
                            className="aspect-[21/9] sm:aspect-auto flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/[0.02] transition-all group min-h-[250px]"
                        >
                            <div className="w-12 h-12 rounded-none bg-surface-alt flex items-center justify-center border border-border group-hover:bg-primary group-hover:border-primary transition-all">
                                <Plus className="w-6 h-6 text-text-muted group-hover:text-white" />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-text uppercase tracking-widest">Add New Banner</p>
                                <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mt-1">Recommended: 1200 x 400px</p>
                            </div>
                        </button>
                    </motion.div>
                )}

                {!cmsLoading && activeTab === 'offers' && (
                    <motion.div
                        key="offers"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                    >
                        {offers
                            .filter(o => selectedGender === 'all' || o.gender === selectedGender)
                            .map((offer) => (
                                <div key={offer.id} className="bg-surface border border-border/40 p-8 flex flex-col md:flex-row gap-8 hover:border-violet-500/40 transition-all group relative text-left">
                                    <div className="absolute top-0 right-0 p-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all z-10">
                                        <button 
                                            onClick={() => handleEdit('offer', offer)}
                                            title="Edit Offer"
                                            className="p-2 bg-surface-alt border border-border text-text-muted hover:text-primary"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete('offer', offer.id)}
                                            title="Delete Offer"
                                            className="p-2 bg-surface-alt border border-border text-text-muted hover:text-rose-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="w-24 h-24 rounded-none bg-background border border-border/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-violet-500/20 transition-all">
                                        <Zap className="w-10 h-10 text-violet-500 animate-pulse" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleToggleStatus('offer', offer.id)}
                                                className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest transition-all ${offer.status === 'Live' ? 'bg-emerald-500 text-white dark:text-primary-foreground' : 'bg-surface-alt text-text-muted border border-border hover:bg-violet-500 hover:text-white'
                                                }`}>
                                                {offer.status}
                                            </button>
                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest bg-violet-500/10 text-violet-500 border border-violet-500/20">
                                                {offer.gender === 'men' ? 'Men' : 'Women'}
                                            </span>
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1 ml-auto">
                                                <Clock className="w-3 h-3" /> Ends: {offer.expiry}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-text uppercase tracking-tight">{offer.title}</h3>
                                            <p className="text-xs text-text-secondary mt-2 leading-relaxed">{offer.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="px-4 py-2 bg-background border border-border/40 border-dashed rounded-none text-xs font-black text-primary tracking-widest uppercase">
                                                {offer.code}
                                            </div>
                                            <button 
                                                onClick={() => handleEdit('offer', offer)}
                                                className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-violet-500 transition-colors"
                                            >
                                                Apply Rules →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </motion.div>
                )}

                {!cmsLoading && activeTab === 'lookbook' && (
                    <motion.div
                        key="lookbook"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {lookbook
                            .filter(l => selectedGender === 'all' || l.gender === selectedGender)
                            .map((item) => (
                                <div key={item.id} className="group bg-surface border border-border/40 rounded-none overflow-hidden hover:border-emerald-500/40 transition-all text-left">
                                    <div className="aspect-[3/4] relative overflow-hidden bg-background">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto z-10">
                                            <button 
                                                onClick={() => handleEdit('lookbook', item)}
                                                className="p-2 bg-white text-black hover:bg-primary hover:text-white transition-colors"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete('lookbook', item.id)}
                                                className="p-2 bg-white text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <div className="flex items-center gap-2 mb-2">
                                                <button 
                                                    onClick={() => handleToggleStatus('lookbook', item.id)}
                                                    className={`text-[8px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest transition-all ${item.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-surface-alt text-text-muted border border-border hover:bg-primary hover:text-white'
                                                    }`}
                                                >
                                                    {item.status}
                                                </button>
                                                <span className="text-[8px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                    {item.tag}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black uppercase tracking-tight leading-tight">{item.title}</h3>
                                            <div className="flex items-center gap-1 mt-1 opacity-60">
                                                <User className="w-3 h-3" />
                                                <span className="text-[8px] font-bold uppercase tracking-widest">{item.gender} Sector</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {/* New Lookbook Slot */}
                        <button
                            onClick={() => { setModalType('lookbook'); resetForm(); setIsModalOpen(true); }}
                            className="aspect-[3/4] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/[0.02] transition-all group min-h-[300px]"
                        >
                            <div className="w-12 h-12 rounded-none bg-surface-alt flex items-center justify-center border border-border group-hover:bg-primary group-hover:border-primary transition-all">
                                <Plus className="w-6 h-6 text-text-muted group-hover:text-white" />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-text uppercase tracking-widest">Add New Look</p>
                                <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mt-1">Portrait Aspect Ratio</p>
                            </div>
                        </button>
                    </motion.div>
                )}

                {!cmsLoading && activeTab === 'experts' && (
                    <motion.div
                        key="experts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {experts.map((expert) => (
                            <div key={expert.id || expert._id} className="bg-surface border border-border/40 p-6 flex flex-col gap-4 text-left">
                                <div className="flex items-center gap-4">
                                    <img src={expert.img || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80'} className="w-16 h-16 rounded-full border border-border object-cover" alt={expert.name} />
                                    <div>
                                        <h3 className="text-sm font-black text-text uppercase tracking-tight">{expert.name}</h3>
                                        <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-none mt-1 inline-block ${
                                            expert.status === 'Approved' ? 'bg-emerald-500 text-white' : expert.status === 'Pending' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                                        }`}>
                                            {expert.status}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-text-muted">
                                        <span>Exp: {expert.experience}</span>
                                        <span>Clients: {expert.clients}</span>
                                    </div>
                                    {(expert.outletId || expert.outletName) && (
                                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 border border-primary/10 w-fit">
                                            <MapPin className="w-2.5 h-2.5" />
                                            {expert.outletName || outlets.find(o => o._id === expert.outletId || o.id === expert.outletId)?.name || 'Unknown Outlet'}
                                        </div>
                                    )}
                                    <p className="text-[10px] text-text-secondary leading-tight line-clamp-2">{expert.bio}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {expert.specializations?.map(s => (
                                            <span key={s} className="text-[7px] font-black px-1.5 py-0.5 bg-surface-alt border border-border text-text-muted uppercase">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2 pt-4 border-t border-border/20">
                                    {expert.status === 'Pending' && (
                                        <>
                                            <button 
                                                onClick={() => approveExpertProfile(expert.id || expert._id)}
                                                className="flex-1 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => rejectExpertProfile(expert.id || expert._id)}
                                                className="flex-1 py-2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <button 
                                        onClick={() => expert.status === 'Approved' ? rejectExpertProfile(expert.id || expert._id) : approveExpertProfile(expert.id || expert._id)}
                                        className="p-2 border border-border text-text-muted hover:text-primary transition-all"
                                    >
                                        {expert.status === 'Approved' ? <XCircle className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={() => deleteExpertProfile(expert.id || expert._id)}
                                        className="p-2 border border-border text-text-muted hover:text-rose-600 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {experts.length === 0 && (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-border/40">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No expert profiles submitted yet</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-white/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-sm rounded-2xl border border-border shadow-2xl overflow-hidden relative"
                        >                            <div className="p-6">
                                    <div className="px-6 py-4 border-b border-border flex items-center justify-between mx-[-1.5rem] mt-[-1.5rem] mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-text-secondary border border-border/50">
                                                {modalType === 'banner' ? <ImageIcon className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                                            </div>
                                            <div className="text-left">
                                                <h2 className="text-lg font-black text-text uppercase tracking-tight">
                                                    {editingId ? 'Edit Content' : 
                                                     modalType === 'banner' ? 'New Banner' : 
                                                     modalType === 'offer' ? 'New Offer' : 'New Lookbook Entry'}
                                                </h2>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-text-muted">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                <form className="space-y-4 text-left" onSubmit={handlePublish}>
                                    {modalType === 'banner' ? (
                                        <>
                                            <div className="grid gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Main text (e.g. ₹200 OFF) *</label>
                                                    <input 
                                                        required 
                                                        type="text" 
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                        placeholder="e.g. ₹200 OFF" 
                                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30" 
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Validity line (top of card)</label>
                                                    <input 
                                                        type="text" 
                                                        value={formData.validityText}
                                                        onChange={(e) => setFormData({...formData, validityText: e.target.value})}
                                                        placeholder="e.g. VALID 20 MAR - 24 JUN" 
                                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30" 
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Button label</label>
                                                    <input 
                                                        type="text" 
                                                        value={formData.btnText}
                                                        onChange={(e) => setFormData({...formData, btnText: e.target.value})}
                                                        placeholder="Apply" 
                                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30" 
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Show for</label>
                                                    <select 
                                                        value={formData.gender}
                                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="all">Everyone</option>
                                                        <option value="men">Men only</option>
                                                        <option value="women">Women only</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">When customer taps the banner</label>
                                                <select 
                                                    value={formData.link}
                                                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                                                    className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="/app/book">Book appointment</option>
                                                    <option value="/app/home">Home</option>
                                                    <option value="/app/services">Services</option>
                                                    <option value="/app/membership">Membership</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Banner Creative</label>
                                                <input
                                                    type="file"
                                                    id="banner-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                />
                                                <label 
                                                    htmlFor="banner-upload"
                                                    className="border-2 border-dashed border-border p-6 flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-xl hover:border-primary/40 transition-all cursor-pointer group overflow-hidden relative min-h-[120px]"
                                                >
                                                    {formData.image ? (
                                                        <>
                                                            <img src={formData.image} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                                                            <div className="relative z-10 flex flex-col items-center">
                                                                <Upload className="w-8 h-8 text-primary mb-2 shadow-sm" />
                                                                <p className="text-[10px] font-black text-white uppercase tracking-widest bg-black px-4 py-1.5 rounded-full">Change Image</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-8 h-8 text-text-muted group-hover:text-primary transition-colors" />
                                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Click to upload banner</p>
                                                            <p className="text-[9px] text-text-muted font-bold opacity-40 uppercase tracking-[0.2em] mt-1">PNG, JPG, WEBP (Max 2MB)</p>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </>
                                    ) : modalType === 'lookbook' ? (
                                        <>
                                            <div className="grid gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Look Heading</label>
                                                    <input 
                                                        required 
                                                        type="text" 
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                        placeholder="e.g. Classic Taper Ritual" 
                                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30" 
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Style Subheading (Tag)</label>
                                                    <input 
                                                        required 
                                                        type="text" 
                                                        value={formData.tag}
                                                        onChange={(e) => setFormData({...formData, tag: e.target.value})}
                                                        placeholder="e.g. Fade / Balayage / Bridal" 
                                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Gender Segment</label>
                                                <select 
                                                    value={formData.gender}
                                                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                                    className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="men">Men's Sector</option>
                                                    <option value="women">Women's Sector</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Look Image</label>
                                                <input
                                                    type="file"
                                                    id="lookbook-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                />
                                                <label 
                                                    htmlFor="lookbook-upload"
                                                    className="border-2 border-dashed border-border p-6 flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-xl hover:border-primary/40 transition-all cursor-pointer group overflow-hidden relative min-h-[120px]"
                                                >
                                                    {formData.image ? (
                                                        <>
                                                            <img src={formData.image} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                                                            <div className="relative z-10 flex flex-col items-center">
                                                                <Upload className="w-8 h-8 text-primary mb-2 shadow-sm" />
                                                                <p className="text-[10px] font-black text-white uppercase tracking-widest bg-black px-4 py-1.5 rounded-full">Change Image</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-8 h-8 text-text-muted group-hover:text-primary transition-colors" />
                                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Click to upload look</p>
                                                            <p className="text-[9px] text-text-muted font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Portrait orientation preferred</p>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Offer Title</label>
                                                    <input 
                                                        required 
                                                        type="text" 
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                        placeholder="e.g. Bridal Glow Package" 
                                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30" 
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Target Sector</label>
                                                    <select 
                                                        value={formData.gender}
                                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="men">Men Only</option>
                                                        <option value="women">Women Only</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Promo Code</label>
                                                    <input 
                                                        required 
                                                        type="text" 
                                                        value={formData.code}
                                                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                                                        placeholder="GLOW50" 
                                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-black text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                                                        />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Expiry Date</label>
                                                    <input 
                                                        required 
                                                        type="date" 
                                                        value={formData.expiry}
                                                        onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                                                        />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Short Description</label>
                                                <textarea 
                                                    required 
                                                    rows="2" 
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                    placeholder="Explain the value proposition..."                                                        className="w-full px-4 py-2 bg-white border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:opacity-30"
                                                    ></textarea>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 py-3 rounded-lg border border-border text-[10px] font-black uppercase tracking-wider text-text-muted hover:bg-slate-50 transition-all font-bold"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-[1.5] py-3 bg-[#1a1a1a] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : (editingId ? 'Update' : 'Confirm')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
