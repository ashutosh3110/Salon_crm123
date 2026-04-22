import React, { useState } from 'react';
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
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../services/api';
import { useBusiness } from '../../../contexts/BusinessContext';

export default function ServiceCategories({ categories = [], onAdd, onUpdate, onDelete, onToggleStatus }) {
    const navigate = useNavigate();
    const { platformSettings } = useBusiness();
    const [searchTerm, setSearchTerm] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, type: 'add', data: null });
    
    // Form States
    const [name, setName] = useState('');
    const [gender, setGender] = useState('women');
    const [image, setImage] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search sectors..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-text placeholder-text-muted"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={openAddModal}
                    className="flex items-center gap-3 bg-primary text-primary-foreground border border-primary px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                    <Plus className="w-4 h-4" /> Initialize Category
                </button>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((cat) => (
                    <div key={cat._id} className="bg-surface p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/10 group-hover:scale-110 transition-transform flex items-center gap-2 overflow-hidden w-16 h-16 justify-center">
                                {cat.image ? (
                                    <img 
                                        src={cat.image.startsWith('http') ? cat.image : `${API_BASE_URL}${cat.image}`} 
                                        alt={cat.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <Tag className="w-6 h-6" />
                                )}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openEditModal(cat)}
                                    className="p-2 rounded-xl hover:bg-surface-alt text-text-muted hover:text-primary transition-all"
                                    title="Edit Section"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => handleDelete(cat._id, cat.name)}
                                    className="p-2 rounded-xl hover:bg-surface-alt text-text-muted hover:text-rose-500 transition-all"
                                    title="Delete Section"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div 
                            className="relative z-10 cursor-pointer group/content"
                            onClick={() => navigate('/admin/services/list', { state: { category: cat.name } })}
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-text leading-tight uppercase tracking-tight group-hover/content:text-primary transition-colors">{cat.name}</h3>
                                <span className={`w-2 h-2 rounded-full ${cat.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover/content:opacity-100 group-hover/content:translate-x-1 group-hover/content:-translate-y-1 transition-all text-primary" />
                            </div>
                            <div className="flex items-center flex-wrap gap-2 mt-2">
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-alt text-text-secondary text-[9px] font-black uppercase tracking-widest border border-border/50">
                                    <Layers className="w-3 h-3 text-primary" />
                                    {cat.serviceCount} Services
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                    cat.gender === 'men' 
                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                                        : cat.gender === 'both'
                                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                            : 'bg-pink-500/10 text-pink-500 border-pink-500/20'
                                }`}>
                                    {cat.gender === 'men' ? <User className="w-3 h-3" /> : cat.gender === 'both' ? <Users className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
                                    {cat.gender}
                                </div>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter ml-auto italic">Currently {cat.status}</span>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-all blur-2xl" />
                    </div>
                ))}

                <button
                    onClick={openAddModal}
                    className="bg-surface-alt border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-surface hover:border-primary/40 transition-all group group-hover:shadow-lg h-full min-h-[160px]"
                >
                    <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted group-hover:text-primary group-hover:scale-110 transition-all">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest leading-none">Initialize New</p>
                        <p className="text-[10px] text-text-muted font-bold mt-1.5 uppercase tracking-tighter opacity-60">Group your assets</p>
                    </div>
                </button>
            </div>

            {/* Quick Add/Edit Modal */}
            {modalState.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={closeModal} />
                    <div className="bg-surface rounded-none p-8 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                                {modalState.type === 'add' ? <Plus className="w-5 h-5 text-primary" /> : <Edit2 className="w-5 h-5 text-primary" />}
                            </div>
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] italic text-text">
                                    {modalState.type === 'add' ? 'Add New Category' : `Edit Category: ${name}`}
                                </h2>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted opacity-60 italic">Manage your service categories</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* IMAGE UPLOAD SECTION */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none">Category Icon (Required)</label>
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
                                        <div className="relative w-full aspect-video rounded-none overflow-hidden border border-border group-hover/img:border-primary transition-all">
                                            <img 
                                                src={imagePreview.startsWith('data:') || imagePreview.startsWith('http') ? imagePreview : `${API_BASE_URL}${imagePreview}`} 
                                                className="w-full h-full object-cover" 
                                                alt="Preview" 
                                            />
                                            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); setImage(''); setImagePreview(''); }}
                                                    className="p-3 bg-rose-500 text-white rounded-full shadow-xl hover:scale-110 transition-all"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="cat-image-input"
                                            className="flex flex-col items-center justify-center w-full aspect-video rounded-none border-2 border-dashed border-border hover:border-primary/50 bg-surface-alt cursor-pointer transition-all gap-4"
                                        >
                                            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary">
                                                <Camera className="w-6 h-6" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] whitespace-nowrap font-black text-text-muted uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                                                    Category Image
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none">Category Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full px-4 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:ring-0 focus:border-primary outline-none text-text transition-all"
                                    placeholder="e.g. LUXURY HAIR CARE"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none">Demographic Target</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['men', 'women', 'both'].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setGender(g)}
                                            className={`py-4 border text-[9px] font-black uppercase tracking-[0.1em] transition-all flex flex-col items-center gap-2 ${gender === g
                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                    : 'bg-surface-alt text-text-muted border-border hover:border-primary/50'
                                                }`}
                                        >
                                            {g === 'men' ? <User className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 py-4 bg-surface-alt border border-border text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:bg-border transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!name || !image}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-text text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all italic"
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                    {modalState.type === 'add' ? 'Save Category' : 'Update Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
