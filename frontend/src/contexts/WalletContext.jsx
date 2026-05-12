import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useCustomerAuth } from './CustomerAuthContext';
import { useBusiness } from './BusinessContext';
import api from '../services/api';

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
                : tx.description || 'Wallet Transaction';

    return {
        id: tx._id || tx.id || Math.random().toString(),
        type,
        amount,
        description,
        date,
        status: 'COMPLETED'
    };
}

export function WalletProvider({ children }) {
    const { customer } = useCustomerAuth();
    const { userSession, isInitializing, customers, loyaltySettings } = useBusiness();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [customerWallets, setCustomerWallets] = useState({});
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        if (!customer) {
            setBalance(0);
            setTransactions([]);
        }
    }, [customer?._id]);

    // Admin/POS Support: Map customers to a wallet dictionary
    const allWallets = useMemo(() => {
        const wallets = {};
        if (Array.isArray(customers)) {
            customers.forEach(c => {
                const id = c._id || c.id;
                if (id) {
                    wallets[id] = {
                        balance: c.walletBalance || 0,
                        loyaltyPoints: c.loyaltyPoints || 0
                    };
                }
            });
        }
        return wallets;
    }, [customers]);

    const refreshWallet = useCallback(async () => {
        if (!customer?._id) return;
        setLoading(true);
        try {
            const res = await api.get('/wallet');
            if (res.data.success) {
                const data = res.data.data;
                setBalance(data.balance || 0);
                setTransactions((data.transactions || []).map(tx => ({
                    ...tx,
                    id: tx._id,
                    date: tx.createdAt
                })));
            }
        } catch (error) {
            console.error('Wallet fetch failed, checking loyalty transactions:', error);
            try {
                const lRes = await api.get('/loyalty/transactions/me');
                if (lRes.data.success) {
                    const ltx = lRes.data.data || [];
                    setTransactions(ltx.map(mapLoyaltyTx));
                }
            } catch (le) {
                console.error('Loyalty fallback failed:', le);
            }
        } finally {
            setLoading(false);
        }
    }, [customer?._id]);

    useEffect(() => {
        if (customer?.walletBalance !== undefined) {
            setBalance(customer.walletBalance);
        }
    }, [customer?.walletBalance]);

    useEffect(() => {
        // Optimization: Use data from initial-data if available
        if (userSession?.wallet) {
            setBalance(userSession.wallet.balance || 0);
            setTransactions((userSession.wallet.transactions || []).map(tx => ({
                ...tx,
                id: tx._id,
                date: tx.createdAt
            })));
            setLoading(false);
            return;
        }

        if (isInitializing) return;

        const isWalletRelated = location.pathname.includes('/checkout') || 
                              location.pathname.includes('/wallet') || 
                              location.pathname.includes('/profile');
        
        if (customer?._id && !location.pathname.startsWith('/superadmin') && isWalletRelated) {
            refreshWallet();
        }
    }, [customer?._id, refreshWallet, userSession?.wallet, location.pathname, isInitializing]);

    const createWalletOrder = async (amount) => {
        const res = await api.post('/wallet/topup/order', { amount });
        return res.data;
    };

    const verifyWalletTopup = async (paymentId, orderId, signature) => {
        const res = await api.post('/wallet/topup/verify', {
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            razorpay_signature: signature
        });
        if (res.data.success) {
            await refreshWallet();
        }
        return res.data;
    };

    // Admin/Staff Functions
    const bulkRecharge = async (customerIds, amount, note) => {
        try {
            const res = await api.post('/wallet/bulk-recharge', { customerIds, amount, note });
            return res.data;
        } catch (err) {
            console.error('Bulk recharge failed:', err);
            return { success: false, message: err.response?.data?.message || err.message };
        }
    };

    const adminAdjustBalance = async (customerId, amount, type, note) => {
        try {
            // We can use bulkRecharge for single adjustment too, or if there's a specific endpoint
            // For now, using bulkRecharge pattern since it's available
            const res = await api.post('/wallet/bulk-recharge', { 
                customerIds: [customerId], 
                amount: type === 'DEBIT' ? -amount : amount, 
                note 
            });
            if (res.data?.success) {
                await initializeWallet(customerId);
            }
            return res.data;
        } catch (err) {
            console.error('Adjust balance failed:', err);
            return { success: false, message: err.response?.data?.message || err.message };
        }
    };

    const initializeWallet = useCallback(async (customerId) => {
        if (!customerId) return;
        try {
            const res = await api.get(`/wallet/customer/${customerId}`);
            if (res.data?.success) {
                const data = res.data.data;
                setCustomerWallets(prev => ({
                    ...prev,
                    [customerId]: {
                        balance: data.balance || 0,
                        transactions: (data.transactions || []).map(tx => ({
                            ...tx,
                            id: tx._id || tx.id,
                            date: tx.createdAt || tx.date
                        })),
                        loyaltyPoints: data.loyaltyPoints || 0
                    }
                }));
                return res.data;
            }
        } catch (err) {
            console.error('Initialize wallet failed:', err);
            return { success: false, message: err.message };
        }
    }, []);

    const getWallet = useCallback((customerId) => {
        if (!customerId) return { balance: 0, transactions: [], loyaltyPoints: 0 };
        return customerWallets[customerId] || { balance: 0, transactions: [], loyaltyPoints: 0 };
    }, [customerWallets]);

    const value = useMemo(() => ({
        balance,
        transactions,
        loading,
        allWallets,
        customerWallets,
        getWallet,
        refreshWallet,
        createWalletOrder,
        verifyWalletTopup,
        bulkRecharge,
        adminAdjustBalance,
        initializeWallet,
        walletSettings: loyaltySettings
    }), [balance, transactions, loading, allWallets, customerWallets, getWallet, refreshWallet, loyaltySettings]);

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) throw new Error('useWallet must be used within a WalletProvider');
    return context;
};
