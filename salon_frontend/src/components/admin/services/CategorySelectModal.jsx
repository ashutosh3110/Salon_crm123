import React, { useState, useEffect } from 'react';
import { X, Tag, Check, Plus } from 'lucide-react';

export default function CategorySelectModal({ isOpen, onClose, onSave, service, categories }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(service?.category || '');

    useEffect(() => {
        if (service && service !== 'bulk') {
            setSelectedCategory(service.category || '');
        } else {
            setSelectedCategory('');
        }
    }, [service, isOpen]);

    if (!isOpen || !service) return null;

    const filteredCategories = categories.filter(c => 
        c.toLowerCase() !== 'all' && 
        c.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = () => {
        if (selectedCategory) {
            onSave(service._id, { category: selectedCategory });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-sm rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-alt/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text leading-none">Select Category</h3>
                            <p className="text-xs text-text-muted mt-1 font-bold truncate max-w-[180px]">{service.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="max-h-[250px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                        {filteredCategories.length === 0 ? (
                            <p className="p-4 text-center text-xs font-bold text-text-muted italic">No categories found</p>
                        ) : (
                            filteredCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${selectedCategory === cat ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface border-transparent hover:border-border hover:bg-surface-alt'}`}
                                >
                                    <span className={`text-sm font-bold ${selectedCategory === cat ? 'text-primary' : 'text-text'}`}>{cat}</span>
                                    {selectedCategory === cat && <Check className="w-4 h-4 text-primary" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-6 bg-surface-alt/50 border-t border-border flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-surface transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedCategory}
                        className="flex-[1.5] px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Apply Category
                    </button>
                </div>
            </div>
        </div>
    );
}
