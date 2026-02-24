import { Settings, ShieldAlert, Cpu, Receipt, Printer, CreditCard } from 'lucide-react';

export default function POSSettingsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-black text-text tracking-tight uppercase">Terminal Settings</h1>
                <p className="text-sm text-text-secondary mt-1 font-medium italic">Configure hardware and terminal-specific workflows.</p>
            </div>

            {/* Premium Maintenance Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-none p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <div className="w-16 h-16 bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-sm font-black text-primary uppercase tracking-widest">Configuration module Restricted</p>
                    <p className="text-xs text-text-secondary mt-1 max-w-lg font-bold">Only administrators can modify terminal settings. Terminal #POS-01 (Main Reception) is currently locked with default profiles. Please contact your system provider for hardware integration keys.</p>
                </div>
                <button className="ml-auto px-6 py-2 bg-text text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90">Unlock Profile</button>
            </div>

            {/* System Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Printer Status', status: 'Offline', color: 'text-rose-500', icon: Printer },
                    { label: 'Scanner API', status: 'Ready', color: 'text-emerald-500', icon: Cpu },
                    { label: 'Cloud Sync', status: 'Active', color: 'text-emerald-500', icon: Receipt },
                    { label: 'EDC Link', status: 'Warning', color: 'text-amber-500', icon: CreditCard },
                ].map((s, i) => (
                    <div key={i} className="bg-surface border border-border p-4 flex flex-col items-center justify-center text-center space-y-2">
                        <s.icon className={`w-6 h-6 ${s.color}`} />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{s.label}</p>
                        <p className={`text-xs font-black ${s.color} uppercase`}>{s.status}</p>
                    </div>
                ))}
            </div>

            {/* Placeholder Config Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { title: 'Tax & Compliance', desc: 'Manage GST slabs and service-level tax overrides for automated billing.' },
                    { title: 'Invoice Identity', desc: 'Set custom invoice prefixes, logos, and T&C footers for thermal printouts.' },
                    { title: 'Terminal Hardware', desc: 'Direct thermal/laser printer drivers and barcode scanner baud rate config.' },
                    { title: 'Redemption Flow', desc: 'Configure maximum loyalty redemptions and manual discount caps for staff.' },
                ].map((item, i) => (
                    <div key={i} className="bg-surface rounded-none border border-border p-6 hover:border-primary transition-all relative group overflow-hidden">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-background border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                <Settings className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-black text-text uppercase tracking-tight">{item.title}</h3>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed font-bold">{item.desc}</p>
                        <div className="mt-6 flex items-center gap-2 text-primary">
                            <div className="w-1 h-1 bg-primary"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:underline">Configure Access</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
