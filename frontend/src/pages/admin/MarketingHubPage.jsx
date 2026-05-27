import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    MessageSquare, Mail, Share2, TrendingUp, Users, Send,
    Plus, Search, Filter, MoreVertical, CheckCircle, Clock,
    Eye, BarChart2, Smartphone, Facebook, Instagram,
    Zap, Calendar, Layout, Trash2, Edit3, ArrowRight,Bell,
    QrCode, Globe, Percent, XCircle, Save, Star, Download, CheckCircle2, Tag, Gift, ChevronRight, SmartphoneIcon, Target, Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const SCROLLBAR_HIDE_STYLE = `
  .hide-scrollbar::-webkit-scrollbar { display: none !important; }
  .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
  .no-scrollbar::-webkit-scrollbar { display: none !important; }
  .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
`;

/* ─── Components ───────────────────────────────────────────────────────── */

function SectionHeader({ title, desc, icon: Icon, badge }) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[1.25rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-text tracking-tight flex items-center gap-3">
                        {title}
                        {badge && <span className="text-[9px] bg-primary text-white px-3 py-1 rounded-full uppercase tracking-[0.2em] font-black">{badge}</span>}
                    </h2>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">{desc}</p>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ────────────────────────────────────────────────────────── */

export default function MarketingHub() {
    return (
        <>
            <style>{SCROLLBAR_HIDE_STYLE}</style>
            <MarketingHubContent />
        </>
    );
}

function MarketingHubContent() {
    const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' or 'notification'
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [campaignForm, setCampaignForm] = useState({
        name: '',
        type: 'bulk', // bulk, or selective
        selectedCustomers: [], // array of IDs
        message: '',
        channel: 'whatsapp'
    });
    const [isSending, setIsSending] = useState(false);
    const [sendingProgress, setSendingProgress] = useState(0);
    const [campaignError, setCampaignError] = useState('');
    const [isContactListOpen, setIsContactListOpen] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedCampaignIds, setSelectedCampaignIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    useEffect(() => {
        if (isCampaignModalOpen || isContactListOpen) {
            document.documentElement.style.setProperty('overflow', 'hidden', 'important');
            document.body.style.setProperty('overflow', 'hidden', 'important');
            document.body.classList.add('hide-scrollbar');
        } else {
            document.documentElement.style.removeProperty('overflow');
            document.body.style.removeProperty('overflow');
            document.body.classList.remove('hide-scrollbar');
        }
        return () => {
            document.documentElement.style.removeProperty('overflow');
            document.body.style.removeProperty('overflow');
            document.body.classList.remove('hide-scrollbar');
        };
    }, [isCampaignModalOpen, isContactListOpen]);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const res = await api.get('/marketing/campaigns?limit=100');
            if (res.data?.success) setCampaigns(res.data.data?.results || []);
        } catch (e) {
            setCampaigns([]);
        } finally {
            setLoading(false);
            setSelectedCampaignIds([]);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await api.delete(`/marketing/campaigns/${id}`);
            loadCampaigns();
        } catch (err) {
            alert('Failed to delete campaign');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedCampaignIds.length} campaigns?`)) return;
        try {
            await api.delete('/marketing/campaigns/bulk', { data: { ids: selectedCampaignIds } });
            loadCampaigns();
        } catch (err) {
            alert('Failed to delete campaigns');
        }
    };

    const toggleSelectAll = () => {
        if (selectedCampaignIds.length === filteredCampaigns.length) {
            setSelectedCampaignIds([]);
        } else {
            setSelectedCampaignIds(filteredCampaigns.map(c => c._id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedCampaignIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        loadCampaigns();
    }, []);

    const startCampaign = () => {
        setCampaignForm({
            name: '',
            type: 'bulk',
            selectedCustomers: [],
            message: '',
            channel: activeTab
        });
        setCampaignError('');
        setSendingProgress(0);
        setIsSending(false);
        setIsCampaignModalOpen(true);
    };

    const handleSendCampaign = async () => {
        setCampaignError('');
        setIsSending(true);
        let progress = 0;
        const interval = setInterval(() => setSendingProgress((p) => Math.min(p + 5, 90)), 150);

        try {
            const payload = {
                ...campaignForm,
                channel: activeTab
            };
            const res = await api.post('/marketing/campaigns', payload);
            
            clearInterval(interval);
            setSendingProgress(100);
            await loadCampaigns();
            setTimeout(() => {
                setIsCampaignModalOpen(false);
                setIsSending(false);
            }, 1000);
        } catch (err) {
            clearInterval(interval);
            setCampaignError(err?.response?.data?.message || err?.message || 'Failed to create campaign');
            setIsSending(false);
        }
    };

    const tabs = [
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
        { id: 'notification', label: 'App Notifications', icon: Bell },
    ];

    const filteredCampaigns = campaigns.filter(c => 
        activeTab === 'whatsapp' ? (c.channel === 'whatsapp' || !c.channel) : (c.channel === 'notification')
    );

    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
    const paginatedCampaigns = filteredCampaigns.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 text-left mb-4">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl sm:text-4xl font-black text-text tracking-tighter uppercase italic leading-none">Marketing Hub</h1>
                    <p className="text-[10px] sm:text-xs text-text-muted mt-3 uppercase tracking-[0.3em] opacity-50 leading-tight">Unified Audience Engagement & Retention Control</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {selectedCampaignIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center justify-center gap-3 px-8 py-5 rounded-[1.25rem] bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-600 shadow-lg active:scale-[0.98] transition-all leading-none"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Selected ({selectedCampaignIds.length})
                        </button>
                    )}
                    <button
                        onClick={startCampaign}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-10 py-5 rounded-[1.25rem] bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] hover:brightness-110 shadow-[0_12px_24px_-8px_rgba(200,149,108,0.4)] active:scale-[0.98] transition-all leading-none"
                    >
                        <Plus className="w-4 h-4" /> New {activeTab === 'whatsapp' ? 'WhatsApp' : 'Notification'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border/60 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                            activeTab === tab.id ? 'text-primary' : 'text-text-muted hover:text-text'
                        }`}
                    >
                        <tab.icon className={`w-4 h-4 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'opacity-50'}`} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-4 right-4 h-[3px] bg-primary rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content: Campaign List */}
            <div className="space-y-6">
                <SectionHeader
                    title={activeTab === 'whatsapp' ? 'WhatsApp Campaigns' : 'App Notifications'}
                    desc={activeTab === 'whatsapp' ? 'Direct messages to customer WhatsApp' : 'Push notifications to customer mobile app'}
                    icon={activeTab === 'whatsapp' ? MessageSquare : Bell}
                    badge="Marketing"
                />

                <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface/30">
                        <h3 className="text-xs font-black text-text uppercase tracking-widest leading-none">Sent History</h3>
                        <button onClick={loadCampaigns} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Refresh</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="bg-surface/50 border-b border-border/60">
                                    <th className="px-6 py-5 text-left w-10">
                                        <button onClick={toggleSelectAll} className={`w-4 h-4 border-2 rounded transition-all ${selectedCampaignIds.length === filteredCampaigns.length && filteredCampaigns.length > 0 ? 'bg-primary border-primary' : 'border-border'}`}>
                                            {selectedCampaignIds.length === filteredCampaigns.length && filteredCampaigns.length > 0 && <CheckCircle size={10} className="text-white mx-auto" />}
                                        </button>
                                    </th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Campaign Name</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Date</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading history...</td></tr>
                                ) : filteredCampaigns.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-text-muted font-bold uppercase tracking-widest text-[10px]">No campaigns found</td></tr>
                                ) : (
                                    paginatedCampaigns.map(c => (
                                        <tr key={c._id} className={`border-b border-border/50 hover:bg-surface/10 transition-colors ${selectedCampaignIds.includes(c._id) ? 'bg-primary/5' : ''}`}>
                                            <td className="px-6 py-5">
                                                <button onClick={() => toggleSelect(c._id)} className={`w-4 h-4 border-2 rounded transition-all ${selectedCampaignIds.includes(c._id) ? 'bg-primary border-primary' : 'border-border'}`}>
                                                    {selectedCampaignIds.includes(c._id) && <CheckCircle size={10} className="text-white mx-auto" />}
                                                </button>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-xs font-black text-text uppercase tracking-tight">{c.name}</div>
                                                <div className="text-[9px] text-text-muted font-bold truncate max-w-[300px] mt-1">{c.message}</div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${c.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center font-bold text-xs text-text-muted">
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => handleDelete(c._id)}
                                                    className="p-2 hover:bg-rose-50 text-text-muted hover:text-rose-500 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Footer */}
                    {filteredCampaigns.length > 0 && (
                        <div className="bg-surface px-6 py-4 border-t border-border flex items-center justify-between">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] font-mono italic">
                                Showing {((safeCurrentPage - 1) * itemsPerPage) + 1} - {Math.min(safeCurrentPage * itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} Campaigns
                            </span>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={safeCurrentPage === 1}
                                    className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={safeCurrentPage === totalPages || totalPages === 0}
                                    className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isCampaignModalOpen && createPortal(
                <AnimatePresence>
                    {isCampaignModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-10 sm:pt-16 overflow-y-auto">
                            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isSending && setIsCampaignModalOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
                            >
                                {/* Form Side */}
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                                        <div>
                                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Create {activeTab === 'whatsapp' ? 'WhatsApp' : 'Push'} Campaign</h3>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fill details and send instantly</p>
                                        </div>
                                        {!isSending && (
                                            <div
                                                role="button"
                                                onClick={() => setIsCampaignModalOpen(false)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                                            >
                                                <XCircle className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 space-y-4 flex-1 overflow-y-auto no-scrollbar">
                                        {isSending ? (
                                            <div className="py-12 flex flex-col items-center text-center space-y-8">
                                                <div className="relative w-32 h-32 flex items-center justify-center">
                                                    <svg className="w-full h-full -rotate-90">
                                                        <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                                        <motion.circle
                                                            cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                            strokeDasharray={380}
                                                            animate={{ strokeDashoffset: 380 - (380 * sendingProgress) / 100 }}
                                                            className="text-primary"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-900 dark:text-white">
                                                        {Math.round(sendingProgress)}%
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sending Messages...</h3>
                                                    <p className="text-sm text-slate-400 mt-2 font-medium">Processing campaign for your selected audience...</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Name */}
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Campaign Name / Title</label>
                                                    <input
                                                        type="text"
                                                        placeholder={activeTab === 'whatsapp' ? 'e.g. Summer Offer' : 'Notification Title...'}
                                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-tight focus:outline-none focus:border-primary transition-all text-slate-900 dark:text-white"
                                                        value={campaignForm.name}
                                                        onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                                                    />
                                                </div>

                                                {/* Audience */}
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Choose Audience</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            { id: 'bulk', label: 'Everyone', desc: 'All Customers', icon: Users },
                                                            { id: 'selective', label: 'Selected', desc: 'Specific List', icon: Target },
                                                        ].map(t => (
                                                            <button
                                                                key={t.id}
                                                                type="button"
                                                                onClick={() => setCampaignForm({ ...campaignForm, type: t.id })}
                                                                className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                                                                    campaignForm.type === t.id
                                                                        ? 'border-primary bg-primary/5'
                                                                        : 'border-slate-200 hover:border-slate-300 bg-white dark:border-slate-700 dark:hover:border-slate-600 dark:bg-slate-800/50'
                                                                }`}
                                                            >
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                                    campaignForm.type === t.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-300'
                                                                }`}>
                                                                    <t.icon className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.label}</div>
                                                                    <div className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">{t.desc}</div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {campaignForm.type === 'selective' && (
                                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                                            <div>
                                                                <div className="text-sm font-black text-slate-900 dark:text-white">{campaignForm.selectedCustomers.length} selected</div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsContactListOpen(true)}
                                                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest hover:border-primary/50 transition-all"
                                                            >
                                                                Select Customers
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Message */}
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Message Content</label>
                                                    <textarea
                                                        rows={3}
                                                        placeholder="Type your message here... (Use {{name}} for customer name)"
                                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all text-slate-900 dark:text-white"
                                                        value={campaignForm.message}
                                                        onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
                                                    />
                                                </div>

                                                {campaignError && (
                                                    <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-bold">{campaignError}</div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                                        <button
                                            type="button"
                                            onClick={handleSendCampaign}
                                            disabled={!campaignForm.name || !campaignForm.message || (campaignForm.type === 'selective' && campaignForm.selectedCustomers.length === 0) || isSending}
                                            className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg"
                                        >
                                            {isSending ? 'Sending...' : `Send ${activeTab === 'whatsapp' ? 'WhatsApp' : 'Notification'} Now`}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {isContactListOpen && createPortal(
                <AnimatePresence>
                    <ContactListModal
                        isOpen={isContactListOpen}
                        onClose={() => setIsContactListOpen(false)}
                        selectionMode={true}
                        selectedIds={campaignForm.selectedCustomers}
                        onToggleSelect={(id) => {
                            setCampaignForm(prev => {
                                const list = prev.selectedCustomers;
                                if (list.includes(id)) {
                                    return { ...prev, selectedCustomers: list.filter(x => x !== id) };
                                } else {
                                    return { ...prev, selectedCustomers: [...list, id] };
                                }
                            });
                        }}
                    />
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

function ContactListModal({ isOpen, onClose, selectionMode = false, selectedIds = [], onToggleSelect }) {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.get('/clients?limit=500')
                .then((res) => setContacts(Array.isArray(res.data?.data) ? res.data.data : []))
                .catch(() => setContacts([]))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return contacts.filter(c => (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(search));
    }, [contacts, search]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-start justify-center p-4 pt-10 sm:pt-16 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] shadow-2xl relative overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                    <h3 className="text-xl font-black text-text uppercase tracking-tight">Select Contacts</h3>
                    <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border border-border rounded-xl text-sm w-48" />
                </div>
                <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border">
                                <th className="p-2 w-10">Select</th>
                                <th className="p-2">Name</th>
                                <th className="p-2">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c._id} className="border-b border-border/50 hover:bg-surface/50 cursor-pointer" onClick={() => onToggleSelect(c._id)}>
                                    <td className="p-2">
                                        <div className={`w-4 h-4 border-2 rounded ${selectedIds.includes(c._id) ? 'bg-primary border-primary' : 'border-border'}`} />
                                    </td>
                                    <td className="p-2 text-sm font-bold uppercase">{c.name}</td>
                                    <td className="p-2 text-sm text-text-muted">{c.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-border bg-surface text-center">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Done ({selectedIds.length})</button>
                </div>
            </motion.div>
        </div>
    );
}
