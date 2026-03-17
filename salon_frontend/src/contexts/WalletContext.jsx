import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';
import walletData from '../data/walletData.json';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
    const { customer } = useCustomerAuth();
    
    // Global wallets store: { [customerId]: { balance, transactions } }
    const [allWallets, setAllWallets] = useState(walletData.mockWallets);
    const [loading, setLoading] = useState(true);

    const [walletSettings, setWalletSettings] = useState(walletData.walletSettings);

    // Initial load of ALL wallets and settings from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('global_wallets');
        if (stored) {
            setAllWallets(JSON.parse(stored));
        }

        const storedSettings = localStorage.getItem('wallet_settings');
        if (storedSettings) {
            setWalletSettings(JSON.parse(storedSettings));
        }
        setLoading(false);
    }, []);

    // Sync to localStorage
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('global_wallets', JSON.stringify(allWallets));
            localStorage.setItem('wallet_settings', JSON.stringify(walletSettings));
        }
    }, [allWallets, walletSettings, loading]);

    // Active customer's wallet data (for App side)
    const activeWallet = allWallets[customer?._id] || {
        balance: 0,
        transactions: []
    };

    // Calculate Month-to-date spending
    const spentThisMonth = useMemo(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return activeWallet.transactions
            .filter(tx => tx.type === 'DEBIT' && new Date(tx.date) >= firstDay)
            .reduce((acc, tx) => acc + tx.amount, 0);
    }, [activeWallet.transactions]);

    const initializeWallet = (customerId) => {
        if (allWallets[customerId]) return;
        
        const initialData = {
            balance: 1500, // Welcome Bonus
            transactions: [
                {
                    id: `tx-init-${Date.now()}`,
                    type: 'CREDIT',
                    amount: 1500,
                    description: 'Welcome Bonus',
                    date: new Date().toISOString(),
                    status: 'COMPLETED'
                }
            ]
        };
        
        setAllWallets(prev => ({
            ...prev,
            [customerId]: initialData
        }));
    };

    const addMoney = async (amount) => {
        if (!customer?._id) return;
        const numAmount = Number(amount);
        
        // Security Check from Settings
        if (numAmount > (walletSettings.fraudRules.maxSingleRecharge || 50000)) {
            throw new Error(`Transaction limit exceeded. Maximum per recharge is ₹${walletSettings.fraudRules.maxSingleRecharge}`);
        }

        // Apply Bonuses (Dynamic from Settings)
        let bonus = 0;
        const sortedOffers = [...walletSettings.offers]
            .filter(o => o.isActive && numAmount >= o.minAdd)
            .sort((a, b) => b.minAdd - a.minAdd);
        
        if (sortedOffers.length > 0) {
            bonus = sortedOffers[0].extra;
        }

        await adminAdjustBalance(customer._id, numAmount, 'CREDIT', 'Wallet Top-up');
        
        if (bonus > 0) {
            await adminAdjustBalance(customer._id, bonus, 'CREDIT', 'Recharge Loyalty Bonus');
        }
        
        return { success: true, bonus };
    };

    const payWithWallet = async (amount, description) => {
        if (!customer?._id) return;
        if (activeWallet.balance < amount) throw new Error('Insufficient wallet balance');
        return adminAdjustBalance(customer._id, amount, 'DEBIT', description || 'Service Payment');
    };

    // --- ADMIN OPERATIONS ---

    const adminAdjustBalance = async (customerId, amount, type, description) => {
        const wallet = allWallets[customerId] || { balance: 0, transactions: [] };
        
        // Security: Max Daily Debit Check
        if (type === 'DEBIT') {
            const today = new Date().toISOString().split('T')[0];
            const spentToday = (wallet.transactions || [])
                .filter(tx => tx.type === 'DEBIT' && tx.date.startsWith(today))
                .reduce((acc, tx) => acc + tx.amount, 0);
            
            if (spentToday + Number(amount) > (walletSettings.fraudRules.maxDailyDebit || 5000)) {
                throw new Error(`Daily debit limit reached (₹${walletSettings.fraudRules.maxDailyDebit}). Transaction blocked for security.`);
            }
        }

        const newTx = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type,
            amount: Number(amount),
            description: description || (type === 'CREDIT' ? 'Admin Credit' : 'Admin Debit'),
            date: new Date().toISOString(),
            status: 'COMPLETED',
            isAdminAction: true
        };

        const newBalance = type === 'CREDIT' 
            ? wallet.balance + Number(amount)
            : wallet.balance - Number(amount);

        setAllWallets(prev => ({
            ...prev,
            [customerId]: {
                balance: newBalance,
                transactions: [newTx, ...wallet.transactions]
            }
        }));

        // Mock WhatsApp Notification
        console.log(`[WhatsApp API Mock] Notification sent to customer ${customerId}: Your wallet has been ${type === 'CREDIT' ? 'credited' : 'debited'} with ₹${amount}. New balance: ₹${newBalance}`);
        
        return { success: true };
    };

    const bulkRecharge = async (customerIds, amount, description) => {
        setAllWallets(prev => {
            const updated = { ...prev };
            customerIds.forEach(id => {
                const wallet = updated[id] || { balance: 0, transactions: [] };
                const newTx = {
                    id: `tx-bulk-${Date.now()}-${id.substr(-4)}`,
                    type: 'CREDIT',
                    amount: Number(amount),
                    description: description || 'Bulk Promotional Credit',
                    date: new Date().toISOString(),
                    status: 'COMPLETED',
                    isBulk: true
                };
                updated[id] = {
                    balance: wallet.balance + Number(amount),
                    transactions: [newTx, ...wallet.transactions]
                };
            });
            return updated;
        });

        console.log(`[WhatsApp API Mock] Bulk notification sent to ${customerIds.length} customers for ₹${amount} credit.`);
        return { success: true };
    };

    const getWallet = (customerId) => {
        return allWallets[customerId] || { balance: 0, transactions: [] };
    };

    return (
        <WalletContext.Provider value={{ 
            balance: activeWallet.balance, 
            transactions: activeWallet.transactions, 
            addMoney, 
            payWithWallet, 
            loading,
            spentThisMonth,
            totalLiability: Object.values(allWallets).reduce((acc, w) => acc + (w.balance || 0), 0),
            // Admin exports
            allWallets,
            walletSettings,
            setWalletSettings,
            adminAdjustBalance,
            bulkRecharge,
            getWallet,
            initializeWallet
        }}>
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
            adminAdjustBalance: () => {},
            bulkRecharge: () => {},
            getWallet: () => ({ balance: 0, transactions: [] }),
            initializeWallet: () => {}
        };
    }
    return context;
}
