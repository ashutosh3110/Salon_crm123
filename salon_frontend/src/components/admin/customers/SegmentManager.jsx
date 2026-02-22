import React from 'react';
import {
    Tag,
    Users,
    ArrowRight,
    Plus,
    Filter,
    MoreVertical,
    Zap,
    Crown,
    UserMinus,
    TrendingUp
} from 'lucide-react';

const MOCK_SEGMENTS = [
    { id: '1', name: 'VIP Customers', count: 42, color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Crown, rule: 'Spend > ₹20,000 OR Visits > 15' },
    { id: '2', name: 'New Customers', count: 128, color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Zap, rule: 'First visit in last 30 days' },
    { id: '3', name: 'Inactive (30d+)', count: 86, color: 'bg-red-50 text-red-600 border-red-100', icon: UserMinus, rule: 'No visit since 30+ days' },
    { id: '4', name: 'High Spenders', count: 15, color: 'bg-green-50 text-green-600 border-green-100', icon: TrendingUp, rule: 'Lifetime spend > ₹50,000' },
];

export default function SegmentManager() {
    return (
        <div className="p-6 space-y-6 slide-right animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-text tracking-tight">Smart Segments</h3>
                    <p className="text-sm text-text-secondary font-medium">Group customers automatically based on their behavior.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                    <Plus className="w-4 h-4" />
                    CREATE NEW SEGMENT
                </button>
            </div>

            {/* Segment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_SEGMENTS.map((segment) => (
                    <div
                        key={segment.id}
                        className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${segment.color} group-hover:scale-110 transition-transform`}>
                                <segment.icon className="w-5 h-5" />
                            </div>
                            <button className="p-2 hover:bg-surface rounded-lg text-text-muted">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-text mb-1">{segment.name}</h4>
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-3.5 h-3.5 text-text-muted" />
                                <span className="text-sm font-semibold text-primary">{segment.count} Customers</span>
                            </div>

                            <div className="bg-surface rounded-xl p-4 border border-border">
                                <div className="flex items-center gap-2 mb-1">
                                    <Filter className="w-3 h-3 text-text-muted" />
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Rule Summary</span>
                                </div>
                                <p className="text-xs text-text-secondary font-medium italic line-clamp-1">{segment.rule}</p>
                            </div>
                        </div>

                        <button className="mt-6 w-full flex items-center justify-between bg-surface hover:bg-primary px-4 py-2.5 rounded-xl transition-all group/btn">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest group-hover/btn:text-white">View Full List</span>
                            <ArrowRight className="w-4 h-4 text-text-muted group-hover/btn:text-white transition-colors" />
                        </button>
                    </div>
                ))}

                {/* Empty State / Add Card */}
                <div className="bg-surface/50 border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:bg-white hover:border-primary/30 transition-all">
                    <div className="p-3 rounded-full bg-white text-text-muted shadow-sm border border-border">
                        <Tag className="w-6 h-6" />
                    </div>
                    <div>
                        <h5 className="text-sm font-bold text-text-secondary">Add Custom Group</h5>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">Define your own logic</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
