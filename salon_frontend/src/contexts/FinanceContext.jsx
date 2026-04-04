import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useAttendance } from './AttendanceContext';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    const { user } = useAuth();
    const { getStylistAttendanceStats } = useAttendance();
    const [revenue, setRevenue] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [gstSummary, setGstSummary] = useState({ cgst: 0, sgst: 0, igst: 0, totalTax: 0 });
    const [cashBankSummary, setCashBankSummary] = useState({ cash: 0, bank: 0, razorset: 0 });
    const [taxFilings, setTaxFilings] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalExpenses: 0, netProfit: 0 });
    const [trendData, setTrendData] = useState([]);
    const [expenseSplits, setExpenseSplits] = useState([]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/finance/stats');
            setStats(res.data.data.summary);
            setTrendData(res.data.data.trends);
            setExpenseSplits(res.data.data.expenseSplits);
        } catch (error) {
            console.error('Finance Stats Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchGstSummary = useCallback(async (period) => {
        try {
            const res = await api.get('/finance/gst', { params: { period } });
            setGstSummary(res.data.data);
        } catch (error) {
            console.error('GST Summary Error:', error);
        }
    }, []);

    const fetchCashBankSummary = useCallback(async () => {
        try {
            const res = await api.get('/finance/reconcile-summary');
            setCashBankSummary(res.data.data);
        } catch (error) {
            console.error('Cash Bank Summary Error:', error);
        }
    }, []);

    const fetchRazorpaySettlements = useCallback(async (date) => {
        try {
            const res = await api.get('/finance/razorpay-settlements', { params: { date } });
            return res.data.data;
        } catch (error) {
            console.error('Razorpay Settlements Error:', error);
            throw error;
        }
    }, []);

    const saveCashBankReconciliation = async (data) => {
        try {
            const res = await api.post('/finance/reconcile', data);
            await fetchCashBankSummary();
            return res.data.data;
        } catch (error) {
            console.error('Save Reconciliation Error:', error);
            throw error;
        }
    };

    const addRevenue = async (data) => {
        const res = await api.post('/finance/revenue', data);
        setRevenue(prev => [res.data.data, ...prev]);
        await refresh();
        return res.data;
    };

    const addExpense = async (data) => {
        const res = await api.post('/finance/expense', data);
        setExpenses(prev => [res.data.data, ...prev]);
        await refresh();
        return res.data;
    };

    const [payrollEntries, setPayrollEntries] = useState([]);
    const [payrollPeriod, setPayrollPeriod] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, locked: false });

    const fetchPayroll = useCallback(async (year, month) => {
        const allowedRoles = ['admin', 'accountant'];
        if (!user || user.role === 'superadmin' || !allowedRoles.includes(user.role)) return;
        try {
            const res = await api.get('/payroll', { params: { year, month } });
            const payload = res.data.data || {};
            setPayrollEntries(payload.entries || []);
            setPayrollPeriod(payload.period || { year, month, locked: false });
        } catch (error) {
            console.error('Fetch Payroll Error:', error);
        }
    }, [user?.role]);

    const generatePayroll = async (year, month) => {
        try {
            const res = await api.post('/payroll/generate', { year, month });
            const payload = res.data.data || {};
            setPayrollEntries(payload.entries || []);
            setPayrollPeriod(payload.period || { year, month, locked: false });
            return payload;
        } catch (error) {
            console.error('Generate Payroll Error:', error);
            throw error;
        }
    };

    const syncCommissions = async (year, month) => {
        try {
            const res = await api.post('/payroll/sync-commissions', { year, month });
            const payload = res.data.data || {};
            setPayrollEntries(payload.entries || []);
            return payload;
        } catch (error) {
            console.error('Sync Commissions Error:', error);
            throw error;
        }
    };

    const syncAttendance = async (year, month) => {
        try {
            const res = await api.post('/payroll/sync-attendance', { year, month });
            const payload = res.data.data || {};
            setPayrollEntries(payload.entries || []);
            return payload;
        } catch (error) {
            console.error('Sync Attendance Error:', error);
            throw error;
        }
    };

    const processPayouts = async (year, month) => {
        try {
            const res = await api.post('/payroll/mark-all-paid', { year, month });
            const payload = res.data.data || {};
            setPayrollEntries(payload.entries || []);
            await refresh(); // Sync overall finance stats
            return payload;
        } catch (error) {
            console.error('Process Payouts Error:', error);
            throw error;
        }
    };

    const updatePayrollEntry = async (id, data) => {
        try {
            const res = await api.patch(`/payroll/entries/${id}`, data);
            const updated = res.data.data;
            setPayrollEntries(prev => prev.map(p => p._id === id ? updated : p));
            return updated;
        } catch (error) {
            console.error('Update Payroll Entry Error:', error);
            throw error;
        }
    };

    const updatePayrollStatus = async (id, status) => {
        try {
            await api.patch(`/payroll/entries/${id}`, { status });
            setPayrollEntries(prev => prev.map(p => p._id === id ? { ...p, status } : p));
        } catch (error) {
            console.error('Update Payroll Status Error:', error);
        }
    };

    // Derived Stats
    const totalRevenue = stats.totalRevenue;
    const totalExpenses = stats.totalExpenses;
    const netProfit = stats.netProfit;

    const enrichedPayroll = useMemo(() => {
        return payrollEntries.map(item => {
            const u = item.userId || {};
            const userName = u.name || 'Staff';
            
            // Note: Backend now calculates most of this, but we keep the structure 
            // consistent for the UI components that expect these fields.
            const attendanceScore = item.workingDays > 0 
                ? Math.round(((item.attendanceDays || 0) / item.workingDays) * 100) 
                : 0;

            const totalDeductions = (item.deductions || 0) + 
                                   (item.attendanceDeduction || 0) + 
                                   (item.deductAdvance ? (item.advance || 0) : 0);

            return {
                ...item,
                id: item._id,
                name: userName,
                role: u.role || 'Stylist',
                salary: item.baseSalary || 0,
                commission: item.commission || 0,
                incentive: item.incentive || 0,
                advance: item.advance || 0,
                totalDeductions,
                netPay: item.netPay || 0,
                attendanceScore
            };
        });
    }, [payrollEntries]);

    const updateBankDetails = async (outletId, bankData) => {
        try {
            const res = await api.patch(`/outlets/${outletId}/bank`, bankData);
            return res.data;
        } catch (error) {
            console.error('Update Bank Details Error:', error);
            throw error;
        }
    };

    const value = useMemo(() => ({
        revenue,
        expenses,
        payroll: enrichedPayroll,
        payrollPeriod,
        gstSummary,
        cashBankSummary,
        taxFilings,
        totalRevenue,
        totalExpenses,
        netProfit,
        trendData,
        expenseSplits,
        loading,
        refresh,
        fetchPayroll,
        generatePayroll,
        syncCommissions,
        syncAttendance,
        processPayouts,
        updatePayrollEntry,
        addRevenue,
        addExpense,
        updatePayrollStatus,
        fetchGstSummary,
        fetchCashBankSummary,
        fetchRazorpaySettlements,
        saveCashBankReconciliation,
        updateBankDetails
    }), [revenue, expenses, enrichedPayroll, payrollPeriod, gstSummary, cashBankSummary, taxFilings, totalRevenue, totalExpenses, netProfit, trendData, expenseSplits, loading, refresh, fetchPayroll, generatePayroll, syncCommissions, syncAttendance, processPayouts, updatePayrollEntry, updatePayrollStatus, fetchGstSummary, fetchCashBankSummary, fetchRazorpaySettlements]);

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
};
