import { useState, useMemo, useCallback } from 'react';
import { Users, Search, Filter, Plus, MoreVertical, Mail, Phone, Calendar, Shield, CheckCircle2, Clock, Edit2, Eye, Trash2, UserPlus, Building2, X, ChevronLeft, ChevronRight, PieChart as PieChartIcon, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { useBusiness } from '../../../contexts/BusinessContext';

/** Backend User.role → UI label */
const ROLE_LABELS = {
    stylist: 'Stylist',
    receptionist: 'Receptionist',
    manager: 'Manager',
    accountant: 'Accountant',
    inventory_manager: 'Inventory',
    admin: 'Admin',
};

const ROLE_KEYS = Object.keys(ROLE_LABELS);

const PAGE_SIZE = 5;
const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#f43f5e'];

function normalizeStaffUser(u, outletsList) {
    const oid = u.outletId?._id || u.outletId;
    const outletDoc = outletsList.find((o) => String(o._id || o.id) === String(oid || ''));
    const outletName = u.outletId?.name || outletDoc?.name || '—';
    const jd = u.joinedDate;
    let joinedStr = '';
    if (jd) {
        joinedStr = typeof jd === 'string' ? jd.split('T')[0] : new Date(jd).toISOString().split('T')[0];
    }
    return {
        _id: u._id,
        id: u._id,
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        role: ROLE_LABELS[u.role] || u.role,
        roleKey: u.role,
        outlet: outletName,
        outletId: oid ? String(oid) : '',
        joined: joinedStr,
        salary: u.salary ?? 0,
        status: u.status || 'active',
        dob: u.dob || '',
        pan: u.pan || '',
        address: u.address || '',
        bankName: u.bankName || '',
        accountNo: u.bankAccountNo || '',
        ifsc: u.ifsc || '',
        specialist: u.specialist || '',
    };
}

export default function StaffManager() {
    const { staff, staffLoading, addStaff, updateStaff, deleteStaff, outlets, fetchStaff } = useBusiness();

    const staffRows = useMemo(() => {
        const list = Array.isArray(staff) ? staff : [];
        return list.map((u) => normalizeStaffUser(u, outlets));
    }, [staff, outlets]);

    const OUTLET_NAMES = useMemo(() => (outlets.length > 0 ? outlets.map((o) => o.name) : []), [outlets]);

    const emptyForm = useCallback(() => {
        const firstOid = outlets[0]?._id || outlets[0]?.id || '';
        return {
            name: '',
            roleKey: 'stylist',
            outletId: firstOid ? String(firstOid) : '',
            email: '',
            phone: '',
            password: '',
            joined: new Date().toISOString().split('T')[0],
            salary: '',
            status: 'active',
            dob: '',
            pan: '',
            address: '',
            bankName: '',
            accountNo: '',
            ifsc: '',
        };
    }, [outlets]);

    const [form, setForm] = useState(() => emptyForm());

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterOutlet, setFilterOutlet] = useState('All');
    const [showFilter, setShowFilter] = useState(false);
    const [page, setPage] = useState(1);

    const [modal, setModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    const [viewModal, setViewModal] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const roleData = useMemo(() => {
        const counts = {};
        staffRows.forEach((s) => {
            const k = s.roleKey || s.role;
            const label = ROLE_LABELS[k] || s.role;
            counts[label] = (counts[label] || 0) + 1;
        });
        return Object.keys(counts).map((role, i) => ({
            name: role,
            value: counts[role],
            color: COLORS[i % COLORS.length],
        }));
    }, [staffRows]);

    const filtered = useMemo(
        () =>
            staffRows.filter((s) => {
                const q = searchTerm.toLowerCase();
                const matchSearch =
                    s.name.toLowerCase().includes(q) ||
                    s.role.toLowerCase().includes(q) ||
                    (s.email || '').toLowerCase().includes(q);
                const matchRole = filterRole === 'All' || s.roleKey === filterRole;
                const matchOutlet = filterOutlet === 'All' || s.outlet === filterOutlet;
                return matchSearch && matchRole && matchOutlet;
            }),
        [staffRows, searchTerm, filterRole, filterOutlet]
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const openAdd = () => {
        setEditTarget(null);
        setForm(emptyForm());
        setModal(true);
    };
    const openEdit = (s) => {
        setEditTarget(s);
        setForm({
            name: s.name,
            roleKey: s.roleKey || 'stylist',
            outletId: s.outletId || '',
            email: s.email,
            phone: s.phone,
            password: '',
            joined: s.joined || new Date().toISOString().split('T')[0],
            salary: s.salary != null ? String(s.salary) : '',
            status: s.status || 'active',
            dob: s.dob || '',
            pan: s.pan || '',
            address: s.address || '',
            bankName: s.bankName || '',
            accountNo: s.accountNo || '',
            ifsc: s.ifsc || '',
        });
        setModal(true);
        setMenuOpen(null);
    };

    const buildPayload = () => {
        const payload = {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            role: form.roleKey,
            phone: form.phone,
            status: form.status,
            joinedDate: form.joined,
            salary: Number(form.salary) || 0,
            dob: form.dob || '',
            pan: form.pan || '',
            address: form.address || '',
            bankName: form.bankName || '',
            bankAccountNo: form.accountNo || '',
            ifsc: form.ifsc || '',
        };
        if (form.outletId) payload.outletId = form.outletId;
        return payload;
    };

    const saveStaff = async (e) => {
        e.preventDefault();
        try {
            if (!editTarget && (!form.password || form.password.length < 8)) {
                showToast('Password kam se kam 8 characters (naya staff)');
                return;
            }
            if (editTarget) {
                const payload = buildPayload();
                if (form.password && form.password.length >= 8) payload.password = form.password;
                await updateStaff(editTarget._id || editTarget.id, payload);
                showToast(`${form.name} updated successfully`);
            } else {
                await addStaff({ ...buildPayload(), password: form.password });
                showToast(`${form.name} added to staff`);
            }
            await fetchStaff();
            setModal(false);
        } catch (error) {
            showToast(error?.response?.data?.message || 'Failed to save staff member');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteStaff(id);
            await fetchStaff();
            setMenuOpen(null);
            setDeleteConfirm(null);
            showToast(`Staff member removed`);
        } catch (error) {
            showToast(error?.response?.data?.message || 'Failed to delete staff member');
        }
    };

    const toggleStatus = async (id) => {
        const member = staffRows.find((s) => s._id === id || s.id === id);
        if (member) {
            const newStatus = member.status === 'active' ? 'inactive' : 'active';
            await updateStaff(id, { status: newStatus });
            await fetchStaff();
        }
        setMenuOpen(null);
    };

    const activeCount = staffRows.filter((s) => s.status === 'active').length;

    return (
        <div className="space-y-6 font-black text-left">
            {/* Stats and Role Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-black">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {[
                        { label: 'Total Team Members', value: staffRows.length, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                        { label: 'Active Members', value: activeCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Inactive Members', value: staffRows.length - activeCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { label: 'Recently Joined', value: staffRows.filter((s) => s.joined && new Date(s.joined) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    ].map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="p-6 rounded-none bg-surface border border-border shadow-sm flex items-center gap-6 hover:shadow-xl transition-all group text-left font-black">
                            <div className={`p-4 rounded-none ${stat.bg} border border-border/10 group-hover:scale-110 transition-transform`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
                            <div className="text-left leading-none">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 leading-none">{stat.label}</p>
                                <p className={`text-3xl font-black ${stat.color} tracking-tighter leading-none`}>{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-surface p-8 rounded-none border border-border shadow-sm text-left font-black">
                    <div className="flex items-center justify-between mb-6 text-left">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Team Composition</span>
                        <PieChartIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[140px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={roleData} innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value" stroke="transparent">
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center text-left">
                        {roleData.slice(0, 4).map(d => (
                            <div key={d.name} className="flex items-center gap-2 text-left">
                                <div className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: d.color }} />
                                <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-none border border-border shadow-sm text-left font-black">
                <div className="relative flex-1 max-w-sm text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" placeholder="Search for team members..."
                        className="w-full pl-12 pr-4 py-3 rounded-none bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                        value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
                </div>
                <div className="flex items-center gap-3 text-left">
                    <div className="relative text-left">
                        <button onClick={() => setShowFilter(v => !v)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-[0.1em] border transition-all ${showFilter ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'text-text-secondary border-border hover:border-primary bg-surface'}`}>
                            <Filter className="w-4 h-4" /> Quick Filter
                            {(filterRole !== 'All' || filterOutlet !== 'All') && <span className="w-2 h-2 bg-rose-500 rounded-none shadow-lg shadow-rose-500/40" />}
                        </button>
                        <AnimatePresence>
                            {showFilter && (
                                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-3 w-72 bg-surface border border-border rounded-none shadow-2xl z-50 p-6 space-y-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Filter by Profession</label>
                                        <select className="w-full px-4 py-3 rounded-none bg-background border border-border text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary appearance-none"
                                            value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}>
                                            <option value="All">All Roles</option>
                                            {ROLE_KEYS.map((k) => (
                                                <option key={k} value={k}>{ROLE_LABELS[k]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Filter by Salon</label>
                                        <select className="w-full px-4 py-3 rounded-none bg-background border border-border text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary appearance-none"
                                            value={filterOutlet} onChange={e => { setFilterOutlet(e.target.value); setPage(1); }}>
                                            <option value="All">All Salons</option>
                                            {OUTLET_NAMES.map((o) => (
                                                <option key={o} value={o}>{o}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button onClick={() => { setFilterRole('All'); setFilterOutlet('All'); }} className="w-full py-3 text-[9px] font-black text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-none transition-all uppercase tracking-widest">Reset Filters</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-3 px-8 py-3 rounded-none bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                        <Plus className="w-4 h-4" /> Add Team Member
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden text-left font-black table-responsive relative">
                {staffLoading && (
                    <div className="absolute inset-0 z-10 bg-surface/70 backdrop-blur-[2px] flex items-center justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Loading team…</p>
                    </div>
                )}
                <div className="text-left font-black">
                    <table className="w-full text-left font-black">
                        <thead>
                            <tr className="bg-surface-alt/50 border-b border-border text-left">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Staff Member</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Role & Location</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Contact Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Salary</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left font-black">
                            {paginated.length === 0 ? (
                                <tr><td colSpan={6} className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-text-muted italic opacity-50">No team members found</td></tr>
                            ) : paginated.map(s => (
                                <tr key={s._id || s.id} className="hover:bg-surface-alt/20 transition-colors group text-left">
                                    <td className="px-6 py-5 text-left">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted font-black text-[11px] shrink-0">
                                                {s.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors text-left">{s.name}</p>
                                                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest text-left">Started on: {s.joined ? new Date(s.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-left text-[11px] font-black">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/5 text-violet-500 border border-violet-500/10 uppercase tracking-tighter"><Shield className="w-3.5 h-3.5" />{s.role}</span>
                                        <p className="text-[10px] text-text-muted mt-2 uppercase tracking-widest">{s.outlet}</p>
                                    </td>
                                    <td className="px-6 py-5 text-left text-[11px] font-black">
                                        <p className="text-[10px] text-text flex items-center gap-2 uppercase tracking-tight"><Mail className="w-3.5 h-3.5 text-text-muted" />{s.email}</p>
                                        <p className="text-[10px] text-text flex items-center gap-2 mt-2 uppercase tracking-tight"><Phone className="w-3.5 h-3.5 text-text-muted" />{s.phone}</p>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-black text-primary tracking-tighter uppercase text-left">₹{(s.salary || 0).toLocaleString()}</td>
                                    <td className="px-6 py-5 text-left font-black">
                                        <span className={`inline-flex items-center gap-2.5 px-3 py-1 border text-[9px] font-black uppercase tracking-widest ${s.status === 'active' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-rose-500/5 text-rose-500 border-rose-500/10'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-none ${s.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                            {s.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black">
                                        <div className="flex items-center justify-end gap-2 transition-opacity">
                                            <button onClick={() => setViewModal(s)} className="p-2 rounded-none border border-border hover:bg-primary/10 hover:text-primary transition-all"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => openEdit(s)} className="p-2 rounded-none border border-border hover:bg-primary/10 hover:text-primary transition-all"><Edit2 className="w-4 h-4" /></button>
                                            <div className="relative text-left">
                                                <button onClick={() => setMenuOpen(menuOpen === (s._id || s.id) ? null : (s._id || s.id))} className="p-2 rounded-none border border-border hover:bg-surface transition-all text-text-muted"><MoreVertical className="w-4 h-4" /></button>
                                                <AnimatePresence>
                                                    {menuOpen === (s._id || s.id) && (
                                                        <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                                            className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-none shadow-2xl z-50 w-52 overflow-hidden py-2 text-left">
                                                            <button onClick={() => toggleStatus(s._id || s.id)} className="w-full flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-colors">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Update Status
                                                            </button>
                                                            <button onClick={() => { setDeleteConfirm(s._id || s.id); setMenuOpen(null); }} className="w-full flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-colors">
                                                                <Trash2 className="w-4 h-4 text-rose-500" /> Remove Member
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination industrial */}
                <div className="px-6 py-4 border-t border-border bg-surface-alt/30 flex items-center justify-between text-left font-black">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Showing <span className="text-text">{paginated.length}</span> of <span className="text-text">{filtered.length}</span> team members</p>
                    <div className="flex items-center gap-2 text-left">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-none border border-border text-text-muted disabled:opacity-30 hover:bg-surface transition-all"><ChevronLeft className="w-4 h-4" /></button>
                        <div className="flex gap-1.5 mx-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-none text-[10px] font-black uppercase transition-all ${page === i + 1 ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'border border-border text-text hover:bg-surface'}`}>{i + 1}</button>
                            ))}
                        </div>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-none border border-border text-text-muted disabled:opacity-30 hover:bg-surface transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Modals industrial style ... */}
            <AnimatePresence>
                {modal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-xl rounded-none border border-border shadow-2xl relative max-h-[90vh] flex flex-col">
                            <div className="px-10 py-8 border-b border-border flex items-center justify-between">
                                <div className="text-left font-black">
                                    <h2 className="text-lg font-black text-text uppercase tracking-tight">{editTarget ? 'Edit Member Profile' : 'Add New Member'}</h2>
                                    <p className="text-[10px] font-black text-primary mt-2 uppercase tracking-[0.3em]">Team Settings</p>
                                </div>
                                <button onClick={() => setModal(false)} className="w-12 h-12 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all"><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={saveStaff} className="flex flex-col flex-1 overflow-hidden font-black">
                                <div className="p-8 space-y-6 overflow-y-auto flex-1 text-left">
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-left">
                                        <div className="col-span-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] pb-2 border-b border-border/20 mb-2">General Details</div>

                                        <div className="col-span-2 space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Member Name *</label>
                                            <input required type="text" placeholder="e.g. John Doe"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Role *</label>
                                            <select required className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none appearance-none"
                                                value={form.roleKey} onChange={(e) => setForm((f) => ({ ...f, roleKey: e.target.value }))}>
                                                {ROLE_KEYS.map((k) => (
                                                    <option key={k} value={k}>{ROLE_LABELS[k]}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Primary Salon *</label>
                                            <select required className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none appearance-none"
                                                value={form.outletId} onChange={(e) => setForm((f) => ({ ...f, outletId: e.target.value }))}>
                                                {outlets.map((o) => {
                                                    const oid = String(o._id || o.id);
                                                    return (
                                                        <option key={oid} value={oid}>{o.name}</option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Email Address *</label>
                                            <input required type="email" placeholder="e.g. john@example.com" readOnly={!!editTarget}
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none read-only:opacity-80"
                                                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{editTarget ? 'New password (optional, min 8)' : 'Password * (min 8)'}</label>
                                            <input type="password" autoComplete="new-password" placeholder={editTarget ? 'Leave blank to keep current' : 'Min 8 characters'}
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Phone Number *</label>
                                            <input required type="text" placeholder="10-digit number"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.phone} onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 10) setForm(f => ({ ...f, phone: val }));
                                                }} />
                                        </div>

                                        <div className="col-span-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] pb-2 border-b border-border/20 mt-4 mb-2">Personal Information</div>

                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Work Start Date</label>
                                            <input type="date"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.joined} onChange={e => setForm(f => ({ ...f, joined: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Date of Birth</label>
                                            <input type="date"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">PAN Number</label>
                                            <input type="text" placeholder="PAN_IDENTIFIER"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.pan} onChange={e => setForm(f => ({ ...f, pan: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left font-black">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Account Status</label>
                                            <select className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none appearance-none"
                                                value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Residential Address</label>
                                            <textarea placeholder="FULL_PHYSICAL_LOCATION"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none h-20 resize-none"
                                                value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}></textarea>
                                        </div>

                                        <div className="col-span-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] pb-2 border-b border-border/20 mt-4 mb-2">Payout & Bank Details</div>

                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Monthly Salary</label>
                                            <input type="number" placeholder="CURRENCY_VAL"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Bank Institution</label>
                                            <input type="text" placeholder="BANK_NAME"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Account Number</label>
                                            <input type="text" placeholder="ACCOUNT_NUMBER"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.accountNo} onChange={e => setForm(f => ({ ...f, accountNo: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">IFSC Code</label>
                                            <input type="text" placeholder="IFSC_CODE"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.ifsc} onChange={e => setForm(f => ({ ...f, ifsc: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>
                                <div className="px-10 py-8 border-t border-border bg-surface-alt/20">
                                    <button type="submit" className="w-full py-5 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.99]">
                                        {editTarget ? 'Save Profile' : 'Register Member'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Modal industrial */}
            <AnimatePresence>
                {viewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewModal(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-xl rounded-none border border-border shadow-2xl relative flex flex-col max-h-[90vh]">
                            <div className="p-10 border-b border-border bg-surface-alt/10 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-6 text-left font-black">
                                    <div className="w-20 h-20 rounded-none bg-primary/10 flex items-center justify-center text-primary font-black text-3xl border border-primary/20 shadow-2xl shadow-primary/5">
                                        {viewModal.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="text-left font-black">
                                        <h2 className="text-xl font-black text-text uppercase tracking-tight leading-none">{viewModal.name}</h2>
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/5 text-violet-500 border border-violet-500/10 text-[10px] font-black uppercase tracking-widest mt-3 italic"><Shield className="w-3 h-3" />{viewModal.role}</span>
                                    </div>
                                </div>
                                <button onClick={() => setViewModal(null)} className="w-12 h-12 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text transition-all"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="p-10 overflow-y-auto space-y-8 flex-1 font-black">
                                <div className="grid grid-cols-2 gap-x-10 gap-y-6 text-left">
                                    <div className="col-span-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 border-b border-border/10 pb-2">Work Details</div>

                                    <div className="text-left font-black">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none flex items-center gap-2"><Building2 className="w-3 h-3" /> Primary Salon</p>
                                        <p className="text-[11px] font-black text-text uppercase leading-none">{viewModal.outlet}</p>
                                    </div>
                                    <div className="text-left font-black">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none flex items-center gap-2"><Calendar className="w-3 h-3" /> Start Date</p>
                                        <p className="text-[11px] font-black text-text uppercase leading-none">{viewModal.joined ? new Date(viewModal.joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'NULL'}</p>
                                    </div>
                                    <div className="text-left font-black">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none flex items-center gap-2"><Mail className="w-3 h-3" /> Email Address</p>
                                        <p className="text-[11px] font-black text-text lowercase truncate leading-none">{viewModal.email}</p>
                                    </div>
                                    <div className="text-left font-black">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none flex items-center gap-2"><Phone className="w-3 h-3" /> Phone Number</p>
                                        <p className="text-[11px] font-black text-text uppercase leading-none">{viewModal.phone}</p>
                                    </div>

                                    <div className="col-span-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-4 mb-2 border-b border-border/10 pb-2">Personal Information</div>

                                    <div className="text-left font-black">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none flex items-center gap-2"><Calendar className="w-3 h-3" /> Date of Birth</p>
                                        <p className="text-[11px] font-black text-text uppercase leading-none">{viewModal.dob || 'NOT_DECLARED'}</p>
                                    </div>
                                    <div className="text-left font-black">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none flex items-center gap-2"><Shield className="w-3 h-3" /> PAN Number</p>
                                        <p className="text-[11px] font-black text-text uppercase leading-none">{viewModal.pan || 'NOT_FOUND'}</p>
                                    </div>
                                    <div className="col-span-2 text-left font-black">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Residential Address</p>
                                        <p className="text-[11px] font-black text-text uppercase leading-relaxed">{viewModal.address || 'Address not provided'}</p>
                                    </div>

                                    <div className="col-span-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-4 mb-2 border-b border-border/10 pb-2">Bank Account Details</div>

                                    <div className="text-left font-black">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none">Banking Institution</p>
                                        <p className="text-[11px] font-black text-text uppercase leading-none">{viewModal.bankName || 'NULL'}</p>
                                    </div>
                                    <div className="text-left font-black">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none">Account Number</p>
                                        <p className="text-[11px] font-black text-text uppercase tracking-widest font-mono leading-none">{viewModal.accountNo || 'XXXXXXXXXXXX'}</p>
                                    </div>
                                    <div className="text-left font-black">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none">IFSC Code</p>
                                        <p className="text-[11px] font-black text-text uppercase tracking-widest font-mono leading-none">{viewModal.ifsc || 'XXXX0000XXX'}</p>
                                    </div>
                                    <div className="text-left font-black">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none">Account Status</p>
                                        <p className={`text-[11px] font-black uppercase leading-none ${viewModal.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>{viewModal.status === 'active' ? 'Active' : 'Inactive'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 border-t border-border bg-surface-alt/5 shrink-0">
                                <button onClick={() => { openEdit(viewModal); setViewModal(null); }}
                                    className="w-full py-5 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                                    Modify Profile
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete industrial */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface w-full max-w-xs rounded-none border border-border shadow-2xl relative p-10 text-center font-black">
                            <div className="w-16 h-16 bg-rose-500/10 rounded-none flex items-center justify-center mx-auto mb-8 border border-rose-500/10 text-rose-500"><Trash2 className="w-8 h-8" /></div>
                            <h3 className="text-sm font-black text-text uppercase tracking-widest">Remove Member from Team?</h3>
                            <p className="text-[10px] text-text-muted mt-3 mb-8 uppercase font-bold tracking-widest leading-relaxed italic">Warning: This will permanently delete the member record.</p>
                            <div className="flex flex-col gap-3 font-black">
                                <button onClick={() => handleDelete(deleteConfirm)} className="w-full py-4 bg-rose-500 text-white rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/10 hover:bg-rose-600 transition-all">Delete</button>
                                <button onClick={() => setDeleteConfirm(null)} className="w-full py-4 bg-background border border-border rounded-none text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:bg-surface-alt transition-all">Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
