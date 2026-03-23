import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';
import walletData from '../data/walletData.json';
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

    // Keep mock wallets as fallback (POS screens use mock clients sometimes).
    const [allWallets, setAllWallets] = useState(walletData.mockWallets || {});
    const [loading, setLoading] = useState(true);
    const [walletSettings, setWalletSettings] = useState(walletData.walletSettings);
    const [walletLoadingMap, setWalletLoadingMap] = useState({});

    // Initial load of ALL wallets and settings from localStorage (fallback only).
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

    // Sync to localStorage (fallback only).
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

    const refreshWallet = async (customerId) => {
        if (!customerId) return;

        setWalletLoadingMap(prev => ({ ...prev, [customerId]: true }));
        try {
            const [walletRes, historyRes] = await Promise.all([
                api.get(`/loyalty/wallet/${customerId}`),
                api.get(`/loyalty/history/${customerId}?page=1&limit=50`),
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
        } finally {
            setWalletLoadingMap(prev => ({ ...prev, [customerId]: false }));
        }
    };

    const initializeWallet = async (customerId) => {
        if (!customerId) return;

        if (walletLoadingMap[customerId]) return;

        // Use mock quickly (optional), but still try to sync from backend.
        const mock = walletData.mockWallets?.[customerId];
        if (mock && !allWallets[customerId]) {
            setAllWallets(prev => ({ ...prev, [customerId]: mock }));
        }

        try {
            await refreshWallet(customerId);
        } catch {
            // If backend fails (e.g. POS mock clients), keep mock/fallback.
            setAllWallets(prev => ({
                ...prev,
                [customerId]: prev[customerId] || { balance: 0, transactions: [] },
            }));
        }
    };

    const getWallet = (customerId) => {
        const w = allWallets[customerId];
        if (w) return w;

        // Lazy-load for admin screens.
        if (!walletLoadingMap[customerId]) {
            initializeWallet(customerId).catch(() => {});
        }

        return { balance: 0, transactions: [] };
    };

    const ensureRazorpayLoaded = async () => {
        if (window.Razorpay) return;
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Razorpay SDK load failed'));
            document.body.appendChild(script);
        });
    };

    const addMoney = async (amount) => {
        if (!customer?._id) return;
        const numAmount = Number(amount);
        if (!Number.isFinite(numAmount) || numAmount <= 0) return;

        // Security check from settings
        if (numAmount > (walletSettings?.fraudRules?.maxSingleRecharge || 50000)) {
            throw new Error(`Transaction limit exceeded. Maximum per recharge is ₹${walletSettings.fraudRules.maxSingleRecharge}`);
        }

        // Apply Bonuses (Dynamic from Settings)
        let bonus = 0;
        const sortedOffers = [...(walletSettings.offers || [])]
            .filter(o => o.isActive && numAmount >= o.minAdd)
            .sort((a, b) => b.minAdd - a.minAdd);
        if (sortedOffers.length > 0) bonus = Number(sortedOffers[0].extra || 0);

        await ensureRazorpayLoaded();

        const orderRes = await api.post('/billing/razorpay/create-wallet-order', { amount: numAmount });
        if (!orderRes.data?.success) throw new Error(orderRes.data?.message || 'Failed to create wallet order');

        const { orderId, amount: orderAmount, currency, keyId } = orderRes.data.data;

        await new Promise((resolve, reject) => {
            const options = {
                key: keyId,
                amount: orderAmount,
                currency,
                name: 'Wapixo Salon',
                description: `Wallet recharge`,
                order_id: orderId,
                prefill: {
                    contact: customer?.phone || '',
                    name: customer?.name || '',
                },
                theme: { color: '#C8956C' },
                modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post('/billing/razorpay/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (!verifyRes.data?.success) {
                            throw new Error('Payment verification failed');
                        }

                        // Credit wallet from backend
                        await api.post('/loyalty/credit', {
                            amount: numAmount,
                            description: 'Wallet Top-up',
                        });

                        if (bonus > 0) {
                            await api.post('/loyalty/credit', {
                                amount: bonus,
                                description: 'Recharge Loyalty Bonus',
                            });
                        }

                        await refreshWallet(customer._id);
                        resolve(true);
                    } catch (e) {
                        reject(e);
                    }
                },
            };

            // eslint-disable-next-line no-new
            const rzp = new window.Razorpay(options);
            rzp.open();
        });

        return { success: true, bonus };
    };

    const payWithWallet = async (amount, description) => {
        if (!customer?._id) return;
        const numAmount = Number(amount);
        if (!numAmount) return;
        if (activeWallet.balance < numAmount) throw new Error('Insufficient wallet balance');
        return adminAdjustBalance(customer._id, numAmount, 'DEBIT', description || 'Service Payment');
    };

    const adminAdjustBalance = async (customerId, amount, type, description) => {
        const numAmount = Number(amount);
        if (!customerId || !Number.isFinite(numAmount) || numAmount <= 0) return { success: false };

        if (type === 'CREDIT') {
            await api.post('/loyalty/credit', {
                customerId,
                amount: numAmount,
                description: description || 'Wallet Credit',
            });
        } else if (type === 'DEBIT') {
            await api.post('/loyalty/debit', {
                customerId,
                amount: numAmount,
                description: description || 'Wallet Debit',
            });
        } else {
            throw new Error('Invalid wallet transaction type');
        }

        await refreshWallet(customerId);
        return { success: true };
    };

    const bulkRecharge = async (customerIds, amount, description) => {
        if (!Array.isArray(customerIds) || customerIds.length === 0) return { success: false };
        const numAmount = Number(amount);
        if (!Number.isFinite(numAmount) || numAmount <= 0) return { success: false };

        // Execute sequentially to keep backend load stable.
        // (If you need faster performance, we can add a bulk endpoint.)
        // eslint-disable-next-line no-restricted-syntax
        for (const id of customerIds) {
            // CREDIT only for admin bulk.
            await api.post('/loyalty/credit', {
                customerId: id,
                amount: numAmount,
                description: description || 'Bulk Promotional Credit',
            });
        }

        // Refresh wallets
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
        // Admin exports
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
    const context = useContext(WalletContext);
    if (!context) {
        console.warn('useWallet called outside of WalletProvider. Returning fallback.');
        return {
            balance: 0,
            transactions: [],
            loading: true,
            spentThisMonth: 0,
            totalLiability: 0,
            allWallets: {},
            walletSettings: { offers: [], fraudRules: {} },
            setWalletSettings: () => {},
            adminAdjustBalance: async () => {},
            bulkRecharge: async () => {},
            getWallet: () => ({ balance: 0, transactions: [] }),
            initializeWallet: async () => {},
        };
    }
    return context;
}
