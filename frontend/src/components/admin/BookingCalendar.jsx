import React, { useMemo, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';

const VIEW_MODES = ['Day', 'Week', 'Month', 'Year'];

export default function BookingCalendar({ bookings = [], currentDate, onDateChange, onBookingClick }) {
    const [viewMode, setViewMode] = useState('Month');

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const calendarGrid = useMemo(() => {
        const days = [];
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        // Previous month's trailing days
        const prevMonthDays = daysInMonth(year, month - 1);
        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthDays - i),
                isCurrentMonth: false
            });
        }

        // Current month's days
        for (let i = 1; i <= totalDays; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }

        // Next month's leading days
        const totalSlots = days.length > 35 ? 42 : 35;
        const nextMonthStart = totalSlots - days.length;
        for (let i = 1; i <= nextMonthStart; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }

        return days;
    }, [year, month]);

    const weekGrid = useMemo(() => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        return days;
    }, [currentDate]);

    const bookingsByDate = useMemo(() => {
        const map = {};
        bookings.forEach(b => {
            if (b.appointmentDate) {
                const d = new Date(b.appointmentDate);
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                if (!map[key]) map[key] = [];
                map[key].push(b);
            }
        });
        return map;
    }, [bookings]);

    const handlePrev = () => {
        if (viewMode === 'Day') {
            const d = new Date(currentDate);
            d.setDate(currentDate.getDate() - 1);
            onDateChange(d);
        } else if (viewMode === 'Week') {
            const d = new Date(currentDate);
            d.setDate(currentDate.getDate() - 7);
            onDateChange(d);
        } else if (viewMode === 'Month') {
            onDateChange(new Date(year, month - 1, 1));
        } else if (viewMode === 'Year') {
            onDateChange(new Date(year - 1, month, 1));
        }
    };

    const handleNext = () => {
        if (viewMode === 'Day') {
            const d = new Date(currentDate);
            d.setDate(currentDate.getDate() + 1);
            onDateChange(d);
        } else if (viewMode === 'Week') {
            const d = new Date(currentDate);
            d.setDate(currentDate.getDate() + 7);
            onDateChange(d);
        } else if (viewMode === 'Month') {
            onDateChange(new Date(year, month + 1, 1));
        } else if (viewMode === 'Year') {
            onDateChange(new Date(year + 1, month, 1));
        }
    };

    const handleToday = () => onDateChange(new Date());

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date) => {
        return date.getDate() === currentDate.getDate() &&
            date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear();
    };

    const getStatusClass = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'completed') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20';
        if (s === 'confirmed' || s === 'upcoming') return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-500 border-indigo-500/20';
        if (s === 'pending') return 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20';
        if (s === 'cancelled') return 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20';
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/20';
    };

    const headerTitle = useMemo(() => {
        if (viewMode === 'Year') return String(year);
        if (viewMode === 'Day') return `${monthNames[month]} ${currentDate.getDate()}, ${year}`;
        if (viewMode === 'Week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()].substring(0, 3)} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()].substring(0, 3)} ${year}`;
        }
        return `${monthNames[month]} ${year}`;
    }, [viewMode, currentDate, year, month]);

    return (
        <div className="flex flex-col h-full bg-surface select-none text-left">
            {/* Windows 11 style Toolbar */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-border/40 bg-surface shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-base font-black text-text tracking-tight uppercase leading-none min-w-[120px]">
                        {headerTitle}
                    </h2>

                    <div className="flex items-center bg-surface-alt border border-border/45 p-0.5 rounded-xl shadow-inner">
                        <button onClick={handlePrev} className="p-1.5 hover:bg-surface rounded-lg transition-all text-text-muted hover:text-text active:scale-90">
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleToday} className="px-3.5 py-1 text-[9px] font-black text-text hover:bg-surface rounded-lg transition-all uppercase tracking-wider">
                            Today
                        </button>
                        <button onClick={handleNext} className="p-1.5 hover:bg-surface rounded-lg transition-all text-text-muted hover:text-text active:scale-90">
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center bg-surface-alt border border-border/45 p-0.5 rounded-xl shadow-inner">
                    {VIEW_MODES.map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3.5 py-1 text-[9px] font-black rounded-lg transition-all tracking-wider uppercase ${mode === viewMode
                                    ? 'bg-surface text-primary shadow-sm border border-border/10'
                                    : 'text-text-muted hover:text-text'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                <div className="relative group max-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        className="pl-8.5 pr-4 py-1.5 bg-surface-alt border border-border/45 rounded-xl text-xs text-text focus:outline-none focus:border-primary transition-all w-full placeholder-text-muted"
                    />
                </div>
            </div>

            {/* Weekdays Header */}
            {(viewMode === 'Month' || viewMode === 'Week') && (
                <div className="grid grid-cols-7 border-b border-border/40 bg-surface-alt/10">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                        <div key={i} className="py-2.5 text-[8.5px] font-black text-text-muted text-center tracking-widest uppercase">
                            {day}
                        </div>
                    ))}
                </div>
            )}

            {/* Calendar Grid */}
            {viewMode === 'Month' && (
                <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-hidden divide-x divide-y divide-border/40 border-l border-border/40 border-b border-border/40">
                    {calendarGrid.map((item, i) => {
                        const key = `${item.date.getFullYear()}-${item.date.getMonth()}-${item.date.getDate()}`;
                        const items = bookingsByDate[key] || [];

                        return (
                            <div
                                key={i}
                                onClick={() => onDateChange(item.date)}
                                className={`p-2 relative flex flex-col gap-0.5 transition-all hover:bg-primary/[0.02] cursor-pointer group ${!item.isCurrentMonth ? 'bg-surface-alt/10' : 'bg-surface'
                                    } ${isSelected(item.date) ? 'bg-primary/[0.02]' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className={`text-[10px] font-black w-5.5 h-5.5 flex items-center justify-center rounded-lg transition-all ${isToday(item.date)
                                            ? 'bg-primary text-surface shadow-md shadow-primary/20'
                                            : item.isCurrentMonth ? 'text-text' : 'text-text-muted/40'
                                        } ${isSelected(item.date) && !isToday(item.date) ? 'ring-1.5 ring-primary' : ''}`}>
                                        {item.date.getDate()}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar">
                                    {items.slice(0, 3).map((b) => (
                                        <div
                                            key={b._id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onBookingClick(b);
                                            }}
                                            className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold truncate transition-all border ${getStatusClass(b.status)}`}
                                        >
                                            <div className="flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-current opacity-60" />
                                                <span className="uppercase tracking-[0.03em]">{b.client?.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {items.length > 3 && (
                                        <span className="text-[8px] font-black text-text-muted/65 px-1.5">+{items.length - 3} MORE</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Week View */}
            {viewMode === 'Week' && (
                <div className="flex-1 grid grid-cols-7 overflow-hidden divide-x divide-border/40 border-l border-border/40 border-b border-border/40">
                    {weekGrid.map((day, i) => {
                        const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
                        const items = bookingsByDate[key] || [];
                        const dayIsToday = isToday(day);
                        const dayIsSelected = isSelected(day);

                        return (
                            <div
                                key={i}
                                onClick={() => onDateChange(day)}
                                className={`p-3 relative flex flex-col gap-2 transition-all hover:bg-primary/[0.02] cursor-pointer h-full overflow-y-auto no-scrollbar ${dayIsSelected ? 'bg-primary/[0.02]' : 'bg-surface'}`}
                            >
                                <div className="flex justify-between items-start border-b border-border/30 pb-2 mb-1">
                                    <span className={`text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg ${dayIsToday
                                        ? 'bg-primary text-surface shadow-md shadow-primary/20'
                                        : 'text-text'}`}>
                                        {day.getDate()}
                                    </span>
                                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">
                                        {items.length} {items.length === 1 ? 'Booking' : 'Bookings'}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    {items.map((b) => (
                                        <div
                                            key={b._id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onBookingClick(b);
                                            }}
                                            className={`p-2 rounded-xl text-[9px] font-bold transition-all border flex flex-col gap-1 ${getStatusClass(b.status)}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="uppercase tracking-[0.03em] truncate max-w-[80px]">{b.client?.name || 'UNKNOWN'}</span>
                                                <span className="font-mono text-[8px] opacity-75">{b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                            </div>
                                            <span className="text-[8px] opacity-60 uppercase truncate">{b.service?.name}</span>
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="py-8 text-center text-[8px] font-black text-text-muted/30 uppercase tracking-wider">
                                            Free
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Day View */}
            {viewMode === 'Day' && (
                <div className="flex-1 overflow-y-auto p-4 bg-surface-alt/10">
                    <div className="max-w-3xl mx-auto bg-surface border border-border/40 rounded-2xl shadow-sm divide-y divide-border/20">
                        {Array.from({ length: 13 }, (_, idx) => {
                            const hour = 9 + idx;
                            const displayTime = hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
                            
                            const selectedKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
                            const dayBookings = bookingsByDate[selectedKey] || [];
                            const hourBookings = dayBookings.filter(b => {
                                if (!b.appointmentDate) return false;
                                const bTime = new Date(b.appointmentDate);
                                return bTime.getHours() === hour;
                            });

                            return (
                                <div key={hour} className="flex gap-4 p-4 items-start">
                                    <span className="w-20 text-[10px] font-black text-text-muted uppercase tracking-wider font-mono shrink-0 py-1.5">
                                        {displayTime}
                                    </span>
                                    <div className="flex-1 flex flex-col gap-2">
                                        {hourBookings.map(b => (
                                            <div
                                                key={b._id}
                                                onClick={() => onBookingClick(b)}
                                                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all hover:shadow-sm cursor-pointer ${getStatusClass(b.status)}`}
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black uppercase tracking-tight">{b.client?.name || 'UNKNOWN'}</span>
                                                        <span className="text-[9px] font-mono opacity-75">{new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wide">
                                                        {b.service?.name} • Stylist: {b.staff?.name || 'Any'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{b.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {hourBookings.length === 0 && (
                                            <div className="h-[1px] bg-border/20 my-2.5" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Year View */}
            {viewMode === 'Year' && (
                <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-4 p-6 overflow-y-auto bg-surface-alt/10">
                    {monthNames.map((mName, mIdx) => {
                        const monthBookings = bookings.filter(b => {
                            if (!b.appointmentDate) return false;
                            const d = new Date(b.appointmentDate);
                            return d.getFullYear() === year && d.getMonth() === mIdx;
                        });

                        return (
                            <div
                                key={mName}
                                onClick={() => {
                                    onDateChange(new Date(year, mIdx, 1));
                                    setViewMode('Month');
                                }}
                                className="bg-surface border border-border/40 p-5 rounded-2xl flex flex-col justify-between hover:border-primary hover:shadow-md cursor-pointer transition-all min-h-[120px]"
                            >
                                <span className="text-xs font-black uppercase tracking-wider text-text">{mName}</span>
                                <div>
                                    <h4 className="text-2xl font-black text-primary font-mono">{monthBookings.length}</h4>
                                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Bookings Scheduled</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
