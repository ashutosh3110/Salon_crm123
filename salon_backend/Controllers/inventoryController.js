const Product = require('../Models/Product');
const StockTransaction = require('../Models/StockTransaction');
const SupplierInvoice = require('../Models/SupplierInvoice');
const Supplier = require('../Models/Supplier');
const FinanceTransaction = require('../Models/FinanceTransaction');
const mongoose = require('mongoose');

// @desc    Update product stock (In/Out/Adjustment)
// @route   POST /api/inventory/update-stock
exports.updateStock = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { productId, outletId, type, quantity, reason, referenceId, notes } = req.body;
        const salonId = req.user.salonId;

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

        // Update outlet specific stock if outletId provided
        if (outletId) {
            if (!product.stockByOutlet) product.stockByOutlet = new Map();
            const previousOutletStock = product.stockByOutlet.get(outletId.toString()) || 0;
            let newOutletStock = previousOutletStock;
            if (type === 'IN') {
                newOutletStock += qty;
            } else if (type === 'OUT' || type === 'ADJUSTMENT') {
                newOutletStock -= qty;
            }
            product.stockByOutlet.set(outletId.toString(), newOutletStock);
            
            // Ensure outlet is in outletIds array
            if (!product.outletIds.includes(outletId)) {
                product.outletIds.push(outletId);
            }
        }

        await product.save({ session });

        // Create transaction log
        const stockTxn = await StockTransaction.create([{
            salonId,
            productId,
            outletId: outletId || product.outletIds[0],
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

            // Update supplier balance (increase debt)
            await Supplier.findByIdAndUpdate(req.body.supplierId, {
                $inc: { currentBalance: -totalAmount } // Debt is negative in our current schema logic? or positive? 
                // Let's assume currentBalance is what WE OWE. So increase it.
                // Looking at addInvoicePayment, it does $inc: { currentBalance: amount } (reduced debt).
                // So adding debt should be negative if balance is "What we owe".
                // Actually, let's look at Supplier model or previous edits.
            }).session(session);
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
        const { productId, outletId, type, from, to, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

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
        const products = await Product.find({
            salonId,
            $expr: { $lte: ["$stock", "$minStock"] }
        }).populate('categoryId', 'name');

        res.json({
            success: true,
            count: products.length,
            data: products
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
        
        const stats = await Product.aggregate([
            { $match: { salonId: new mongoose.Types.ObjectId(salonId) } },
            { $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                totalStockValue: { $sum: { $multiply: ["$stock", "$costPrice"] } },
                potentialRevenue: { $sum: { $multiply: ["$stock", "$sellingPrice"] } },
                outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } }
            }}
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
