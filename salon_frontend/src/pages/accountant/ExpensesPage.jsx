import { useState } from 'react';
import { DollarSign, Plus, Search, Filter, Download, Calendar, ArrowUpRight, ArrowDownRight, MoreHorizontal, PieChart, ShoppingBag, Receipt, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../contexts/FinanceContext';

export default function ExpensesPage() {
    const { expenses, addExpense } = useFinance();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All Categories');

    const [formState, setFormState] = useState({
        category: 'Inventory',
        amount: '',
        vendor: '',
        date: new Date().toISOString().split('T')[0],
        desc: ''
    });

    const categories = [
        { name: 'Inventory', amount: `₹${expenses.filter(e => e.category === 'Inventory').reduce((a, b) => a + (typeof b.amount === 'number' ? b.amount : 0), 0).toLocaleString()}`, color: 'bg-primary' },
        { name: 'Utilities', amount: `₹${expenses.filter(e => e.category === 'Utilities').reduce((a, b) => a + (typeof b.amount === 'number' ? b.amount : 0), 0).toLocaleString()}`, color: 'bg-amber-500' },
        { name: 'Rent', amount: `₹${expenses.filter(e => e.category === 'Rent').reduce((a, b) => a + (typeof b.amount === 'number' ? b.amount : 0), 0).toLocaleString()}`, color: 'bg-indigo-500' },
        { name: 'Staff Welfare', amount: `₹${expenses.filter(e => e.category === 'Staff Welfare').reduce((a, b) => a + (typeof b.amount === 'number' ? b.amount : 0), 0).toLocaleString()}`, color: 'bg-emerald-500' },
    ];

    const filteredExpenses = expenses.filter(exp => {
        const vendor = exp.vendor || '';
        const category = exp.category || '';
        const desc = exp.desc || '';
        const matchesSearch = vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'All Categories' || exp.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addExpense({
            ...formState,
            amount: parseFloat(formState.amount),
            status: 'Paid'
        });
        setIsAddModalOpen(false);
        setFormState({ category: 'Inventory', amount: '', vendor: '', date: new Date().toISOString().split('T')[0], desc: '' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Expense Management</h1>
                    <p className="text-sm text-text-muted font-medium">Track operational costs and operational spending</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4" /> New Expense
                    </button>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        key={cat.name}
                        className="p-5 bg-surface rounded-none border border-border hover:border-primary/20 transition-all flex items-center gap-4"
                    >
                        <div className={`w-12 h-12 rounded-none ${cat.color} bg-opacity-10 flex items-center justify-center shrink-0`}>
                            <PieChart className={`w-5 h-5 ${cat.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">{cat.name}</p>
                            <p className="text-lg font-black text-text tracking-tight">{cat.amount}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Table & Filters */}
            <div className="bg-surface rounded-none border border-border overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by vendor or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/40 rounded-none text-sm outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2.5 bg-surface border border-border/40 rounded-none text-[10px] font-extrabold uppercase tracking-widest text-text-secondary hover:bg-surface-alt transition-colors outline-none cursor-pointer"
                        >
                            <option value="All Categories">All Categories</option>
                            <option value="Inventory">Inventory</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Rent">Rent</option>
                            <option value="Staff Welfare">Staff Welfare</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Vendor / Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left">
                            {filteredExpenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4 text-xs font-bold text-text-secondary">{exp.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest border border-border/10 ${exp.category === 'Inventory' ? 'bg-primary/5 text-primary' : 'bg-background text-text-muted'}`}>
                                            {exp.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{exp.vendor}</p>
                                        <p className="text-[10px] text-text-muted font-medium">{exp.desc}</p>
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-tighter ${exp.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {exp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-text">₹{exp.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-background rounded-none text-text-muted hover:text-text transition-all">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">
                                        No expenses found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-surface w-full max-w-xl rounded-none border border-border shadow-2xl overflow-hidden">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Record Expense</h2>
                                    <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-none bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text transition-all">×</button>
                                </div>
                                <form className="space-y-6 text-left" onSubmit={handleSubmit}>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Category</label>
                                            <select
                                                value={formState.category}
                                                onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                                                className="w-full px-5 py-3.5 rounded-none bg-background border border-border text-sm font-bold focus:border-primary outline-none"
                                            >
                                                <option>Inventory</option>
                                                <option>Rent</option>
                                                <option>Utilities</option>
                                                <option>Staff Welfare</option>
                                                <option>Marketing</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Amount</label>
                                            <input
                                                required
                                                type="number"
                                                placeholder="₹ 0.00"
                                                value={formState.amount}
                                                onChange={(e) => setFormState({ ...formState, amount: e.target.value })}
                                                className="w-full px-5 py-3.5 rounded-none bg-background border border-border text-sm font-bold focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Vendor</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Who did you pay?"
                                                value={formState.vendor}
                                                onChange={(e) => setFormState({ ...formState, vendor: e.target.value })}
                                                className="w-full px-5 py-3.5 rounded-none bg-background border border-border text-sm font-bold focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Date</label>
                                            <input
                                                required
                                                type="date"
                                                value={formState.date}
                                                onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                                                className="w-full px-5 py-3.5 rounded-none bg-background border border-border text-sm font-bold focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Description</label>
                                        <textarea
                                            placeholder="Purpose of this expense..."
                                            value={formState.desc}
                                            onChange={(e) => setFormState({ ...formState, desc: e.target.value })}
                                            className="w-full px-5 py-3.5 rounded-none bg-background border border-border text-sm font-bold focus:border-primary outline-none h-24 resize-none"
                                        />
                                    </div>
                                    <button type="submit" className="w-full py-4.5 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/25">Save Transaction</button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
