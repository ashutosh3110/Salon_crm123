import inventoryRepository from './inventory.repository.js';
import InventoryTransaction from './inventoryTransaction.model.js';
import Inventory from './inventory.model.js';
import Product from '../product/product.model.js';
import Outlet from '../outlet/outlet.model.js';
import notificationService from '../notification/notification.service.js';

class InventoryService {
    /**
     * Add stock to an outlet (Stock-In)
     */
    async stockIn(tenantId, data) {
        const {
            productId,
            outletId,
            quantity,
            purchasePrice,
            supplierId,
            invoiceRef,
            supplierName,
            performedBy,
            expiryDate,
        } = data;

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

        await InventoryTransaction.create({
            productId,
            outletId,
            tenantId,
            type: 'STOCK_IN',
            quantity,
            reason: 'Supplier Purchase',
            performedBy,
            purchasePrice: purchasePrice != null ? Number(purchasePrice) : undefined,
            invoiceRef: invoiceRef || undefined,
            supplierName: supplierName || undefined,
            expiryDate: expiryDate || undefined,
        });

        return inventory;
    }

    /**
     * Paginated stock-in log for admin (Inward History).
     */
    async listStockInHistory(tenantId, query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(200, Math.max(1, parseInt(query.limit, 10) || 100));
        const skip = (page - 1) * limit;
        const filter = { tenantId, type: 'STOCK_IN' };
        const [results, totalResults] = await Promise.all([
            InventoryTransaction.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('productId', 'name sku category')
                .populate('outletId', 'name')
                .populate('performedBy', 'name email')
                .lean(),
            InventoryTransaction.countDocuments(filter),
        ]);
        return {
            results,
            page,
            limit,
            totalResults,
            totalPages: Math.ceil(totalResults / limit) || 1,
        };
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

        // --- Notifications for Low Stock ---
        try {
            const threshold = inventory.lowStockThreshold || 5;
            if (inventory.quantity <= threshold) {
                const product = await Product.findById(productId).select('name');
                const outlet = await Outlet.findById(outletId).select('name');
                const status = inventory.quantity <= threshold * 0.5 ? 'Critical' : 'Low Stock';
                
                await notificationService.sendToRole(tenantId, 'admin', {
                    type: 'inventory_low',
                    title: `Stock Alert: ${status}`,
                    body: `${product?.name || 'Product'} is at ${inventory.quantity} units in ${outlet?.name || 'outlet'}. threshold: ${threshold}`,
                    actionUrl: '/admin/inventory/alerts',
                    data: { productId: productId.toString(), outletId: outletId.toString() }
                });
            }
        } catch (err) {
            console.warn('[Inventory] Notification failed:', err.message);
        }

        return inventory;
    }

    /**
     * Manual Stock Adjustment
     */
    async adjustStock(tenantId, data) {
        const { productId, outletId, quantity, type, reason, performedBy } = data;

        let inventory = await inventoryRepository.findStock(productId, outletId, tenantId);

        if (!inventory) {
            if (type === 'DEDUCT') {
                throw new Error('No stock record at this outlet — add stock (Stock In) first.');
            }
            inventory = await inventoryRepository.create({
                productId,
                outletId,
                tenantId,
                quantity: 0,
            });
        }

        if (type === 'ADD') {
            inventory.quantity += quantity;
        } else {
            if (inventory.quantity < quantity) {
                throw new Error(
                    `Insufficient stock for deduction. Available: ${inventory.quantity}, requested: ${quantity}`
                );
            }
            inventory.quantity -= quantity;
        }

        await inventory.save();

        await InventoryTransaction.create({
            productId,
            outletId,
            tenantId,
            type: 'ADJUSTMENT',
            quantity,
            reason,
            performedBy,
            adjustmentDirection: type,
        });

        // --- Notifications for Low Stock ---
        try {
            const threshold = inventory.lowStockThreshold || 5;
            if (inventory.quantity <= threshold) {
                const product = await Product.findById(productId).select('name');
                const outlet = await Outlet.findById(outletId).select('name');
                const status = inventory.quantity <= threshold * 0.5 ? 'Critical' : 'Low Stock';
                
                await notificationService.sendToRole(tenantId, 'admin', {
                    type: 'inventory_low',
                    title: `Stock Alert: ${status}`,
                    body: `${product?.name || 'Product'} is at ${inventory.quantity} units in ${outlet?.name || 'outlet'}. threshold: ${threshold}`,
                    actionUrl: '/admin/inventory/alerts',
                    data: { productId: productId.toString(), outletId: outletId.toString() }
                });
            }
        } catch (err) {
            console.warn('[Inventory] Notification failed:', err.message);
        }

        return inventory;
    }

