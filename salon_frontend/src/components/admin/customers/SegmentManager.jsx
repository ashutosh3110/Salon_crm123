import React, { useEffect, useState } from 'react';
import {
    Tag,
    Users,
    ArrowRight,
    Plus,
    Filter,
    MoreVertical,
    Zap,
    Crown,
    Trash2,
    UserMinus,
    TrendingUp,
    X,
    Download
} from 'lucide-react';

import { useBusiness } from '../../../contexts/BusinessContext';

const iconMap = {
    Crown: Crown,
    Zap: Zap,
    UserMinus: UserMinus,
    TrendingUp: TrendingUp
};

export default function SegmentManager() {
    const { segments, deleteSegment, fetchSegmentCustomers, addSegment } = useBusiness();
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewingSegmentCustomers, setViewingSegmentCustomers] = useState(null);
    const [segmentCustomers, setSegmentCustomers] = useState([]);
    const [segmentCustomersLoading, setSegmentCustomersLoading] = useState(false);
    const [newSegment, setNewSegment] = useState({
        name: '',
        rule: '',
        iconName: 'Zap',
        color: 'bg-blue-50 text-blue-600 border-blue-100'
    });

    const handleAddSegment = (e) => {
        e.preventDefault();
        addSegment(newSegment);
        setShowAddModal(false);
        setNewSegment({
            name: '',
            rule: '',
            iconName: 'Zap',
            color: 'bg-blue-50 text-blue-600 border-blue-100'
        });
    };

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!viewingSegmentCustomers?.id) {
                setSegmentCustomers([]);
                setSegmentCustomersLoading(false);
                return;
            }
            setSegmentCustomersLoading(true);
            try {
                const list = await fetchSegmentCustomers(viewingSegmentCustomers.id, { limit: 1000 });
                if (!cancelled) setSegmentCustomers(list);
            } catch {
                if (!cancelled) setSegmentCustomers([]);
            } finally {
                if (!cancelled) setSegmentCustomersLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [viewingSegmentCustomers, fetchSegmentCustomers]);

    return (
        <div className="p-6 space-y-6 slide-right animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                        <h3 className="text-xl font-bold text-text tracking-tight">Customer Segments</h3>
                        <p className="text-sm text-text-secondary font-medium">
                            Customers ko unki activity ke hisaab se smart tareeke se group karein.
                        </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" />
                        Create Segment
                </button>
            </div>

            {/* Segment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {segments.map((segment) => {
                    const Icon = iconMap[segment.iconName] || Tag;
                    return (
                        <div
                            key={segment.id}
                            className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${segment.color} group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <button
                                    onClick={() => deleteSegment(segment.id)}
                                    className="p-2 hover:bg-slate-50 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold text-text mb-1">{segment.name}</h4>
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="w-3.5 h-3.5 text-text-muted" />
                                    <span className="text-sm font-semibold text-primary">{segment.count ?? 0} Customers</span>
                                </div>

                                <div className="bg-surface rounded-xl p-4 border border-border">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Filter className="w-3 h-3 text-text-muted" />
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Segment Rules</span>
                                    </div>
                                    <p className="text-xs text-text-secondary font-medium line-clamp-1">{segment.rule}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setViewingSegmentCustomers(segment)}
                                className="mt-6 w-full flex items-center justify-between bg-surface hover:bg-primary px-4 py-2.5 rounded-xl transition-all group/btn"
                            >
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest group-hover/btn:text-white">See customers</span>
                                <ArrowRight className="w-4 h-4 text-text-muted group-hover/btn:text-white transition-colors" />
                            </button>
                        </div>
                    );
                })}

                {/* Empty State / Add Card */}
                <div
                    onClick={() => setShowAddModal(true)}
                    className="bg-surface/50 border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:bg-white hover:border-primary/30 transition-all"
                >
                    <div className="p-3 rounded-full bg-white text-text-muted shadow-sm border border-border">
                        <Tag className="w-6 h-6" />
                    </div>
                    <div>
                        <h5 className="text-sm font-bold text-text-secondary">New customer segment</h5>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">Apni marzi ka group banayein</p>
                    </div>
                </div>
            </div>

            {/* Customers List Modal */}
            {viewingSegmentCustomers && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-start justify-center p-4 pt-10 overflow-y-auto no-scrollbar">
                    <div className="bg-white rounded-none w-full max-w-2xl p-10 shadow-2xl relative animate-in slide-in-from-top-4 duration-300 flex flex-col my-8">
                        <button
                            onClick={() => setViewingSegmentCustomers(null)}
                            className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5 text-text-muted" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-3xl font-extrabold text-text uppercase tracking-tight mb-2">{viewingSegmentCustomers.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 bg-primary/5 text-primary text-[10px] font-extrabold uppercase tracking-[0.2em] border border-primary/10`}>
                                    {viewingSegmentCustomers.rule}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {segmentCustomersLoading ? (
                                <div className="text-center py-10 opacity-60">Loading customers...</div>
                            ) : segmentCustomers.length > 0 ? (
                                segmentCustomers.map((cust) => (
                                    <div key={cust._id} className="flex items-center justify-between p-6 bg-white border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-surface border border-border flex items-center justify-center font-black text-primary text-base shadow-inner">
                                                {cust.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-text text-sm uppercase tracking-tight mb-0.5">{cust.name}</h4>
                                                <p className="text-[11px] text-text-muted font-bold tracking-widest">{cust.phone}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-text mb-0.5">₹{(cust.spend ?? 0).toLocaleString()}</div>
                                            <div className="text-[9px] font-extrabold text-primary uppercase tracking-[0.2em]">{cust.totalVisits ?? 0} visits</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 opacity-40">
                                    <Users className="w-16 h-16 mx-auto mb-4 stroke-[1px]" />
                                    <p className="text-xs font-extrabold uppercase tracking-[0.3em]">No customers in this segment</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-border grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    const data = segmentCustomers.map(c => `${c.name},${c.phone},${c.spend}`).join('\n');
                                    const blob = new Blob([`Name,Phone,Spend\n${data}`], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${viewingSegmentCustomers.name.replace(/\s+/g, '_')}_list.csv`;
                                    a.click();
                                }}
                                className="py-4 border border-border bg-white text-text-muted font-black text-[11px] uppercase tracking-[0.2em] hover:bg-surface transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <Download className="w-4 h-4" />
                                Download List
                            </button>
                            <button
                                onClick={() => alert('Send message to this segment...')}
                                className="py-4 bg-text text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-text/20 hover:bg-primary transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <Zap className="w-4 h-4" />
                                Message This Segment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Segment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-start justify-center p-4 pt-20">
                    <div className="bg-white rounded-none w-full max-w-md p-10 shadow-2xl relative animate-in slide-in-from-top-4 duration-300">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute right-6 top-6 p-2 hover:bg-slate-100 transition-all"
                        >
                            <X className="w-5 h-5 text-text-muted" />
                        </button>

                        <div className="mb-10 text-center">
                            <h3 className="text-2xl font-black text-text uppercase tracking-tight mb-2">Create Segment</h3>
                            <p className="text-[10px] text-text-secondary font-extrabold uppercase tracking-[0.2em] opacity-60">
                                Apni criteria set karke group banayein
                            </p>
                        </div>

                        <form onSubmit={handleAddSegment} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Segment Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. High Value Customers"
                                    value={newSegment.name}
                                    onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value.replace(/[^a-zA-Z\\s]/g, '') })}
                                    className="w-full px-5 py-4 bg-surface border border-border focus:border-primary focus:bg-white outline-none transition-all font-bold text-sm uppercase"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Criteria</label>
                                <textarea
                                    required
                                    placeholder="e.g. Visits 10+ OR spend ₹10,000+"
                                    value={newSegment.rule}
                                    onChange={(e) => setNewSegment({ ...newSegment, rule: e.target.value })}
                                    className="w-full px-5 py-4 bg-surface border border-border focus:border-primary focus:bg-white outline-none transition-all font-bold text-sm h-28 resize-none uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Icon</label>
                                    <select
                                        value={newSegment.iconName}
                                        onChange={(e) => setNewSegment({ ...newSegment, iconName: e.target.value })}
                                        className="w-full px-5 py-4 bg-surface border border-border focus:border-primary focus:bg-white outline-none transition-all font-black text-[11px] uppercase tracking-widest appearance-none"
                                    >
                                        <option value="Zap">New customers</option>
                                        <option value="Crown">VIP</option>
                                        <option value="TrendingUp">Growing</option>
                                        <option value="UserMinus">Inactive</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Colour</label>
                                    <select
                                        value={newSegment.color}
                                        onChange={(e) => setNewSegment({ ...newSegment, color: e.target.value })}
                                        className="w-full px-5 py-4 bg-surface border border-border focus:border-primary focus:bg-white outline-none transition-all font-black text-[11px] uppercase tracking-widest appearance-none"
                                    >
                                        <option value="bg-blue-50 text-blue-600 border-blue-100">Blue</option>
                                        <option value="bg-amber-50 text-amber-600 border-amber-100">Amber</option>
                                        <option value="bg-emerald-50 text-emerald-600 border-emerald-100">Green</option>
                                        <option value="bg-red-50 text-red-600 border-red-100">Red</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-text text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-text/20 hover:bg-primary transition-all active:scale-[0.98]"
                            >
                                Save Segment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
