import invoiceRepository from '../invoice/invoice.repository.js';
import productRepository from '../product/product.repository.js';
import loyaltyService from '../loyalty/loyalty.service.js';
import promotionService from '../promotion/promotion.service.js';
import logger from '../../utils/logger.js';

const generateInvoiceNumber = () => `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

class PosService {
    async createBilling(tenantId, billingData) {
        const {
            clientId,
            items,
            tax = 0,
            paymentMethod,
            useLoyaltyPoints = 0,
            promotionId = null
        } = billingData;

        let subTotal = 0;
        const processedItems = [];

        // 1. Process items and calculate subTotal
        for (const item of items) {
            if (item.type === 'product') {
                const product = await productRepository.findOne({ _id: item.itemId, tenantId });
                if (!product) throw new Error(`Product ${item.itemId} not found`);
                if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

                product.stock -= item.quantity;
                await product.save();

                const total = product.price * item.quantity;
                subTotal += total;
                processedItems.push({
                    type: 'product',
                    itemId: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    total: total
                });
            } else if (item.type === 'service') {
                const total = item.price * item.quantity;
                subTotal += total;
                processedItems.push({ ...item, total });
            }
        }

        let discount = 0;

        // 2. Apply Promotion if any
        if (promotionId) {
            const promo = await promotionService.validatePromotion(tenantId, promotionId, subTotal);
            discount += await promotionService.applyDiscount(promo, subTotal);
        }

        // 3. Apply Loyalty Points Redemption
        if (useLoyaltyPoints > 0) {
            // Note: Temporary invoiceId for redemption, will update after creation
            const loyaltyDiscount = await loyaltyService.redeemPoints(tenantId, clientId, useLoyaltyPoints, null);
            discount += loyaltyDiscount;
        }

        const total = subTotal + tax - discount;

        // 4. Create Invoice
        const invoice = await invoiceRepository.create({
            invoiceNumber: generateInvoiceNumber(),
            tenantId,
            clientId,
            items: processedItems,
            subTotal,
            tax,
            discount,
            total,
            paymentStatus: 'paid',
            paymentMethod,
        });

        // 5. Earn Loyalty Points for the PAID invoice
        try {
            // Logic: Points earned on final total after discounts? 
            // Requirements say: "Reward repeat customers"
            await loyaltyService.earnPoints(tenantId, clientId, invoice._id, total);
        } catch (error) {
            logger.error('Failed to earn loyalty points:', error);
            // Don't fail the whole transaction if earn points fails, but log it
        }

        return invoice;
    }
}

export default new PosService();
