import React, { useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';

const VIEW_MODES = ['Day', 'Week', 'Month', 'Year'];

export default function BookingCalendar({ bookings = [], currentDate, onDateChange, onBookingClick }) {
    const viewMode = 'Month'; // Currently hardcoded to Month as per reference UI

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

    const handlePrev = () => onDateChange(new Date(year, month - 1, 1));
    const handleNext = () => onDateChange(new Date(year, month + 1, 1));
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

    return (
        <div className="flex flex-col h-full bg-surface select-none text-left">
            {/* Windows 11 style Toolbar */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-border/40 bg-surface shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-base font-black text-text tracking-tight uppercase leading-none min-w-[120px]">
                        {monthNames[month]} <span className="font-bold text-text-muted">{year}</span>
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
                            className={`px-3.5 py-1 text-[9px] font-black rounded-lg transition-all tracking-wider uppercase ${mode === 'Month'
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
            <div className="grid grid-cols-7 border-b border-border/40 bg-surface-alt/10">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                    <div key={i} className="py-2.5 text-[8.5px] font-black text-text-muted text-center tracking-widest uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
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

                            {/* Event Indicators */}
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
        </div>
    );
}
