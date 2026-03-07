import React, { useState } from 'react';
import {
    X,
    Calendar,
    DollarSign,
    Star,
    Clock,
    Clock3,
    ShoppingBag,
    Tag,
    History,
    FileText,
    Cake,
    Layers,
    MapPin
} from 'lucide-react';

import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';

export default function CustomerProfileModal({ customer, isOpen, onClose }) {
    const { user } = useAuth();
    const { updateCustomer } = useBusiness();
    const [activeTab, setActiveTab] = useState('details');
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
                tags: customer.tags,
                dob: customer.dob || '',
                anniversary: customer.anniversary || '',
                address: customer.address || '',
                remarks: customer.remarks || '',
                category: customer.category || 'Regular'
            });
        }
    }, [customer, isEditing]);

    if (!isOpen || !customer) return null;

    const handleSave = () => {
        updateCustomer(customer._id, editForm);
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-10 overflow-y-auto no-scrollbar">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-5xl bg-white rounded-none shadow-2xl animate-in slide-in-from-top-4 duration-300 flex flex-col my-8 border border-border">
                {/* Header Section (Integrated Design) */}
                <div className="bg-surface p-4 border-b border-border flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-none bg-text text-white flex items-center justify-center text-xl font-black shadow-lg">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editForm?.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="text-2xl font-black text-text bg-white border border-border px-4 py-2 rounded-none outline-none focus:border-primary uppercase tracking-tight"
                                    />
                                    <input
                                        type="tel"
                                        value={editForm?.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="block font-bold text-text-muted text-xs bg-white border border-border px-4 py-2 rounded-none outline-none focus:border-primary"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-3xl font-black text-text tracking-tighter uppercase">{customer.name}</h2>
                                        <div className="flex gap-2 font-black uppercase tracking-[0.2em] text-[10px]">
                                            {(customer.tags || []).map((tag, i) => (
                                                <span key={i} className={`px-2 py-0.5 ${tag === 'VIP' ? 'bg-amber-500 text-white' : 'bg-primary/10 text-primary border border-primary/10'}`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="font-extrabold text-text-muted text-[10px] flex items-center gap-3 uppercase tracking-[0.3em]">
                                        {maskPhone(customer.phone, user?.role)} <span className="opacity-20 text-text">|</span> {customer.status} MEMBER STATUS
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                            >
                                SAVE CHANGES
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-white border border-border px-6 py-3 rounded-none text-[10px] font-black text-text-muted hover:bg-surface transition-all uppercase tracking-widest"
                            >
                                EDIT DATA
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-surface transition-all border border-transparent hover:border-border"
                        >
                            <X className="w-6 h-6 text-text-muted" />
                        </button>
                    </div>
                </div>

                {/* Sub-KPIs Bar */}
                <div className="grid grid-cols-4 divide-x divide-border border-b border-border bg-white">
                    <ProfileMetric label="LIFETIME YIELD" value={`₹${customer.spend.toLocaleString()}`} icon={DollarSign} color="green" />
                    <ProfileMetric label="TOTAL MATRIX VISITS" value={customer.totalVisits} icon={History} color="blue" />
                    <ProfileMetric label="CORE PREFERENCE" value={customer.preferred} icon={Tag} color="purple" />
                    <ProfileMetric label="TIER CATEGORY" value={customer.category || 'Regular'} icon={Layers} color="yellow" />
                </div>

                {/* Content Tabs */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                    {/* Left Mini Sidebar */}
                    <div className="w-full md:w-52 bg-surface p-3 space-y-1.5 border-r border-border shrink-0">
                        <TabButton id="details" label="Identity Matrix" icon={FileText} active={activeTab === 'details'} onClick={setActiveTab} />
                        <TabButton id="history" label="Visit Timeline" icon={Clock3} active={activeTab === 'history'} onClick={setActiveTab} />
                    </div>

                    {/* Right Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 no-scrollbar scroll-smooth bg-white">
                        {activeTab === 'details' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-400">
                                <div className="grid grid-cols-2 gap-8">
                                    <DetailField label="Date of Birth" value={customer.dob} icon={Cake} type="date" isEditing={isEditing} editValue={editForm?.dob} onEdit={(val) => setEditForm({ ...editForm, dob: val })} />
                                    <DetailField label="Anniversary" value={customer.anniversary} icon={Calendar} type="date" isEditing={isEditing} editValue={editForm?.anniversary} onEdit={(val) => setEditForm({ ...editForm, anniversary: val })} />
                                    <DetailField label="Tier Category" value={customer.category} icon={Layers} isEditing={isEditing} editValue={editForm?.category} onEdit={(val) => setEditForm({ ...editForm, category: val })} type="select" options={['Regular', 'Premium', 'Elite', 'Budget']} />
                                    <DetailField label="Core Preference" value={customer.preferred} icon={Tag} isEditing={isEditing} editValue={editForm?.preferred} onEdit={(val) => setEditForm({ ...editForm, preferred: val })} />
                                </div>
                                <div className="space-y-8">
                                    <DetailField label="Residential Address" value={customer.address} icon={MapPin} isEditing={isEditing} editValue={editForm?.address} onEdit={(val) => setEditForm({ ...editForm, address: val })} isFullWidth />
                                    <DetailField label="Intelligence Remarks / Notes" value={customer.remarks} icon={FileText} isEditing={isEditing} editValue={editForm?.remarks} onEdit={(val) => setEditForm({ ...editForm, remarks: val })} isFullWidth />
                                </div>
                            </div>
                        )}
                        {activeTab === 'history' && <VisitHistory />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileMetric({ label, value, icon: Icon, color }) {
    const colors = {
        green: 'text-emerald-500',
        blue: 'text-blue-500',
        yellow: 'text-amber-500',
        purple: 'text-purple-500'
    };
    return (
        <div className="px-5 py-2 space-y-0.5">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.1em]">{label}</span>
            <div className="flex items-center gap-1.5">
                <Icon className={`w-3 h-3 ${colors[color]}`} />
                <span className="text-sm font-black text-text uppercase tracking-tight">{value}</span>
            </div>
        </div>
    );
}

function TabButton({ id, label, icon: Icon, active, onClick }) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-none text-[11px] font-black uppercase tracking-[0.2em] transition-all group ${active
                ? 'bg-white text-text border border-border shadow-xl shadow-slate-200/50'
                : 'text-text-muted hover:bg-white/50 hover:text-text border border-transparent'
                }`}
        >
            <div className="flex items-center gap-4">
                <Icon className={`w-4 h-4 transition-colors ${active ? 'text-primary' : 'text-text-muted group-hover:text-text'}`} />
                {label}
            </div>
            {active && <div className="w-1.5 h-1.5 bg-primary rounded-none" />}
        </button>
    );
}

function VisitHistory() {
    const history = [
        { date: '2024-03-15', service: 'DELUXE HAIRCUT & STYLING', staff: 'ZOYA KHAN', amount: 1500, products: ['HAIR WAX', 'SHAMPOO'] },
        { date: '2024-02-10', service: 'FULL BEARD TRIM & SHAPING', staff: 'HARIS ALI', amount: 800, products: [] },
        { date: '2024-01-05', service: 'DEEP TISSUE MASSAGE', staff: 'MEHAK RIZVI', amount: 2500, products: ['ESSENTIAL OILS'] },
    ];

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">CHRONOLOGICAL TIMELINE</h3>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">{history.length} RECORDS FOUND</span>
            </div>
            <div className="space-y-3">
                {history.map((visit, i) => (
                    <div key={i} className="flex gap-4 relative group">
                        {/* Dot & Line */}
                        <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 bg-text border-2 border-white ring-1 ring-border mt-1 relative z-10 group-hover:bg-primary transition-colors" />
                            {i !== history.length - 1 && <div className="w-[1px] h-full bg-border absolute top-3" />}
                        </div>
                        {/* Visit Card */}
                        <div className="flex-1 bg-surface border border-border p-3 hover:bg-white hover:shadow-lg hover:shadow-slate-200/30 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] block">
                                        {new Date(visit.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
                                    </span>
                                    <h4 className="font-black text-text text-[13px] tracking-tight">{visit.service}</h4>
                                </div>
                                <span className="text-sm font-black text-text">₹{visit.amount}</span>
                            </div>
                            <div className="flex items-center flex-wrap gap-4 pt-2 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-text text-white flex items-center justify-center text-[8px] font-black">
                                        {visit.staff.charAt(0)}
                                    </div>
                                    <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">{visit.staff}</span>
                                </div>
                                {visit.products.length > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100">
                                        <ShoppingBag className="w-2.5 h-2.5 text-emerald-600" />
                                        <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">{visit.products.join(', ')}</span>
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

function DetailField({ label, value, icon: Icon, isFullWidth, isEditing, editValue, onEdit, type = 'text', options = [] }) {
    return (
        <div className={`${isFullWidth ? 'col-span-2' : ''} space-y-2`}>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                <Icon className="w-3 h-3" /> {label}
            </p>
            {isEditing ? (
                type === 'select' ? (
                    <select
                        value={editValue}
                        onChange={(e) => onEdit(e.target.value)}
                        className="w-full bg-surface border border-primary/20 px-4 py-3 text-[11px] font-black uppercase outline-none focus:border-primary transition-all"
                    >
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={editValue}
                        onChange={(e) => onEdit(e.target.value)}
                        className="w-full bg-surface border border-primary/20 px-4 py-3 text-[11px] font-black uppercase outline-none focus:border-primary transition-all"
                    />
                )
            ) : (
                <p className="text-sm font-black text-text uppercase tracking-tight bg-surface-alt border border-border/50 px-4 py-3">
                    {value || 'DATA_NOT_SYNCED'}
                </p>
            )}
        </div>
    );
}

