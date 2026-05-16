const cron = require('node-cron');
const WalletTransaction = require('../Models/WalletTransaction');
const Customer = require('../Models/Customer');

/**
 * Cron job to handle wallet balance expiration.
 * Runs every day at midnight.
 */
const startWalletExpiryCron = () => {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Wallet Expiry Cron Job... 🕒');
        try {
            const now = new Date();

            // 1. Find all completed credit transactions that have expired and still have remaining amount
            const expiredTransactions = await WalletTransaction.find({
                type: 'CREDIT',
                status: 'COMPLETED',
                remainingAmount: { $gt: 0 },
                expiryDate: { $lt: now }
            });

            console.log(`Found ${expiredTransactions.length} expired wallet transactions.`);

            for (const tx of expiredTransactions) {
                const amountToExpire = tx.remainingAmount;

                // 2. Subtract the remaining amount from customer's wallet balance
                await Customer.findByIdAndUpdate(tx.customerId, {
                    $inc: { walletBalance: -amountToExpire }
                });

                // 3. Mark transaction as expired and clear remainingAmount
                tx.remainingAmount = 0;
                tx.status = 'EXPIRED';
                await tx.save();

                console.log(`Expired ₹${amountToExpire} for customer ${tx.customerId} from transaction ${tx._id}`);
            }

            console.log('Wallet Expiry Cron Job completed successfully. ✅');
        } catch (error) {
            console.error('Error in Wallet Expiry Cron Job:', error.message);
        }
    });
};

module.exports = { startWalletExpiryCron };
