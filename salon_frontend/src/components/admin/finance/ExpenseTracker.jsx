import React, { useState } from 'react';
import { DollarSign, Plus, History, Filter, Search, Calendar, Store, CreditCard, Wallet, Tag, FileText, Send, Download } from 'lucide-react';

const MOCK_EXPENSES = [
    { id: '1', date: '2024-03-22', category: 'Rent', amount: 85000, mode: 'Bank', outlet: 'Andheri West', notes: 'Monthly rent for Andheri branch' },
    { id: '2', date: '2024-03-21', category: 'Electricity', amount: 12400, mode: 'Bank', outlet: 'Bandra', notes: 'Jan-Feb bill' },
    { id: '3', date: '2024-03-21', category: 'Tea & Snacks', amount: 180, mode: 'Cash', outlet: 'Andheri West', notes: 'Daily staff tea' },
    { id: '4', date: '2024-03-20', category: 'Maintenance', amount: 4500, mode: 'Cash', outlet: 'Bandra', notes: 'AC Service' },
];

export default function ExpenseTracker() {
    const [view, setView] = useState('list'); // 'list' or 'form'

    return (
        <div className="flex flex-col h-full slide-right overflow-hidden">
            {/* Header / Context Switcher */}
            <div className="px-8 py-6 border-b border-border bg-surface/30 flex justify-between items-center">
                <div className="flex gap-4 p-1 bg-surface-alt rounded-xl border border-border">
                    <button
                        onClick={() => setView('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        <History className="w-3.5 h-3.5" />
                        Expense History
                    </button>
                    <button
                        onClick={() => setView('form')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'form' ? 'bg-white text-rose-600 shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Record New Expense
                    </button>
                </div>
                {view === 'list' && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-[10px] font-bold text-text-muted uppercase tracking-wider hover:bg-surface transition-all shadow-sm">
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                {view === 'list' ? <ExpenseList /> : <ExpenseForm onCancel={() => setView('list')} />}
            </div>
        </div>
    );
}

function ExpenseList() {
    return (
        <div className="p-0 animate-fadeIn overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="bg-surface/50 border-b border-border">
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Date</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Category & Note</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Outlet</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Amount</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Paid Via</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {MOCK_EXPENSES.map((exp) => (
                        <tr key={exp.id} className="hover:bg-rose-50/20 transition-colors group cursor-default">
                            <td className="px-8 py-5">
                                <span className="text-xs font-semibold text-text-secondary">{new Date(exp.date).toLocaleDateString()}</span>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex flex-col">
                                    <span className="font-bold text-text text-sm group-hover:text-rose-600 transition-colors">{exp.category}</span>
                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">{exp.notes}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <span className="px-2.5 py-1 bg-surface border border-border rounded-lg text-[9px] font-bold text-text-secondary uppercase tracking-widest">
                                    {exp.outlet}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <span className="text-sm font-bold text-rose-600">₹{exp.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                    {exp.mode === 'Cash' ? <Wallet className="w-3.5 h-3.5 text-orange-500" /> : <CreditCard className="w-3.5 h-3.5 text-blue-500" />}
                                    <span className="text-xs font-semibold text-text-secondary">{exp.mode}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <button className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all opacity-0 group-hover:opacity-100">
                                    <FileText className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ExpenseForm({ onCancel }) {
    return (
        <div className="p-10 max-w-2xl mx-auto animate-slideUp">
            <div className="space-y-8 bg-surface/20 p-8 rounded-3xl border border-border/50">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-text tracking-tight flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-rose-600" />
                        Record Operational Expense
                    </h3>
                    <p className="text-sm text-text-secondary font-medium">Log non-supplier related daily expenses for accurate profit tracking.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Expense Category</label>
                        <div className="relative group">
                            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-rose-500 transition-colors" />
                            <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all uppercase tracking-wider">
                                <option>Select Category</option>
                                <option>Rent</option>
                                <option>Electricity</option>
                                <option>Staff Welfare / Tea</option>
                                <option>Repairs & Maintenance</option>
                                <option>Marketing</option>
                                <option>Cleaning Supplies</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Expense Amount</label>
                        <div className="relative group">
                            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-rose-500 transition-colors" />
                            <input
                                type="number"
                                placeholder="₹ 0.00"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Payment Mode</label>
                        <div className="flex gap-4 pt-1">
                            {['Cash', 'Bank / Online'].map((mode) => (
                                <button key={mode} className="flex-1 flex flex-col items-center gap-2 p-3 bg-white border border-border rounded-xl hover:border-rose-500 hover:bg-rose-50/30 transition-all group/mode">
                                    {mode === 'Cash' ? <Wallet className="w-5 h-5 text-text-muted group-hover/mode:text-rose-500" /> : <CreditCard className="w-5 h-5 text-text-muted group-hover/mode:text-rose-500" />}
                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{mode}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Outlet & Date</label>
                        <div className="space-y-3">
                            <div className="relative">
                                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none transition-all uppercase tracking-wider">
                                    <option>Select Outlet</option>
                                    <option>Andheri West</option>
                                    <option>Bandra</option>
                                </select>
                            </div>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Remarks / Notes</label>
                        <textarea
                            placeholder="Add payment context or bill details..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3.5 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-white transition-all"
                    >
                        Discard
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-rose-600/30 transition-all scale-active">
                        <Send className="w-4 h-4" />
                        Save & Deduct
                    </button>
                </div>
            </div>
        </div>
    );
}
