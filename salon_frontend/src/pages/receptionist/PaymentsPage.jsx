import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Smartphone,
    Search,
    ShieldCheck,
    Plus,
    Clock,
    CheckCircle2,
    ArrowRight,
    DollarSign,
    Zap,
    QrCode,
    Wallet,
    ArrowLeftRight,
    History,
    Receipt,
    CheckCircle,
    X,
    User,
    Phone,
    Loader2
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import mockApi from '../../services/mock/mockApi';
import { useAuth } from '../../contexts/AuthContext';

export default function PaymentsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [paymentFeed, setPaymentFeed] = useState([]);
    const [services, setServices] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('UPI');
    const [processing, setProcessing] = useState(false);
    const [isQuickBillOpen, setIsQuickBillOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Fetch live data
    const fetchData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const [invoiceRes, serviceRes, staffRes] = await Promise.all([
                mockApi.get(`/invoices?date=today&outletId=${user?.outletId || ''}`),
                mockApi.get('/services?limit=100'),
                mockApi.get(`/users?role=stylist&outletId=${user?.outletId}`)
            ]);

            console.log('[TERMINAL] Raw Results:', invoiceRes.data.results);
            if (invoiceRes.data.results) {
                setPaymentFeed(invoiceRes.data.results.map(inv => ({
                    id: inv.invoiceNumber || inv._id.slice(-8).toUpperCase(),
                    client: inv.clientId?.name || 'Walk-in Guest',
                    amount: `₹${Math.round(inv.total)}`,
                    time: new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    method: inv.paymentMethod || 'Cash',
                    status: inv.paymentStatus === 'paid' ? 'Success' : 'Pending',
                    total: inv.total,
                    _id: inv._id,
                    _originalId: inv._id
                })));
            }

            if (serviceRes.data.results) {
                setServices(serviceRes.data.results);
            }

            if (staffRes.data.results) {
                setStylists(staffRes.data.results.filter(s => s.role === 'stylist'));
            }
        } catch (err) {
            console.error('Terminal Data Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            console.log('[TERMINAL] User Context:', user);
            fetchData();
            const interval = setInterval(fetchData, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const filteredPayments = paymentFeed.filter(p =>
        p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [isOpeningRegister, setIsOpeningRegister] = useState(false);

    const handleOpenRegister = () => {
        setIsOpeningRegister(true);
        setTimeout(() => {
            setIsOpeningRegister(false);
            alert('Cash Register Manual Override: Hardware Drawer Popped.');
        }, 1000);
    };

    const handleHoldInvoice = () => {
        alert('Invoice protocol PAUSED. Record moved to temporary storage hub.');
    };


    const handleQuickBill = async (data) => {
        setProcessing(true);
        try {
            // 1. Ensure Client exists
            let clientId;
            const clientRes = await mockApi.get(`/client?phone=${data.phone}`);
            if (clientRes.data.results && clientRes.data.results.length > 0) {
                clientId = clientRes.data.results[0]._id;
            } else {
                const newClient = await mockApi.post('/client', {
                    name: data.name || 'Quick Guest',
                    phone: data.phone,
                    tenantId: user?.tenantId
                });
                clientId = newClient.data._id;
            }

            // 2. Process Checkout
            const checkoutData = {
                clientId,
                outletId: user?.outletId,
                paymentMethod: 'cash',
                items: [{
                    type: 'service',
                    itemId: data.serviceId,
                    name: services.find(s => s._id === data.serviceId)?.name || 'General Service',
                    price: parseFloat(data.amount),
                    quantity: 1,
                    stylistId: data.stylistId
                }],
                tax: 0,
                discount: 0,
                performedBy: user?._id
            };

            await mockApi.post('/pos/checkout', checkoutData);
            
            setIsQuickBillOpen(false);
            alert('Quick bill finalized and invoice generated.');
            fetchData();
        } catch (err) {
            console.error('Quick Bill Error:', err);
            alert('Error processing quick bill. Please check client data and amount.');
        } finally {
            setProcessing(false);
        }
    };

    const handleSettlement = async () => {
        if (!selectedInvoice) {
            alert('Selection Required: Please select an invoice from the Active Feed first.');
            return;
        }

        setProcessing(true);
        try {
            const methodMap = {
                'UPI': 'online',
                'Card': 'card',
                'Cash': 'cash',
                'Ref': 'refund'
            };

            await mockApi.patch(`/invoices/${selectedInvoice._id}/settle`, {
                paymentMethod: methodMap[selectedMethod] || 'cash'
            });

            alert(`Settlement Protocol Complete. Invoice #${selectedInvoice.invoiceNumber || selectedInvoice.id} marked as PAID via ${selectedMethod}.`);
            setSelectedInvoice(null);
            fetchData();
        } catch (err) {
            console.error('Settlement Error:', err);
            const msg = err.response?.data?.message || err.message;
            alert(`Error: ${msg}`);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Terminal Interface</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Transactional feed & gateway control</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsQuickBillOpen(true)}
                        className="px-5 py-2.5 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all flex items-center gap-2"
                    >
                        Quick Bill
                    </button>
                    <button
                        onClick={handleOpenRegister}
                        disabled={isOpeningRegister}
                        className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isOpeningRegister ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Open Register
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'UPI', icon: QrCode, label: 'Digital UPI' },
                            { id: 'Card', icon: CreditCard, label: 'POS Terminal' },
                            { id: 'Cash', icon: Wallet, label: 'Cash Entry' },
                            { id: 'Ref', icon: ArrowLeftRight, label: 'Refund/Adj' }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`p-6 border flex flex-col items-center gap-3 transition-all ${selectedMethod === method.id ? 'bg-primary border-primary text-white' : 'bg-surface border-border text-text-muted hover:border-primary/20 hover:bg-surface-alt'
                                    }`}
                            >
                                <method.icon className="w-6 h-6" />
                                <span className="text-[9px] font-black uppercase tracking-widest">{method.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Transaction Feed */}
                    <div className="bg-surface border border-border">
                        <div className="px-6 py-4 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" /> Active Feed
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="FIND TRANSACTION..."
                                    className="pl-9 pr-4 py-1.5 bg-surface-alt border border-border text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 w-48"
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-border">
                            {filteredPayments.map((payment) => (
                                <button 
                                    key={payment.id} 
                                    onClick={() => setSelectedInvoice(paymentFeed.find(p => p.id === payment.id && p._originalId))}
                                    className={`w-full px-6 py-4 flex items-center justify-between hover:bg-surface-alt/30 transition-all group ${selectedInvoice?._id === (paymentFeed.find(p => p.id === payment.id)?._originalId) ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 border border-border bg-surface-alt flex items-center justify-center">
                                            <Receipt className="w-4 h-4 text-text-muted" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black text-text uppercase tracking-tight">{payment.client}</p>
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{payment.time} • Transaction {payment.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-text uppercase tracking-tight">{payment.amount}</p>
                                            <p className="text-[9px] font-black text-primary uppercase tracking-widest">{payment.method}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase border ${payment.status === 'Success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Settlement Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface border border-border p-8 space-y-8 relative overflow-hidden group transition-all hover:border-primary/20">
                        {/* Soft Glow */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="border-b border-border pb-6 relative z-10">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-[0.2em] leading-none">Settlement Summary</h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between text-[11px] font-black text-text-muted uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-text">₹{selectedInvoice ? Math.round(selectedInvoice.total / 1.18) : '0'}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-black text-text-muted uppercase tracking-widest">
                                <span>Tax (GST 18%)</span>
                                <span className="text-text">₹{selectedInvoice ? Math.round(selectedInvoice.total - (selectedInvoice.total / 1.18)) : '0'}</span>
                            </div>
                            <div className="pt-6 border-t border-border flex justify-between items-center group-hover:border-primary/20 transition-colors">
                                <span className="text-[12px] font-black text-text uppercase tracking-widest">Net Payable</span>
                                <span className="text-2xl font-black text-primary">₹{selectedInvoice ? Math.round(selectedInvoice.total) : '0'}</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 relative z-10">
                            <button
                                onClick={handleSettlement}
                                disabled={processing || !selectedInvoice || selectedInvoice.status === 'Success'}
                                className="w-full py-4 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                <CheckCircle className="w-5 h-5" /> 
                                {processing ? 'AUTHORIZING...' : (selectedInvoice?.status === 'Success' ? 'ALREADY SETTLED' : 'FINAL SETTLEMENT')}
                            </button>
                            <button
                                onClick={handleHoldInvoice}
                                className="w-full py-4 border border-border text-text-muted text-[11px] font-black uppercase tracking-[0.2em] hover:bg-surface-alt transition-all"
                            >
                                HOLD INVOICE
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-surface-alt border border-border group hover:bg-surface transition-all">
                        <h4 className="text-[10px] font-black text-text uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" /> Gateway Sentinel
                        </h4>
                        <div className="space-y-2.5 opacity-60">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-mono">
                                    [17:14:02] Gateway Ping: OK
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full" />
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-mono">
                                    [17:14:05] Terminal ID: #TR-88A
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modals Interface */}
            {isQuickBillOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-lg relative animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" /> QUICK BILLING OVERRIDE
                            </h3>
                            <button onClick={() => setIsQuickBillOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <div className="p-8 space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Client Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                        <input type="text" id="qbName" autoFocus placeholder="GUEST NAME" className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border text-xs font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                        <input type="tel" id="qbPhone" placeholder="REQUIRED" className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border text-xs font-black tracking-tight outline-none focus:ring-1 focus:ring-primary/20" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Service</label>
                                    <select id="qbService" className="w-full px-4 py-2.5 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20">
                                        {services.map(s => <option key={s._id} value={s._id}>{s.name} - ₹{s.price}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Amount</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input type="number" id="qbAmount" placeholder="0.00" className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border text-xs font-black tracking-tight outline-none focus:ring-1 focus:ring-primary/20 font-mono" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Assigned Stylist</label>
                                <select id="qbStylist" className="w-full px-4 py-2.5 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20">
                                    <option value="">SELECT STYLIST</option>
                                    {stylists.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="pt-4 border-t border-border flex gap-4">
                                <button onClick={() => setIsQuickBillOpen(false)} className="flex-1 py-3 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all">CANCEL</button>
                                <button
                                    onClick={() => handleQuickBill({
                                        name: document.getElementById('qbName').value,
                                        phone: document.getElementById('qbPhone').value,
                                        serviceId: document.getElementById('qbService').value,
                                        stylistId: document.getElementById('qbStylist').value,
                                        amount: document.getElementById('qbAmount').value
                                    })}
                                    disabled={processing}
                                    className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} LEGALIZE BILL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
