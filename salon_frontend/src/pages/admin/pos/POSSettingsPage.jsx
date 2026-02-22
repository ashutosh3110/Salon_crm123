import {
    Settings,
    ShieldCheck,
    Percent,
    Hash,
    CreditCard,
    FileText,
    Tag,
    Save,
    AlertTriangle
} from 'lucide-react';
import { useState } from 'react';

export default function POSSettingsPage() {
    const [settings, setSettings] = useState({
        gstEnabled: true,
        gstPercentage: 18,
        invoicePrefix: 'INV-2026-',
        invoiceStartNumber: '001',
        maxDiscount: 20,
        footerText: 'Thank you for visiting SalonCRM! Have a great day.',
        couponsEnabled: true,
        allowedModes: ['Cash', 'UPI', 'Debit Card', 'Credit Card']
    });

    const modes = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Net Banking'];

    const handleToggleMode = (mode) => {
        setSettings(prev => ({
            ...prev,
            allowedModes: prev.allowedModes.includes(mode)
                ? prev.allowedModes.filter(m => m !== mode)
                : [...prev.allowedModes, mode]
        }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">POS Settings</h1>
                    <p className="text-sm text-text-secondary mt-1">Configure invoicing, taxes, and payment rules.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100">
                    <ShieldCheck className="w-4 h-4" /> Admin Access Only
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tax & Invoicing */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-5">
                    <h3 className="font-bold text-text flex items-center gap-2 border-b border-border pb-3">
                        <Percent className="w-4 h-4 text-primary" /> Tax & Invoicing
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-text">GST on Invoices</p>
                                <p className="text-xs text-text-secondary">Enable automatic tax calculation</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, gstEnabled: !settings.gstEnabled })}
                                className={`w-12 h-6 rounded-full transition-all relative ${settings.gstEnabled ? 'bg-primary' : 'bg-surface-alt'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.gstEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {settings.gstEnabled && (
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-xs font-bold text-text-secondary uppercase">GST Percentage (%)</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                        <input
                                            type="number"
                                            value={settings.gstPercentage}
                                            onChange={(e) => setSettings({ ...settings, gstPercentage: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase">Invoice Prefix</label>
                                <input
                                    type="text"
                                    value={settings.invoicePrefix}
                                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase">Start Number</label>
                                <input
                                    type="text"
                                    value={settings.invoiceStartNumber}
                                    onChange={(e) => setSettings({ ...settings, invoiceStartNumber: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Discounts & Payments */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-5">
                    <h3 className="font-bold text-text flex items-center gap-2 border-b border-border pb-3">
                        <Tag className="w-4 h-4 text-primary" /> Discounts & Offers
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-text">Max Allowed Discount (%)</label>
                            <input
                                type="range"
                                min="0" max="50" step="1"
                                value={settings.maxDiscount}
                                onChange={(e) => setSettings({ ...settings, maxDiscount: e.target.value })}
                                className="w-full accent-primary mt-2"
                            />
                            <div className="flex justify-between text-xs font-bold text-text-muted">
                                <span>0%</span>
                                <span className="text-primary">{settings.maxDiscount}% Limit</span>
                                <span>50%</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <p className="text-sm font-semibold text-text">Coupons & Offer Codes</p>
                                <p className="text-xs text-text-secondary">Enable coupon field in POS</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, couponsEnabled: !settings.couponsEnabled })}
                                className={`w-12 h-6 rounded-full transition-all relative ${settings.couponsEnabled ? 'bg-primary' : 'bg-surface-alt'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.couponsEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-5 lg:col-span-2">
                    <h3 className="font-bold text-text flex items-center gap-2 border-b border-border pb-3">
                        <CreditCard className="w-4 h-4 text-primary" /> Allowed Payment Methods
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {modes.map(mode => (
                            <button
                                key={mode}
                                onClick={() => handleToggleMode(mode)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${settings.allowedModes.includes(mode)
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'bg-surface border border-border text-text-muted hover:bg-surface-alt'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Receipt Customization */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-5 lg:col-span-2">
                    <h3 className="font-bold text-text flex items-center gap-2 border-b border-border pb-3">
                        <FileText className="w-4 h-4 text-primary" /> Receipt Customization
                    </h3>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase">Receipt Footer Text</label>
                        <textarea
                            value={settings.footerText}
                            onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                            className="w-full h-20 px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-yellow-800">Changes affect all terminals</p>
                    <p className="text-xs text-yellow-700 leading-relaxed">Saving these settings will immediately update the POS terminal configuration for all outlets. Ensure taxes and discount rules are compliance-verified.</p>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:bg-surface-alt transition">Reset</button>
                <button
                    onClick={() => alert('Settings saved successfully!')}
                    className="btn-primary flex items-center gap-2 px-8 py-2.5 rounded-xl shadow-lg shadow-primary/20"
                >
                    <Save className="w-4 h-4" /> Save Configuration
                </button>
            </div>
        </div>
    );
}
