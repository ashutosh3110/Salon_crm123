import { useState } from 'react';
import { Package, Tag, Truck, Building2, UserCog, ShieldCheck, ChevronRight, Plus, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InventorySettingsPage() {
    const [activeTab, setActiveTab] = useState('Categories');

    const tabs = [
        { name: 'Categories', icon: Tag, desc: 'Manage product groups' },
        { name: 'Suppliers', icon: Truck, desc: 'Manage vendors & partners' },
        { name: 'Locations', icon: Building2, desc: 'Storage & outlets' },
        { name: 'Alerts Setup', icon: UserCog, desc: 'Thresholds & notifications' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-text tracking-tight uppercase">Inventory Settings</h1>
                <p className="text-sm text-text-muted font-medium">Configure categories, suppliers, and stock parameters</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Fixed Tabs Sidebar */}
                <div className="md:w-64 space-y-2 shrink-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${activeTab === tab.name
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-surface text-text-secondary hover:bg-surface-alt border border-border/40'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.name ? 'text-white' : 'text-text-muted'}`} />
                            <div>
                                <p className="leading-none">{tab.name}</p>
                                <p className={`text-[9px] mt-1 font-medium ${activeTab === tab.name ? 'text-white/70' : 'text-text-muted'}`}>{tab.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Dynamic Content Panel */}
                <div className="flex-1 bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm flex flex-col text-left">
                    <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-surface/50">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">{activeTab} Details</h2>
                        <button className="flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                            <Plus className="w-3 h-3" /> New Entry
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'Categories' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                {[
                                    { name: 'Hair Colour', items: 124, status: 'Active' },
                                    { name: 'Shampoos', items: 45, status: 'Active' },
                                    { name: 'Styling Products', items: 89, status: 'Active' },
                                    { name: 'Consumables', items: 12, status: 'Restricted' },
                                ].map((cat) => (
                                    <div key={cat.name} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border/10 group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-muted transition-colors">
                                                <Tag className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text">{cat.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{cat.items} Products Linked</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${cat.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{cat.status}</span>
                                            <button className="p-2 hover:bg-surface rounded-lg text-text-muted transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'Suppliers' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <Truck className="w-5 h-5 text-primary" />
                                    <p className="text-xs font-bold text-text-secondary leading-tight">Supplier management panel is under development. You can currently add suppliers during the Purchase / Stock In process.</p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Locations' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                    <Building2 className="w-5 h-5 text-amber-500" />
                                    <p className="text-xs font-bold text-text-secondary leading-tight">Storage location parameters are synced with Super Admin business settings. Any changes must be approved by the platform administrator.</p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Alerts Setup' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-left">
                                <div className="p-5 bg-background border border-border/10 rounded-3xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-text">Global Low Stock Threshold</p>
                                            <p className="text-xs text-text-muted font-medium mt-0.5">Average re-order point across all categories</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-border/40 font-black text-sm text-text-secondary">
                                            10 <span className="text-[10px] text-text-muted">Units</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-text">Email Notifications</p>
                                            <p className="text-xs text-text-muted font-medium mt-0.5">Alerts when critical levels are reached</p>
                                        </div>
                                        <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center justify-end px-1 cursor-pointer">
                                            <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Customize Per Category →</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
