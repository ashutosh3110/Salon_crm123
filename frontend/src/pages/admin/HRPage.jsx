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
    CheckCircle2,
    ChevronRight,
    Briefcase
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
        tab === 'attendance'
            ? 'Mark daily attendance, view monthly summaries, and export reports.'
            : tab === 'payroll'
                ? 'Manage salary structures, generate payslips, and track payments.'
                : tab === 'performance'
                    ? 'Analyze staff productivity, revenue contribution, and service metrics.'
                    : 'Staff, attendance, shifts and payroll in one place.';

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header section - matching ServicesPage/StaffPage pattern */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">
                        <span className="opacity-60">Operations</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        <span className="text-primary">Human Resources</span>
                    </div>
                    <h1 className="text-3xl font-black text-text tracking-tighter uppercase leading-none">{activeTab.label}</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60">{tabHint}</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[600px]">
                {renderContent()}
            </div>
        </div>
    );
}
