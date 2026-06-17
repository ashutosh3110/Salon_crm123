const Product = require('../Models/Product');
const StockTransaction = require('../Models/StockTransaction');
const SupplierInvoice = require('../Models/SupplierInvoice');
const Supplier = require('../Models/Supplier');
const FinanceTransaction = require('../Models/FinanceTransaction');
const StockTransfer = require('../Models/StockTransfer');
const Outlet = require('../Models/Outlet');
const mongoose = require('mongoose');

// @desc    Update product stock (In/Out/Adjustment)
// @route   POST /api/inventory/update-stock
exports.updateStock = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { productId, outletId, type, quantity, reason, referenceId, notes } = req.body;
        const salonId = req.user.salonId;

        let targetOutletId = outletId;
        if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            targetOutletId = req.user.outletId.toString();
        }

        const product = await Product.findById(productId).session(session);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const previousStock = product.stock || 0;

        // Ensure quantity is positive
        const qty = Math.abs(Number(quantity));

        let newStock = previousStock;
        if (type === 'IN') {
            newStock += qty;
        } else if (type === 'OUT' || type === 'ADJUSTMENT') {
            newStock -= qty;
        }

        // Update product total stock
        product.stock = newStock;

        // Update outlet specific stock if targetOutletId provided
        if (targetOutletId) {
            if (!product.stockByOutlet) product.stockByOutlet = new Map();
            const previousOutletStock = product.stockByOutlet.get(targetOutletId.toString()) || 0;
            let newOutletStock = previousOutletStock;
            if (type === 'IN') {
                newOutletStock += qty;
            } else if (type === 'OUT' || type === 'ADJUSTMENT') {
                newOutletStock -= qty;
            }
            product.stockByOutlet.set(targetOutletId.toString(), newOutletStock);

            // Ensure outlet is in outletIds array
            if (!product.outletIds.includes(targetOutletId)) {
                product.outletIds.push(targetOutletId);
            }
        }

        await product.save({ session });

        // Create transaction log
        const stockTxn = await StockTransaction.create([{
            salonId,
            productId,
            outletId: targetOutletId || product.outletIds[0],
            type,
            quantity: qty,
            previousStock: previousStock,
            newStock: newStock,
            reason,
            referenceId,
            performedBy: req.user._id,
            notes
        }], { session });

        // FINANCE INTEGRATION: If this is a purchase, create a supplier invoice
        if (type === 'IN' && reason === 'Purchase' && req.body.supplierId && req.body.purchasePrice) {
            const totalAmount = qty * Number(req.body.purchasePrice);

            const invoice = await SupplierInvoice.create([{
                salonId,
                outletId: targetOutletId,
                supplierId: req.body.supplierId,
                invoiceNumber: referenceId || `PO-${Date.now()}`,
                date: new Date(),
                totalAmount,
                paidAmount: 0,
                balanceAmount: totalAmount,
                status: 'unpaid',
                items: [{
                    productId,
                    quantity: qty,
                    unitPrice: Number(req.body.purchasePrice),
                    totalPrice: totalAmount
                }]
            }], { session });


        }

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: {
                totalStock: newStock,
                product
            }
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('Update stock error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get stock history
// @route   GET /api/inventory/history
exports.getStockHistory = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        let { productId, outletId, type, from, to, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            outletId = req.user.outletId.toString();
        }

        let query = { salonId };
        if (productId) query.productId = productId;
        if (outletId) query.outletId = outletId;
        if (type) query.type = type;

        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = toDate;
            }
        }

        const total = await StockTransaction.countDocuments(query);
        const history = await StockTransaction.find(query)
            .populate('productId', 'name sku')
            .populate('outletId', 'name')
            .populate('performedBy', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: history,
            meta: {
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                total
            }
        });
    } catch (err) {
        console.error('Get stock history error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get low stock products
// @route   GET /api/inventory/low-stock
exports.getLowStockAlerts = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        let query = { salonId };
        if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            query.outletIds = req.user.outletId;
        }
        const products = await Product.find(query).populate('categoryId', 'name');

        let filteredProducts = products;
        if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            const targetOutletId = req.user.outletId.toString();
            filteredProducts = products.filter(p => {
                const outletStock = p.stockByOutlet ? (p.stockByOutlet.get(targetOutletId) || 0) : 0;
                return outletStock <= (p.minStock || 0);
            });
        } else {
            filteredProducts = products.filter(p => (p.stock || 0) <= (p.minStock || 0));
        }

        res.json({
            success: true,
            count: filteredProducts.length,
            data: filteredProducts
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get inventory summary
// @route   GET /api/inventory/summary
exports.getInventorySummary = async (req, res) => {
    try {
        const salonId = req.user.salonId;

        if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            const targetOutletId = req.user.outletId.toString();
            const products = await Product.find({ salonId, outletIds: req.user.outletId });
            
            let totalProducts = products.length;
            let totalStockValue = 0;
            let potentialRevenue = 0;
            let outOfStock = 0;

            products.forEach(p => {
                const oStock = p.stockByOutlet ? (p.stockByOutlet.get(targetOutletId) || 0) : 0;
                totalStockValue += oStock * (p.costPrice || 0);
                potentialRevenue += oStock * (p.sellingPrice || 0);
                if (oStock === 0) {
                    outOfStock += 1;
                }
            });

            return res.json({
                success: true,
                data: { totalProducts, totalStockValue, potentialRevenue, outOfStock }
            });
        }

        const stats = await Product.aggregate([
            { $match: { salonId: new mongoose.Types.ObjectId(salonId) } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalStockValue: { $sum: { $multiply: ["$stock", "$costPrice"] } },
                    potentialRevenue: { $sum: { $multiply: ["$stock", "$sellingPrice"] } },
                    outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } }
                }
            }
        ]);

        const summary = stats[0] || { totalProducts: 0, totalStockValue: 0, potentialRevenue: 0, outOfStock: 0 };

        res.json({
            success: true,
            data: summary
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Transfer stock from one branch to another
// @route   POST /api/inventory/transfer
exports.transferStock = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { productId, fromOutletId, toOutletId, quantity, reason, notes } = req.body;
        const salonId = req.user.salonId;

        if (fromOutletId === toOutletId) {
            return res.status(400).json({ success: false, message: 'Source and destination branches cannot be the same' });
        }

        if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            const userOutletStr = req.user.outletId.toString();
            if (fromOutletId !== userOutletStr && toOutletId !== userOutletStr) {
                return res.status(403).json({ success: false, message: 'You can only transfer stock to or from your assigned outlet' });
            }
        }

        const qty = Math.abs(Number(quantity));
        if (!qty || qty <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid quantity provided' });
        }

        // Fetch Product
        const product = await Product.findById(productId).session(session);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Fetch Outlets to verify and get names
        const fromOutlet = await Outlet.findById(fromOutletId).session(session);
        const toOutlet = await Outlet.findById(toOutletId).session(session);
        if (!fromOutlet || !toOutlet) {
            return res.status(404).json({ success: false, message: 'One or both outlets not found' });
        }

        // Initialize maps if they don't exist
        if (!product.stockByOutlet) {
            product.stockByOutlet = new Map();
        }

        // Check stock levels
        const fromOutletStock = product.stockByOutlet.get(fromOutletId.toString()) || 0;
        const toOutletStock = product.stockByOutlet.get(toOutletId.toString()) || 0;

        if (fromOutletStock < qty) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock in ${fromOutlet.name}. Available: ${fromOutletStock}, Requested: ${qty}`
            });
        }

        // Perform stock updates
        const newFromStock = fromOutletStock - qty;
        const newToStock = toOutletStock + qty;

        product.stockByOutlet.set(fromOutletId.toString(), newFromStock);
        product.stockByOutlet.set(toOutletId.toString(), newToStock);

        // Ensure outlets are in outletIds array
        if (!product.outletIds.includes(fromOutletId)) {
            product.outletIds.push(fromOutletId);
        }
        if (!product.outletIds.includes(toOutletId)) {
            product.outletIds.push(toOutletId);
        }

        // Save updated product
        await product.save({ session });

        // Save Stock Transfer record
        const transfer = await StockTransfer.create([{
            salonId,
            productId,
            fromOutletId,
            toOutletId,
            quantity: qty,
            reason: reason || 'Stock Balancing',
            notes: notes || '',
            performedBy: req.user._id,
            status: 'COMPLETED'
        }], { session });

        const transferId = transfer[0]._id;

        // Log Stock Transaction OUT for source branch
        await StockTransaction.create([{
            salonId,
            productId,
            outletId: fromOutletId,
            type: 'OUT',
            quantity: qty,
            previousStock: fromOutletStock,
            newStock: newFromStock,
            reason: 'Branch Transfer',
            referenceId: transferId.toString(),
            performedBy: req.user._id,
            notes: `Transferred to ${toOutlet.name}`
        }], { session });

        // Log Stock Transaction IN for destination branch
        await StockTransaction.create([{
            salonId,
            productId,
            outletId: toOutletId,
            type: 'IN',
            quantity: qty,
            previousStock: toOutletStock,
            newStock: newToStock,
            reason: 'Branch Transfer',
            referenceId: transferId.toString(),
            performedBy: req.user._id,
            notes: `Transferred from ${fromOutlet.name}`
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Stock transferred successfully',
            data: transfer[0]
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('Transfer stock error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all stock transfer history
// @route   GET /api/inventory/transfers
exports.getTransferHistory = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { productId, fromOutletId, toOutletId, from, to } = req.query;

        let query = { salonId };
        if (productId) query.productId = productId;

        if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.outletId) {
            const userOutletId = req.user.outletId;
            query.$or = [
                { fromOutletId: userOutletId },
                { toOutletId: userOutletId }
            ];
            if (fromOutletId) {
                if (fromOutletId.toString() !== userOutletId.toString()) {
                    return res.json({ success: true, count: 0, data: [] });
                }
                query.fromOutletId = fromOutletId;
            }
            if (toOutletId) {
                if (toOutletId.toString() !== userOutletId.toString()) {
                    return res.json({ success: true, count: 0, data: [] });
                }
                query.toOutletId = toOutletId;
            }
        } else {
            if (fromOutletId) query.fromOutletId = fromOutletId;
            if (toOutletId) query.toOutletId = toOutletId;
        }

        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = toDate;
            }
        }

        const transfers = await StockTransfer.find(query)
            .populate('productId', 'name sku brand')
            .populate('fromOutletId', 'name')
            .populate('toOutletId', 'name')
            .populate('performedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: transfers.length,
            data: transfers
        });
    } catch (err) {
        console.error('Get transfer history error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
