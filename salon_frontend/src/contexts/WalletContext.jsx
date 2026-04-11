import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';
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
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshWallet = useCallback(async () => {
        if (!customer?._id) return;
        setLoading(true);
        try {
            // Get balance from customer profile or dedicated endpoint
            const profileRes = await api.get('/auth/profile');
            if (profileRes.data.success) {
                setBalance(profileRes.data.data.loyaltyPoints || 0);
            }

            // Get transaction history
            const historyRes = await api.get('/loyalty/history');
            if (historyRes.data.success) {
                setTransactions(historyRes.data.data.map(tx => ({
                    id: tx._id,
                    type: tx.type,
                    amount: tx.amount,
                    description: tx.description,
                    date: tx.createdAt,
                    status: 'COMPLETED'
                })));
            }
        } catch (err) {
            console.error('[WalletContext] refresh error:', err);
        } finally {
            setLoading(false);
        }
    }, [customer?._id]);

    useEffect(() => {
        if (customer?._id) {
            refreshWallet();
        }
    }, [customer?._id, refreshWallet]);

    const createWalletOrder = async (amount) => {
        const res = await api.post('/payments/create-wallet-order', { amount });
        return res.data;
    };

    const verifyWalletPayment = async (paymentData) => {
        const res = await api.post('/payments/verify-wallet-payment', paymentData);
        if (res.data.success) {
            await refreshWallet();
        }
        return res.data;
    };

    const spentThisMonth = useMemo(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactions
            .filter(tx => tx.type === 'DEBIT' && new Date(tx.date) >= firstDay)
            .reduce((acc, tx) => acc + Number(tx.amount || 0), 0);
    }, [transactions]);

    const addMoney = async (amount) => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderData = await createWalletOrder(amount);
                if (!orderData?.success) return reject(new Error('Failed to create order'));

                const options = {
                    key: orderData.data.key,
                    amount: orderData.data.amount,
                    currency: orderData.data.currency,
                    name: 'Salon Wallet Top-up',
                    description: `Recharge ₹${amount}`,
                    order_id: orderData.data.orderId,
                    handler: async (response) => {
                        try {
                            const verifyRes = await verifyWalletPayment({
                                ...response,
                                amount: amount
                            });
                            if (verifyRes.success) resolve(verifyRes);
                            else reject(new Error('Verification failed'));
                        } catch (err) {
                            reject(err);
                        }
                    },
                    prefill: {
                        name: customer?.name,
                        email: customer?.email,
                        contact: customer?.phone
                    },
                    theme: { color: '#C8956C' }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (err) {
                reject(err);
            }
        });
    };

    const initializeWallet = useCallback(async () => {
        await refreshWallet();
    }, [refreshWallet]);

    const value = useMemo(() => ({
        balance,
        transactions,
        createWalletOrder,
        verifyWalletPayment,
        addMoney,
        loading,
        refreshWallet,
        spentThisMonth,

        // Admin/POS compatibility
        allWallets: { [customer?._id]: { balance, transactions } },
        getWallet: () => ({ balance, transactions }),
        adminAdjustBalance: async () => ({ success: true }),
        bulkRecharge: async () => ({ success: true }),
        initializeWallet,
        totalLiability: balance
    }), [balance, transactions, loading, refreshWallet, spentThisMonth, customer?._id, initializeWallet]);

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