    /**
     * Manual adjustment log (stock out / stock add without PO).
     */
    async listAdjustmentHistory(tenantId, query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(200, Math.max(1, parseInt(query.limit, 10) || 100));
        const skip = (page - 1) * limit;
        const filter = { tenantId, type: 'ADJUSTMENT' };
        const [results, totalResults] = await Promise.all([
            InventoryTransaction.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('productId', 'name sku category')
                .populate('outletId', 'name')
                .populate('performedBy', 'name email')
                .lean(),
            InventoryTransaction.countDocuments(filter),
        ]);
        return {
            results,
            page,
            limit,
            totalResults,
            totalPages: Math.ceil(totalResults / limit) || 1,
        };
    }

    /**
     * All inventory rows for one outlet (full list — used by admin to merge stock into product list).
     * Returns a plain array (not paginated).
     */
    async getOutletStock(tenantId, outletId) {
        const rows = await Inventory.find({ tenantId, outletId })
            .populate('productId', 'name sku category')
            .sort({ updatedAt: -1 })
            .lean();
        return rows;
    }

    /**
     * Per-product, per-outlet stock grid for admin Stock overview (tenant-scoped).
     */
    async getStockOverview(tenantId) {
        const outlets = await Outlet.find({ tenantId }).select('name').sort({ name: 1 }).lean();
        const products = await Product.find({ tenantId }).select('name sku category status').sort({ name: 1 }).lean();
        const invRows = await Inventory.find({ tenantId }).lean();

        const qtyByPair = {};
        const thresholdByPair = {};
        for (const row of invRows) {
            const k = `${row.productId.toString()}_${row.outletId.toString()}`;
            qtyByPair[k] = row.quantity ?? 0;
            thresholdByPair[k] = row.lowStockThreshold ?? 5;
        }

        const lines = [];

        if (outlets.length === 0) {
            for (const p of products) {
                lines.push({
                    productId: p._id,
                    name: p.name,
                    sku: p.sku,
                    category: p.category || '',
                    status: p.status,
                    outletId: null,
                    outletName: 'No outlet',
                    quantity: 0,
                    threshold: 5,
                    stockStatus: 'No outlet',
                });
            }
        } else {
            for (const p of products) {
                for (const o of outlets) {
                    const k = `${p._id.toString()}_${o._id.toString()}`;
                    const quantity = qtyByPair[k] ?? 0;
                    const threshold = thresholdByPair[k] ?? 5;
                    let stockStatus = 'In Stock';
                    if (quantity <= threshold * 0.5) stockStatus = 'Critical';
                    else if (quantity <= threshold) stockStatus = 'Low Stock';

                    lines.push({
                        productId: p._id,
                        name: p.name,
                        sku: p.sku,
                        category: p.category || '',
                        status: p.status,
                        outletId: o._id,
                        outletName: o.name,
                        quantity,
                        threshold,
                        stockStatus,
                    });
                }
            }
        }

        return {
            outlets: outlets.map((o) => ({ _id: o._id, name: o.name })),
            lines,
            summary: {
                skuCount: products.length,
                outletCount: outlets.length,
                lineCount: lines.length,
            },
        };
    }

    /**
     * Rows where qty is at or below outlet threshold (Low Stock / Critical).
     */
    async getLowStockAlerts(tenantId) {
        const overview = await this.getStockOverview(tenantId);
        const lines = overview.lines || [];
        const alerts = lines.filter(
            (l) => l.stockStatus === 'Critical' || l.stockStatus === 'Low Stock'
        );
        const stableSample = lines
            .filter((l) => l.stockStatus === 'In Stock')
            .slice(0, 6);
        return {
            alerts: alerts.map((a) => ({
                productId: a.productId,
                outletId: a.outletId,
                name: a.name,
                sku: a.sku,
                category: a.category,
                outletName: a.outletName,
                quantity: a.quantity,
                threshold: a.threshold,
                stockStatus: a.stockStatus,
            })),
            stableSample: stableSample.map((a) => ({
                productId: a.productId,
                outletId: a.outletId,
                name: a.name,
                sku: a.sku,
                outletName: a.outletName,
                quantity: a.quantity,
                threshold: a.threshold,
            })),
            summary: {
                total: alerts.length,
                critical: alerts.filter((a) => a.stockStatus === 'Critical').length,
                low: alerts.filter((a) => a.stockStatus === 'Low Stock').length,
            },
        };
    }
}

export default new InventoryService();
