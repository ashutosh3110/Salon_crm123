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
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Terminal Configuration</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">Global logic parameters and auditing protocols</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 text-primary border border-primary/20 rounded-none text-[10px] font-black uppercase tracking-[0.2em]">
                    <ShieldCheck className="w-4 h-4" /> Root Authority Access
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tax & Invoicing */}
                <div className="bg-surface p-8 rounded-none border border-border shadow-sm space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-12 -mt-12 rounded-none rotate-45 pointer-events-none" />
                    <h3 className="text-sm font-black text-text uppercase tracking-widest flex items-center gap-3 border-b border-border pb-5">
                        <Percent className="w-4 h-4 text-primary" /> Fiscal Parameters
                    </h3>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-4 bg-surface-alt/50 border border-border">
                            <div>
                                <p className="text-[11px] font-black text-text uppercase tracking-widest">Automatic GST Calculation</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Global logic module for tax vectors</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, gstEnabled: !settings.gstEnabled })}
                                className={`w-14 h-7 rounded-none transition-all relative border border-border ${settings.gstEnabled ? 'bg-primary' : 'bg-surface-alt'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-none transition-all ${settings.gstEnabled ? 'left-8' : 'left-1'} shadow-sm`} />
                            </button>
                        </div>

                        {settings.gstEnabled && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">GST Vector (%)</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                    <input
                                        type="number"
                                        value={settings.gstPercentage}
                                        onChange={(e) => setSettings({ ...settings, gstPercentage: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 rounded-none border border-border bg-surface-alt text-[11px] font-black tracking-widest focus:ring-1 focus:ring-primary/40 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Invoicing Prefix</label>
                                <input
                                    type="text"
                                    value={settings.invoicePrefix}
                                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                                    className="w-full px-5 py-4 rounded-none border border-border bg-surface-alt text-[11px] font-black tracking-widest focus:ring-1 focus:ring-primary/40 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Sequence Start</label>
                                <input
                                    type="text"
                                    value={settings.invoiceStartNumber}
                                    onChange={(e) => setSettings({ ...settings, invoiceStartNumber: e.target.value })}
                                    className="w-full px-5 py-4 rounded-none border border-border bg-surface-alt text-[11px] font-black tracking-widest focus:ring-1 focus:ring-primary/40 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Discounts & Payments */}
                <div className="bg-surface p-8 rounded-none border border-border shadow-sm space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-12 -mt-12 rounded-none rotate-45 pointer-events-none" />
                    <h3 className="text-sm font-black text-text uppercase tracking-widest flex items-center gap-3 border-b border-border pb-5">
                        <Tag className="w-4 h-4 text-primary" /> Incentive Logic
                    </h3>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-black text-text uppercase tracking-widest">Max Authorized Override (%)</label>
                                <span className="text-[11px] font-black text-primary bg-primary/5 px-2 py-1 border border-primary/20">{settings.maxDiscount}% CAP</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="50" step="1"
                                value={settings.maxDiscount}
                                onChange={(e) => setSettings({ ...settings, maxDiscount: e.target.value })}
                                className="w-full accent-primary h-2 bg-surface-alt rounded-none appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[9px] font-black text-text-muted uppercase tracking-widest opacity-50">
                                <span>Zero Baseline</span>
                                <span>Peak Allocation (50%)</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-surface-alt/50 border border-border">
                            <div>
                                <p className="text-[11px] font-black text-text uppercase tracking-widest">Coupon Auth Module</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Enable secondary incentive input vectors</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, couponsEnabled: !settings.couponsEnabled })}
                                className={`w-14 h-7 rounded-none transition-all relative border border-border ${settings.couponsEnabled ? 'bg-primary' : 'bg-surface-alt'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-none transition-all ${settings.couponsEnabled ? 'left-8' : 'left-1'} shadow-sm`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-surface p-8 rounded-none border border-border shadow-sm space-y-8 lg:col-span-2">
                    <h3 className="text-sm font-black text-text uppercase tracking-widest flex items-center gap-3 border-b border-border pb-5">
                        <CreditCard className="w-4 h-4 text-primary" /> Inflow Vector Authorization
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {modes.map(mode => (
                            <button
                                key={mode}
                                onClick={() => handleToggleMode(mode)}
                                className={`px-8 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${settings.allowedModes.includes(mode)
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'bg-surface border-border text-text-muted hover:bg-surface-alt'
                                    }`}
                            >
                                {mode} MODULE
                            </button>
                        ))}
                    </div>
                </div>

                {/* Receipt Customization */}
                <div className="bg-surface p-8 rounded-none border border-border shadow-sm space-y-8 lg:col-span-2">
                    <h3 className="text-sm font-black text-text uppercase tracking-widest flex items-center gap-3 border-b border-border pb-5">
                        <FileText className="w-4 h-4 text-primary" /> Hardcopy Documentation Meta
                    </h3>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Transaction Ledger Footer Text</label>
                        <textarea
                            value={settings.footerText}
                            onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                            className="w-full h-24 px-5 py-4 rounded-none border border-border bg-surface-alt text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary/40 outline-none transition-all resize-none shadow-inner"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-none flex items-start gap-5">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                <div>
                    <p className="text-[11px] font-black text-red-800 uppercase tracking-widest">CRITICAL: NETWORK-WIDE SYNC</p>
                    <p className="text-[10px] text-red-700/70 leading-relaxed uppercase tracking-wider mt-1">Committing these parameters will immediately broadcast configuration updates to all active terminal nodes. Verify compliance metrics before execution.</p>
                </div>
            </div>

            <div className="flex justify-end gap-4 p-8 bg-surface-alt/30 border-t border-border">
                <button className="px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt transition-all">FACTORY RESET</button>
                <button
                    onClick={() => alert('Configuration broadcast successful!')}
                    className="flex items-center gap-4 px-12 py-4 bg-primary text-white rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all transform hover:-translate-y-1"
                >
                    <Save className="w-4 h-4" /> Commit System Params
                </button>
            </div>
        </div>
    );
}
