import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const DEFAULT_CATEGORIES = [
    'Staff Refreshment',
    'Cleaning Supplies',
    'Office & Stationery',
    'Transport / Conveyance',
    'Repair & Maintenance',
    'Miscellaneous',
];

const PettyCashContext = createContext(null);

export const usePettyCash = () => {
    const context = useContext(PettyCashContext);
    if (!context) throw new Error('usePettyCash must be used within a PettyCashProvider');
    return context;
};

export const PettyCashProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [closingLogs, setClosingLogs] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user, isPlanActive } = useAuth();
    const refresh = useCallback(async () => {
        // Skip for public pages or customer app
        const publicPaths = ['/login', '/register', '/forgot-password', '/contact', '/blog', '/launchpad'];
        const isPublicPath = publicPaths.some(p => window.location.pathname.startsWith(p)) || window.location.pathname === '/';
        const isCustomerApp = window.location.pathname.startsWith('/app');

        if (isPublicPath || isCustomerApp) {
            setLoading(false);
            return;
        }

        // Wait for user or check role
        if (!user || !isPlanActive) {
            setLoading(false);
            return;
        }

        // Authorized roles for petty cash
        const allowedRoles = ['admin', 'manager', 'accountant'];
        if (user.role === 'superadmin' || !allowedRoles.includes(user.role)) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [sumRes, entRes, clRes] = await Promise.all([
                api.get('/finance/petty-cash/summary'),
                api.get('/finance/petty-cash/entries?limit=200'),
                api.get('/finance/petty-cash/closings?limit=60'),
            ]);
            const sum = sumRes.data?.data;
            setSummary(sum);
            setTransactions(entRes.data?.data?.results || []);
            setClosingLogs(clRes.data?.data?.results || []);
        } catch (e) {
            const status = e?.response?.status;
            const base = (e?.config?.baseURL || '').replace(/\/$/, '');
            const path = e?.config?.url || '';
            const tried = base && path ? `${base}${path.startsWith('/') ? '' : '/'}${path}` : '';
            if (status === 404) {
                setError(
                    `Not found — API URL seems incorrect. Check VITE_API_URL in your .env file. ` +
                        `Backend might be down or the endpoint is missing.`
                );
            } else {
                setError(
                    e?.response?.data?.message ||
                        e?.networkHint ||
                        e.message ||
                        'Failed to load petty cash'
                );
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const openDay = async (staffName) => {
        setError(null);
        try {
            await api.post('/finance/petty-cash/open-day', { staffName: staffName || 'Manager' });
            await refresh();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Failed to open day';
            setError(msg);
            throw e;
        }
    };

    const addFund = async ({ amount, description, staff, source }) => {
        setError(null);
        try {
            await api.post('/finance/petty-cash/fund', {
                amount: Number(amount),
                description: description || undefined,
                source: source || staff || 'Owner',
            });
            await refresh();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Failed to add fund';
            setError(msg);
            throw e;
        }
    };

    const addExpense = async ({ amount, category, description, staff, attachment }) => {
        setError(null);
        try {
            await api.post('/finance/petty-cash/expense', {
                amount: Number(amount),
                category: category || 'Miscellaneous',
                description: description || '',
                staff: staff || 'Staff',
                attachment: attachment || undefined,
            });
            await refresh();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Failed to record expense';
            setError(msg);
            throw e;
        }
    };

    const closeDay = async (log) => {
        setError(null);
        try {
            const den = {};
            if (log.denominations) {
                Object.entries(log.denominations).forEach(([k, v]) => {
                    const n = Number(v);
                    if (n > 0) den[k] = n;
                });
            }
            await api.post('/finance/petty-cash/close', {
                denominations: den,
                verifiedBy: log.verifiedBy,
            });
            await refresh();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Failed to close day';
            setError(msg);
            throw e;
        }
    };

    const categories = summary?.categories?.length ? summary.categories : DEFAULT_CATEGORIES;
    const denominations = summary?.denominations?.length
        ? summary.denominations
        : [500, 200, 100, 50, 20, 10, 5, 2, 1];
    const currentBalance = summary?.balance ?? 0;
    const isOpenedToday = summary?.isOpenedToday ?? false;
    const isClosedToday = summary?.isClosedToday ?? false;
    const businessDate = summary?.businessDate || new Date().toISOString().split('T')[0];

    const value = useMemo(() => ({
        transactions,
        closingLogs,
        categories,
        denominations,
        currentBalance,
        isOpenedToday,
        isClosedToday,
        businessDate,
        summary,
        loading,
        error,
        refresh,
        openDay,
        addFund,
        addExpense,
        closeDay,
    }), [transactions, closingLogs, categories, denominations, currentBalance, isOpenedToday, isClosedToday, businessDate, summary, loading, error, refresh]);

    return <PettyCashContext.Provider value={value}>{children}</PettyCashContext.Provider>;
};
