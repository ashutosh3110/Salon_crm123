import React, { useState } from 'react';
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
    MessageSquare
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomerProfileModal from '../../components/admin/CustomerProfileModal';
import SegmentManager from '../../components/admin/customers/SegmentManager';
import FeedbackList from '../../components/admin/customers/FeedbackList';
import ReEngagementTool from '../../components/admin/customers/ReEngagementTool';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';

export default function CustomersPage({ tab = 'directory' }) {
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text uppercase">Customer CRM</h1>
                        <p className="text-sm text-text-secondary mt-1 font-bold uppercase tracking-widest text-[10px]">Manage loyalty & retention</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-none text-[10px] font-extrabold uppercase tracking-widest text-text-muted hover:bg-surface-alt transition-all"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-3 bg-primary text-primary-foreground border border-primary px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all font-black"
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
                    <KPICard title="Total Base" value={customers.length} icon={Users} color="blue" trend="+12%" />
                    <KPICard title="VIP Elite" value={customers.filter(c => c.tags.includes('VIP')).length} icon={Star} color="purple" trend="Stable" />
                    <KPICard title="Gross Rev" value={`₹${customers.reduce((acc, c) => acc + c.spend, 0).toLocaleString()}`} icon={TrendingUp} color="green" trend="Total" />
                    <KPICard title="Inactive" value={customers.filter(c => c.status === 'Inactive').length} icon={ShieldAlert} color="red" trend="At Risk" />
                </div>

                {/* Content Container */}
                <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[600px]">
                    {activeTab === 'directory' && (
                        <CustomerDirectory
                            customers={customers}
                            onCustomerClick={setSelectedCustomer}
                            onDelete={deleteCustomer}
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
                                <h2 className="text-3xl font-black text-text uppercase tracking-tight">Induct Customer</h2>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40 mt-2">New Identity Matrix Registration</p>
                            </div>

                            <form onSubmit={handleAddCustomer} className="space-y-6">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Full Identification</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. ADITYA_SHARMA"
                                            value={newCustomerForm.name}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                                            className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-sm font-bold outline-none focus:bg-surface focus:border-primary transition-all uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Contact Node</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+91 00000 00000"
                                            value={newCustomerForm.phone}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
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
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Residential Address</label>
                                        <textarea
                                            placeholder="STREET, AREA, CITY, PIN"
                                            value={newCustomerForm.address}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                                            className="w-full px-6 py-3 rounded-none bg-surface border border-border text-sm font-bold outline-none focus:bg-surface focus:border-primary transition-all uppercase h-24 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Internal Remarks / Notes</label>
                                        <input
                                            type="text"
                                            placeholder="ANY SPECIAL REQUIREMENTS..."
                                            value={newCustomerForm.remarks}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, remarks: e.target.value })}
                                            className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-sm font-bold outline-none focus:bg-surface focus:border-primary transition-all uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-8">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 rounded-none border border-border text-[11px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt transition-all active:scale-[0.98]">ABORT</button>
                                    <button type="submit" className="flex-1 bg-primary text-primary-foreground py-5 rounded-none shadow-2xl shadow-primary/20 text-[11px] font-black uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all">INITIALIZE</button>
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
                                <h3 className="text-sm font-black text-text uppercase tracking-widest">Compose Manual Message</h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase mt-0.5">To: {whatsappModal.customer?.name}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Message Payload</label>
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
                                CANCEL
                            </button>
                            <button
                                onClick={() => {
                                    const phone = whatsappModal.customer.phone.replace(/[^0-9]/g, '');
                                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsappModal.message)}`, '_blank');
                                    setWhatsappModal({ ...whatsappModal, isOpen: false });
                                }}
                                className="flex-1 bg-emerald-500 text-primary-foreground py-4 text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                DISPATCH
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
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
                    <Cake className="w-4 h-4" /> Celebration Matrix Reminders
                </h3>
                <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest">{reminders.length} UPCOMING THIS WEEK</span>
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
                                    title="Compose WhatsApp Wish"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border text-text text-[8px] font-black px-2 py-1 uppercase tracking-widest opacity-0 group-hover/wa:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">Edit & Send</span>
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
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{trend}</span>
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
                        placeholder="Search Identity (Name or Phone)..."
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
                        <option value="VIP">VIP Elite</option>
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
            <div className="flex-1 border border-border rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-alt border-b border-border">
                            <th className="px-6 py-5 text-[10px] font-extrabold text-text-muted uppercase tracking-widest pl-8">Customer Matrix</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">History</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Finance</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Tiers</th>
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
                                        <span className="text-xs font-bold text-text-secondary">{new Date(customer.lastVisit).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Gross Yield</span>
                                        <span className="text-sm font-bold text-text">₹{customer.spend.toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-wrap gap-1.5">
                                        {customer.tags.map((tag, i) => (
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
                <span>Displaying {filtered.length} Elite Customer Records</span>
                <div className="flex gap-6">
                    <button className="hover:text-primary transition-colors disabled:opacity-30" disabled>Previous Page</button>
                    <button className="hover:text-primary transition-colors">Next Analytics</button>
                </div>
            </div>
        </div >
    );
}
