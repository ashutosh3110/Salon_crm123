import { useState } from 'react';
import { Search, User, Mail, Phone, Calendar, Star, ChevronRight, History, Heart } from 'lucide-react';

const myClients = [
    { id: 1, name: 'Priya Sharma', visits: 12, lastService: 'Feb 15, 2024', status: 'VIP', rating: 4.9, preferences: 'Low heat, side part' },
    { id: 2, name: 'Meera Patel', visits: 5, lastService: 'Jan 28, 2024', status: 'Regular', rating: 4.7, preferences: 'Ammonia-free color only' },
    { id: 3, name: 'Sneha Reddy', visits: 8, lastService: 'Feb 02, 2024', status: 'Regular', rating: 4.8, preferences: 'Loves head massage' },
    { id: 4, name: 'Ritu Singh', visits: 3, lastService: 'Dec 20, 2023', status: 'At Risk', rating: 4.5, preferences: 'Natural looks' },
    { id: 5, name: 'Kavya Iyer', visits: 15, lastService: 'Feb 20, 2024', status: 'VIP', rating: 5.0, preferences: 'Regular root touchup' },
];

export default function StylistClientsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = myClients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-text tracking-tight uppercase">My Clients</h1>
                <p className="text-sm text-text-muted font-medium">Manage your personal client base and their preferences</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-surface rounded-2xl border border-border/40 p-3 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border/40 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Clients Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {filteredClients.map((client) => (
                    <div key={client.id} className="bg-surface rounded-2xl border border-border/40 p-5 hover:border-primary/30 transition-all shadow-sm group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-black uppercase">
                                    {client.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-text group-hover:text-primary transition-colors">{client.name}</h3>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${client.status === 'VIP' ? 'bg-amber-500/10 text-amber-500' :
                                        client.status === 'Regular' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                        }`}>
                                        {client.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span className="text-sm font-bold text-text">{client.rating}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-background rounded-xl p-3 border border-border/10">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Visits</p>
                                <p className="text-sm font-bold text-text">{client.visits}</p>
                            </div>
                            <div className="bg-background rounded-xl p-3 border border-border/10">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Last Visit</p>
                                <p className="text-sm font-bold text-text">{client.lastService}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-text-secondary leading-relaxed"><span className="font-bold">Preferences:</span> {client.preferences}</p>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 py-2  bg-surface-alt border border-border/40 rounded-xl text-xs font-bold text-text-secondary hover:bg-white hover:text-primary transition-all">
                                <History className="w-3.5 h-3.5" /> View Service History
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
