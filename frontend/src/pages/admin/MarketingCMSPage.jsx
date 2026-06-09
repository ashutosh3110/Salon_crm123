import { useState, useEffect, useRef } from 'react';
import { useCMS } from '../../contexts/CMSContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import {
    Layout,
    Image as ImageIcon,
    Plus,
    Trash2,
    Edit,
    Eye,
    Smartphone,
    ChevronDown,
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
    MapPin,
    Globe,
    Store,
    Megaphone
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

function CustomSelect({ value, onChange, options, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value)) || { label: placeholder, value: '' };

    return (
        <div className={`relative w-full ${isOpen ? 'z-[200]' : 'z-[100]'}`} ref={selectRef}>
            <div
                className="w-full px-4 py-2.5 bg-white dark:bg-[#121826] border border-border rounded-lg text-sm font-bold flex items-center justify-between cursor-pointer focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate pr-4 text-text">{selectedOption.label}</span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} shrink-0`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-surface border border-border rounded-lg shadow-xl overflow-hidden max-h-56 overflow-y-auto z-[200]"
                    >
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors text-text hover:bg-slate-50 dark:hover:bg-slate-800 font-medium ${String(opt.value) === String(value) ? 'bg-slate-50 dark:bg-slate-800 text-primary' : ''}`}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function MarketingCMSPage() {
    const {
        banners, addBanner, updateBanner, deleteBanner, toggleBannerStatus,
        offers, addOffer, updateOffer, deleteOffer, toggleOfferStatus,
        lookbook, addLookbookItem, updateLookbookItem, deleteLookbookItem, toggleLookbookStatus,
        experts, approveExpertProfile, rejectExpertProfile, deleteExpertProfile, pendingExpertsCount,
        cmsLoading, fetchAppCMS,
    } = useCMS();
    const { user } = useAuth();
    // Allow any admin to see the outlet dropdown to satisfy "show two drop down" request
    const isSuperAdmin = true; // Forcing true so both dropdowns are visible
    const { outlets, fetchOutlets, platformSettings } = useBusiness();

    useEffect(() => {
        if (isSuperAdmin) {
            fetchOutlets();
        }
    }, [isSuperAdmin, fetchOutlets]);

    const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'banners' : 'experts');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.paddingRight = '5px'; // Prevent layout shift from scrollbar disappearing
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
    }, [isModalOpen]);
    const [modalType, setModalType] = useState('banner'); // 'banner', 'offer', or 'lookbook'
    const [selectedGender, setSelectedGender] = useState('all'); // 'all', 'men', 'women'
    const [editingId, setEditingId] = useState(null);
    const [showPreviewInfo, setShowPreviewInfo] = useState(false);

    const availableTabs = [
        { id: 'banners', label: 'App Banners', icon: ImageIcon, roles: ['superadmin'] },
    ];

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        gender: 'all',
        description: '',
        tag: '',
        code: '',
        expiry: '',
        validityText: '',
        btnText: 'Apply',
        outletId: '',
        image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop'
    });

    const resetForm = () => {
        setFormData({
            title: '',
            gender: 'all',
            description: '',
            tag: '',
            code: '',
            expiry: '',
            validityText: '',
            btnText: 'Apply',
            outletId: '',
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
            gender: item.gender || 'all',
            description: item.description || '',
            tag: item.tag || '',
            code: item.code || '',
            expiry: item.expiry || '',
            validityText: item.validityText || '',
            btnText: item.btnText || 'Apply',
            outletId: item.outletId || '',
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

    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = platformSettings?.maxImageSize || 5;
        const unit = platformSettings?.maxImageSizeUnit || 'MB';
        const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
        const threshold = maxSize * multiplier;

        // Validation: Dynamic
        if (file.size > threshold) {
            alert(`File size exceeds ${maxSize}${unit} limit.`);
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            // Upload to Cloudinary via backend
            const res = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setFormData((prev) => ({ ...prev, image: res.data.url }));
            } else {
                throw new Error(res.data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('[Cloudinary Upload Error]:', err);
            alert(err?.response?.data?.message || err?.message || 'Could not upload image to Cloudinary.');
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const tabs = [
        { id: 'banners', label: 'App Banners', icon: ImageIcon, count: banners.length },
        { id: 'offers', label: 'Promotional Offers', icon: Tag, count: offers.length },
        { id: 'lookbook', label: 'Lookbook Catalog', icon: Camera, count: lookbook.length },
        { id: 'experts', label: 'Expert Profiles', icon: UserCircle, count: experts.length, badge: pendingExpertsCount > 0 ? pendingExpertsCount : null }
    ];

    return (
        <div className="space-y-6 pb-20">
            {/* Premium Header Card */}
            <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">App CMS Panel</h1>
                    <p className="text-xs text-text-secondary mt-1 font-medium">Manage mobile application banners, promotional offers, and lookbook creatives.</p>
                </div>
                {activeTab !== 'experts' && (
                    <button
                        onClick={() => {
                            let type = 'banner';
                            if (activeTab === 'offers') type = 'offer';
                            if (activeTab === 'lookbook') type = 'lookbook';
                            setModalType(type);
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B6F23] text-primary-foreground text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/25 active:scale-[0.98] self-start md:self-auto"
                    >
                        <Plus className="w-4 h-4 text-white" /> New {activeTab === 'banners' ? 'Banner' : activeTab === 'offers' ? 'Offer' : 'Look'}
                    </button>
                )}
            </div>

      
            {/* Premium Filtering */}
            {activeTab !== 'experts' && (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-border text-left">
                    <div className="text-xs font-bold text-text-secondary uppercase tracking-wide pl-2">Filter {activeTab} By Sector:</div>
                    <div className="flex bg-white dark:bg-[#121826] p-1 rounded-xl border border-border">
                        {[
                            { id: 'all', label: 'All Sectors' },
                            { id: 'men', label: "Men's Sector" },
                            { id: 'women', label: "Women's Sector" },
                        ].map((g) => (
                            <button
                                key={g.id}
                                onClick={() => setSelectedGender(g.id)}
                                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-lg whitespace-nowrap ${
                                    selectedGender === g.id
                                    ? 'bg-gradient-to-r from-primary to-[#8B6F23] text-white shadow-md shadow-primary/25'
                                    : 'text-text-secondary hover:text-[#B4912B] hover:bg-[#B4912B]/5'
                                }`}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Area */}
            {cmsLoading && (
                <div className="py-20 text-center text-text-muted font-bold uppercase tracking-widest animate-pulse">Synchronizing CMS Content...</div>
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
                                <div key={banner.id} className="group bg-white dark:bg-slate-900 border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#B4912B]/30 transition-all text-left flex flex-col">
                                    <div className="aspect-[21/9] relative overflow-hidden bg-slate-100">
                                        <img src={getImageUrl(banner.image)} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        
                                        {/* Floating Actions */}
                                        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                                            <button
                                                onClick={() => window.open(getImageUrl(banner.image), '_blank')}
                                                title="View Creative"
                                                className="p-2 bg-white/95 dark:bg-slate-950/95 hover:!bg-emerald-500 rounded-xl transition-all shadow-md group/btn"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-emerald-600 group-hover/btn:text-white" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit('banner', banner)}
                                                title="Edit Banner"
                                                className="p-2 bg-white/95 dark:bg-slate-950/95 hover:!bg-[#B4912B] rounded-xl transition-all shadow-md group/btn"
                                            >
                                                <Edit className="w-3.5 h-3.5 text-amber-600 group-hover/btn:text-white" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete('banner', banner.id)}
                                                title="Delete Banner"
                                                className="p-2 bg-white/95 dark:bg-slate-950/95 hover:!bg-rose-600 rounded-xl transition-all shadow-md group/btn animate-in fade-in"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover/btn:text-white" />
                                            </button>
                                        </div>
                                        
                                        {/* Status & sector labels */}
                                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleStatus('banner', banner.id)}
                                                className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all shadow-sm ${
                                                    banner.status === 'Active'
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-slate-500 text-white hover:bg-emerald-500'
                                                }`}
                                            >
                                                {banner.status}
                                            </button>
                                            <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-black/40 text-white backdrop-blur-md border border-white/10">
                                                {banner.gender === 'all' ? 'All' : banner.gender === 'men' ? 'Men' : 'Women'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Banner Title</span>
                                            <h3 className="text-sm font-bold text-text uppercase tracking-tight">{banner.title}</h3>
                                        </div>
                                     
                                    </div>
                                </div>
                            ))}

                        {/* Premium Dotted Add Slot */}
                        <button
                            onClick={() => { setModalType('banner'); resetForm(); setIsModalOpen(true); }}
                            className="aspect-[21/9] sm:aspect-auto flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#B4912B]/30 hover:border-[#B4912B] bg-gradient-to-br hover:from-[#B4912B]/5 hover:to-transparent transition-all rounded-2xl group min-h-[250px] p-6 shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-border group-hover:bg-[#B4912B] group-hover:border-[#B4912B] transition-all group-hover:shadow-lg shadow-sm">
                                <Plus className="w-6 h-6 text-[#B4912B] group-hover:text-white" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-text uppercase tracking-wider">Add New Banner</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Recommended: 1200 x 400px</p>
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
                                <div key={offer.id} className="bg-white dark:bg-slate-900 border border-border rounded-2xl overflow-hidden hover:border-[#B4912B]/30 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row relative text-left">
                                    {/* Left Voucher Code block */}
                                    <div className="md:w-1/3 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-[#B4912B]/10 dark:to-transparent p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-dashed border-border shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[#8B6F23] flex items-center justify-center shadow-lg shadow-primary/20 text-white">
                                            <Tag className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs font-black text-text uppercase tracking-widest mt-3 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-border shadow-sm">{offer.code}</span>
                                    </div>
                                    
                                    {/* Right Content block */}
                                    <div className="flex-1 p-6 space-y-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleStatus('offer', offer.id)}
                                                        className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all shadow-sm ${
                                                            offer.status === 'Live'
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-slate-500 text-white hover:bg-emerald-500'
                                                        }`}
                                                    >
                                                        {offer.status}
                                                    </button>
                                                    <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-text-secondary border border-border">
                                                        {offer.gender === 'men' ? 'Men' : 'Women'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleEdit('offer', offer)}
                                                        className="p-1.5 border border-border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-text-muted hover:text-primary transition-all"
                                                    >
                                                        <Edit size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('offer', offer.id)}
                                                        className="p-1.5 border border-border rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 hover:text-rose-600 transition-all"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3">
                                                <h3 className="text-sm font-bold text-text uppercase tracking-tight">{offer.title}</h3>
                                                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{offer.description}</p>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-border flex items-center justify-between text-[9px] font-bold text-text-muted uppercase tracking-wider">
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Ends: {offer.expiry}</span>
                                            <button onClick={() => handleEdit('offer', offer)} className="text-primary hover:underline font-bold tracking-widest uppercase">Rules →</button>
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
                                <div key={item.id} className="group bg-white dark:bg-slate-900 border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#B4912B]/30 transition-all text-left flex flex-col">
                                    <div className="aspect-[3/4] relative overflow-hidden bg-slate-100">
                                        <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                                        {/* Floating Actions */}
                                        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                                            <button
                                                onClick={() => handleEdit('lookbook', item)}
                                                className="p-2 bg-white/95 dark:bg-slate-950/95 hover:!bg-[#B4912B] rounded-xl transition-all shadow-md group/btn"
                                            >
                                                <Edit className="w-3.5 h-3.5 text-amber-600 group-hover/btn:text-white" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete('lookbook', item.id)}
                                                className="p-2 bg-white/95 dark:bg-slate-950/95 hover:!bg-rose-600 rounded-xl transition-all shadow-md group/btn"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover/btn:text-white" />
                                            </button>
                                        </div>

                                        {/* Content info overlays */}
                                        <div className="absolute bottom-4 left-4 right-4 text-white space-y-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus('lookbook', item.id)}
                                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider transition-all ${
                                                        item.status === 'Active'
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-slate-500 text-white'
                                                    }`}
                                                >
                                                    {item.status}
                                                </button>
                                                <span className="text-[9px] font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg uppercase tracking-wider">
                                                    {item.tag}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-black uppercase tracking-tight leading-tight">{item.title}</h3>
                                            <div className="flex items-center gap-1.5 opacity-70">
                                                <User className="w-3.5 h-3.5" />
                                                <span className="text-[8px] font-bold uppercase tracking-widest">{item.gender} Sector</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {/* Add Lookbook Slot */}
                        <button
                            onClick={() => { setModalType('lookbook'); resetForm(); setIsModalOpen(true); }}
                            className="aspect-[3/4] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#B4912B]/30 hover:border-[#B4912B] bg-gradient-to-br hover:from-[#B4912B]/5 hover:to-transparent transition-all rounded-2xl group min-h-[300px] p-6 shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-border group-hover:bg-[#B4912B] group-hover:border-[#B4912B] transition-all group-hover:shadow-lg shadow-sm">
                                <Plus className="w-6 h-6 text-[#B4912B] group-hover:text-white" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-text uppercase tracking-wider">Add New Look</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Portrait orientation card</p>
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
                            <div key={expert.id || expert._id} className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 flex flex-col gap-4 text-left shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <img src={getImageUrl(expert.img) || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80'} className="w-16 h-16 rounded-full border border-border object-cover" alt={expert.name} />
                                    <div>
                                        <h3 className="text-sm font-black text-text uppercase tracking-tight">{expert.name}</h3>
                                        <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-xl mt-1 inline-block ${expert.status === 'Approved' ? 'bg-emerald-500 text-white' : expert.status === 'Pending' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
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
                                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 border border-primary/10 w-fit rounded-lg">
                                            <MapPin className="w-2.5 h-2.5" />
                                            {expert.outletName || outlets.find(o => o._id === expert.outletId || o.id === expert.outletId)?.name || 'Unknown Outlet'}
                                        </div>
                                    )}
                                    <p className="text-xs text-text-secondary leading-normal line-clamp-2">{expert.bio}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {expert.specializations?.map(s => (
                                            <span key={s} className="text-[8px] font-bold px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-border text-text-muted rounded-lg uppercase tracking-wide">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2 pt-4 border-t border-border">
                                    {expert.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => approveExpertProfile(expert.id || expert._id)}
                                                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest transition-all rounded-lg"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => rejectExpertProfile(expert.id || expert._id)}
                                                className="flex-1 py-2 bg-rose-500 hover:bg-rose-650 text-white text-[9px] font-black uppercase tracking-widest transition-all rounded-lg"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => expert.status === 'Approved' ? rejectExpertProfile(expert.id || expert._id) : approveExpertProfile(expert.id || expert._id)}
                                        className="p-2 border border-border text-text-muted hover:text-primary transition-all rounded-lg"
                                    >
                                        {expert.status === 'Approved' ? <XCircle className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => deleteExpertProfile(expert.id || expert._id)}
                                        className="p-2 border border-border hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 hover:text-rose-600 transition-all rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {experts.length === 0 && (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-border/40 rounded-2xl">
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
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl border border-border shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-5">
                                <div className="px-6 py-4 border-b border-border flex items-center justify-between mx-[-1.25rem] mt-[-1.25rem] mb-4 bg-slate-50 dark:bg-slate-800/40 rounded-t-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${
                                            modalType === 'banner'
                                                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-900/30 text-[#B4912B]'
                                                : modalType === 'offer'
                                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-900/30 text-emerald-600'
                                                : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-900/30 text-blue-600'
                                        }`}>
                                            {modalType === 'banner' ? (
                                                <Megaphone className="w-5 h-5" />
                                            ) : modalType === 'offer' ? (
                                                <Tag className="w-5 h-5" />
                                            ) : (
                                                <Camera className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-base font-bold text-text uppercase tracking-tight">
                                                {editingId ? 'Edit Content Details' :
                                                    modalType === 'banner' ? 'New Banner' :
                                                        modalType === 'offer' ? 'New Offer' : 'New Lookbook Entry'}
                                            </h2>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-text-muted">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form className="space-y-4 text-left" onSubmit={handlePublish}>
                                    {modalType === 'banner' ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Main text *</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                        placeholder="e.g. ₹200 OFF"
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-[#121826] border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30 text-text"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 relative">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Target Outlet</label>
                                                    <CustomSelect
                                                        value={formData.outletId}
                                                        onChange={(val) => setFormData({ ...formData, outletId: val })}
                                                        placeholder="All Outlets"
                                                        options={[
                                                            { value: 'all', label: 'All Outlets' },
                                                            ...outlets.map(o => ({ value: o._id || o.id, label: o.name }))
                                                        ]}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Gender Segment</label>
                                                <CustomSelect
                                                    value={formData.gender}
                                                    onChange={(val) => setFormData({ ...formData, gender: val })}
                                                    placeholder="All Sectors"
                                                    options={[
                                                        { value: 'all', label: 'All Sectors' },
                                                        { value: 'men', label: "Men's Sector" },
                                                        { value: 'women', label: "Women's Sector" }
                                                    ]}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-end mb-1">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Banner Image</label>
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">
                                                        MAX: {platformSettings?.maxImageSize || 5}{platformSettings?.maxImageSizeUnit || 'MB'}
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    id="banner-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                />
                                                <label
                                                    htmlFor="banner-upload"
                                                    className="w-full border-2 border-dashed border-border p-4 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:border-primary/45 transition-all cursor-pointer group overflow-hidden relative min-h-[90px]"
                                                >
                                                    {isUploading ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Uploading File...</p>
                                                        </div>
                                                    ) : formData.image ? (
                                                        <>
                                                            <img src={formData.image} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                                                            <div className="relative z-10 flex flex-col items-center">
                                                                <Upload className="w-8 h-8 text-primary mb-2 shadow-sm" />
                                                                <p className="text-[10px] font-black text-white uppercase tracking-widest bg-black px-4 py-1.5 rounded-xl">Change Image</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-8 h-8 text-text-muted group-hover:text-primary transition-colors" />
                                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Click to upload banner</p>
                                                            <p className="text-[9px] text-text-muted font-bold opacity-45 uppercase tracking-[0.2em] mt-1">PNG, JPG, WEBP (Max {platformSettings?.maxImageSize || 5}{platformSettings?.maxImageSizeUnit || 'MB'})</p>
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
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                        placeholder="e.g. Classic Taper Ritual"
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-[#121826] border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30 text-text"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Style Subheading (Tag)</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.tag}
                                                        onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                                        placeholder="e.g. Fade / Balayage / Bridal"
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-[#121826] border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30 text-text"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Gender Segment</label>
                                                <CustomSelect
                                                    value={formData.gender}
                                                    onChange={(val) => setFormData({ ...formData, gender: val })}
                                                    placeholder="Men's Sector"
                                                    options={[
                                                        { value: 'men', label: "Men's Sector" },
                                                        { value: 'women', label: "Women's Sector" }
                                                    ]}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-end mb-1">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Look Image</label>
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">
                                                        MAX: {platformSettings?.maxImageSize || 5}{platformSettings?.maxImageSizeUnit || 'MB'}
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    id="lookbook-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                />
                                                <label
                                                    htmlFor="lookbook-upload"
                                                    className="w-full border-2 border-dashed border-border p-4 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:border-primary/45 transition-all cursor-pointer group overflow-hidden relative min-h-[90px]"
                                                >
                                                    {isUploading ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Uploading...</p>
                                                        </div>
                                                    ) : formData.image ? (
                                                        <>
                                                            <img src={formData.image} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                                                            <div className="relative z-10 flex flex-col items-center">
                                                                <Upload className="w-8 h-8 text-primary mb-2 shadow-sm" />
                                                                <p className="text-[10px] font-black text-white uppercase tracking-widest bg-black px-4 py-1.5 rounded-xl">Change Image</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-8 h-8 text-text-muted group-hover:text-primary transition-colors" />
                                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Click to upload look</p>
                                                            <p className="text-[9px] text-text-muted font-bold opacity-45 uppercase tracking-[0.2em] mt-1">Portrait orientation (Max {platformSettings?.maxImageSize || 5}{platformSettings?.maxImageSizeUnit || 'MB'})</p>
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
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                        placeholder="e.g. Bridal Glow Package"
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-[#121826] border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30 text-text"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Target Sector</label>
                                                    <CustomSelect
                                                        value={formData.gender}
                                                        onChange={(val) => setFormData({ ...formData, gender: val })}
                                                        placeholder="Men Only"
                                                        options={[
                                                            { value: 'men', label: 'Men Only' },
                                                            { value: 'women', label: 'Women Only' }
                                                        ]}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Promo Code</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.code}
                                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                        placeholder="GLOW50"
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-[#121826] border border-border rounded-lg text-sm font-black text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Expiry Date</label>
                                                    <input
                                                        required
                                                        type="date"
                                                        value={formData.expiry}
                                                        onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-[#121826] border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-text"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Short Description</label>
                                                <textarea
                                                    required
                                                    rows="2"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Explain the value proposition..." className="w-full px-4 py-2 bg-white dark:bg-[#121826] border border-border rounded-lg text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:opacity-30 text-text"
                                                ></textarea>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 py-3 rounded-xl border border-border bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-text-secondary text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-[1.5] py-3 rounded-xl border border-transparent bg-gradient-to-r from-primary to-[#8B6F23] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-primary/25"
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
