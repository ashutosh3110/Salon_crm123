import { useState, useEffect } from 'react';
import { Gift, Star, ArrowDownUp, Save } from 'lucide-react';
import api from '../../services/api';

export default function LoyaltyPage() {
    const [rules, setRules] = useState({ earnRate: 1, redeemRate: 0.5, minimumRedemption: 100, maxEarnPerInvoice: 500, expiryDays: 365 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [transactions, setTransactions] = useState([]);

    const fetchRules = async () => {
        try {
            const { data } = await api.get('/loyalty/rules');
            if (data.data || data) setRules(data.data || data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/loyalty/transactions');
            setTransactions(data.data || data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchRules(); fetchTransactions(); }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put('/loyalty/rules', rules);
            alert('Loyalty rules updated!');
        } catch (err) { alert(err.response?.data?.message || 'Error saving'); }
        finally { setSaving(false); }
    };

    const txTypeColors = { EARN: 'bg-emerald-500/10 text-emerald-500', REDEEM: 'bg-primary/10 text-primary', REVERSE: 'bg-rose-500/10 text-rose-500' };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-text tracking-tight uppercase">Loyalty Program</h1>
                <p className="text-sm text-text-muted font-medium mt-1">Configure loyalty points rules and view transaction history.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Rules Config */}
                <div className="bg-surface rounded-none border border-border p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                        <Gift className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Protocol Rules</h2>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Earn Rate (pts per ₹ spent)</label>
                                    <input type="number" step="0.1" value={rules.earnRate} onChange={(e) => setRules({ ...rules, earnRate: parseFloat(e.target.value) })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Redeem Rate (₹ per point)</label>
                                    <input type="number" step="0.1" value={rules.redeemRate} onChange={(e) => setRules({ ...rules, redeemRate: parseFloat(e.target.value) })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Min Redemption (pts)</label>
                                    <input type="number" value={rules.minimumRedemption} onChange={(e) => setRules({ ...rules, minimumRedemption: parseInt(e.target.value) })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Max Earn / Invoice</label>
                                    <input type="number" value={rules.maxEarnPerInvoice} onChange={(e) => setRules({ ...rules, maxEarnPerInvoice: parseInt(e.target.value) })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Point Expiry (Days Count)</label>
                                <input type="number" value={rules.expiryDays} onChange={(e) => setRules({ ...rules, expiryDays: parseInt(e.target.value) })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                            </div>
                            <button onClick={handleSave} disabled={saving} className="w-full py-4.5 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all disabled:opacity-60">
                                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-none animate-spin" /> : <><Save className="w-4 h-4" /> Deploy Configuration</>}
                            </button>
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-8 py-4 border-b border-border bg-surface-alt">
                        <ArrowDownUp className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Master Log</h2>
                    </div>
                    <div className="p-4 max-h-[500px] overflow-y-auto">
                        {transactions.length === 0 ? (
                            <div className="text-center py-10"><Star className="w-10 h-10 text-text-muted mx-auto mb-3" /><p className="text-sm text-text-secondary">No loyalty transactions yet</p></div>
                        ) : (
                            <div className="space-y-2">
                                {transactions.slice(0, 20).map((tx) => (
                                    <div key={tx._id} className="flex items-center justify-between p-4 border border-border/40 rounded-none bg-surface-alt/30 hover:bg-surface-alt transition-colors group">
                                        <div>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest mb-1 inline-block ${txTypeColors[tx.type] || 'bg-gray-50 text-gray-500'}`}>{tx.type}</span>
                                            <p className="text-[10px] text-text-muted font-bold tracking-tight">{new Date(tx.createdAt).toLocaleString('en-IN')}</p>
                                        </div>
                                        <span className={`text-base font-black tracking-tight ${tx.type === 'EARN' ? 'text-emerald-500' : tx.type === 'REDEEM' ? 'text-primary' : 'text-rose-500'}`}>
                                            {tx.type === 'EARN' ? '+' : '-'}{tx.points} <span className="text-[10px] uppercase font-bold text-text-muted">pts</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
