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

    const txTypeColors = { EARN: 'bg-green-50 text-green-600', REDEEM: 'bg-blue-50 text-blue-600', REVERSE: 'bg-red-50 text-red-600' };

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-text">Loyalty Program</h1><p className="text-sm text-text-secondary mt-1">Configure loyalty points rules and view transaction history.</p></div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Rules Config */}
                <div className="bg-white rounded-xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-5"><Gift className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-text">Loyalty Rules</h2></div>
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                    ) : (
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Earn Rate (pts per ₹ spent)</label><input type="number" step="0.1" value={rules.earnRate} onChange={(e) => setRules({ ...rules, earnRate: parseFloat(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Redeem Rate (₹ per point)</label><input type="number" step="0.1" value={rules.redeemRate} onChange={(e) => setRules({ ...rules, redeemRate: parseFloat(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Minimum Redemption (points)</label><input type="number" value={rules.minimumRedemption} onChange={(e) => setRules({ ...rules, minimumRedemption: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Max Earn Per Invoice (points)</label><input type="number" value={rules.maxEarnPerInvoice} onChange={(e) => setRules({ ...rules, maxEarnPerInvoice: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Expiry (days)</label><input type="number" value={rules.expiryDays} onChange={(e) => setRules({ ...rules, expiryDays: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-60">
                                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Rules</>}
                            </button>
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl border border-border">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-border"><ArrowDownUp className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-text">Recent Transactions</h2></div>
                    <div className="p-4 max-h-[500px] overflow-y-auto">
                        {transactions.length === 0 ? (
                            <div className="text-center py-10"><Star className="w-10 h-10 text-text-muted mx-auto mb-3" /><p className="text-sm text-text-secondary">No loyalty transactions yet</p></div>
                        ) : (
                            <div className="space-y-2">
                                {transactions.slice(0, 20).map((tx) => (
                                    <div key={tx._id} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                                        <div>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${txTypeColors[tx.type] || 'bg-gray-50 text-gray-500'}`}>{tx.type}</span>
                                            <p className="text-xs text-text-muted mt-1">{new Date(tx.createdAt).toLocaleString('en-IN')}</p>
                                        </div>
                                        <span className={`text-sm font-bold ${tx.type === 'EARN' ? 'text-green-600' : tx.type === 'REDEEM' ? 'text-blue-600' : 'text-red-500'}`}>
                                            {tx.type === 'EARN' ? '+' : '-'}{tx.points} pts
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
