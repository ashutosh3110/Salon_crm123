import { useState, useMemo } from 'react';
import {
    BarChart3, TrendingDown, TrendingUp, Calendar, Download,
    Package, ShoppingBag, Scissors, RefreshCw, Filter,
    Eye, CheckCircle2, Target, Pencil, RotateCcw, Info, AlertTriangle, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    CartesianGrid, Legend, LineChart, Line, ReferenceLine, Area, AreaChart
} from 'recharts';
import { useInventory } from '../../contexts/InventoryContext';
import { exportToExcel } from '../../utils/exportUtils';

// ── Sub-type badge ────────────────────────────────────────────
function SubTypeBadge({ subType }) {
    const cfg = {
        retail_sale: { label: 'Retail Sale', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
        service_usage: { label: 'Service Usage', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
        wastage: { label: 'Wastage', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
        return: { label: 'Return', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    };
    const c = cfg[subType] || { label: subType, color: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${c.color}`}>
            {c.label}
        </span>
    );
}

// ── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = {
        'On Track': { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
        'Over Budget': { color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: TrendingUp },
        'Under Budget': { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: TrendingDown },
    };
    const c = cfg[status] || cfg['On Track'];
    const Icon = c.icon;
    return (
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1 w-fit ${c.color}`}>
            <Icon className="w-2.5 h-2.5" />{status}
        </span>
    );
}

// ── Custom Recharts Tooltip ───────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface border border-border/40 rounded-xl p-3 shadow-xl text-left">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">{label}</p>
            {payload.map(p => (
                <div key={p.name} className="flex items-center gap-2 text-xs font-bold">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
                    <span className="text-text-secondary capitalize">{p.name}:</span>
                    <span className="text-text font-black">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

const TABS = ['Overview', 'Reconciliation', 'Projections', 'Transaction Log'];

export default function UsageReportsPage() {
    const {
        products, stats, saleRecords, reconciliationData,
        projectionSummary, setProjection, resetProjection, outlets
    } = useInventory();

    const [activeTab, setActiveTab] = useState('Projections');
    const [filterSubType, setFilterSubType] = useState('All');
    const [filterOutlet, setFilterOutlet] = useState('All');
    const [expandedRow, setExpandedRow] = useState(null);
    const [editingRow, setEditingRow] = useState(null);   // sku being edited
    const [editValue, setEditValue] = useState('');
    const [selectedSku, setSelectedSku] = useState(
        projectionSummary?.[0]?.sku || ''
    );

    // ── Overview stats ────────────────────────────────────────
    const totalRetailQty = saleRecords.filter(r => r.subType === 'retail_sale').reduce((s, r) => s + r.qty, 0);
    const totalServiceQty = saleRecords.filter(r => r.subType === 'service_usage').reduce((s, r) => s + r.qty, 0);
    const totalRetailValue = saleRecords.filter(r => r.subType === 'retail_sale').reduce((s, r) => s + r.total, 0);
    const totalSvcValue = saleRecords.filter(r => r.subType === 'service_usage').reduce((s, r) => s + r.total, 0);

    // ── Transaction Log filters ───────────────────────────────
    const filteredRecords = useMemo(() =>
        saleRecords.filter(r => {
            const matchType = filterSubType === 'All' || r.subType === filterSubType;
            const matchOutlet = filterOutlet === 'All' || r.outletId === filterOutlet;
            return matchType && matchOutlet;
        }), [saleRecords, filterSubType, filterOutlet]);

    // ── Selected product trend for line chart ─────────────────
    const selectedTrend = projectionSummary.find(p => p.sku === selectedSku)?.trend || [];

    // ── Export handlers ───────────────────────────────────────
    const handleExport = () => {
        const data = reconciliationData.map(r => ({
            Product: r.productName, SKU: r.sku,
            'Retail Qty': r.retailQty, 'Retail Value (₹)': r.retailValue,
            'Service Qty': r.serviceQty, 'Service Value (₹)': r.serviceValue,
            'Total Qty': r.retailQty + r.serviceQty,
        }));
        exportToExcel(data, 'Reconciliation_Report', 'Reconciliation');
    };
    const handleExportProjections = () => {
        const data = projectionSummary.map(p => ({
            Product: p.productName, SKU: p.sku,
            Projected: p.projected, Actual: p.actual,
            Variance: p.variance, 'Variance %': `${p.variancePct}%`,
            Status: p.status,
        }));
        exportToExcel(data, 'Projection_Analysis', 'Projections');
    };

    const handleSaveEdit = (sku) => {
        if (editValue !== '' && !isNaN(Number(editValue))) setProjection(sku, editValue);
        setEditingRow(null); setEditValue('');
    };

    // ── Bar chart: all products projected vs actual ───────────
    const barData = projectionSummary.map(p => ({
        name: p.productName.split(' ').slice(0, 2).join(' '),
        Projected: p.projected,
        Actual: p.actual,
        sku: p.sku,
    }));

    // ── Projection KPIs ───────────────────────────────────────
    const onTrackCount = projectionSummary.filter(p => p.status === 'On Track').length;
    const overBudgetCount = projectionSummary.filter(p => p.status === 'Over Budget').length;
    const underCount = projectionSummary.filter(p => p.status === 'Under Budget').length;
    const avgVariance = projectionSummary.length > 0
        ? Math.round(projectionSummary.reduce((s, p) => s + Math.abs(p.variancePct), 0) / projectionSummary.length)
        : 0;

    return (
        <div className="space-y-5">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Usage Reports</h1>
                    <p className="text-sm text-text-muted font-medium">Retail sales vs service consumption reconciliation & forecasting</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={activeTab === 'Projections' ? handleExportProjections : handleExport}
                        className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border/40 rounded-xl text-sm font-bold text-text-secondary hover:bg-surface-alt transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <Calendar className="w-4 h-4" /> Date Range
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Retail Sales (Qty)', value: totalRetailQty, sub: `₹${(totalRetailValue / 1000).toFixed(1)}k revenue`, color: 'text-violet-600', bg: 'bg-violet-500/10', icon: ShoppingBag },
                    { label: 'Service Usage (Qty)', value: totalServiceQty, sub: `₹${(totalSvcValue / 1000).toFixed(1)}k consumed`, color: 'text-blue-600', bg: 'bg-blue-500/10', icon: Scissors },
                    { label: 'Total Value', value: `₹${((totalRetailValue + totalSvcValue) / 1000).toFixed(1)}k`, sub: 'Combined movement', color: 'text-primary', bg: 'bg-primary/10', icon: BarChart3 },
                    { label: 'Products Tracked', value: reconciliationData.length, sub: 'Unique SKUs in log', color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: Package },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm">
                        <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                            <s.icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{s.label}</p>
                        <p className="text-[9px] text-text-muted italic mt-1">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 p-1 bg-surface rounded-2xl border border-border/40 w-fit overflow-x-auto">
                {TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:text-text'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ══════════ TAB 1: OVERVIEW ══════════ */}
                {activeTab === 'Overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                        <div className="grid lg:grid-cols-2 gap-5">
                            <div className="bg-surface rounded-3xl border border-border/40 p-6 shadow-sm">
                                <h2 className="text-sm font-black text-text uppercase tracking-widest mb-5">Usage Split</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Retail Sales', qty: totalRetailQty, value: totalRetailValue, color: 'bg-violet-500', textColor: 'text-violet-600', pct: Math.round((totalRetailQty / (totalRetailQty + totalServiceQty || 1)) * 100) },
                                        { label: 'Service Usage', qty: totalServiceQty, value: totalSvcValue, color: 'bg-blue-500', textColor: 'text-blue-600', pct: Math.round((totalServiceQty / (totalRetailQty + totalServiceQty || 1)) * 100) },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                                    <span className="text-sm font-bold text-text">{item.label}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-sm font-black ${item.textColor}`}>{item.qty} units</span>
                                                    <span className="text-[10px] text-text-muted ml-2">₹{(item.value / 1000).toFixed(1)}k</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-border/10">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 1, ease: 'backOut' }}
                                                    className={`h-full rounded-full ${item.color}`} />
                                            </div>
                                            <p className="text-[9px] text-text-muted mt-1 text-right font-bold">{item.pct}% of total movement</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-surface rounded-3xl border border-border/40 p-6 shadow-sm">
                                <h2 className="text-sm font-black text-text uppercase tracking-widest mb-5">Top Products</h2>
                                <div className="space-y-4">
                                    {reconciliationData.slice(0, 5).map((r, i) => {
                                        const total = r.retailQty + r.serviceQty;
                                        const maxTotal = reconciliationData[0] ? reconciliationData[0].retailQty + reconciliationData[0].serviceQty : 1;
                                        return (
                                            <div key={r.sku} className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-text-muted w-4">{i + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-text truncate">{r.productName}</p>
                                                    <div className="flex gap-1 mt-1 h-1.5">
                                                        <div className="rounded-l-full bg-violet-500" style={{ width: `${(r.retailQty / (maxTotal || 1)) * 100}%`, minWidth: r.retailQty > 0 ? '4px' : '0' }} />
                                                        <div className="rounded-r-full bg-blue-500" style={{ width: `${(r.serviceQty / (maxTotal || 1)) * 100}%`, minWidth: r.serviceQty > 0 ? '4px' : '0' }} />
                                                    </div>
                                                </div>
                                                <span className="text-sm font-black text-text shrink-0">{total}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border/40">
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-500" /><span className="text-[9px] font-bold text-text-muted uppercase">Retail</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[9px] font-bold text-text-muted uppercase">Service</span></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ══════════ TAB 2: RECONCILIATION ══════════ */}
                {activeTab === 'Reconciliation' && (
                    <motion.div key="recon" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                            <div className="px-5 py-4 border-b border-border/40 bg-surface/60 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-primary" />
                                <h2 className="text-sm font-black text-text uppercase tracking-widest">Retail vs Service Reconciliation</h2>
                                <span className="ml-auto text-[10px] font-black text-text-muted bg-background border border-border/40 px-2 py-1 rounded-lg">{reconciliationData.length} products</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-background/60">
                                            {['Product', 'Retail Qty', 'Retail Value', 'Service Qty', 'Service Value', 'Total', 'Split', ''].map(h => (
                                                <th key={h} className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest ${h === 'Retail Qty' || h === 'Retail Value' ? 'text-violet-500' : h === 'Service Qty' || h === 'Service Value' ? 'text-blue-500' : 'text-text-muted'} ${h === 'Retail Value' || h === 'Service Value' ? 'hidden sm:table-cell' : h === 'Split' ? 'hidden md:table-cell' : ''}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {reconciliationData.length === 0 ? (
                                            <tr><td colSpan={8} className="py-12 text-center text-sm font-bold text-text-muted">No reconciliation data yet. Complete a POS sale to see records.</td></tr>
                                        ) : reconciliationData.map(row => {
                                            const total = row.retailQty + row.serviceQty;
                                            const retailPct = total > 0 ? Math.round((row.retailQty / total) * 100) : 0;
                                            const isExpanded = expandedRow === row.sku;
                                            return (
                                                <>
                                                    <tr key={row.sku} className="hover:bg-surface-alt/30 transition-colors group">
                                                        <td className="px-4 py-4">
                                                            <p className="text-sm font-bold text-text line-clamp-1 group-hover:text-primary transition-colors">{row.productName}</p>
                                                            <p className="text-[10px] font-mono text-text-muted">{row.sku}</p>
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-black text-violet-600">{row.retailQty}</td>
                                                        <td className="px-4 py-4 hidden sm:table-cell text-sm font-bold text-text">₹{row.retailValue.toLocaleString()}</td>
                                                        <td className="px-4 py-4 text-sm font-black text-blue-600">{row.serviceQty}</td>
                                                        <td className="px-4 py-4 hidden sm:table-cell text-sm font-bold text-text">₹{row.serviceValue.toLocaleString()}</td>
                                                        <td className="px-4 py-4 text-base font-black text-text">{total}</td>
                                                        <td className="px-4 py-4 hidden md:table-cell">
                                                            <div className="flex gap-0.5 h-3 w-20 rounded-full overflow-hidden">
                                                                <div className="bg-violet-500" style={{ width: `${retailPct}%` }} />
                                                                <div className="bg-blue-500 flex-1" />
                                                            </div>
                                                            <p className="text-[8px] text-text-muted mt-0.5 font-bold">{retailPct}% / {100 - retailPct}%</p>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <button onClick={() => setExpandedRow(isExpanded ? null : row.sku)} className="p-2 hover:bg-primary/10 rounded-lg text-text-muted hover:text-primary transition-all">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr key={`${row.sku}-exp`}>
                                                            <td colSpan={8} className="px-8 pb-4 pt-2 bg-background/60">
                                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Individual Transactions</p>
                                                                <div className="space-y-1">
                                                                    {row.records.map(r => (
                                                                        <div key={r.id} className="flex items-center justify-between py-1.5 px-3 bg-surface rounded-lg border border-border/20">
                                                                            <div className="flex items-center gap-3">
                                                                                <SubTypeBadge subType={r.subType} />
                                                                                <span className="text-xs font-bold text-text-secondary">{r.invoiceId}</span>
                                                                                <span className="text-[10px] text-text-muted">{r.date}</span>
                                                                            </div>
                                                                            <span className="text-xs font-black text-text">{r.qty} × ₹{r.unitPrice} = ₹{r.total.toLocaleString()}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })}
                                    </tbody>
                                    {reconciliationData.length > 0 && (
                                        <tfoot>
                                            <tr className="border-t-2 border-border/60 bg-surface/80">
                                                <td className="px-4 py-4 text-xs font-black text-text uppercase">TOTAL</td>
                                                <td className="px-4 py-4 text-sm font-black text-violet-600">{reconciliationData.reduce((s, r) => s + r.retailQty, 0)}</td>
                                                <td className="px-4 py-4 hidden sm:table-cell text-sm font-black text-text">₹{reconciliationData.reduce((s, r) => s + r.retailValue, 0).toLocaleString()}</td>
                                                <td className="px-4 py-4 text-sm font-black text-blue-600">{reconciliationData.reduce((s, r) => s + r.serviceQty, 0)}</td>
                                                <td className="px-4 py-4 hidden sm:table-cell text-sm font-black text-text">₹{reconciliationData.reduce((s, r) => s + r.serviceValue, 0).toLocaleString()}</td>
                                                <td className="px-4 py-4 text-sm font-black text-text">{reconciliationData.reduce((s, r) => s + r.retailQty + r.serviceQty, 0)}</td>
                                                <td colSpan={2} />
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ══════════ TAB 3: PROJECTIONS ══════════ */}
                {activeTab === 'Projections' && (
                    <motion.div key="projections" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

                        {/* ── Projection KPIs ── */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {[
                                { label: 'On Track', value: onTrackCount, color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
                                { label: 'Over Budget', value: overBudgetCount, color: 'text-rose-600', bg: 'bg-rose-500/10', icon: TrendingUp },
                                { label: 'Under Budget', value: underCount, color: 'text-amber-600', bg: 'bg-amber-500/10', icon: TrendingDown },
                                { label: 'Avg Variance', value: `${avgVariance}%`, color: 'text-primary', bg: 'bg-primary/10', icon: Target },
                            ].map((s, i) => (
                                <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm flex items-center gap-3">
                                    <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                        <s.icon className={`w-4 h-4 ${s.color}`} />
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{s.label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* ── Bar Chart: Projected vs Actual ── */}
                        <div className="bg-surface rounded-3xl border border-border/40 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-sm font-black text-text uppercase tracking-widest">Projected vs Actual</h2>
                                    <p className="text-[10px] text-text-muted font-bold mt-0.5">Current month consumption — all products</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-border/60" /><span className="text-[9px] font-bold text-text-muted uppercase">Projected</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary" /><span className="text-[9px] font-bold text-text-muted uppercase">Actual</span></div>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={barData} barGap={4} barSize={24}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" strokeOpacity={0.4} />
                                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--color-text-muted, #9ca3af)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--color-text-muted, #9ca3af)' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="Projected" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Actual" fill="var(--color-primary, #6366f1)" radius={[4, 4, 0, 0]}
                                        onClick={(d) => setSelectedSku(d.sku)} style={{ cursor: 'pointer' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* ── Bottom: Trend Chart + Table ── */}
                        <div className="grid lg:grid-cols-5 gap-5">
                            {/* Trend line for selected product */}
                            <div className="lg:col-span-2 bg-surface rounded-3xl border border-border/40 p-5 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="text-sm font-black text-text uppercase tracking-widest">6-Month Trend</h3>
                                    <p className="text-[10px] text-text-muted font-bold mt-0.5 truncate">
                                        {projectionSummary.find(p => p.sku === selectedSku)?.productName || 'Select a product'}
                                    </p>
                                </div>
                                {selectedTrend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={180}>
                                        <AreaChart data={selectedTrend}>
                                            <defs>
                                                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
                                            <XAxis dataKey="month" tick={{ fontSize: 8, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 8, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <ReferenceLine y={selectedTrend[0]?.projected} stroke="#d1d5db" strokeDasharray="4 2" label={{ value: 'Proj', fontSize: 8, fill: '#9ca3af' }} />
                                            <Area type="monotone" dataKey="actual" stroke="var(--color-primary, #6366f1)" strokeWidth={2.5} fill="url(#actualGrad)" dot={{ r: 3, fill: 'var(--color-primary, #6366f1)', strokeWidth: 0 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-44 flex items-center justify-center text-text-muted text-xs font-bold">Click a bar to view trend</div>
                                )}
                                <p className="text-[9px] text-text-muted mt-3 font-bold flex items-center gap-1">
                                    <Info className="w-3 h-3" /> Click any bar in the chart above to load its trend
                                </p>
                            </div>

                            {/* Projection comparison table */}
                            <div className="lg:col-span-3 bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                                <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-black text-text uppercase tracking-widest">Projection Detail</h3>
                                    <span className="ml-auto text-[9px] text-text-muted font-bold flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-amber-500" /> Auto-computed = avg(last 3 months) × 1.1
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-border/40 bg-background/60 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                                <th className="px-4 py-3">Product</th>
                                                <th className="px-3 py-3">Projected</th>
                                                <th className="px-3 py-3">Actual</th>
                                                <th className="px-3 py-3">Variance</th>
                                                <th className="px-3 py-3">Status</th>
                                                <th className="px-3 py-3 text-right">Edit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                            {projectionSummary.map(row => {
                                                const isEditing = editingRow === row.sku;
                                                const isSelected = selectedSku === row.sku;
                                                return (
                                                    <tr key={row.sku}
                                                        onClick={() => setSelectedSku(row.sku)}
                                                        className={`transition-colors cursor-pointer group ${isSelected ? 'bg-primary/5' : 'hover:bg-surface-alt/30'}`}>
                                                        <td className="px-4 py-3">
                                                            <p className={`text-xs font-bold truncate max-w-[140px] ${isSelected ? 'text-primary' : 'text-text group-hover:text-primary transition-colors'}`}>{row.productName}</p>
                                                            <p className="text-[9px] font-mono text-text-muted">{row.sku}</p>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {isEditing ? (
                                                                <input
                                                                    autoFocus
                                                                    type="number"
                                                                    className="w-16 px-2 py-1 bg-background border border-primary/50 rounded-lg text-xs font-black text-text outline-none"
                                                                    value={editValue}
                                                                    onChange={e => setEditValue(e.target.value)}
                                                                    onBlur={() => handleSaveEdit(row.sku)}
                                                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(row.sku); if (e.key === 'Escape') { setEditingRow(null); setEditValue(''); } }}
                                                                />
                                                            ) : (
                                                                <span className={`text-sm font-black ${row.isOverridden ? 'text-amber-600' : 'text-text-secondary'}`}>
                                                                    {row.projected}
                                                                    {row.isOverridden && <span className="text-[8px] ml-1 text-amber-500 font-bold">✎</span>}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-sm font-black text-text">{row.actual}</td>
                                                        <td className="px-3 py-3">
                                                            <span className={`text-sm font-black ${row.variance > 0 ? 'text-rose-500' : row.variance < 0 ? 'text-emerald-500' : 'text-text-muted'}`}>
                                                                {row.variance > 0 ? '+' : ''}{row.variance}
                                                            </span>
                                                            <p className={`text-[9px] font-bold ${Math.abs(row.variancePct) >= 15 ? 'text-rose-400' : 'text-text-muted'}`}>
                                                                {row.variancePct > 0 ? '+' : ''}{row.variancePct}%
                                                            </p>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <StatusBadge status={row.status} />
                                                        </td>
                                                        <td className="px-3 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    title="Edit projection"
                                                                    onClick={e => { e.stopPropagation(); setEditingRow(row.sku); setEditValue(String(row.projected)); }}
                                                                    className="p-1.5 hover:bg-primary/10 rounded-lg text-text-muted hover:text-primary transition-all"
                                                                >
                                                                    <Pencil className="w-3 h-3" />
                                                                </button>
                                                                {row.isOverridden && (
                                                                    <button
                                                                        title="Reset to auto"
                                                                        onClick={e => { e.stopPropagation(); resetProjection(row.sku); }}
                                                                        className="p-1.5 hover:bg-amber-500/10 rounded-lg text-text-muted hover:text-amber-500 transition-all"
                                                                    >
                                                                        <RotateCcw className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-5 py-3 border-t border-border/40 bg-surface/60">
                                    <p className="text-[9px] font-bold text-text-muted flex items-center gap-1.5">
                                        <Info className="w-3 h-3" />
                                        Formula: avg(last 3 months) × 1.1 safety buffer. Click <Pencil className="w-2.5 h-2.5 inline" /> to override manually.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ══════════ TAB 4: TRANSACTION LOG ══════════ */}
                {activeTab === 'Transaction Log' && (
                    <motion.div key="log" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="flex gap-2 flex-wrap mb-4">
                            <div className="flex items-center gap-1.5">
                                <Filter className="w-3.5 h-3.5 text-text-muted" />
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Filter:</span>
                            </div>
                            {['All', 'retail_sale', 'service_usage', 'wastage'].map(f => (
                                <button key={f} onClick={() => setFilterSubType(f)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${filterSubType === f ? 'bg-primary text-white border-primary' : 'bg-surface text-text-muted border-border/40 hover:border-primary/40'}`}>
                                    {f === 'All' ? 'All Types' : f === 'retail_sale' ? 'Retail' : f === 'service_usage' ? 'Service' : 'Wastage'}
                                </button>
                            ))}
                            <div className="h-5 w-px bg-border/40 self-center mx-1" />
                            {['All', ...outlets.map(o => o.id)].map(id => (
                                <button key={id} onClick={() => setFilterOutlet(id)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${filterOutlet === id ? 'bg-primary text-white border-primary' : 'bg-surface text-text-muted border-border/40 hover:border-primary/40'}`}>
                                    {id === 'All' ? 'All Outlets' : outlets.find(o => o.id === id)?.short || id}
                                </button>
                            ))}
                        </div>
                        <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-surface/50">
                                            {['Invoice ID', 'Product', 'Type', 'Qty', 'Unit Price', 'Total', 'Outlet', 'Date'].map(h => (
                                                <th key={h} className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {filteredRecords.length === 0 ? (
                                            <tr><td colSpan={8} className="py-10 text-center text-sm font-bold text-text-muted">No records found</td></tr>
                                        ) : filteredRecords.map(r => {
                                            const outletInfo = outlets.find(o => o.id === r.outletId);
                                            return (
                                                <tr key={r.id} className="hover:bg-surface-alt/30 transition-colors">
                                                    <td className="px-4 py-3 text-xs font-black text-primary font-mono">{r.invoiceId}</td>
                                                    <td className="px-4 py-3"><p className="text-xs font-bold text-text line-clamp-1">{r.productName}</p><p className="text-[9px] text-text-muted font-mono">{r.sku}</p></td>
                                                    <td className="px-4 py-3"><SubTypeBadge subType={r.subType} /></td>
                                                    <td className="px-4 py-3 text-sm font-black text-text">{r.qty}</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-text">₹{r.unitPrice}</td>
                                                    <td className="px-4 py-3 text-sm font-black text-primary">₹{r.total.toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        {outletInfo
                                                            ? <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${outletInfo.light}`}>{outletInfo.short}</span>
                                                            : <span className="text-[9px] text-text-muted">{r.outletId}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-[10px] font-bold text-text-muted whitespace-nowrap">{r.date}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-5 py-3 border-t border-border/40 bg-surface/60 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-text-muted">{filteredRecords.length} records shown</p>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[9px] font-bold text-text-muted">Immutable audit trail</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
