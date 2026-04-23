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
    Eye,
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
    const { 
        customers: rawCustomers, 
        customersMetadata, 
        globalStats,
        addCustomer, 
        updateCustomer, 
        deleteCustomer, 
        fetchCustomers 
    } = useBusiness();
    
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        fetchCustomers(currentPage, 5);
    }, [fetchCustomers, currentPage]);
    
    // Safety Fix: Ensuring customers is always an array for filtering
    const customers = Array.isArray(rawCustomers) ? rawCustomers : (rawCustomers?.results || rawCustomers?.data || []);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [whatsappModal, setWhatsappModal] = useState({ isOpen: false, customer: null, message: '' });
    const [newCustomerForm, setNewCustomerForm] = useState({
        name: '',
        phone: '',
        preferredService: 'Haircut',
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
            totalSpend: 0,
            status: 'active',
            isVIP: false,
            tags: [],
            lastVisit: new Date().toISOString()
        });
        setNewCustomerForm({ name: '', phone: '', preferredService: 'Haircut', dob: '', anniversary: '', address: '', remarks: '', category: 'Regular' });
        setShowAddModal(false);
    };

    const handleExport = () => {
        const data = customers.map(c => `${c.name},${c.phone},${c.totalVisits},${c.totalSpend},${c.status}`).join('\n');
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

                {/* KPI Cards (All Data) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard title="Total Customers" value={globalStats.totalCount} icon={Users} color="blue" trend="" />
                    <KPICard title="VIP Customers" value={globalStats.totalVIPs} icon={Star} color="purple" trend="" />
                    <KPICard title="Total Revenue" value={`₹${(globalStats.totalRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="green" trend="" />
                    <KPICard title="Inactive" value={globalStats.totalInactive} icon={ShieldAlert} color="red" trend="Needs attention" />
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
                        <>
                            <CustomerDirectory
                                customers={customers}
                                onCustomerClick={setSelectedCustomer}
                                onDelete={deleteCustomer}
                                onUpdate={updateCustomer}
                            />
                            
                            {/* Pagination Controls */}
                            <div className="px-8 py-6 border-t border-border bg-surface-alt/10 flex items-center justify-between">
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    Displaying {customers.length} of {customersMetadata.totalCount} customers
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-6 py-3 border border-border bg-surface text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                                    >
                                        Prev
                                    </button>
                                    <div className="px-4 text-xs font-black">
                                        Page {currentPage} of {customersMetadata.totalPages || 1}
                                    </div>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(customersMetadata.totalPages || 1, p + 1))}
                                        disabled={currentPage >= (customersMetadata.totalPages || 1)}
                                        className="px-6 py-3 border border-border bg-surface text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}


                    {activeTab === 'wallets' && (
                        <WalletMonitor 
                            customers={customers} 
                            onCustomerClick={setSelectedCustomer} 
                            customersMetadata={customersMetadata}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    )}
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

