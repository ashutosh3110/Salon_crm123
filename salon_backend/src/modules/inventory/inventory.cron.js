import cron from 'node-cron';
import InventoryTransaction from './inventoryTransaction.model.js';
import notificationService from '../notification/notification.service.js';
import User from '../user/user.model.js';
import logger from '../../utils/logger.js';

/**
 * Check for products expiring today and notify admins/managers
 */
const checkProductExpiry = async () => {
    logger.info('[Cron] Starting Product Expiry Check...');
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find stock-in transactions where product expires today
        const expiredTransactions = await InventoryTransaction.find({
            type: 'STOCK_IN',
            expiryDate: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('productId', 'name sku');

        if (expiredTransactions.length === 0) {
            logger.info('[Cron] No products expiring today.');
            return;
        }

        // Group by tenant to avoid redundant user fetches
        const tenantGroups = {};
        expiredTransactions.forEach(tx => {
            if (!tenantGroups[tx.tenantId]) tenantGroups[tx.tenantId] = [];
            tenantGroups[tx.tenantId].push(tx);
        });

        for (const [tenantId, transactions] of Object.entries(tenantGroups)) {
            // Find all admins and managers for this tenant
            const recipients = await User.find({
                tenantId,
                role: { $in: ['admin', 'manager'] },
                status: 'active'
            }).select('_id email');

            if (recipients.length === 0) continue;

            for (const tx of transactions) {
                const productName = tx.productId?.name || 'Unknown Product';
                const sku = tx.productId?.sku || 'N/A';
                
                await notificationService.sendToMany(
                    recipients.map(r => r._id),
                    {
                        tenantId,
                        type: 'PRODUCT_EXPIRY',
                        title: 'Product Expired!',
                        body: `Attention: ${productName} (SKU: ${sku}) has expired today. Please check inventory.`,
                        actionUrl: '/admin/inventory/overview'
                    }
                );
                logger.info(`[Cron] Expiry notification sent for ${productName} in tenant ${tenantId}`);
            }
        }
    } catch (error) {
        logger.error('[Cron] Product Expiry Check Failed:', error);
    }
};

// Run every day at 09:00 AM
const initInventoryCron = () => {
    cron.schedule('0 9 * * *', checkProductExpiry);
    logger.info('[Cron] Inventory Expiry Checker scheduled (Daily at 9 AM)');
    
    // Optional: Run once on startup in development for testing
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        // checkProductExpiry(); 
    }
};

export default initInventoryCron;
