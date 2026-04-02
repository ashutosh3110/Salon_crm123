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
    ClipboardCheck,
    Upload,
    Image as ImageIcon,
    ChevronDown,
    Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../common/CustomSelect';
import { useBusiness } from '../../../contexts/BusinessContext';

export default function ServiceForm({ onSave, categories = [], initialData }) {
    const navigate = useNavigate();
    const { outlets } = useBusiness();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        _id: initialData?._id || null,
        name: initialData?.name || '',
        category: initialData?.category || '',
        description: initialData?.description || '',
        duration: initialData?.duration || '',
        price: initialData?.price || '',
        image: initialData?.image || '',
        gst: initialData?.gst || '18',
        commissionApplicable: initialData?.commissionApplicable !== undefined ? initialData.commissionApplicable : true,
        commissionType: initialData?.commissionType || 'percent',
        commissionValue: initialData?.commissionValue || '10',
        outlet: initialData?.outlet === 'All Outlets' ? 'all' : (initialData?.outletIds?.length > 0 ? 'selected' : 'all'),
        outletIds: initialData?.outletIds || [],
        status: initialData?.status || 'active',
        gender: initialData?.gender || 'both'
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size too large. Max 2MB allowed.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const isFormValid = formData.name && formData.category && formData.duration && formData.price;

    const handleSave = async () => {
        if (!isFormValid) {
            alert('Please fill in all required fields marked with *');
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                duration: parseInt(formData.duration),
                price: parseFloat(formData.price),
                gst: parseInt(formData.gst),
                commissionValue: parseFloat(formData.commissionValue) || 0,
                outletIds: formData.outlet === 'all' ? [] : formData.outletIds,
                gender: formData.gender
            };

            // Remove internal UI state fields that backend validation rejects
            delete payload._id;
            delete payload.outlet;
            
            if (formData._id) {
                await onSave?.(formData._id, payload);
            } else {
                await onSave?.(payload);
            }
            navigate('/admin/services/list');
        } catch (error) {
            console.error('[ServiceForm] Save failed:', error);
            alert('Failed to save service. Check console for details.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm mb-6 flex items-center justify-between">
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
                    className="p-2 rounded-xl hover:bg-surface-alt text-text-muted transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Basic Details */}
                <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4 h-fit">
                    <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">1. Basic Details</h3>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Service Name <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            placeholder="e.g. Executive Men's Haircut"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z0-9\s()&/-]/g, '') })}
                        />
                    </div>

                    {categories.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-3">
                            <div className="flex items-center gap-2 text-rose-600">
                                <Tag className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">No Categories Found</span>
                            </div>
                            <p className="text-[10px] text-rose-900/60 font-bold leading-relaxed uppercase tracking-tighter">
                                You need at least one category (e.g., Hair, Skin) before you can add services.
                            </p>
                            <button
                                onClick={() => navigate('/admin/services/categories')}
                                className="w-full py-2 bg-white border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Plus className="w-3.5 h-3.5" /> Manage Categories
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <CustomSelect 
                                label="Category *" 
                                value={formData.category} 
                                onChange={(val) => setFormData({ ...formData, category: val })} 
                                options={categories.map(c => c.name)} 
                                placeholder="Select Category..." 
                            />

                            <CustomSelect 
                                label="Target Gender *" 
                                value={formData.gender === 'men' ? 'Men Only' : formData.gender === 'women' ? 'Women Only' : 'Both (Unisex)'} 
                                onChange={(val) => {
                                    const mapping = { 'Men Only': 'men', 'Women Only': 'women', 'Both (Unisex)': 'both' };
                                    setFormData({ ...formData, gender: mapping[val] });
                                }} 
                                options={['Both (Unisex)', 'Men Only', 'Women Only']} 
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Service Image</label>
                        <div className="relative group">
                            {formData.image ? (
                                <div className="relative aspect-video rounded-2xl overflow-hidden border border-border group">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <label className="p-2 bg-white rounded-full text-primary cursor-pointer hover:scale-110 transition-transform">
                                            <Upload className="w-4 h-4" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                        <button 
                                            onClick={() => setFormData({ ...formData, image: '' })}
                                            className="p-2 bg-white rounded-full text-rose-500 hover:scale-110 transition-transform"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-border bg-surface-alt hover:bg-surface hover:border-primary/40 transition-all cursor-pointer group">
                                    <div className="p-3 rounded-full bg-primary/5 text-text-muted group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-2">Click to Upload Image</p>
                                    <p className="text-[8px] text-text-muted opacity-60 mt-1 uppercase">JPG, PNG, WEBP (Max 2MB)</p>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Description (Optional)</label>
                        <textarea
                            rows="3"
                            className="w-full px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-bold resize-none"
                            placeholder="Details about the service that customers will see in the app..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* 2. Time & Pricing */}
                <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4 h-fit">
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
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-bold"
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
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                        <CustomSelect 
                            label="GST % *" 
                            value={formData.gst === '0' ? '0% (Nil)' : 
                                   formData.gst === '5' ? '5% (Essentials)' :
                                   formData.gst === '12' ? '12%' :
                                   formData.gst === '18' ? '18% (Standard Beauty)' :
                                   formData.gst === '28' ? '28% (Luxury)' : formData.gst + '%'}
                            onChange={(val) => {
                                const numericValue = val.split('%')[0];
                                setFormData({ ...formData, gst: numericValue });
                            }} 
                            options={[
                                "0% (Nil)",
                                "5% (Essentials)",
                                "12%",
                                "18% (Standard Beauty)",
                                "28% (Luxury)"
                            ]} 
                        />
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
                                <div className={`pill-toggle w-10 h-5 rounded-full p-1 transition-all duration-300 relative ${formData.commissionApplicable ? 'bg-rose-500' : 'bg-slate-700'}`} onClick={() => setFormData({ ...formData, commissionApplicable: !formData.commissionApplicable })}>
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
                <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-violet-500" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">5. Outlet Availability</h3>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 rounded-2xl bg-surface-alt border border-border cursor-pointer hover:bg-surface transition-all group">
                            <input
                                type="radio"
                                name="outlet"
                                checked={formData.outlet === 'all'}
                                onChange={() => setFormData({ ...formData, outlet: 'all' })}
                                className="w-4 h-4 text-primary focus:ring-primary ring-offset-0"
                            />
                            <span className="text-sm font-bold text-text group-hover:text-primary transition-colors">Available in All Outlets</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-2xl bg-surface-alt border border-border cursor-pointer hover:bg-surface transition-all group">
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

                    {formData.outlet === 'selected' && (
                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                            {outlets.map(outlet => (
                                <button
                                    key={outlet._id}
                                    type="button"
                                    onClick={() => {
                                        const ids = formData.outletIds.includes(outlet._id)
                                            ? formData.outletIds.filter(id => id !== outlet._id)
                                            : [...formData.outletIds, outlet._id];
                                        setFormData({ ...formData, outletIds: ids });
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${formData.outletIds.includes(outlet._id)
                                        ? 'bg-primary/5 border-primary text-primary shadow-sm'
                                        : 'bg-white border-border text-text-muted hover:border-primary/40'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.outletIds.includes(outlet._id)
                                        ? 'bg-primary border-primary text-white'
                                        : 'bg-white border-border'
                                    }`}>
                                        {formData.outletIds.includes(outlet._id) && <CheckCircle2 className="w-3 h-3" />}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-tight">{outlet.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 6. Status */}
                <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">6. Service Status</h3>
                    </div>

                    <div className="flex flex-col h-full justify-center space-y-4 pb-4">
                        <p className="text-[10px] text-text-muted font-bold leading-relaxed uppercase tracking-widest opacity-70">Define if the service is currently bookable and active in POS system.</p>
                        <div className="grid grid-cols-2 gap-2 p-1.5 bg-surface-alt rounded-2xl border border-border">
                            <button
                                onClick={() => setFormData({ ...formData, status: 'active' })}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase ${formData.status === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-950/40' : 'text-text-secondary hover:text-text'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, status: 'inactive' })}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase ${formData.status === 'inactive' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-rose-950/40' : 'text-text-secondary hover:text-text'}`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-end gap-3 p-6 bg-surface-alt rounded-3xl border border-border text-left">
                <button
                    onClick={() => navigate('/admin/services/list')}
                    className="px-8 py-3 rounded-2xl text-sm font-bold text-text-secondary hover:bg-surface transition-all border border-transparent hover:border-border"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!isFormValid || isSaving}
                    className={`flex items-center gap-2 px-10 py-3 rounded-2xl text-primary-foreground text-sm font-bold shadow-lg transition-all active:scale-95 ${isFormValid && !isSaving ? 'bg-primary shadow-primary/20 hover:shadow-xl hover:shadow-primary/30' : 'bg-slate-300 dark:bg-slate-800 shadow-none cursor-not-allowed'}`}
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Service'}
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
