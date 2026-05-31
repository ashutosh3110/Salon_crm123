import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Users,
    DownloadCloud,
    Calendar,
    ArrowDownRight,
    PieChart as PieIcon,
    BarChart3,
    Activity,
    Package,
    ChevronDown,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';
import FinanceDashboard from '../../components/admin/finance/FinanceDashboard';
import ExpenseTracker from '../../components/admin/finance/ExpenseTracker';
import SalesReports from '../../components/admin/finance/SalesReports';
import EndOfDay from '../../components/admin/finance/EndOfDay';
import Transactions from '../../components/admin/finance/Transactions';
import CashAndBank from '../../components/admin/finance/CashAndBank';
import SupplierManager from '../../components/admin/finance/SupplierManager';
import SupplierInvoices from '../../components/admin/finance/SupplierInvoices';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function formatInrShort(n) {
    if (n == null || Number.isNaN(Number(n))) return '₹0';
    const v = Number(n);
    return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

function CustomDropdown({ value, onChange, options, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
        <div className="relative w-full sm:w-auto" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full sm:min-w-[180px] gap-3 bg-surface border border-border px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-text hover:border-primary transition-all shadow-sm active:scale-[0.98]"
            >
                <span className="truncate">
                    {options.find(o => o.value === value)?.label || placeholder}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-text-muted shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-64 bg-surface border border-border/40 rounded-xl shadow-lg z-[100] overflow-hidden"
                    >
                        <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
                            <button
                                onClick={() => { onChange('all'); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${value === 'all' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-surface-alt hover:text-primary'}`}
                            >
                                {placeholder}
                            </button>
                            {options.map(o => (
                                <button
                                    key={o.value}
                                    onClick={() => { onChange(o.value); setIsOpen(false); }}
                                    className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${value === o.value ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-surface-alt hover:text-primary'}`}
                                >
                                    {o.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FinancePage({ tab = 'dashboard' }) {
    const activeTab = tab;
    const { outlets = [], activeOutletId } = useBusiness();
    const [selectedOutletId, setSelectedOutletId] = useState(() => activeOutletId || 'all');
    const [financeData, setFinanceData] = useState(null);
    const [financeLoading, setFinanceLoading] = useState(true);
    const [financeError, setFinanceError] = useState(null);

    useEffect(() => {
        if (activeOutletId && selectedOutletId === 'all') {
            setSelectedOutletId(activeOutletId);
        }
    }, [activeOutletId]);

    const loadFinance = useCallback(() => {
        setFinanceLoading(true);
        setFinanceError(null);
        api
            .get('/finance/summary', { params: { outletId: selectedOutletId } })
            .then((res) => setFinanceData(res.data?.data))
            .catch((e) => {
                setFinanceError(
                    e?.networkHint ||
                        e?.response?.data?.message ||
                        e.message ||
                        'Failed to load'
                );
                setFinanceData(null);
            })
            .finally(() => setFinanceLoading(false));
    }, [selectedOutletId]);

    useEffect(() => {
        loadFinance();
    }, [loadFinance, activeTab]);

    const allocationData = useMemo(() => {
        const ca = financeData?.costAllocation || [];
        if (!ca.length) {
            return [];
        }
        return ca.map((c, i) => ({
            name: String(c.label || 'other').toUpperCase().slice(0, 14),
            value: Math.max(1, c.percentage || 0),
            color: CHART_COLORS[i % CHART_COLORS.length],
        }));
    }, [financeData]);

    const hasExpenseMix = allocationData.length > 0;

    const flowData = useMemo(() => {
        const m = financeData?.monthlyTrend || [];
        return m.slice(-6).map(({ name, revenue, expense }) => ({
            name: name || '—',
            inflow: revenue ?? 0,
            outflow: expense ?? 0,
        }));
    }, [financeData]);

    const kpis = financeData?.kpis || {};

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {activeTab === 'dashboard' ? (
                <>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                        <div className="text-left font-black leading-none">
                            <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Finances</h1>
                            <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-relaxed text-left max-w-2xl">
                                Live summary from <span className="font-mono">/finance/dashboard</span>
                                <span className="block mt-1.5 normal-case tracking-normal text-[11px] font-bold opacity-90">
                                    POS sales, expense ledger, and inventory stock-in (this month). ₹0 means no activity yet in that lane.
                                </span>
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 text-left font-black w-full lg:w-auto mt-4 lg:mt-0">
                            {outlets.length > 0 && (
                                <CustomDropdown
                                    value={selectedOutletId}
                                    onChange={setSelectedOutletId}
                                    options={outlets.map(o => ({ value: o._id, label: o.name }))}
                                    placeholder="All Outlets"
                                />
                            )}
                            <button
                                type="button"
                                onClick={loadFinance}
                                disabled={financeLoading}
                                className="flex justify-center items-center gap-3 bg-primary/10 border border-primary/30 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--color-primary),0.4)] transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
                            >
                                <DownloadCloud className="w-4 h-4" />
                                Refresh data
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left font-black auto-rows-fr">
                        <FinanceKPICard
                            title="Customer Sales"
                            value={financeLoading ? '…' : formatInrShort(kpis.grossInflow ?? 0)}
                            icon={TrendingUp}
                            color="blue"
                            trend="POS Bills"
                        />
                        <FinanceKPICard
                            title="Shop Expenses"
                            value={financeLoading ? '…' : formatInrShort(kpis.totalExpenses ?? 0)}
                            icon={ArrowDownRight}
                            color="rose"
                            trend="Salary, Rent, Bills"
                        />
                        <FinanceKPICard
                            title="Supplier Purchases"
                            value={financeLoading ? '…' : formatInrShort(kpis.supplierPurchasesMtd ?? 0)}
                            icon={Package}
                            color="violet"
                            trend="Product Stock"
                        />
                        <FinanceKPICard
                            title="Net Profit"
                            value={financeLoading ? '…' : formatInrShort(kpis.netLiquidity ?? 0)}
                            icon={Activity}
                            color="emerald"
                            trend="Income − Expenses"
                        />
                    </div>
                </>
            ) : (
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left border-b border-border pb-4">
                    <div className="text-left font-black leading-none">
                        <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Finances</h1>
                        <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-relaxed text-left max-w-2xl">
                            Live Workspace · <span className="font-mono">/finance/{activeTab}</span>
                        </p>
                    </div>
                    {outlets.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 text-left font-black w-full lg:w-auto mt-4 lg:mt-0">
                            <CustomDropdown
                                value={selectedOutletId}
                                onChange={setSelectedOutletId}
                                options={outlets.map(o => ({ value: o._id, label: o.name }))}
                                placeholder="All Outlets"
                            />
                        </div>
                    )}
                </div>
            )}

            {financeError ? (
                <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900 px-4 py-3 text-left"
                >
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-300 mb-1">
                        Could not load finance summary
                    </p>
                    <p className="text-sm font-bold text-rose-800 dark:text-rose-200 break-words">{financeError}</p>
                    <button
                        type="button"
                        onClick={loadFinance}
                        className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary underline underline-offset-2"
                    >
                        Try again
                    </button>
                </div>
            ) : null}

            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden min-h-[650px] text-left font-black">
                {activeTab === 'dashboard' && (
                    <FinanceDashboard
                        data={financeData}
                        loading={financeLoading}
                        error={financeError}
                        onRetry={loadFinance}
                        outletId={selectedOutletId}
                    />
                )}
                {activeTab === 'transactions' && <Transactions outletId={selectedOutletId} />}
                {activeTab === 'suppliers' && <SupplierManager />}
                {activeTab === 'invoices' && <SupplierInvoices />}
                {activeTab === 'cash-book' && <CashAndBank type="cash" outletId={selectedOutletId} />}
                {activeTab === 'bank-book' && <CashAndBank type="bank" outletId={selectedOutletId} />}
                {activeTab === 'expenses' && <ExpenseTracker outletId={selectedOutletId} />}
                {activeTab === 'reports' && <SalesReports outletId={selectedOutletId} />}
                {activeTab === 'eod' && <EndOfDay outletId={selectedOutletId} />}
            </div>
        </div>
    );
}

const colorStyles = {
    blue: {
        iconColor: '!text-[#2563EB] dark:!text-[#60A5FA]',
        iconBg: '!bg-[#DBEAFE] dark:!bg-[#2563EB]/20',
        cardBg: '!bg-[#EFF6FF] dark:!bg-[#2563EB]/5',
        cardBorder: '!border-[#DBEAFE] dark:!border-[#2563EB]/15 hover:!border-[#93C5FD] dark:hover:!border-[#60A5FA]/50',
    },
    emerald: {
        iconColor: '!text-[#059669] dark:!text-[#34D399]',
        iconBg: '!bg-[#D1FAE5] dark:!bg-[#059669]/20',
        cardBg: '!bg-[#F0FDF4] dark:!bg-[#059669]/5',
        cardBorder: '!border-[#DCFCE7] dark:!border-[#059669]/15 hover:!border-[#86EFAC] dark:hover:!border-[#34D399]/50',
    },
    rose: {
        iconColor: '!text-[#E11D48] dark:!text-[#FB7185]',
        iconBg: '!bg-[#FFE4E6] dark:!bg-[#E11D48]/20',
        cardBg: '!bg-[#FFF1F2] dark:!bg-[#E11D48]/5',
        cardBorder: '!border-[#FFE4E6] dark:!border-[#E11D48]/15 hover:!border-[#FDA4AF] dark:hover:!border-[#FB7185]/50',
    },
    violet: {
        iconColor: '!text-[#7C3AED] dark:!text-[#A78BFA]',
        iconBg: '!bg-[#EDE9FE] dark:!bg-[#7C3AED]/20',
        cardBg: '!bg-[#FAF5FF] dark:!bg-[#7C3AED]/5',
        cardBorder: '!border-[#F3E8FF] dark:!border-[#7C3AED]/15 hover:!border-[#D8B4FE] dark:hover:!border-[#A78BFA]/50',
    },
    orange: {
        iconColor: '!text-[#EA580C] dark:!text-[#FB923C]',
        iconBg: '!bg-[#FFEDD5] dark:!bg-[#EA580C]/20',
        cardBg: '!bg-[#FFF7ED] dark:!bg-[#EA580C]/5',
        cardBorder: '!border-[#FFEDD5] dark:!border-[#EA580C]/15 hover:!border-[#FDBA74] dark:hover:!border-[#FB923C]/50',
    }
};

function FinanceKPICard({ title, value, icon: Icon, color, trend, className = '', to }) {
    const styles = colorStyles[color] || colorStyles.blue;
    const trendText = trend != null ? String(trend) : '—';

    const content = (
        <div className="flex !items-start gap-3 !text-left">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg}`}>
                <Icon className={`w-4 h-4 ${styles.iconColor}`} strokeWidth={2} />
            </div>
            
            <div className="flex flex-col !items-start !text-left">
                <span 
                    style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }} 
                    className="uppercase text-slate-500 dark:text-slate-450 leading-none mb-1.5 !text-left"
                >
                   {title}
                </span>
                <h3 
                    style={{ fontSize: '24px', fontWeight: 850 }} 
                    className="text-slate-800 dark:text-slate-50 leading-none tracking-tight !text-left break-words min-w-0"
                >
                    {value}
                </h3>
                <span 
                    style={{ fontSize: '12px', fontWeight: 500 }} 
                    className="text-slate-500 dark:text-slate-400 mt-1.5 !text-left"
                >
                    {trendText}
                </span>
            </div>
        </div>
    );

    const cardClasses = `!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md ${styles.cardBg} ${styles.cardBorder} ${className}`;

    if (to) {
        return (
            <Link to={to} className={cardClasses}>
                {content}
            </Link>
        );
    }

    return (
        <div className={cardClasses}>
            {content}
        </div>
    );
}
