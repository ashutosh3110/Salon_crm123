import React, { useState } from 'react';
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

    const filteredCategories = productCategories.filter(c => 
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getProductCount = (catName) => {
        return products.filter((p) => String(p.category) === String(catName)).length;
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) return;
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

            {/* List and Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Scrollable list */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input 
                            type="text" 
                            placeholder="SEARCH BY VECTOR NAME..."
                            className="w-full pl-11 pr-4 py-4 bg-surface border border-border text-[10px] font-black focus:border-primary outline-none transition-all uppercase tracking-widest"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="bg-surface border border-border overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-alt/50 border-b border-border">
                                    <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Metadata</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Load</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredCategories.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-[10px] font-black text-text-muted uppercase tracking-widest italic">
                                            No Data Points Found :: System Clear
                                        </td>
                                    </tr>
                                )}
                                {filteredCategories.map(cat => (
                                    <tr key={cat._id} className="hover:bg-surface-alt/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 border border-border bg-background flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                                                    {cat.image ? (
                                                        <img src={cat.image} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <ImageIcon className="w-4 h-4 text-text-muted" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-text uppercase tracking-tight">{cat.name}</p>
                                                    <p className="text-[8px] text-text-muted mt-0.5">ID_REF: {cat._id?.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-text uppercase">
                                                {getProductCount(cat.name)} <span className="text-text-muted text-[8px]">Units</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => toggleStatus(cat)}
                                                className={`flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase tracking-widest border transition-all ${
                                                    cat.status === 'active' 
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                                }`}
                                            >
                                                {cat.status === 'active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                {cat.status || 'Active'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(cat)}
                                                    className="p-2 border border-border bg-surface hover:bg-text hover:text-background transition-all"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('IRREVERSIBLE ACTION: Delete classification?')) {
                                                            deleteProductCategory(cat._id);
                                                        }
                                                    }}
                                                    className="p-2 border border-border bg-surface hover:bg-rose-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Integration Form */}
                <div className="lg:col-span-4">
                    <AnimatePresence mode="wait">
                        {isAdding ? (
                            <motion.div 
                                key="form" 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-surface p-6 border border-border shadow-2xl space-y-6 sticky top-6"
                            >
                                <div className="flex items-center justify-between border-b border-border pb-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        <h3 className="text-xs font-black uppercase tracking-widest">
                                            {editingId ? 'Modify Concept' : 'Define Concept'}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="text-text-muted hover:text-text transition-colors"
                                    >
                                        <Plus className="w-5 h-5 rotate-45" />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Label Designation</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-background border border-border text-[11px] font-black focus:border-primary outline-none transition-all uppercase"
                                            placeholder="e.g. ORGANIC_SERUM"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Visual Reference</label>
                                        <span className="text-[8px] font-black text-primary uppercase tracking-widest opacity-60">
                                            MAX: {platformSettings?.maxImageSize || 5}{platformSettings?.maxImageSizeUnit || 'MB'}
                                        </span>
                                    </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-3 bg-background border border-border text-[10px] font-black focus:border-primary outline-none transition-all"
                                                placeholder="SOURCE_URL"
                                                value={formData.image || ''}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            />
                                            <label className="p-3 border border-border bg-surface-alt hover:bg-text hover:text-background transition-all cursor-pointer flex items-center justify-center">
                                                <CloudUpload className="w-4 h-4" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Operational Status</label>
                                        <div className="flex gap-2">
                                            {['active', 'inactive'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setFormData({ ...formData, status: s })}
                                                    className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest border transition-all ${
                                                        formData.status === s 
                                                        ? 'bg-text text-background border-text' 
                                                        : 'bg-transparent text-text-muted border-border hover:border-text-muted'
                                                    }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {formData.image && (
                                        <div className="aspect-square border border-border grayscale hover:grayscale-0 transition-all overflow-hidden bg-background">
                                            <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsAdding(false)}
                                            className="flex-1 py-3 border border-border text-[9px] font-black uppercase tracking-widest hover:bg-surface-alt"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            className="flex-[2] py-3 bg-text text-background text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                                        >
                                            {editingId ? 'Commit Update' : 'Initialize Data'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-surface-alt/30 p-10 border-2 border-dashed border-border flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                                <LayoutGrid className="w-10 h-10 text-text/10" />
                                <div>
                                    <h4 className="text-[11px] font-black text-text uppercase tracking-widest">Awaiting Registry Input</h4>
                                    <p className="text-[8px] text-text-muted mt-2 max-w-[200px] mx-auto uppercase leading-loose font-black italic">
                                        Select a designated vector for modification or initiate a new classification entry.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAdding(true);
                                        setEditingId(null);
                                        setFormData({ name: '', image: '', status: 'active' });
                                    }}
                                    className="px-6 py-2 border border-text text-[9px] font-black uppercase tracking-widest hover:bg-text hover:text-background transition-all"
                                >
                                    New Entry
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
