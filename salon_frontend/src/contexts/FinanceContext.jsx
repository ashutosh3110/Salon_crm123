import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useAttendance } from './AttendanceContext';

const FinanceContext = createContext();

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) throw new Error('useFinance must be used within a FinanceProvider');
    return context;
};

export const FinanceProvider = ({ children }) => {
    const { user } = useAuth();
    const { getStylistAttendanceStats } = useAttendance();
    const [revenue, setRevenue] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [payroll, setPayroll] = useState([]);
    const [taxFilings, setTaxFilings] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [expenseSplits, setExpenseSplits] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        invoiceCount: 0
    });
    const [loading, setLoading] = useState(true);

    const [gstSummary, setGstSummary] = useState({ totals: {}, monthly: [] });
    const [cashBankSummary, setCashBankSummary] = useState(null);

    const fetchGstSummary = useCallback(async (query = {}) => {
        const allowedRoles = ['admin', 'accountant'];
        if (!user || user.role === 'superadmin' || !allowedRoles.includes(user.role)) return;
        try {
            const res = await api.get('/finance/tax/gst-summary', { params: query });
            setGstSummary(res.data.data || { totals: {}, monthly: [] });
        } catch (error) {
            console.error('Fetch GST Summary Error:', error);
        }
    }, [user?.role]);

    const fetchCashBankSummary = useCallback(async (date = new Date().toISOString().split('T')[0]) => {
        const allowedRoles = ['admin', 'accountant'];
        if (!user || user.role === 'superadmin' || !allowedRoles.includes(user.role)) return;
        try {
            const res = await api.get(`/finance/cash-bank`, { params: { date } });
            setCashBankSummary(res.data.data);
            return res.data.data;
        } catch (error) {
            console.error('Fetch Cash Bank Summary Error:', error);
        }
    }, [user?.role]);

    const saveCashBankReconciliation = async (payload) => {
        try {
            // payload may contain { actualCashCounted, denominations, bankReconciledItems, date }
            const res = await api.post('/finance/cash-bank/reconcile', payload);
            setCashBankSummary(res.data.data.summary);
            await refresh(); // Sync overall finance stats
            return res.data.data;
        } catch (error) {
            console.error('Save Reconciliation Error:', error);
            throw error;
        }
    };
    const fetchRazorpaySettlements = useCallback(async (from, to) => {
        try {
            const res = await api.get('/billing/razorpay/settlements', { params: { from, to } });
            return res.data.data.items || [];
        } catch (error) {
            console.error('Fetch Razorpay Settlements Error:', error);
            throw error;
        }
    }, []);

    const refresh = useCallback(async () => {
        // Explicitly allow only admin and accountant to fetch full finance data
        const allowedRoles = ['admin', 'accountant'];
        if (!user || user.role === 'superadmin' || !allowedRoles.includes(user.role)) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [statsRes, trendRes, expRes, invRes] = await Promise.all([
                api.get('/invoices/stats'),
                api.get('/invoices/finance-dashboard'),
                api.get('/finance/expenses?limit=100'),
                api.get('/invoices?limit=20')
            ]);

            const s = statsRes.data;
            const kpis = trendRes.data.kpis || {};
            
            setStats({
                totalRevenue: kpis.grossInflow || 0, // Using MTD gross inflow for dashboard consistency
                totalExpenses: kpis.totalExpenses || 0,
                netProfit: (kpis.grossInflow || 0) - (kpis.totalExpenses || 0),
                invoiceCount: s.invoiceCount || 0
            });

            setTrendData(trendRes.data.monthlyTrend?.map(t => ({
                name: t.name,
                income: t.revenue,
                expenses: t.expense
            })) || []);

            const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#6366f1', '#10b981', '#f43f5e', '#8b5cf6'];
            setExpenseSplits(trendRes.data.costAllocation?.map((c, index) => ({
                name: c.label,
                value: c.percentage,
                amount: c.amount,
                color: COLORS[index % COLORS.length]
            })) || []);

            setExpenses(expRes.data.results || []);
            setRevenue(invRes.data.results || []);
            
            // Also fetch GST and Cash Bank summary
            fetchGstSummary();
            fetchCashBankSummary();
        } catch (error) {
            console.error('Finance Refresh Error:', error);
        } finally {
            setLoading(false);
        }
    }, [user, fetchGstSummary, fetchCashBankSummary]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addRevenue = async (entry) => {
        // In real app, this might be handled by POS. 
        // For accountant, we might just refresh.
        await refresh();
    };

    const addExpense = async (entry) => {
        try {
            await api.post('/finance/expenses', entry);
            await refresh();
        } catch (error) {
            console.error('Add Expense Error:', error);
            throw error;
        }
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
            const user = item.userId || {};
            const userName = user.name || 'Staff';
            const attStats = getStylistAttendanceStats(userName);
            const expectedDays = 25;
            const missedDays = Math.max(0, expectedDays - attStats.presentDays);
            const attendanceDeduction = missedDays * 500;

            // Final deduction includes manual entry + attendance deduction
            const totalDeductions = (item.deductions || 0) + attendanceDeduction;
            const netPay = Math.max(0, (item.baseSalary || 0) + (item.commission || 0) - totalDeductions);

            return {
                ...item,
                id: item._id,
                name: userName,
                role: user.role || 'Stylist',
                salary: item.baseSalary || 0,
                commission: item.commission || 0,
                attendanceStats: attStats,
                totalDeductions,
                netPay,
                attendanceScore: Math.round((attStats.presentDays / expectedDays) * 100)
            };
        });
    }, [payrollEntries, getStylistAttendanceStats]);

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
        processPayouts,
        addRevenue,
        addExpense,
        updatePayrollStatus,
        fetchGstSummary,
        fetchCashBankSummary,
        fetchRazorpaySettlements,
        saveCashBankReconciliation
    }), [revenue, expenses, enrichedPayroll, payrollPeriod, gstSummary, cashBankSummary, taxFilings, totalRevenue, totalExpenses, netProfit, trendData, expenseSplits, loading, refresh, fetchPayroll, fetchGstSummary, fetchCashBankSummary, fetchRazorpaySettlements]);

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
};
