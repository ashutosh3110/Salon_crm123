import React, { useState } from 'react';
import {
    Plus,
    Search,
    Tag,
    Layers,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle2,
    Users,
    User,
    UserCircle,
    FileText,
    DollarSign,
    BadgePercent,
    Scan,
    BellRing,
    Truck,
    Building,
    Save,
    X,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../common/CustomSelect';
import Barcode from 'react-barcode';
import { useInventory } from '../../../contexts/InventoryContext';

export default function AddProductForm({ onSave, initialData, onCancel }) {
    const { productCategories, suppliers, shopCategories } = useInventory();
    const navigate = useNavigate();
    const defaultFormData = {
        name: '',
        brand: '',
        category: productCategories[0] || 'Hair Care',
        description: '',
        sellingPrice: '',
        gstPercent: '18',
        hsnCode: '',
        barcode: '',
        sku: '',
        threshold: '5',
        supplier: '',
        availability: 'all',
        status: 'active',
        mfgDate: '',
        expiryDate: '',
        isShopProduct: false,
        appCategory: '',
        appImage: '',
        shopDescription: '',
        rating: '4.5',
        appCare: 'Store in cool, dry place.',
        appUsage: 'Best used within 12 months of opening.',
        appOrigin: 'Responsibly sourced globally.',
        appKnowMore: '',
        appFormulaType: 'Premium Ritual',
        appConsistency: 'Ultra-light / Non-greasy',
        appRitualStatus: 'Fully Certified',
        appVendorDetails: 'Manufactured by Wapixo Luxury Private Limited. 100% Authentic product guarantee. Produced under strict quality standards.',
        appReturnPolicy: 'Unopened products can be returned within 7 days of delivery. Due to the personal nature of our products, opened items are non-refundable unless defective.'
    };

    const [formData, setFormData] = useState({
        ...defaultFormData,
        ...(initialData || {}),
        // Robust safety guards for numeric fields to prevent NaN and uncontrolled warnings
        sellingPrice: (initialData?.sellingPrice !== undefined && initialData?.sellingPrice !== null && !isNaN(initialData.sellingPrice)) ? initialData.sellingPrice : defaultFormData.sellingPrice,
        threshold: (initialData?.threshold !== undefined && initialData?.threshold !== null && !isNaN(initialData.threshold)) ? initialData.threshold : defaultFormData.threshold,
        rating: (initialData?.rating !== undefined && initialData?.rating !== null && !isNaN(initialData.rating)) ? initialData.rating : defaultFormData.rating,
        gstPercent: (initialData?.gstPercent !== undefined && initialData?.gstPercent !== null && !isNaN(initialData.gstPercent)) ? initialData.gstPercent : defaultFormData.gstPercent,
        appCare: initialData?.appCare ?? defaultFormData.appCare,
        appUsage: initialData?.appUsage ?? defaultFormData.appUsage,
        appOrigin: initialData?.appOrigin ?? defaultFormData.appOrigin,
        appKnowMore: initialData?.appKnowMore ?? defaultFormData.appKnowMore,
        appFormulaType: initialData?.appFormulaType ?? defaultFormData.appFormulaType,
        appConsistency: initialData?.appConsistency ?? defaultFormData.appConsistency,
        appRitualStatus: initialData?.appRitualStatus ?? defaultFormData.appRitualStatus,
        appVendorDetails: initialData?.appVendorDetails ?? defaultFormData.appVendorDetails,
        appReturnPolicy: initialData?.appReturnPolicy ?? defaultFormData.appReturnPolicy
    });

    const handleAppImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, appImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const supplierNames = suppliers.map(s => s.name);

    const isFormValid = formData.name && formData.sellingPrice && formData.sku;

    const handleSave = () => {
        if (!isFormValid) {
            alert('Please fill in Name, Selling Price, and SKU.');
            return;
        }
        onSave?.({
            ...formData,
            sellingPrice: parseFloat(formData.sellingPrice),
            threshold: parseInt(formData.threshold),
            gstPercent: parseInt(formData.gstPercent),
            mfgDate: formData.mfgDate,
            expiryDate: formData.expiryDate
        });
        navigate('/admin/inventory/products');
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text">{initialData ? 'Update Asset' : 'Create New Product'}</h2>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                            {initialData ? `Editing: ${initialData.sku}` : 'Define master product details for POS & Inventory'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (onCancel) onCancel();
                        navigate('/admin/inventory/products');
                    }}
                    className="p-2 rounded-xl hover:bg-surface-alt text-text-muted transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Basic Details */}
                <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">1. Basic Details</h3>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Product Name <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            placeholder="e.g. Loreal Revive Shampoo"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Brand / Mfr</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-bold"
                                placeholder="e.g. Loreal"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            />
                        </div>
                        <CustomSelect
                            label="Category"
                            value={formData.category}
                            onChange={(val) => setFormData({ ...formData, category: val })}
                            options={productCategories}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Description (Optional)</label>
                        <textarea
                            rows="2"
                            className="w-full px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-bold resize-none"
                            placeholder="Brief product use details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* 2. Pricing & tax */}
                <div className="space-y-6 text-left">
                    <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-xs font-bold text-text uppercase tracking-widest">2. Pricing Details</h3>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Selling Price (MRP) <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">₹</span>
                                <input
                                    type="number"
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="0.00"
                                    value={formData.sellingPrice || ''}
                                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <BadgePercent className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-xs font-bold text-text uppercase tracking-widest">3. Tax (GST) Details</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <CustomSelect
                                label="GST % *"
                                value={formData.gstPercent + '%'}
                                onChange={(val) => setFormData({ ...formData, gstPercent: val.replace('%', '') })}
                                options={["0%", "5%", "12%", "18%", "28%"]}
                            />
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">HSN Code</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-bold"
                                    placeholder="e.g. 3305"
                                    value={formData.hsnCode}
                                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Barcode & SKU */}
                <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <Scan className="w-4 h-4 text-blue-500" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">4. Barcode / SKU</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Barcode</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-mono font-bold"
                                    placeholder="Scan or enter barcode"
                                    value={formData.barcode}
                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                />
                                <button
                                    onClick={() => setFormData({ ...formData, barcode: Math.floor(Math.random() * 1000000000000).toString() })}
                                    className="p-2.5 rounded-xl bg-surface-alt hover:bg-surface text-text-muted transition-all border border-border/50" title="Generate Barcode"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>

                            {formData.barcode && (
                                <div className="mt-2 p-4 bg-surface-alt border border-border rounded-xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                                    <div className="bg-white p-2 rounded-lg shadow-sm border border-border/50">
                                        <Barcode
                                            value={formData.barcode}
                                            width={1.2}
                                            height={40}
                                            fontSize={10}
                                            background="#ffffff"
                                            lineColor="#000000"
                                            margin={0}
                                        />
                                    </div>
                                    <p className="text-[8px] font-bold text-text-muted mt-2 uppercase tracking-widest">Active Scan Protocol Link</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">SKU (Internal Code) *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-bold"
                                placeholder="e.g. LRL-SH-05"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* 5. Stock Settings */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group">
                    <div className="relative z-10 space-y-4 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                                    <BellRing className="w-4 h-4 text-rose-400" />
                                </div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-400">5. Stock Configuration</h3>
                            </div>
                            <h4 className="text-lg font-bold leading-tight">Low Stock Alert</h4>
                            <p className="text-[10px] text-white/50 leading-relaxed mt-1 uppercase font-bold tracking-tighter">Receive notification when stock drops below threshold</p>
                        </div>

                        <div className="space-y-1 mt-6">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Trigger Threshold</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    className="w-24 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xl font-bold focus:ring-0 outline-none focus:bg-white/20 transition-all"
                                    value={formData.threshold || ''}
                                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                                />
                                <span className="text-xs font-bold text-white/60">Units</span>
                            </div>
                        </div>
                    </div>
                    {/* decoration */}
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-rose-500/10 blur-3xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
                </div>

                {/* 6. Supplier Mapping */}
                <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-amber-500" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">6. Supplier Mapping</h3>
                    </div>

                    <CustomSelect
                        label="Default Supplier (Reference only)"
                        value={formData.supplier}
                        onChange={(val) => setFormData({ ...formData, supplier: val })}
                        options={supplierNames}
                        placeholder="Select Supplier..."
                    />
                    <p className="text-[9px] text-text-muted leading-tight mt-2 opacity-70">
                        * This is for procurement convenience. Actual purchase tracking happens in <strong>Inventory → Stock In</strong>.
                    </p>
                </div>

                {/* 7. Outlet Availability */}
                <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <Building className="w-4 h-4 text-violet-500" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">7. Outlet Availability</h3>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 rounded-2xl bg-surface-alt border border-border cursor-pointer hover:bg-surface transition-all group">
                            <input
                                type="radio"
                                name="outlet"
                                checked={formData.availability === 'all'}
                                onChange={() => setFormData({ ...formData, availability: 'all' })}
                                className="w-4 h-4 text-primary focus:ring-primary ring-offset-0"
                            />
                            <span className="text-sm font-bold text-text group-hover:text-primary transition-colors">Available in All Outlets</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-2xl bg-surface-alt border border-border cursor-pointer hover:bg-surface transition-all group">
                            <input
                                type="radio"
                                name="outlet"
                                checked={formData.availability === 'selected'}
                                onChange={() => setFormData({ ...formData, availability: 'selected' })}
                                className="w-4 h-4 text-primary focus:ring-primary ring-offset-0"
                            />
                            <span className="text-sm font-bold text-text group-hover:text-primary transition-colors">Selected Outlets Only</span>
                        </label>
                    </div>
                </div>

                {/* 8. Production & Expiry */}
                <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <BellRing className="w-4 h-4 text-orange-500" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">8. Production & Expiry</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Mfg. Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-bold"
                                value={formData.mfgDate}
                                onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Expiry Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-bold focus:ring-2 focus:ring-rose-500/20"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <p className="text-[9px] text-text-muted leading-tight opacity-70 mt-2">
                        * Expiry tracking helps in generating automated alerts 60 days prior to disposal date.
                    </p>
                </div>

                {/* 11. App Module Integration (Shop) */}
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-black text-white p-8 rounded-[40px] shadow-2xl relative group col-span-1 md:col-span-2 border border-white/10">
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                                    <Scan className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic tracking-tight text-white mb-1">APP MODULE INTEGRATION</h3>
                                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em] opacity-80">Enable Digital Retail Presence</p>
                                </div>
                            </div>

                            <label className="flex items-center gap-4 cursor-pointer group/toggle bg-white/5 px-6 py-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                                <div 
                                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 relative ${formData.isShopProduct ? 'bg-indigo-500' : 'bg-white/10'}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFormData(prev => ({ ...prev, isShopProduct: !prev.isShopProduct }));
                                    }}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${formData.isShopProduct ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                                <span className={`text-xs font-black uppercase tracking-widest ${formData.isShopProduct ? 'text-white' : 'text-white/40'}`}>
                                    {formData.isShopProduct ? 'VISIBLE IN APP' : 'HIDDEN FROM APP'}
                                </span>
                            </label>
                        </div>

                        {formData.isShopProduct ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-500">
                                {/* App Preview Image */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">App Display Image</label>
                                    <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-white/5 border-2 border-dashed border-white/20 hover:border-indigo-400 transition-all group/img cursor-pointer">
                                        {formData.appImage ? (
                                            <>
                                                <img src={formData.appImage} className="w-full h-full object-cover" alt="App Preview" />
                                                <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <label className="p-3 bg-white rounded-full text-indigo-900 cursor-pointer hover:scale-110 transition-all shadow-xl">
                                                        <RefreshCw className="w-5 h-5" />
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleAppImageUpload} />
                                                    </label>
                                                    <button 
                                                        onClick={() => setFormData({ ...formData, appImage: '' })}
                                                        className="p-3 bg-white rounded-full text-rose-600 hover:scale-110 transition-all shadow-xl"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer">
                                                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover/img:scale-110 transition-transform">
                                                    <Scan className="w-6 h-6" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Upload App View</p>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAppImageUpload} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-white/50 italic text-[10px] font-black uppercase tracking-[0.2em]">APP CATEGORY</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => navigate('/admin/inventory/shop-categories')}
                                                    className="text-[8px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1 border border-indigo-500/30 px-2 py-0.5 rounded-full hover:bg-indigo-500/10 transition-all"
                                                >
                                                    <Plus className="w-2 h-2" /> Manage
                                                </button>
                                            </div>
                                            <CustomSelect
                                                value={shopCategories.find(c => c.id === formData.appCategory)?.name || 'Select Category'}
                                                onChange={(val) => {
                                                    const cat = shopCategories.find(c => c.name === val);
                                                    setFormData({ ...formData, appCategory: cat?.id || '' });
                                                }}
                                                options={shopCategories.map(c => c.name)}
                                                dark={true}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">CUSTOMER RATING (MOCK)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                max="5"
                                                min="0"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-indigo-400 focus:ring-2 focus:ring-indigo-500/40 transition-all outline-none"
                                                value={formData.rating || ''}
                                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">SHOP DESCRIPTION (PREMIUM VIEW)</label>
                                        <textarea
                                            rows="6"
                                            className="w-full bg-white/5 border border-white/10 rounded-[24px] px-5 py-4 text-sm font-medium text-white/90 focus:ring-2 focus:ring-indigo-500/40 transition-all outline-none resize-none leading-relaxed"
                                            placeholder="Write a high-end description for the shop module..."
                                            value={formData.shopDescription}
                                            onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div className="p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 backdrop-blur-sm">
                                        <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-[0.1em] flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Active App Synchronization
                                        </p>
                                        <p className="text-[9px] text-indigo-300/60 mt-2 font-medium leading-relaxed uppercase">
                                            Changes here reflect immediately in the mobile app's retail section. Premium styling and rich media ensure higher conversion.
                                        </p>
                                    </div>

                                    {/* New Detailed Sections */}
                                    <div className="space-y-6 pt-6 border-t border-white/10">
                                        {/* Product Details Section */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">PRODUCT DETAILS</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-black text-indigo-300 uppercase italic">Care:</label>
                                                    <input 
                                                        type="text" 
                                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-medium text-white/80 outline-none"
                                                        value={formData.appCare}
                                                        onChange={(e) => setFormData({...formData, appCare: e.target.value})}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-black text-indigo-300 uppercase italic">Usage:</label>
                                                    <input 
                                                        type="text" 
                                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-medium text-white/80 outline-none"
                                                        value={formData.appUsage}
                                                        onChange={(e) => setFormData({...formData, appUsage: e.target.value})}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-black text-indigo-300 uppercase italic">Origin:</label>
                                                    <input 
                                                        type="text" 
                                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-medium text-white/80 outline-none"
                                                        value={formData.appOrigin}
                                                        onChange={(e) => setFormData({...formData, appOrigin: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Know Your Product Section */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">KNOW YOUR PRODUCT</h4>
                                            <textarea
                                                rows="2"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-medium text-white/80 outline-none resize-none"
                                                placeholder="Key highlights..."
                                                value={formData.appKnowMore}
                                                onChange={(e) => setFormData({...formData, appKnowMore: e.target.value})}
                                            />
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-white/40 uppercase">Formula Type:</span>
                                                    <input 
                                                        type="text" 
                                                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-right text-[10px] font-black text-white outline-none w-1/2 focus:bg-white/10 transition-all"
                                                        value={formData.appFormulaType}
                                                        onChange={(e) => setFormData({...formData, appFormulaType: e.target.value})}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-white/40 uppercase">Consistency:</span>
                                                    <input 
                                                        type="text" 
                                                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-right text-[10px] font-black text-white outline-none w-1/2 focus:bg-white/10 transition-all"
                                                        value={formData.appConsistency}
                                                        onChange={(e) => setFormData({...formData, appConsistency: e.target.value})}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-white/40 uppercase">Ritual Status:</span>
                                                    <input 
                                                        type="text" 
                                                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-right text-[10px] font-black text-emerald-400 outline-none w-1/2 focus:bg-white/10 transition-all"
                                                        value={formData.appRitualStatus}
                                                        onChange={(e) => setFormData({...formData, appRitualStatus: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vendor Details Section */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">VENDOR DETAILS</h4>
                                            <textarea
                                                rows="3"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-medium text-white/80 outline-none resize-none"
                                                value={formData.appVendorDetails}
                                                onChange={(e) => setFormData({...formData, appVendorDetails: e.target.value})}
                                            />
                                        </div>

                                        {/* Return Policy Section */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">RETURN AND EXCHANGE POLICY</h4>
                                            <textarea
                                                rows="3"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-medium text-white/80 outline-none resize-none"
                                                value={formData.appReturnPolicy}
                                                onChange={(e) => setFormData({...formData, appReturnPolicy: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[32px] bg-white/[0.02]">
                                <Scan className="w-12 h-12 text-white/10 mb-4" />
                                <p className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">Integration Disabled</p>
                                <p className="text-[9px] text-white/20 mt-2 uppercase font-bold">This product will only be visible in Admin & POS inventory</p>
                            </div>
                        )}
                    </div>

                    {/* Industrial BG Patterns */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/40 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>
            </div>

            {/* 9. Status & 10. Actions */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-surface-alt rounded-3xl border border-border text-left">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">9. Status:</span>
                        <div className="flex p-1 bg-surface rounded-xl border border-border">
                            <button
                                onClick={() => setFormData({ ...formData, status: 'active' })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.status === 'active' ? 'bg-emerald-500 text-white shadow-sm dark:shadow-emerald-950/40' : 'text-text-muted hover:text-text'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, status: 'inactive' })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.status === 'inactive' ? 'bg-rose-500 text-white shadow-sm dark:shadow-rose-950/40' : 'text-text-muted hover:text-text'}`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (onCancel) onCancel();
                            navigate('/admin/inventory/products');
                        }}
                        className="px-6 py-3 rounded-2xl text-sm font-bold text-text-secondary hover:bg-surface transition-all border border-transparent hover:border-border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isFormValid}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-primary-foreground text-sm font-bold shadow-lg transition-all active:scale-95 ${isFormValid ? 'bg-primary shadow-primary/20 hover:shadow-xl hover:shadow-primary/30' : 'bg-slate-300 dark:bg-slate-800 shadow-none cursor-not-allowed'}`}
                    >
                        <Save className="w-4 h-4" />
                        {initialData ? 'Update Product' : 'Save Product'}
                    </button>
                </div>
            </div>

            {/* Hint Box */}
            <div className="mt-6 flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-emerald-800 font-bold leading-relaxed">
                    Once saved, this product will be available on the POS screen.
                    Note that initial stock will be <strong>0</strong>. To add stock, please use the <strong>Stock In (Purchase)</strong> tool.
                </p>
            </div>
        </div>
    );
}
