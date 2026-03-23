import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import initialData from '../data/accountantData.json';
import { useAttendance } from './AttendanceContext';

const FinanceContext = createContext();

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) throw new Error('useFinance must be used within a FinanceProvider');
    return context;
};

const getInitialState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
};

export const FinanceProvider = ({ children }) => {
    const { getStylistAttendanceStats } = useAttendance();
    const [revenue, setRevenue] = useState(() => getInitialState('fin_revenue', initialData.revenue));
    const [expenses, setExpenses] = useState(() => getInitialState('fin_expenses', initialData.expenses));
    const [payroll, setPayroll] = useState(() => getInitialState('fin_payroll', initialData.payroll));
    const [taxFilings, setTaxFilings] = useState(() => getInitialState('fin_tax', initialData.taxFilings));

    // Persistence logic
    useEffect(() => {
        localStorage.setItem('fin_revenue', JSON.stringify(revenue));
        localStorage.setItem('fin_expenses', JSON.stringify(expenses));
        localStorage.setItem('fin_payroll', JSON.stringify(payroll));
        localStorage.setItem('fin_tax', JSON.stringify(taxFilings));
    }, [revenue, expenses, payroll, taxFilings]);

    // Derived Stats
    const totalRevenue = revenue.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    const addRevenue = (entry) => {
        const newEntry = { ...entry, id: Date.now() };
        setRevenue(prev => [newEntry, ...prev]);
    };

    const addExpense = (entry) => {
        const newEntry = { ...entry, id: Date.now() };
        setExpenses(prev => [newEntry, ...prev]);
    };

    const updatePayrollStatus = (id, status) => {
        setPayroll(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    };

    // Enrich Payroll with Attendance Data
    const enrichedPayroll = useMemo(() => {
        return payroll.map(item => {
            const stats = getStylistAttendanceStats(item.name);
            // Example deduction: ₹500 for every missed day (assuming 25 working days)
            const expectedDays = 25;
            const missedDays = Math.max(0, expectedDays - stats.presentDays);
            const attendanceDeduction = missedDays * 500;

            return {
                ...item,
                attendanceStats: stats,
                // Combine original deductions with attendance-based ones
                totalDeductions: item.deductions + attendanceDeduction,
                attendanceScore: Math.round((stats.presentDays / expectedDays) * 100)
            };
        });
    }, [payroll, getStylistAttendanceStats]);

    const value = useMemo(() => ({
        revenue,
        expenses,
        payroll: enrichedPayroll,
        rawPayroll: payroll,
        taxFilings,
        totalRevenue,
        totalExpenses,
        netProfit,
        addRevenue,
        addExpense,
        updatePayrollStatus
    }), [revenue, expenses, enrichedPayroll, payroll, taxFilings, totalRevenue, totalExpenses, netProfit]);

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
};
