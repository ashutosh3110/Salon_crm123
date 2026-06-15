const WalletTransaction = require('../Models/WalletTransaction');
const Customer = require('../Models/Customer');

/**
 * Adds credit to a customer's wallet.
 * @param {string} customerId 
 * @param {string} salonId 
 * @param {number} amount 
 * @param {string} description 
 * @param {Date|null} expiryDate - Optional expiry date for promotional credits
 */
exports.addCredit = async (customerId, salonId, outletId, amount, description, expiryDate = null) => {
    const numericAmount = Number(amount);
    
    // 1. Create Transaction
    const transaction = await WalletTransaction.create({
        customerId,
        salonId,
        outletId: outletId || null,
        amount: numericAmount,
        remainingAmount: numericAmount,
        type: 'CREDIT',
        description,
        expiryDate,
        status: 'COMPLETED'
    });

    // 2. Update Customer Balance
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error('Customer not found');

    if (outletId) {
        // Admin-Added (Outlet Wallet)
        let outletWallet = customer.outletWallets.find(w => w.outletId && w.outletId.toString() === outletId.toString());
        if (outletWallet) {
            outletWallet.balance += numericAmount;
        } else {
            customer.outletWallets.push({ outletId, balance: numericAmount });
        }
    } else {
        // Customer Self-Recharge (Global Wallet)
        customer.walletBalance = (customer.walletBalance || 0) + numericAmount;
    }
    
    await customer.save();

    return transaction;
};

/**
 * Deducts amount from customer's wallet balance using FIFO on credits.
 * @param {string} customerId 
 * @param {number} amount 
 * @param {string} description 
 */
exports.spendWallet = async (customerId, outletId, amount, description, createdAt = null) => {
    const numericAmount = Number(amount);
    if (numericAmount <= 0) return null;

    // 1. Check balances
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error('Customer not found');

    let outletWallet = customer.outletWallets.find(w => w.outletId && w.outletId.toString() === outletId.toString());
    const outletBalance = outletWallet ? outletWallet.balance : 0;
    const globalBalance = customer.walletBalance || 0;

    if ((outletBalance + globalBalance) < numericAmount) {
        throw new Error('Insufficient wallet balance (Outlet + Global combined is not enough)');
    }

    // 2. Determine how much to deduct from Outlet vs Global
    let amountFromOutlet = 0;
    let amountFromGlobal = 0;

    if (outletBalance >= numericAmount) {
        amountFromOutlet = numericAmount;
    } else {
        amountFromOutlet = outletBalance;
        amountFromGlobal = numericAmount - outletBalance;
    }

    const now = new Date();

    // 3. Deduct from Outlet Wallet first (if any)
    if (amountFromOutlet > 0) {
        const validOutletCredits = await WalletTransaction.find({
            customerId,
            outletId,
            type: 'CREDIT',
            status: 'COMPLETED',
            remainingAmount: { $gt: 0 },
            $or: [
                { expiryDate: null },
                { expiryDate: { $gt: now } }
            ]
        }).sort({ createdAt: 1 });

        let remainingToDeduct = amountFromOutlet;
        for (const credit of validOutletCredits) {
            if (remainingToDeduct <= 0) break;
            const deductFromThis = Math.min(credit.remainingAmount, remainingToDeduct);
            credit.remainingAmount -= deductFromThis;
            remainingToDeduct -= deductFromThis;
            await credit.save();
        }

        outletWallet.balance -= amountFromOutlet;

        await WalletTransaction.create({
            customerId,
            outletId,
            amount: amountFromOutlet,
            type: 'DEBIT',
            description: description + ' (from Outlet Wallet)',
            status: 'COMPLETED',
            createdAt: createdAt ? new Date(createdAt) : new Date()
        });
    }

    // 4. Deduct from Global Wallet (if needed)
    if (amountFromGlobal > 0) {
        const validGlobalCredits = await WalletTransaction.find({
            customerId,
            outletId: null,
            type: 'CREDIT',
            status: 'COMPLETED',
            remainingAmount: { $gt: 0 },
            $or: [
                { expiryDate: null },
                { expiryDate: { $gt: now } }
            ]
        }).sort({ createdAt: 1 });

        let remainingToDeduct = amountFromGlobal;
        for (const credit of validGlobalCredits) {
            if (remainingToDeduct <= 0) break;
            const deductFromThis = Math.min(credit.remainingAmount, remainingToDeduct);
            credit.remainingAmount -= deductFromThis;
            remainingToDeduct -= deductFromThis;
            await credit.save();
        }

        customer.walletBalance -= amountFromGlobal;

        await WalletTransaction.create({
            customerId,
            outletId: null,
            amount: amountFromGlobal,
            type: 'DEBIT',
            description: description + ' (from Global Wallet)',
            status: 'COMPLETED',
            createdAt: createdAt ? new Date(createdAt) : new Date()
        });
    }

    await customer.save();

    return true;
};
