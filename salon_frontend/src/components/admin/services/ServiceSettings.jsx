import React from 'react';
import {
    Settings,
    Percent,
    Clock,
    Lock,
    Save,
    CheckCircle2
} from 'lucide-react';

export default function ServiceSettings() {
    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Settings className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text">Service Global Settings</h2>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Configure default rules for all salon services</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Default GST */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between gap-6 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-border shrink-0">
                            <Percent className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-text">Default GST Rate</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">Applied automatically to new services</p>
                        </div>
                    </div>
                    <select className="px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold outline-none min-w-[120px]">
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18" selected>18%</option>
                        <option value="28">28%</option>
                    </select>
                </div>

                {/* Default Duration */}
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between gap-6 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-500 border border-border shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-text">Default Duration Unit</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">Base time unit for appointment blocks</p>
                        </div>
                    </div>
                    <select className="px-4 py-2.5 rounded-xl bg-slate-50 border border-border text-sm font-bold outline-none min-w-[120px]">
                        <option value="15">15 Minutes</option>
                        <option value="30" selected>30 Minutes</option>
                        <option value="45">45 Minutes</option>
                        <option value="60">60 Minutes</option>
                    </select>
                </div>

                {/* Price Edit Permission */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 flex items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 border border-white/20 shrink-0">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold">POS Price Override</h3>
                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-0.5 leading-tight">Allow staff to edit price during billing</p>
                        </div>
                    </div>
                    <div className="relative z-10 flex p-1 bg-white/5 rounded-xl border border-white/10">
                        <button className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all bg-white text-slate-900">Off</button>
                        <button className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all text-white/40 hover:text-white">On</button>
                    </div>
                    {/* decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-3xl pointer-events-none" />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4">
                <button
                    className="flex items-center gap-2 px-10 py-3.5 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all"
                >
                    <Save className="w-4 h-4" />
                    Save Rule Changes
                </button>
            </div>

            {/* Hint Box */}
            <div className="mt-6 flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-emerald-800 font-bold leading-relaxed uppercase tracking-widest opacity-70">
                    Rule changes will only apply to services created after the new settings are saved.
                    Existing services will maintain their current configuration.
                </p>
            </div>
        </div>
    );
}
