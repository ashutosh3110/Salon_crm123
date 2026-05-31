import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Gift,
    CreditCard,
    Users,
    ArrowDownUp,
    Star,
    LayoutDashboard,
    ChevronRight,
    Search,
    Filter,
    Plus,
    Gem,
    Crown,
    Bell,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tab Components
import LoyaltyRulesTab from '../../components/admin/loyalty/LoyaltyRulesTab';
import MembershipPlansTab from '../../components/admin/loyalty/MembershipPlansTab';
import MembersListTab from '../../components/admin/loyalty/MembersListTab';
import LoyaltyTransactionsTab from '../../components/admin/loyalty/LoyaltyTransactionsTab';
import ReferralSettingsTab from '../../components/admin/loyalty/ReferralSettingsTab';
import MembershipRemindersTab from '../../components/admin/loyalty/MembershipRemindersTab';

const TABS = [
    { id: 'plans', label: 'Membership Plans', icon: CreditCard, description: 'Manage subscription tiers' },
    { id: 'members', label: 'Active Members', icon: Users, description: 'Customer membership status' },
    { id: 'transactions', label: 'Transaction Log', icon: ArrowDownUp, description: 'Points ledger audit trail' },
    { id: 'reminders', label: 'Expiry Reminders', icon: Bell, description: 'Send expiry notifications' },
];

export default function LoyaltyMembershipPage({ tab: initialTab = 'plans' }) {
    const navigate = useNavigate();
    const activeTab = initialTab;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'plans': return <MembershipPlansTab />;
            case 'members': return <MembersListTab />;
            case 'transactions': return <LoyaltyTransactionsTab />;
            case 'reminders': return <MembershipRemindersTab />;
            default: return <MembershipPlansTab />;
        }
    };

    return (
        <div className="space-y-4 pb-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-base sm:text-lg font-black text-black tracking-tight uppercase leading-none">
                        LOYALTY & MEMBERSHIP
                    </h1>
                    <p className="text-[9px] font-black text-text-muted mt-1.5 uppercase tracking-[0.2em] opacity-60 leading-none">
                        PROTOCOL MANAGEMENT / <span className="text-text font-black">{TABS.find(t => t.id === activeTab)?.label}</span>
                    </p>
                </div>

                <div className="flex flex-col sm:items-end">
                    <span className="text-[8px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">STATUS</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter flex items-center gap-1.5">
                        SYSTEM ACTIVE <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                    </span>
                </div>
            </div>

            {/* Navigation Tabs - Horizontal Scrollable on Mobile */}
            <div className="flex overflow-x-auto no-scrollbar bg-white border border-slate-200 rounded-2xl shadow-sm w-fit overflow-hidden">
                {TABS.map((tab, idx) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(`/admin/loyalty/${tab.id}`)}
                            className={`flex items-center gap-1.5 px-4 py-2 transition-all duration-300 relative group whitespace-nowrap ${isActive
                                ? 'bg-[#cca839] text-white'
                                : 'text-slate-800 hover:bg-slate-50'
                                }`}
                        >
                            <Icon className={`w-3.5 h-3.5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-black'
                                }`} />
                            <span className={`block text-[9px] font-black uppercase tracking-widest transition-colors duration-300`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
            >
                {renderTabContent()}
            </motion.div>
        </div>
    );
}
