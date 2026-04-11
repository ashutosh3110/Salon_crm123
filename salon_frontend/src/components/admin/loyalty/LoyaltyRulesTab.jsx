import { useState, useEffect } from 'react';
import { Save, RefreshCcw, Info, Zap } from 'lucide-react';
import api from '../../../services/api';
import { motion } from 'framer-motion';

export default function LoyaltyRulesTab() {
    const [rules, setRules] = useState({
        pointsRate: 100,
        redeemValue: 1,
        minRedeemPoints: 0,
        maxPointsPerOrder: 0,
        expiryDays: 365,
        active: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const { data } = await api.get('/loyalty/settings');
                if (data.success && data.data) {
                    setRules(data.data);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRules();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                pointsRate: Number(rules.pointsRate || 100),
                redeemValue: Number(rules.redeemValue || 1),
                minRedeemPoints: Number(rules.minRedeemPoints || 0),
                maxPointsPerOrder: Number(rules.maxPointsPerOrder || 0),
                expiryDays: Number(rules.expiryDays || 365),
                active: !!rules.active,
            };
            await api.put('/loyalty/settings', payload);
            alert('Loyalty Rules Saved Successfully!');
        } catch (err) {
            alert('Error saving settings: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Loading loyalty settings...</p>
        </div>
    );

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface p-8 border border-border/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-24 h-24 text-primary" />
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-primary" />
                        <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">How Customers Earn Points</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                        <RuleInput
                            label="Rupees Per Point"
                            sub="User gets 1 point for every X rupees spent"
                            value={rules.pointsRate}
                            onChange={v => setRules({ ...rules, pointsRate: parseFloat(v) })}
                        />
                        <RuleInput
                            label="Value of 1 Point (₹)"
                            sub="1 point is worth this much when redeeming"
                            value={rules.redeemValue}
                            onChange={v => setRules({ ...rules, redeemValue: parseFloat(v) })}
                        />
                        <RuleInput
                            label="Minimum Points to Redeem"
                            sub="Customer needs at least these points to use them"
                            value={rules.minRedeemPoints}
                            onChange={v => setRules({ ...rules, minRedeemPoints: parseInt(v) })}
                        />
                    </div>
                </div>


            </div>

            <div className="space-y-6">
                <div className="bg-primary p-8 border border-white/10 shadow-2xl shadow-primary/20">
                    <h3 className="text-sm font-black text-white/80 uppercase tracking-widest mb-6 border-b border-white/20 pb-2">Current Summary</h3>
                    <div className="space-y-4">
                        <SummaryItem label="Points on ₹1000 bill" value={`+${Math.floor(1000 / rules.pointsRate)} PTS`} />
                        <SummaryItem label="Value of 500 points" value={`₹${(rules.redeemValue * 500).toFixed(0)}`} />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full mt-10 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                            <>Save Rules Configuration <Save className="w-4 h-4" /></>
                        )}
                    </button>
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
