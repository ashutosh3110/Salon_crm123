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
    const { segments, deleteSegment, fetchSegmentCustomers, addSegment, segmentsLoading } = useBusiness();
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
            if (!viewingSegmentCustomers?._id && !viewingSegmentCustomers?.id) {
                setSegmentCustomers([]);
                setSegmentCustomersLoading(false);
                return;
            }
            setSegmentCustomersLoading(true);
            try {
                const list = await fetchSegmentCustomers(viewingSegmentCustomers._id || viewingSegmentCustomers.id);
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
        <div className="p-10 space-y-10 animate-reveal text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-text uppercase tracking-tight italic">Customer Segments</h3>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Smart client grouping & targeting</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary/90 transition-all flex items-center gap-3"
                >
                    <Plus className="w-4 h-4" /> Create Segment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {segmentsLoading ? (
                    <div className="col-span-full py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">Loading clusters...</div>
                ) : segments.length > 0 ? (
                    segments.map((segment) => {
                        const Icon = iconMap[segment.iconName] || Tag;
                        return (
                            <div key={segment._id || segment.id} className="bg-white border-2 border-text p-8 group hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => deleteSegment(segment._id || segment.id)} className="text-rose-500 hover:scale-125 transition-transform"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-6">
                                    <div className={`w-14 h-14 border-2 border-text flex items-center justify-center ${segment.color?.split(' ')[1] || 'text-primary'}`}><Icon className="w-6 h-6" /></div>
                                    <div>
                                        <h4 className="text-2xl font-black text-text uppercase italic mb-1">{segment.name}</h4>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2 italic"><Users className="w-3 h-3" /> {segment.count ?? 0} Members</p>
                                    </div>
                                    <div className="p-4 bg-surface-alt/50 border border-border italic">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-relaxed line-clamp-2">{segment.rule}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewingSegmentCustomers(segment)}
                                    className="mt-8 flex items-center justify-between border-t-2 border-text pt-6 group/btn"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover/btn:text-primary transition-colors">See Members</span>
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div onClick={() => setShowAddModal(true)} className="col-span-full border-2 border-dashed border-text-muted/30 p-20 flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:border-primary transition-all">
                        <Tag className="w-10 h-10 text-text-muted/20" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-40 italic">Empty Database - Click to Create Your First Segment</p>
                    </div>
                )}
            </div>

            {/* Customers Modal */}
            {viewingSegmentCustomers && (
                <div className="fixed inset-0 bg-background/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white border-2 border-text w-full max-w-2xl p-12 shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setViewingSegmentCustomers(null)} className="absolute right-8 top-8 hover:rotate-90 transition-transform"><X className="w-6 h-6" /></button>
                        <div className="mb-10 text-left">
                            <h3 className="text-4xl font-black text-text uppercase tracking-tight italic">{viewingSegmentCustomers.name}</h3>
                            <div className="mt-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-60 italic">{viewingSegmentCustomers.rule}</div>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar text-left">
                            {segmentCustomersLoading ? <div className="py-10 text-center text-[10px] font-black uppercase tracking-widest opacity-40">Scanning Database...</div> : segmentCustomers.length > 0 ? segmentCustomers.map(c => (
                                <div key={c._id} className="p-6 border-2 border-transparent hover:border-text transition-all bg-surface group flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 border-2 border-text flex items-center justify-center font-black text-primary italic shadow-[4px_4px_0px_#000] group-hover:shadow-none transition-all">{c.name.charAt(0)}</div>
                                        <div>
                                            <h4 className="font-black text-text uppercase italic tracking-tight">{c.name}</h4>
                                            <p className="text-[10px] font-bold text-text-muted tracking-widest">{c.phone}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-text italic">₹{(c.spend ?? 0).toLocaleString()}</div>
                                        <div className="text-[9px] font-bold text-primary uppercase tracking-widest">{c.totalVisits ?? 0} VISITS</div>
                                    </div>
                                </div>
                            )) : <div className="py-10 text-center text-[10px] font-black uppercase tracking-widest opacity-40 italic">No matches found in this cluster</div>}
                        </div>
                        <div className="mt-10 pt-10 border-t-2 border-text grid grid-cols-2 gap-6">
                            <button className="py-4 border-2 border-text font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-surface transition-all"><Download className="w-4 h-4" /> Export</button>
                            <button className="py-4 bg-text text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-all"><Zap className="w-4 h-4" /> Message</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-background/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white border-2 border-text w-full max-w-md p-12 shadow-[0_40px_100px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-10 text-left">
                            <h3 className="text-2xl font-black text-text uppercase italic tracking-tight">New Segment</h3>
                            <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleAddSegment} className="space-y-8 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">IDENTIFIER</label>
                                <input required type="text" value={newSegment.name} onChange={e => setNewSegment({ ...newSegment, name: e.target.value.toUpperCase() })} className="w-full p-4 border-2 border-text font-black text-sm uppercase italic outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">RULE ENGINE</label>
                                <textarea required rows="3" value={newSegment.rule} onChange={e => setNewSegment({ ...newSegment, rule: e.target.value.toUpperCase() })} className="w-full p-4 border-2 border-text font-black text-sm uppercase italic outline-none resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">VISUALS</label>
                                    <select value={newSegment.iconName} onChange={e => setNewSegment({ ...newSegment, iconName: e.target.value })} className="w-full p-4 border-2 border-text font-black text-xs uppercase outline-none appearance-none">
                                        <option value="Zap">⚡ QUICK</option>
                                        <option value="Crown">👑 ELITE</option>
                                        <option value="TrendingUp">📈 GROWING</option>
                                        <option value="UserMinus">⚠️ AT RISK</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">PALETTE</label>
                                    <select value={newSegment.color} onChange={e => setNewSegment({ ...newSegment, color: e.target.value })} className="w-full p-4 border-2 border-text font-black text-xs uppercase outline-none appearance-none">
                                        <option value="bg-blue-50 text-blue-600 border-blue-100">BLUE</option>
                                        <option value="bg-amber-50 text-amber-600 border-amber-100">GOLD</option>
                                        <option value="bg-emerald-50 text-emerald-600 border-emerald-100">GREEN</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-text text-white font-black text-[11px] uppercase tracking-widest hover:bg-primary transition-all shadow-[8px_8px_0px_#C8956C]">Initialize Segment</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
