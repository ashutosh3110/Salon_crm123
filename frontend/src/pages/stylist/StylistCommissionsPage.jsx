import { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, DollarSign, Calendar, ArrowUpRight, Award, Zap, CreditCard, Activity, Target, Shield, X, CheckCircle2, ChevronDown, Award as AwardIcon, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const PERIODS = ['CURRENT_CYCLE', 'PREVIOUS_CYCLE', 'FISCAL_YTD', 'CUSTOM_RANGE'];

export default function StylistCommissionsPage() {
    const [period, setPeriod] = useState(PERIODS[0]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
    const [showSlabModal, setShowSlabModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payload, setPayload] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/hr/commissions/me', {
                params: { period },
            });
            const body = res.data;
            const data = body?.data ?? body;
            setPayload(data || null);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load credit stream');
            setPayload(null);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        load();
    }, [load]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const stats = payload?.stats || [];
    const earningsHistory = payload?.earningsHistory || [];
    const performance = payload?.performance;
    const incentiveSlabs = payload?.incentiveSlabs || [];
    const protocolNote = payload?.protocolNote;
    const periodInfo = payload?.period;

    const filteredRows = useMemo(() => {
        if (statusFilter === 'ALL') return earningsHistory;
        return earningsHistory.filter((r) => r.status === statusFilter);
    }, [earningsHistory, statusFilter]);

    const statusOptions = useMemo(() => {
        const u = [...new Set(earningsHistory.map((r) => r.status))];
        return ['ALL', ...u];
    }, [earningsHistory]);

    const progressPct = Math.min(100, Math.max(0, performance?.progressPercent ?? 0));

    /** Same typography as table date column: Open Sans + font-black + 10px + muted + uppercase */
    const cs = 'font-black text-[10px] uppercase text-text-muted';
    const csText = `${cs} transition-colors`;
    const csHeading = 'font-black text-[10px] uppercase text-text tracking-[0.2em]';
    const csStrong = 'font-black text-[10px] uppercase text-text';

    return (
        <div className="credit-stream-section space-y-4 text-left font-sans font-black">
            <style>{`
                .credit-stream-section h1,
                .credit-stream-section h2 {
                    font-family: 'Open Sans', sans-serif !important;
                }
            `}</style>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        <span className={`${csText} tracking-[0.3em] text-primary`}>Earnings Stream</span>
                    </div>
                    <h1 className="text-2xl font-black text-text tracking-tighter uppercase !font-sans">My Commissions</h1>
                    <p className={`${csText} tracking-widest mt-0.5 not-italic`}>
                        {periodInfo?.label?.replace(/_/g, ' ')} · Live from server
                    </p>
                </div>
                <div className="flex gap-2 relative flex-wrap">
                    <button
                        type="button"
                        onClick={() => load()}
                        className={`flex items-center gap-2 px-4 py-3 bg-surface border border-border ${csText} tracking-widest hover:text-primary`}
                        title="Refresh"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                        className={`flex items-center gap-2 px-5 py-3 bg-surface border border-border ${csText} hover:text-text hover:border-primary/50 transition-all tracking-[0.2em]`}
                    >
                        <Calendar className="w-3.5 h-3.5" /> {period.replace(/_/g, ' ')} <ChevronDown className="w-3 h-3 ml-2" />
                    </button>

                    <AnimatePresence>
                        {showPeriodDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full right-0 mt-2 w-56 bg-surface dark:bg-slate-900 border border-border dark:border-slate-700 shadow-2xl z-50 py-2"
                            >
                                {PERIODS.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => {
                                            setPeriod(p);
                                            setShowPeriodDropdown(false);
                                            showToast(`Period: ${p.replace(/_/g, ' ')}`);
                                        }}
                                        className={`w-full px-6 py-4 text-left ${csText} tracking-widest hover:bg-surface-alt dark:hover:bg-slate-800 ${period === p ? 'text-primary' : ''}`}
                                    >
                                        {p.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {error && (
                <div className={`p-4 border border-rose-500/30 bg-rose-500/5 ${csStrong} text-rose-600`}>{error}</div>
            )}

            {protocolNote && (
                <p className={`${csText} tracking-wide leading-relaxed border border-border/40 bg-surface-alt/30 px-4 py-3`}>
                    {protocolNote}
                </p>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading && !payload ? (
                    <div className={`col-span-full py-8 text-center ${csText}`}>Loading…</div>
                ) : (
                    stats.map((s) => {
                        const iconMap = {
                            totalEarned: { icon: DollarSign, colorHex: '#059669', darkColorHex: '#34D399', bgClass: '!bg-[#D1FAE5] dark:!bg-[#059669]/20', cardBgClass: '!bg-[#F0FDF4] dark:!bg-[#059669]/5', cardBorderClass: '!border-[#DCFCE7] dark:!border-[#059669]/15 hover:!border-[#86EFAC] dark:hover:!border-[#34D399]/50' },
                            yieldUnits: { icon: Zap, colorHex: '#D97706', darkColorHex: '#FBBF24', bgClass: '!bg-[#FEF9C3] dark:!bg-[#B4912B]/20', cardBgClass: '!bg-yellow-50/50 dark:!bg-[#B4912B]/5', cardBorderClass: '!border-yellow-100 dark:!border-[#B4912B]/15 hover:!border-yellow-300 dark:hover:!border-[#B4912B]/50' },
                            repIndex: { icon: Award, colorHex: '#EA580C', darkColorHex: '#FB923C', bgClass: '!bg-[#FFEDD5] dark:!bg-[#EA580C]/20', cardBgClass: '!bg-[#FFF7ED] dark:!bg-[#EA580C]/5', cardBorderClass: '!border-[#FFEDD5] dark:!border-[#EA580C]/15 hover:!border-[#FDBA74] dark:hover:!border-[#FB923C]/50' },
                            baseAllocation: { icon: CreditCard, colorHex: '#2563EB', darkColorHex: '#60A5FA', bgClass: '!bg-[#DBEAFE] dark:!bg-[#2563EB]/20', cardBgClass: '!bg-[#EFF6FF] dark:!bg-[#2563EB]/5', cardBorderClass: '!border-[#DBEAFE] dark:!border-[#2563EB]/15 hover:!border-[#93C5FD] dark:hover:!border-[#60A5FA]/50' },
                        };
                        const { icon: Icon, colorHex, darkColorHex, bgClass, cardBgClass, cardBorderClass } = iconMap[s.key] || iconMap.totalEarned;
                        
                        const title = s.key === 'totalEarned' ? 'Total commissions' : s.key === 'yieldUnits' ? 'Service lines' : s.key === 'repIndex' ? 'Reputation (feedback)' : 'Fixed base salary';
                        
                        // Detect dark mode from document element to use appropriate hex color
                        const isDark = document.documentElement.classList.contains('dark');
                        const activeColor = isDark ? darkColorHex : colorHex;

                        return (
                            <div key={s.key} className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md ${cardBgClass} ${cardBorderClass}`}>
                                <div className="flex !items-start gap-3 !text-left">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`} style={{ borderRadius: '12px' }}>
                                        <Icon className="w-4 h-4" strokeWidth={2.5} style={{ color: activeColor, stroke: activeColor }} />
                                    </div>
                                    <div className="flex flex-col !items-start !text-left">
                                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }} className="uppercase text-slate-500 dark:text-slate-450 leading-none mb-1.5 !text-left">
                                            {title}
                                        </span>
                                        <h3 style={{ fontSize: '24px', fontWeight: 850 }} className="text-slate-800 dark:text-slate-50 leading-none tracking-tight !text-left">
                                            {s.value}
                                        </h3>
                                        <span style={{ fontSize: '12px', fontWeight: 500 }} className="text-slate-500 dark:text-slate-400 mt-1.5 !text-left">
                                            {s.sub}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-surface border border-border overflow-hidden !rounded-[24px]">
                    <div className="px-5 py-4 border-b border-border/20 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h2 className={`${csHeading} tracking-[0.2em]`}>Recent earnings log</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            {statusOptions.map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => setStatusFilter(st)}
                                    className={`${csText} px-2 py-1 border rounded-lg ${statusFilter === st ? 'bg-primary text-white border-primary !text-white' : 'border-border'}`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className={`border-b border-border/20 bg-background/30 ${csHeading} tracking-[0.2em]`}>
                                    <th className="px-8 py-4 text-text-muted">Date</th>
                                    <th className="px-8 py-4 text-text-muted">Services</th>
                                    <th className="px-8 py-4 text-text-muted">Line / bill</th>
                                    <th className="px-8 py-4 text-text-muted text-right">My commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {filteredRows.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <img 
                                                    src="/vector iamge 4.png" 
                                                    alt="No data available" 
                                                    className="w-32 h-32 object-contain opacity-60 mb-4" 
                                                />
                                                <p className={csText}>No commission lines in this period</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRows.map((row) => (
                                        <tr key={row.id} className="hover:bg-surface-alt/50 transition-all group font-black">
                                            <td className={`px-8 py-5 ${csText} group-hover:text-text`}>{row.date}</td>
                                            <td className={`px-8 py-5 ${csStrong}`}>{row.services}</td>
                                            <td className={`px-8 py-5 ${csStrong}`}>{`₹${Number(row.revenue || 0).toLocaleString('en-IN')}`}</td>
                                            <td className="px-8 py-5 text-right font-black !font-sans">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[11px] text-emerald-500 font-black tracking-tight !font-sans uppercase">{`₹${Number(row.commission || 0).toLocaleString('en-IN')}`}</span>
                                                    <span
                                                        className={`${cs} tracking-widest mt-1 text-[7px] ${row.status === 'SETTLED' ? 'text-primary/70' : 'text-amber-500'}`}
                                                    >
                                                        [{row.status}]
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-8 flex flex-col justify-between relative overflow-hidden group !rounded-[24px] shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#B4912B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#B4912B]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>



                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-[#B4912B]/10 flex items-center justify-center border border-[#B4912B]/20">
                                <TrendingUp className="w-5 h-5 text-amber-500" strokeWidth={2.5} style={{ color: '#B4912B', stroke: '#B4912B' }} />
                            </div>
                            <h2 className="text-[13px] font-extrabold text-slate-800 dark:text-slate-200 tracking-[0.2em] uppercase">Revenue goal (bookings)</h2>
                        </div>

                        <div className="flex-1 flex flex-col justify-center items-center py-8">
                            <div className="relative flex flex-col items-center justify-center">
                                {/* Decorative glow behind percentage */}
                                <div className="absolute inset-0 w-40 h-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-[#B4912B]/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
                                
                                <div className="text-center relative z-10">
                                    <p className="text-[76px] leading-none font-black text-slate-900 dark:text-white tracking-tighter !font-sans drop-shadow-sm">
                                        {progressPct}<span className="text-[40px] text-slate-300 dark:text-slate-600 ml-1 font-bold">%</span>
                                    </p>
                                    <div className="mt-6 flex flex-col items-center gap-2">
                                        <p className="text-[10px] font-black tracking-[0.2em] uppercase bg-[#B4912B]/10 px-3.5 py-1 rounded-full border border-[#B4912B]/20" style={{ color: '#B4912B' }}>Target progress</p>
                                        <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400 mt-2 tracking-tight">
                                            ₹{Number(performance?.bookingRevenue || 0).toLocaleString('en-IN')} <span className="text-slate-300 dark:text-slate-700 font-normal mx-1">/</span> ₹{Number(performance?.goal || 0).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto space-y-4 pt-10">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Completed booking revenue</span>
                                <span className="text-[10px] font-black tracking-[0.1em] uppercase bg-[#B4912B]/10 px-2.5 py-1 rounded-md border border-[#B4912B]/10" style={{ color: '#B4912B' }}>{performance?.quotaLabel || '—'}</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-[#e3b63d] to-[#B4912B] rounded-full relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/20"></div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowSlabModal(true)}
                        className="mt-8 relative z-10 w-full py-4 rounded-[16px] font-black text-[12px] uppercase tracking-[0.2em] hover:-translate-y-0.5 active:translate-y-0 transition-all group overflow-hidden shadow-xl hover:shadow-2xl dark:shadow-none"
                        style={{ backgroundColor: '#B4912B', color: '#ffffff' }}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            View incentive reference <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform stroke-[2.5px]" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                        </span>
                        <div className="absolute inset-0 bg-white/10 dark:bg-black/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showSlabModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSlabModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg rounded-none border border-border shadow-2xl relative p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-[0.06] dark:opacity-[0.08] -translate-y-4 translate-x-4">
                                <AwardIcon className="w-32 h-32 text-primary" />
                            </div>
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight !font-sans">Incentive reference</h2>
                                    <p className={`${csText} text-primary mt-1 tracking-widest !text-primary`}>Illustrative tiers (configure in payroll)</p>
                                </div>
                                <button type="button" onClick={() => setShowSlabModal(false)} className="w-10 h-10 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {incentiveSlabs.map((slab, idx) => (
                                    <div key={idx} className="p-6 border flex items-center justify-between transition-all bg-background/50 border-border/40">
                                        <div>
                                            <p className={`${csText} tracking-widest`}>{slab.tier}</p>
                                            <p className="text-sm font-black text-text mt-1 uppercase tracking-tight !font-sans">{slab.range}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-text tracking-tighter !font-sans">{slab.yield}</p>
                                            <p className={`${cs} text-[8px] text-primary italic !text-primary`}>{slab.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-5 bg-surface-alt border border-border flex items-center gap-4 relative z-10">
                                <Shield className="w-5 h-5 text-primary shrink-0" />
                                <p className={`${csText} leading-relaxed tracking-widest italic`}>
                                    Actual POS commission rate is applied at checkout (default 10% of service line). Payroll marks commission rows as paid when settled.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-black !font-sans text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
