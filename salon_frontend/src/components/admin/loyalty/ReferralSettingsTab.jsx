import { useState } from 'react';
import { Trophy, Star, Gift, Users, Save, Info, Zap, Share2 } from 'lucide-react';

export default function ReferralSettingsTab() {
    const [config, setConfig] = useState({
        enabled: true,
        referrerReward: 200,
        referredReward: 100,
        threshold: 'FIRST_SERVICE',
        expiryDays: 90
    });

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Master Switch */}
                <div className="bg-surface p-8 border border-border/40 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter leading-none">Referral Protocol</h2>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Growth orchestration engine</p>
                    </div>
                    <button
                        onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                        className={`px-10 py-4 font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all ${config.enabled
                            ? 'bg-primary text-white shadow-primary/20'
                            : 'bg-surface-alt text-text-muted border border-border/40'
                            }`}
                    >
                        {config.enabled ? 'PROTOCOL: ACTIVE' : 'PROTOCOL: SUSPENDED'}
                    </button>
                </div>

                {/* Reward Config */}
                <div className="bg-surface p-8 border border-border/40 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary" />
                        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Reward Distribution</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                        <SettingInput
                            label="Referrer Incentive"
                            sub="Points awarded to existing client"
                            value={config.referrerReward}
                            onChange={v => setConfig({ ...config, referrerReward: v })}
                            icon={<Trophy className="text-primary" size={16} />}
                        />
                        <SettingInput
                            label="Beneficiary Incentive"
                            sub="Points awarded to new client"
                            value={config.referredReward}
                            onChange={v => setConfig({ ...config, referredReward: v })}
                            icon={<Star className="text-primary" size={16} />}
                        />
                    </div>
                </div>

                {/* Logic Config */}
                <div className="bg-surface p-8 border border-border/40 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary" />
                        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Logic & Validation</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-foreground uppercase tracking-widest">Activation Milestone</label>
                            <div className="space-y-2">
                                {['FIRST_SERVICE', 'REGISTRATION', 'FIRST_INVOICE_MIN_1000'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setConfig({ ...config, threshold: m })}
                                        className={`w-full p-4 border text-[10px] font-black uppercase tracking-widest text-left transition-all ${config.threshold === m
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'border-border/40 text-text-muted hover:bg-white/5'
                                            }`}
                                    >
                                        {m.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <SettingInput
                            label="Reward Cycle Persistence"
                            sub="Days to claim after referral"
                            value={config.expiryDays}
                            onChange={v => setConfig({ ...config, expiryDays: v })}
                            icon={<Zap className="text-primary" size={16} />}
                        />
                    </div>
                </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
                <div className="bg-surface border border-border/40 p-8 space-y-8">
                    <h3 className="text-sm font-black text-text-muted uppercase tracking-widest">Growth Performance</h3>

                    <div className="space-y-6">
                        <StatItem label="Total Referrals" value="1,280" icon={<Users size={16} />} />
                        <StatItem label="Conversion Rate" value="64%" icon={<Share2 size={16} />} />
                        <StatItem label="Points Issued" value="256k" icon={<Gift size={16} />} />
                    </div>

                    <button
                        onClick={() => alert('Referral Calibration Saved')}
                        className="w-full py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                    >
                        Save Configuration <Save size={14} />
                    </button>
                </div>

                <div className="p-6 border border-border/40 bg-surface-alt/50 italic flex gap-4 text-xs text-text-muted leading-relaxed">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    Referral rewards are globally applied and only trigger once per unique client identity.
                </div>
            </div>
        </div>
    );
}

function SettingInput({ label, sub, value, onChange, icon }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">{label}</label>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-tight mt-1 opacity-70">{sub}</span>
                </div>
                {icon}
            </div>
            <input
                type="number"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full h-14 bg-surface-alt border border-border/60 px-5 text-xl font-black text-foreground focus:border-primary outline-none transition-all"
            />
        </div>
    );
}

function StatItem({ label, value, icon }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-muted">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-xl font-black text-foreground italic tracking-tighter">{value}</span>
        </div>
    );
}
