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
exports.addCredit = async (customerId, salonId, amount, description, expiryDate = null) => {
    const numericAmount = Number(amount);
    
    // 1. Create Transaction
    const transaction = await WalletTransaction.create({
        customerId,
        salonId,
        amount: numericAmount,
        remainingAmount: numericAmount,
        type: 'CREDIT',
        description,
        expiryDate,
        status: 'COMPLETED'
    });

    // 2. Update Customer Balance
    await Customer.findByIdAndUpdate(customerId, {
        $inc: { walletBalance: numericAmount }
    });

    return transaction;
};

/**
 * Deducts amount from customer's wallet balance using FIFO on credits.
 * @param {string} customerId 
 * @param {number} amount 
 * @param {string} description 
 */
exports.spendWallet = async (customerId, amount, description, createdAt = null) => {
    const numericAmount = Number(amount);
    if (numericAmount <= 0) return null;

    // 1. Check total balance first
    const customer = await Customer.findById(customerId);
    if (!customer || (customer.walletBalance || 0) < numericAmount) {
        throw new Error('Insufficient wallet balance');
    }

    // 2. Find valid credits (not expired, has remaining amount)
    // Sort by createdAt (FIFO) - we spend oldest first
    const now = new Date();
    const validCredits = await WalletTransaction.find({
        customerId,
        type: 'CREDIT',
        status: 'COMPLETED',
        remainingAmount: { $gt: 0 },
        $or: [
            { expiryDate: null },
            { expiryDate: { $gt: now } }
        ]
    }).sort({ createdAt: 1 });

    let remainingToDeduct = numericAmount;
    
    for (const credit of validCredits) {
        if (remainingToDeduct <= 0) break;

        const deductFromThis = Math.min(credit.remainingAmount, remainingToDeduct);
        credit.remainingAmount -= deductFromThis;
        remainingToDeduct -= deductFromThis;
        await credit.save();
    }

    // 3. Update customer balance
    customer.walletBalance -= numericAmount;
    await customer.save();

    // 4. Create DEBIT transaction
    const debitTx = await WalletTransaction.create({
        customerId,
        amount: numericAmount,
        type: 'DEBIT',
        description,
        status: 'COMPLETED',
        createdAt: createdAt ? new Date(createdAt) : new Date()
    });

    return debitTx;
};
