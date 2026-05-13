import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
    ArrowLeft, MapPin, Phone, Mail,
    CheckCircle, XCircle, AlertTriangle, Clock,
    Ban, ChevronRight, Building2, CreditCard, Settings2, Save,
    Sparkles, Copy, Globe, ExternalLink, ShieldCheck, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const planColors = {
    free: 'bg-slate-100 text-slate-600 border-slate-200',
    basic: 'bg-blue-50 text-blue-600 border-blue-200',
    pro: 'bg-primary/10 text-primary border-primary/25',
    premium: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    enterprise: 'bg-amber-50 text-amber-600 border-amber-200',
};

const STATUS_CFG = {
    active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle },
    trial: { label: 'Trial', cls: 'bg-blue-50 text-blue-600 border-blue-200', icon: Clock },
    expired: { label: 'Expired', cls: 'bg-orange-50 text-orange-600 border-orange-200', icon: AlertTriangle },
    suspended: { label: 'Suspended', cls: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

/* ─── Action button ──────────────────────────────────────────────────── */
function ActionBtn({ icon: Icon, label, onClick, variant = 'default', disabled = false }) {
    const varCls = {
        default: 'bg-white text-text-secondary border-border hover:border-primary/30 hover:text-primary shadow-sm',
        danger: 'bg-white text-red-500 border-red-100 hover:bg-red-50 shadow-sm',
        primary: 'bg-primary text-white border-primary hover:brightness-110 shadow-lg shadow-primary/20',
        blue: 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50 shadow-sm',
    };
    return (
        <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick} disabled={disabled}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${varCls[variant]}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </motion.button>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function SATenantDetailPage() {
    const { id } = useParams();
    const [tab, setTab] = useState('info');
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [fiscalForm, setFiscalForm] = useState({
        state: '',
        stateCode: '',
        serviceGst: 18,
        productGst: 12
    });

    const states = [
        { name: "Andhra Pradesh", code: "37" }, { name: "Arunachal Pradesh", code: "12" }, { name: "Assam", code: "18" },
        { name: "Bihar", code: "10" }, { name: "Chhattisgarh", code: "22" }, { name: "Goa", code: "30" },
        { name: "Gujarat", code: "24" }, { name: "Haryana", code: "06" }, { name: "Himachal Pradesh", code: "02" },
        { name: "Jammu and Kashmir", code: "01" }, { name: "Jharkhand", code: "20" }, { name: "Karnataka", code: "29" },
        { name: "Kerala", code: "32" }, { name: "Madhya Pradesh", code: "23" }, { name: "Maharashtra", code: "27" },
        { name: "Manipur", code: "14" }, { name: "Meghalaya", code: "17" }, { name: "Mizoram", code: "15" },
        { name: "Nagaland", code: "13" }, { name: "Odisha", code: "21" }, { name: "Punjab", code: "03" },
        { name: "Rajasthan", code: "08" }, { name: "Sikkim", code: "11" }, { name: "Tamil Nadu", code: "33" },
        { name: "Telangana", code: "36" }, { name: "Tripura", code: "16" }, { name: "Uttar Pradesh", code: "09" },
        { name: "Uttarakhand", code: "05" }, { name: "West Bengal", code: "19" }, { name: "Andaman and Nicobar Islands", code: "35" },
        { name: "Chandigarh", code: "04" }, { name: "Dadra and Nagar Haveli and Daman and Diu", code: "26" },
        { name: "Lakshadweep", code: "31" }, { name: "Delhi", code: "07" }, { name: "Puducherry", code: "34" },
        { name: "Ladakh", code: "38" }
    ];

    useEffect(() => {
        fetchTenant();
    }, [id]);

    const fetchTenant = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/salons/${id}`);
            const data = response.data.data;
            setSelectedTenant(data);
            setFiscalForm({
                state: data.settings?.state || 'Uttar Pradesh',
                stateCode: data.settings?.stateCode || '09',
                serviceGst: data.settings?.serviceGst || 18,
                productGst: data.settings?.productGst || 12
            });
        } catch (error) {
            console.error('Error fetching tenant:', error);
            showToast('Failed to load salon details.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateFiscal = async () => {
        setIsSaving(true);
        try {
            await api.put(`/salons/${id}`, {
                settings: {
                    ...selectedTenant.settings,
                    state: fiscalForm.state,
                    stateCode: fiscalForm.stateCode,
                    serviceGst: fiscalForm.serviceGst,
                    productGst: fiscalForm.productGst
                }
            });
            showToast('Fiscal settings updated successfully');
            fetchTenant();
        } catch (error) {
            showToast('Failed to update fiscal settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedTenant || statusLoading) return;
        const newStatus = selectedTenant.status === 'suspended' ? 'active' : 'suspended';
        setStatusLoading(true);
        
        try {
            await api.put(`/salons/${id}`, { status: newStatus });
            setSelectedTenant(prev => ({ ...prev, status: newStatus }));
            showToast(newStatus === 'suspended' ? 'Salon suspended' : 'Salon reactivated');
        } catch (error) {
            console.error('Error toggling status:', error);
            showToast('Failed to update status. Please try again.', 'error');
        } finally {
            setStatusLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('ID Copied to clipboard', 'info');
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-text-muted animate-pulse">Loading Salon...</p>
            </div>
        );
    }

    if (!selectedTenant) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-border shadow-sm">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-black text-text uppercase italic tracking-tighter">Salon not found</h2>
                <Link to="/superadmin/tenants" className="text-primary font-black uppercase tracking-widest text-[10px] mt-6 inline-block hover:underline">Back to Salons</Link>
            </div>
        );
    }

    const sc = STATUS_CFG[selectedTenant.status] || STATUS_CFG.active;

    const tabs = [
        { id: 'info', label: 'Basic Info', icon: Building2 },
        { id: 'plan', label: 'Subscription', icon: CreditCard },
        { id: 'whatsapp', label: 'WhatsApp', icon: Sparkles },
        { id: 'fiscal', label: 'Fiscal', icon: Settings2 },
    ];

    return (
        <div className="space-y-6 pb-12 font-sans">
            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: 20 }}
                        className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-xs font-black uppercase tracking-widest transition-all ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/20' : toast.type === 'info' ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}
                    >
                        <CheckCircle className="w-4 h-4" /> {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Breadcrumb ── */}
            <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted/60">
                <Link to="/superadmin/tenants" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                    <div className="w-5 h-5 rounded-md bg-surface border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                        <ArrowLeft className="w-3 h-3" />
                    </div>
                    Salons List
                </Link>
                <ChevronRight className="w-3 h-3 opacity-30" />
                <span className="text-text tracking-tighter italic lowercase text-sm font-bold opacity-40">{selectedTenant.slug || selectedTenant._id}</span>
            </nav>

            {/* ── Hero & Actions ── */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden group"
            >
                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[100%] bg-primary/5 blur-[100px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] bg-indigo-500/5 blur-[100px] rounded-full animate-pulse" />
                </div>

                <div className="h-1.5 bg-gradient-to-r from-primary via-indigo-600 to-[#8B1A2D]" />
                
                <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
                    {/* Avatar with Glow */}
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-[#8B1A2D] flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-primary/40 relative">
                            {selectedTenant.name[0].toUpperCase()}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-black text-text tracking-tighter uppercase italic">{selectedTenant.name}</h1>
                                <div className="flex gap-2">
                                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_CFG[selectedTenant.status]?.cls}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                        {selectedTenant.status}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${planColors[selectedTenant.subscriptionPlan] || planColors.free}`}>
                                        {selectedTenant.subscriptionPlan}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyToClipboard(selectedTenant._id)}>
                                <p className="text-[10px] font-bold text-text-muted/60 tracking-wider">ID: {selectedTenant._id}</p>
                                <Copy className="w-3 h-3 text-text-muted/40 group-hover:text-primary transition-colors" />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                            {[
                                { icon: Mail, value: selectedTenant.email },
                                { icon: Phone, value: selectedTenant.phone },
                                { icon: MapPin, value: selectedTenant.address?.city || selectedTenant.city },
                                { icon: Globe, value: `${selectedTenant.slug}.wapixo.com` }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-text-muted hover:text-text transition-colors">
                                    <div className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                                        <item.icon className="w-3 h-3" />
                                    </div>
                                    {item.value}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:border-l border-border lg:pl-8 flex flex-col gap-3 shrink-0">
                        <ActionBtn
                            icon={Ban}
                            label={statusLoading ? 'Processing...' : (selectedTenant.status === 'suspended' ? 'Reactivate' : 'Suspend Salon')}
                            onClick={handleToggleStatus}
                            disabled={statusLoading}
                            variant={selectedTenant.status === 'suspended' ? 'primary' : 'danger'}
                        />
                        <a 
                            href={`https://${selectedTenant.slug}.wapixo.com`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-text-secondary text-[11px] font-black uppercase tracking-wider hover:bg-surface hover:text-text transition-all"
                        >
                            <ExternalLink className="w-3.5 h-3.5" /> View Public App
                        </a>
                    </div>
                </div>
            </motion.div>

            {/* ── Tabbed Content ── */}
            <div className="space-y-6">
                {/* Custom Tabs with Sliding Indicator */}
                <div className="bg-white p-1.5 rounded-2xl border border-border shadow-sm flex items-center gap-1 relative overflow-x-auto no-scrollbar">
                    {tabs.map((t) => {
                        const isActive = tab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`relative px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shrink-0 ${isActive ? 'text-white' : 'text-text-muted hover:text-text hover:bg-surface'}`}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary shadow-lg shadow-primary/20 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <t.icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-text'}`} />
                                <span className="relative z-10">{t.label}</span>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {tab === 'info' && (
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 bg-white rounded-3xl border border-border shadow-sm p-8 space-y-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h3 className="font-black text-text text-lg uppercase italic tracking-tight">Salon Information</h3>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                                        {[
                                            { label: 'Salon Entity', value: selectedTenant.name, icon: Building2 },
                                            { label: 'Primary Owner', value: selectedTenant.ownerName, icon: ShieldCheck },
                                            { label: 'Official Email', value: selectedTenant.email, icon: Mail },
                                            { label: 'Contact Phone', value: selectedTenant.phone, icon: Phone },
                                            { label: 'Location', value: selectedTenant.address?.city || selectedTenant.city, icon: MapPin },
                                            { label: 'GST Identity', value: selectedTenant.gstNumber || 'Unregistered', icon: ShieldCheck },
                                            { label: 'Onboarding Date', value: new Date(selectedTenant.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), icon: Clock }
                                        ].map((r, i) => (
                                            <div key={i} className="space-y-1.5 group">
                                                <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <r.icon className="w-3 h-3 text-primary" />
                                                    <span className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em]">{r.label}</span>
                                                </div>
                                                <p className="text-sm font-bold text-text pl-5">{r.value || '—'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                                    <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                                    <div className="relative z-10 space-y-8">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Postal Address</p>
                                            <p className="text-sm font-bold leading-relaxed opacity-80 italic">
                                                {typeof selectedTenant.address === 'object' 
                                                    ? `${selectedTenant.address?.street || ''}, ${selectedTenant.address?.city || ''}, ${selectedTenant.address?.state || ''} - ${selectedTenant.address?.pincode || ''}` 
                                                    : selectedTenant.address || 'Address not updated'}
                                            </p>
                                        </div>
                                        <div className="h-px bg-white/10" />
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Network Status</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                    <span className="text-xs font-black uppercase tracking-widest">Servers Online</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === 'plan' && (
                            <div className="bg-white rounded-3xl border border-border shadow-sm p-8 space-y-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                    <h3 className="font-black text-text text-lg uppercase italic tracking-tight">Subscription Profile</h3>
                                </div>
                                
                                {(!selectedTenant.subscriptionPlan || selectedTenant.subscriptionPlan.toLowerCase() === 'free' || selectedTenant.subscriptionPlan.toLowerCase() === 'none') ? (
                                    <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-border">
                                        <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4 opacity-80" />
                                        <h4 className="text-lg font-black text-text uppercase italic tracking-tight">No Active Subscription</h4>
                                        <p className="text-[10px] font-bold text-text-muted mt-2 uppercase tracking-widest">This salon is currently on the free tier or trial period.</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="p-8 rounded-3xl bg-indigo-50 border border-indigo-100 space-y-4">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Plan</p>
                                            <div className="space-y-1">
                                                <h4 className="text-3xl font-black text-indigo-700 uppercase italic tracking-tight">{selectedTenant.subscriptionPlan}</h4>
                                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Premium Features Enabled</p>
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-3xl bg-white border border-border space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Billing Period</p>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center">
                                                    <Clock className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest">Activation</p>
                                                    <p className="text-sm font-bold text-text-secondary">{new Date(selectedTenant.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-3xl bg-white border border-border space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Renewal Date</p>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center">
                                                    <Calendar className="w-6 h-6 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest">Expiration</p>
                                                    <p className="text-sm font-bold text-text-secondary">
                                                        {selectedTenant.subscriptionExpiry 
                                                            ? new Date(selectedTenant.subscriptionExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                            : 'Lifetime Access'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'whatsapp' && (
                            <div className="grid md:grid-cols-5 gap-6">
                                <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    <div className="relative z-10 space-y-10">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">System Engine</p>
                                                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                                                    WhatsApp API 
                                                    <div className={`w-2 h-2 rounded-full ${selectedTenant.whatsappSettings?.whatsappNotifications ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-white/20'}`} />
                                                </h3>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                <Sparkles className="w-5 h-5 text-primary" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Available Credits</p>
                                            <div className="flex items-baseline gap-4">
                                                <h2 className="text-7xl font-black italic tracking-tighter tabular-nums">
                                                    {selectedTenant.whatsappSettings?.whatsappCredits || 0}
                                                </h2>
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Balance Unit</span>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-white/10 flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min((selectedTenant.whatsappSettings?.whatsappCredits / 5000) * 100, 100)}%` }}
                                                        className="h-full bg-primary" 
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-[9px] font-black text-white/30 uppercase">Health Check: Normal</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-3 bg-white rounded-[2.5rem] border border-border shadow-sm p-10 space-y-8 flex flex-col justify-center">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-text uppercase italic tracking-tighter">Adjust Credit Pool</h3>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Manual adjustment of salon-wide message balance</p>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row items-end gap-4">
                                        <div className="flex-1 space-y-3 w-full">
                                            <div className="flex items-center justify-between px-2">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Transaction Amount</label>
                                                <span className="text-[9px] font-black text-primary uppercase">Integer Only</span>
                                            </div>
                                            <input 
                                                type="number" 
                                                id="sa-credits-input"
                                                placeholder="e.g. +1000 or -500"
                                                className="w-full h-16 px-6 rounded-2xl border border-border bg-surface text-lg font-black italic outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                            />
                                        </div>
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }}
                                            onClick={async () => {
                                                const val = document.getElementById('sa-credits-input').value;
                                                if (!val) return showToast('Enter amount', 'error');
                                                try {
                                                    await api.post('/whatsapp-credits/superadmin/update', {
                                                        salonId: selectedTenant._id,
                                                        credits: Number(val),
                                                        reason: 'SuperAdmin Manual Update'
                                                    });
                                                    showToast(`Successfully ${Number(val) > 0 ? 'added' : 'deducted'} ${Math.abs(val)} credits`);
                                                    fetchTenant(); 
                                                    document.getElementById('sa-credits-input').value = '';
                                                } catch (err) {
                                                    showToast('Update failed', 'error');
                                                }
                                            }}
                                            className="h-16 px-10 bg-text text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary transition-all shadow-xl shadow-primary/20 whitespace-nowrap"
                                        >
                                            Sync Balance
                                        </motion.button>
                                    </div>

                                    <div className="p-5 bg-surface/50 rounded-2xl border border-border flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text">Security Protocol</p>
                                            <p className="text-[9px] font-bold text-text-muted opacity-60">All manual transactions are logged for audit compliance.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === 'fiscal' && (
                            <div className="bg-white rounded-3xl border border-border shadow-sm p-10 space-y-10">
                                <div className="flex items-center justify-between border-b border-border pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                        <h3 className="font-black text-text text-lg uppercase italic tracking-tight">Fiscal Compliance</h3>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Active GST Engine</span>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">
                                            Regulatory Jurisdiction
                                        </label>
                                        <select
                                            value={fiscalForm.state}
                                            onChange={(e) => {
                                                const s = states.find((st) => st.name === e.target.value);
                                                if (s) setFiscalForm({ ...fiscalForm, state: s.name, stateCode: s.code });
                                            }}
                                            className="w-full h-14 px-5 rounded-2xl border border-border text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all bg-surface/50 appearance-none"
                                        >
                                            {states.map((s) => (
                                                <option key={s.code} value={s.name}>
                                                    {s.name} (Code: {s.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">
                                            State ID Code
                                        </label>
                                        <div className="w-full h-14 px-5 rounded-2xl border border-border bg-surface text-sm font-bold flex items-center opacity-60">
                                            {fiscalForm.stateCode}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Service GST Levy</label>
                                            <span className="text-[10px] font-black text-primary italic">Standard 18%</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={fiscalForm.serviceGst}
                                                onChange={(e) => setFiscalForm({ ...fiscalForm, serviceGst: Number(e.target.value) })}
                                                className="w-full h-14 px-5 rounded-2xl border border-border text-sm font-black focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all bg-surface/50"
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-text-muted">%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Product GST Levy</label>
                                            <span className="text-[10px] font-black text-indigo-500 italic">Standard 12%</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={fiscalForm.productGst}
                                                onChange={(e) => setFiscalForm({ ...fiscalForm, productGst: Number(e.target.value) })}
                                                className="w-full h-14 px-5 rounded-2xl border border-border text-sm font-black focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all bg-surface/50"
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-text-muted">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleUpdateFiscal}
                                        disabled={isSaving}
                                        className="flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 bg-text text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-primary transition-all shadow-xl shadow-primary/10 disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Authorize & Sync Fiscal Settings
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
