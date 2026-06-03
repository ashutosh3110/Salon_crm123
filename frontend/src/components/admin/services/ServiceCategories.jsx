import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
/* v1.0.3 - Image Protocol Integrated */
import {
    Plus,
    Search,
    Tag,
    Layers,
    Edit2,
    Trash2,
    ArrowUpRight,
    Camera,
    X,
    Zap,
    User,
    UserCircle,
    Users,
    RefreshCcw,
    Download,
    Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../services/api';
import { useBusiness } from '../../../contexts/BusinessContext';

export default function ServiceCategories({ 
    categories = [], 
    onAdd, 
    onUpdate, 
    onDelete, 
    onToggleStatus,
    onRefresh,
    onDownloadTemplate,
    onBulkUpload,
    importing 
}) {
    const navigate = useNavigate();
    const { platformSettings } = useBusiness();
    const [searchTerm, setSearchTerm] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, type: 'add', data: null });

    // Lock body scroll when modal is open
    useEffect(() => {
        if (modalState.isOpen) {
            document.body.classList.add('modal-open');
            document.documentElement.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
            document.documentElement.classList.remove('modal-open');
        }
        return () => {
            document.body.classList.remove('modal-open');
            document.documentElement.classList.remove('modal-open');
        };
    }, [modalState.isOpen]);

    // Form States
    const [name, setName] = useState('');
    const [gender, setGender] = useState('women');
    const [image, setImage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const filteredCategories = categories.filter(cat =>
        (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Dynamic limit from platform settings
            const maxSize = platformSettings?.maxImageSize || 5;
            const unit = platformSettings?.maxImageSizeUnit || 'MB';
            const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
            const threshold = maxSize * multiplier;

            if (file.size > threshold) {
                alert(`IMAGE EXCEEDS ${maxSize}${unit} THRESHOLD`);
                return;
            }
            setImage(file); // Store the actual file object
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const openAddModal = () => {
        setModalState({ isOpen: true, type: 'add', data: null });
        setName('');
        setGender('women');
        setImage(null);
        setImagePreview('');
    };

    const openEditModal = (cat) => {
        setModalState({ isOpen: true, type: 'edit', data: cat });
        setName(cat.name);
        setGender(cat.gender || 'women');
        setImage(cat.image || ''); // Keep as string if it's an existing URL
        setImagePreview(cat.image || '');
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            alert('Please enter a category name');
            return;
        }

        // Use FormData for file upload
        const formData = new FormData();
        formData.append('name', name);
        formData.append('gender', gender);

        // Only append image if it's a new file (object)
        if (image instanceof File) {
            formData.append('image', image);
        } else if (typeof image === 'string') {
            formData.append('image', image);
        }

        if (modalState.type === 'add') {
            onAdd?.(formData);
        } else {
            onUpdate?.(modalState.data._id, formData);
        }

        closeModal();
    };

    const closeModal = () => {
        setModalState({ isOpen: false, type: 'add', data: null });
        setName('');
        setImage('');
        setImagePreview('');
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`DELETION PROTOCOL: Are you sure you want to remove "${name}"?`)) {
            onDelete?.(id);
        }
    };

    return (
        <div className="space-y-6">
            <style>{`
                body.modal-open, html.modal-open {
                    overflow: hidden !important;
                    height: 100vh !important;
                    position: fixed !important;
                    width: 100% !important;
                }

                .dark .admin-panel button.btn-custom-sample:not(aside *),
                .dark .admin-panel button.btn-custom-sample {
                    background-color: #1e293b !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel button.btn-custom-sample:not(aside *):hover {
                    background-color: #334155 !important;
                    color: #ffffff !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                }
                
                /* Import Button Overrides */
                .dark .admin-panel button.btn-custom-import:not(aside *),
                .dark .admin-panel button.btn-custom-import {
                    background-color: rgba(16, 185, 129, 0.12) !important;
                    border: 1px solid rgba(16, 185, 129, 0.3) !important;
                    color: #34d399 !important;
                }
                .dark .admin-panel button.btn-custom-import:not(aside *):hover {
                    background-color: rgba(16, 185, 129, 0.25) !important;
                    color: #10b981 !important;
                    border-color: rgba(16, 185, 129, 0.5) !important;
                }
                .dark .admin-panel button.btn-custom-import svg {
                    color: #34d399 !important;
                    stroke: #34d399 !important;
                }
                .dark .admin-panel button.btn-custom-import:hover svg {
                    color: #10b981 !important;
                    stroke: #10b981 !important;
                }
                
                /* Light Mode Import Icon Visibility Fix */
                html:not(.dark) .admin-panel button.btn-custom-import svg {
                    color: #047857 !important;
                    stroke: #047857 !important;
                }
                
                .dark .admin-panel button.btn-custom-initialize:not(aside *),
                .dark .admin-panel button.btn-custom-initialize {
                    background-color: #B4912B !important;
                    border: 1px solid #B4912B !important;
                    color: #ffffff !important;
                }
                .dark .admin-panel button.btn-custom-initialize:not(aside *):hover {
                    background-color: #d4af37 !important;
                    border-color: #d4af37 !important;
                    color: #ffffff !important;
                }
            `}</style>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface p-2.5 rounded-2xl border border-border/40 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search sectors..."
                        className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-border bg-surface-alt text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-text placeholder-text-muted"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-2 rounded-xl bg-surface-alt border border-border text-text-muted hover:text-primary transition-all active:scale-95 flex justify-center items-center"
                            title="Refresh List"
                        >
                            <RefreshCcw className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {onDownloadTemplate && (
                        <button
                            onClick={onDownloadTemplate}
                            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-surface-alt border border-border text-foreground hover:text-primary transition-all active:scale-95 text-[10px] font-bold uppercase tracking-wider btn-custom-sample"
                            title="Download Sample Template"
                        >
                            <Download className="w-3 h-3" />
                            <span>Sample</span>
                        </button>
                    )}

                    {onBulkUpload && (
                        <div className="relative">
                            <input
                                type="file"
                                id="category-bulk-upload-integrated"
                                className="hidden"
                                accept=".xlsx, .xls, .csv"
                                onChange={onBulkUpload}
                            />
                            <button
                                onClick={() => document.getElementById('category-bulk-upload-integrated').click()}
                                disabled={importing}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 group btn-custom-import"
                            >
                                {importing ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 group-hover:scale-110 transition-transform" />}
                                <span>{importing ? 'Importing...' : 'Import'}</span>
                            </button>
                        </div>
                    )}

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-1.5 bg-primary text-primary-foreground border border-primary px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95 btn-custom-initialize"
                    >
                        <Plus className="w-3.5 h-3.5" /> Initialize Category
                    </button>
                </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((cat) => (
                    <div key={cat._id} className="bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className="p-1 rounded-xl bg-primary/5 text-primary border border-primary/10 group-hover:scale-105 transition-transform flex items-center gap-1 overflow-hidden w-11 h-11 justify-center">
                                {cat.image ? (
                                    <img
                                        src={cat.image.startsWith('http') ? cat.image : `${API_BASE_URL}${cat.image}`}
                                        alt={cat.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Tag className="w-4.5 h-4.5" />
                                )}
                            </div>
                            <div className="flex gap-0.5">
                                <button
                                    onClick={() => openEditModal(cat)}
                                    className="p-1.5 rounded-lg hover:bg-surface-alt text-text-muted hover:text-primary transition-all"
                                    title="Edit Section"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                    onClick={() => handleDelete(cat._id, cat.name)}
                                    className="p-1.5 rounded-lg hover:bg-surface-alt text-text-muted hover:text-rose-500 transition-all"
                                    title="Delete Section"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        <div
                            className="relative z-10 cursor-pointer group/content"
                            onClick={() => navigate('/admin/services/list', { state: { category: cat.name } })}
                        >
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0 w-full">
                                <h3 className="text-base font-bold text-text leading-tight uppercase tracking-tight group-hover/content:text-primary transition-colors break-words break-all min-w-0 flex-1">
                                    {cat.name}
                                </h3>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover/content:opacity-100 group-hover/content:translate-x-0.5 group-hover/content:-translate-y-0.5 transition-all text-primary shrink-0" />
                            </div>
                            <div className="flex items-center flex-wrap gap-1.5 mt-2">
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-surface-alt text-text-secondary text-[8.5px] font-black uppercase tracking-widest border border-border/50">
                                    <Layers className="w-2.5 h-2.5 text-primary" />
                                    {cat.serviceCount} Services
                                </div>
                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-widest border ${cat.gender === 'men'
                                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                    : cat.gender === 'both'
                                        ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                                        : 'bg-pink-500/10 text-pink-600 border-pink-500/20'
                                    }`}>
                                    {cat.gender === 'men' ? <User className="w-2.5 h-2.5" /> : cat.gender === 'both' ? <Users className="w-2.5 h-2.5" /> : <UserCircle className="w-2.5 h-2.5" />}
                                    {cat.gender === 'men' ? 'Men' : cat.gender === 'women' ? 'Women' : 'Unisex'}
                                </div>
                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter ml-auto italic">Currently {cat.status}</span>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-all blur-2xl" />
                    </div>
                ))}

                <button
                    onClick={openAddModal}
                    className="bg-surface-alt border border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-surface hover:border-primary/40 transition-all group group-hover:shadow-lg h-full min-h-[120px]"
                >
                    <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted group-hover:text-primary group-hover:scale-105 transition-all">
                        <Plus className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest leading-none text-center">Initialize New</p>
                        <p className="text-[9px] text-text-muted font-bold mt-1 uppercase tracking-tighter opacity-60 text-center">Group your assets</p>
                    </div>
                </button>
            </div>

            {/* Quick Add/Edit Modal */}
            {modalState.isOpen && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overscroll-contain"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-border admin-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                {modalState.type === 'add' ? <Plus className="w-6 h-6 text-text shrink-0" /> : <Edit2 className="w-6 h-6 text-text shrink-0" />}
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] italic text-slate-900 dark:text-white">
                                        {modalState.type === 'add' ? 'Add New Category' : `Edit Category: ${name}`}
                                    </h2>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 opacity-60 italic">Manage your service categories</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-all"
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* IMAGE UPLOAD SECTION */}
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Category Icon (Required)</label>
                                    <span className="text-[9px] font-bold text-primary uppercase tracking-tighter opacity-70">
                                        Max: {platformSettings?.maxImageSize || 5}{platformSettings?.maxImageSizeUnit || 'MB'}
                                    </span>
                                </div>
                                <div className="relative group/img">
                                    <input
                                        type="file"
                                        id="cat-image-input"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview ? (
                                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group-hover/img:border-primary transition-all">
                                            <img
                                                src={imagePreview.startsWith('data:') || imagePreview.startsWith('http') ? imagePreview : `${API_BASE_URL}${imagePreview}`}
                                                className="w-full h-full object-cover"
                                                alt="Preview"
                                            />
                                            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); setImage(''); setImagePreview(''); }}
                                                    className="p-3 bg-rose-500 text-white rounded-xl shadow-xl hover:scale-110 transition-all"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="cat-image-input"
                                            className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary/50 bg-slate-50 dark:bg-slate-800 cursor-pointer transition-all gap-2"
                                        >
                                            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                                                <Camera className="w-6 h-6" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] whitespace-nowrap font-black text-slate-500 uppercase tracking-[0.2em]">
                                                    Category Image
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Category Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest focus:ring-0 focus:border-primary outline-none text-slate-900 dark:text-white transition-all"
                                    placeholder="e.g. LUXURY HAIR CARE"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Demographic Target</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['men', 'women', 'both'].map((g) => (
                                        <div
                                            key={g}
                                            role="button"
                                            onClick={() => setGender(g)}
                                            className={`py-2 border text-[10px] font-bold uppercase tracking-[0.1em] transition-all flex flex-col items-center gap-1 rounded-xl cursor-pointer ${gender === g
                                                ? 'bg-primary border-primary shadow-lg shadow-primary/20 text-white'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                                }`}
                                        >
                                            {g === 'men' ? (
                                                <User className={`w-4 h-4 ${gender === g ? 'text-white' : 'text-slate-400'}`} />
                                            ) : g === 'women' ? (
                                                <UserCircle className={`w-4 h-4 ${gender === g ? 'text-white' : 'text-slate-400'}`} />
                                            ) : (
                                                <Users className={`w-4 h-4 ${gender === g ? 'text-white' : 'text-slate-400'}`} />
                                            )}
                                            <span className={`${gender === g ? 'text-white' : 'text-slate-500 dark:text-slate-300'}`}>{g === 'men' ? 'Men' : g === 'women' ? 'Women' : 'Unisex'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-slate-600 transition-all rounded-xl"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!name || !image}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all italic rounded-xl"
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                    {modalState.type === 'add' ? 'Save Category' : 'Update Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
