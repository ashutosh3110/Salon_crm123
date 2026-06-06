import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    RefreshCw,
    ArrowLeft,
    Smartphone,
    Package,
    CloudUpload,
    ShoppingBag,
    CalendarDays
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../common/CustomSelect';
import Barcode from 'react-barcode';
import { useInventory } from '../../../contexts/InventoryContext';
import { useBusiness } from '../../../contexts/BusinessContext';
import getImageUrl, { convertToWebP } from '../../../utils/imageUtils';
import api from '../../../services/api';

export default function AddProductForm({ onSave, initialData, onCancel }) {
    const { productCategories, shopCategories, products } = useInventory();
    const { outlets, platformSettings, suppliers = [], fetchSuppliers } = useBusiness();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (fetchSuppliers) {
            fetchSuppliers();
        }
    }, [fetchSuppliers]);
    const defaultFormData = {
        name: '',
        brand: '',
        categoryId: '',
        description: '',
        sellingPrice: '',
        loyaltyPoints: '0',
        gstPercent: String(platformSettings?.productGst ?? 18),
        hsnCode: '',
        barcode: '',
        sku: '',
        threshold: '5',
        stock: '0',
        unit: 'pcs',
        supplier: '',
        availability: 'all',
        status: 'active',
        mfgDate: '',
        expiryDate: '',
        outletIds: initialData?.outletIds || [],
        isShopProduct: false,
        isInclusiveTax: false,
        appCategory: '',
        images: [],
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
        loyaltyPoints: (initialData?.loyaltyPoints !== undefined && initialData?.loyaltyPoints !== null && !isNaN(initialData.loyaltyPoints)) ? initialData.loyaltyPoints : defaultFormData.loyaltyPoints,
        threshold: (initialData?.threshold !== undefined && initialData?.threshold !== null && !isNaN(initialData.threshold)) ? initialData.threshold : defaultFormData.threshold,
        stock: (initialData?.stock !== undefined && initialData?.stock !== null && !isNaN(initialData.stock)) ? initialData.stock : defaultFormData.stock,
        unit: initialData?.unit || defaultFormData.unit,
        rating: (initialData?.rating !== undefined && initialData?.rating !== null && !isNaN(initialData.rating)) ? initialData.rating : defaultFormData.rating,
        gstPercent: (initialData?.gstPercent !== undefined && initialData?.gstPercent !== null && !isNaN(initialData.gstPercent)) ? initialData.gstPercent : (platformSettings?.productGst ? String(platformSettings.productGst) : defaultFormData.gstPercent),
        images: initialData?.images || initialData?.appImage ? [initialData.appImage] : defaultFormData.images
    });

    // Sync formData when initialData arrives asynchronously
    React.useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                categoryId: initialData.categoryId || initialData.category || '',
                sellingPrice: initialData.sellingPrice ?? '',
                loyaltyPoints: initialData.loyaltyPoints ?? '0',
                threshold: initialData.threshold ?? initialData.minStock ?? '5',
                stock: initialData.stock ?? '0',
                gstPercent: initialData.gstPercent ?? (platformSettings?.productGst ? String(platformSettings.productGst) : '18'),
                hsnCode: initialData.hsnCode ?? '',
                brand: initialData.brand ?? '',
                mfgDate: initialData.mfgDate ?? '',
                expiryDate: initialData.expiryDate ?? '',
                images: Array.isArray(initialData.images) ? initialData.images : (initialData.appImage ? [initialData.appImage] : [])
            }));
        }
    }, [initialData]);

    const [uploading, setUploading] = useState(false);

    const handleAppImageUpload = async (e) => {
        let file = e.target.files[0];
        if (!file) return;

        // Convert to WebP on the fly
        try {
            file = await convertToWebP(file);
        } catch (err) {
            console.error("WebP conversion failed, using original file", err);
        }

        const maxSize = platformSettings?.maxImageSize || 5;
        const unit = platformSettings?.maxImageSizeUnit || 'MB';
        const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
        const threshold = maxSize * multiplier;

        if (file.size > threshold) {
            alert(`Image too large. Max ${maxSize}${unit} allowed.`);
            return;
        }

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            // using api interceptor for auth
            const { data: resData } = await api.post('/uploads', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (resData.success) {
                setFormData(prev => ({ ...prev, appImage: resData.url || resData.data?.url }));
            }
        } catch (err) {
            console.error("Image upload failed", err);
            alert("Image upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const supplierNames = (suppliers || []).map(s => s.name);
    const existingCategories = Array.from(
        new Set([
            ...(productCategories || []),
            ...(products || []).map((p) => p.category).filter(Boolean),
        ])
    );

    const isFormValid = formData.name && formData.sellingPrice && formData.sku && formData.categoryId;

    const handleBack = () => {
        if (onCancel) onCancel();
        navigate('/admin/inventory/products');
    };

    const handleSave = () => {
        if (!isFormValid) {
            alert('Please fill in Name, Selling Price, SKU, and Category.');
            return;
        }
        onSave?.({
            ...formData,
            sellingPrice: parseFloat(formData.sellingPrice),
            threshold: parseInt(formData.threshold),
            stock: parseInt(formData.stock),
            gstPercent: parseInt(formData.gstPercent),
            isInclusiveTax: formData.isInclusiveTax,
            mfgDate: formData.mfgDate,
            expiryDate: formData.expiryDate,
            loyaltyPoints: parseInt(formData.loyaltyPoints) || 0
        });
        navigate('/admin/inventory/products');
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back — visible entry point to Product Master list */}
            <div className="mb-4">
                <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-bold text-text shadow-sm hover:bg-surface-alt hover:border-primary/30 hover:text-primary transition-all"
                >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    Back to Product Master
                </button>
            </div>

            {/* Header */}
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm mb-6 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 rounded-2xl bg-[#B4912B]/10 text-primary border border-[#B4912B]/20 shrink-0">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl font-bold text-text">{initialData ? 'Update Asset' : 'Create New Product'}</h2>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                            {initialData ? `Editing: ${initialData.sku}` : 'Define master product details for POS & Inventory'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-text-muted hover:bg-surface-alt hover:text-text border border-transparent hover:border-border transition-all"
                        title="Close and go back"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="p-2 rounded-xl hover:bg-surface-alt text-text-muted transition-all border border-border sm:border-0"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Core Identity & Pricing */}
                <div className="bg-surface p-8 border border-border shadow-sm space-y-8 h-full rounded-2xl">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                        <div className="w-10 h-10 bg-[#B4912B]/10 flex items-center justify-center text-primary rounded-xl">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] italic">Product Identity</h3>
                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-0.5">Master SKU Designation</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Product Name <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-black focus:border-primary outline-none transition-all uppercase placeholder:opacity-20"
                                placeholder="e.g. LUXURY_ORGANIC_SHAMPOO"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Brand / MFR</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-black focus:border-primary outline-none transition-all uppercase"
                                    placeholder="e.g. LOREAL"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Category <span className="text-rose-500">*</span></label>
                                <CustomSelect
                                    value={productCategories.find(c => c._id === formData.categoryId)?.name || 'Select'}
                                    onChange={(val) => {
                                        const cat = productCategories.find(c => c.name === val);
                                        setFormData({ ...formData, categoryId: cat?._id || '' });
                                    }}
                                    options={productCategories.map(c => c.name)}
                                    className="h-[46px] !text-[11px] font-black"
                                />
                            </div>
                        </div>

                        {/* Shop Visibility Toggle */}
                        <div className="p-4 bg-[#B4912B]/5 border border-[#B4912B]/20 rounded-2xl flex items-center justify-between group hover:bg-[#B4912B]/10 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#B4912B]/20 rounded-lg flex items-center justify-center text-primary">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text">Show in Customer Shop</p>
                                    <p className="text-[8px] text-text-muted font-bold uppercase tracking-tighter">Visible to customers in the salon app</p>
                                </div>
                            </div>
                            <div
                                role="button"
                                onClick={() => setFormData(prev => ({ ...prev, isShopProduct: !prev.isShopProduct }))}
                                className={`relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer ${formData.isShopProduct ? 'bg-[#B4912B]' : 'bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.isShopProduct ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Selling Price (MRP) <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-black text-xs">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-lg text-sm font-black focus:border-primary outline-none transition-all"
                                        placeholder="0.00"
                                        value={formData.sellingPrice || ''}
                                        onFocus={(e) => { if (e.target.value === '0') setFormData(prev => ({ ...prev, sellingPrice: '' })); }}
                                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Tax Config</label>
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, isInclusiveTax: !prev.isInclusiveTax }))}
                                    className={`flex items-center justify-between px-4 py-3 border cursor-pointer transition-all ${formData.isInclusiveTax ? 'bg-[#B4912B]/5 border-[#B4912B]' : 'bg-background border-border'}`}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-black uppercase tracking-tight ${formData.isInclusiveTax ? 'text-[#B4912B]' : 'text-text'}`}>Incl. GST</span>
                                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-tighter">Tax included in MRP</span>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full p-1 transition-all duration-300 ${formData.isInclusiveTax ? 'bg-[#B4912B]' : 'bg-slate-300'}`}>
                                        <div className={`w-3 h-3 rounded-full bg-white transition-all duration-300 transform ${formData.isInclusiveTax ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] text-emerald-600">Loyalty Points Earned</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-black focus:border-[#B4912B] outline-none transition-all text-emerald-600"
                                placeholder="0"
                                value={formData.loyaltyPoints || ''}
                                onFocus={(e) => { if (e.target.value === '0') setFormData(prev => ({ ...prev, loyaltyPoints: '' })); }}
                                onChange={(e) => setFormData({ ...formData, loyaltyPoints: Math.max(0, parseInt(e.target.value) || 0) })}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Inventory & Logistics */}
                <div className="bg-surface p-8 border border-border shadow-sm space-y-8 h-full rounded-2xl">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                        <div className="w-10 h-10 bg-amber-500/10 flex items-center justify-center text-amber-600 rounded-xl">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] italic">Logistics & SKU</h3>
                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-0.5">Asset Tracking Vector</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">SKU (Internal Code) *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-black focus:border-[#B4912B] outline-none transition-all uppercase"
                                    placeholder="e.g. SKU_001"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Unit Type *</label>
                                <CustomSelect
                                    value={formData.unit}
                                    onChange={(val) => setFormData({ ...formData, unit: val })}
                                    options={["pcs", "kg", "litre", "ml", "gram", "set", "box"]}
                                    className="h-[46px] !text-[11px] font-black"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Initial Qty</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-black focus:border-[#B4912B] outline-none transition-all"
                                    placeholder="0"
                                    value={formData.stock}
                                    onFocus={(e) => { if (e.target.value === '0') setFormData(prev => ({ ...prev, stock: '' })); }}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Low Stock Alert (Units)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-black focus:border-[#B4912B] outline-none transition-all text-rose-600"
                                    placeholder="5"
                                    value={formData.threshold}
                                    onFocus={(e) => { if (e.target.value === '0') setFormData(prev => ({ ...prev, threshold: '' })); }}
                                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">HSN Code</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-black focus:border-[#B4912B] outline-none transition-all uppercase"
                                    placeholder="e.g. 3305"
                                    value={formData.hsnCode}
                                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Primary Supplier</label>
                            <CustomSelect
                                value={formData.supplier || 'Select Supplier'}
                                onChange={(val) => setFormData({ ...formData, supplier: val === 'None / Direct' ? '' : val })}
                                options={['None / Direct', ...supplierNames]}
                                className="h-[46px] !text-[11px] font-black"
                            />
                        </div>

                        {/* Manufacturing & Expiry Dates */}
                        <div className="pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2 mb-4">
                                <CalendarDays className="w-4 h-4 text-amber-500" />
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Product Dates</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">MFG Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-bold focus:border-[#B4912B] outline-none transition-all"
                                            value={formData.mfgDate ? (typeof formData.mfgDate === 'string' && formData.mfgDate.includes('T') ? formData.mfgDate.split('T')[0] : formData.mfgDate) : ''}
                                            onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Expiry Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className={`w-full px-4 py-3 bg-background border rounded-lg text-sm font-bold focus:border-[#B4912B] outline-none transition-all ${formData.expiryDate && new Date(formData.expiryDate) < new Date()
                                                    ? 'border-rose-400 text-rose-600 bg-rose-50/50'
                                                    : formData.expiryDate && new Date(formData.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                                        ? 'border-amber-400 text-amber-600 bg-amber-50/50'
                                                        : 'border-border'
                                                }`}
                                            value={formData.expiryDate ? (typeof formData.expiryDate === 'string' && formData.expiryDate.includes('T') ? formData.expiryDate.split('T')[0] : formData.expiryDate) : ''}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        />
                                    </div>
                                    {formData.expiryDate && new Date(formData.expiryDate) < new Date() && (
                                        <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Expired
                                        </p>
                                    )}
                                    {formData.expiryDate && new Date(formData.expiryDate) >= new Date() && new Date(formData.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Expiring Soon
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Outlet Availability */}
                <div className="bg-surface p-8 border border-border shadow-sm space-y-6 lg:col-span-2 rounded-2xl">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                        <div className="w-10 h-10 bg-violet-500/10 flex items-center justify-center text-violet-600 rounded-xl">
                            <Building className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] italic">Salon Node Availability</h3>
                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-0.5">Deployment Logic</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 space-y-3">
                            <label className={`flex items-center gap-3 p-4 border transition-all cursor-pointer rounded-xl ${formData.availability === 'all'
                                    ? 'bg-[#B4912B]/10 border-[#B4912B] text-[#B4912B] font-black shadow-sm shadow-[#B4912B]/5'
                                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
                                }`}>
                                <input
                                    type="radio"
                                    name="outlet"
                                    checked={formData.availability === 'all'}
                                    onChange={() => setFormData({ ...formData, availability: 'all', outletIds: [] })}
                                    className="hidden"
                                />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${formData.availability === 'all' ? 'text-[#B4912B]' : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                    Global (All Nodes)
                                </span>
                            </label>
                            <label className={`flex items-center gap-3 p-4 border transition-all cursor-pointer rounded-xl ${formData.availability === 'selected'
                                    ? 'bg-[#B4912B]/10 border-[#B4912B] text-[#B4912B] font-black shadow-sm shadow-[#B4912B]/5'
                                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
                                }`}>
                                <input
                                    type="radio"
                                    name="outlet"
                                    checked={formData.availability === 'selected'}
                                    onChange={() => setFormData({ ...formData, availability: 'selected' })}
                                    className="hidden"
                                />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${formData.availability === 'selected' ? 'text-[#B4912B]' : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                    Targeted (Manual)
                                </span>
                            </label>
                        </div>

                        {formData.availability === 'selected' && (
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-left-4 duration-500">
                                {outlets.map(outlet => (
                                    <button
                                        key={outlet._id}
                                        type="button"
                                        onClick={() => {
                                            const ids = (formData.outletIds || []).includes(outlet._id)
                                                ? formData.outletIds.filter(id => id !== outlet._id)
                                                : [...(formData.outletIds || []), outlet._id];
                                            setFormData({ ...formData, outletIds: ids });
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 border text-left transition-all ${(formData.outletIds || []).includes(outlet._id)
                                            ? 'bg-[#B4912B]/5 border-[#B4912B] text-[#B4912B] shadow-sm font-black'
                                            : 'bg-background border-border text-text-muted opacity-50'
                                            }`}
                                    >
                                        <div className={`w-3 h-3 rounded-full border ${(formData.outletIds || []).includes(outlet._id) ? 'bg-[#B4912B] border-[#B4912B]' : 'bg-background border-border'}`} />
                                        <span className="text-[9px] uppercase tracking-tighter">{outlet.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. Shop Experience (Visible only if isShopProduct is true) */}
                <AnimatePresence>
                    {formData.isShopProduct && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-surface p-8 border border-border shadow-sm space-y-6 lg:col-span-2 overflow-hidden rounded-2xl"
                        >
                            <div className="flex items-center gap-3 border-b border-border pb-4">
                                <div className="w-10 h-10 bg-indigo-500/10 flex items-center justify-center text-indigo-600 rounded-xl">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] italic">Shop Experience Assets</h3>
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-0.5">Customer App Visualization</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Shop Description (Detailed)</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium focus:border-[#B4912B] outline-none transition-all min-h-[100px] resize-none"
                                        placeholder="Detailed description for the customer app..."
                                        value={formData.shopDescription}
                                        onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Care Instructions (Pro Tip)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium focus:border-[#B4912B] outline-none transition-all"
                                        placeholder="e.g. Keep in a cool place"
                                        value={formData.appCare}
                                        onChange={(e) => setFormData({ ...formData, appCare: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Usage Guide (Application)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium focus:border-[#B4912B] outline-none transition-all"
                                        placeholder="e.g. Apply twice daily"
                                        value={formData.appUsage}
                                        onChange={(e) => setFormData({ ...formData, appUsage: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Formula Type</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium focus:border-[#B4912B] outline-none transition-all"
                                        placeholder="e.g. Premium Ritual"
                                        value={formData.appFormulaType}
                                        onChange={(e) => setFormData({ ...formData, appFormulaType: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Consistency</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium focus:border-[#B4912B] outline-none transition-all"
                                        placeholder="e.g. Creamy / Lightweight"
                                        value={formData.appConsistency}
                                        onChange={(e) => setFormData({ ...formData, appConsistency: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Ritual Status</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium focus:border-[#B4912B] outline-none transition-all"
                                        placeholder="e.g. Dermatologically Tested"
                                        value={formData.appRitualStatus}
                                        onChange={(e) => setFormData({ ...formData, appRitualStatus: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Return Policy</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium focus:border-[#B4912B] outline-none transition-all"
                                        placeholder="Specific return policy for this product"
                                        value={formData.appReturnPolicy}
                                        onChange={(e) => setFormData({ ...formData, appReturnPolicy: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Vendor / Manufacturing Details</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium focus:border-[#B4912B] outline-none transition-all min-h-[60px] resize-none"
                                        placeholder="Produced by..."
                                        value={formData.appVendorDetails}
                                        onChange={(e) => setFormData({ ...formData, appVendorDetails: e.target.value })}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 4. Product Assets & Gallery */}
                <div className="bg-surface p-8 border border-border shadow-sm space-y-6 lg:col-span-2 rounded-2xl">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                        <div className="w-10 h-10 bg-indigo-500/10 flex items-center justify-center text-indigo-600 rounded-xl">
                            <CloudUpload className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] italic">Product Visual Assets</h3>
                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-0.5">Gallery Management</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Product Gallery (Multiple Images)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {(formData.images || []).map((img, idx) => (
                                <div key={idx} className="relative aspect-square bg-background border border-border group overflow-hidden">
                                    <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => {
                                                const newImgs = formData.images.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, images: newImgs });
                                            }}
                                            className="p-2 bg-rose-500 text-white rounded-xl hover:scale-110 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <label className="aspect-square border-2 border-dashed border-border hover:border-[#B4912B] hover:bg-[#B4912B]/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group">
                                <CloudUpload className="w-6 h-6 text-text-muted group-hover:scale-110 transition-all" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Add Image</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files);
                                        if (files.length === 0) return;

                                        setUploading(true);
                                        try {
                                            const newImageUrls = [];
                                            for (let file of files) {
                                                // 1. Convert to WebP
                                                const webpFile = await convertToWebP(file);

                                                // 2. Prepare FormData for upload
                                                const uploadFormData = new FormData();
                                                uploadFormData.append('image', webpFile);

                                                // 3. Upload to server
                                                const { data: resData } = await api.post('/uploads', uploadFormData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });

                                                if (resData.success) {
                                                    const url = resData.url || resData.data?.url;
                                                    if (url) newImageUrls.push(url);
                                                }
                                            }

                                            setFormData(prev => {
                                                const updatedImages = [...(prev.images || []), ...newImageUrls];
                                                return {
                                                    ...prev,
                                                    images: updatedImages,
                                                    // Set first image as main appImage if not set
                                                    appImage: prev.appImage || updatedImages[0] || '',
                                                    image: prev.image || updatedImages[0] || ''
                                                };
                                            });
                                        } catch (err) {
                                            console.error("Gallery upload failed", err);
                                            alert("Some images failed to upload.");
                                        } finally {
                                            setUploading(false);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* 9. Status & 10. Actions */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-end gap-6 p-6 bg-surface-alt rounded-2xl border border-border text-left">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-3 rounded-2xl text-sm font-bold text-text-secondary hover:bg-surface transition-all border border-transparent hover:border-border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isFormValid}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 ${isFormValid ? 'bg-primary text-primary-foreground shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 border border-transparent' : 'bg-[#B4912B]/10 !text-[#B4912B] border border-[#B4912B]/20 shadow-none cursor-not-allowed'}`}
                    >
                        <Save className={`w-4 h-4 ${!isFormValid ? '!stroke-[#B4912B]' : ''}`} />
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
