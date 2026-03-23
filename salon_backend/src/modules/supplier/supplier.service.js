import mongoose from 'mongoose';
import Supplier from './supplier.model.js';
import InventoryTransaction from '../inventory/inventoryTransaction.model.js';
import SupplierInvoicePayment from './supplierInvoicePayment.model.js';

function toObjectId(tenantId) {
    if (!tenantId) return null;
    try {
        return new mongoose.Types.ObjectId(String(tenantId));
    } catch {
        return null;
    }
}

function mapDoc(doc) {
    if (!doc) return null;
    const o = doc.toObject ? doc.toObject() : doc;
    return {
        id: String(o._id),
        _id: o._id,
        name: o.name,
        contact: o.contact || '',
        gstin: o.gstin || '',
        phone: o.phone || '',
        email: o.email || '',
        address: o.address || '',
        due: typeof o.due === 'number' ? o.due : 0,
        status: o.status || 'Active',
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
    };
}

async function listSuppliers(tenantId) {
    const tid = toObjectId(tenantId);
    if (!tid) return [];
    const rows = await Supplier.find({ tenantId: tid }).sort({ updatedAt: -1 }).lean();
    return rows.map((r) => mapDoc(r));
}

async function createSupplier(tenantId, payload) {
    const tid = toObjectId(tenantId);
    if (!tid) {
        const err = new Error('Tenant context required');
        err.statusCode = 400;
        throw err;
    }
    const doc = await Supplier.create({
        tenantId: tid,
        name: payload.name,
        contact: payload.contact || '',
        gstin: payload.gstin || '',
        phone: payload.phone || '',
        email: payload.email || '',
        address: payload.address || '',
        due: payload.due != null ? Number(payload.due) : 0,
        status: payload.status || 'Active',
    });
    return mapDoc(doc);
}

async function updateSupplier(tenantId, supplierId, payload) {
    const tid = toObjectId(tenantId);
    if (!tid) {
        const err = new Error('Tenant context required');
        err.statusCode = 400;
        throw err;
    }
    const allowed = ['name', 'contact', 'gstin', 'phone', 'email', 'address', 'due', 'status'];
    const update = {};
    for (const k of allowed) {
        if (payload[k] !== undefined) update[k] = payload[k];
    }
    if (update.due != null) update.due = Number(update.due);

    const doc = await Supplier.findOneAndUpdate(
        { _id: supplierId, tenantId: tid },
        { $set: update },
        { new: true, runValidators: true }
    );
    return mapDoc(doc);
}

async function deleteSupplier(tenantId, supplierId) {
    const tid = toObjectId(tenantId);
    if (!tid) {
        const err = new Error('Tenant context required');
        err.statusCode = 400;
        throw err;
    }
    await Supplier.deleteOne({ _id: supplierId, tenantId: tid });
}

const DEFAULT_DUE_DAYS = 30;
const MS_PER_DAY = 86400000;

/**
 * Supplier invoices = aggregated STOCK_IN lines (same invoice ref + supplier) or one row per ad-hoc stock-in.
 */