function WalletMonitor({ customers, onCustomerClick, customersMetadata, currentPage, onPageChange }) {
    const { allWallets, bulkRecharge } = useWallet();
    const { fetchAllCustomerIds, globalStats } = useBusiness();
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkAmount, setBulkAmount] = useState('');
    const [bulkNote, setBulkNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSelectingAll, setIsSelectingAll] = useState(false);

    const activeSubTab = 'directory';

    const handleBulkRecharge = async () => {
        if (!bulkAmount || selectedIds.length === 0) return;
        setIsProcessing(true);
        try {
            const res = await bulkRecharge(selectedIds, Number(bulkAmount), bulkNote || 'Bulk Promotional Credit');
            if (res.success) {
                alert(`Successfully recharged ${selectedIds.length} wallets!`);
                setBulkAmount('');
                setBulkNote('');
                setSelectedIds([]);
            } else {
                alert('Recharge failed: ' + (res.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Error processing bulk recharge');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSelectAll = async (checked) => {
        if (checked) {
            setIsSelectingAll(true);
            try {
                const allIds = await fetchAllCustomerIds();
                setSelectedIds(allIds);
            } finally {
                setIsSelectingAll(false);
            }
        } else {
            setSelectedIds([]);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-reveal">
         

            {activeSubTab === 'directory' && (
                <>
                    <div className="bg-surface border border-border p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                        <div className="flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-col md:flex-row gap-2 flex-1">
                                    <div className="relative group">
                                        <label className="absolute -top-2 left-3 bg-surface px-2 text-[8px] font-black text-primary uppercase tracking-widest z-10 transition-all group-focus-within:text-primary">Direct Recharge</label>
                                        <input 
                                            type="number" 
                                            placeholder="ENTER AMOUNT (₹)" 
                                            disabled={selectedIds.length === 0}
                                            value={bulkAmount} 
                                            onChange={e => setBulkAmount(e.target.value)} 
                                            className="w-full md:w-48 p-4 bg-surface-alt border border-border font-black text-[10px] outline-none focus:border-primary transition-all disabled:opacity-30"
                                        />
                                    </div>
                                    <div className="relative group flex-1">
                                        <label className="absolute -top-2 left-3 bg-surface px-2 text-[8px] font-black text-text-muted uppercase tracking-widest z-10">Add Remarks</label>
                                        <input 
                                            type="text" 
                                            placeholder="E.G. FESTIVAL PROMO" 
                                            disabled={selectedIds.length === 0}
                                            value={bulkNote} 
                                            onChange={e => setBulkNote(e.target.value)} 
                                            className="w-full p-4 bg-surface-alt border border-border font-black text-[10px] uppercase outline-none focus:border-primary transition-all disabled:opacity-30"
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleBulkRecharge()} 
                                    disabled={isProcessing || !bulkAmount || selectedIds.length === 0}
                                    className="bg-primary text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all whitespace-nowrap"
                                >
                                    {isProcessing ? 'Processing...' : `Apply to ${selectedIds.length} Selected`}
                                </button>
                            </div>
                        </div>

                        <div className="hidden lg:block w-px h-10 bg-border mx-2" />

                    </div>

                    <div className="table-responsive border border-border">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-surface-alt border-b border-border">
                                <tr>
                                    <th className="p-4 w-24">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 accent-primary cursor-pointer"
                                                    onChange={(e) => handleSelectAll(e.target.checked)} 
                                                    checked={selectedIds.length === customersMetadata.totalCount && customersMetadata.totalCount > 0} 
                                                    disabled={isSelectingAll}
                                                />
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em]">All</span>
                                            </div>
                                            {isSelectingAll && <span className="text-[7px] font-black text-primary animate-pulse uppercase">Fetching...</span>}
                                            {selectedIds.length > 0 && !isSelectingAll && <span className="text-[7px] font-black text-emerald-600 uppercase italic whitespace-nowrap">{selectedIds.length} IDs</span>}
                                        </div>
                                    </th>
                                    <th className="p-4 text-[10px] font-black uppercase text-text-muted tracking-widest">Customer Directory</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-text-muted tracking-widest text-right">Available Balance</th>
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
                                            <span className="text-sm font-black text-emerald-600">₹{(c.walletBalance || 0).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        <div className="px-8 py-6 border-t border-border bg-surface-alt/10 flex items-center justify-between">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                Displaying {customers.length} of {customersMetadata.totalCount} wallets
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => onPageChange(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-6 py-3 border border-border bg-surface text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                                >
                                    Prev
                                </button>
                                <div className="px-4 text-xs font-black">
                                    Page {currentPage} of {customersMetadata.totalPages || 1}
                                </div>
                                <button 
                                    onClick={() => onPageChange(p => Math.min(customersMetadata.totalPages || 1, p + 1))}
                                    disabled={currentPage >= (customersMetadata.totalPages || 1)}
                                    className="px-6 py-3 border border-border bg-surface text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </>
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

function CustomerDirectory({ customers, onCustomerClick, onDelete, onUpdate }) {
    const [searchTerm, setSearchTerm] = useState('');
    const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.phone && c.phone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')))
    );

    return (
        <div className="p-4 flex flex-col h-full gap-4 slide-right overflow-y-auto no-scrollbar">
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
                            <th className="px-4 py-3 text-[10px] font-extrabold text-text-muted uppercase tracking-widest">Customer</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Last Visit</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Spend</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface text-sm">
                        {filtered.map(c => (
                            <tr key={c._id} className="hover:bg-surface-alt/50 transition-colors group cursor-pointer" onClick={() => onCustomerClick(c)}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold">
                                                {c.name.charAt(0)}
                                            </div>
                                            {c.isVIP && (
                                                <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-none border border-white">
                                                    <Star className="w-2.5 h-2.5 fill-current" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-text group-hover:text-primary transition-colors text-sm">{c.name}</div>
                                                {c.status === 'inactive' && <span className="text-[8px] bg-rose-500 text-white px-1 font-black">INACTIVE</span>}
                                            </div>
                                            <div className="text-[10px] text-text-muted font-bold tracking-widest">{c.phone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs font-bold text-text-secondary">
                                    {c.lastLogin ? new Date(c.lastLogin).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-text">₹{(c.totalSpend ?? 0).toLocaleString()}</td>
                                <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                    <button 
                                        onClick={e => { e.stopPropagation(); onUpdate(c._id, { status: c.status === 'active' ? 'inactive' : 'active' }); }} 
                                        className={`p-2.5 border transition-all ${c.status === 'inactive' ? 'bg-rose-500 text-white border-rose-500' : 'text-text-muted hover:text-rose-500 border-border'}`}
                                        title={c.status === 'active' ? "Deactivate Customer" : "Activate Customer"}
                                    >
                                        <ShieldAlert className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={e => { e.stopPropagation(); onUpdate(c._id, { isVIP: !c.isVIP }); }} 
                                        className={`p-2.5 border transition-all ${c.isVIP ? 'bg-amber-500 text-white border-amber-500' : 'text-text-muted hover:text-amber-500 border-border'}`}
                                        title={c.isVIP ? "Remove VIP Status" : "Mark as VIP"}
                                    >
                                        <Star className={`w-4 h-4 ${c.isVIP ? 'fill-current' : ''}`} />
                                    </button>
                                    <button 
                                        onClick={e => { e.stopPropagation(); onCustomerClick(c); }} 
                                        className="p-2.5 text-text-muted hover:text-primary border border-border transition-all"
                                        title="View Profile"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={e => { e.stopPropagation(); if(confirm('Are you sure you want to delete this customer?')) onDelete(c._id); }} 
                                        className="p-2.5 text-text-muted hover:text-rose-500 border border-border transition-all"
                                        title="Delete Customer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
