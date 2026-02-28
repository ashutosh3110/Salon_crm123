import React, { useState } from 'react';
import {
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
    Search,
    RefreshCw,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Barcode from 'react-barcode';

export default function AddProductForm({ onSave }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: 'Hair Care',
        description: '',
        sellingPrice: '',
        gstPercent: '18',
        hsnCode: '',
        barcode: '',
        sku: '',
        threshold: '5',
        supplier: '',
        availability: 'all',
        status: 'active'
    });

    const categories = ['Hair Care', 'Skin Care', 'Styling', 'Grooming', 'Equipment'];
    const suppliers = ['Supplier A', 'Supplier B', 'Wholesale Mart', 'Beauty Hub'];

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
            gstPercent: parseInt(formData.gstPercent)
        });
        navigate('/admin/inventory/products');
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text">Create New Product</h2>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Define master product details for POS & Inventory</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/inventory/products')}
                    className="p-2 rounded-xl hover:bg-slate-50 text-text-muted transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Basic Details */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">1. Basic Details</h3>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Product Name <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            placeholder="e.g. Loreal Revive Shampoo"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Brand / Mfr</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold"
                                placeholder="e.g. Loreal"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Category</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Description (Optional)</label>
                        <textarea
                            rows="2"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold resize-none"
                            placeholder="Brief product use details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* 2. Pricing & tax */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
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
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="0.00"
                                    value={formData.sellingPrice}
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
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">GST % <span className="text-rose-500">*</span></label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold"
                                    value={formData.gstPercent}
                                    onChange={(e) => setFormData({ ...formData, gstPercent: e.target.value })}
                                >
                                    <option value="0">0%</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">HSN Code</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold"
                                    placeholder="e.g. 3305"
                                    value={formData.hsnCode}
                                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Barcode & SKU */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
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
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-mono font-bold"
                                    placeholder="Scan or enter barcode"
                                    value={formData.barcode}
                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                />
                                <button
                                    onClick={() => setFormData({ ...formData, barcode: Math.floor(Math.random() * 1000000000000).toString() })}
                                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-text-muted transition-all border border-border/50" title="Generate Barcode"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>

                            {formData.barcode && (
                                <div className="mt-2 p-4 bg-slate-50 border border-border rounded-xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
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
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">SKU (Internal Code) <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold"
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
                                    value={formData.threshold}
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
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-amber-500" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">6. Supplier Mapping</h3>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Default Supplier (Reference only)</label>
                        <select
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold"
                            value={formData.supplier}
                            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        >
                            <option value="">Select Supplier...</option>
                            {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <p className="text-[9px] text-text-muted leading-tight mt-2 opacity-70">
                            * This is for procurement convenience. Actual purchase tracking happens in <strong>Inventory → Stock In</strong>.
                        </p>
                    </div>
                </div>

                {/* 7. Outlet Availability */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Building className="w-4 h-4 text-violet-500" />
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest">7. Outlet Availability</h3>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-white transition-all group">
                            <input
                                type="radio"
                                name="outlet"
                                checked={formData.availability === 'all'}
                                onChange={() => setFormData({ ...formData, availability: 'all' })}
                                className="w-4 h-4 text-primary focus:ring-primary ring-offset-0"
                            />
                            <span className="text-sm font-bold text-text group-hover:text-primary transition-colors">Available in All Outlets</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-border cursor-pointer hover:bg-white transition-all group">
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
            </div>

            {/* 8. Status & 9. Actions */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-slate-50 rounded-3xl border border-border">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">8. Status:</span>
                        <div className="flex p-1 bg-white rounded-xl border border-border">
                            <button
                                onClick={() => setFormData({ ...formData, status: 'active' })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.status === 'active' ? 'bg-emerald-500 text-white shadow-sm' : 'text-text-muted hover:text-text'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, status: 'inactive' })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.status === 'inactive' ? 'bg-rose-500 text-white shadow-sm' : 'text-text-muted hover:text-text'}`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/inventory/products')}
                        className="px-6 py-3 rounded-2xl text-sm font-bold text-text-secondary hover:bg-white transition-all border border-transparent hover:border-border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isFormValid}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-white text-sm font-bold shadow-lg transition-all active:scale-95 ${isFormValid ? 'bg-primary shadow-primary/20 hover:shadow-xl hover:shadow-primary/30' : 'bg-slate-300 shadow-none cursor-not-allowed'}`}
                    >
                        <Save className="w-4 h-4" />
                        Save Product
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
