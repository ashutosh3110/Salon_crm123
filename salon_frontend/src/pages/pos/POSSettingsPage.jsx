import { Settings, ShieldAlert, Cpu, Receipt, Printer, CreditCard } from 'lucide-react';

export default function POSSettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">System Core Configuration</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-none bg-primary animate-pulse" />
                        Active Session: POS-PRML-01 • Kernel Version: 2.1.0-STABLE
                    </p>
                </div>
            </div>

            {/* Premium Maintenance Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-none p-8 flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"></div>
                <div className="w-20 h-20 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-10 h-10" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Module Guard: TERMINAL_LOCK</p>
                        <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black animate-pulse">SECURE_CHANNEL</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed font-bold uppercase tracking-tight max-w-2xl opacity-80">
                        Advanced hardware parameters and kernel-level billing overrides are restricted to administrative entities.
                        Peripheral #POS-HUB-01 is synchronized with default commerce protocols. Manual override requires Level-5 authentication keys.
                    </p>
                </div>
                <button className="px-8 py-4 bg-text text-background text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all active:scale-95 shadow-xl">Request_Auth_Keys</button>
            </div>

            {/* System Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Thermal Engine', status: 'Offline', color: 'text-rose-500', icon: Printer, protocol: 'LPT1' },
                    { label: 'Optic API', status: 'Active', color: 'text-emerald-500', icon: Cpu, protocol: 'HID' },
                    { label: 'Cloud Stream', status: 'Synchronized', color: 'text-emerald-500', icon: Receipt, protocol: 'HTTPS' },
                    { label: 'EDC Terminal', status: 'Handshake_Err', color: 'text-amber-500', icon: CreditCard, protocol: 'USB' },
                ].map((s, i) => (
                    <div key={i} className="bg-surface border border-border p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm hover:border-primary/40 transition-all relative group">
                        <div className="absolute top-2 right-2 text-[8px] font-black text-text-muted/30 group-hover:text-primary/50 transition-colors uppercase tracking-widest">{s.protocol}</div>
                        <div className={`p-4 bg-surface-alt border border-border ${s.color} group-hover:scale-110 transition-transform`}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{s.label}</p>
                            <p className={`text-xs font-black ${s.color} uppercase tracking-widest flex items-center justify-center gap-2`}>
                                <div className={`w-1 h-1 rounded-none bg-current ${s.status === 'Active' || s.status === 'Synchronized' ? 'animate-pulse' : ''}`} />
                                {s.status}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder Config Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { title: 'Taxation_Core', desc: 'Manage GST slabs, localized surcharges, and service-level financial overrides.', node: 'NODE_FIN_01' },
                    { title: 'Identity_Assets', desc: 'Kernel-level invoice prefix management, thermal-optimized logos, and T&C footers.', node: 'NODE_ID_02' },
                    { title: 'Hardware_I/O', desc: 'Direct thermal driver configuration, barcode baud rates, and cash-drawer pulse width.', node: 'NODE_HW_03' },
                    { title: 'Redemption_Log', desc: 'Security protocols for loyalty point burning, manual discount caps, and staff override logic.', node: 'NODE_SEC_04' },
                ].map((item, i) => (
                    <div key={i} className="bg-surface rounded-none border border-border p-8 hover:border-primary/40 transition-all relative group overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rotate-45 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-14 h-14 bg-surface-alt border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all shadow-sm">
                                <Settings className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-text uppercase tracking-tight">{item.title}</h3>
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mt-1">{item.node}</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed font-bold uppercase tracking-tight opacity-70 flex-1">{item.desc}</p>
                        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                            <div className="flex items-center gap-2 text-primary">
                                <div className="w-1.5 h-1.5 bg-primary animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Module_Locked</span>
                            </div>
                            <button className="text-[10px] font-black text-text uppercase tracking-widest hover:text-primary transition-colors underline decoration-border underline-offset-8">Elevate Access</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
