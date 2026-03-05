import { useState, useMemo } from 'react';
import { Users, Search, Filter, Plus, MoreVertical, Mail, Phone, Calendar, Shield, CheckCircle2, Clock, Edit2, Eye, Trash2, UserPlus, Building2, X, ChevronLeft, ChevronRight, PieChart as PieChartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

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

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

const EMPTY_FORM = { name: '', role: ROLES[0], outlet: OUTLETS[0], email: '', phone: '', joined: '', salary: '', status: 'active' };

export default function StaffManager() {
    const [staff, setStaff] = useState(INITIAL_STAFF);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterOutlet, setFilterOutlet] = useState('All');
    const [showFilter, setShowFilter] = useState(false);
    const [page, setPage] = useState(1);

    const [modal, setModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const [viewModal, setViewModal] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const roleData = useMemo(() => {
        const counts = {};
        staff.forEach(s => {
            counts[s.role] = (counts[s.role] || 0) + 1;
        });
        return Object.keys(counts).map((role, i) => ({
            name: role,
            value: counts[role],
            color: COLORS[i % COLORS.length]
        }));
    }, [staff]);

    const filtered = useMemo(() => staff.filter(s => {
        const q = searchTerm.toLowerCase();
        const matchSearch = s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
        const matchRole = filterRole === 'All' || s.role === filterRole;
        const matchOutlet = filterOutlet === 'All' || s.outlet === filterOutlet;
        return matchSearch && matchRole && matchOutlet;
    }), [staff, searchTerm, filterRole, filterOutlet]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        <div className="space-y-6 font-black text-left">
            {/* Stats and Role Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-black">
                <div className="lg:col-span-2 grid grid-cols-2 gap-4 text-left">
                    {[
                        { label: 'Total Personnel', value: staff.length, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                        { label: 'Active States', value: activeCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Dormant Nodes', value: staff.length - activeCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { label: 'Recent Cycles', value: staff.filter(s => new Date(s.joined) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Occupation Matrix</span>
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
                    <input type="text" placeholder="QUERY MASTER REGISTRY..."
                        className="w-full pl-12 pr-4 py-3 rounded-none bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                        value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
                </div>
                <div className="flex items-center gap-3 text-left">
                    <div className="relative text-left">
                        <button onClick={() => setShowFilter(v => !v)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-[0.1em] border transition-all ${showFilter ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'text-text-secondary border-border hover:border-primary bg-surface'}`}>
                            <Filter className="w-4 h-4" /> Filter Matrix
                            {(filterRole !== 'All' || filterOutlet !== 'All') && <span className="w-2 h-2 bg-rose-500 rounded-none shadow-lg shadow-rose-500/40" />}
                        </button>
                        <AnimatePresence>
                            {showFilter && (
                                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-3 w-72 bg-surface border border-border rounded-none shadow-2xl z-50 p-6 space-y-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Variant</label>
                                        <select className="w-full px-4 py-3 rounded-none bg-background border border-border text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary appearance-none"
                                            value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}>
                                            <option value="All">Full Occupation Spectrum</option>
                                            {ROLES.map(r => <option key={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Active Node</label>
                                        <select className="w-full px-4 py-3 rounded-none bg-background border border-border text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary appearance-none"
                                            value={filterOutlet} onChange={e => { setFilterOutlet(e.target.value); setPage(1); }}>
                                            <option value="All">All Operational Nodes</option>
                                            {OUTLETS.map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <button onClick={() => { setFilterRole('All'); setFilterOutlet('All'); }} className="w-full py-3 text-[9px] font-black text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-none transition-all uppercase tracking-widest">Clear Constraints</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-3 px-8 py-3 rounded-none bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                        <Plus className="w-4 h-4" /> Enroll Unit
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden text-left font-black">
                <div className="overflow-x-auto text-left font-black">
                    <table className="w-full text-left font-black">
                        <thead>
                            <tr className="bg-surface-alt/50 border-b border-border text-left">
                                {['Identitiy_Node', 'Specialization', 'Comm_Links', 'Credits', 'Status_Bit', 'Control'].map(h => (
                                    <th key={h} className={`px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ${h === 'Control' ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left font-black">
                            {paginated.length === 0 ? (
                                <tr><td colSpan={6} className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-text-muted italic opacity-50">Empty Personnel Matrix</td></tr>
                            ) : paginated.map(s => (
                                <tr key={s.id} className="hover:bg-surface-alt/20 transition-colors group text-left">
                                    <td className="px-6 py-5 text-left">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted font-black text-[11px] shrink-0">
                                                {s.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors text-left">{s.name}</p>
                                                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest text-left">Cycle_Start: {new Date(s.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-left text-[11px] font-black">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/5 text-violet-500 border border-violet-500/10 uppercase tracking-tighter"><Shield className="w-3 h-3" />{s.role}</span>
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
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setViewModal(s)} className="p-2 rounded-none border border-border hover:bg-primary/10 hover:text-primary transition-all"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => openEdit(s)} className="p-2 rounded-none border border-border hover:bg-primary/10 hover:text-primary transition-all"><Edit2 className="w-4 h-4" /></button>
                                            <div className="relative text-left">
                                                <button onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)} className="p-2 rounded-none border border-border hover:bg-surface transition-all text-text-muted"><MoreVertical className="w-4 h-4" /></button>
                                                <AnimatePresence>
                                                    {menuOpen === s.id && (
                                                        <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                                            className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-none shadow-2xl z-50 w-52 overflow-hidden py-2 text-left">
                                                            <button onClick={() => toggleStatus(s.id)} className="w-full flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-colors">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Toggle Bit
                                                            </button>
                                                            <button onClick={() => { setDeleteConfirm(s.id); setMenuOpen(null); }} className="w-full flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-colors">
                                                                <Trash2 className="w-4 h-4 text-rose-500" /> Void Unit
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
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Showing <span className="text-text">{paginated.length}</span> of <span className="text-text">{filtered.length}</span> matrix nodes</p>
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
                            className="bg-surface w-full max-w-2xl rounded-none border border-border shadow-2xl relative max-h-[95vh] flex flex-col">
                            <div className="px-10 py-8 border-b border-border flex items-center justify-between">
                                <div className="text-left font-black">
                                    <h2 className="text-lg font-black text-text uppercase tracking-tight">{editTarget ? 'Edit Personnel Data' : 'New Enrollment'}</h2>
                                    <p className="text-[10px] font-black text-primary mt-2 uppercase tracking-[0.3em]">Module :: HCM_V4.2</p>
                                </div>
                                <button onClick={() => setModal(false)} className="w-12 h-12 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all"><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={saveStaff} className="flex flex-col flex-1 overflow-hidden font-black">
                                <div className="p-10 space-y-8 overflow-y-auto flex-1 text-left">
                                    <div className="grid grid-cols-2 gap-8 text-left">
                                        <div className="col-span-2 space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Legal Identity *</label>
                                            <input required type="text" placeholder="FULL_NAME"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Vector Role *</label>
                                            <select required className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none appearance-none"
                                                value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                                {ROLES.map(r => <option key={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Assigned Node *</label>
                                            <select required className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none appearance-none"
                                                value={form.outlet} onChange={e => setForm(f => ({ ...f, outlet: e.target.value }))}>
                                                {OUTLETS.map(o => <option key={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Digital Uplink *</label>
                                            <input required type="email" placeholder="UPLINK_MAIL"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Comm_Frequency *</label>
                                            <input required type="text" placeholder="PHONE_STREAM"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Genesis Date</label>
                                            <input type="date"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.joined} onChange={e => setForm(f => ({ ...f, joined: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Credit Allocation (₹)</label>
                                            <input type="number" placeholder="SALARY_VAL"
                                                className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                                value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2 text-left font-black">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Operational Bit</label>
                                            <select className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none appearance-none"
                                                value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                                <option value="active">Active State</option>
                                                <option value="inactive">Dormant State</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-10 py-8 border-t border-border bg-surface-alt/20">
                                    <button type="submit" className="w-full py-5 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.99]">
                                        {editTarget ? 'Overwrite Matrix Entry' : 'Finalize Enrollment'}
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
                            className="bg-surface w-full max-w-sm rounded-none border border-border shadow-2xl relative p-10 text-left">
                            <button onClick={() => setViewModal(null)} className="absolute top-6 right-6 w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text"><X className="w-5 h-5" /></button>
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 rounded-none bg-primary/10 flex items-center justify-center text-primary font-black text-3xl border border-primary/20 mx-auto mb-6 shadow-2xl shadow-primary/5">
                                    {viewModal.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h2 className="text-xl font-black text-text uppercase tracking-tight">{viewModal.name}</h2>
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/5 text-violet-500 border border-violet-500/10 text-[10px] font-black uppercase tracking-widest mt-3 italic"><Shield className="w-3 h-3" />{viewModal.role}</span>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { icon: Building2, label: 'Assigned Node', value: viewModal.outlet },
                                    { icon: Mail, label: 'Digital Uplink', value: viewModal.email },
                                    { icon: Phone, label: 'Comm_Freq', value: viewModal.phone },
                                    { icon: Calendar, label: 'Joined Cycle', value: viewModal.joined ? new Date(viewModal.joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'NULL' },
                                    { icon: CheckCircle2, label: 'Monthly Credit', value: `₹${(viewModal.salary || 0).toLocaleString()}` },
                                ].map(row => (
                                    <div key={row.label} className="flex items-center gap-4 p-4 bg-background border border-border/40 text-left">
                                        <row.icon className="w-4 h-4 text-text-muted shrink-0" />
                                        <div className="text-left leading-none">
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 leading-none">{row.label}</p>
                                            <p className="text-[11px] font-black text-text uppercase leading-none">{row.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => { openEdit(viewModal); setViewModal(null); }}
                                className="w-full mt-8 py-4 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/10 hover:bg-primary-dark transition-all">
                                Protocol Edit
                            </button>
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
                            <h3 className="text-sm font-black text-text uppercase tracking-widest">Terminate Node?</h3>
                            <p className="text-[10px] text-text-muted mt-3 mb-8 uppercase font-bold tracking-widest leading-relaxed italic">Warning: Irreversible deletion of matrix entity.</p>
                            <div className="flex flex-col gap-3 font-black">
                                <button onClick={() => deleteStaff(deleteConfirm)} className="w-full py-4 bg-rose-500 text-white rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/10 hover:bg-rose-600 transition-all">TERMINATE</button>
                                <button onClick={() => setDeleteConfirm(null)} className="w-full py-4 bg-background border border-border rounded-none text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:bg-surface-alt transition-all">ABORT</button>
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
