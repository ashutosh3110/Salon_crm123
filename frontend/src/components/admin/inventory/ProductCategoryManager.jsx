import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    LayoutGrid,
    Plus,
    Search,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Sparkles,
    CheckCircle2,
    XCircle,
    CloudUpload,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInventory } from '../../../contexts/InventoryContext';
import { useBusiness } from '../../../contexts/BusinessContext';
import api from '../../../services/api';

export default function ProductCategoryManager() {
    const { productCategories, addProductCategory, updateProductCategory, deleteProductCategory, products } = useInventory();
    const { platformSettings } = useBusiness();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', image: '', status: 'active' });

    useEffect(() => {
        document.body.style.overflow = isAdding ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAdding]);

    const filteredCategories = productCategories.filter(c => 
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getProductCount = (catName) => {
        return products.filter((p) => String(p.category) === String(catName)).length;
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) return;

        // Duplicate name check (case-insensitive)
        const isDuplicate = productCategories.some(cat => 
            cat.name.toLowerCase().trim() === formData.name.toLowerCase().trim() && 
            cat._id !== editingId
        );

        if (isDuplicate) {
            alert(`A category with the name "${formData.name.trim()}" already exists. Please use a unique name.`);
            return;
        }

        try {
            if (editingId) {
                await updateProductCategory(editingId, formData);
                setEditingId(null);
            } else {
                await addProductCategory(formData);
            }
            setIsAdding(false);
            setFormData({ name: '', image: '', status: 'active' });
        } catch (error) {
            console.error('Failed to save category:', error);
        }
    };
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = platformSettings?.maxImageSize || 5;
        const unit = platformSettings?.maxImageSizeUnit || 'MB';
        const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
        const threshold = maxSize * multiplier;

        if (file.size > threshold) {
            alert(`Image too large. Max ${maxSize}${unit} allowed.`);
            return;
        }

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const res = await api.post('/uploads', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setFormData({ ...formData, image: res.data.url });
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const handleEdit = (cat) => {
        setFormData({ 
            name: cat.name, 
            image: cat.image || '', 
            status: cat.status || 'active' 
        });
        setEditingId(cat._id);
        setIsAdding(true);
    };

    const toggleStatus = async (cat) => {
        const newStatus = cat.status === 'active' ? 'inactive' : 'active';
        await updateProductCategory(cat._id, { status: newStatus });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-mono">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 border border-border">
                <div>
                    <h2 className="text-xl font-black text-text uppercase tracking-tighter italic">Product Classification</h2>
                    <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-widest italic">Inventory :: Master Category Registry</p>
                </div>
                <button
                    onClick={() => {
                        setIsAdding(true);
                        setEditingId(null);
                        setFormData({ name: '', image: '', status: 'active' });
                    }}
                    className="flex items-center gap-2 bg-text text-background px-6 py-2.5 text-[10px] font-black hover:bg-primary hover:text-white transition-all uppercase tracking-widest shadow-lg"
                >
                    <Plus className="w-4 h-4" /> Define New Category
                </button>
            </div>

            {/* Full-width list Area */}
            <div className="space-y-4">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="SEARCH BY VECTOR NAME..."
                        className="w-full pl-14 pr-6 py-5 bg-surface border border-border text-[11px] font-black focus:border-primary outline-none transition-all uppercase tracking-widest shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="bg-surface border border-border shadow-xl overflow-hidden rounded-[32px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-alt/50 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Metadata Vector</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Active Load</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Status Protocol</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCategories.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <LayoutGrid className="w-12 h-12" />
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] italic">No Data Points Found :: System Clear</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {filteredCategories.map(cat => (
                                <tr key={cat._id} className="hover:bg-primary/[0.02] transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl border border-border bg-background flex items-center justify-center overflow-hidden group-hover:border-primary transition-all shadow-sm">
                                                {cat.image ? (
                                                    <img src={cat.image} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 text-text-muted opacity-30" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors leading-none mb-1.5">{cat.name}</p>
                                                <p className="text-[9px] text-text-muted font-bold tracking-widest">REG_ID: {cat._id?.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[12px] font-black text-text uppercase font-mono italic">
                                                {getProductCount(cat.name)} UNITS
                                            </span>
                                            <div className="w-24 h-1 bg-surface-alt rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary" 
                                                    style={{ width: `${Math.min(100, (getProductCount(cat.name) / 20) * 100)}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button 
                                            onClick={() => toggleStatus(cat)}
                                            className={`flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest border rounded-xl transition-all ${
                                                cat.status === 'active' 
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20' 
                                                : 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${cat.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                            {cat.status || 'Active'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="p-3 rounded-xl border border-border bg-surface text-text-muted hover:bg-text hover:text-background hover:border-text transition-all"
                                                title="Edit Metadata"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('IRREVERSIBLE ACTION: Delete classification?')) {
                                                        deleteProductCategory(cat._id);
                                                    }
                                                }}
                                                className="p-3 rounded-xl border border-border bg-surface text-text-muted hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                                                title="Purge Entry"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Category Modal */}
            {createPortal(
                <AnimatePresence>
                    {isAdding && (
                        <div 
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print overflow-y-auto"
                            onClick={() => setIsAdding(false)}
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-3xl overflow-hidden relative text-left"
                            >
                                {/* Modal Header */}
                                <div className="bg-slate-900 text-white p-5 flex items-center justify-between rounded-t-3xl">
                                    <div>
                                        <h3 className="text-base font-black uppercase italic tracking-tight leading-none flex items-center gap-2">
                                            <LayoutGrid className="w-5 h-5 text-primary" />
                                            {editingId ? 'Modify Concept' : 'Define Concept'}
                                        </h3>
                                        <p className="text-[7px] font-bold uppercase tracking-[0.3em] opacity-60 mt-1">Inventory :: Vector Initialization</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-5 space-y-5">
                                    {/* Name Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Label Designation <span className="text-primary">*</span></label>
                                        <input
                                            type="text"
                                            autoFocus
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-black text-slate-900 dark:text-slate-100 focus:border-primary outline-none uppercase placeholder:opacity-20 shadow-inner"
                                            placeholder="e.g. ORGANIC_SERUM"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    {/* Image Upload Area */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual Reference</label>
                                            <span className="text-[7px] font-black text-primary uppercase tracking-widest opacity-60">
                                                MAX: {platformSettings?.maxImageSize || 5}{platformSettings?.maxImageSizeUnit || 'MB'}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-4 items-start">
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg text-[9px] font-black text-slate-900 dark:text-slate-100 focus:border-primary outline-none"
                                                        placeholder="SOURCE_URL"
                                                        value={formData.image || ''}
                                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                    />
                                                    <label className="p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center rounded-lg">
                                                        <CloudUpload className="w-3.5 h-3.5 text-slate-500" />
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                                    </label>
                                                </div>
                                                
                                                <div className="aspect-video w-full border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-750 relative shadow-inner group/preview">
                                                    {formData.image ? (
                                                        <>
                                                            <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button 
                                                                    onClick={() => setFormData({ ...formData, image: '' })}
                                                                    className="p-2 bg-rose-500 rounded-full text-white shadow-xl hover:scale-110 transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 opacity-20">
                                                            <ImageIcon size={24} />
                                                            <p className="text-[8px] font-black uppercase italic tracking-widest">Awaiting Signal</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Protocol */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Operational Status</label>
                                        <div className="flex gap-2 p-0.5 bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl">
                                            {['active', 'inactive'].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, status: s })}
                                                    className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                                        formData.status === s 
                                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-md' 
                                                        : 'bg-transparent text-slate-450 dark:text-slate-400 hover:text-slate-600'
                                                    }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Footers */}
                                    <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => setIsAdding(false)}
                                            className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-750 transition-all"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={!formData.name?.trim()}
                                            className="flex-[1.5] py-3 px-4 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            {editingId ? 'Update' : 'Initialize'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
