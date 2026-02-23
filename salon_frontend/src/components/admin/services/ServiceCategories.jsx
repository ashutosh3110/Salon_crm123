import React, { useState } from 'react';
import {
    Plus,
    Search,
    Tag,
    Layers,
    MoreVertical,
    Edit2,
    Trash2,
    EyeOff,
    CheckCircle2
} from 'lucide-react';

export default function ServiceCategories({ categories = [], onAdd, onDelete, onToggleStatus }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCatName, setNewCatName] = useState('');

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        if (!newCatName.trim()) return;
        onAdd?.(newCatName);
        setNewCatName('');
        setIsAddModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all scale-active"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((cat) => (
                    <div key={cat.id} className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div className="flex gap-1">
                                <button className="p-2 rounded-xl hover:bg-slate-50 text-text-muted hover:text-primary transition-all">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onToggleStatus?.(cat.id)}
                                    className="p-2 rounded-xl hover:bg-slate-50 text-text-muted hover:text-rose-500 transition-all"
                                >
                                    <EyeOff className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete?.(cat.id)}
                                    className="p-2 rounded-xl hover:bg-slate-50 text-text-muted hover:text-text transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-text leading-tight">{cat.name}</h3>
                                <span className={`w-2 h-2 rounded-full ${cat.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 text-text-secondary text-[10px] font-bold uppercase tracking-widest border border-border/50">
                                    <Layers className="w-2.5 h-2.5" />
                                    {cat.serviceCount} Services
                                </div>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Currently {cat.status}</span>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-all blur-2xl" />
                    </div>
                ))}

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-slate-50 border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-primary/40 transition-all group group-hover:shadow-lg h-full min-h-[160px]"
                >
                    <div className="w-12 h-12 rounded-full bg-white border border-border flex items-center justify-center text-text-muted group-hover:text-primary group-hover:scale-110 transition-all">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest leading-none">Create New</p>
                        <p className="text-[10px] text-text-muted font-bold mt-1.5">Group your services</p>
                    </div>
                </button>
            </div>

            {/* Quick Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-text mb-4">Add New Category</h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Category Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="e.g. Skin Care"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-text-secondary hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                                >
                                    Add Category
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
