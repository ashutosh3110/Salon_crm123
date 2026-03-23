import React, { useEffect, useState } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Download,
    TrendingUp,
    ShieldAlert,
    Star,
    ChevronRight,
    Tag,
    Trash2,
    DollarSign,
    Cake,
    Calendar,
    MapPin,
    FileText,
    Layers,
    MessageSquare,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle,
    Send,
    Percent,
    TrendingDown,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomerProfileModal from '../../components/admin/CustomerProfileModal';
import SegmentManager from '../../components/admin/customers/SegmentManager';
import FeedbackList from '../../components/admin/customers/FeedbackList';
import ReEngagementTool from '../../components/admin/customers/ReEngagementTool';
import { useWallet } from '../../contexts/WalletContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { maskPhone } from '../../utils/phoneUtils';

export default function CustomersPage({ tab = 'directory' }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { customers, addCustomer, deleteCustomer } = useBusiness();
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [whatsappModal, setWhatsappModal] = useState({ isOpen: false, customer: null, message: '' });
    const [newCustomerForm, setNewCustomerForm] = useState({
        name: '',
        phone: '',
        preferred: 'Haircut',
        dob: '',
        anniversary: '',
        address: '',
        remarks: '',
        category: 'Regular'
    });

    const activeTab = tab;

    const handleAddCustomer = (e) => {
        e.preventDefault();
        addCustomer({
            ...newCustomerForm,
            totalVisits: 0,
            spend: 0,
            status: 'Regular',
            tags: [],
            lastVisit: new Date().toISOString()
        });
        setNewCustomerForm({ name: '', phone: '', preferred: 'Haircut', dob: '', anniversary: '', address: '', remarks: '', category: 'Regular' });
        setShowAddModal(false);
    };

    const handleExport = () => {
        const data = customers.map(c => `${c.name},${c.phone},${c.totalVisits},${c.spend},${c.status}`).join('\n');
        const blob = new Blob([`Name,Phone,Visits,Spend,Status\n${data}`], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customer_database.csv';
        a.click();
    };

    return (
        <>
            <div className="space-y-6 animate-reveal">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-text uppercase tracking-tight leading-none">Customers</h1>
                        <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">Manage your customers, wallets, feedback and re-engagement</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-surface border border-border px-8 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt hover:text-primary transition-all font-black shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export List
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-primary text-primary-foreground border border-primary px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all font-black"
                        >
                            <UserPlus className="w-4 h-4" /> Add Customer
                        </button>
                    </div>
                </div>

                {/* Celebration Reminders */}
                <CelebrationReminders
                    customers={customers}
                    onSendWhatsApp={(c, msg) => setWhatsappModal({ isOpen: true, customer: c, message: msg })}
                />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard title="Total Customers" value={customers.length} icon={Users} color="blue" trend="" />
                    <KPICard
                        title="VIP Customers"
                        value={customers.filter(c => (c.tags || []).includes('VIP')).length}
                        icon={Star}
                        color="purple"
                        trend=""
                    />
                    <KPICard title="Total Revenue" value={`₹${customers.reduce((acc, c) => acc + c.spend, 0).toLocaleString()}`} icon={TrendingUp} color="green" trend="" />
                    <KPICard title="Inactive" value={customers.filter(c => c.status === 'Inactive').length} icon={ShieldAlert} color="red" trend="Needs attention" />
                </div>

                {/* Content Container */}
                <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[600px]">
                    <div className="flex border-b border-border bg-surface-alt/30 overflow-x-auto no-scrollbar">
                        <button onClick={() => navigate('/admin/crm/customers')} className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-r border-border transition-all whitespace-nowrap relative ${activeTab === 'directory' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'}`}>
                            Directory
                            {activeTab === 'directory' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <button onClick={() => navigate('/admin/crm/wallets')} className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-r border-border transition-all whitespace-nowrap relative ${activeTab === 'wallets' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'}`}>
                            Wallets
                            {activeTab === 'wallets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <button onClick={() => navigate('/admin/crm/segments')} className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-r border-border transition-all whitespace-nowrap relative ${activeTab === 'segments' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'}`}>
                            Segments
                            {activeTab === 'segments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <button onClick={() => navigate('/admin/crm/feedback')} className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-r border-border transition-all whitespace-nowrap relative ${activeTab === 'feedback' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'}`}>
                            Feedback
                            {activeTab === 'feedback' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <button onClick={() => navigate('/admin/crm/reengage')} className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-border transition-all whitespace-nowrap relative ${activeTab === 'reengage' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'}`}>
                            Re-engage
                            {activeTab === 'reengage' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                    </div>

                    {activeTab === 'directory' && (
                        <CustomerDirectory
                            customers={customers}
                            onCustomerClick={setSelectedCustomer}
                            onDelete={deleteCustomer}
                        />
                    )}
                    {activeTab === 'wallets' && <WalletMonitor customers={customers} onCustomerClick={setSelectedCustomer} />}
                    {activeTab === 'segments' && <SegmentManager />}
                    {activeTab === 'feedback' && <FeedbackList />}
                    {activeTab === 'reengage' && <ReEngagementTool />}
                </div>

                {/* Profile Modal */}
                <CustomerProfileModal
                    isOpen={!!selectedCustomer}
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />

                {/* Add Customer Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[200] flex items-start justify-center p-4 pt-20 animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}>
                        <div className="bg-surface rounded-none w-full max-w-lg p-12 shadow-2xl relative overflow-hidden animate-in slide-in-from-top-4 duration-300 border border-border" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col items-center text-center mb-10">
                                <div className="w-20 h-20 rounded-none bg-primary/5 text-primary flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
                                    <UserPlus className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black text-text uppercase tracking-tight">Add Customer</h2>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40 mt-2">Add a new customer to your list</p>
                            </div>

                            <form onSubmit={handleAddCustomer} className="space-y-6">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Customer Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Aditya Sharma"
                                            value={newCustomerForm.name}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                            className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-sm font-bold outline-none focus:bg-surface focus:border-primary transition-all uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+91 00000 00000"
                                            value={newCustomerForm.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) setNewCustomerForm({ ...newCustomerForm, phone: val });
                                            }}
                                            className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-sm font-bold outline-none focus:bg-surface focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Birth Date</label>
                                            <input
                                                type="date"
                                                value={newCustomerForm.dob}
                                                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, dob: e.target.value })}
                                                className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-sm font-bold outline-none focus:bg-surface focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Anniversary</label>
                                            <input
                                                type="date"
                                                value={newCustomerForm.anniversary}
                                                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, anniversary: e.target.value })}
                                                className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-sm font-bold outline-none focus:bg-surface focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Customer Category</label>
                                        <select
                                            value={newCustomerForm.category}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, category: e.target.value })}
                                            className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-sm font-bold outline-none focus:bg-surface focus:border-primary transition-all uppercase tracking-widest"
                                        >
                                            <option value="Regular">Regular</option>
                                            <option value="Premium">Premium</option>
                                            <option value="Elite">Elite</option>
                                            <option value="Budget">Budget</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Address</label>
                                        <textarea
                                            placeholder="Street, area, city, PIN"
                                            value={newCustomerForm.address}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                                            className="w-full px-6 py-3 rounded-none bg-surface border border-border text-sm font-bold outline-none focus:bg-surface focus:border-primary transition-all uppercase h-24 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Notes</label>
                                        <input
                                            type="text"
                                            placeholder="Any special requirements or notes..."
                                            value={newCustomerForm.remarks}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, remarks: e.target.value })}
                                            className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-sm font-bold outline-none focus:bg-surface focus:border-primary transition-all uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-8">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 rounded-none border border-border text-[11px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt transition-all active:scale-[0.98]">Cancel</button>
                                    <button type="submit" className="flex-1 bg-primary text-primary-foreground py-5 rounded-none shadow-2xl shadow-primary/20 text-[11px] font-black uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all">Add Customer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Manual WhatsApp Message Modal */}
            {whatsappModal.isOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-surface rounded-none w-full max-w-lg p-8 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
                            <div className="w-12 h-12 bg-emerald-500 text-primary-foreground flex items-center justify-center font-black">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-text uppercase tracking-widest">Send WhatsApp Message</h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase mt-0.5">To: {whatsappModal.customer?.name}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Your Message</label>
                            <textarea
                                value={whatsappModal.message}
                                onChange={(e) => setWhatsappModal({ ...whatsappModal, message: e.target.value })}
                                className="w-full h-40 px-5 py-4 bg-surface-alt border border-border text-xs font-bold focus:bg-surface focus:border-emerald-500 outline-none transition-all resize-none"
                                placeholder="Write your personalized message here..."
                            />
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setWhatsappModal({ ...whatsappModal, isOpen: false })}
                                className="flex-1 py-4 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-surface transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const phone = whatsappModal.customer.phone.replace(/[^0-9]/g, '');
                                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsappModal.message)}`, '_blank');
                                    setWhatsappModal({ ...whatsappModal, isOpen: false });
                                }}
                                className="flex-1 bg-emerald-500 text-primary-foreground py-4 text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function WalletMonitor({ customers, onCustomerClick }) {
    const { allWallets, bulkRecharge, initializeWallet, walletSettings, setWalletSettings, totalLiability } = useWallet();
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('directory'); // 'directory' | 'mechanics' | 'security'
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkAmount, setBulkAmount] = useState('');
    const [bulkNote, setBulkNote] = useState('');
    const [sendWhatsAppAfterBulk, setSendWhatsAppAfterBulk] = useState(true);
    const [bulkWhatsAppMessage, setBulkWhatsAppMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Ensure admin wallet data is loaded from backend for the currently visible customer list.
    useEffect(() => {
        if (!Array.isArray(customers) || customers.length === 0) return;
        customers.forEach((c) => {
            if (c?._id) initializeWallet(c._id);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customers]);


    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkRecharge = async (e) => {
        e.preventDefault();
        if (!bulkAmount || selectedIds.length === 0) return;
        
        const amountPerCustomer = Number(bulkAmount);
        if (!Number.isFinite(amountPerCustomer) || amountPerCustomer <= 0) return;

        const expiryDays = walletSettings?.expiryDays ?? 365;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
        const expiryDateText = expiryDate.toLocaleDateString();

        const ensureRazorpayLoaded = async () => {
            if (window.Razorpay) return;
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                script.onload = resolve;
                script.onerror = () => reject(new Error('Razorpay SDK load failed'));
                document.body.appendChild(script);
            });
        };

        const sendBulkWhatsApp = () => {
            if (!sendWhatsAppAfterBulk) return;
            const selectedCustomers = customers.filter(c => selectedIds.includes(c._id));
            selectedCustomers.forEach((c) => {
                const phone = (c.phone || '').replace(/[^0-9]/g, '');
                if (!phone) return;

                const baseText = bulkWhatsAppMessage?.trim()
                    ? bulkWhatsAppMessage.trim()
                    : `Wallet recharge successful for ${c.name || 'customer'}.`;

                const text = `${baseText}\n\nWallet credited: ₹${amountPerCustomer} (Valid until ${expiryDateText})`;
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
            });
        };

        const totalAmount = amountPerCustomer * selectedIds.length;
        setIsProcessing(true);
        try {
            await ensureRazorpayLoaded();

            // One Razorpay checkout for the total amount (amount per customer * count)
            const orderRes = await api.post('/billing/razorpay/create-wallet-order', { amount: totalAmount });
            if (!orderRes.data?.success) throw new Error(orderRes.data?.message || 'Failed to create Razorpay order');

            const { orderId, amount, currency, keyId } = orderRes.data.data;

            await new Promise((resolve, reject) => {
                const options = {
                    key: keyId,
                    amount,
                    currency,
                    name: 'Wapixo Salon',
                    description: `Bulk wallet recharge (${selectedIds.length} customers)`,
                    order_id: orderId,
                    handler: async (response) => {
                        try {
                            const verifyRes = await api.post('/billing/razorpay/verify-payment', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            if (verifyRes.data?.success) {
                                await bulkRecharge(selectedIds, amountPerCustomer, bulkNote || 'Bulk Promotional Credit');
                                sendBulkWhatsApp();
                                resolve(true);
                            } else {
                                reject(new Error('Payment verification failed'));
                            }
                        } catch (err) {
                            reject(err);
                        }
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Payment cancelled'))
                    },
                    theme: { color: '#C8956C' }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            });

            setBulkAmount('');
            setBulkNote('');
            setSelectedIds([]);
            setShowBulkModal(false);
            alert(`Successfully recharged wallets!`);
        } finally {
            setIsProcessing(false);
        }
    };

    const updateOffer = (id, field, value) => {
        const newOffers = walletSettings.offers.map(o => o.id === id ? { ...o, [field]: value } : o);
        setWalletSettings(prev => ({ ...prev, offers: newOffers }));
    };

    const deleteOffer = (id) => {
        const newOffers = walletSettings.offers.filter(o => o.id !== id);
        setWalletSettings(prev => ({ ...prev, offers: newOffers }));
    };

    const addOffer = () => {
        const newOffer = {
            id: Date.now(),
            title: 'New Offer',
            minAdd: 1000,
            extra: 100,
            isActive: true
        };
        setWalletSettings(prev => ({ ...prev, offers: [...prev.offers, newOffer] }));
    };

    const updateFraudRule = (field, value) => {
        setWalletSettings(prev => ({
            ...prev,
            fraudRules: { ...prev.fraudRules, [field]: value }
        }));
    };

    return (
        <div className="p-8 space-y-8 animate-reveal">
            {/* Sub-Header Navigation */}
            <div className="flex bg-surface-alt p-1 border border-border w-fit">
                <button 
                    onClick={() => setActiveSubTab('directory')}
                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'directory' ? 'bg-text text-white' : 'text-text-muted hover:text-text'}`}
                >
                    Wallet List
                </button>
                <button 
                    onClick={() => setActiveSubTab('mechanics')}
                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'mechanics' ? 'bg-text text-white' : 'text-text-muted hover:text-text'}`}
                >
                    Recharge Offers
                </button>
                <button 
                    onClick={() => setActiveSubTab('security')}
                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'security' ? 'bg-text text-white' : 'text-text-muted hover:text-text'}`}
                >
                    Security Settings
                </button>
            </div>

            {activeSubTab === 'directory' && (
                <>
                    {/* Wallet Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-text text-white p-6 border border-border shadow-xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">Total Wallet Balance (Owed to Customers)</p>
                            <h3 className="text-3xl font-black">₹{totalLiability.toLocaleString()}</h3>
                        </div>
                        <div className="bg-surface p-6 border border-border">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Active Wallets</p>
                            <h3 className="text-3xl font-black text-text">{Object.keys(allWallets).length}</h3>
                        </div>
                        <div className="bg-primary/5 p-6 border border-primary/20 flex flex-col justify-center">
                            <button 
                                onClick={() => setShowBulkModal(true)}
                                disabled={selectedIds.length === 0}
                                className="bg-primary text-white py-4 px-6 text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                            >
                                Bulk Recharge ({selectedIds.length} Selected)
                            </button>
                        </div>
                    </div>
                </>
            )}

            {activeSubTab === 'directory' && (
                <div className="table-responsive border border-border">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-alt border-b border-border">
                                <th className="px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        onChange={(e) => setSelectedIds(e.target.checked ? customers.map(c => c._id) : [])}
                                        checked={selectedIds.length === customers.length && customers.length > 0}
                                    />
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted tracking-widest">Available Balance</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted tracking-widest">Last Activity</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {customers.map(customer => {
                                const wallet = allWallets[customer._id] || { balance: 0, transactions: [] };
                                const lastTx = wallet.transactions[0];
                                
                                return (
                                    <tr key={customer._id} className="hover:bg-surface transition-colors group">
                                        <td className="px-6 py-4">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(customer._id)}
                                                onChange={() => toggleSelect(customer._id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4" onClick={() => onCustomerClick(customer)}>
                                            <div className="flex items-center gap-3 cursor-pointer">
                                                <div className="w-8 h-8 bg-text text-white flex items-center justify-center font-black text-xs">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-text uppercase tracking-tight">{customer.name}</p>
                                                    <p className="text-[10px] text-text-muted font-bold tracking-widest">{customer.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-black ${wallet.balance > 0 ? 'text-emerald-600' : 'text-text-muted'}`}>
                                                ₹{wallet.balance.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {lastTx ? (
                                                <div>
                                                    <p className="text-[10px] font-black text-text uppercase">{lastTx.description}</p>
                                                    <p className="text-[9px] text-text-muted font-bold uppercase">{new Date(lastTx.date).toLocaleDateString()}</p>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-text-muted/30 uppercase">No transactions yet</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => onCustomerClick(customer)}
                                                className="p-2 hover:bg-surface-alt border border-transparent hover:border-border transition-all"
                                            >
                                                <ChevronRight className="w-4 h-4 text-text-muted" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSubTab === 'mechanics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-surface p-8 border border-border">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-[11px] font-black text-text uppercase tracking-widest">Recharge Offers</h4>
                            <button onClick={addOffer} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">+ Add Offer</button>
                        </div>
                        <div className="space-y-4">
                            {walletSettings.offers.map(offer => (
                                <div key={offer.id} className="p-4 border border-border bg-surface-alt group hover:border-primary transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <input 
                                            value={offer.title}
                                            onChange={(e) => updateOffer(offer.id, 'title', e.target.value)}
                                            placeholder="Offer name"
                                            className="text-xs font-black text-text uppercase bg-transparent border-none outline-none w-3/4"
                                        />
                                        <button 
                                            onClick={() => updateOffer(offer.id, 'isActive', !offer.isActive)}
                                            className={`w-2 h-2 rounded-full ${offer.isActive ? 'bg-emerald-500' : 'bg-text-muted'}`} 
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[10px] font-bold text-text-muted uppercase">Min ₹</span>
                                        <input 
                                            type="number"
                                            value={offer.minAdd}
                                            onChange={(e) => updateOffer(offer.id, 'minAdd', parseInt(e.target.value))}
                                            className="w-16 bg-white border border-border px-1 text-[10px] font-black"
                                        />
                                        <span className="text-[10px] font-bold text-text-muted uppercase">• Extra ₹</span>
                                        <input 
                                            type="number"
                                            value={offer.extra}
                                            onChange={(e) => updateOffer(offer.id, 'extra', parseInt(e.target.value))}
                                            className="w-16 bg-white border border-border px-1 text-[10px] font-black"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => deleteOffer(offer.id)} className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-primary/5 p-8 border border-primary/20 flex flex-col justify-center text-center">
                        <Percent className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
                        <h4 className="text-sm font-black text-primary uppercase tracking-tight mb-2">Recharge Bonuses</h4>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed px-4 opacity-60">
                            Add bonus when customers recharge their wallet. E.g. Add ₹1000, get ₹100 extra.
                        </p>
                    </div>
                </div>
            )}

            {activeSubTab === 'security' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-surface p-8 border border-border">
                        <h4 className="text-[11px] font-black text-text uppercase tracking-widest mb-8">Wallet Limits</h4>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <TrendingDown className="w-3 h-3" /> Max daily spend from wallet
                                </span>
                                <input 
                                    type="number" 
                                    className="bg-surface-alt border border-border px-3 py-1 text-xs font-black w-24 outline-none focus:border-primary"
                                    value={walletSettings.fraudRules.maxDailyDebit}
                                    onChange={(e) => updateFraudRule('maxDailyDebit', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> Max single recharge amount
                                </span>
                                <input 
                                    type="number" 
                                    className="bg-surface-alt border border-border px-3 py-1 text-xs font-black w-24 outline-none focus:border-primary"
                                    value={walletSettings.fraudRules.maxSingleRecharge}
                                    onChange={(e) => updateFraudRule('maxSingleRecharge', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Require admin approval for refunds</span>
                                <button 
                                    onClick={() => updateFraudRule('requireAdminAuthForReversals', !walletSettings.fraudRules.requireAdminAuthForReversals)}
                                    className={`w-10 h-5 border border-border relative transition-all ${walletSettings.fraudRules.requireAdminAuthForReversals ? 'bg-primary' : 'bg-surface-alt'}`}
                                >
                                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white transition-all ${walletSettings.fraudRules.requireAdminAuthForReversals ? 'right-0.5' : 'left-0.5'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-rose-500/5 p-8 border border-rose-500/20">
                        <h4 className="text-[11px] font-black text-rose-800 uppercase tracking-widest mb-4">Recent Alerts</h4>
                        <div className="space-y-3">
                            <div className="p-3 bg-white/50 border border-rose-100 flex justify-between items-center text-[9px] font-bold text-rose-600">
                                <span>Unusual transaction attempt</span>
                                <span>21 Feb 2026</span>
                            </div>
                            <div className="p-3 bg-white/50 border border-rose-100 flex justify-between items-center text-[9px] font-bold text-rose-600">
                                <span>Limit exceeded</span>
                                <span>20 Feb 2026</span>
                            </div>
                        </div>
                        <p className="mt-6 text-[8px] font-black text-rose-800/50 uppercase tracking-[0.2em] text-center">Security monitoring active</p>
                    </div>
                </div>
            )}

            {/* Bulk Recharge Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[300] flex items-center justify-center p-4">
                    <div className="bg-surface w-full max-w-md p-8 border border-border shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-text uppercase tracking-tight">Bulk Recharge</h3>
                            <button onClick={() => setShowBulkModal(false)}><X className="w-6 h-6 text-text-muted" /></button>
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-8">
                            Selected: <span className="text-primary">{selectedIds.length} customer{selectedIds.length !== 1 ? 's' : ''}</span>
                        </p>
                        
                        <form onSubmit={handleBulkRecharge} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Recharge Amount (₹)</label>
                                <input 
                                    type="number" 
                                    required
                                    placeholder="e.g. 500"
                                    value={bulkAmount}
                                    onChange={(e) => setBulkAmount(e.target.value)}
                                    className="w-full bg-surface-alt border border-border px-4 py-3 text-lg font-black outline-none focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Promotion Note / Description</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Festival bonus"
                                    value={bulkNote}
                                    onChange={(e) => setBulkNote(e.target.value)}
                                    className="w-full bg-surface-alt border border-border px-4 py-3 text-sm font-black uppercase outline-none focus:border-primary"
                                />
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between gap-4">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">WhatsApp Message (optional)</label>
                                    <button
                                        type="button"
                                        onClick={() => setSendWhatsAppAfterBulk(v => !v)}
                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            sendWhatsAppAfterBulk ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-text-muted border-border hover:border-primary hover:text-primary'
                                        }`}
                                    >
                                        {sendWhatsAppAfterBulk ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                {sendWhatsAppAfterBulk && (
                                    <textarea
                                        value={bulkWhatsAppMessage}
                                        onChange={(e) => setBulkWhatsAppMessage(e.target.value)}
                                        placeholder="Type message to send after recharge..."
                                        className="w-full bg-white border border-border px-4 py-3 text-[10px] font-black outline-none focus:border-primary uppercase"
                                        rows={3}
                                    />
                                )}
                            </div>
                            
                            <div className="flex flex-col gap-4 pt-4">
                                <div className="p-4 bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-emerald-800 uppercase leading-relaxed">
                                        After recharge, WhatsApp message will be sent to all selected customers.
                                    </p>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-primary text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:brightness-110 transition-all font-black flex items-center justify-center gap-3"
                                >
                                    {isProcessing ? 'Processing...' : <><Send className="w-4 h-4"/> Add Credit to All</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function CelebrationReminders({ customers, onSendWhatsApp }) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();

    const reminders = customers.filter(c => {
        if (!c.dob && !c.anniversary) return false;

        const birthday = c.dob ? new Date(c.dob) : null;
        const anniversary = c.anniversary ? new Date(c.anniversary) : null;

        const isBirthdayNear = birthday && birthday.getMonth() === currentMonth && Math.abs(birthday.getDate() - currentDate) <= 7;
        const isAnniversaryNear = anniversary && anniversary.getMonth() === currentMonth && Math.abs(anniversary.getDate() - currentDate) <= 7;

        return isBirthdayNear || isAnniversaryNear;
    });

    if (reminders.length === 0) return null;

    const prepareWhatsAppWish = (customer, type) => {
        const message = type === 'birthday'
            ? `Happy Birthday ${customer.name}! 🎂 Wishing you a fantastic day ahead. We have a special treat waiting for you at our salon! ✨`
            : `Happy Anniversary ${customer.name}! 🥂 Congratulations on your special milestone. We'd love to help you celebrate - visit us for a special treat! ✨`;

        onSendWhatsApp(customer, message);
    };

    return (
        <div className="bg-primary/5 border border-primary/20 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                    <Cake className="w-4 h-4" /> Birthdays & Anniversaries
                </h3>
                <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest">{reminders.length} coming up this week</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {reminders.map(c => {
                    const birthday = c.dob ? new Date(c.dob) : null;
                    const anniversary = c.anniversary ? new Date(c.anniversary) : null;
                    const isBday = birthday && birthday.getMonth() === currentMonth && birthday.getDate() === currentDate;
                    const isAnniv = anniversary && anniversary.getMonth() === currentMonth && anniversary.getDate() === currentDate;

                    return (
                        <div key={c._id} className={`flex-shrink-0 min-w-[300px] p-4 bg-surface border ${isBday || isAnniv ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-border'} flex items-center justify-between group hover:border-primary transition-all`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-none ${isBday || isAnniv ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'} flex items-center justify-center font-black text-sm`}>
                                    {c.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-text uppercase tracking-tight">{c.name}</p>
                                    <p className="text-[9px] font-bold text-text-muted mt-0.5 flex items-center gap-1.5 uppercase">
                                        {isBday ? <><Cake className="w-2.5 h-2.5" /> Birthday Today!</> :
                                            isAnniv ? <><Calendar className="w-2.5 h-2.5" /> Anniversary Today!</> :
                                                birthday && birthday.getMonth() === currentMonth ? `Birthday on ${birthday.getDate()}` :
                                                    `Anniversary on ${anniversary.getDate()}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => prepareWhatsAppWish(c, isBday || (birthday && !isAnniv) ? 'birthday' : 'anniversary')}
                                    className="p-2.5 bg-emerald-500 text-primary-foreground hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 group/wa relative"
                                    title="Send WhatsApp wish"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border text-text text-[8px] font-black px-2 py-1 uppercase tracking-widest opacity-0 group-hover/wa:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">Edit and send</span>
                                </button>
                                <button className="p-2.5 hover:bg-primary hover:text-primary-foreground text-primary transition-all border border-primary/10">
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, trend }) {
    const colors = {
        blue: 'bg-primary/5 dark:bg-primary/10 text-primary border-primary/10',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
        green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
        red: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
    };

    return (
        <div className="bg-surface p-5 rounded-none border border-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-2.5 rounded-none border ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                </div>
                {trend && <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{trend}</span>}
            </div>
            <div className="space-y-1">
                <h3 className="text-text-secondary text-[10px] font-bold uppercase tracking-widest opacity-60">{title}</h3>
                <div className="text-2xl font-bold text-text">
                    {typeof value === 'number' ? (
                        <AnimatedCounter value={value} />
                    ) : value}
                </div>
            </div>
        </div>
    );
}

function CustomerDirectory({ customers, onCustomerClick, onDelete }) {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [spendFilter, setSpendFilter] = useState('All');

    const filtered = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone && c.phone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')));

        const matchesStatus = filterStatus === 'All' ||
            (filterStatus === 'VIP' ? c.tags.includes('VIP') : c.status === filterStatus);

        let matchesSpend = true;
        if (spendFilter === 'High') matchesSpend = c.spend > 10000;
        else if (spendFilter === 'Mid') matchesSpend = c.spend >= 1000 && c.spend <= 10000;
        else if (spendFilter === 'Low') matchesSpend = c.spend < 1000;

        return matchesSearch && matchesStatus && matchesSpend;
    });

    return (
        <div className="p-8 flex flex-col h-full gap-8 slide-right overflow-y-auto no-scrollbar">
            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative group lg:col-span-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-surface-alt border border-border rounded-none text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-surface-alt border border-border rounded-none text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-tighter"
                    >
                        <option value="All">All Tiers</option>
                        <option value="Regular">Regular</option>
                        <option value="Inactive">Inactive</option>
                        <option value="VIP">VIP</option>
                    </select>
                </div>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <select
                        value={spendFilter}
                        onChange={(e) => setSpendFilter(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-surface-alt border border-border rounded-none text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-tighter"
                    >
                        <option value="All">Any Spend</option>
                        <option value="High">High Value ({">"}₹10k)</option>
                        <option value="Mid">Mid Range (₹1k-10k)</option>
                        <option value="Low">Low Value ({"<"}₹1k)</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 table-responsive border border-border rounded-none">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-surface-alt border-b border-border">
                            <th className="px-6 py-5 text-[10px] font-extrabold text-text-muted uppercase tracking-widest pl-8">Customer</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Last Visit</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Spend</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Tags</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right pr-8">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface text-sm">
                        {filtered.map((customer, index) => (
                            <tr
                                key={customer._id}
                                className="hover:bg-surface-alt/50 transition-colors group cursor-pointer border-transparent animate-in fade-in slide-in-from-bottom-2 duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => onCustomerClick(customer)}
                            >
                                <td className="px-6 py-5 pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-none bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:scale-110 transition-transform">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-text group-hover:text-primary transition-colors tracking-tight text-sm">{customer.name}</div>
                                            <div className="text-[10px] text-text-muted font-bold tracking-widest">{maskPhone(customer.phone, user?.role)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text uppercase">Last Visit</span>
                                        <span className="text-xs font-bold text-text-secondary">
                                            {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Total Spend</span>
                                        <span className="text-sm font-bold text-text">₹{(customer.spend ?? 0).toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-wrap gap-1.5">
                                        {(Array.isArray(customer.tags) ? customer.tags : []).map((tag, i) => (
                                            <span key={i} className={`px-2 py-0.5 rounded-none text-[9px] font-black uppercase tracking-widest border transition-colors ${tag === 'VIP' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-surface-alt text-text-muted border-border'}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right pr-8">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCustomerClick(customer);
                                            }}
                                            className="p-2.5 rounded-none text-text-muted hover:text-primary hover:bg-surface-alt border border-transparent hover:border-border transition-all"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(customer._id);
                                            }}
                                            className="p-2.5 rounded-none text-text-muted hover:text-rose-500 hover:bg-surface-alt border border-border transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-8 py-5 bg-surface-alt border border-border rounded-none text-[10px] font-bold text-text-muted uppercase tracking-widest">
                <span>Showing {filtered.length} customer{filtered.length !== 1 ? 's' : ''}</span>
                <div className="flex gap-6">
                    <button className="hover:text-primary transition-colors disabled:opacity-30" disabled>Previous</button>
                    <button className="hover:text-primary transition-colors">Next</button>
                </div>
            </div>
        </div >
    );
}
