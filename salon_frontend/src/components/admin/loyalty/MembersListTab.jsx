import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    Settings,
    ShieldCheck,
    Clock,
    AlertCircle,
    Download
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { maskPhone } from '../../../utils/phoneUtils';
import { motion } from 'framer-motion';
import { useBusiness } from '../../../contexts/BusinessContext';
import mockApi from '../../../services/mock/mockApi';

export default function MembersListTab() {
    const { customers } = useBusiness();
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });

    useEffect(() => {
        const loadMembers = async () => {
            setLoading(true);
            try {
                const res = await mockApi.get('/loyalty/members', {
                    params: {
                        page,
                        limit: 20,
                        search: searchTerm || undefined,
                        status: filter,
                    },
                });
                const rows = res?.data?.data || res?.data || [];
                setMembers(Array.isArray(rows) ? rows : []);
                setMeta(res?.data?.meta || { page: 1, totalPages: 1, total: rows.length, limit: 20 });
            } catch {
                setMembers([]);
            } finally {
                setLoading(false);
            }
        };
        loadMembers();
    }, [page, searchTerm, filter]);

    const downloadCsv = () => {
        const header = ['Name', 'Phone', 'Plan', 'Status', 'Joined', 'Expiry', 'Points'];
        const rows = members.map((m) => [
            m.name || 'Unknown',
            m.phone || '',
            m.loyaltyPlan || 'Standard',
            m.loyaltyStatus || 'active',
            m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : '',
            m.loyaltyExpiry ? new Date(m.loyaltyExpiry).toLocaleDateString('en-IN') : '',
            Number(m.totalPoints || 0),
        ]);
        const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `active-members-page-${page}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 italic">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="relative w-full lg:w-96 group text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Members / Phone / Plan..."
                        value={searchTerm}
                        onChange={e => { setPage(1); setSearchTerm(e.target.value); }}
                        className="w-full h-14 bg-surface border border-border/60 pl-12 pr-4 text-sm font-bold text-foreground focus:border-primary outline-none transition-all shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                    {['all', 'active', 'expired'].map((f) => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-6 py-3 border font-black text-[9px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filter === f
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'text-text-muted border-border/40 hover:bg-surface-alt'
                                }`}
                        >
                            {f} Members
                        </button>
                    ))}
                    <button onClick={downloadCsv} className="p-3.5 border border-border/40 text-text-muted hover:text-white hover:bg-surface-alt transition-all">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-surface border border-border/40 overflow-hidden text-left">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface-alt border-b border-border/40">
                            <tr>
                                <Th>Customer Identity</Th>
                                <Th>Subscription Tier</Th>
                                <Th>Protocol Status</Th>
                                <Th>Join Cycle</Th>
                                <Th>Expiry Timeline</Th>
                                <Th>Actions</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-sm font-bold text-text-muted">Loading active members...</td></tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-surface-alt/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic">
                                                    {(member.name || 'U')[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-foreground italic tracking-tight">{member.name || 'Unknown'}</div>
                                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mt-1">{maskPhone(member.phone || '', user?.role)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-black text-foreground uppercase italic tracking-tighter">{member.loyaltyPlan || 'Standard'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5"><StatusBadge status={member.loyaltyStatus || 'active'} /></td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground opacity-80">{new Date(member.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mt-1 italic">Initiated</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 italic">
                                                <Clock className="w-3 h-3 text-text-muted" />
                                                <span className="text-xs font-bold">{member.loyaltyExpiry || 'NEVER'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <button className="p-2 text-text-muted hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                                                <Settings size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Th({ children }) {
    return <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest italic">{children}</th>;
}

function StatusBadge({ status }) {
    const styles = {
        active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
        expired: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
        cancelled: 'bg-white/5 text-text-muted border-white/10',
    };
    return (
        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border leading-none ${styles[status]}`}>
            {status}
        </span>
    );
}
