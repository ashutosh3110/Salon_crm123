import { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
    const { customer } = useCustomerAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load from localStorage (simulating backend)
    useEffect(() => {
        if (customer?._id) {
            const storedWallet = localStorage.getItem(`wallet_${customer._id}`);
            if (storedWallet) {
                const data = JSON.parse(storedWallet);
                setBalance(data.balance);
                setTransactions(data.transactions);
            } else {
                // Default initial balance for new/mock users
                const initialData = {
                    balance: 1500,
                    transactions: [
                        {
                            id: 'tx-101',
                            type: 'CREDIT',
                            amount: 1500,
                            description: 'Welcome Bonus',
                            date: new Date(Date.now() - 86400000 * 2).toISOString(),
                            status: 'COMPLETED'
                        }
                    ]
                };
                setBalance(initialData.balance);
                setTransactions(initialData.transactions);
                localStorage.setItem(`wallet_${customer._id}`, JSON.stringify(initialData));
            }
        }
        setLoading(false);
    }, [customer]);

    const addMoney = async (amount) => {
        const newTx = {
            id: `tx-${Date.now()}`,
            type: 'CREDIT',
            amount: Number(amount),
            description: 'Wallet Top-up',
            date: new Date().toISOString(),
            status: 'COMPLETED'
        };
        const newBalance = balance + Number(amount);
        const updatedTxs = [newTx, ...transactions];

        setBalance(newBalance);
        setTransactions(updatedTxs);

        if (customer?._id) {
            localStorage.setItem(`wallet_${customer._id}`, JSON.stringify({
                balance: newBalance,
                transactions: updatedTxs
            }));
        }
        return { success: true };
    };

    const payWithWallet = async (amount, description) => {
        if (balance < amount) throw new Error('Insufficient wallet balance');

        const newTx = {
            id: `tx-${Date.now()}`,
            type: 'DEBIT',
            amount: Number(amount),
            description: description || 'Service Payment',
            date: new Date().toISOString(),
            status: 'COMPLETED'
        };
        const newBalance = balance - Number(amount);
        const updatedTxs = [newTx, ...transactions];

        setBalance(newBalance);
        setTransactions(updatedTxs);

        if (customer?._id) {
            localStorage.setItem(`wallet_${customer._id}`, JSON.stringify({
                balance: newBalance,
                transactions: updatedTxs
            }));
        }
        return { success: true };
    };

    return (
        <WalletContext.Provider value={{ balance, transactions, addMoney, payWithWallet, loading }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) throw new Error('useWallet must be used within WalletProvider');
    return context;
}
