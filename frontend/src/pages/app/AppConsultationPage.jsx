import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    ClipboardList, 
    MapPin, 
    Sparkles, 
    Clock, 
    AlertCircle, 
    ChevronDown, 
    ChevronUp,
    FileText,
    CheckCircle2
} from 'lucide-react';
import AppBackButton from '../../components/app/AppBackButton';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import api from '../../services/api';

export default function AppConsultationPage() {
    const { customer } = useCustomerAuth();
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState(null);
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        accent: '#C8956C',
        accentLight: 'rgba(200, 149, 108, 0.15)',
        accentHover: '#B58159',
    };

    const fetchConsultations = async () => {
        try {
            const res = await api.get('/consultations/customer/me');
            if (res.data?.success) {
                setConsultations(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch consultations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultations();
    }, []);

    const toggleExpand = (id) => {
        if (expandedCard === id) {
            setExpandedCard(null);
        } else {
            setExpandedCard(id);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed':
                return {
                    bg: 'rgba(16, 185, 129, 0.1)',
                    text: '#10B981',
                    border: 'rgba(16, 185, 129, 0.2)',
                    label: 'Completed'
                };
            case 'in_progress':
                return {
                    bg: 'rgba(59, 130, 246, 0.1)',
                    text: '#3B82F6',
                    border: 'rgba(59, 130, 246, 0.2)',
                    label: 'In Progress'
                };
            case 'pending':
            default:
                return {
                    bg: 'rgba(245, 158, 11, 0.1)',
                    text: '#F59E0B',
                    border: 'rgba(245, 158, 11, 0.2)',
                    label: 'Pending Review'
                };
        }
    };

    const ConsultationSkeleton = () => (
        <div 
            className="rounded-3xl p-6 border animate-pulse space-y-4 mb-4"
            style={{ 
                background: colors.card,
                borderColor: colors.border
            }}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                    <div className="h-5 w-2/3 bg-black/5 dark:bg-white/5 rounded-md" />
                    <div className="h-3 w-1/2 bg-black/5 dark:bg-white/5 rounded-md" />
                </div>
                <div className="h-6 w-20 bg-black/5 dark:bg-white/5 rounded-full" />
            </div>
            <div className="border-t border-black/5 dark:border-white/5 pt-4 space-y-2">
                <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-md" />
                <div className="h-3 w-4/5 bg-black/5 dark:bg-white/5 rounded-md" />
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 pb-28 min-h-svh selection:bg-[#C8956C]/30"
            style={{ background: colors.bg }}
        >
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 pt-6 pb-6 flex items-center gap-4" style={{ background: colors.bg }}>
                <AppBackButton />
                <div>
                    <h1 
                        className="text-2xl font-black italic tracking-tighter" 
                        style={{ color: colors.text, fontFamily: "'SF Pro Display', sans-serif" }}
                    >
                        Consultation <span style={{ color: colors.accent }}>Records</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest mt-0.5 opacity-60 font-bold" style={{ color: colors.accent }}>
                        Treatment & Care Logs
                    </p>
                </div>
            </div>

            {/* Main Area */}
            <div className="relative mt-2">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <ConsultationSkeleton key={i} />)}
                    </div>
                ) : consultations.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ 
                            background: colors.card, 
                            border: `1px dashed ${colors.border}`,
                            boxShadow: isLight ? '0 20px 40px rgba(0,0,0,0.02)' : 'none'
                        }}
                        className="text-center py-16 px-6 rounded-[32px] mt-4"
                    >
                        <div 
                            style={{ 
                                background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)', 
                                border: `1px solid ${colors.border}` 
                            }} 
                            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6"
                        >
                            <ClipboardList className="w-8 h-8 opacity-25" style={{ color: colors.text }} />
                        </div>
                        <h4 className="text-base font-black italic mb-2" style={{ color: colors.text }}>No Records Available</h4>
                        <p 
                            className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-50 max-w-[240px] mx-auto" 
                            style={{ color: colors.textMuted }}
                        >
                            Your professional diagnosis history and recommended home care treatments will appear here after a stylist records them.
                        </p>
                        <div className="mt-8">
                            <button 
                                onClick={() => navigate('/app/booking')}
                                className="px-8 py-3.5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-[#C8956C]/10 w-full transition-all active:scale-[0.98]"
                                style={{ 
                                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentHover} 100%)`
                                }}
                            >
                                Book Consultation Session
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="relative">
                        {/* Elegant timeline line for dynamic aesthetic */}
                        <div 
                            className="absolute left-[29px] top-6 bottom-6 w-[2px] opacity-10 hidden xs:block"
                            style={{ background: colors.accent }}
                        />

                        <div className="space-y-5">
                            {consultations.map((c, index) => {
                                const status = getStatusStyle(c.status);
                                const isExpanded = expandedCard === c._id;
                                const formattedDate = new Date(c.date || c.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                                const followUpFormatted = c.followUpDate ? new Date(c.followUpDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                }) : null;

                                return (
                                    <motion.div
                                        key={c._id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                        className="relative flex gap-4"
                                    >
                                        {/* Timeline Node Icon Container */}
                                        <div className="hidden xs:flex flex-col items-center shrink-0">
                                            <div 
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300"
                                                style={{ 
                                                    background: isExpanded ? colors.accentLight : colors.card,
                                                    borderColor: isExpanded ? colors.accent : colors.border,
                                                    boxShadow: isExpanded ? `0 8px 24px ${colors.accent}15` : 'none'
                                                }}
                                            >
                                                <FileText 
                                                    size={20} 
                                                    style={{ color: isExpanded ? colors.accent : colors.textMuted }} 
                                                    className="opacity-80"
                                                />
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div 
                                            onClick={() => toggleExpand(c._id)}
                                            style={{ 
                                                background: colors.card, 
                                                border: `1px solid ${colors.border}`,
                                                boxShadow: isLight ? '0 12px 36px rgba(0,0,0,0.02)' : 'none',
                                                cursor: 'pointer'
                                            }} 
                                            className="p-5 sm:p-6 rounded-[28px] flex-1 group transition-all duration-300 hover:border-[#C8956C]/30 active:scale-[0.99]"
                                        >
                                            {/* Top info and status badge */}
                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                <div>
                                                    <h3 
                                                        className="text-base font-black italic tracking-tight uppercase leading-snug group-hover:text-[#C8956C] transition-colors"
                                                        style={{ color: colors.text, fontFamily: "'SF Pro Display', sans-serif" }}
                                                    >
                                                        {c.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                                                        <Clock size={11} className="shrink-0 text-[#C8956C]" />
                                                        <span style={{ color: colors.textMuted }}>{formattedDate}</span>
                                                    </div>
                                                </div>

                                                <span 
                                                    className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shrink-0"
                                                    style={{ 
                                                        background: status.bg, 
                                                        color: status.text, 
                                                        borderColor: status.border 
                                                    }}
                                                >
                                                    {status.label}
                                                </span>
                                            </div>

                                            {/* Details - Outlet mapping */}
                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
                                                {c.outletId && (
                                                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#C8956C]">
                                                        <MapPin size={11} />
                                                        <span>{c.outletId.name || 'Main Outlet'}, {c.outletId.city || ''}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Notes / Problem - summary version when collapsed */}
                                            {!isExpanded && (
                                                <div className="line-clamp-2 text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                                                    {c.notes}
                                                </div>
                                            )}

                                            {/* Expanded Detailed Sections */}
                                            <AnimatePresence initial={false}>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                        className="overflow-hidden space-y-4 mt-2"
                                                    >
                                                        {/* Segment 1: The Problem/Condition */}
                                                        <div 
                                                            className="rounded-2xl p-4 border"
                                                            style={{ 
                                                                background: isLight ? 'rgba(0,0,0,0.015)' : 'rgba(255,255,255,0.01)',
                                                                borderColor: colors.border
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <AlertCircle size={13} className="text-[#C8956C]" />
                                                                <h4 className="text-[9px] font-black uppercase tracking-widest text-[#C8956C]">
                                                                    Expert Observations
                                                                </h4>
                                                            </div>
                                                            <p className="text-xs leading-relaxed" style={{ color: colors.text }}>
                                                                {c.notes}
                                                            </p>
                                                        </div>

                                                        {/* Segment 2: Recommended Solution */}
                                                        <div 
                                                            className="rounded-2xl p-4 border"
                                                            style={{ 
                                                                background: 'rgba(200, 149, 108, 0.05)',
                                                                borderColor: 'rgba(200, 149, 108, 0.15)'
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <Sparkles size={13} className="text-[#C8956C]" />
                                                                <h4 className="text-[9px] font-black uppercase tracking-widest text-[#C8956C]">
                                                                    Prescribed Solutions & Rituals
                                                                </h4>
                                                            </div>
                                                            <p className="text-xs leading-relaxed font-medium" style={{ color: colors.text }}>
                                                                {c.solution}
                                                            </p>
                                                        </div>

                                                        {/* Segment 3: Follow up Schedule if available */}
                                                        {followUpFormatted && (
                                                            <div 
                                                                className="rounded-2xl p-4 border flex items-center justify-between gap-4"
                                                                style={{ 
                                                                    background: 'rgba(16, 185, 129, 0.03)',
                                                                    borderColor: 'rgba(16, 185, 129, 0.1)'
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20">
                                                                        <Calendar size={15} />
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="text-[9px] font-black uppercase tracking-widest text-emerald-500 leading-none">
                                                                            Recommended Follow-Up
                                                                        </h5>
                                                                        <p className="text-[8px] uppercase font-bold text-white/40 tracking-wider mt-1" style={{ color: colors.textMuted }}>
                                                                            Suggested Check-in Session
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg">
                                                                    {followUpFormatted}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Expand/Collapse Chevron Selector */}
                                            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                                                <span className="text-[8px] font-black uppercase tracking-wider opacity-30 group-hover:opacity-60 transition-opacity">
                                                    {isExpanded ? 'Tap to collapse' : 'Tap to expand history details'}
                                                </span>
                                                <div className="text-text-muted opacity-40 group-hover:text-[#C8956C] group-hover:opacity-80 transition-all">
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
