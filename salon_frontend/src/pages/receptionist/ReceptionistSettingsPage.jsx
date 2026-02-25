import React, { useState } from 'react';
import {
    Settings,
    Bell,
    Shield,
    User,
    Monitor,
    Smartphone,
    ChevronRight,
    Lock,
    Eye,
    Globe,
    Printer,
    Database,
    X,
    Check
} from 'lucide-react';

const settingsSections = [
    { title: 'Personal Interface', icon: User, description: 'Manage your profile and display name.' },
    { title: 'Terminal Preferences', icon: Monitor, description: 'Customize dashboard alerts and live feed views.' },
    { title: 'Protocol Notifications', icon: Bell, description: 'Configure SMS and email arrival alerts.' },
    { title: 'Security & Access', icon: Shield, description: 'Update credential protocols and MFA.' },
    { title: 'Hardware Integration', icon: Printer, description: 'Thermal printer and card terminal settings.' },
    { title: 'System Logs', icon: Database, description: 'View recent session activity and audit trails.' },
];

export default function ReceptionistSettingsPage() {
    const [toggles, setToggles] = useState({
        autoPrint: true,
        smsAuth: false,
        showCommission: false
    });

    const [activeModal, setActiveModal] = useState(null);

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCategoryClick = (title) => {
        setActiveModal(title);
    };

    const handleSave = () => {
        alert(`${activeModal} protocols successfully synchronized with system core.`);
        setActiveModal(null);
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Terminal Config</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Personal & hardware system parameters</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest px-3 py-1 border border-border bg-surface-alt">Firmware v2.4.0-Stable</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {settingsSections.map((section, i) => (
                    <button
                        key={i}
                        onClick={() => handleCategoryClick(section.title)}
                        className="bg-surface border border-border p-6 flex items-start gap-4 hover:border-primary/40 transition-all text-left group"
                    >
                        <div className="w-12 h-12 bg-surface-alt border border-border flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                            <section.icon className="w-6 h-6 text-text-muted group-hover:text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-black text-text uppercase tracking-widest">{section.title}</h3>
                                <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                            <p className="text-[11px] text-text-muted font-bold mt-1 uppercase tracking-tight opacity-70 italic">{section.description}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Quick Toggle Settings */}
            <div className="bg-surface border border-border">
                <div className="px-6 py-4 border-b border-border bg-surface-alt/50">
                    <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Active Overrides</h3>
                </div>
                <div className="p-6 divide-y divide-border">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="text-sm font-black text-text uppercase tracking-tight">Auto-Print Invoices</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Generate paper copy immediately after settlement</p>
                        </div>
                        <div
                            onClick={() => handleToggle('autoPrint')}
                            className={`w-10 h-5 transition-colors duration-200 relative cursor-pointer ${toggles.autoPrint ? 'bg-primary' : 'bg-border'}`}
                        >
                            <div className={`absolute top-1 bottom-1 w-3 bg-white transition-all duration-200 ${toggles.autoPrint ? 'right-1' : 'left-1'}`} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="text-sm font-black text-text uppercase tracking-tight">SMS Notifications</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Notify clients when staff is ready</p>
                        </div>
                        <div
                            onClick={() => handleToggle('smsAuth')}
                            className={`w-10 h-5 transition-colors duration-200 relative cursor-pointer ${toggles.smsAuth ? 'bg-primary' : 'bg-border'}`}
                        >
                            <div className={`absolute top-1 bottom-1 w-3 bg-white transition-all duration-200 ${toggles.smsAuth ? 'right-1' : 'left-1'}`} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="text-sm font-black text-text uppercase tracking-tight">Show Staff Commission</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Display earnings on session completion</p>
                        </div>
                        <div
                            onClick={() => handleToggle('showCommission')}
                            className={`w-10 h-5 transition-colors duration-200 relative cursor-pointer ${toggles.showCommission ? 'bg-primary' : 'bg-border'}`}
                        >
                            <div className={`absolute top-1 bottom-1 w-3 bg-white transition-all duration-200 ${toggles.showCommission ? 'right-1' : 'left-1'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Details */}
            <div className="flex items-center justify-center p-8">
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Encrypted Session</span>
                    </div>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Your session is secured with end-to-end industry encryption protocols.</p>
                </div>
            </div>
            {/* Configuration Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-lg relative animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <Settings className="w-4 h-4 text-primary" /> {activeModal.toUpperCase()} CONFIGURATION
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-surface-alt transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            {activeModal === 'Personal Interface' && (
                                <div className="space-y-4 text-left">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Display Alias</label>
                                        <input type="text" defaultValue="Reception_Alpha" className="w-full px-4 py-3 bg-surface-alt border border-border text-sm font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Interface Language</label>
                                        <select className="w-full px-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                                            <option>English (Global Standard)</option>
                                            <option>Hindi (Localized Alpha)</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'Hardware Integration' && (
                                <div className="space-y-4 text-left">
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Printer className="w-5 h-5 text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase text-emerald-600">Thermal Printer Online</span>
                                        </div>
                                        <button className="text-[9px] font-black text-emerald-600 underline">TEST PRINT</button>
                                    </div>
                                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Monitor className="w-5 h-5 text-amber-500" />
                                            <span className="text-[10px] font-black uppercase text-amber-600">POS Gateway Delayed (24ms)</span>
                                        </div>
                                        <button className="text-[9px] font-black text-amber-600 underline">RE-SYNC</button>
                                    </div>
                                </div>
                            )}
                            {/* Generic placeholder for other categories */}
                            {!['Personal Interface', 'Hardware Integration'].includes(activeModal) && (
                                <div className="py-12 text-center space-y-4">
                                    <Database className="w-12 h-12 text-primary/20 mx-auto" />
                                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest">Standard parameters available for {activeModal}.</p>
                                </div>
                            )}

                            <div className="pt-6 border-t border-border flex gap-4">
                                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all">DISCARD</button>
                                <button onClick={handleSave} className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                    <Check className="w-4 h-4" /> AUTHORIZE SAVE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
