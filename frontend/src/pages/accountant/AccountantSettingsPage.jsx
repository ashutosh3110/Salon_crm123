import { useState } from 'react';
import { Settings, Shield, Bell, DollarSign, Calculator, Lock, Globe, FileText, ChevronRight, Save, Trash2, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccountantSettingsPage() {
    const [activeTab, setActiveTab] = useState('financial');

    const tabs = [
        { id: 'financial', label: 'Financial Setup', icon: Calculator },
        { id: 'taxation', label: 'Taxation Rules', icon: FileText },
        { id: 'security', label: 'Auth & Data', icon: Lock },
    ];

    return (
        <div className="space-y-6 text-left max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-text tracking-tight uppercase">Accountant Settings</h1>
                <p className="text-sm text-text-muted font-medium">Configure financial protocols and taxation parameters</p>
            </div>

            {/* Content Wrapper */}
            <div className="grid lg:grid-cols-4 gap-8 h-full min-h-[600px]">
                {/* Tabs Sidebar */}
                <div className="lg:col-span-1 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all group ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-text-secondary hover:bg-surface hover:text-text'}`}
                        >
                            <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : 'text-text-muted'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Settings Panel */}
                <div className="lg:col-span-3">
                    <div className="p-8 bg-surface rounded-[40px] border border-border/40 shadow-sm min-h-full">
                        {activeTab === 'financial' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-black text-text uppercase tracking-tight">Fiscal Year & Currency</h2>
                                    <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Base Accounting Parameters</p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Financial Year Starts</label>
                                        <select className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold outline-none focus:border-primary">
                                            <option>April 1st</option>
                                            <option>January 1st</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Base Currency</label>
                                        <select className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold outline-none focus:border-primary">
                                            <option>Indian Rupee (INR)</option>
                                            <option>US Dollar (USD)</option>
                                            <option>UAE Dirham (AED)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Expense Approval Limit</label>
                                        <input type="text" defaultValue="₹50,000" className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold outline-none focus:border-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Commission Model</label>
                                        <select className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold outline-none focus:border-primary">
                                            <option>Tiered Revenue (Scale)</option>
                                            <option>Fixed Percentage</option>
                                            <option>Points Based</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-6 bg-background rounded-3xl border border-border/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Sliders className="w-5 h-5 text-primary" />
                                            <h4 className="text-xs font-black text-text uppercase tracking-widest">EOD Auto-Reconciliation</h4>
                                        </div>
                                        <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-text-muted font-bold leading-relaxed italic">Automatically run reconciliation cycles at 11:59 PM daily following till closure.</p>
                                </div>

                                <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:translate-y-[-2px] transition-all">
                                    <Save className="w-4 h-4" /> Save Financial Config
                                </button>
                            </motion.div>
                        )}

                        {activeTab === 'taxation' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-black text-text uppercase tracking-tight">GST & VAT Parameters</h2>
                                    <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Compliance & Tax Rules</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: 'GST Number (Primary)', val: '27AABCU9603R1Z5', desc: 'Used for B2B supplier invoices' },
                                        { label: 'Standard Sales Tax', val: '18.0%', desc: 'Applied to all service invoices' },
                                        { label: 'Retail Product Tax', val: '12.0%', desc: 'Applied to retail product sales' },
                                    ].map((tax) => (
                                        <div key={tax.label} className="flex items-center justify-between p-5 bg-background border border-border/10 rounded-2xl hover:border-primary/20 transition-all group">
                                            <div>
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">{tax.label}</p>
                                                <p className="text-xs font-bold text-text-secondary">{tax.desc}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-black text-text tabular-nums">{tax.val}</span>
                                                <button className="text-[10px] font-black text-primary hover:underline italic">Edit</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="space-y-1 text-center py-12">
                                    <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                                        <Shield className="w-10 h-10 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-black text-text tracking-tight uppercase">Audit Logs & Access</h2>
                                    <p className="text-sm text-text-muted font-medium max-w-sm mx-auto">Manage who can view financial data and review the immutable mutation logs.</p>
                                    <button className="mt-8 px-6 py-3 bg-background border border-border/40 rounded-xl text-[10px] font-black text-text uppercase tracking-widest hover:bg-surface-alt transition-all">Configure 2FA for Deletion</button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
