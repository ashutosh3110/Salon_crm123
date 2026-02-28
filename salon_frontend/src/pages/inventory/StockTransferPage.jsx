import { useState } from 'react';
import { ArrowLeftRight, Plus, MapPin, Package, Calendar, MoreHorizontal, ChevronRight, Search, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';

const initialTransfers = [
    { id: 'TR089', item: "L'Oréal Hair Colour", qty: 12, from: 'Main Storage', to: 'Outlet 1 - Styling Hub', date: 'Today, 2:30 PM', status: 'In Transit' },
    { id: 'TR088', item: 'Schwarzkopf Shampoo', qty: 5, from: 'Main Storage', to: 'Outlet 2 - Express', date: 'Yesterday', status: 'Received' },
];

export default function StockTransferPage() {
    const { products, updateStock } = useInventory();
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transfers, setTransfers] = useState(initialTransfers);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransfers = transfers.filter(t =>
        t.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTransfer = (e) => {
        e.preventDefault();
        // Mock transfer logic for UI
        setIsTransferModalOpen(false);
        alert('Stock transfer initiated successfully!');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Stock Transfer</h1>
                    <p className="text-sm text-text-muted font-medium">Move inventory between different storage locations and outlets</p>
                </div>
                <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> New Transfer
                </button>
            </div>

            {/* Transfer Utility */}
            <div className="grid lg:grid-cols-4 gap-4 text-left">
                <div className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-lg font-black text-text">4</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active Locations</p>
                    </div>
                </div>
                <div className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                        <ArrowLeftRight className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                        <p className="text-lg font-black text-text">12</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Transfers This Month</p>
                    </div>
                </div>
            </div>

            {/* List & Controls */}
            <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50">
                    <h2 className="text-sm font-black text-text uppercase tracking-widest">Transfer Logs</h2>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-2 bg-background border border-border/40 rounded-xl text-xs font-bold outline-none focus:border-primary/50 transition-colors"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="divide-y divide-border/40 text-left">
                    {filteredTransfers.map((tr) => (
                        <div key={tr.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-alt/30 transition-colors group">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-2xl bg-background border border-border/10 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group-hover:border-primary/20 transition-all">
                                    <Package className="w-5 h-5 text-text-secondary" />
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-black text-text uppercase">{tr.id}</p>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${tr.status === 'Received' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-violet-500/10 text-violet-500 animate-pulse'
                                            }`}>
                                            {tr.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-text truncate group-hover:text-primary transition-colors">{tr.item} — <span className="text-text-secondary">{tr.qty} Units</span></p>
                                </div>
                            </div>

                            <div className="flex flex-1 items-center gap-4 md:justify-center">
                                <div className="text-right flex-1 md:flex-none">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">Origin</p>
                                    <p className="text-xs font-bold text-text truncate max-w-[120px]">{tr.from}</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-background border border-border/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-left flex-1 md:flex-none">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">Destination</p>
                                    <p className="text-xs font-bold text-text truncate max-w-[120px]">{tr.to}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 md:w-48">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-text">{tr.date.split(',')[0]}</p>
                                    <p className="text-[10px] text-text-muted italic">{tr.date.split(',')[1] || 'Yesterday'}</p>
                                </div>
                                <button className="p-2 hover:bg-background rounded-lg text-text-muted hover:text-text transition-all">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Transfer Modal */}
            <AnimatePresence>
                {isTransferModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTransferModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-surface w-full max-w-xl rounded-[32px] border border-border/40 shadow-2xl overflow-hidden relative"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                                            <ArrowLeftRight className="w-6 h-6 text-violet-500" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-xl font-black text-text uppercase tracking-tight">Move Inventory</h2>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-0.5">Stock Relocation</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsTransferModalOpen(false)}
                                        className="w-10 h-10 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form className="space-y-6 text-left" onSubmit={handleTransfer}>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Select Product</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                            <input required type="text" placeholder="Search product to transfer..." className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">From (Origin)</label>
                                            <select required className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                                <option>Main Storage</option>
                                                <option>Outlet 1 - Styling Hub</option>
                                                <option>Outlet 2 - Express</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">To (Destination)</label>
                                            <select required className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                                <option>Outlet 1 - Styling Hub</option>
                                                <option>Outlet 2 - Express</option>
                                                <option>Main Storage</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Quantity</label>
                                            <input required type="number" placeholder="0" className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Transfer Reason</label>
                                            <select className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                                <option>Low Stock Replenishment</option>
                                                <option>Product Launch</option>
                                                <option>Stock Balancing</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-violet-500/5 rounded-2xl border border-violet-500/10 flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-violet-500" />
                                        <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Transfer logs are immutable. Please verify destination details before submitting.</p>
                                    </div>

                                    <button type="submit" className="w-full py-4.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:translate-y-[-2px] active:translate-y-[0px] transition-all mt-4">
                                        Initiate Transfer
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
