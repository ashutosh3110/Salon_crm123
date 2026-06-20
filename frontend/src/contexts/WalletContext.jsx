import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useCustomerAuth } from './CustomerAuthContext';
import { useBusiness } from './BusinessContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const WalletContext = createContext(null);

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

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
    const [outletBalances, setOutletBalances] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [customerWallets, setCustomerWallets] = useState({});
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        if (!customer) {
            setBalance(0);
            setOutletBalances([]);
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
                        outletBalances: c.outletWallets || [],
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
            if (res.data.success && res.data.data) {
                const data = res.data.data;
                setBalance(data.balance || 0);
                setOutletBalances(data.outletBalances || []);
                setTransactions((data.transactions || []).map(tx => ({
                    ...tx,
                    id: tx.id || tx._id,
                    date: tx.date || tx.createdAt
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

    const verifyWalletTopup = async (paymentId, orderId, signature, amount, outletId) => {
        const res = await api.post('/wallet/topup/verify', {
            razorpayPaymentId: paymentId,
            razorpayOrderId: orderId,
            razorpaySignature: signature,
            amount: amount,
            outletId: outletId
        });
        if (res.data.success) {
            await refreshWallet();
        }
        return res.data;
    };

    const addMoney = async (amount, outletId) => {
        return new Promise(async (resolve) => {
            try {
                // 1. Load Razorpay Script
                const isLoaded = await loadRazorpayScript();
                if (!isLoaded) {
                    toast.error('Razorpay SDK failed to load. Check your connection.');
                    return resolve({ success: false });
                }

                // 2. Create Order
                const orderRes = await createWalletOrder(amount);
                if (!orderRes.success) {
                    toast.error(orderRes.message || 'Failed to create payment order');
                    return resolve({ success: false });
                }

                const order = orderRes.order;

                // 3. Open Razorpay Options
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'Salon Wallet Topup',
                    description: `Adding ₹${amount} to your wallet`,
                    order_id: order.id,
                    handler: async (response) => {
                        try {
                            const verifyRes = await verifyWalletTopup(
                                response.razorpay_payment_id,
                                response.razorpay_order_id,
                                response.razorpay_signature,
                                amount,
                                outletId
                            );
                            if (verifyRes.success) {
                                toast.success('Wallet recharged successfully!');
                                await refreshWallet();
                                resolve({ success: true });
                            } else {
                                toast.error(verifyRes.message || 'Verification failed');
                                resolve({ success: false });
                            }
                        } catch (err) {
                            console.error('Verification error:', err);
                            toast.error('Payment verification failed');
                            resolve({ success: false });
                        }
                    },
                    prefill: {
                        name: customer?.name || '',
                        email: customer?.email || '',
                        contact: customer?.phone || ''
                    },
                    theme: {
                        color: '#C8956C'
                    },
                    modal: {
                        ondismiss: () => {
                            resolve({ success: false, message: 'Payment cancelled' });
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (err) {
                console.error('Add money flow failed:', err);
                toast.error('Could not initialize payment');
                resolve({ success: false, message: err.message });
            }
        });
    };

    // Admin/Staff Functions
    const bulkRecharge = async (customerIds, amount, note, expiryDate = null, outletId = null) => {
        try {
            const res = await api.post('/wallet/bulk-recharge', { customerIds, amount, note, expiryDate, outletId });
            return res.data;
        } catch (err) {
            console.error('Bulk recharge failed:', err);
            return { success: false, message: err.response?.data?.message || err.message };
        }
    };

    const adminAdjustBalance = async (customerId, amount, type, note, expiryDate = null, outletId = null) => {
        try {
            // We can use bulkRecharge for single adjustment too, or if there's a specific endpoint
            // For now, using bulkRecharge pattern since it's available
            const res = await api.post('/wallet/bulk-recharge', { 
                customerIds: [customerId], 
                amount: type === 'DEBIT' ? -amount : amount, 
                note,
                expiryDate,
                outletId
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
            if (res.data?.success && res.data?.data) {
                const data = res.data.data;
                setCustomerWallets(prev => ({
                    ...prev,
                    [customerId]: {
                        balance: data.balance || 0,
                        outletBalances: data.outletBalances || [],
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

    const transferWalletBalance = async (customerId, fromOutletId, toOutletId, amount) => {
        try {
            const res = await api.post('/wallet/transfer', { customerId, fromOutletId, toOutletId, amount });
            if (res.data?.success) {
                await initializeWallet(customerId);
            }
            return res.data;
        } catch (err) {
            console.error('Transfer failed:', err);
            return { success: false, message: err.response?.data?.message || err.message };
        }
    };

    const getWallet = useCallback((customerId) => {
        if (!customerId) return { balance: 0, transactions: [], loyaltyPoints: 0 };
        return customerWallets[customerId] || { balance: 0, transactions: [], loyaltyPoints: 0 };
    }, [customerWallets]);

    const value = useMemo(() => ({
        balance,
        outletBalances,
        transactions,
        loading,
        allWallets,
        customerWallets,
        getWallet,
        refreshWallet,
        addMoney,
        createWalletOrder,
        verifyWalletTopup,
        bulkRecharge,
        adminAdjustBalance,
        transferWalletBalance,
        initializeWallet,
        spentThisMonth: 0,
        walletSettings: loyaltySettings
    }), [balance, outletBalances, transactions, loading, allWallets, customerWallets, getWallet, refreshWallet, loyaltySettings, addMoney]);

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
