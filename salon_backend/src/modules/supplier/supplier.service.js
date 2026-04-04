import mongoose from 'mongoose';
import httpStatus from 'http-status-codes';
import Supplier from './supplier.model.js';
import InventoryTransaction from '../inventory/inventoryTransaction.model.js';
import SupplierInvoicePayment from './supplierInvoicePayment.model.js';
import Transaction from '../finance/transaction.model.js';

function toObjectId(id) {
    if (!id) return null;
    try {
        return new mongoose.Types.ObjectId(String(id));
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
        defaultDueDays: o.defaultDueDays || 30,
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
        err.statusCode = httpStatus.BAD_REQUEST;
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
        defaultDueDays: payload.defaultDueDays || 30,
    });
    return mapDoc(doc);
}

async function updateSupplier(tenantId, supplierId, payload) {
    const tid = toObjectId(tenantId);
    const sid = toObjectId(supplierId);
    if (!tid || !sid) {
        const err = new Error('Tenant and Supplier IDs required');
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
    }
    const allowed = ['name', 'contact', 'gstin', 'phone', 'email', 'address', 'due', 'status', 'defaultDueDays'];
    const update = {};
    for (const k of allowed) {
        if (payload[k] !== undefined) update[k] = payload[k];
    }
    if (update.due != null) update.due = Number(update.due);
    if (update.defaultDueDays != null) update.defaultDueDays = Number(update.defaultDueDays);

    const doc = await Supplier.findOneAndUpdate(
        { _id: sid, tenantId: tid },
        { $set: update },
        { new: true, runValidators: true }
    );
    if (!doc) {
        const err = new Error('Supplier not found');
        err.statusCode = httpStatus.NOT_FOUND;
        throw err;
    }
    return mapDoc(doc);
}

async function deleteSupplier(tenantId, supplierId) {
    const tid = toObjectId(tenantId);
    const sid = toObjectId(supplierId);
    if (!tid || !sid) {
        const err = new Error('Tenant and Supplier IDs required');
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
    }
    await Supplier.deleteOne({ _id: sid, tenantId: tid });
}

const MS_PER_DAY = 86400000;

/**
 * Aggregates STOCK_IN transactions into invoices, factoring in TAX and ATTACHMENTS.
 */
async function listSupplierInvoices(tenantId) {
    const tid = toObjectId(tenantId);
    if (!tid) return { results: [] };

    // Fetch suppliers once for due-date mapping
    const suppliers = await Supplier.find({ tenantId: tid }).lean();
    const supplierMap = Object.fromEntries(suppliers.map(s => [s.name, s]));

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
                attachmentUrl: { $first: '$attachmentUrl' },
                subtotal: {
                    $sum: {
                        $multiply: ['$quantity', { $ifNull: ['$purchasePrice', 0] }],
                    },
                },
                taxTotal: { $sum: { $ifNull: ['$taxAmount', 0] } },
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
        const subtotal = Number(g.subtotal) || 0;
        const taxTotal = Number(g.taxTotal) || 0;
        const totalAmount = Math.round((subtotal + taxTotal) * 100) / 100;
        const paidAmount = Number(paidByKey[invoiceKey] || 0);
        const outstanding = Math.max(0, totalAmount - paidAmount);
        
        const invoiceDate = g.invoiceDate ? new Date(g.invoiceDate) : new Date();
        const sup = supplierMap[g.supplierName];
        const dueDays = sup?.defaultDueDays || 30;
        const dueDate = new Date(invoiceDate.getTime() + dueDays * MS_PER_DAY);

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
            subtotal,
            taxTotal,
            amount: totalAmount,
            paidAmount,
            outstanding,
            status,
            lineCount: g.lineCount,
            isAdHoc,
            attachmentUrl: g.attachmentUrl || '',
        };
    });

    return { results };
}

async function getInvoiceTotalsByKey(tenantId, invoiceKey) {
    const { results } = await listSupplierInvoices(tenantId);
    return (results || []).find((r) => r.invoiceKey === invoiceKey) || null;
}

async function recordSupplierInvoicePayment(tenantId, userId, payload) {
    const tid = toObjectId(tenantId);
    if (!tid) {
        const err = new Error('Tenant context required');
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
    }
    const invoiceKey = String(payload.invoiceKey || '').trim();
    const amount = Number(payload.amount);
    
    if (!invoiceKey || !Number.isFinite(amount) || amount <= 0) {
        const err = new Error('Invoice key and valid positive amount required');
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
    }

    const inv = await getInvoiceTotalsByKey(tenantId, invoiceKey);
    if (!inv) {
        const err = new Error('Invoice not found');
        err.statusCode = httpStatus.NOT_FOUND;
        throw err;
    }

    const outstandingBefore = Number(inv.outstanding) || 0;
    if (amount > outstandingBefore + 0.01) {
        const err = new Error(`Amount exceeds outstanding (₹${outstandingBefore.toFixed(2)}).`);
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
    }

    const doc = await SupplierInvoicePayment.create({
        tenantId: tid,
        invoiceKey,
        amount,
        note: payload.note || '',
        recordedBy: userId || undefined,
    });

    // ── AUTO-SYNC TO FINANCE (EXPENSE) ──
    try {
        await Transaction.create({
            tenantId: tid,
            type: 'expense',
            amount: amount,
            category: 'inventory',
            paymentMethod: payload.paymentMethod || 'online',
            description: `Supplier Pmt - ${inv.supplierName} (Ref: ${inv.invoiceNo})`,
            date: new Date(),
        });
    } catch (err) {
        console.error('Failed to sync to Finance:', err);
    }

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

/**
 * Returns a full history of Debits (Invoices) and Credits (Payments) for a supplier.
 */
async function getSupplierLedger(tenantId, supplierId) {
    const tid = toObjectId(tenantId);
    const sid = toObjectId(supplierId);
    if (!tid || !sid) throw new Error('Invalid IDs');

    const supplier = await Supplier.findOne({ _id: sid, tenantId: tid }).lean();
    if (!supplier) throw new Error('Supplier not found');

    const { results: allInvoices } = await listSupplierInvoices(tenantId);
    const invoices = allInvoices.filter(i => i.supplierName === supplier.name);
    
    const payments = await SupplierInvoicePayment.find({ 
        tenantId: tid, 
        invoiceKey: { $in: invoices.map(i => i.invoiceKey) } 
    }).lean();

    const ledger = [];
    
    // Add Invoices as Debits
    for (const inv of invoices) {
        ledger.push({
            date: inv.invoiceDate,
            type: 'Invoice',
            ref: inv.invoiceNo,
            debit: inv.amount,
            credit: 0,
            attachment: inv.attachmentUrl
        });
    }

    // Add Payments as Credits
    for (const p of payments) {
        const inv = invoices.find(i => i.invoiceKey === p.invoiceKey);
        ledger.push({
            date: p.createdAt.toISOString(),
            type: 'Payment',
            ref: inv?.invoiceNo || '---',
            debit: 0,
            credit: p.amount,
            note: p.note
        });
    }

    // Sort by date
    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let balance = 0;
    const finalLedger = ledger.map(item => {
        balance += (item.debit - item.credit);
        return { ...item, balance };
    });

    return {
        supplier: mapDoc(supplier),
        totalDue: balance,
        history: finalLedger
    };
}

export default {
    listSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    listSupplierInvoices,
    recordSupplierInvoicePayment,
    getSupplierLedger,
};
