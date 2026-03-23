import mongoose from 'mongoose';
import Transaction from './transaction.model.js';
import Outlet from '../outlet/outlet.model.js';

function toObjectId(id) {
    if (!id) return null;
    try {
        return new mongoose.Types.ObjectId(String(id));
    } catch {
        return null;
    }
}

function mapTx(doc) {
    if (!doc) return null;
    const o = doc.toObject ? doc.toObject() : doc;
    const outlet = o.outletId;
    return {
        id: String(o._id),
        _id: o._id,
        type: o.type,
        amount: Number(o.amount) || 0,
        category: o.category,
        paymentMethod: o.paymentMethod,
        description: o.description || '',
        date: o.date || o.createdAt,
        createdAt: o.createdAt,
        outletId: outlet?._id ? String(outlet._id) : o.outletId ? String(o.outletId) : null,
        outletName: outlet?.name || null,
    };
}

async function listExpenses(tenantId, query = {}) {
    const tid = toObjectId(tenantId);
    if (!tid) return { results: [], page: 1, limit: 50, totalResults: 0, totalPages: 0 };

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const filter = { tenantId: tid, type: 'expense' };
    if (query.category) filter.category = query.category;
    if (query.outletId) {
        const oid = toObjectId(query.outletId);
        if (oid) filter.outletId = oid;
    }
    if (query.startDate || query.endDate) {
        filter.date = {};
        if (query.startDate) filter.date.$gte = new Date(query.startDate);
        if (query.endDate) {
            const end = new Date(query.endDate);
            end.setHours(23, 59, 59, 999);
            filter.date.$lte = end;
        }
    }

    const [rows, totalResults] = await Promise.all([
        Transaction.find(filter)
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('outletId', 'name')
            .lean(),
        Transaction.countDocuments(filter),
    ]);

    return {
        results: rows.map((r) => mapTx(r)),
        page,
        limit,
        totalResults,
        totalPages: Math.ceil(totalResults / limit) || 1,
    };
}

async function createExpense(tenantId, body) {
    const tid = toObjectId(tenantId);
    if (!tid) {
        const err = new Error('Tenant context required');
        err.statusCode = 400;
        throw err;
    }

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        const err = new Error('amount must be a positive number');
        err.statusCode = 400;
        throw err;
    }

    let outletId;
    if (body.outletId) {
        const oid = toObjectId(body.outletId);
        if (!oid) {
            const err = new Error('Invalid outlet id');
            err.statusCode = 400;
            throw err;
        }
        const outlet = await Outlet.findOne({ _id: oid, tenantId: tid }).lean();
        if (!outlet) {
            const err = new Error('Outlet not found for this salon');
            err.statusCode = 404;
            throw err;
        }
        outletId = oid;
    }

    const doc = await Transaction.create({
        tenantId: tid,
        type: 'expense',
        amount,
        category: body.category,
        paymentMethod: body.paymentMethod,
        description: body.description != null ? String(body.description).trim() : '',
        date: body.date ? new Date(body.date) : new Date(),
        outletId: outletId || undefined,
    });

    const populated = await Transaction.findById(doc._id).populate('outletId', 'name').lean();
    return mapTx(populated);
}

export default {
    listExpenses,
    createExpense,
};
