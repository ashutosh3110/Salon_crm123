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
    Calendar
} from 'lucide-react';

// Sub-components (to be created)
import StaffManager from '../../components/admin/hr/StaffManager';
import AttendanceTracker from '../../components/admin/hr/AttendanceTracker';
import ShiftManager from '../../components/admin/hr/ShiftManager';
import PayrollManager from '../../components/admin/hr/PayrollManager';
import PerformanceAnalytics from '../../components/admin/hr/PerformanceAnalytics';
import LeaveApprovalManager from '../../components/admin/hr/LeaveApprovalManager';

const HR_TABS = [
    { id: 'staff', label: 'Staff Master', icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'shifts', label: 'Shifts', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'leaves', label: 'Leave Requests', icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
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
            case 'leaves': return <LeaveApprovalManager />;
            default: return <StaffManager />;
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-none ${activeTab.bg.replace('bg-', 'bg-').replace('/10', '/5')} border border-primary/10 shadow-sm transition-transform hover:scale-105`}>
                        <activeTab.icon className={`w-6 h-6 ${activeTab.color}`} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-text uppercase tracking-tight">{activeTab.label}</h1>
                        <p className="text-[10px] font-black text-text-muted tracking-wide opacity-80 max-w-xl">{tabHint}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-surface p-1.5 rounded-none border border-border shadow-2xl shadow-primary/5 backdrop-blur-xl overflow-x-auto no-scrollbar max-w-full">
                    {HR_TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => navigate(`/admin/hr/${t.id}`)}
                            className={`flex items-center gap-3 px-8 py-3 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative group/tab whitespace-nowrap ${tab === t.id
                                ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-100'
                                : 'text-text-muted hover:text-text hover:bg-surface-alt'
                                }`}
                        >
                            <t.icon className={`w-4 h-4 transition-transform group-hover/tab:scale-110 ${tab === t.id ? 'text-primary-foreground' : 'text-primary/60'}`} />
                            <span className="inline">{t.label}</span>
                            {tab === t.id && (
                                <>
                                    <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-white/40" />
                                    <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-white/40" />
                                </>
                            )}
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
