import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, ChevronRight, RefreshCw, Loader2, Menu, Filter, X, Play, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = {
    completed: { bg: 'bg-[#E6F8EF] dark:bg-emerald-500/10', text: 'text-[#059669] dark:text-emerald-400' },
    'in-progress': { bg: 'bg-[#FFF0E6] dark:bg-orange-500/10', text: 'text-[#EA580C] dark:text-orange-450' },
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

// Generate pastel colors for avatar initials
const getAvatarColors = (name) => {
    const hash = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const colors = [
        { bg: 'bg-purple-50 dark:bg-purple-950/30 text-[#7C3AED] dark:text-purple-300' },
        { bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-[#059669] dark:text-emerald-300' },
        { bg: 'bg-blue-50 dark:bg-blue-950/30 text-[#3B82F6] dark:text-blue-300' },
        { bg: 'bg-rose-50 dark:bg-rose-950/30 text-[#EF4444] dark:text-rose-300' },
        { bg: 'bg-amber-50 dark:bg-amber-950/30 text-[#D97706] dark:text-amber-300' }
    ];
    return colors[hash % colors.length];
};

export default function StylistAppointmentsPage() {
    const { user } = useAuth();
    const { setMobileOpen } = useOutletContext() || {};
    const [activeTab, setActiveTab] = useState('All');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const dateInputRef = useRef(null);

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
                setSelectedBooking(null);
            }
        } catch (err) {
            console.error('Failed to update booking status:', err);
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    // Filter logic
    const filteredAppointments = appointments.filter(app => {
        const appDateStr = getLocalDateString(app.appointmentDate);
        if (appDateStr !== selectedDate) return false;

        const status = (app.status || '').toLowerCase();
        if (activeTab === 'All') return true;
        if (activeTab === 'Upcoming' && (status === 'upcoming' || status === 'confirmed' || status === 'pending' || status === 'arrived')) return true;
        if (activeTab === 'In Progress' && status === 'in-progress') return true;
        if (activeTab === 'Completed' && status === 'completed') return true;
        return false;
    });

    // Format date string for the display header
    const formatDateString = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return '';
        const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (isNaN(date.getTime())) return '';
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
        return `${day} ${month} ${year}, ${weekday}`;
    };

    const triggerDatePicker = () => {
        if (dateInputRef.current) {
            dateInputRef.current.showPicker();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAFC] dark:bg-slate-900 lg:rounded-[24px] lg:shadow-sm overflow-hidden min-h-screen lg:min-h-0 pb-20 lg:pb-0">
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            
            {/* Custom Premium Header for Mobile (exactly matching reference) */}
            <div className="flex lg:hidden items-center justify-between px-4 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-[50]">
                <button 
                    onClick={() => setMobileOpen && setMobileOpen(true)}
                    className="p-2 -ml-2 rounded-xl text-slate-800 dark:text-white bg-transparent border-0 cursor-pointer"
                >
                    <Menu className="w-6 h-6 stroke-[2]" />
                </button>
                <span className="text-[17px] font-bold text-slate-900 dark:text-white">
                    Appointments
                </span>
                <button 
                    onClick={triggerDatePicker}
                    className="p-2 -mr-2 rounded-xl text-slate-800 dark:text-white bg-transparent border-0 cursor-pointer"
                >
                    <Filter className="w-5 h-5 stroke-[2]" />
                </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between px-6 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <h1 className="text-[20px] font-bold text-slate-900 dark:text-white">Appointments</h1>
                <button 
                    onClick={() => fetchAppointments(true)} 
                    disabled={loading || refreshing}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border-0"
                >
                    {refreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                </button>
            </div>

            {/* Scrollable Layout Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 lg:px-6 py-4">
                
                {/* Horizontal Filter Tabs */}
                <div className="no-scrollbar mb-5 -mx-4 px-4 lg:mx-0 lg:px-0" style={{ overflowX: 'auto' }}>
                    <div className="flex items-center justify-start lg:justify-center gap-2.5 min-w-full pb-1">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-[12px] text-[13px] font-bold transition-all border cursor-pointer shrink-0 ${
                                    activeTab === tab
                                        ? '!bg-[#5D2EE6] !text-white border-transparent shadow-sm'
                                        : '!bg-white dark:!bg-slate-850 !text-slate-600 dark:!text-slate-400 border-slate-150 dark:border-slate-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Row Bar (Interactive Native overlay) */}
                <div className="relative mb-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-[16px] px-4 py-3.5 flex items-center justify-between cursor-pointer hover:shadow-sm transition-all" onClick={triggerDatePicker}>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" strokeWidth={2} />
                        <span className="text-[13.5px] font-bold text-slate-800 dark:text-slate-200">
                            {formatDateString(selectedDate)}
                        </span>
                    </div>
                    <ChevronRight className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                    
                    {/* Hidden input overlay for datepicker */}
                    <input 
                        ref={dateInputRef}
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="absolute inset-0 opacity-0 pointer-events-none"
                    />
                </div>

                {/* Appointments List Container Card */}
                <div className="bg-white dark:bg-slate-800 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-750 overflow-hidden">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-[#5D2EE6]" />
                            <span className="text-[13px] font-semibold">Loading appointments...</span>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-[13px] font-semibold">
                            No appointments found for this filter.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-750">
                            {filteredAppointments.map((app) => {
                                const statusStyle = getStatusStyle(app.status);
                                const clientName = app.client?.name || 'Walk-in Client';
                                const clientInitial = initials(clientName);
                                const serviceName = app.service?.name || 'Custom Service';
                                const avatarColor = getAvatarColors(clientName);
                                
                                const appTime = app.time || (app.appointmentDate ? new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

                                return (
                                    <div 
                                        key={app._id} 
                                        onClick={() => setSelectedBooking(app)}
                                        className="flex items-center justify-between px-4 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-all cursor-pointer gap-3 active:scale-[0.99]"
                                    >
                                        {/* Time */}
                                        <div className="text-[13px] font-bold w-[75px] text-[#5D2EE6] dark:text-[#8B5CF6] shrink-0">
                                            {appTime}
                                        </div>

                                        {/* Initials Avatar */}
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${avatarColor.bg}`}>
                                            {clientInitial}
                                        </div>

                                        {/* Service & Client Name */}
                                        <div className="flex-1 min-w-0 ml-1">
                                            <p className="text-[13.5px] font-bold text-slate-900 dark:text-slate-100 leading-tight mb-0.5 truncate">
                                                {serviceName}
                                            </p>
                                            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-bold truncate">
                                                {clientName}
                                            </p>
                                        </div>

                                        {/* Status Badge & Chevron */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text}`}>
                                                {app.status === 'in-progress' ? 'In Progress' : (app.status || 'pending')}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-350 dark:text-slate-500" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Actions Drawer (Premium Bottom Sheet styling) */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[10000] flex items-end justify-center">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setSelectedBooking(null)}
                    />

                    {/* Bottom Sheet Container */}
                    <div className="relative w-full max-w-[600px] bg-white dark:bg-slate-800 rounded-t-[24px] shadow-2xl p-6 pb-8 border-t border-slate-100 dark:border-slate-700 animate-slide-up relative z-10">
                        {/* Pull Bar */}
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />

                        {/* Title Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[6px] uppercase tracking-wider inline-block mb-1.5 ${getStatusStyle(selectedBooking.status).bg} ${getStatusStyle(selectedBooking.status).text}`}>
                                    {selectedBooking.status === 'in-progress' ? 'In Progress' : (selectedBooking.status || 'pending')}
                                </span>
                                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">
                                    {selectedBooking.service?.name || 'Custom Service'}
                                </h3>
                                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                                    with {selectedBooking.client?.name || 'Walk-in Client'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-400 border-0 cursor-pointer bg-transparent"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 py-3 border-t border-b border-slate-100 dark:border-slate-750 my-4 text-[13px]">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Time Slot</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {selectedBooking.time || new Date(selectedBooking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Client Contact</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {selectedBooking.client?.phone || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Buttons Footer */}
                        <div className="space-y-2 mt-4">
                            {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed' || selectedBooking.status === 'arrived' || selectedBooking.status === 'upcoming') && (
                                <button 
                                    onClick={() => handleUpdateStatus(selectedBooking._id, 'in-progress')}
                                    className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 border-0 cursor-pointer transition-colors shadow-sm"
                                >
                                    <Play className="w-4 h-4 fill-white" /> Start Session
                                </button>
                            )}

                            {selectedBooking.status === 'in-progress' && (
                                <button 
                                    onClick={() => handleUpdateStatus(selectedBooking._id, 'completed')}
                                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 border-0 cursor-pointer transition-colors shadow-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Complete Session
                                </button>
                            )}

                            {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'no-show' && (
                                <button 
                                    onClick={() => handleUpdateStatus(selectedBooking._id, 'cancelled')}
                                    className="w-full h-12 rounded-xl bg-rose-50/10 hover:bg-rose-100/20 text-rose-500 font-bold text-sm flex items-center justify-center gap-2 border border-rose-500/20 cursor-pointer transition-colors"
                                >
                                    <AlertTriangle className="w-4 h-4" /> Cancel Appointment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
