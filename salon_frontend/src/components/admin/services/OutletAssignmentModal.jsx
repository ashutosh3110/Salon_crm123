import React, { useState, useEffect } from 'react';
import { X, Building2, Check, Search } from 'lucide-react';

export default function OutletAssignmentModal({ isOpen, onClose, onSave, service, outlets }) {
    const [selectedOutletIds, setSelectedOutletIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (service && service !== 'bulk' && service.outletIds) {
            setSelectedOutletIds(service.outletIds);
        } else {
            setSelectedOutletIds([]);
        }
    }, [service, isOpen]);

    if (!isOpen || !service) return null;

    const toggleOutlet = (id) => {
        setSelectedOutletIds(prev =>
            prev.includes(id)
                ? prev.filter(oid => oid !== id)
                : [...prev, id]
        );
    };

    const handleSave = () => {
        onSave(service._id, { outletIds: selectedOutletIds });
        onClose();
    };

    const filteredOutlets = outlets.filter(o => 
        o.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-alt/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text leading-none">Assign Outlets</h3>
                            <p className="text-xs text-text-muted mt-1 font-bold">{service.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search outlets..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        <button
                            onClick={() => setSelectedOutletIds([])}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${selectedOutletIds.length === 0 ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface-alt border-transparent hover:border-border'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedOutletIds.length === 0 ? 'bg-primary border-primary text-white' : 'bg-surface border-border'}`}>
                                    {selectedOutletIds.length === 0 && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <span className={`text-sm font-bold ${selectedOutletIds.length === 0 ? 'text-primary' : 'text-text'}`}>All Outlets (Global)</span>
                            </div>
                        </button>

                        <div className="h-px bg-border my-2" />

                        {filteredOutlets.map(outlet => (
                            <button
                                key={outlet._id}
                                onClick={() => toggleOutlet(outlet._id)}
                                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${selectedOutletIds.includes(outlet._id) ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface-alt border-transparent hover:border-border'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedOutletIds.includes(outlet._id) ? 'bg-primary border-primary text-white' : 'bg-surface border-border'}`}>
                                        {selectedOutletIds.includes(outlet._id) && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                    <span className={`text-sm font-bold ${selectedOutletIds.includes(outlet._id) ? 'text-primary' : 'text-text'}`}>{outlet.name}</span>
                                </div>
                                <span className="text-[10px] font-bold text-text-muted bg-surface px-2 py-0.5 rounded-full border border-border">{outlet.location?.city || 'Default'}</span>
                            </button>
                        ))}
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
                        className="flex-[2] px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
