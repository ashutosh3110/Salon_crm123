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
    Plus,
    Armchair,
    DoorClosed
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../common/CustomSelect';
import { useBusiness } from '../../../contexts/BusinessContext';

export default function ServiceForm({ onSave, onCancel, categories = [], initialData, isModal = false }) {
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
        gender: initialData?.gender || 'both',
        resourceType: initialData?.resourceType || 'chair'
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
                gender: formData.gender,
                resourceType: formData.resourceType
            };

            // Remove internal UI state fields that backend validation rejects
            delete payload._id;
            delete payload.outlet;
            
            if (formData._id) {
                await onSave?.(formData._id, payload);
            } else {
                await onSave?.(payload);
            }
            if (!isModal) navigate('/admin/services/list');
        } catch (error) {
            console.error('[ServiceForm] Save failed:', error);
            alert('Failed to save service. Check console for details.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (isModal) {
            onCancel?.();
        } else {
            navigate('/admin/services/list');
        }
    };

    return (
        <div className={`${isModal ? 'p-5 px-6' : 'max-w-4xl mx-auto pb-20'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            {/* Header - Only for Non-Modal */}
            {!isModal && (
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
                        onClick={handleCancel}
                        className="p-2 rounded-xl hover:bg-surface-alt text-text-muted transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className={`grid grid-cols-1 ${isModal ? 'lg:grid-cols-2' : 'md:grid-cols-2'} ${isModal ? 'gap-4' : 'gap-6'}`}>
                {/* 1. Basic Details */}
                <div className={`bg-surface ${isModal ? 'p-4' : 'p-6'} rounded-3xl border border-border shadow-sm ${isModal ? 'space-y-3' : 'space-y-4'} h-fit`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-bold text-text uppercase tracking-widest">1. Basic Details</h3>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Service Name <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            className={`w-full px-4 ${isModal ? 'py-2' : 'py-2.5'} rounded-xl bg-surface-alt border border-border text-xs focus:ring-2 focus:ring-primary/20 transition-all font-bold`}
                            placeholder="e.g. Executive Haircut"
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
                                You need categories before adding services.
                            </p>
                            <button
                                onClick={() => navigate('/admin/services/categories')}
                                className="w-full py-2 bg-white border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Plus className="w-3.5 h-3.5" /> Manage Categories
                            </button>
                        </div>
                    ) : (
                        <div className={`${isModal ? 'space-y-3' : 'space-y-4'}`}>
                            <CustomSelect 
                                label={isModal ? "" : "Category *"}
                                placeholder="Select Category *"
                                value={formData.category} 
                                onChange={(val) => setFormData({ ...formData, category: val })} 
                                options={categories.map(c => c.name)} 
                                className={isModal ? "py-0" : ""}
                            />

                            <CustomSelect 
                                label={isModal ? "" : "Target Gender *"}
                                placeholder="Select Gender *"
                                value={formData.gender === 'men' ? 'Men Only' : formData.gender === 'women' ? 'Women Only' : 'Both (Unisex)'} 
                                onChange={(val) => {
                                    const mapping = { 'Men Only': 'men', 'Women Only': 'women', 'Both (Unisex)': 'both' };
                                    setFormData({ ...formData, gender: mapping[val] });
                                }} 
                                options={['Both (Unisex)', 'Men Only', 'Women Only']} 
                                className={isModal ? "py-0" : ""}
                            />
                        </div>
                    )}

                    {!isModal && (
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
                    )}

                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Description (Optional)</label>
                        <textarea
                            rows={isModal ? "2" : "3"}
                            className={`w-full px-4 ${isModal ? 'py-2' : 'py-2.5'} rounded-xl bg-surface-alt border border-border text-xs font-bold resize-none`}
                            placeholder="Brief details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Resource Selection */}
                    <div className={`${isModal ? 'pt-3' : 'pt-4'} border-t border-border/50`}>
                        <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-2">
                            Facility Allocation *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, resourceType: 'chair' })}
                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                    formData.resourceType === 'chair'
                                        ? 'bg-primary/5 border-primary text-primary shadow-sm'
                                        : 'bg-surface-alt border-border text-text-muted hover:border-primary/40'
                                }`}
                            >
                                <div className={`p-1.5 rounded-lg ${formData.resourceType === 'chair' ? 'bg-primary text-white' : 'bg-white border border-border'}`}>
                                    <Armchair className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black uppercase tracking-tight">Chair</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, resourceType: 'room' })}
                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                    formData.resourceType === 'room'
                                        ? 'bg-primary/5 border-primary text-primary shadow-sm'
                                        : 'bg-surface-alt border-border text-text-muted hover:border-primary/40'
                                }`}
                            >
                                <div className={`p-1.5 rounded-lg ${formData.resourceType === 'room' ? 'bg-primary text-white' : 'bg-white border border-border'}`}>
                                    <DoorClosed className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black uppercase tracking-tight">Room</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`${isModal ? 'space-y-4' : 'space-y-6'}`}>
                    {/* 2. Time & Pricing */}
                    <div className={`bg-surface ${isModal ? 'p-4' : 'p-6'} rounded-3xl border border-border shadow-sm ${isModal ? 'space-y-3' : 'space-y-4'} h-fit`}>
                        <div className="flex items-center gap-2 mb-1">
                            <IndianRupee className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-[10px] font-bold text-text uppercase tracking-widest">2. Time & Pricing</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Dur (Min) <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                                    <input
                                        type="number"
                                        className={`w-full pl-8 pr-4 ${isModal ? 'py-2' : 'py-2.5'} rounded-xl bg-surface-alt border border-border text-xs font-bold`}
                                        placeholder="0"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Price <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold text-xs">₹</span>
                                    <input
                                        type="number"
                                        className={`w-full pl-7 pr-4 ${isModal ? 'py-2' : 'py-2.5'} rounded-xl bg-surface-alt border border-border text-xs font-bold text-primary`}
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={`${isModal ? 'pt-3' : 'pt-4'} border-t border-border/50`}>
                            <CustomSelect 
                                label={isModal ? "" : "GST % *"}
                                placeholder="Select GST % *"
                                value={formData.gst === '0' ? '0% (Nil)' : 
                                       formData.gst === '5' ? '5% (Essentials)' :
                                       formData.gst === '12' ? '12%' :
                                       formData.gst === '18' ? '18% (Standard Beauty)' :
                                       formData.gst === '28' ? '28% (Luxury)' : formData.gst + '%'}
                                onChange={(val) => {
                                    const numericValue = val.split('%')[0];
                                    setFormData({ ...formData, gst: numericValue });
                                }} 
                                options={["0%", "5%", "12%", "18%", "28%"]} 
                                className={isModal ? "py-0" : ""}
                            />
                        </div>
                    </div>

                    {/* 4. Commission Rules */}
                    <div className={`bg-slate-900 text-white ${isModal ? 'p-4' : 'p-6'} rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group`}>
                        <div className="relative z-10 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Percent className="w-3.5 h-3.5 text-rose-400" />
                                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-rose-400">4. Commission</h3>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${formData.commissionApplicable ? 'bg-rose-500' : 'bg-slate-700'}`} onClick={() => setFormData({ ...formData, commissionApplicable: !formData.commissionApplicable })}>
                                        <div className={`w-3 h-3 bg-white rounded-full transition-all ${formData.commissionApplicable ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">Active</span>
                                </label>
                            </div>

                            {formData.commissionApplicable && (
                                <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Type</label>
                                        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                                            <button onClick={() => setFormData({ ...formData, commissionType: 'percent' })} className={`flex-1 py-1 text-[8px] font-bold rounded-md transition-all ${formData.commissionType === 'percent' ? 'bg-white text-slate-900' : 'text-white/40'}`}>%</button>
                                            <button onClick={() => setFormData({ ...formData, commissionType: 'fixed' })} className={`flex-1 py-1 text-[8px] font-bold rounded-md transition-all ${formData.commissionType === 'fixed' ? 'bg-white text-slate-900' : 'text-white/40'}`}>₹</button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Value</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold outline-none"
                                            value={formData.commissionValue}
                                            onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5. Outlet & 6. Status - Compressed for Modal */}
                    <div className={`bg-surface ${isModal ? 'p-4' : 'p-6'} rounded-3xl border border-border shadow-sm h-fit space-y-3`}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 className="w-3.5 h-3.5 text-violet-500" />
                                    <h3 className="text-[9px] font-bold text-text uppercase tracking-widest">5. Outlets</h3>
                                </div>
                                <select 
                                    className="w-full bg-surface-alt border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none"
                                    value={formData.outlet}
                                    onChange={(e) => setFormData({ ...formData, outlet: e.target.value })}
                                >
                                    <option value="all">All Outlets</option>
                                    <option value="selected">Selected...</option>
                                </select>
                                
                                {formData.outlet === 'selected' && (
                                    <div className="mt-3 space-y-2 max-h-[120px] overflow-y-auto px-1 scrollbar-hide">
                                        {outlets.map((o) => (
                                            <label key={o._id} className="flex items-center gap-3 p-2 bg-surface-alt rounded-lg border border-border/50 hover:border-primary/30 cursor-pointer transition-all">
                                                <input
                                                    type="checkbox"
                                                    className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary"
                                                    checked={formData.outletIds.includes(o._id)}
                                                    onChange={(e) => {
                                                        const newIds = e.target.checked
                                                            ? [...formData.outletIds, o._id]
                                                            : formData.outletIds.filter(id => id !== o._id);
                                                        setFormData({ ...formData, outletIds: newIds });
                                                    }}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-text tracking-tighter">{o.name}</span>
                                                    <span className="text-[8px] font-bold text-text-muted uppercase leading-none">{o.address?.city}</span>
                                                </div>
                                            </label>
                                        ))}
                                        {outlets.length === 0 && <p className="text-[9px] text-text-muted font-bold uppercase italic">No outlets found</p>}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <h3 className="text-[9px] font-bold text-text uppercase tracking-widest">6. Status</h3>
                                </div>
                                <div className="flex bg-surface-alt rounded-xl p-0.5 border border-border">
                                    <button onClick={() => setFormData({ ...formData, status: 'active' })} className={`flex-1 py-1.5 text-[9px] font-bold rounded-lg transition-all ${formData.status === 'active' ? 'bg-emerald-500 text-white shadow-sm' : 'text-text-muted'}`}>ACTIVE</button>
                                    <button onClick={() => setFormData({ ...formData, status: 'inactive' })} className={`flex-1 py-1.5 text-[9px] font-bold rounded-lg transition-all ${formData.status === 'inactive' ? 'bg-rose-500 text-white shadow-sm' : 'text-text-muted'}`}>OFF</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className={`${isModal ? 'mt-4' : 'mt-8'} flex flex-col sm:flex-row sm:items-center justify-end gap-2 ${isModal ? 'p-4' : 'p-6'} bg-surface-alt rounded-3xl border border-border text-left`}>
                <button
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface transition-all border border-transparent hover:border-border"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!isFormValid || isSaving}
                    className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-primary-foreground text-xs font-bold shadow-lg transition-all active:scale-95 ${isFormValid && !isSaving ? 'bg-primary shadow-primary/20 hover:shadow-xl hover:shadow-primary/30' : 'bg-slate-300 dark:bg-slate-800 shadow-none cursor-not-allowed'}`}
                >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? 'Saving...' : 'Save Service'}
                </button>
            </div>

            {/* Integration Note */}
            {!isModal && (
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
            )}
        </div>
    );
}
