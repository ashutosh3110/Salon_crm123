import React, { useState } from 'react';
import {
    Scissors,
    Tag,
    Clock,
    IndianRupee,
    BadgePercent,
    Percent,
    Building2,
    CheckCircle2,
    X,
    Save,
    ClipboardCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ServiceForm({ onSave, categories = [], initialData }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialData || {
        name: '',
        category: '',
        description: '',
        duration: '',
        price: '',
        gst: '18',
        commissionApplicable: true,
        commissionType: 'percent',
        commissionValue: '10',
        outlet: 'all',
        status: 'active'
    });

    const isFormValid = formData.name && formData.category && formData.duration && formData.price;

    const handleSave = () => {
        if (!isFormValid) {
            alert('Please fill in all required fields marked with *');
            return;
        }
        onSave?.({
            ...formData,
            duration: parseInt(formData.duration),
            price: parseFloat(formData.price),
            gst: parseInt(formData.gst),
            outlets: formData.outlet === 'all' ? 'All Outlets' : 'Selected Outlets'
        });
        navigate('/admin/services/list');
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                        <Scissors className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text leading-none">{initialData ? 'Edit Service' : 'Add New Service'}</h2>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                            <ClipboardCheck className="w-3 h-3" />
                            Master Service Definition for Booking & POS
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/services/list')}
                    className="p-2 rounded-xl hover:bg-slate-50 text-text-muted transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Basic Details */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4 h-fit">
                    <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">1. Basic Details</h3>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Service Name <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            placeholder="e.g. Executive Men's Haircut"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Category <span className="text-rose-500">*</span></label>
                        <select
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold outline-none"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Select Category...</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Description (Optional)</label>
                        <textarea
                            rows="2"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold resize-none"
                            placeholder="Details about the service..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* 2. Time & Pricing */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4 h-fit">
                    <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">2. Time & Pricing</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Duration (Min) <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input
                                    type="number"
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold"
                                    placeholder="e.g. 45"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Service Price <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">₹</span>
                                <input
                                    type="number"
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 mb-3">
                            <BadgePercent className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-xs font-bold text-text uppercase tracking-widest">3. Tax (GST)</h3>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">GST % <span className="text-rose-500">*</span></label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold"
                                value={formData.gst}
                                onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                            >
                                <option value="0">0% (Nil)</option>
                                <option value="5">5% (Essentials)</option>
                                <option value="12">12%</option>
                                <option value="18">18% (Standard Beauty)</option>
                                <option value="28">28% (Luxury)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 4. Commission Rules */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group col-span-1 md:col-span-2">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                                    <Percent className="w-4 h-4 text-rose-400" />
                                </div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-400">4. Commission Settings</h3>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold leading-tight">Staff Incentives</h4>
                                <p className="text-[10px] text-white/50 leading-relaxed mt-1 uppercase font-bold tracking-tighter">Define automatically calculated staff commissions</p>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer group/toggle mt-4">
                                <div className={`w-10 h-5 rounded-full p-1 transition-all duration-300 relative ${formData.commissionApplicable ? 'bg-rose-500' : 'bg-slate-700'}`} onClick={() => setFormData({ ...formData, commissionApplicable: !formData.commissionApplicable })}>
                                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.commissionApplicable ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${formData.commissionApplicable ? 'text-white' : 'text-slate-500'}`}>Commission Applicable?</span>
                            </label>
                        </div>

                        {formData.commissionApplicable && (
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Commission Type</label>
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                                        <button
                                            onClick={() => setFormData({ ...formData, commissionType: 'percent' })}
                                            className={`px-4 py-2.5 rounded-lg text-[10px] font-bold transition-all uppercase ${formData.commissionType === 'percent' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/60 hover:text-white'}`}
                                        >
                                            % of Service
                                        </button>
                                        <button
                                            onClick={() => setFormData({ ...formData, commissionType: 'fixed' })}
                                            className={`px-4 py-2.5 rounded-lg text-[10px] font-bold transition-all uppercase ${formData.commissionType === 'fixed' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/60 hover:text-white'}`}
                                        >
                                            Flat Amount
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Commission Value</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xl font-bold focus:ring-0 outline-none focus:bg-white/20 transition-all font-mono"
                                            value={formData.commissionValue}
                                            onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold">{formData.commissionType === 'percent' ? '%' : '₹'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Decoration */}
                    <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-rose-500/10 blur-[80px] pointer-events-none" />
                </div>

                {/* 5. Outlet Availability */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-violet-500" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">5. Outlet Availability</h3>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-white transition-all group">
                            <input
                                type="radio"
                                name="outlet"
                                checked={formData.outlet === 'all'}
                                onChange={() => setFormData({ ...formData, outlet: 'all' })}
                                className="w-4 h-4 text-primary focus:ring-primary ring-offset-0"
                            />
                            <span className="text-sm font-bold text-text group-hover:text-primary transition-colors">Available in All Outlets</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-white transition-all group">
                            <input
                                type="radio"
                                name="outlet"
                                checked={formData.outlet === 'selected'}
                                onChange={() => setFormData({ ...formData, outlet: 'selected' })}
                                className="w-4 h-4 text-primary focus:ring-primary ring-offset-0"
                            />
                            <span className="text-sm font-bold text-text group-hover:text-primary transition-colors">Selected Outlets Only</span>
                        </label>
                    </div>
                </div>

                {/* 6. Status */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">6. Service Status</h3>
                    </div>

                    <div className="flex flex-col h-full justify-center space-y-4 pb-4">
                        <p className="text-[10px] text-text-muted font-bold leading-relaxed uppercase tracking-widest opacity-70">Define if the service is currently bookable and active in POS system.</p>
                        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-50 rounded-2xl border border-border">
                            <button
                                onClick={() => setFormData({ ...formData, status: 'active' })}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase ${formData.status === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-text-secondary hover:text-text'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, status: 'inactive' })}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase ${formData.status === 'inactive' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-text-secondary hover:text-text'}`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-end gap-3 p-6 bg-slate-50 rounded-3xl border border-border">
                <button
                    onClick={() => navigate('/admin/services/list')}
                    className="px-8 py-3 rounded-2xl text-sm font-bold text-text-secondary hover:bg-white transition-all border border-transparent hover:border-border"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!isFormValid}
                    className={`flex items-center gap-2 px-10 py-3 rounded-2xl text-white text-sm font-bold shadow-lg transition-all active:scale-95 ${isFormValid ? 'bg-primary shadow-primary/20 hover:shadow-xl hover:shadow-primary/30' : 'bg-slate-300 shadow-none cursor-not-allowed'}`}
                >
                    <Save className="w-4 h-4" />
                    Save Service
                </button>
            </div>

            {/* Integration Note */}
            <div className="mt-6 flex items-start gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Save className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-blue-900">Integration Notice</p>
                    <p className="text-[10px] text-blue-800/70 font-bold leading-relaxed mt-1 uppercase tracking-tighter">
                        Once saved, this service will be immediately visible in the <strong>Booking Calendar</strong> and available for selection in the <strong>POS Billing Screen</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}
