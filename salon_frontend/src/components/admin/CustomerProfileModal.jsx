import React, { useState } from 'react';
import {
    X,
    Calendar,
    DollarSign,
    Star,
    Clock,
    Clock3,
    Camera,
    StickyNote,
    ShoppingBag,
    UserCheck,
    Tag,
    History,
    MessageSquare,
    ShieldAlert
} from 'lucide-react';

import { useBusiness } from '../../contexts/BusinessContext';

export default function CustomerProfileModal({ customer, isOpen, onClose }) {
    const { updateCustomer } = useBusiness();
    const [activeTab, setActiveTab] = useState('history');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);

    // Initialize edit form when customer changes or editing starts
    React.useEffect(() => {
        if (customer) {
            setEditForm({
                name: customer.name,
                phone: customer.phone,
                preferred: customer.preferred,
                status: customer.status,
                tags: customer.tags
            });
        }
    }, [customer, isEditing]);

    if (!isOpen || !customer) return null;

    const handleSave = () => {
        updateCustomer(customer._id, editForm);
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-reveal flex flex-col max-h-[90vh] border border-border">
                {/* Header Section (Integrated Design) */}
                <div className="bg-surface p-6 md:p-8 border-b border-border flex justify-between items-start">
                    <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
                            {customer.name.charAt(0)}
                        </div>
                        <div className="space-y-1">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={editForm?.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="text-xl font-bold text-text bg-white border border-border px-3 py-1 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <input
                                        type="tel"
                                        value={editForm?.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="block font-semibold text-text-muted text-sm bg-white border border-border px-3 py-1 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-text tracking-tight">{customer.name}</h2>
                                        <div className="flex gap-1.5 font-bold uppercase tracking-wider text-[9px]">
                                            {(customer.tags || []).map((tag, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/10 rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="font-semibold text-text-muted text-sm flex items-center gap-2">
                                        {customer.phone} <span className="text-border">|</span> {customer.status} Member
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-dark transition-all"
                            >
                                Save Changes
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-xl text-xs font-bold text-text-muted hover:bg-slate-50 transition-all"
                            >
                                Edit Profile
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-border"
                        >
                            <X className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>
                </div>

                {/* Sub-KPIs Bar */}
                <div className="grid grid-cols-4 divide-x divide-border border-b border-border bg-white">
                    <ProfileMetric label="LIFETIME SPEND" value={`₹${customer.spend.toLocaleString()}`} icon={DollarSign} color="green" />
                    <ProfileMetric label="TOTAL VISITS" value={customer.totalVisits} icon={History} color="blue" />
                    <ProfileMetric label="AVG. RATING" value="4.8" icon={Star} color="yellow" />
                    {isEditing ? (
                        <div className="px-6 py-4 space-y-1">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">PREFERRED</span>
                            <div className="flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5 text-purple-600" />
                                <input
                                    type="text"
                                    value={editForm?.preferred}
                                    onChange={(e) => setEditForm({ ...editForm, preferred: e.target.value })}
                                    className="text-sm font-bold text-text bg-white border border-border px-2 py-0.5 rounded outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    ) : (
                        <ProfileMetric label="PREFERRED" value={customer.preferred} icon={Tag} color="purple" />
                    )}
                </div>

                {/* Content Tabs */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                    {/* Left Mini Sidebar */}
                    <div className="w-full md:w-60 bg-surface/50 p-4 space-y-1 border-r border-border">
                        <TabButton id="history" label="Visit History" icon={Clock3} active={activeTab === 'history'} onClick={setActiveTab} />
                        <TabButton id="photos" label="Photos & Gallery" icon={Camera} active={activeTab === 'photos'} onClick={setActiveTab} />
                        <TabButton id="notes" label="Consultation Notes" icon={StickyNote} active={activeTab === 'notes'} onClick={setActiveTab} />
                        <TabButton id="feedback" label="Feedback Logs" icon={MessageSquare} active={activeTab === 'feedback'} onClick={setActiveTab} />
                    </div>

                    {/* Right Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 no-scrollbar scroll-smooth">
                        {activeTab === 'history' && <VisitHistory />}
                        {activeTab === 'notes' && <ConsultationNotes />}
                        {(activeTab === 'photos' || activeTab === 'feedback') && (
                            <div className="flex flex-col items-center justify-center p-20 text-gray-300 gap-4 opacity-50">
                                <ShieldAlert className="w-12 h-12" />
                                <span className="font-bold uppercase tracking-widest text-[10px]">No Data Available</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileMetric({ label, value, icon: Icon, color }) {
    const colors = {
        green: 'text-green-600',
        blue: 'text-blue-600',
        yellow: 'text-yellow-600',
        purple: 'text-purple-600'
    };
    return (
        <div className="px-6 py-4 space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${colors[color]}`} />
                <span className="text-sm font-bold text-text">{value}</span>
            </div>
        </div>
    );
}

function TabButton({ id, label, icon: Icon, active, onClick }) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${active
                ? 'bg-white text-primary shadow-sm border border-border'
                : 'text-text-muted hover:bg-white/50 hover:text-text-secondary border border-transparent'
                }`}
        >
            <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-text-muted'}`} />
            {label}
        </button>
    );
}

function VisitHistory() {
    const history = [
        { date: '2024-03-15', service: 'Deluxe Haircut & Styling', staff: 'Zoya Khan', amount: 1500, products: ['Hair Wax', 'Shampoo'] },
        { date: '2024-02-10', service: 'Full Beard Trim & Shaping', staff: 'Haris Ali', amount: 800, products: [] },
        { date: '2024-01-05', service: 'Deep Tissue Massage', staff: 'Mehak Rizvi', amount: 2500, products: ['Essential Oils'] },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-border pb-3">Chronological Timeline</h3>
            <div className="space-y-4">
                {history.map((visit, i) => (
                    <div key={i} className="flex gap-6 relative">
                        {/* Dot & Line */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10 mt-2" />
                            {i !== history.length - 1 && <div className="w-[1px] h-full bg-border" />}
                        </div>
                        {/* Visit Card */}
                        <div className="flex-1 bg-surface/50 border border-border rounded-xl p-4 hover:bg-white hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-0.5">
                                        {new Date(visit.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                                    </span>
                                    <h4 className="font-bold text-text group-hover:text-primary transition-colors text-sm">{visit.service}</h4>
                                </div>
                                <span className="text-sm font-bold text-text">₹{visit.amount}</span>
                            </div>
                            <div className="flex items-center flex-wrap gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-border overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-surface to-border" />
                                    </div>
                                    <span className="text-[10px] font-bold text-text-muted uppercase">By: {visit.staff}</span>
                                </div>
                                {visit.products.length > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-md">
                                        <ShoppingBag className="w-3 h-3 text-green-600" />
                                        <span className="text-[10px] font-bold text-green-700 uppercase">{visit.products.join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ConsultationNotes() {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-2 border-b border-border pb-3">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Internal Remarks</h3>
                <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">+ Add Entry</button>
            </div>
            <div className="space-y-4">
                <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100 relative overflow-hidden">
                    <StickyNote className="absolute -right-4 -top-4 w-16 h-16 text-yellow-100/30 rotate-12" />
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">March 20, 2024</span>
                        <UserCheck className="w-4 h-4 text-yellow-500" />
                    </div>
                    <p className="text-sm text-yellow-800 font-medium leading-relaxed relative z-10">
                        Customer is allergic to certain chemical dyes. Always use organic ammonia-free products. Prefers cold coffee during appointments.
                    </p>
                </div>
            </div>
        </div>
    );
}
