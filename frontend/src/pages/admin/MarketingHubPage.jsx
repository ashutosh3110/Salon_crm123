import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    MessageSquare, Mail, Share2, TrendingUp, Users, Send,
    Plus, Search, Filter, MoreVertical, CheckCircle, Clock,
    Eye, BarChart2, Smartphone, Facebook, Instagram,
    Zap, Calendar, Layout, Trash2, Edit3, ArrowRight, Bell,
    QrCode, Globe, Percent, XCircle, Save, Star, Download, CheckCircle2, Tag, Gift, ChevronRight, ChevronLeft, SmartphoneIcon, Target, Megaphone, RefreshCw, X
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

function SectionHeader({ title, desc, icon: Icon, badge, onRefresh, iconColor = 'text-primary', iconBg = 'bg-primary/5' }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-border/40">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full border border-border/50 flex items-center justify-center ${iconBg} ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-text tracking-tight flex items-center gap-3">
                        {title}
                        {badge && <span className="text-[8px] bg-emerald-600 text-white px-2.5 py-1 rounded-md uppercase tracking-[0.15em] font-black">{badge}</span>}
                    </h2>
                    <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest mt-0.5">{desc}</p>
                </div>
            </div>
            {onRefresh && (
                <button onClick={onRefresh} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-medium text-text-muted hover:text-primary hover:border-primary/40 transition-all">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
            )}
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
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
        { id: 'notification', label: 'App Notifications', icon: Bell, iconColor: 'text-blue-500', iconBg: 'bg-blue-500/10' },
    ];

    const filteredCampaigns = campaigns.filter(c => 
        activeTab === 'whatsapp' ? (c.channel === 'whatsapp' || !c.channel) : (c.channel === 'notification')
    );

    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
    const paginatedCampaigns = filteredCampaigns.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

    return (
        <div className="space-y-4 pb-6 px-1">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-left mb-4">
                <div className="text-left leading-none">
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase leading-none">Marketing Hub</h1>
                    <p className="text-[10px] font-bold text-text-muted mt-1.5 uppercase tracking-[0.2em] opacity-60 leading-none">Unified Audience Engagement & Retention Control</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {selectedCampaignIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 shadow-md active:scale-[0.98] transition-all leading-none"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedCampaignIds.length})
                        </button>
                    )}
                    <button
                        onClick={startCampaign}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#B4912B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#9a7b24] shadow-md transition-all leading-none text-white-force"
                    >
                        {activeTab === 'whatsapp' ? (
                            <svg className="w-3.5 h-3.5" fill="white" style={{ color: '#ffffff', fill: '#ffffff' }} viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        ) : (
                            <Bell className="w-3.5 h-3.5 icon-white-outline-force" />
                        )}
                        New {activeTab === 'whatsapp' ? 'WhatsApp' : 'Notification'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg border bg-white ${
                            activeTab === tab.id 
                            ? 'border-slate-800 text-slate-900 shadow-sm' 
                            : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        {tab.id === 'whatsapp' ? (
                            <svg className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-emerald-500' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        ) : (
                            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-400'}`} strokeWidth={2.5} />
                        )}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content: Campaign List */}
            <div className="space-y-4">
                {/* Section Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-[#dcfce7] dark:bg-green-500/10">
                        {activeTab === 'whatsapp' ? (
                            <svg className="w-7 h-7 text-[#16a34a] dark:text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        ) : (
                            <Bell className="w-7 h-7 text-[#16a34a] dark:text-green-400" strokeWidth={2} />
                        )}
                    </div>
                    <div className="flex flex-col items-start justify-center">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight">{activeTab === 'whatsapp' ? 'WhatsApp Campaigns' : 'App Notifications'}</h2>
                            <span className="!bg-[#B4912B] text-white text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full">Marketing</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.1em] mt-1.5">
                            {activeTab === 'whatsapp' ? 'Direct messages to customer WhatsApp' : 'Push notifications to customer mobile app'}
                        </p>
                    </div>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#dcfce7] dark:bg-green-500/10">
                            <Send className="w-5 h-5 text-[#16a34a] dark:text-green-400" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Campaigns</span>
                            <h3 className="text-[22px] font-black text-slate-900 dark:text-white leading-none mt-1">{filteredCampaigns.length || 4}</h3>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold mt-1 tracking-wide">All time campaigns</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#e0f2fe] dark:bg-blue-500/10">
                            <Send className="w-5 h-5 text-[#0ea5e9] dark:text-blue-400" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Completed</span>
                            <h3 className="text-[22px] font-black text-slate-900 dark:text-white leading-none mt-1">{filteredCampaigns.filter(c => c.status === 'completed').length || 4}</h3>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold mt-1 tracking-wide">
                                {filteredCampaigns.length > 0 ? Math.round((filteredCampaigns.filter(c => c.status === 'completed').length / filteredCampaigns.length) * 100) : 100}% of total
                            </span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#fef9c3] dark:bg-amber-500/10">
                            <Clock className="w-5 h-5 text-[#eab308] dark:text-amber-400" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Scheduled</span>
                            <h3 className="text-[22px] font-black text-slate-900 dark:text-white leading-none mt-1">{filteredCampaigns.filter(c => c.status === 'scheduled').length || 0}</h3>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold mt-1 tracking-wide">Upcoming campaigns</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#f3e8ff] dark:bg-purple-500/10">
                            <Mail className="w-5 h-5 text-[#9333ea] dark:text-purple-400" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Messages Sent</span>
                            <h3 className="text-[22px] font-black text-slate-900 dark:text-white leading-none mt-1">1,245</h3>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold mt-1 tracking-wide">Across all campaigns</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-2">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[#f8fafc]/50 dark:bg-slate-800/50">
                        <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Sent History</h3>
                        <button onClick={loadCampaigns} className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all bg-white dark:bg-slate-900 shadow-sm">
                            <RefreshCw className="w-3.5 h-3.5" /> REFRESH
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-[#f8fafc]/30 dark:bg-slate-800/30">
                                    <th className="px-6 py-4 text-left w-10">
                                        <button onClick={toggleSelectAll} className={`w-4 h-4 border-2 rounded transition-all ${selectedCampaignIds.length === filteredCampaigns.length && filteredCampaigns.length > 0 ? 'bg-[#16a34a] border-[#16a34a]' : 'border-slate-300 dark:border-slate-600'}`}>
                                            {selectedCampaignIds.length === filteredCampaigns.length && filteredCampaigns.length > 0 && <CheckCircle size={10} className="text-white mx-auto" strokeWidth={3} />}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">Campaign Name</th>
                                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">Status</th>
                                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">Date</th>
                                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] w-24">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading history...</td></tr>
                                ) : filteredCampaigns.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No campaigns found</td></tr>
                                ) : (
                                    paginatedCampaigns.map((c, idx) => {
                                        const colors = [
                                            { bg: 'bg-[#dcfce7]', text: '!text-[#16a34a] dark:!text-green-400' },
                                            { bg: 'bg-[#e0f2fe]', text: '!text-[#0ea5e9] dark:!text-blue-400' },
                                            { bg: 'bg-[#f3e8ff]', text: '!text-[#9333ea] dark:!text-purple-400' },
                                            { bg: 'bg-[#ffedd5]', text: '!text-[#f97316] dark:!text-orange-400' },
                                        ];
                                        const avatar = colors[idx % colors.length];
                                        const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'C';

                                        return (
                                            <tr key={c._id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${selectedCampaignIds.includes(c._id) ? 'bg-slate-50 dark:bg-slate-800/80' : ''}`}>
                                                <td className="px-6 py-5">
                                                    <button onClick={() => toggleSelect(c._id)} className={`w-4 h-4 border-2 rounded transition-all mt-1 ${selectedCampaignIds.includes(c._id) ? 'bg-[#16a34a] border-[#16a34a]' : 'border-slate-300 dark:border-slate-600'}`}>
                                                        {selectedCampaignIds.includes(c._id) && <CheckCircle size={10} className="text-white mx-auto" strokeWidth={3} />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-9 h-9 rounded-full ${avatar.bg} dark:bg-opacity-20 flex items-center justify-center shrink-0`}>
                                                            <span className={`${avatar.text} text-[10px] font-black tracking-widest uppercase`}>{getInitials(c.name)}</span>
                                                        </div>
                                                        <div className="flex flex-col text-left">
                                                            <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{c.name}</div>
                                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate max-w-[200px] mt-0.5 lowercase tracking-wider">{c.message || 'No description'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-left">
                                                    <span className={`inline-flex items-center gap-1.5 text-[8.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${c.status === 'completed' ? 'bg-[#dcfce7] dark:bg-green-500/10 !text-[#16a34a] dark:!text-green-400' : 'bg-amber-100 dark:bg-amber-500/10 !text-amber-600 dark:!text-amber-400'}`}>
                                                        {c.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />}
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-left">
                                                    <div className="text-[11px] font-black text-slate-900 dark:text-white tracking-wider">{new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/')}</div>
                                                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-wider">{new Date(c.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                                </td>
                                                <td className="px-6 py-5 text-left w-24">
                                                    <div className="flex items-center justify-start ml-2">
                                                        <button onClick={() => handleDelete(c._id)} className="w-8 h-8 rounded-[8px] border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-rose-200 dark:hover:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shadow-sm">
                                                            <Trash2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Footer */}
                    {filteredCampaigns.length > 0 && (
                        <div className="px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                                Showing {((safeCurrentPage - 1) * itemsPerPage) + 1} - {Math.min(safeCurrentPage * itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={safeCurrentPage === 1}
                                    className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    PREVIOUS
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-full text-[11px] font-black transition-all ${
                                            page === safeCurrentPage
                                                ? 'bg-[#B4912B] text-white shadow-md'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={safeCurrentPage === totalPages || totalPages === 0}
                                    className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    NEXT
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
                                className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
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
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
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
                                                                className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 group ${
                                                                    campaignForm.type === t.id
                                                                        ? '!border-[#B4912B] !bg-[#B4912B]/5'
                                                                        : 'border-slate-200 hover:border-[#B4912B]/50 bg-white dark:border-slate-700 dark:hover:border-[#B4912B]/50 dark:bg-slate-800/50'
                                                                }`}
                                                            >
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                                                    campaignForm.type === t.id ? '!bg-[#B4912B] !text-white' : 'bg-slate-100 text-slate-400 group-hover:text-[#B4912B] dark:bg-slate-800/80 dark:text-slate-400 dark:group-hover:text-[#B4912B]'
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
                                                                className="px-4 py-2 !bg-[#B4912B] !text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:!bg-[#9a7b24] transition-all shadow-md"
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

                                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shrink-0">
                                        <button
                                            type="button"
                                            onClick={handleSendCampaign}
                                            disabled={!campaignForm.name || !campaignForm.message || (campaignForm.type === 'selective' && campaignForm.selectedCustomers.length === 0) || isSending}
                                            className="w-full py-4 !bg-[#B4912B] !text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:!bg-[#9a7b24] transition-all disabled:cursor-not-allowed active:scale-[0.98] shadow-lg"
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
        <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-10 sm:pt-16 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-2xl max-h-[80vh] shadow-2xl relative overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b border-border dark:border-slate-700 flex items-center justify-between gap-4">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Select Contacts</h3>
                    <div className="flex items-center gap-3">
                        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border border-border dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl text-sm w-48" />
                        <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <X className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-text-muted dark:text-slate-400 uppercase tracking-widest border-b border-border dark:border-slate-700">
                                <th className="p-2 w-10">Select</th>
                                <th className="p-2">Name</th>
                                <th className="p-2">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c._id} className="border-b border-border/50 dark:border-slate-700/50 hover:bg-surface/50 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => onToggleSelect(c._id)}>
                                    <td className="p-2">
                                        <div className={`w-4 h-4 border-2 rounded transition-colors ${selectedIds.includes(c._id) ? '!bg-[#B4912B] !border-[#B4912B]' : 'border-border dark:border-slate-500'}`} />
                                    </td>
                                    <td className="p-2 text-sm font-bold text-slate-900 dark:text-white uppercase">{c.name}</td>
                                    <td className="p-2 text-sm text-text-muted dark:text-slate-400">{c.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-border dark:border-slate-700 bg-surface dark:bg-slate-800 text-center">
                    <button onClick={onClose} className="px-8 py-3 !bg-[#B4912B] !text-white hover:!bg-[#9a7b24] transition-colors rounded-xl text-[10px] font-black uppercase tracking-widest">Done ({selectedIds.length})</button>
                </div>
            </motion.div>
        </div>
    );
}
