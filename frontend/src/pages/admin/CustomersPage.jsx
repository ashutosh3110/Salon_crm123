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
    X,
    Upload,
    FileSpreadsheet,
    Bell,
    IndianRupee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomerProfileModal from '../../components/admin/CustomerProfileModal';
import SegmentManager from '../../components/admin/customers/SegmentManager';
import FeedbackList from '../../components/admin/customers/FeedbackList';
import ReEngagementTool from '../../components/admin/customers/ReEngagementTool';
import BridalRemindersView from '../../components/admin/customers/BridalRemindersView';
import BirthdayAnniversaryRemindersView from '../../components/admin/customers/BirthdayAnniversaryRemindersView';
import { useWallet } from '../../contexts/WalletContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
const hideScrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

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
        fetchCustomers,
        bulkImportCustomers
    } = useBusiness();

    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(currentPage, 10, search);
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchCustomers, currentPage, search]);



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
        appliedReferralCode: ''
    });

    const activeTab = tab;
    const hasCrmPermission = user?.role === 'admin' || user?.role === 'superadmin' || user?.permissions?.includes('crm') || user?.permissions?.includes('*');
    const hasPosPermission = user?.role === 'admin' || user?.role === 'superadmin' || user?.permissions?.includes('pos') || user?.permissions?.includes('*');

    useEffect(() => {
        const isAnyModalOpen = showAddModal || !!selectedCustomer || whatsappModal.isOpen;
        if (isAnyModalOpen) {
            document.documentElement.style.setProperty('overflow', 'hidden', 'important');
            document.body.style.setProperty('overflow', 'hidden', 'important');
        } else {
            document.documentElement.style.removeProperty('overflow');
            document.body.style.removeProperty('overflow');
        }
        return () => {
            document.documentElement.style.removeProperty('overflow');
            document.body.style.removeProperty('overflow');
        };
    }, [showAddModal, selectedCustomer, whatsappModal.isOpen]);

    const handleAddCustomer = (e) => {
        e.preventDefault();
        if (newCustomerForm.phone.length !== 10) return toast.error('Phone number must be exactly 10 digits');
        addCustomer({
            ...newCustomerForm,
            totalVisits: 0,
            totalSpend: 0,
            status: 'active',
            isVIP: false,
            tags: [],
            lastVisit: new Date().toISOString()
        });
        setNewCustomerForm({ name: '', phone: '', preferredService: 'Haircut', dob: '', anniversary: '', address: '', remarks: '', appliedReferralCode: '' });
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

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    toast.error('The file is empty');
                    return;
                }

                // Map keys to lowercase for matching
                const normalizedData = json.map(row => {
                    const newRow = {};
                    Object.keys(row).forEach(key => {
                        newRow[key.toLowerCase().trim()] = row[key];
                    });
                    return newRow;
                });

                // Validation check
                const firstRow = normalizedData[0];
                if (!firstRow.name || !firstRow.phone) {
                    toast.error('Invalid format. CSV must contain "name" and "phone" columns.');
                    return;
                }

                await bulkImportCustomers(normalizedData);
                // Reset input
                e.target.value = '';
            } catch (err) {
                console.error('Import error:', err);
                toast.error('Failed to parse file. Please use the sample CSV format.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadSampleCSV = () => {
        const csvContent = "name,phone,email,gender,dob,address\nAditya Sharma,9100000000,aditya@example.com,male,1995-05-15,Mumbai India\n";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_customers.csv';
        a.click();
    };

    return (
        <>
            <style>{hideScrollbarStyle}</style>
            <div className="space-y-6 animate-reveal text-left">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-2">
                    {activeTab === 'payment-reminders' ? (
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-text uppercase tracking-tighter leading-none">Payment Reminders</h1>
                            <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.3em] opacity-60 leading-none">Operations • POS Outstanding Balances</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black text-text uppercase tracking-tighter leading-none">Customers</h1>
                                <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.3em] opacity-60 leading-none">Intelligence Hub • CRM • Wallet Matrix</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Secondary Actions Group */}
                                <div className="flex items-center bg-surface border border-border p-1 shadow-sm">
                                    <button
                                        onClick={handleExport}
                                        title="Export Directory"
                                        className="p-3 text-text-muted hover:text-primary hover:bg-surface-alt transition-all group"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-4 bg-border mx-1" />
                                    <button
                                        onClick={downloadSampleCSV}
                                        title="Download Sample CSV"
                                        className="px-4 py-3 text-[10px] font-black text-text-muted hover:text-primary hover:bg-surface-alt transition-all uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <FileSpreadsheet className="w-4 h-4" />
                                        <span className="hidden xl:inline">Sample</span>
                                    </button>
                                    <div className="w-px h-4 bg-border mx-1" />
                                    <label className="px-4 py-3 text-[10px] font-black text-text-muted hover:text-primary hover:bg-surface-alt transition-all uppercase tracking-widest flex items-center gap-2 cursor-pointer">
                                        <Upload className="w-4 h-4" />
                                        <span className="hidden xl:inline">Import</span>
                                        <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                                    </label>
                                </div>

                                {/* Primary Action */}
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-primary text-primary-foreground px-8 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <UserPlus className="w-4 h-4" /> Add Customer
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Celebration Reminders & KPI Cards (Only for CRM) */}
                {activeTab !== 'payment-reminders' && (
                    <>
                        <CelebrationReminders
                            customers={customers}
                            onSendWhatsApp={(c, msg, type) => setWhatsappModal({ isOpen: true, customer: c, message: msg, isCelebrationWish: true, celebrationType: type })}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KPICard title="Total Customers" value={globalStats.totalCount} icon={Users} color="blue" trend="" />
                            <KPICard title="VIP Customers" value={globalStats.totalVIPs} icon={Star} color="purple" trend="" />
                            <KPICard title="Total Revenue" value={`₹${(globalStats.totalRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="green" trend="" />
                            <KPICard title="Inactive" value={globalStats.totalInactive} icon={ShieldAlert} color="red" trend="Needs attention" />
                        </div>
                    </>
                )}

                {/* Content Container */}
                <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[600px]">
                    {/* Tab Navigation Bar (Only for CRM) */}
                    {activeTab !== 'payment-reminders' && (
                        <div className="flex border-b border-border bg-surface-alt/30 overflow-x-auto no-scrollbar">
                            {hasCrmPermission && (
                                <>
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
                                    <button onClick={() => navigate('/admin/crm/reengage')} className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-r border-border transition-all whitespace-nowrap relative ${activeTab === 'reengage' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'}`}>
                                        Re-engage
                                        {activeTab === 'reengage' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                    </button>
                                    <button onClick={() => navigate('/admin/crm/bridal')} className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-r border-border transition-all whitespace-nowrap relative ${activeTab === 'bridal' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'}`}>
                                        Bridal Reminders
                                        {activeTab === 'bridal' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                    </button>
                                    <button onClick={() => navigate('/admin/crm/birthday-anniversary-reminders')} className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-r border-border transition-all whitespace-nowrap relative ${activeTab === 'birthday-anniversary-reminders' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'}`}>
                                        Birthday/Anniversary Wishes
                                        {activeTab === 'birthday-anniversary-reminders' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'directory' && (
                        <>
                            <CustomerDirectory
                                customers={customers}
                                onCustomerClick={(c) => navigate(`/admin/crm/customers/${c._id}`)}
                                onDelete={deleteCustomer}
                                onUpdate={updateCustomer}
                                searchTerm={search}
                                setSearchTerm={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
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
                    {activeTab === 'bridal' && <BridalRemindersView />}
                    {activeTab === 'birthday-anniversary-reminders' && <BirthdayAnniversaryRemindersView />}
                    {activeTab === 'payment-reminders' && (
                        <PaymentRemindersView
                            onCustomerClick={setSelectedCustomer}
                            setWhatsappModal={setWhatsappModal}
                            fetchCustomers={fetchCustomers}
                            currentPage={currentPage}
                        />
                    )}
                </div>

                {/* Profile Modal */}
                <CustomerProfileModal
                    isOpen={!!selectedCustomer}
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />

            </div>

                {/* Add Customer Modal (Portal) */}
                {showAddModal && createPortal(
                    <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}>
                        <div className="bg-white dark:bg-[#1e293b] rounded-3xl w-full max-w-md mx-4 shadow-2xl relative overflow-y-auto max-h-[90vh] hide-scrollbar animate-in slide-in-from-top-4 duration-300 border border-slate-200/50 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                            <div className="p-5 bg-white dark:bg-[#1e293b] border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase flex items-center gap-2 tracking-widest">
                                    <UserPlus className="w-4 h-4 text-slate-800 dark:text-slate-200" /> Add Customer
                                </h4>
                                <button type="button" onClick={() => setShowAddModal(false)} className="p-1 border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-300 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-colors"><X className="w-4 h-4" /></button>
                            </div>

                            <form onSubmit={handleAddCustomer} className="p-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Customer Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. John Doe"
                                            value={newCustomerForm.name}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 p-3 text-xs font-black text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary transition-all uppercase rounded-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="10-digit mobile"
                                            value={newCustomerForm.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) setNewCustomerForm({ ...newCustomerForm, phone: val });
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 p-3 text-xs font-black text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary transition-all rounded-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Referral Code (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. WAP-XXXXXX"
                                            value={newCustomerForm.appliedReferralCode || ''}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, appliedReferralCode: e.target.value.toUpperCase().trim() })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 p-3 text-xs font-black text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary transition-all uppercase rounded-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-left">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Birth Date</label>
                                            <input
                                                type="date"
                                                max={new Date().toISOString().split('T')[0]}
                                                value={newCustomerForm.dob}
                                                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, dob: e.target.value })}
                                                className="w-full bg-[#f8fafc] dark:bg-[#1e293b] border-2 border-slate-900 dark:border-slate-700 p-3 text-xs font-black outline-none focus:border-primary transition-all rounded-none"
                                                style={{ color: 'var(--date-input-color, #0f172a)' }}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Anniversary</label>
                                            <input
                                                type="date"
                                                max={new Date().toISOString().split('T')[0]}
                                                value={newCustomerForm.anniversary}
                                                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, anniversary: e.target.value })}
                                                className="w-full bg-[#f8fafc] dark:bg-[#1e293b] border-2 border-slate-900 dark:border-slate-700 p-3 text-xs font-black outline-none focus:border-primary transition-all rounded-none"
                                                style={{ color: 'var(--date-input-color, #0f172a)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-3.5 border-2 border-slate-900 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest italic bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all rounded-none text-slate-700 dark:text-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-[#B4912B] hover:bg-[#a37f20] text-white border-2 border-[#B4912B] dark:bg-[#B4912B] dark:hover:bg-[#a37f20] dark:border-[#B4912B] py-3.5 font-black text-[10px] uppercase tracking-widest italic hover:text-white transition-all rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        Add Customer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}

            {/* WhatsApp Message Modal (Portal) */}
            {whatsappModal.isOpen && createPortal(
                <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setWhatsappModal({ ...whatsappModal, isOpen: false })}>
                    <div className="bg-white dark:bg-[#1e293b] rounded-3xl w-full max-w-md mx-4 shadow-2xl border border-slate-200/50 dark:border-slate-800 overflow-y-auto max-h-[90vh] hide-scrollbar animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 bg-white dark:bg-[#1e293b] border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase flex items-center gap-2 tracking-widest">
                                <MessageSquare className="w-4 h-4 text-emerald-500" /> Send WhatsApp Message
                            </h4>
                            <button type="button" onClick={() => setWhatsappModal({ ...whatsappModal, isOpen: false })} className="p-1 border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-300 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-colors"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 p-4 rounded-none text-left">
                                    <div className="w-10 h-10 bg-slate-900 dark:bg-primary text-white flex items-center justify-center font-black text-xs uppercase rounded-none">
                                        {whatsappModal.customer?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{whatsappModal.customer?.name}</p>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold tracking-widest">{whatsappModal.customer?.phone}</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Your Message</label>
                                    <textarea
                                        value={whatsappModal.message}
                                        onChange={(e) => setWhatsappModal({ ...whatsappModal, message: e.target.value })}
                                        className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 p-3 text-xs font-black text-slate-900 dark:text-white outline-none rounded-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-primary transition-all resize-none"
                                        placeholder="Write your personalized message here..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setWhatsappModal({ ...whatsappModal, isOpen: false })}
                                    className="flex-1 py-3.5 border-2 border-slate-900 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest italic bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all rounded-none text-slate-700 dark:text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        const phone = whatsappModal.customer.phone.replace(/[^0-9]/g, '');
                                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsappModal.message)}`, '_blank');
                                        if (whatsappModal.isReminder) {
                                            try {
                                                await api.patch(`/clients/${whatsappModal.customer._id}/increment-reminder`);
                                                window.dispatchEvent(new CustomEvent('payment-reminder-sent'));
                                                fetchCustomers(currentPage, 10);
                                            } catch (err) {
                                                console.error('Failed to increment payment reminder:', err);
                                            }
                                        }
                                        if (whatsappModal.isCelebrationWish) {
                                            try {
                                                await api.patch(`/clients/${whatsappModal.customer._id}/celebration-wish`, { type: whatsappModal.celebrationType });
                                                fetchCustomers(currentPage, 10);
                                            } catch (err) {
                                                console.error('Failed to register celebration wish:', err);
                                            }
                                        }
                                        setWhatsappModal({ ...whatsappModal, isOpen: false });
                                    }}
                                    className="flex-1 bg-[#B4912B] hover:bg-[#a37f20] text-white border-2 border-[#B4912B] dark:bg-[#B4912B] dark:hover:bg-[#a37f20] dark:border-[#B4912B] py-3.5 font-black text-[10px] uppercase tracking-widest italic hover:text-white transition-all rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
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
    const [bulkExpiry, setBulkExpiry] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSelectingAll, setIsSelectingAll] = useState(false);

    const activeSubTab = 'directory';

    const handleBulkRecharge = async () => {
        if (!bulkAmount || selectedIds.length === 0) return;
        setIsProcessing(true);
        try {
            const res = await bulkRecharge(selectedIds, Number(bulkAmount), bulkNote || 'Bulk Promotional Credit', bulkExpiry || null);
            if (res.success) {
                alert(`Successfully recharged ${selectedIds.length} wallets!`);
                setBulkAmount('');
                setBulkNote('');
                setBulkExpiry('');
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
                            <div className="flex flex-wrap items-end gap-4">
                                <div className="flex flex-col md:flex-row gap-4 flex-1">
                                    <div className="space-y-1.5 text-left flex-1 md:flex-initial">
                                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Recharge Amount (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="ENTER AMOUNT (₹)"
                                            disabled={selectedIds.length === 0}
                                            value={bulkAmount}
                                            onChange={e => setBulkAmount(e.target.value)}
                                            className="w-full md:w-48 !p-3 bg-surface-alt border border-border font-black !text-[10px] !leading-none outline-none focus:border-primary transition-all disabled:opacity-70 !h-11"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left flex-1 md:flex-initial">
                                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Description / Notes</label>
                                        <input
                                            type="text"
                                            placeholder="E.G. FESTIVAL PROMO"
                                            disabled={selectedIds.length === 0}
                                            value={bulkNote}
                                            onChange={e => setBulkNote(e.target.value)}
                                            className="w-full md:w-64 !p-3 bg-surface-alt border border-border font-black !text-[10px] uppercase !leading-none outline-none focus:border-primary transition-all disabled:opacity-70 !h-11"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left flex-1 md:flex-initial">
                                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                        <input
                                            type="date"
                                            disabled={selectedIds.length === 0}
                                            value={bulkExpiry}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={e => setBulkExpiry(e.target.value)}
                                            className="w-full md:w-44 !p-3 bg-surface-alt border border-border font-black !text-[10px] !leading-none outline-none focus:border-primary transition-all disabled:opacity-70 !h-11"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleBulkRecharge()}
                                    disabled={isProcessing || !bulkAmount || selectedIds.length === 0}
                                    className="bg-primary text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all whitespace-nowrap h-11 flex items-center justify-center"
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
                                                <div className="w-8 h-8 bg-text text-white flex items-center justify-center font-black text-xs">{c.name?.charAt(0) || '?'}</div>
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
        <div className="bg-gradient-to-r from-primary/5 via-amber-50/50 to-primary/5 dark:from-primary/10 dark:via-amber-500/5 dark:to-primary/10 border border-primary/20 p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                <Cake className="w-4 h-4" /> Birthdays &amp; Anniversaries
                <span className="ml-auto text-[9px] font-black text-primary/60 uppercase tracking-wider bg-primary/10 px-2 py-1">{reminders.length} upcoming</span>
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {reminders.map(c => {
                    const isBday = c.dob && new Date(c.dob).getMonth() === currentMonth;
                    const type = isBday ? 'birthday' : 'anniversary';
                    const defaultMsg = isBday 
                        ? `Happy Birthday ${c.name}! We wish you a fantastic year ahead filled with joy and beauty.`
                        : `Happy Anniversary ${c.name}! Celebrating your beautiful journey together.`;

                    return (
                        <div key={c._id} className="flex-shrink-0 min-w-[280px] p-4 bg-white dark:bg-slate-800/60 border border-primary/15 dark:border-primary/20 flex items-center justify-between group hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-black text-sm border border-primary/20">
                                    {c.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{c.name}</p>
                                    <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 uppercase">
                                        {isBday ? '🎂 Upcoming Birthday' : '🎉 Upcoming Anniversary'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => onSendWhatsApp(c, defaultMsg, type)} 
                                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all group-hover:scale-105 active:scale-95"
                                title="Send WhatsApp message"
                            >
                                <MessageSquare className="w-3.5 h-3.5 text-white" style={{ color: '#ffffff' }} />
                            </button>
                        </div>
                    );
                })}
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

function CustomerDirectory({ customers, onCustomerClick, onDelete, onUpdate, searchTerm, setSearchTerm }) {
    const filtered = customers;

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
                                                {c.name?.charAt(0) || '?'}
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
                                            <div className="text-[10px] text-text-muted font-bold tracking-widest flex flex-wrap items-center gap-2">
                                                <span>{c.phone}</span>
                                                {Number(c.dueAmount || 0) > 0 && (
                                                    <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                        Due: ₹{Number(c.dueAmount).toFixed(0)}
                                                    </span>
                                                )}
                                            </div>
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
                                        onClick={e => { e.stopPropagation(); if (confirm('Are you sure you want to delete this customer?')) onDelete(c._id); }}
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

function PaymentRemindersView({ onCustomerClick, setWhatsappModal, fetchCustomers, currentPage }) {
    const { salon, updateSalon, outlets, activeSalonId } = useBusiness();
    const filteredOutlets = React.useMemo(() => {
        const currentSalonId = salon?._id || activeSalonId;
        if (!currentSalonId) return outlets || [];
        return (outlets || []).filter(o => {
            const oSalonId = o.salonId?._id || o.salonId;
            return String(oSalonId) === String(currentSalonId);
        });
    }, [outlets, salon, activeSalonId]);
    const [dueClients, setDueClients] = useState([]);
    const [dueMetadata, setDueMetadata] = useState({ totalCount: 0, totalPages: 0, currentPage: 1 });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedOutlet, setSelectedOutlet] = useState('');

    const [autoReminder, setAutoReminder] = useState(false);
    const [reminderInterval, setReminderInterval] = useState(7);
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        if (salon?.whatsappSettings) {
            setAutoReminder(!!salon.whatsappSettings.autoPaymentReminder);
            setReminderInterval(salon.whatsappSettings.paymentReminderIntervalDays || 7);
        }
    }, [salon]);

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            const updatedWhatsappSettings = {
                ...salon?.whatsappSettings,
                autoPaymentReminder: autoReminder,
                paymentReminderIntervalDays: reminderInterval
            };
            await updateSalon({ whatsappSettings: updatedWhatsappSettings });
            toast.success('Auto payment reminder settings updated');
        } catch (err) {
            console.error('Failed to update reminder settings:', err);
            toast.error('Failed to update settings');
        } finally {
            setSavingSettings(false);
        }
    };

    const fetchDueClients = React.useCallback(async (pageNum = 1, outletId = '') => {
        setLoading(true);
        try {
            const url = `/clients/payment-due?page=${pageNum}&limit=10${outletId ? `&outletId=${outletId}` : ''}`;
            const res = await api.get(url);
            if (res.data?.success) {
                setDueClients(res.data.data || []);
                setDueMetadata({
                    totalCount: res.data.totalCount || 0,
                    totalPages: res.data.totalPages || 0,
                    currentPage: res.data.currentPage || 1
                });
            }
        } catch (err) {
            console.error('Failed to fetch payment due clients:', err);
            setDueClients([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDueClients(page, selectedOutlet);
    }, [page, selectedOutlet, fetchDueClients]);

    useEffect(() => {
        const handler = () => {
            fetchDueClients(page, selectedOutlet);
        };
        window.addEventListener('payment-reminder-sent', handler);
        return () => window.removeEventListener('payment-reminder-sent', handler);
    }, [page, selectedOutlet, fetchDueClients]);

    const filtered = dueClients.filter(c => 
        (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
        (c.phone && c.phone.includes(search))
    );

    const totalOutstanding = dueClients.reduce((acc, c) => acc + (c.dueAmount || 0), 0);

    const handleSendReminder = async (customer) => {
        const toastId = toast.loading('Sending WhatsApp reminder...');
        try {
            const res = await api.post(`/clients/${customer._id}/send-payment-reminder`);
            if (res.data?.success) {
                toast.success('Reminder sent successfully via WhatsApp API!', { id: toastId });
                window.dispatchEvent(new CustomEvent('payment-reminder-sent'));
            } else {
                toast.error(res.data?.message || 'Failed to send reminder', { id: toastId });
            }
        } catch (err) {
            console.error('Failed to send payment reminder:', err);
            toast.error(err.response?.data?.message || 'Error sending reminder', { id: toastId });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="p-8 space-y-6 animate-reveal">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface p-5 border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Outstanding Clients</span>
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{dueMetadata.totalCount}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Customers with pending dues</div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20 group-hover:bg-primary transition-all duration-300" />
                </div>
                <div className="bg-surface p-5 border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:border-rose-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Total Dues (Page)</span>
                        <div className="w-8 h-8 bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                            <IndianRupee className="w-4 h-4 text-rose-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-rose-600">₹{totalOutstanding.toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending balance this page</div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-200 group-hover:bg-rose-500 transition-all duration-300" />
                </div>
                <div className="bg-surface p-5 border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:border-amber-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Dues Status</span>
                        <div className="w-8 h-8 bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-amber-500" />
                        </div>
                    </div>
                    <div className="text-[13px] font-black text-amber-600 uppercase tracking-widest mt-1">Action Required</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Send reminders to clear dues</div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-200 group-hover:bg-amber-500 transition-all duration-300" />
                </div>
            </div>

            {/* Auto Reminder Settings Card */}
            <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent dark:from-primary/10 dark:via-primary/5 border border-primary/20 p-5 flex flex-col lg:flex-row lg:items-center gap-5">
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white">Automated Payment Reminders</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">Configure the system to automatically send WhatsApp payment reminders to customers with pending balances.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                    {/* Toggle Switch */}
                    <label className="flex items-center gap-3 cursor-pointer select-none group">
                        <div
                            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${autoReminder ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${autoReminder ? 'left-6' : 'left-1'}`} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white">Auto Reminders</div>
                            <div className="text-[9px] text-slate-400 uppercase tracking-wider">{autoReminder ? 'Enabled' : 'Disabled'}</div>
                        </div>
                        <input type="checkbox" className="hidden" checked={autoReminder} onChange={(e) => setAutoReminder(e.target.checked)} />
                    </label>

                    {/* Interval */}
                    {autoReminder && (
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-border px-4 py-2.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Every</span>
                            <input
                                type="number"
                                min="1"
                                value={reminderInterval}
                                onChange={(e) => setReminderInterval(Math.max(1, Number(e.target.value) || 1))}
                                className="w-12 text-sm font-black text-center outline-none bg-transparent text-slate-900 dark:text-white"
                                style={{ color: 'inherit' }}
                            />
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Days</span>
                        </div>
                    )}

                    <button
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-[9px] font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-primary/20 active:scale-95"
                        style={{ color: '#ffffff' }}
                    >
                        {savingSettings ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Settings'
                        )}
                    </button>
                </div>
            </div>

            {/* Search Bar & Outlet Filter */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search due clients by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-surface border border-border text-sm font-bold outline-none focus:border-primary transition-all text-slate-900 dark:text-white"
                    />
                </div>
                {filteredOutlets && filteredOutlets.length > 0 && (
                    <select
                        value={selectedOutlet}
                        onChange={(e) => {
                            setSelectedOutlet(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-3 bg-surface border border-border text-xs font-black uppercase tracking-widest outline-none min-w-[200px] cursor-pointer"
                    >
                        <option value="">All Outlets</option>
                        {filteredOutlets.map(o => (
                            <option key={o._id || o.id} value={o._id || o.id}>
                                {o.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Table */}
            <div className="table-responsive border border-border bg-surface">
                {loading ? (
                    <div className="text-center py-12 text-xs font-bold text-text-muted uppercase tracking-widest">
                        Loading unpaid dues...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-xs font-bold text-text-muted uppercase tracking-widest">
                        No customers with pending payments found
                    </div>
                ) : (
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-surface-alt border-b border-border">
                            <tr>
                                <th className="p-4 text-[10px] font-black uppercase text-text-muted tracking-widest">Customer Details</th>
                                <th className="p-4 text-[10px] font-black uppercase text-text-muted tracking-widest text-right">Dues Amount</th>
                                <th className="p-4 text-[10px] font-black uppercase text-text-muted tracking-widest text-center">Reminders Sent</th>
                                <th className="p-4 text-[10px] font-black uppercase text-text-muted tracking-widest text-center">Last Reminded</th>
                                <th className="p-4 text-[10px] font-black uppercase text-text-muted tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map(c => (
                                <tr key={c._id} className="hover:bg-surface-alt/20 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onCustomerClick(c)}>
                                            <div className="w-8 h-8 bg-text text-white flex items-center justify-center font-black text-xs">
                                                {c.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text uppercase tracking-tight">{c.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold tracking-widest">{c.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-black text-rose-600">
                                        ₹{(c.dueAmount || 0).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-center font-bold text-xs">
                                        <span className={`px-2 py-1 text-[10px] font-black border ${c.paymentReminderCount > 0 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                            {c.paymentReminderCount || 0} Sent
                                        </span>
                                    </td>
                                    <td className="p-4 text-center text-xs font-bold text-text-muted">
                                        {formatDate(c.lastPaymentReminderSentAt)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleSendReminder(c)}
                                            className="bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-2.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ml-auto shadow-md hover:shadow-lg transition-all"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" /> Send Reminder
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination Controls */}
                {dueMetadata.totalPages > 1 && (
                    <div className="px-8 py-6 border-t border-border bg-surface-alt/10 flex items-center justify-between">
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                            Displaying {filtered.length} of {dueMetadata.totalCount} accounts
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-6 py-3 border border-border bg-surface text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                            >
                                Prev
                            </button>
                            <div className="px-4 text-xs font-black">
                                Page {page} of {dueMetadata.totalPages || 1}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(dueMetadata.totalPages || 1, p + 1))}
                                disabled={page >= (dueMetadata.totalPages || 1)}
                                className="px-6 py-3 border border-border bg-surface text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
