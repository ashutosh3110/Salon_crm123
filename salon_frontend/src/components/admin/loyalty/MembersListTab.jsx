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

import loyaltyData from '../../../data/loyaltyMockData.json';

const MOCK_MEMBERS = loyaltyData.members;


export default function MembersListTab() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);

    const filteredMembers = MOCK_MEMBERS.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''));
        if (filter === 'all') return matchesSearch;
        return matchesSearch && m.status === filter;
    });

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Members / Phone / Plan..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full h-14 bg-surface border border-border/60 pl-12 pr-4 text-sm font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                    {['all', 'active', 'expired', 'cancelled'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 border font-black text-[9px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filter === f
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'text-text-muted border-border/40 hover:bg-surface-alt'
                                }`}
                        >
                            {f} Members
                        </button>
                    ))}
                    <button className="p-3.5 border border-border/40 text-text-muted hover:text-white hover:bg-surface-alt transition-all">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-surface border border-border/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
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
                            {filteredMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-surface-alt/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-foreground italic tracking-tight">{member.name}</div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mt-1">{maskPhone(member.phone, user?.role)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-black text-foreground uppercase italic tracking-tighter">{member.plan}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge status={member.status} />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground opacity-80">{new Date(member.joinDate).toLocaleDateString()}</span>
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Initialization</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-text-muted" />
                                            <span className={`text-xs font-bold ${member.status === 'expired' ? 'text-rose-500' : 'text-foreground'}`}>
                                                {new Date(member.expiry).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <button className="p-2 text-text-muted hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                                            <Settings size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredMembers.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                        <AlertCircle className="w-12 h-12 text-text-muted opacity-20" />
                        <div>
                            <p className="text-sm font-black text-foreground uppercase italic tracking-tighter">No Members Discovered</p>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Adjust search metrics or reset filters</p>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                <div className="p-6 border-t border-border/40 flex items-center justify-between bg-surface-alt/30">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Showing 1 to {filteredMembers.length} of {filteredMembers.length} Identities</p>
                    <div className="flex gap-2">
                        <button disabled className="p-2 border border-border/40 text-text-muted opacity-30"><ChevronLeft size={16} /></button>
                        <button disabled className="p-2 border border-border/40 text-text-muted opacity-30"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Th({ children }) {
    return (
        <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] italic">
            {children}
        </th>
    );
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
