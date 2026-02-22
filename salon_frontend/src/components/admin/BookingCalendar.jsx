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

    return (
        <div className="flex flex-col h-full bg-white select-none">
            {/* Windows 11 style Toolbar */}
            <div className="px-8 py-5 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm">
                <div className="flex items-center gap-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight min-w-[200px]">
                        {monthNames[month]} <span className="font-medium text-gray-400">{year}</span>
                    </h2>

                    <div className="flex items-center bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
                        <button onClick={handlePrev} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={handleToday} className="px-5 py-2 text-[11px] font-bold text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all uppercase tracking-wider">
                            Today
                        </button>
                        <button onClick={handleNext} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
                    {VIEW_MODES.map((mode) => (
                        <button
                            key={mode}
                            className={`px-6 py-2 text-[11px] font-bold rounded-lg transition-all tracking-wider uppercase ${mode === 'Month'
                                    ? 'bg-white text-[#0078d4] shadow-md border border-gray-100'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-[#0078d4] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0078d4]/10 transition-all w-56 focus:w-72"
                    />
                </div>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/30">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                    <div key={i} className="py-3 text-[10px] font-bold text-gray-400 text-center tracking-widest uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-hidden divide-x divide-y divide-gray-100 border-l border-gray-100">
                {calendarGrid.map((item, i) => {
                    const key = `${item.date.getFullYear()}-${item.date.getMonth()}-${item.date.getDate()}`;
                    const items = bookingsByDate[key] || [];

                    return (
                        <div
                            key={i}
                            onClick={() => onDateChange(item.date)}
                            className={`p-3 relative flex flex-col gap-1 transition-all hover:bg-[#0078d4]/[0.02] cursor-pointer group ${!item.isCurrentMonth ? 'bg-gray-50/30' : 'bg-white'
                                } ${isSelected(item.date) ? 'bg-[#0078d4]/[0.03]' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[12px] font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isToday(item.date)
                                        ? 'bg-[#0078d4] text-white shadow-lg shadow-[#0078d4]/30'
                                        : item.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                                    } ${isSelected(item.date) && !isToday(item.date) ? 'ring-2 ring-[#0078d4]' : ''}`}>
                                    {item.date.getDate()}
                                </span>
                            </div>

                            {/* Event Indicators */}
                            <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto no-scrollbar">
                                {items.slice(0, 3).map((b) => (
                                    <div
                                        key={b._id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onBookingClick(b);
                                        }}
                                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold truncate transition-all shadow-sm border border-transparent hover:border-black/5
                                            ${b.status === 'upcoming' ? 'bg-blue-50 text-[#0078d4]' :
                                                b.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                    'bg-red-50 text-red-700 hover:bg-red-100'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                            {b.client?.name}
                                        </div>
                                    </div>
                                ))}
                                {items.length > 3 && (
                                    <span className="text-[9px] font-bold text-gray-400 px-2">+{items.length - 3} more</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
