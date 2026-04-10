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
import mockApi from '../../services/mock/mockApi';
import { maskPhone } from '../../utils/phoneUtils';

export default function CustomersPage({ tab = 'directory' }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { customers: rawCustomers, addCustomer, deleteCustomer, fetchCustomers } = useBusiness();
    
    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);
    
    // Safety Fix: Ensuring customers is always an array for filtering
    const customers = Array.isArray(rawCustomers) ? rawCustomers : (rawCustomers?.results || rawCustomers?.data || []);

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
                    <KPICard title="Total Revenue" value={`₹${customers.reduce((acc, c) => acc + (c.spend || 0), 0).toLocaleString()}`} icon={TrendingUp} color="green" trend="" />
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
                                </div>

                                <div className="flex gap-4 pt-8">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 rounded-none border border-border text-[11px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 bg-primary text-primary-foreground py-5 rounded-none shadow-2xl shadow-primary/20 text-[11px] font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all">Add Customer</button>
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
                                className="flex-1 bg-emerald-500 text-primary-foreground py-4 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
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
    const [activeSubTab, setActiveSubTab] = useState('directory');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkAmount, setBulkAmount] = useState('');
    const [bulkNote, setBulkNote] = useState('');
    const [sendWhatsAppAfterBulk, setSendWhatsAppAfterBulk] = useState(true);
    const [bulkWhatsAppMessage, setBulkWhatsAppMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!Array.isArray(customers) || customers.length === 0) return;
        customers.forEach((c) => {
            if (c?._id) initializeWallet(c._id);
        });
    }, [customers]);

    const handleBulkRecharge = async (e) => {
        e.preventDefault();
        if (!bulkAmount || selectedIds.length === 0) return;
        setIsProcessing(true);
        try {
            const orderRes = await mockApi.post('/billing/razorpay/create-wallet-order', { amount: Number(bulkAmount) * selectedIds.length });
            if (orderRes.data?.success) {
                await bulkRecharge(selectedIds, Number(bulkAmount), bulkNote || 'Bulk Promotional Credit');
                alert('Wallet recharged successfully!');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-reveal">
            <div className="flex bg-surface-alt p-1 border border-border w-fit">
                <button onClick={() => setActiveSubTab('directory')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest ${activeSubTab === 'directory' ? 'bg-text text-white' : 'text-text-muted hover:text-text'}`}>Wallet List</button>
                <button onClick={() => setActiveSubTab('mechanics')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest ${activeSubTab === 'mechanics' ? 'bg-text text-white' : 'text-text-muted hover:text-text'}`}>Recharge Offers</button>
            </div>

            {activeSubTab === 'directory' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <div className="bg-text text-white p-6 border border-border shadow-xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 text-left">Total Wallet Liability</p>
                            <h3 className="text-3xl font-black text-left">₹{totalLiability.toLocaleString()}</h3>
                        </div>
                        <div className="bg-surface p-6 border border-border italic">
                            <button onClick={() => setShowBulkModal(true)} disabled={selectedIds.length === 0} className="w-full bg-primary text-white py-4 text-[10px] font-black uppercase tracking-widest disabled:opacity-50">Bulk Recharge ({selectedIds.length})</button>
                        </div>
                    </div>
                    <div className="table-responsive border border-border">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-surface-alt border-b border-border">
                                <tr>
                                    <th className="p-4"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? customers.map(c => c._id) : [])} checked={selectedIds.length === customers.length && customers.length > 0} /></th>
                                    <th className="p-4 text-[10px] font-black uppercase text-text-muted">Customer</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-text-muted text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {customers.map(c => (
                                    <tr key={c._id} className="hover:bg-surface transition-colors">
                                        <td className="p-4"><input type="checkbox" checked={selectedIds.includes(c._id)} onChange={() => setSelectedIds(prev => prev.includes(c._id) ? prev.filter(i => i !== c._id) : [...prev, c._id])} /></td>
                                        <td className="p-4" onClick={() => onCustomerClick(c)}>
                                            <div className="flex items-center gap-3 cursor-pointer">
                                                <div className="w-8 h-8 bg-text text-white flex items-center justify-center font-black text-xs">{c.name.charAt(0)}</div>
                                                <div>
                                                    <p className="text-sm font-black text-text uppercase tracking-tight">{c.name}</p>
                                                    <p className="text-[10px] text-text-muted font-bold tracking-widest">{c.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-sm font-black text-emerald-600">₹{(allWallets[c._id]?.balance || 0).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {showBulkModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[300] flex items-center justify-center p-4" onClick={() => setShowBulkModal(false)}>
                    <div className="bg-surface w-full max-w-md p-8 border border-border shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-text uppercase tracking-tight">Bulk Recharge</h3>
                            <button onClick={() => setShowBulkModal(false)}><X className="w-6 h-6 text-text-muted" /></button>
                        </div>
                        <form onSubmit={handleBulkRecharge} className="space-y-6 text-left font-black">
                            <input type="number" required placeholder="AMOUNT" value={bulkAmount} onChange={e => setBulkAmount(e.target.value)} className="w-full p-4 border border-border font-black text-xs" />
                            <input type="text" placeholder="NOTE" value={bulkNote} onChange={e => setBulkNote(e.target.value)} className="w-full p-4 border border-border font-black text-xs uppercase" />
                            <button type="submit" disabled={isProcessing} className="w-full bg-primary text-white py-4 font-black text-[10px] uppercase tracking-widest">{isProcessing ? 'Processing' : 'Add Credit'}</button>
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
        const bday = c.dob ? new Date(c.dob) : null;
        const anniv = c.anniversary ? new Date(c.anniversary) : null;
        const isBdayNear = bday && bday.getMonth() === currentMonth && Math.abs(bday.getDate() - currentDate) <= 7;
        const isAnnivNear = anniv && anniv.getMonth() === currentMonth && Math.abs(anniv.getDate() - currentDate) <= 7;
        return isBdayNear || isAnnivNear;
    });

    if (reminders.length === 0) return null;

    return (
        <div className="bg-primary/5 border border-primary/20 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                <Cake className="w-4 h-4" /> Birthdays & Anniversaries
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {reminders.map(c => (
                    <div key={c._id} className="flex-shrink-0 min-w-[300px] p-4 bg-surface border border-border flex items-center justify-between group hover:border-primary transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center font-black text-sm">{c.name.charAt(0)}</div>
                            <div>
                                <p className="text-xs font-black text-text uppercase tracking-tight">{c.name}</p>
                                <p className="text-[9px] font-bold text-text-muted mt-0.5 uppercase">Upcoming Event</p>
                            </div>
                        </div>
                        <button onClick={() => onSendWhatsApp(c, "Happy Birthday/Anniversary!")} className="p-2.5 bg-emerald-500 text-white shadow-lg"><MessageSquare className="w-3.5 h-3.5" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, trend }) {
    const colors = {
        blue: 'text-primary border-primary/10',
        purple: 'text-purple-600 border-purple-100',
        green: 'text-emerald-600 border-emerald-100',
        red: 'text-rose-600 border-rose-100'
    };
    return (
        <div className="bg-surface p-5 border border-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden text-left">
            <div className={`p-2.5 rounded-none border w-fit ${colors[color]} mb-4`}><Icon className="w-4 h-4" /></div>
            <h3 className="text-text-secondary text-[10px] font-bold uppercase tracking-widest opacity-60">{title}</h3>
            <div className="text-2xl font-bold text-text">{value}</div>
        </div>
    );
}

function CustomerDirectory({ customers, onCustomerClick, onDelete }) {
    const [searchTerm, setSearchTerm] = useState('');
    const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.phone && c.phone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')))
    );

    return (
        <div className="p-8 flex flex-col h-full gap-8 slide-right overflow-y-auto no-scrollbar">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface-alt border border-border text-sm font-bold outline-none"
                />
            </div>

            <div className="table-responsive border border-border">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-surface-alt border-b border-border">
                            <th className="px-6 py-5 text-[10px] font-extrabold text-text-muted uppercase tracking-widest">Customer</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Last Visit</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Spend</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface text-sm">
                        {filtered.map(c => (
                            <tr key={c._id} className="hover:bg-surface-alt/50 transition-colors group cursor-pointer" onClick={() => onCustomerClick(c)}>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold">{c.name.charAt(0)}</div>
                                        <div>
                                            <div className="font-bold text-text group-hover:text-primary transition-colors text-sm">{c.name}</div>
                                            <div className="text-[10px] text-text-muted font-bold tracking-widest">{c.phone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-xs font-bold text-text-secondary">{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : '-'}</td>
                                <td className="px-6 py-5 text-sm font-bold text-text">₹{(c.spend ?? 0).toLocaleString()}</td>
                                <td className="px-6 py-5 text-right">
                                    <button onClick={e => { e.stopPropagation(); onDelete(c._id); }} className="p-2.5 text-text-muted hover:text-rose-500 border border-border transition-all"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
