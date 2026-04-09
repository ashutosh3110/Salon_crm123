import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';
import walletData from '../data/walletData.json';
import mockApi from '../services/mock/mockApi';

const WalletContext = createContext(null);

function mapLoyaltyTx(tx) {
    const createdAt = tx?.createdAt || tx?.date || tx?.updatedAt;
    const date = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();

    const type = tx.type === 'REDEEM' ? 'DEBIT' : 'CREDIT';
    const amount = Math.abs(Number(tx.points || 0));

    const description =
        tx.type === 'EARN'
            ? 'Wallet Recharge (Loyalty Earn)'
            : tx.type === 'REDEEM'
                ? 'Wallet Redeem (Loyalty Redeem)'
                : tx.type === 'REVERSE'
                    ? 'Wallet Reverse (Loyalty Reverse)'
                    : 'Loyalty Transaction';

    return {
        id: tx?._id || tx?.id,
        type,
        amount,
        description,
        date,
        status: 'COMPLETED',
        expiryDate: tx?.expiryDate ? new Date(tx.expiryDate).toISOString() : null,
    };
}

export function WalletProvider({ children }) {
    const { customer } = useCustomerAuth();
    const inflightRequests = useRef(new Set());

    const [allWallets, setAllWallets] = useState(walletData.mockWallets || {});
    const [loading, setLoading] = useState(true);
    const [walletSettings, setWalletSettings] = useState(walletData.walletSettings);
    const [walletLoadingMap, setWalletLoadingMap] = useState({});

    useEffect(() => {
        const stored = localStorage.getItem('global_wallets');
        if (stored) {
            try {
                setAllWallets(JSON.parse(stored));
            } catch {
                // ignore
            }
        }

        const storedSettings = localStorage.getItem('wallet_settings');
        if (storedSettings) {
            try {
                setWalletSettings(JSON.parse(storedSettings));
            } catch {
                // ignore
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('global_wallets', JSON.stringify(allWallets));
            localStorage.setItem('wallet_settings', JSON.stringify(walletSettings));
        }
    }, [allWallets, walletSettings, loading]);

    const activeWallet = allWallets[customer?._id] || { balance: 0, transactions: [] };

    const spentThisMonth = useMemo(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return (activeWallet.transactions || [])
            .filter(tx => tx.type === 'DEBIT' && new Date(tx.date) >= firstDay)
            .reduce((acc, tx) => acc + Number(tx.amount || 0), 0);
    }, [activeWallet.transactions]);

    const refreshWallet = useCallback(async (customerId) => {
        if (!customerId) return;
        if (inflightRequests.current.has(customerId)) return;
        inflightRequests.current.add(customerId);

        setWalletLoadingMap(prev => ({ ...prev, [customerId]: true }));
        try {
            const [walletRes, historyRes] = await Promise.all([
                mockApi.get(`/loyalty/wallet/${customerId}`),
                mockApi.get(`/loyalty/history/${customerId}?page=1&limit=50`),
            ]);

            const wallet = walletRes?.data || { totalPoints: 0 };
            const history = historyRes?.data?.results || [];
            const transactions = Array.isArray(history) ? history.map(mapLoyaltyTx) : [];

            setAllWallets(prev => ({
                ...prev,
                [customerId]: {
                    balance: Number(wallet.totalPoints || 0),
                    transactions,
                },
            }));
        } catch (err) {
            console.error('[WalletContext] refreshWallet error:', err);
        } finally {
            inflightRequests.current.delete(customerId);
            setWalletLoadingMap(prev => ({ ...prev, [customerId]: false }));
        }
    }, []);

    const initializeWallet = useCallback(async (customerId) => {
        if (!customerId) return;
        if (inflightRequests.current.has(customerId) || walletLoadingMap[customerId]) return;

        setAllWallets(prev => {
            if (!prev[customerId] && walletData.mockWallets?.[customerId]) {
                return { ...prev, [customerId]: walletData.mockWallets[customerId] };
            }
            return prev;
        });

        try {
            await refreshWallet(customerId);
        } catch {
            setAllWallets(prev => ({
                ...prev,
                [customerId]: prev[customerId] || { balance: 0, transactions: [] },
            }));
        }
    }, [refreshWallet, walletLoadingMap]);

    const getWallet = (customerId) => {
        const w = allWallets[customerId];
        if (w) return w;
        if (!walletLoadingMap[customerId] && !inflightRequests.current.has(customerId)) {
            initializeWallet(customerId).catch(() => {});
        }
        return { balance: 0, transactions: [] };
    };

    const addMoney = async (amount) => {
        if (!customer?._id) return;
        const numAmount = Number(amount);
        if (numAmount > (walletSettings?.fraudRules?.maxSingleRecharge || 50000)) {
            throw new Error('Limit exceeded');
        }

        const orderRes = await mockApi.post('/billing/razorpay/create-wallet-order', { amount: numAmount });
        if (orderRes.data?.success) {
            await mockApi.post('/loyalty/credit', { amount: numAmount, description: 'Wallet Top-up' });
            await refreshWallet(customer._id);
            return { success: true };
        }
        return { success: false };
    };

    const payWithWallet = async (amount, description) => {
        if (!customer?._id) return;
        const numAmount = Number(amount);
        if (activeWallet.balance < numAmount) throw new Error('Insufficient balance');
        return adminAdjustBalance(customer._id, numAmount, 'DEBIT', description || 'Service Payment');
    };

    const adminAdjustBalance = async (customerId, amount, type, description) => {
        const numAmount = Number(amount);
        if (type === 'CREDIT') {
            await mockApi.post('/loyalty/credit', { customerId, amount: numAmount, description });
        } else {
            await mockApi.post('/loyalty/debit', { customerId, amount: numAmount, description });
        }
        await refreshWallet(customerId);
        return { success: true };
    };

    const bulkRecharge = async (customerIds, amount, description) => {
        for (const id of customerIds) {
            await mockApi.post('/loyalty/credit', { customerId: id, amount: Number(amount), description });
        }
        await Promise.all(customerIds.map(id => refreshWallet(id)));
        return { success: true };
    };

    const totalLiability = Object.values(allWallets).reduce((acc, w) => acc + (Number(w?.balance || 0)), 0);

    const value = useMemo(() => ({
        balance: activeWallet.balance,
        transactions: activeWallet.transactions,
        addMoney,
        payWithWallet,
        loading,
        spentThisMonth,
        totalLiability,
        allWallets,
        walletSettings,
        setWalletSettings,
        adminAdjustBalance,
        bulkRecharge,
        getWallet,
        initializeWallet,
    }), [activeWallet, loading, spentThisMonth, totalLiability, allWallets, walletSettings]);

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
