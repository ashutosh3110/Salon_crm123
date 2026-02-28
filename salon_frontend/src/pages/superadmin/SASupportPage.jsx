import { useState } from 'react';
import {
    Bug, LogOut, Search, RefreshCw,
    CheckCircle, XCircle, Clock,
    Eye, Download, X,
    Shield, Users,
    AlertTriangle, Info
} from 'lucide-react';
import CustomDropdown from '../../components/superadmin/CustomDropdown';
import { exportToExcel } from '../../utils/exportUtils';

/* ─── Mock data ─────────────────────────────────────────────────────── */
const MOCK_ERRORS = [
    { id: 'e001', level: 'error', message: 'Uncaught TypeError: Cannot read properties of undefined', tenant: 'Glam Studio', time: '2026-02-23 15:33:41', file: 'staff.controller.js:84', count: 3 },
    { id: 'e002', level: 'error', message: 'MongoServerError: E11000 duplicate key error', tenant: 'Luxe Cuts', time: '2026-02-23 14:12:30', file: 'client.service.js:201', count: 1 },
    { id: 'e003', level: 'warning', message: 'Rate limit threshold at 80% for tenant', tenant: 'Urban Aesthetics', time: '2026-02-23 13:55:10', file: 'rate-limiter.js:18', count: 12 },
    { id: 'e004', level: 'error', message: 'Payment webhook signature mismatch', tenant: 'Serenity Spa', time: '2026-02-23 12:44:05', file: 'payment.service.js:55', count: 2 },
    { id: 'e005', level: 'info', message: 'Background job took >5s: reports-generator', tenant: 'System', time: '2026-02-23 11:30:00', file: 'job-runner.js:102', count: 1 },
    { id: 'e006', level: 'warning', message: 'Low storage warning: tenant at 85% of quota', tenant: 'Blossom Parlour', time: '2026-02-22 18:20:15', file: 'storage.service.js:34', count: 5 },
];

const ERROR_CFG = {
    error: { cls: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, dot: 'bg-red-500' },
    warning: { cls: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertTriangle, dot: 'bg-amber-500' },
    info: { cls: 'bg-blue-50 text-blue-600 border-blue-200', icon: Info, dot: 'bg-blue-500' },
};

export default function SASupportPage() {
    const [errLevel, setErrLevel] = useState('');
    const [toast, setToast] = useState(null);
    const [clearing, setClearing] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const filteredErrors = MOCK_ERRORS.filter(e =>
        !errLevel || e.level === errLevel
    );

    const handleForceLogout = async () => {
        if (!confirm('Force logout ALL active users from all salons? This will clear every session.')) return;
        setClearing(true);
        await new Promise(r => setTimeout(r, 1500));
        setClearing(false);
        showToast('All sessions cleared — users will need to re-login.', 'error');
    };

    return (
        <div className="space-y-5 pb-8 sa-panel">
            {toast && (
                <div className={`fixed top-20 right-8 z-[200] flex items-center gap-2.5 px-6 py-3 rounded-xl shadow-2xl text-white text-xs font-bold uppercase tracking-widest animate-in slide-in-from-right-4 duration-300 ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}>
                    <CheckCircle className="w-4 h-4 shrink-0" /> {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">Support <span className="text-primary text-3xl">Portal</span></h1>
                    <p className="text-[11px] text-text-muted font-medium uppercase tracking-[0.2em] mt-1">Platform-wide diagnostic tools and error tracking</p>
                </div>
                <button onClick={handleForceLogout} disabled={clearing}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 active:scale-[0.98] disabled:opacity-60">
                    {clearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    {clearing ? 'Clearing Protocols…' : 'Force Logout All Units'}
                </button>
            </div>


            {/* Error Tracker Section */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                            <Bug size={18} />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight">System Error Tracker</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <CustomDropdown
                            value={errLevel}
                            onChange={setErrLevel}
                            placeholder="All Levels"
                            options={[
                                { value: '', label: 'All Severity Levels' },
                                { value: 'error', label: 'Critical Errors', icon: XCircle },
                                { value: 'warning', label: 'System Warnings', icon: AlertTriangle },
                                { value: 'info', label: 'Informational', icon: Info },
                            ]}
                        />
                        <button onClick={() => {
                            exportToExcel(MOCK_ERRORS, 'Wapixo_System_Error_Log', 'Diagnostics');
                            showToast('Error log exported as Excel!', 'info');
                        }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-border text-text-secondary text-[10px] font-black uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all shadow-sm">
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {filteredErrors.map(e => {
                        const cfg = ERROR_CFG[e.level];
                        return (
                            <div key={e.id} className={`flex items-start gap-4 p-5 bg-white rounded-xl border ${cfg.cls} group hover:shadow-xl transition-all duration-300`}>
                                <div className="mt-0.5 shrink-0">
                                    <cfg.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-bold text-text leading-snug">{e.message}</p>
                                        {e.count > 1 && (
                                            <span className="text-[10px] font-black bg-white/80 border border-current px-2.5 py-0.5 rounded-full shrink-0">
                                                RECURRENCE ×{e.count}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                                        <div className="flex items-center gap-1.5 opacity-70">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Protocol:</span>
                                            <span className="text-[11px] font-mono font-bold tracking-tighter">{e.file}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 grayscale opacity-80">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Tenant:</span>
                                            <span className="text-[11px] font-bold italic">{e.tenant}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-60 ml-auto">
                                            <Clock size={12} />
                                            <span className="text-[11px] font-mono">{e.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => showToast(`Error ${e.id} resolved.`)}
                                    className="shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-black/5 transition-all self-center"
                                    title="Mark as Resolved"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {filteredErrors.length === 0 && (
                    <div className="text-center py-20 bg-white border border-border border-dashed rounded-2xl">
                        <CheckCircle className="w-16 h-16 text-emerald-400/20 mx-auto mb-4" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-muted italic">Clear Horizon</h3>
                        <p className="text-[11px] text-text-muted mt-2 uppercase tracking-widest">No active system violations at this level</p>
                    </div>
                )}
            </div>
        </div>
    );
}
