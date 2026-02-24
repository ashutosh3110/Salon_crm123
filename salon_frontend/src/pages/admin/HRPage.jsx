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
                    <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
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
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${activeTab.bg} border border-white/50 shadow-sm`}>
                        <activeTab.icon className={`w-6 h-6 ${activeTab.color}`} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text tracking-tight capitalize">{activeTab.label}</h1>
                        <p className="text-sm text-text-muted">Human Resources Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-surface-alt/50 p-1 rounded-xl border border-border/40">
                    {HR_TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => navigate(`/admin/hr/${t.id}`)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id
                                ? 'bg-white text-primary shadow-sm ring-1 ring-black/5 scale-105'
                                : 'text-text-muted hover:text-text hover:bg-white/50'
                                }`}
                        >
                            <t.icon className={`w-3.5 h-3.5 ${tab === t.id ? 'text-primary' : 'text-text-muted'}`} />
                            <span className="hidden sm:inline">{t.label}</span>
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
