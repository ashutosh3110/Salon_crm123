import { useState, useEffect } from 'react';
import {
    RefreshCcw,
    CheckCircle2,
    XCircle,
    MessageSquare,
    AlertCircle,
    Eye
} from 'lucide-react';
import mockApi from '../../../services/mock/mockApi';

export default function POSRefundsPage() {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [remark, setRemark] = useState('');

    useEffect(() => {
        const fetchRefunds = async () => {
            try {
                setLoading(true);
                const res = await mockApi.get('/invoices'); 
                const list = res?.data?.results || res?.data?.data?.results || [];
                const simulatedRefunds = list.slice(0, 2).map((inv, i) => ({
                    id: `REF-00${i+1}`,
                    inv: inv.invoiceNumber,
                    customer: inv.clientId?.name || 'Walk-in Entity',
                    amount: `₹${inv.total}`,
                    reason: i === 0 ? 'Service Quality Issues' : 'Double Transmission Auth',
                    status: i === 0 ? 'Pending' : 'Approved',
                    requestedAt: new Date().toLocaleDateString()
                }));
                setRefunds(simulatedRefunds);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRefunds();
    }, []);

    const handleAction = (status) => {
        alert(`Refund ${selectedRefund.id} ${status} with remark: ${remark}`);
        setRefunds(prev => prev.map(r => r.id === selectedRefund.id ? { ...r, status } : r));
        setSelectedRefund(null);
        setRemark('');
    };

    if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-text-muted italic">Syncing Protocol...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-[1400px] mx-auto text-left">
            <div className="text-left font-black">
                <h1 className="text-2xl font-black text-text uppercase tracking-tight italic">reversal protocols</h1>
                <p className="text-[10px] text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">Revenue Reversal & Protocol Override Logs [OFFLINE MODE]</p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-6 flex items-center gap-5">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <div className="text-left font-black">
                    <p className="text-[10px] text-amber-800 uppercase tracking-widest">System Status: Independent</p>
                    <p className="text-[10px] text-amber-700/70 mt-1 uppercase tracking-wider italic">Financial reversals are currently handled by the local verification node.</p>
                </div>
            </div>

            <div className="bg-white border border-border overflow-hidden text-left shadow-sm">
                <div className="overflow-x-auto text-left">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-alt/50 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border">
                                <th className="px-8 py-5">REFUND-ID</th>
                                <th className="px-8 py-5">INVOICE-LINK</th>
                                <th className="px-8 py-5">TARGET-ENTITY</th>
                                <th className="px-8 py-5">CLAIM-RATIONALE</th>
                                <th className="px-8 py-5 text-right">CREDIT-VALUE</th>
                                <th className="px-8 py-5">STATUS</th>
                                <th className="px-8 py-5 text-right">OPERATIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-left">
                            {refunds.map((ref) => (
                                <tr key={ref.id} className="hover:bg-surface-alt transition-all text-sm group text-left">
                                    <td className="px-8 py-5 font-black text-text uppercase italic">{ref.id}</td>
                                    <td className="px-8 py-5 text-primary font-black uppercase italic tracking-widest">{ref.inv}</td>
                                    <td className="px-8 py-5 font-black text-text uppercase">{ref.customer}</td>
                                    <td className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-tight">"{ref.reason}"</td>
                                    <td className="px-8 py-5 text-right font-black text-rose-600 tracking-tighter">{ref.amount}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2 py-1 text-[9px] font-black uppercase border italic ${ref.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {ref.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {ref.status === 'Pending' ? (
                                            <button onClick={() => setSelectedRefund(ref)} className="px-5 py-2.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
                                                AUTHORIZE
                                            </button>
                                        ) : (
                                            <button className="p-2 opacity-20"><Eye className="w-4 h-4 text-text-muted" /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRefund && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-left" onClick={() => setSelectedRefund(null)}>
                    <div className="bg-white border border-border w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 text-left" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start border-b border-border pb-6 italic text-left">
                            <h3 className="text-xl font-black text-text uppercase tracking-widest">Protocol Override</h3>
                            <button onClick={() => setSelectedRefund(null)} className="p-2 hover:bg-rose-500 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4 py-8 text-left">
                            <div className="flex justify-between text-xs font-black uppercase italic">
                                <span className="text-text-muted">Target ID</span>
                                <span className="text-text">{selectedRefund.id}</span>
                            </div>
                            <div className="flex justify-between text-xs font-black uppercase italic">
                                <span className="text-text-muted">Origin Doc</span>
                                <span className="text-primary">{selectedRefund.inv}</span>
                            </div>
                            <div className="bg-surface-alt p-6 border border-dashed border-border mt-4 text-left">
                                <p className="text-[10px] font-black text-text-muted uppercase mb-2">Claimed Reversal Sum</p>
                                <p className="text-3xl font-black text-rose-600 tracking-tighter italic">{selectedRefund.amount}</p>
                            </div>
                        </div>
                        <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Documentation required for override auth..." className="w-full h-32 p-5 border border-border bg-surface-alt text-[10px] font-black uppercase italic outline-none focus:border-primary shadow-inner mb-8 resize-none" />
                        <div className="flex gap-4">
                            <button onClick={() => handleAction('Approved')} className="flex-1 py-4 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110">Execute Auth</button>
                            <button onClick={() => handleAction('Rejected')} className="flex-1 py-4 bg-rose-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110">Deny Reversal</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
