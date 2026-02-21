import mongoose from 'mongoose';
import invoiceRepository from '../invoice/invoice.repository.js';
import productRepository from '../product/product.repository.js';
import inventoryService from '../inventory/inventory.service.js';
import loyaltyService from '../loyalty/loyalty.service.js';
import promotionService from '../promotion/promotion.service.js';
import Commission from '../hr/commission.model.js';
import Transaction from '../finance/transaction.model.js';
import logger from '../../utils/logger.js';

const generateInvoiceNumber = () => `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

class PosService {
    async createBilling(tenantId, billingData) {
        const {
            clientId,
            outletId,
            items,
            tax = 0,
            paymentMethod,
            useLoyaltyPoints = 0,
            promotionId = null,
            performedBy = null
        } = billingData;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            let subTotal = 0;
            const processedItems = [];
            const commissions = [];

            // 1. Process items (Products & Services)
            for (const item of items) {
                if (item.type === 'product') {
                    const product = await productRepository.findOne({ _id: item.itemId, tenantId }).session(session);
                    if (!product) throw new Error(`Product ${item.itemId} not found`);

                    // Deduct inventory using InventoryService
                    await inventoryService.stockOut(tenantId, {
                        productId: product._id,
                        outletId,
                        quantity: item.quantity,
                        performedBy: performedBy || null
                    }, session);

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
                    processedItems.push({
                        ...item,
                        total,
                        stylistId: item.stylistId || null
                    });

                    // Commission Calculation (Default 10% for now)
                    if (item.stylistId) {
                        const commissionAmount = total * 0.10; // 10% commission
                        commissions.push({
                            staffId: item.stylistId,
                            serviceId: item.itemId,
                            amount: commissionAmount,
                            baseAmount: total,
                            percentage: 10,
                            tenantId
                        });
                    }
                }
            }

            let discount = 0;

            // 2. Apply Promotion
            if (promotionId) {
                const promo = await promotionService.validatePromotion(tenantId, promotionId, subTotal);
                discount += await promotionService.applyDiscount(promo, subTotal);

                // Increment Promotion usage
                promo.usedCount = (promo.usedCount || 0) + 1;
                await promo.save({ session });
            }

            // 3. Apply Loyalty Redemption
            if (useLoyaltyPoints > 0) {
                const loyaltyDiscount = await loyaltyService.redeemPoints(tenantId, clientId, useLoyaltyPoints, null);
                discount += loyaltyDiscount;
            }

            const total = subTotal + tax - discount;

            // 4. Create Invoice
            const invoice = await invoiceRepository.create([{
                invoiceNumber: generateInvoiceNumber(),
                tenantId,
                outletId,
                clientId,
                items: processedItems,
                subTotal,
                tax,
                discount,
                total,
                paymentStatus: 'paid',
                paymentMethod,
                promotionId,
                staffId: performedBy
            }], { session });

            const createdInvoice = invoice[0];

            // Update Stock transactions with Invoice ID (Note: This is already done inside stockOut theoretically if we pass invoiceId, but we didn't have it yet. 
            // In a better flow, we'd update them now or pass a temp ID. For now, let's just ensure logic is solid.)

            // 5. Create Commission Records
            for (const comm of commissions) {
                await Commission.create([{
                    ...comm,
                    invoiceId: createdInvoice._id
                }], { session });
            }

            // 6. Create Finance Transaction
            await Transaction.create([{
                type: 'income',
                amount: total,
                category: 'sales',
                paymentMethod,
                invoiceId: createdInvoice._id,
                description: `Payment for Invoice ${createdInvoice.invoiceNumber}`,
                tenantId
            }], { session });

            // 7. Earn Loyalty Points
            await loyaltyService.earnPoints(tenantId, clientId, createdInvoice._id, total);

            await session.commitTransaction();
            return createdInvoice;

        } catch (error) {
            await session.abortTransaction();
            logger.error('POS Checkout Error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }
}

export default new PosService();
