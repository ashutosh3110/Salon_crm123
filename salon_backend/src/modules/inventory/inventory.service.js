import httpStatus from 'http-status-codes';
import inventoryRepository from './inventory.repository.js';
import InventoryTransaction from './inventoryTransaction.model.js';
import logger from '../../utils/logger.js';

class InventoryService {
    /**
     * Add stock to an outlet (Stock-In)
     */
    async stockIn(tenantId, data) {
        const { productId, outletId, quantity, purchasePrice, supplierId, performedBy } = data;

        let inventory = await inventoryRepository.findStock(productId, outletId, tenantId);

        if (!inventory) {
            inventory = await inventoryRepository.create({
                productId,
                outletId,
                tenantId,
                quantity: 0
            });
        }

        inventory.quantity += quantity;
        await inventory.save();

        // Log Transaction
        await InventoryTransaction.create({
            productId,
            outletId,
            tenantId,
            type: 'STOCK_IN',
            quantity,
            reason: 'Supplier Purchase',
            performedBy
        });

        // Finance log would go here (or be triggered by a controller)
        return inventory;
    }

    /**
     * Deduct stock from an outlet (Stock-Out)
     * Used mainly by POS
     */
    async stockOut(tenantId, data, session = null) {
        const { productId, outletId, quantity, invoiceId, performedBy } = data;

        const inventory = await inventoryRepository.findStock(productId, outletId, tenantId);
        if (!inventory || inventory.quantity < quantity) {
            throw new Error(`Insufficient stock for product in this outlet`);
        }

        inventory.quantity -= quantity;
        await inventory.save({ session });

        // Log Transaction
        await InventoryTransaction.create([{
            productId,
            outletId,
            tenantId,
            type: 'STOCK_OUT',
            quantity,
            referenceId: invoiceId,
            reason: 'Sale',
            performedBy
        }], { session });

        return inventory;
    }

    /**
     * Manual Stock Adjustment
     */
    async adjustStock(tenantId, data) {
        const { productId, outletId, quantity, type, reason, performedBy } = data;

        const inventory = await inventoryRepository.findStock(productId, outletId, tenantId);
        if (!inventory) throw new Error('Inventory record not found');

        if (type === 'ADD') {
            inventory.quantity += quantity;
        } else {
            if (inventory.quantity < quantity) throw new Error('Insufficient stock for deduction');
            inventory.quantity -= quantity;
        }

        await inventory.save();

        // Log Transaction
        await InventoryTransaction.create({
            productId,
            outletId,
            tenantId,
            type: 'ADJUSTMENT',
            quantity,
            reason,
            performedBy
        });

        return inventory;
    }

    async getOutletStock(tenantId, outletId) {
        return inventoryRepository.find({ tenantId, outletId });
    }
}

export default new InventoryService();
