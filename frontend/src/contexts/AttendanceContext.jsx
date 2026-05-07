import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import stylistData from '../data/stylistMockData.json';

const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
    const [logs, setLogs] = useState(() => {
        const saved = localStorage.getItem('stylist_attendance_logs');
        return saved ? JSON.parse(saved) : (stylistData.attendance?.logs || []);
    });

    useEffect(() => {
        localStorage.setItem('stylist_attendance_logs', JSON.stringify(logs));
    }, [logs]);

    const addLog = (log) => {
        setLogs(prev => [log, ...prev]);
    };

    const getStylistAttendanceStats = (stylistName) => {
        // In a real app we'd use stylistId, here we might filter by name or assume one stylist for now
        const stylistLogs = logs.filter(l => l.stylistName === stylistName || !l.stylistName); // fallback for legacy logs
        const presentDays = new Set(stylistLogs.filter(l => l.type === 'IN').map(l => l.date)).size;
        return {
            presentDays,
            totalLogs: stylistLogs.length
        };
    };

    const value = useMemo(() => ({ logs, addLog, getStylistAttendanceStats }), [logs]);

    return (
        <AttendanceContext.Provider value={value}>
            {children}
        </AttendanceContext.Provider>
    );
};

export const useAttendance = () => {
    const context = useContext(AttendanceContext);
    if (!context) {
        throw new Error('useAttendance must be used within an AttendanceProvider');
    }
    return context;
};
