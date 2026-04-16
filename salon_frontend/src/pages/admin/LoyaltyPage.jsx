import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tab Components
import LoyaltyRulesTab from '../../components/admin/loyalty/LoyaltyRulesTab';
import MembershipPlansTab from '../../components/admin/loyalty/MembershipPlansTab';
import MembersListTab from '../../components/admin/loyalty/MembersListTab';
import LoyaltyTransactionsTab from '../../components/admin/loyalty/LoyaltyTransactionsTab';
import ReferralSettingsTab from '../../components/admin/loyalty/ReferralSettingsTab';

const TABS = [
    { id: 'plans', label: 'Membership Plans', icon: CreditCard, description: 'Manage plans and benefits' },
    { id: 'members', label: 'Members List', icon: Users, description: 'Active members' },
    { id: 'transactions', label: 'Points History', icon: ArrowDownUp, description: 'Transaction logs' }
];

export default function LoyaltyPage() {
    const navigate = useNavigate();
    const { tabId = 'plans' } = useParams();
    const [activeTab, setActiveTab] = useState(tabId);

    useEffect(() => {
        setActiveTab(tabId);
    }, [tabId]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'plans': return <MembershipPlansTab />;
            case 'members': return <MembersListTab />;
            case 'transactions': return <LoyaltyTransactionsTab />;
            default: return <MembershipPlansTab />;
        }
    };

    const handleTabChange = (id) => {
        navigate(`/admin/loyalty/${id}`);
    };

    return (
        <div className="min-h-screen space-y-8 pb-12 italic">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Loyalty <span className="text-primary italic">&</span> Memberships
                    </h1>
                    <p className="text-sm font-bold text-text-muted mt-2 tracking-wide uppercase opacity-70">
                        Manage your loyalty program / <span className="text-foreground italic font-black">{TABS.find(t => t.id === activeTab)?.label}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end px-4 border-r border-border/40">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Status</span>
                        <span className="text-xs font-black text-emerald-500 uppercase tracking-tighter">System Active</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-surface-alt/50 border border-border/40 backdrop-blur-xl rounded-2xl">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-3 px-6 py-4 transition-all duration-300 relative group whitespace-nowrap rounded-xl ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 z-10'
                                : 'text-text-muted hover:bg-surface hover:text-primary'
                                }`}
                        >
                            <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-white' : 'text-primary'}`} />
                            <span className={`block text-[10px] font-black uppercase tracking-widest leading-none transition-colors duration-300 ${isActive ? 'text-white' : 'group-hover:text-primary'}`}>
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
                className="mt-8"
            >
                {renderTabContent()}
            </motion.div>
        </div>
    );
}
