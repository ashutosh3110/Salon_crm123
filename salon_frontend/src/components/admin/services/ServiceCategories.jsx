import React, { useState } from 'react';
/* v1.0.2 - Fresh Icon Registry */
import {
    Plus,
    Search,
    Tag,
    Layers,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle2,
    Users,
    User,
    UserCircle
} from 'lucide-react';

export default function ServiceCategories({ categories = [], onAdd, onUpdate, onDelete, onToggleStatus }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, type: 'add', data: null });
    const [name, setName] = useState('');
    const [gender, setGender] = useState('women');

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openAddModal = () => {
        setModalState({ isOpen: true, type: 'add', data: null });
        setName('');
        setGender('women');
    };

    const openEditModal = (cat) => {
        setModalState({ isOpen: true, type: 'edit', data: cat });
        setName(cat.name);
        setGender(cat.gender);
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        if (modalState.type === 'add') {
            onAdd?.({ name, gender });
        } else {
            onUpdate?.(modalState.data.id, { name, gender });
        }
        setModalState({ isOpen: false, type: 'add', data: null });
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete the category "${name}"? This will affect service grouping.`)) {
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
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-text placeholder-text-muted"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={openAddModal}
                    className="flex items-center gap-3 bg-primary text-primary-foreground border border-primary px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((cat) => (
                    <div key={cat.id} className="bg-surface p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/10 group-hover:scale-110 transition-transform flex items-center gap-2">
                                <Tag className="w-6 h-6" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">System Tag</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openEditModal(cat)}
                                    className="p-2 rounded-xl hover:bg-surface-alt text-text-muted hover:text-primary transition-all"
                                    title="Edit Category"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onToggleStatus?.(cat.id)}
                                    className={`p-2 rounded-xl hover:bg-surface-alt transition-all ${cat.status === 'active' ? 'text-emerald-500 hover:text-emerald-400' : 'text-text-muted hover:text-rose-500'}`}
                                    title={cat.status === 'active' ? "Deactivate" : "Activate"}
                                >
                                    {cat.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id, cat.name)}
                                    className="p-2 rounded-xl hover:bg-surface-alt text-text-muted hover:text-rose-500 transition-all"
                                    title="Delete Category"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-text leading-tight uppercase tracking-tight">{cat.name}</h3>
                                <span className={`w-2 h-2 rounded-full ${cat.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                            </div>
                            <div className="flex items-center flex-wrap gap-2 mt-2">
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-alt text-text-secondary text-[9px] font-black uppercase tracking-widest border border-border/50">
                                    <Layers className="w-3 h-3 text-primary" />
                                    {cat.serviceCount} Services
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${cat.gender === 'men' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-pink-500/10 text-pink-500 border-pink-500/20'}`}>
                                    {cat.gender === 'men' ? <User className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
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
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest leading-none">Create New</p>
                        <p className="text-[10px] text-text-muted font-bold mt-1.5 uppercase tracking-tighter opacity-60">Group your services</p>
                    </div>
                </button>
            </div>

            {/* Quick Add/Edit Modal */}
            {modalState.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setModalState({ ...modalState, isOpen: false })} />
                    <div className="bg-surface rounded-none p-8 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                                {modalState.type === 'add' ? <Plus className="w-5 h-5 text-primary" /> : <Edit2 className="w-5 h-5 text-primary" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text uppercase tracking-tight leading-none">
                                    {modalState.type === 'add' ? 'Category Protocol' : 'Update Sector'}
                                </h3>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">
                                    {modalState.type === 'add' ? 'Define :: new_service_group' : `Modifying :: ${modalState.data?.name}`}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none">Name Designation</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full px-4 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:ring-0 focus:border-primary outline-none text-text transition-all"
                                    placeholder="e.g. ADVANCED SKIN REPAIR"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none">Target Demographic</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['men', 'women'].map((g) => (
                                        <button
                                            key={g}
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
                                    onClick={() => setModalState({ ...modalState, isOpen: false })}
                                    className="flex-1 py-4 bg-surface-alt border border-border text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:bg-border transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
                                >
                                    {modalState.type === 'add' ? 'Initialize' : 'Apply Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
