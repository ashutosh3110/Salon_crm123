import mongoose from 'mongoose';
import Invoice from '../invoice/invoice.model.js';

function toObjectId(id) {
    if (!id) return null;
    try {
        return new mongoose.Types.ObjectId(String(id));
    } catch {
        return null;
    }
}

function assertTenant(tenantId) {
    const tid = toObjectId(tenantId);
    if (!tid) {
        const err = new Error('Tenant context required');
        err.statusCode = 400;
        throw err;
    }
    return tid;
}

function parseDate(d) {
    if (!d) return null;
    const x = new Date(d);
    return Number.isNaN(x.getTime()) ? null : x;
}

/**
 * India FY: April–March. fy=2024 or fy=2024-25 → 2024-04-01 .. 2025-03-31
 */
function fyBounds(fyStr) {
    const m = /^(\d{4})(?:-\d{2,4})?$/.exec(String(fyStr || '').trim());
    if (!m) return null;
    const startYear = parseInt(m[1], 10);
    const from = new Date(startYear, 3, 1, 0, 0, 0, 0);
    const to = new Date(startYear + 1, 2, 31, 23, 59, 59, 999);
    return { from, to };
}

function monthLabelFromKey(monthKey) {
    const [ys, ms] = String(monthKey).split('-');
    const d = new Date(parseInt(ys, 10), parseInt(ms, 10) - 1, 1);
    return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

function splitGstHalves(totalGst) {
    const t = Number(totalGst) || 0;
    const half = Math.round((t / 2) * 100) / 100;
    const other = Math.round((t - half) * 100) / 100;
    return { cgst: half, sgst: other };
}

async function getGstSummary(tenantId, query = {}) {
    const tid = assertTenant(tenantId);

    let from;
    let to;

    if (query.fy) {
        const b = fyBounds(query.fy);
        if (b) {
            from = b.from;
            to = b.to;
        }
    }

    if (!from || !to) {
        const fromQ = parseDate(query.from);
        const toQ = parseDate(query.to);
        if (fromQ && toQ) {
            from = new Date(fromQ);
            from.setHours(0, 0, 0, 0);
            to = new Date(toQ);
            to.setHours(23, 59, 59, 999);
        }
    }

    if (!from || !to) {
        to = new Date();
        to.setHours(23, 59, 59, 999);
        from = new Date();
        from.setMonth(from.getMonth() - 11);
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
    }

    const match = {
        tenantId: tid,
        paymentStatus: { $in: ['paid', 'partially_paid'] },
        createdAt: { $gte: from, $lte: to },
    };

    const rows = await Invoice.aggregate([
        { $match: match },
        {
            $addFields: {
                productSub: {
                    $reduce: {
                        input: { $ifNull: ['$items', []] },
                        initialValue: 0,
                        in: {
                            $add: [
                                '$$value',
                                {
                                    $cond: [
                                        { $eq: ['$$this.type', 'product'] },
                                        { $ifNull: ['$$this.total', 0] },
                                        0,
                                    ],
                                },
                            ],
                        },
                    },
                },
                serviceSub: {
                    $reduce: {
                        input: { $ifNull: ['$items', []] },
                        initialValue: 0,
                        in: {
                            $add: [
                                '$$value',
                                {
                                    $cond: [
                                        { $eq: ['$$this.type', 'service'] },
                                        { $ifNull: ['$$this.total', 0] },
                                        0,
                                    ],
                                },
                            ],
                        },
                    },
                },
                sub: { $ifNull: ['$subTotal', 0] },
                disc: { $ifNull: ['$discount', 0] },
                taxAmt: { $ifNull: ['$tax', 0] },
            },
        },
        {
            $addFields: {
                taxableBase: {
                    $max: [0, { $subtract: ['$sub', '$disc'] }],
                },
            },
        },
        {
            $addFields: {
                lineSum: { $add: ['$productSub', '$serviceSub'] },
            },
        },
        {
            $addFields: {
                pShare: {
                    $cond: [
                        { $gt: ['$sub', 0] },
                        {
                            $cond: [
                                { $gt: ['$lineSum', 0] },
                                { $divide: ['$productSub', '$sub'] },
                                0,
                            ],
                        },
                        0,
                    ],
                },
                sShare: {
                    $cond: [
                        { $gt: ['$sub', 0] },
                        {
                            $cond: [
                                { $gt: ['$lineSum', 0] },
                                { $divide: ['$serviceSub', '$sub'] },
                                1,
                            ],
                        },
                        0,
                    ],
                },
            },
        },
        {
            $addFields: {
                productGst: { $multiply: ['$taxAmt', '$pShare'] },
                serviceGst: { $multiply: ['$taxAmt', '$sShare'] },
            },
        },
        {
            $addFields: {
                monthKey: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            },
        },
        {
            $group: {
                _id: '$monthKey',
                taxable: { $sum: '$taxableBase' },
                gstTotal: { $sum: '$taxAmt' },
                productGst: { $sum: '$productGst' },
                serviceGst: { $sum: '$serviceGst' },
                invoices: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const monthly = rows.map((r) => {
        const gstTotal = Math.round((r.gstTotal || 0) * 100) / 100;
        const { cgst, sgst } = splitGstHalves(gstTotal);
        const pGst = Math.round((r.productGst || 0) * 100) / 100;
        const sGst = Math.round((r.serviceGst || 0) * 100) / 100;
        return {
            monthKey: r._id,
            monthLabel: monthLabelFromKey(r._id),
            taxable: Math.round((r.taxable || 0) * 100) / 100,
            gstTotal,
            cgst,
            sgst,
            productGst: pGst,
            serviceGst: sGst,
            invoices: r.invoices || 0,
        };
    });

    const totals = monthly.reduce(
        (acc, m) => {
            acc.taxable += m.taxable;
            acc.gstTotal += m.gstTotal;
            acc.cgst += m.cgst;
            acc.sgst += m.sgst;
            acc.productGst += m.productGst;
            acc.serviceGst += m.serviceGst;
            acc.invoices += m.invoices;
            return acc;
        },
        { taxable: 0, gstTotal: 0, cgst: 0, sgst: 0, productGst: 0, serviceGst: 0, invoices: 0 }
    );

    Object.keys(totals).forEach((k) => {
        if (k !== 'invoices') totals[k] = Math.round(totals[k] * 100) / 100;
    });

    return {
        period: {
            from: from.toISOString(),
            to: to.toISOString(),
            fromDate: from.toISOString().split('T')[0],
            toDate: to.toISOString().split('T')[0],
        },
        assumptions: {
            gstSplit:
                'Total invoice tax is split 50/50 as CGST & SGST (intra-state). Inter-state IGST is not modelled separately.',
            productServiceTax:
                'Product vs service GST is allocated in proportion to pre-discount line totals (product vs service) on each invoice.',
            taxable:
                'Taxable value = subTotal − discount (pre-GST base as stored on invoice).',
        },
        totals,
        monthly,
    };
}

export default {
    getGstSummary,
};
