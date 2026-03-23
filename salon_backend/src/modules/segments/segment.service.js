import mongoose from 'mongoose';
import Client from '../client/client.model.js';
import Invoice from '../invoice/invoice.model.js';
import Segment from './segment.model.js';

const VIP_SPEND_THRESHOLD = 10000;
const INACTIVE_GAP_DAYS = 60;
const NEW_WINDOW_DAYS = 30;

function safeArray(v) {
    return Array.isArray(v) ? v : [];
}

function getSegmentIdKeywords(name) {
    const n = String(name || '').toLowerCase();
    if (n.includes('vip')) return 'vip';
    if (n.includes('new')) return 'new';
    if (n.includes('inactive')) return 'inactive';
    return 'custom';
}

async function buildCustomerStats(tenantId) {
    const tid = new mongoose.Types.ObjectId(tenantId);

    const [clients, visitAgg, lastVisitAgg] = await Promise.all([
        Client.find({ tenantId: tid }).lean(),
        Invoice.aggregate([
            { $match: { tenantId: tid, paymentStatus: 'paid' } },
            { $group: { _id: '$clientId', count: { $sum: 1 }, total: { $sum: '$total' } } },
        ]),
        Invoice.aggregate([
            { $match: { tenantId: tid, paymentStatus: 'paid' } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: '$clientId', lastVisit: { $first: '$createdAt' } } },
        ]),
    ]);

    const visitMap = new Map(
        visitAgg.map((v) => [
            v._id?.toString(),
            { totalVisits: v.count || 0, spend: v.total || 0 },
        ])
    );
    const lastVisitMap = new Map(lastVisitAgg.map((v) => [v._id?.toString(), v.lastVisit]));

    return clients.map((c) => {
        const cid = c._id?.toString();
        const stat = visitMap.get(cid) || { totalVisits: 0, spend: 0 };
        const lastVisit = lastVisitMap.get(cid) || null;

        const tags = safeArray(c.tags);
        const storedSpend = typeof c.spend === 'number' ? c.spend : null;
        const storedStatus = typeof c.status === 'string' ? c.status : null;

        const spend = storedSpend != null ? storedSpend : stat.spend;

        let status = storedStatus;
        if (!status) {
            if (lastVisit) {
                const gapDays = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (24 * 60 * 60 * 1000));
                status = gapDays >= INACTIVE_GAP_DAYS ? 'Inactive' : 'Active';
            } else {
                status = 'Active';
            }
        }

        return {
            _id: c._id,
            name: c.name,
            phone: c.phone,
            tags,
            spend,
            totalVisits: stat.totalVisits,
            status,
            createdAt: c.createdAt,
        };
    });
}

function matchCustomerToSegment({ customer, segmentName }) {
    const kw = getSegmentIdKeywords(segmentName);
    if (kw === 'vip') {
        const tagsVip = safeArray(customer.tags).includes('VIP');
        const spendVip = Number(customer.spend || 0) > VIP_SPEND_THRESHOLD;
        return tagsVip || spendVip;
    }
    if (kw === 'new') {
        const tagsNew = safeArray(customer.tags).includes('New');
        const createdAt = customer.createdAt ? new Date(customer.createdAt) : null;
        const within = createdAt ? (Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000) <= NEW_WINDOW_DAYS : false;
        return tagsNew || within;
    }
    if (kw === 'inactive') {
        return customer.status === 'Inactive';
    }

    // Custom segment preview behavior: show first 3 customers for that segment.
    return true;
}

async function computeSegments(tenantId) {
    const customers = await buildCustomerStats(tenantId);

    const vipCount = customers.filter((c) => matchCustomerToSegment({ customer: c, segmentName: 'vip' })).length;
    const newCount = customers.filter((c) => matchCustomerToSegment({ customer: c, segmentName: 'new' })).length;
    const inactiveCount = customers.filter((c) => matchCustomerToSegment({ customer: c, segmentName: 'inactive' })).length;

    const customSegments = await Segment.find({ tenantId, isCustom: true }).sort({ createdAt: -1 }).lean();

    const predefined = [
        {
            id: 'vip',
            name: 'VIP Customers',
            rule: 'VIP (tag) OR spend > ₹10,000',
            iconName: 'Crown',
            color: 'bg-amber-50 text-amber-600 border-amber-100',
            count: vipCount,
            isPredefined: true,
        },
        {
            id: 'new',
            name: 'New Customers',
            rule: 'New (tag) OR joined within 30 days',
            iconName: 'Zap',
            color: 'bg-blue-50 text-blue-600 border-blue-100',
            count: newCount,
            isPredefined: true,
        },
        {
            id: 'inactive',
            name: 'Inactive Customers',
            rule: 'No visit / gap >= 60 days',
            iconName: 'UserMinus',
            color: 'bg-red-50 text-red-600 border-red-100',
            count: inactiveCount,
            isPredefined: true,
        },
    ];

    // For custom segments, the UI preview uses first 3 customers only when the segment name
    // does NOT match predefined keywords (vip/new/inactive). Otherwise, show full filtered count.
    const customWithCounts = customSegments.map((s) => {
        const kw = getSegmentIdKeywords(s.name);
        const baseCount = customers.filter((c) => matchCustomerToSegment({ customer: c, segmentName: s.name })).length;
        const previewCount = kw === 'custom' ? Math.min(baseCount, 3) : baseCount;
        return {
            id: s._id.toString(),
            name: s.name,
            rule: s.rule,
            iconName: s.iconName,
            color: s.color,
            count: previewCount,
            isPredefined: false,
        };
    });

    return [...predefined, ...customWithCounts];
}

async function getCustomersForSegment(tenantId, segmentId, { limit = 50 } = {}) {
    const customers = await buildCustomerStats(tenantId);

    // Predefined segment ids
    if (segmentId === 'vip') {
        const list = customers.filter((c) => matchCustomerToSegment({ customer: c, segmentName: 'vip' }));
        return list.slice(0, limit);
    }
    if (segmentId === 'new') {
        const list = customers.filter((c) => matchCustomerToSegment({ customer: c, segmentName: 'new' }));
        return list.slice(0, limit);
    }
    if (segmentId === 'inactive') {
        const list = customers.filter((c) => matchCustomerToSegment({ customer: c, segmentName: 'inactive' }));
        return list.slice(0, limit);
    }

    // Custom segments
    const seg = await Segment.findOne({ tenantId, _id: segmentId }).lean();
    if (!seg) return [];

    const list = customers.filter((c) => matchCustomerToSegment({ customer: c, segmentName: seg.name }));

    // Keep the current UI behavior: only truly "custom" segments preview first 3.
    const kw = getSegmentIdKeywords(seg.name);
    if (kw === 'custom') return list.slice(0, Math.min(limit, 3));
    return list.slice(0, limit);
}

export default {
    computeSegments,
    getCustomersForSegment,
};

