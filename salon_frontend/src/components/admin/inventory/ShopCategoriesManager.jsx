import React, { useState } from 'react';
import { 
    LayoutGrid, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Image as ImageIcon,
    ExternalLink,
    ChevronRight,
    Sparkles,
    ShoppingBag,
    Upload
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInventory } from '../../../contexts/InventoryContext';

export default function ShopCategoriesManager() {
    const { shopCategories, addShopCategory, updateShopCategory, deleteShopCategory, products } = useInventory();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', image: '' });

    const filteredCategories = shopCategories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getProductCount = (catId) => {
        return products.filter(p => p.appCategory === catId).length;
    };

    const handleSave = () => {
        if (!formData.name) return;
        if (editingId) {
            updateShopCategory(editingId, formData);
            setEditingId(null);
        } else {
            addShopCategory(formData);
            setIsAdding(false);
        }
        setFormData({ name: '', image: '' });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (cat) => {
        setFormData({ name: cat.name, image: cat.image });
        setEditingId(cat.id);
        setIsAdding(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Live Modules</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter mb-1">{shopCategories.length}</h3>
                    <p className="text-[10px] uppercase font-bold opacity-80">App Shop Categories</p>
                </div>

                <div className="bg-surface p-6 rounded-[32px] border border-border shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-text tracking-tighter">{products.filter(p => p.isShopProduct).length}</h4>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Shop Products</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        setIsAdding(true);
                        setEditingId(null);
                        setFormData({ name: '', image: '' });
                    }}
                    className="bg-surface p-6 rounded-[32px] border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all group flex flex-col items-center justify-center gap-2"
                >
                    <Plus className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Add New Category</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List Section */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-surface rounded-[40px] border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border flex items-center justify-between bg-surface-alt/30">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    type="text" 
                                    placeholder="Search categories..."
                                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-surface border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-alt/50 border-b border-border">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Linked Products</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredCategories.map(cat => (
                                        <tr key={cat.id} className="hover:bg-surface-alt/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-border transition-transform group-hover:scale-105">
                                                        <img src={cat.image} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-text uppercase tracking-tight">{cat.name}</p>
                                                        <p className="text-[9px] font-bold text-text-muted tracking-widest">ID: {cat.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black">
                                                        {getProductCount(cat.id)}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-text-muted uppercase">Associations</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleEdit(cat)}
                                                        className="p-2 rounded-xl bg-surface hover:bg-primary/10 text-text-muted hover:text-primary transition-all border border-border"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteShopCategory(cat.id)}
                                                        className="p-2 rounded-xl bg-surface hover:bg-rose-50 text-text-muted hover:text-rose-500 transition-all border border-border"
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
                </div>

                {/* Form Section */}
                <div className="lg:col-span-4">
                    <AnimatePresence mode="wait">
                        {isAdding ? (
                            <motion.div 
                                key="form" 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-surface p-8 rounded-[40px] border border-border shadow-xl space-y-6 sticky top-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-black tracking-tight">{editingId ? 'Edit Category' : 'New Category'}</h3>
                                    </div>
                                    <button onClick={() => setIsAdding(false)} className="p-2 rounded-full hover:bg-surface-alt text-text-muted">
                                        <Plus className="w-5 h-5 rotate-45" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Category Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-5 py-3 rounded-2xl bg-surface-alt border border-border text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="e.g. Premium Skincare"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Banner Image</label>
                                        <div className="flex gap-3">
                                            <div className="flex-1 relative">
                                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                                <input 
                                                    type="text" 
                                                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-alt border border-border text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    placeholder="URL or Upload..."
                                                    value={formData.image || ''}
                                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                />
                                            </div>
                                            <label className="p-3 bg-surface-alt border border-border rounded-2xl hover:bg-surface transition-all text-primary cursor-pointer flex items-center justify-center">
                                                <Upload className="w-4 h-4" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                            </label>
                                        </div>
                                    </div>

                                    {formData.image && (
                                        <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-border shadow-sm bg-surface-alt animate-in zoom-in-95 duration-300">
                                            <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}

                                    <div className="pt-4 flex gap-4">
                                        <button 
                                            onClick={() => setIsAdding(false)}
                                            className="flex-1 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSave}
                                            className="flex-[2] py-4 bg-primary text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-2px] transition-all active:scale-95"
                                        >
                                            {editingId ? 'Update Module' : 'Sync to App'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="select" 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-surface-alt/30 p-12 rounded-[40px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]"
                            >
                                <div className="w-20 h-20 rounded-[32px] bg-white flex items-center justify-center shadow-xl border border-border">
                                    <Sparkles className="w-10 h-10 text-primary opacity-20" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-text italic">Dynamic App Modules</h4>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1 max-w-[200px] mx-auto">
                                        Select a category to modify or create a new luxury segment
                                    </p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsAdding(true);
                                        setEditingId(null);
                                        setFormData({ name: '', image: '' });
                                    }}
                                    className="flex items-center gap-2 group px-6 py-2.5 rounded-full bg-white border border-border shadow-sm hover:shadow-md transition-all mt-4"
                                >
                                    <Plus className="w-4 h-4 text-primary" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Add First segment</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