async function listSupplierInvoices(tenantId) {
    const tid = toObjectId(tenantId);
    if (!tid) return { results: [] };

    const pipeline = [
        { $match: { tenantId: tid, type: 'STOCK_IN' } },
        {
            $addFields: {
                groupKey: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: ['$invoiceRef', null] },
                                { $ne: ['$invoiceRef', ''] },
                            ],
                        },
                        then: {
                            $concat: [
                                'INV:',
                                { $ifNull: ['$invoiceRef', ''] },
                                '::',
                                { $ifNull: ['$supplierName', 'Unknown'] },
                            ],
                        },
                        else: { $concat: ['TXN:', { $toString: '$_id' }] },
                    },
                },
            },
        },
        {
            $group: {
                _id: '$groupKey',
                supplierName: { $first: { $ifNull: ['$supplierName', 'Unknown'] } },
                invoiceRef: { $first: '$invoiceRef' },
                invoiceDate: { $min: '$createdAt' },
                amount: {
                    $sum: {
                        $multiply: ['$quantity', { $ifNull: ['$purchasePrice', 0] }],
                    },
                },
                lineCount: { $sum: 1 },
            },
        },
        { $sort: { invoiceDate: -1 } },
    ];

    const groups = await InventoryTransaction.aggregate(pipeline);

    const paymentAgg = await SupplierInvoicePayment.aggregate([
        { $match: { tenantId: tid } },
        { $group: { _id: '$invoiceKey', paidAmount: { $sum: '$amount' } } },
    ]);
    const paidByKey = Object.fromEntries(
        paymentAgg.map((p) => [p._id, Number(p.paidAmount) || 0])
    );

    const now = Date.now();
    const results = (groups || []).map((g) => {
        const invoiceKey = g._id;
        const totalAmount = Number(g.amount) || 0;
        const paidAmount = Number(paidByKey[invoiceKey] || 0);
        const outstanding = Math.max(0, totalAmount - paidAmount);
        const invoiceDate = g.invoiceDate ? new Date(g.invoiceDate) : new Date();
        const dueDate = new Date(invoiceDate.getTime() + DEFAULT_DUE_DAYS * MS_PER_DAY);

        let status = 'Pending';
        if (totalAmount <= 0 && paidAmount <= 0) {
            status = 'Pending';
        } else if (outstanding <= 0.009) {
            status = 'Paid';
        } else if (paidAmount > 0) {
            status = 'Partial';
        } else if (dueDate.getTime() < now) {
            status = 'Overdue';
        } else {
            status = 'Pending';
        }

        const isAdHoc = String(invoiceKey).startsWith('TXN:');
        const displayInvoiceNo = isAdHoc
            ? `Ad-hoc (${g.lineCount} line${g.lineCount === 1 ? '' : 's'})`
            : String(g.invoiceRef || '').trim() || '—';

        return {
            invoiceKey,
            supplierName: g.supplierName,
            invoiceNo: displayInvoiceNo,
            invoiceRef: g.invoiceRef || null,
            invoiceDate: invoiceDate.toISOString(),
            dueDate: dueDate.toISOString(),
            amount: totalAmount,
            paidAmount,
            outstanding,
            status,
            lineCount: g.lineCount,
            isAdHoc,
        };
    });

    return { results };
}

async function getInvoiceTotalsByKey(tenantId, invoiceKey) {
    const tid = toObjectId(tenantId);
    if (!tid) return null;
    const { results } = await listSupplierInvoices(tenantId);
    return (results || []).find((r) => r.invoiceKey === invoiceKey) || null;
}

async function recordSupplierInvoicePayment(tenantId, userId, payload) {
    const tid = toObjectId(tenantId);
    if (!tid) {
        const err = new Error('Tenant context required');
        err.statusCode = 400;
        throw err;
    }
    const invoiceKey = String(payload.invoiceKey || '').trim();
    const amount = Number(payload.amount);
    if (!invoiceKey) {
        const err = new Error('invoiceKey is required');
        err.statusCode = 400;
        throw err;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
        const err = new Error('amount must be a positive number');
        err.statusCode = 400;
        throw err;
    }

    const inv = await getInvoiceTotalsByKey(tenantId, invoiceKey);
    if (!inv) {
        const err = new Error('Invoice not found for this key');
        err.statusCode = 404;
        throw err;
    }
    const outstandingBefore = Number(inv.outstanding) || 0;
    if (amount > outstandingBefore + 0.01) {
        const err = new Error(
            `Amount exceeds outstanding (₹${outstandingBefore.toFixed(2)}).`
        );
        err.statusCode = 400;
        throw err;
    }

    const doc = await SupplierInvoicePayment.create({
        tenantId: tid,
        invoiceKey,
        amount,
        note: payload.note != null ? String(payload.note).trim() : '',
        recordedBy: userId || undefined,
    });

    const updated = await getInvoiceTotalsByKey(tenantId, invoiceKey);
    return {
        payment: {
            id: String(doc._id),
            amount: doc.amount,
            note: doc.note,
            createdAt: doc.createdAt,
        },
        invoice: updated,
    };
}

export default {
    listSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    listSupplierInvoices,
    recordSupplierInvoicePayment,
};
