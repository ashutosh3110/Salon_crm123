import React, { useState } from 'react';
import { Calendar, ChevronRight, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const statusColors = {
    completed: { bg: 'bg-[#E6F8EF] dark:bg-emerald-500/10', text: 'text-[#059669] dark:text-emerald-400' },
    'in-progress': { bg: 'bg-[#FFF0E6] dark:bg-orange-500/10', text: 'text-[#EA580C] dark:text-orange-400' },
    upcoming: { bg: 'bg-[#EBF4FF] dark:bg-blue-500/10', text: 'text-[#3B82F6] dark:text-blue-400' },
    cancelled: { bg: 'bg-[#FEF2F2] dark:bg-red-500/10', text: 'text-[#EF4444] dark:text-red-400' },
    pending: { bg: 'bg-[#EBF4FF] dark:bg-blue-500/10', text: 'text-[#3B82F6] dark:text-blue-400' },
};

function getStatusStyle(status) {
    return statusColors[status] || statusColors.upcoming;
}

function initials(name) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

export default function StylistAppointmentsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('All');

    const tabs = ['All', 'Upcoming', 'In Progress', 'Completed'];

    // Mock data for the appointments
    const mockAppointments = [
        { id: 1, time: '10:00 AM', initial: 'PN', name: 'Priya Sharma', service: 'Hair Cut', status: 'completed', color: 'purple' },
        { id: 2, time: '11:30 AM', initial: 'NP', name: 'Neha Patel', service: 'Hair Color', status: 'in-progress', color: 'green' },
        { id: 3, time: '02:00 PM', initial: 'AK', name: 'Amit Kumar', service: 'Facial', status: 'upcoming', color: 'blue' },
        { id: 4, time: '04:00 PM', initial: 'RS', name: 'Ritika Singh', service: 'Hair Spa', status: 'upcoming', color: 'orange' },
        { id: 5, time: '06:00 PM', initial: 'SJ', name: 'Sneha Joshi', service: 'Hair Treatment', status: 'upcoming', color: 'purple' }
    ];

    // Filter logic
    const filteredAppointments = mockAppointments.filter(app => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Upcoming' && app.status === 'upcoming') return true;
        if (activeTab === 'In Progress' && app.status === 'in-progress') return true;
        if (activeTab === 'Completed' && app.status === 'completed') return true;
        return false;
    });

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-sm">
            
            {/* Header / Title area - Matches Screenshot */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
                <div className="w-6" /> {/* Placeholder for absolute centering */}
                <h1 className="text-[18px] font-bold text-slate-900 dark:text-white">Appointments</h1>
                <button className="p-2 -mr-2 text-slate-600 dark:text-slate-300">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 pb-5 overflow-x-scroll no-scrollbar" style={{ border: 'none', boxShadow: 'none', backgroundColor: 'transparent' }}>
                <div className="flex items-center gap-2 min-w-max">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                                activeTab === tab
                                    ? 'bg-[#7C3AED] text-white shadow-md'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Header */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-500" strokeWidth={2} />
                    <span className="text-[14px] font-bold text-slate-900 dark:text-white">18 June 2026, Thursday</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>

            {/* Appointments List - Matching Dashboard exactly */}
            <div className="px-5 pb-8">
                <div className="bg-white dark:bg-slate-800 rounded-[20px] p-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] border border-[#F3F4F6] dark:border-slate-700/50">
                    {filteredAppointments.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-[13px] font-medium">
                            No appointments found for this filter.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAppointments.map((mock) => {
                                const statusStyle = getStatusStyle(mock.status);
                                
                                const colorMap = {
                                    purple: { bg: '#F3E8FF', text: '#7C3AED' },
                                    green: { bg: '#DCFCE7', text: '#059669' },
                                    blue: { bg: '#DBEAFE', text: '#2563EB' },
                                    orange: { bg: '#FFF7ED', text: '#DC2626' },
                                };
                                const cStyle = colorMap[mock.color] || colorMap.purple;

                                return (
                                    <div key={mock.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0 gap-3 group">
                                        <div className="text-[11px] font-bold w-[60px]" style={{ color: '#7C3AED' }}>{mock.time}</div>
                                        <div 
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                            style={{ backgroundColor: cStyle.bg, color: cStyle.text }}
                                        >
                                            {mock.initial}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-0.5 truncate">{mock.service}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate">{mock.name}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[6px] ${statusStyle.bg} ${statusStyle.text}`}>
                                                {mock.status === 'in-progress' ? 'In Progress' : mock.status.charAt(0).toUpperCase() + mock.status.slice(1)}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-800 dark:text-slate-400" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Added extra padding at the bottom so it doesn't get covered by the mobile navbar */}
            <div className="h-20 lg:h-0 flex-shrink-0" />
        </div>
    );
}
