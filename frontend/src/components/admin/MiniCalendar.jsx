import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MiniCalendar({ selectedDate, onDateSelect }) {
    const [viewDate, setViewDate] = useState(new Date(selectedDate || Date.now()));

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Previous month's trailing days
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = startDay - 1; i >= 0; i--) {
        days.push({
            date: new Date(year, month - 1, prevMonthDays - i),
            current: false
        });
    }

    // Current month's days
    for (let i = 1; i <= totalDays; i++) {
        days.push({
            date: new Date(year, month, i),
            current: true
        });
    }

    // Next month's leading days
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
        days.push({
            date: new Date(year, month + 1, i),
            current: false
        });
    }

    const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const isSelected = (d) => {
        return d.getDate() === selectedDate.getDate() &&
            d.getMonth() === selectedDate.getMonth() &&
            d.getFullYear() === selectedDate.getFullYear();
    };

    const isToday = (d) => {
        const today = new Date();
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    };

    return (
        <div className="bg-white p-4 select-none rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                    {monthNames[month]} {year}
                </h2>
                <div className="flex gap-1">
                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                    <div key={i}>{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center">
                {days.map((item, i) => (
                    <div
                        key={i}
                        className={`text-[11px] py-1.5 cursor-pointer rounded-lg transition-all flex items-center justify-center relative group
                            ${item.current ? 'text-gray-900' : 'text-gray-300'}
                            ${isSelected(item.date) ? 'bg-[#0078d4] text-white font-bold ring-2 ring-[#0078d4]/20' : 'hover:bg-gray-100'}
                            ${isToday(item.date) && !isSelected(item.date) ? 'text-[#0078d4] font-bold' : ''}
                        `}
                        onClick={() => onDateSelect?.(item.date)}
                    >
                        {item.date.getDate()}
                        {/* Status Dots */}
                        {item.current && [10, 15, 22].includes(item.date.getDate()) && !isSelected(item.date) && (
                            <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-gray-300 group-hover:bg-[#0078d4]" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
