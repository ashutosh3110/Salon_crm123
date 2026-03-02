import { useState, useMemo } from 'react';
import { Users, Search, Filter, Plus, MoreVertical, Mail, Phone, Calendar, Shield, CheckCircle2, Clock, Edit2, Eye, Trash2, UserPlus, Building2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = ['Senior Stylist', 'Hair Specialist', 'Makeup Artist', 'Manager', 'Receptionist', 'Barber', 'Nail Technician'];
const OUTLETS = ['Main Branch', 'City Center', 'West End', 'Bandra Branch'];
const PAGE_SIZE = 5;

const INITIAL_STAFF = [
    { id: 1, name: 'Ananya Sharma', role: 'Senior Stylist', outlet: 'Main Branch', status: 'active', email: 'ananya@salon.com', phone: '+91 98765 43210', joined: '2023-05-15', salary: 25000 },
    { id: 2, name: 'Rahul Verma', role: 'Hair Specialist', outlet: 'City Center', status: 'active', email: 'rahul@salon.com', phone: '+91 98765 43211', joined: '2023-06-20', salary: 18000 },
    { id: 3, name: 'Priya Singh', role: 'Makeup Artist', outlet: 'Main Branch', status: 'inactive', email: 'priya@salon.com', phone: '+91 98765 43212', joined: '2023-01-10', salary: 20000 },
    { id: 4, name: 'Vikram Malhotra', role: 'Manager', outlet: 'West End', status: 'active', email: 'vikram@salon.com', phone: '+91 98765 43213', joined: '2022-11-05', salary: 45000 },
    { id: 5, name: 'Sneha Kapur', role: 'Receptionist', outlet: 'City Center', status: 'active', email: 'sneha@salon.com', phone: '+91 98765 43214', joined: '2023-08-12', salary: 15000 },
    { id: 6, name: 'Amit Sharma', role: 'Barber', outlet: 'Main Branch', status: 'active', email: 'amit@salon.com', phone: '+91 98765 43215', joined: '2023-09-01', salary: 17000 },
    { id: 7, name: 'Kavita Patel', role: 'Nail Technician', outlet: 'Bandra Branch', status: 'active', email: 'kavita@salon.com', phone: '+91 98765 43216', joined: '2024-01-15', salary: 16000 },
];

const EMPTY_FORM = { name: '', role: ROLES[0], outlet: OUTLETS[0], email: '', phone: '', joined: '', salary: '', status: 'active' };

export default function StaffManager() {
    const [staff, setStaff] = useState(INITIAL_STAFF);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterOutlet, setFilterOutlet] = useState('All');
    const [showFilter, setShowFilter] = useState(false);
    const [page, setPage] = useState(1);

    const [modal, setModal] = useState(false);        // add/edit modal
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const [viewModal, setViewModal] = useState(null); // view profile
    const [menuOpen, setMenuOpen] = useState(null);   // ⋮ menu
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    // ── Filtered + paginated ──────────────────────────────────
    const filtered = useMemo(() => staff.filter(s => {
        const q = searchTerm.toLowerCase();
        const matchSearch = s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
        const matchRole = filterRole === 'All' || s.role === filterRole;
        const matchOutlet = filterOutlet === 'All' || s.outlet === filterOutlet;
        return matchSearch && matchRole && matchOutlet;
    }), [staff, searchTerm, filterRole, filterOutlet]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── CRUD ──────────────────────────────────────────────────
    const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setModal(true); };
    const openEdit = (s) => { setEditTarget(s); setForm({ ...s }); setModal(true); setMenuOpen(null); };

    const saveStaff = (e) => {
        e.preventDefault();
        if (editTarget) {
            setStaff(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...form } : s));
            showToast(`${form.name} updated successfully`);
        } else {
            const newStaff = { ...form, id: Date.now(), salary: Number(form.salary) };
            setStaff(prev => [...prev, newStaff]);
            showToast(`${form.name} added to staff`);
        }
        setModal(false);
    };

    const deleteStaff = (id) => {
        const target = staff.find(s => s.id === id);
        setStaff(prev => prev.filter(s => s.id !== id));
        setMenuOpen(null); setDeleteConfirm(null);
        showToast(`${target?.name} removed from staff`);
    };

    const toggleStatus = (id) => {
        setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
        setMenuOpen(null);
    };

    const activeCount = staff.filter(s => s.status === 'active').length;

    return (
        <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Staff', value: staff.length, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                    { label: 'Active', value: activeCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Inactive', value: staff.length - activeCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'New This Month', value: staff.filter(s => new Date(s.joined) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="p-4 rounded-2xl bg-surface border border-border/40 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
                        <div className={`p-2.5 rounded-xl ${stat.bg}`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
                            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-border/40 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" placeholder="Search by name, role or email..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-background text-sm font-bold focus:outline-none focus:border-primary transition-all"
                        value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button onClick={() => setShowFilter(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${showFilter ? 'bg-primary text-white border-primary' : 'text-text-secondary border-border/40 hover:border-primary/40 bg-surface'}`}>
                            <Filter className="w-4 h-4" /> Filters
                            {(filterRole !== 'All' || filterOutlet !== 'All') && <span className="w-2 h-2 bg-rose-500 rounded-full" />}
                        </button>
                        <AnimatePresence>
                            {showFilter && (
                                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border/40 rounded-2xl shadow-2xl z-30 p-4 space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Role</label>
                                        <select className="w-full px-3 py-2 rounded-xl bg-background border border-border/40 text-xs font-bold outline-none"
                                            value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}>
                                            <option value="All">All Roles</option>
                                            {ROLES.map(r => <option key={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Outlet</label>
                                        <select className="w-full px-3 py-2 rounded-xl bg-background border border-border/40 text-xs font-bold outline-none"
                                            value={filterOutlet} onChange={e => { setFilterOutlet(e.target.value); setPage(1); }}>
                                            <option value="All">All Outlets</option>
                                            {OUTLETS.map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <button onClick={() => { setFilterRole('All'); setFilterOutlet('All'); }} className="w-full py-2 text-xs font-black text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">Reset Filters</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <Plus className="w-4 h-4" /> Add New Staff
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-3xl border border-border/40 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/60 border-b border-border/40">
                                {['Employee', 'Role & Outlet', 'Contact', 'Salary', 'Status', 'Actions'].map(h => (
                                    <th key={h} className={`px-5 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-widest ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {paginated.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-sm font-bold text-text-muted">No staff found</td></tr>
                            ) : paginated.map(s => (
                                <tr key={s.id} className="hover:bg-surface-alt/30 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
                                                {s.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">{s.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">Joined {new Date(s.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 text-[10px] font-bold uppercase"><Shield className="w-2.5 h-2.5" />{s.role}</span>
                                        <p className="text-xs text-text flex items-center gap-1 font-medium mt-1"><Building2 className="w-3 h-3 text-text-muted" />{s.outlet}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-xs text-text flex items-center gap-1.5 font-medium"><Mail className="w-3 h-3 text-text-muted" />{s.email}</p>
                                        <p className="text-xs text-text flex items-center gap-1.5 font-medium mt-1"><Phone className="w-3 h-3 text-text-muted" />{s.phone}</p>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-black text-primary">₹{(s.salary || 0).toLocaleString()}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setViewModal(s)} className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-all" title="View Profile"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-all" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                            <div className="relative">
                                                <button onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)} className="p-2 rounded-lg hover:bg-surface text-text-muted transition-all"><MoreVertical className="w-4 h-4" /></button>
                                                <AnimatePresence>
                                                    {menuOpen === s.id && (
                                                        <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                                            className="absolute right-0 top-full mt-1 bg-surface border border-border/40 rounded-xl shadow-xl z-20 w-44 overflow-hidden py-1">
                                                            <button onClick={() => toggleStatus(s.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-text hover:bg-surface-alt text-left transition-colors">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Toggle Status
                                                            </button>
                                                            <button onClick={() => { setDeleteConfirm(s.id); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 text-left transition-colors">
                                                                <Trash2 className="w-3.5 h-3.5" /> Delete
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
                {/* Pagination */}
                <div className="px-5 py-3.5 border-t border-border/40 bg-background/40 flex items-center justify-between">
                    <p className="text-xs font-bold text-text-muted">Showing <span className="text-text">{paginated.length}</span> of <span className="text-text">{filtered.length}</span> staff</p>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-border/40 text-text-muted disabled:opacity-30 hover:bg-surface-alt transition-all"><ChevronLeft className="w-4 h-4" /></button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button key={i} onClick={() => setPage(i + 1)} className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${page === i + 1 ? 'bg-primary text-white' : 'border border-border/40 text-text hover:bg-surface-alt'}`}>{i + 1}</button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-border/40 text-text-muted disabled:opacity-30 hover:bg-surface-alt transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* ── Add / Edit Modal ── */}
            <AnimatePresence>
                {modal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg rounded-[28px] border border-border/40 shadow-2xl relative max-h-[90vh] flex flex-col">
                            <div className="px-7 py-5 border-b border-border/40 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-text uppercase">{editTarget ? 'Edit Staff Member' : 'Add New Staff'}</h2>
                                    <p className="text-[10px] font-bold text-text-muted mt-0.5">Human Capital Management</p>
                                </div>
                                <button onClick={() => setModal(false)} className="w-9 h-9 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={saveStaff} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-7 space-y-4 overflow-y-auto flex-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name *</label>
                                            <input required type="text" placeholder="e.g. Ananya Sharma"
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Role *</label>
                                            <select required className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none"
                                                value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                                {ROLES.map(r => <option key={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Outlet *</label>
                                            <select required className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none"
                                                value={form.outlet} onChange={e => setForm(f => ({ ...f, outlet: e.target.value }))}>
                                                {OUTLETS.map(o => <option key={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Email *</label>
                                            <input required type="email" placeholder="staff@salon.com"
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone *</label>
                                            <input required type="text" placeholder="+91 98765 43210"
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Joining Date</label>
                                            <input type="date"
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                                value={form.joined} onChange={e => setForm(f => ({ ...f, joined: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Base Salary (₹)</label>
                                            <input type="number" placeholder="25000"
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                                value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none"
                                                value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-7 py-5 border-t border-border/40">
                                    <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                                        {editTarget ? 'Save Changes' : 'Add Staff Member'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── View Profile Modal ── */}
            <AnimatePresence>
                {viewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-[28px] border border-border/40 shadow-2xl relative p-7">
                            <button onClick={() => setViewModal(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            <div className="text-center mb-5">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border-2 border-primary/20 mx-auto mb-3">
                                    {viewModal.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h2 className="text-lg font-black text-text">{viewModal.name}</h2>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 text-[10px] font-bold uppercase mt-1"><Shield className="w-2.5 h-2.5" />{viewModal.role}</span>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { icon: Building2, label: 'Outlet', value: viewModal.outlet },
                                    { icon: Mail, label: 'Email', value: viewModal.email },
                                    { icon: Phone, label: 'Phone', value: viewModal.phone },
                                    { icon: Calendar, label: 'Joined', value: viewModal.joined ? new Date(viewModal.joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A' },
                                    { icon: CheckCircle2, label: 'Salary', value: `₹${(viewModal.salary || 0).toLocaleString()}/month` },
                                ].map(row => (
                                    <div key={row.label} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border/10">
                                        <row.icon className="w-4 h-4 text-text-muted shrink-0" />
                                        <div>
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{row.label}</p>
                                            <p className="text-xs font-bold text-text">{row.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => { openEdit(viewModal); setViewModal(null); }}
                                className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-[1.01] transition-all">
                                Edit Profile
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Delete Confirm Modal ── */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface w-full max-w-xs rounded-[24px] border border-border/40 shadow-2xl relative p-6 text-center">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-rose-500" /></div>
                            <h3 className="text-base font-black text-text uppercase">Delete Staff?</h3>
                            <p className="text-xs text-text-muted mt-1 mb-5">This action cannot be undone.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-background border border-border/40 rounded-xl text-xs font-black text-text-muted hover:bg-surface-alt transition-all">Cancel</button>
                                <button onClick={() => deleteStaff(deleteConfirm)} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black uppercase shadow-md shadow-rose-500/20 hover:scale-[1.02] transition-all">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 bg-surface border border-border/40 rounded-2xl shadow-2xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-sm font-bold text-text">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
