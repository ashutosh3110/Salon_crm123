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
import AdvanceSalaryManager from '../../components/admin/hr/AdvanceSalaryManager';

const HR_TABS = [
    { id: 'attendance', label: 'Staff Attendance', icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'payroll', label: 'Payroll Management', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'advance-salary', label: 'Advance Salary', icon: DollarSign, color: 'text-violet-500', bg: 'bg-violet-500/10' },
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
                    <div className="bg-surface p-8 rounded-xl border border-border shadow-sm space-y-6">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-80 w-full rounded-xl" />
                    </div>
                </div>
            );
        }

        switch (tab) {
            case 'attendance': return <AttendanceTracker />;
            case 'payroll': return <PayrollManager />;
            case 'advance-salary': return <AdvanceSalaryManager />;
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-2">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                        <span className="opacity-70">Operations</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        <span className="text-[#B4912B]">Human Resources</span>
                    </div>
                    <h1 className="text-2xl font-black text-[#0B0A1A] tracking-tight uppercase">{activeTab.label}</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">{tabHint}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        REHAN HAIR - INDORE
                        <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[600px]">
                {renderContent()}
            </div>
        </div>
    );
}
