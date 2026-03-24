import httpStatus from 'http-status-codes';
import posService from './pos.service.js';
import notificationService from '../notification/notification.service.js';

const checkout = async (req, res, next) => {
    try {
        const invoice = await posService.createBilling(req.tenantId, req.body);
        
        // --- Notification ---
        try {
            await notificationService.sendToRole(req.tenantId, 'admin', {
                type: 'pos_checkout',
                title: 'New Sale Completed',
                body: `Invoice #${invoice.invoiceNumber || invoice._id} for ₹${invoice.totalAmount} was generated.`,
                actionUrl: '/admin/invoices',
                data: { invoiceId: invoice._id.toString() }
            });
        } catch (err) {
            console.warn('[POS] Notification failed:', err.message);
        }

        res.status(httpStatus.CREATED).send(invoice);
    } catch (error) {
        next(error);
    }
};

export default {
    checkout,
};
