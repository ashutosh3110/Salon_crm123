import { createContext, useContext, useState, useEffect } from 'react';
import initialData from '../data/pettyCashData.json';

const PettyCashContext = createContext();

export const usePettyCash = () => {
    const context = useContext(PettyCashContext);
    if (!context) throw new Error('usePettyCash must be used within a PettyCashProvider');
    return context;
};

const getInitialState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
};

export const PettyCashProvider = ({ children }) => {
    const [transactions, setTransactions] = useState(() => getInitialState('pc_transactions', initialData.transactions));
    const [closingLogs, setClosingLogs] = useState(() => getInitialState('pc_closing_logs', initialData.closingLogs || []));
    const [categories] = useState(initialData.categories);

    const today = new Date().toISOString().split('T')[0];

    // Status Check
    const isOpenedToday = transactions.some(t => t.date === today && t.type === 'DAY_OPEN');
    const isClosedToday = closingLogs.some(log => log.date === today);

    // Persistence
    useEffect(() => {
        localStorage.setItem('pc_transactions', JSON.stringify(transactions));
        localStorage.setItem('pc_closing_logs', JSON.stringify(closingLogs));
    }, [transactions, closingLogs]);

    const currentBalance = transactions.reduce((acc, t) => {
        return t.type === 'FUND_ADDED' ? acc + t.amount : acc - t.amount;
    }, 0);

    const addTransaction = (txn) => {
        const newTxn = {
            ...txn,
            id: `TXN_${Date.now()}`,
            date: today,
            timestamp: new Date().toISOString()
        };
        setTransactions(prev => [newTxn, ...prev]);
    };

    const openDay = (staffName) => {
        if (isOpenedToday) return;
        addTransaction({
            type: 'DAY_OPEN',
            category: 'System',
            amount: 0, // Opening balance is calculated from previous history
            description: 'Day Opened',
            staff: staffName || 'Manager'
        });
    };

    const addClosingLog = (log) => {
        const newLog = {
            ...log,
            id: `LOG_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        };
        setClosingLogs(prev => [newLog, ...prev]);
    };

    const value = {
        transactions,
        closingLogs,
        categories,
        currentBalance,
        addTransaction,
        addClosingLog,
        openDay,
        isOpenedToday,
        isClosedToday,
        denominations: initialData.denominations
    };

    return (
        <PettyCashContext.Provider value={value}>
            {children}
        </PettyCashContext.Provider>
    );
};
