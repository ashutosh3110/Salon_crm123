import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
    ArrowLeft, MapPin, Phone, Mail,
    CheckCircle, XCircle, AlertTriangle, Clock,
    Ban, ChevronRight, Building2, CreditCard
} from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const planColors = {
    free: 'bg-slate-100 text-slate-600 border-slate-200',
    basic: 'bg-blue-50 text-blue-600 border-blue-200',
    pro: 'bg-primary/10 text-primary border-primary/25',
    premium: 'bg-primary/10 text-primary border-primary/25',
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
        default: 'bg-white text-text-secondary border-border hover:border-primary/30 hover:text-primary',
        danger: 'bg-white text-red-500 border-red-100 hover:bg-red-50',
        primary: 'bg-primary text-white border-primary hover:brightness-110 shadow-lg shadow-primary/20',
        blue: 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50',
    };
    return (
        <button onClick={onClick} disabled={disabled}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'} ${varCls[variant]}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </button>
    );
}

/* ─── Tab button ─────────────────────────────────────────────────────── */
function Tab({ id, active, icon: Icon, label, onClick }) {
    return (
        <button onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-surface'
                }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </button>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function SATenantDetailPage() {
    const { id } = useParams();
    const [tab, setTab] = useState('info');
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);

    useEffect(() => {
        fetchTenant();
    }, [id]);

    const fetchTenant = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/salons/${id}`);
            setSelectedTenant(response.data.data);
        } catch (error) {
            console.error('Error fetching tenant:', error);
            showToast('Failed to load salon details.', 'error');
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!selectedTenant) {
        return (
            <div className="text-center py-20">
                <p className="text-text-secondary">Salon not found.</p>
                <Link to="/superadmin/tenants" className="text-primary hover:underline mt-4 inline-block">Back to Salons</Link>
            </div>
        );
    }

    const sc = STATUS_CFG[selectedTenant.status] || STATUS_CFG.active;

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="space-y-5 pb-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                    <CheckCircle className="w-4 h-4" /> {toast.msg}
                </div>
            )}

            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-2 text-xs text-text-muted">
                <Link to="/superadmin/tenants" className="hover:text-primary transition-colors flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Salons
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-text font-semibold">{selectedTenant.name}</span>
            </div>

            {/* ── Hero & Actions ── */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-[#8B1A2D]" />
                <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#8B1A2D] flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-primary/30 shrink-0">
                        {selectedTenant.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-xl font-black text-text">{selectedTenant.name}</h1>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_CFG[selectedTenant.status]?.cls}`}>
                                {STATUS_CFG[selectedTenant.status]?.icon && <sc.icon className="w-3 h-3" />} {selectedTenant.status.toUpperCase()}
                            </span>
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase ${planColors[selectedTenant.subscriptionPlan] || planColors.free}`}>
                                {selectedTenant.subscriptionPlan}
                            </span>
                        </div>
                        <p className="text-sm text-text-secondary font-mono mb-2">/{selectedTenant.slug}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selectedTenant.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedTenant.phone}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedTenant.address?.city || selectedTenant.city}</span>
                        </div>
                    </div>
                </div>
                
                <div className="px-6 pb-5 flex flex-wrap gap-2 border-t border-border/50 pt-4 mt-2">
                    <ActionBtn
                        icon={Ban}
                        label={statusLoading ? 'Updating...' : (selectedTenant.status === 'suspended' ? 'Reactivate' : 'Suspend')}
                        onClick={handleToggleStatus}
                        disabled={statusLoading}
                        variant={selectedTenant.status === 'suspended' ? 'default' : 'danger'}
                    />
                </div>
            </div>

            {/* ── Tabs Container ── */}
            <div className="flex items-center gap-2 border-b border-border pb-1">
                <Tab id="info" active={tab === 'info'} icon={Building2} label="Basic Info" onClick={setTab} />
                <Tab id="plan" active={tab === 'plan'} icon={CreditCard} label="Plan Info" onClick={setTab} />
            </div>

            {/* ── Tab Content ── */}
            {tab === 'info' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-text text-sm border-b border-border pb-2">Salon Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { label: 'Salon Name', value: selectedTenant.name },
                            { label: 'Owner', value: selectedTenant.ownerName },
                            { label: 'Email', value: selectedTenant.email },
                            { label: 'Phone', value: selectedTenant.phone },
                            { label: 'City', value: selectedTenant.address?.city || selectedTenant.city },
                            { label: 'Full Address', value: typeof selectedTenant.address === 'object' ? `${selectedTenant.address?.street || ''}, ${selectedTenant.address?.city || ''}` : selectedTenant.address },
                            { label: 'GST Number', value: selectedTenant.gstNumber || 'Not Provided' },
                            { label: 'Joined', value: new Date(selectedTenant.createdAt).toLocaleDateString('en-IN') }
                        ].map(r => (
                            <div key={r.label} className="bg-surface/50 p-3 rounded-lg border border-border/50 flex flex-col justify-center">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">{r.label}</span>
                                <span className="text-sm font-semibold text-text">{r.value || '—'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'plan' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                    <h3 className="font-bold text-text text-sm border-b border-border pb-2 mb-4">Subscription Plan Details</h3>
                    
                    {(!selectedTenant.subscriptionPlan || selectedTenant.subscriptionPlan.toLowerCase() === 'free' || selectedTenant.subscriptionPlan.toLowerCase() === 'none') ? (
                        <div className="text-center py-10">
                            <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-3 opacity-80" />
                            <p className="text-text-secondary font-semibold">Not Plan Buy!</p>
                            <p className="text-xs text-text-muted mt-1">This salon does not have an active paid subscription plan.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                                <span className="text-[10px] text-primary/70 font-bold uppercase tracking-wider mb-1 block">Current Plan</span>
                                <span className="text-lg font-black text-primary uppercase">{selectedTenant.subscriptionPlan}</span>
                            </div>
                            <div className="bg-surface/50 border border-border/50 p-4 rounded-xl">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Started On</span>
                                <span className="text-sm font-semibold text-text">
                                    {new Date(selectedTenant.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="bg-surface/50 border border-border/50 p-4 rounded-xl">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Expires On</span>
                                <span className="text-sm font-semibold text-text">
                                    {selectedTenant.subscriptionExpiry 
                                        ? new Date(selectedTenant.subscriptionExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
