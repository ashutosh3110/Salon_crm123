import { useState, useEffect } from 'react';
import { Save, RefreshCcw, Info, Zap, AlertTriangle } from 'lucide-react';
import api from '../../../services/api';
import { motion } from 'framer-motion';

export default function LoyaltyRulesTab() {
    const [rules, setRules] = useState({
        earnRate: 1,
        redeemRate: 0.5,
        minimumRedemption: 100,
        maxEarnPerInvoice: 500,
        expiryDays: 365,
        isActive: true,
        referralBonus: 200
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const { data } = await api.get('/loyalty/rules');
                if (data.data || data) setRules(prev => ({ ...prev, ...(data.data || data) }));
            } catch (err) {
                console.error('Fetch error:', err);
                // Fallback to defaults if backend fails
            } finally {
                setLoading(false);
            }
        };
        fetchRules();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.post('/loyalty/rules', rules);
            alert('Loyalty Rules Saved Successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Configuration Sync Error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Deciphering Protocol...</p>
        </div>
    );

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Input Controls */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface p-8 border border-border/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-24 h-24 text-primary" />
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-primary" />
                        <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Earning Metrics</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                        <RuleInput
                            label="Earning Velocity"
                            sub="Points per ₹1 spent"
                            value={rules.earnRate}
                            onChange={v => setRules({ ...rules, earnRate: parseFloat(v) })}
                        />
                        <RuleInput
                            label="Redemption Value"
                            sub="₹ Value per 1 point"
                            value={rules.redeemRate}
                            onChange={v => setRules({ ...rules, redeemRate: parseFloat(v) })}
                        />
                        <RuleInput
                            label="Thermal Threshold"
                            sub="Min points to redeem"
                            value={rules.minimumRedemption}
                            onChange={v => setRules({ ...rules, minimumRedemption: parseInt(v) })}
                        />
                        <RuleInput
                            label="Saturation Cap"
                            sub="Max points per invoice"
                            value={rules.maxEarnPerInvoice}
                            onChange={v => setRules({ ...rules, maxEarnPerInvoice: parseInt(v) })}
                        />
                    </div>
                </div>

                <div className="bg-surface p-8 border border-border/40">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-primary" />
                        <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Temporal Dynamics</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                        <RuleInput
                            label="Persistence Cycle"
                            sub="Point validity in days"
                            value={rules.expiryDays}
                            onChange={v => setRules({ ...rules, expiryDays: parseInt(v) })}
                        />
                        <div className="flex flex-col justify-center">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Master Program Toggle</label>
                            <button
                                onClick={() => setRules({ ...rules, isActive: !rules.isActive })}
                                className={`px-6 py-3 font-black text-xs uppercase tracking-widest border transition-all ${rules.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                                    }`}
                            >
                                {rules.isActive ? 'Protocol: ONLINE' : 'Protocol: OFFLINE'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Summary & Action */}
            <div className="space-y-6">
                <div className="bg-primary p-8 border border-white/10 shadow-2xl shadow-primary/20">
                    <h3 className="text-sm font-black text-white/80 uppercase tracking-widest mb-6 border-b border-white/20 pb-2">Current Calibration</h3>
                    <div className="space-y-4">
                        <SummaryItem label="Points for ₹1000" value={`+${rules.earnRate * 1000} PTS`} />
                        <SummaryItem label="Value of 500 PTS" value={`₹${(rules.redeemRate * 500).toFixed(0)}`} />
                        <SummaryItem label="Expiry Cycle" value={`${rules.expiryDays} DAYS`} />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full mt-10 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                            <>SAVE CONFIGURATION <Save className="w-4 h-4" /></>
                        )}
                    </button>
                </div>

                <div className="p-6 border border-border/40 bg-surface-alt/50 italic flex gap-4">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-xs text-text-muted leading-relaxed">
                        Changes to these metrics will affect all transactions globally. Point values are rounded down to the nearest integer.
                    </p>
                </div>
            </div>
        </div>
    );
}

function RuleInput({ label, sub, value, onChange }) {
    return (
        <div className="space-y-2">
            <div className="flex flex-col">
                <label className="text-[10px] font-black text-foreground uppercase tracking-widest mb-0.5">{label}</label>
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-tight opacity-70">{sub}</span>
            </div>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-14 bg-surface-alt border border-border/60 px-5 text-lg font-black text-foreground focus:border-primary focus:bg-surface outline-none transition-all placeholder:text-text-muted/30 shadow-sm"
            />
        </div>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="flex justify-between items-end border-b border-white/10 pb-2">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{label}</span>
            <span className="text-xl font-black text-white italic tracking-tighter">{value}</span>
        </div>
    );
}
