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
    BarChart3,
    Calendar,
    CheckCircle2
} from 'lucide-react';

// Sub-components (to be created)
import StaffManager from '../../components/admin/hr/StaffManager';
import AttendanceTracker from '../../components/admin/hr/AttendanceTracker';
import PayrollManager from '../../components/admin/hr/PayrollManager';
import PerformanceAnalytics from '../../components/admin/hr/PerformanceAnalytics';

const HR_TABS = [
    { id: 'attendance', label: 'Staff Attendance', icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'payroll', label: 'Payroll Management', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'performance', label: 'Performance Tracking', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

import Skeleton from '../../components/common/Skeleton';

export default function HRPage({ tab = 'attendance' }) {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

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
            case 'attendance': return <AttendanceTracker />;
            case 'payroll': return <PayrollManager />;
            case 'performance': return <PerformanceAnalytics />;
            default: return <AttendanceTracker />;
        }
    };

    const activeTab = HR_TABS.find(t => t.id === tab) || HR_TABS[0];

    const tabHint =
        tab === 'shifts'
            ? 'Choose a shift name, times and salon — then assign your team.'
            : 'Staff, attendance, shifts and payroll in one place.';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-none ${activeTab.bg.replace('bg-', 'bg-').replace('/10', '/5')} border border-primary/10 shadow-sm transition-transform hover:scale-105`}>
                    <activeTab.icon className={`w-6 h-6 ${activeTab.color}`} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">{activeTab.label}</h1>
                    <p className="text-[10px] font-black text-text-muted tracking-wide opacity-80 max-w-xl">{tabHint}</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[600px]">
                {renderContent()}
            </div>
        </div>
    );
}
