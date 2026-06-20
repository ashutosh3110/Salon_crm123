import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = {
    completed: { bg: 'bg-[#E6F8EF] dark:bg-emerald-500/10', text: 'text-[#059669] dark:text-emerald-400' },
    'in-progress': { bg: 'bg-[#FFF0E6] dark:bg-orange-500/10', text: 'text-[#EA580C] dark:text-orange-400' },
    upcoming: { bg: 'bg-[#EBF4FF] dark:bg-blue-500/10', text: 'text-[#3B82F6] dark:text-blue-400' },
    confirmed: { bg: 'bg-[#EBF4FF] dark:bg-blue-500/10', text: 'text-[#3B82F6] dark:text-blue-400' },
    cancelled: { bg: 'bg-[#FEF2F2] dark:bg-red-500/10', text: 'text-[#EF4444] dark:text-red-400' },
    pending: { bg: 'bg-[#EBF4FF] dark:bg-blue-500/10', text: 'text-[#3B82F6] dark:text-blue-400' },
    arrived: { bg: 'bg-[#E6F8EF] dark:bg-emerald-500/10', text: 'text-[#059669] dark:text-emerald-400' },
    'no-show': { bg: 'bg-[#FEF2F2] dark:bg-red-500/10', text: 'text-[#EF4444] dark:text-red-400' }
};

function getStatusStyle(status) {
    return statusColors[status] || statusColors.upcoming;
}

function initials(name) {
    if (!name) return 'WC';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

export default function StylistAppointmentsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('All');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Helper to format date in local YYYY-MM-DD format
    const getLocalDateString = (dateInput) => {
        if (!dateInput) return '';
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));

    const tabs = ['All', 'Upcoming', 'In Progress', 'Completed'];

    const fetchAppointments = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        try {
            const res = await api.get('/bookings');
            if (res.data && res.data.success) {
                // Filter appointments where logged-in stylist is in staffId list
                const myBookings = res.data.data.filter(booking => {
                    const getStaffId = (s) => {
                        if (typeof s === 'object' && s !== null) {
                            return s._id || s.id;
                        }
                        return s;
                    };
                    const myId = user?.id || user?._id;
                    if (!myId) return false;

                    if (Array.isArray(booking.staffId)) {
                        return booking.staffId.some(s => String(getStaffId(s)) === String(myId));
                    } else if (booking.staffId) {
                        return String(getStaffId(booking.staffId)) === String(myId);
                    }
                    return false;
                });
                setAppointments(myBookings);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user, fetchAppointments]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await api.patch(`/bookings/${id}/status`, { status: newStatus });
            if (res.data && res.data.success) {
                toast.success(`Booking marked as ${newStatus}`);
                setAppointments(prev => prev.map(app => app._id === id ? { ...app, status: newStatus } : app));
            }
        } catch (err) {
            console.error('Failed to update booking status:', err);
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    // Filter logic
    const filteredAppointments = appointments.filter(app => {
        // Date check
        const appDateStr = getLocalDateString(app.appointmentDate);
        if (appDateStr !== selectedDate) return false;

        const status = (app.status || '').toLowerCase();
        if (activeTab === 'All') return true;
        if (activeTab === 'Upcoming' && (status === 'upcoming' || status === 'confirmed' || status === 'pending' || status === 'arrived')) return true;
        if (activeTab === 'In Progress' && status === 'in-progress') return true;
        if (activeTab === 'Completed' && status === 'completed') return true;
        return false;
    });

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-sm">
            
            {/* Header / Title area */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
                <h1 className="text-[18px] lg:text-[22px] font-bold text-slate-900 dark:text-white">Appointments</h1>
                <button 
                    onClick={() => fetchAppointments(true)} 
                    disabled={loading || refreshing}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                    {refreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 pt-2 pb-5 overflow-x-auto no-scrollbar">
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

            {/* Date Header / Date Picker */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 w-full">
                    <Calendar className="w-5 h-5 text-slate-500 shrink-0" strokeWidth={2} />
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-[14px] font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer w-full"
                    />
                </div>
            </div>

            {/* Appointments List */}
            <div className="px-5 pb-8 flex-1 overflow-y-auto">
                <div className="bg-white dark:bg-slate-800 rounded-[20px] p-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] border border-[#F3F4F6] dark:border-slate-700/50">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
                            <span className="text-[13px] font-medium">Loading appointments...</span>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-[13px] font-medium">
                            No appointments found for this filter.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAppointments.map((app) => {
                                const statusStyle = getStatusStyle(app.status);
                                const clientName = app.client?.name || 'Walk-in Client';
                                const clientInitial = initials(clientName);
                                const serviceName = app.service?.name || 'Custom Service';
                                
                                // Format time string if saved differently
                                const appTime = app.time || (app.appointmentDate ? new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

                                return (
                                    <div key={app._id} className="flex items-start justify-between py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0 gap-3 group">
                                        <div className="text-[11px] font-bold w-[65px] pt-1 text-[#7C3AED] shrink-0">{appTime}</div>
                                        <div 
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-[#F3E8FF] text-[#7C3AED]"
                                        >
                                            {clientInitial}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-0.5 truncate">{serviceName}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate">{clientName}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[6px] ${statusStyle.bg} ${statusStyle.text}`}>
                                                {app.status === 'in-progress' ? 'In Progress' : (app.status || 'pending').charAt(0).toUpperCase() + (app.status || 'pending').slice(1)}
                                            </span>
                                            
                                            {/* Action buttons */}
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {(app.status === 'pending' || app.status === 'confirmed' || app.status === 'arrived' || app.status === 'upcoming') && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(app._id, 'in-progress')}
                                                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white hover:bg-amber-600 transition"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                {app.status === 'in-progress' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(app._id, 'completed')}
                                                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                {app.status !== 'completed' && app.status !== 'cancelled' && app.status !== 'no-show' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(app._id, 'cancelled')}
                                                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white hover:bg-rose-600 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
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
