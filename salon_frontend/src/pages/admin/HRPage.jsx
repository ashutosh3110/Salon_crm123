import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    CalendarCheck,
    Lock,
    DollarSign,
    TrendingUp,
    Plus,
    UserPlus,
    Clock,
    Calculator,
    BarChart3
} from 'lucide-react';

// Sub-components (to be created)
import StaffManager from '../../components/admin/hr/StaffManager';
import AttendanceTracker from '../../components/admin/hr/AttendanceTracker';
import ShiftManager from '../../components/admin/hr/ShiftManager';
import PayrollManager from '../../components/admin/hr/PayrollManager';
import PerformanceAnalytics from '../../components/admin/hr/PerformanceAnalytics';

const HR_TABS = [
    { id: 'staff', label: 'Staff Master', icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'shifts', label: 'Shifts', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

import Skeleton from '../../components/common/Skeleton';

export default function HRPage({ tab = 'staff' }) {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, [tab]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Skeleton variant="card" />
                        <Skeleton variant="card" />
                        <Skeleton variant="card" />
                        <Skeleton variant="card" />
                    </div>
                    <div className="bg-surface p-8 rounded-none border border-border shadow-sm space-y-6">
                        <Skeleton className="h-12 w-full rounded-none" />
                        <Skeleton className="h-80 w-full rounded-none" />
                    </div>
                </div>
            );
        }

        switch (tab) {
            case 'staff': return <StaffManager />;
            case 'attendance': return <AttendanceTracker />;
            case 'shifts': return <ShiftManager />;
            case 'payroll': return <PayrollManager />;
            case 'performance': return <PerformanceAnalytics />;
            default: return <StaffManager />;
        }
    };

    const activeTab = HR_TABS.find(t => t.id === tab) || HR_TABS[0];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-none ${activeTab.bg.replace('bg-', 'bg-').replace('/10', '/5')} border border-primary/10 shadow-sm transition-transform hover:scale-105`}>
                        <activeTab.icon className={`w-6 h-6 ${activeTab.color}`} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-text uppercase tracking-tight">{activeTab.label}</h1>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Human Capital Management Matrix</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-surface-alt p-1 rounded-none border border-border">
                    {HR_TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => navigate(`/admin/hr/${t.id}`)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-none text-[10px] font-extrabold uppercase tracking-widest transition-all ${tab === t.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-100'
                                : 'text-text-muted hover:text-text hover:bg-surface'
                                }`}
                        >
                            <t.icon className={`w-3.5 h-3.5 ${tab === t.id ? 'text-white' : 'text-text-muted'}`} />
                            <span className="hidden sm:inline">{t.label} Protocol</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[600px]">
                {renderContent()}
            </div>
        </div>
    );
}
