import campaignRepository from './campaign.repository.js';
import AutomationFlow from './automationFlow.model.js';
import Client from '../client/client.model.js';
import Invoice from '../invoice/invoice.model.js';
import mongoose from 'mongoose';

const FLOW_DEFINITIONS = {
    birthday: { name: 'Birthday Wishes', short: 'Send a warm message with an offer on the customer\'s birthday.', triggerLabel: 'On the customer\'s birthday', channelLabel: 'WhatsApp + optional SMS', badge: 'Popular', defaultPreview: 'Happy Birthday {{name}} 🎉\nWe\'d love to spoil you today. Enjoy {{offer}} on any service this week. Reply YES to book.' },
    after_visit: { name: 'Visit Thank You + Review', short: 'Say thanks after every visit and ask for a review link.', triggerLabel: '2 hours after the appointment is marked as completed', channelLabel: 'WhatsApp', badge: 'Recommended', defaultPreview: 'Hi {{name}}, thank you for visiting {{salon_name}} today.\nTap here to rate your experience: {{review_link}}' },
    winback: { name: 'Win Back Inactive Clients', short: 'Gently remind clients who have not visited in a while.', triggerLabel: 'When there is no visit for 60 days', channelLabel: 'WhatsApp broadcast', badge: 'Re-activation', defaultPreview: 'We miss you at {{salon_name}} 💛\nBook any service this week and get {{offer}} as a welcome back gift.' },
    no_show: { name: 'No-show Follow Up', short: 'Send a polite note after a missed appointment.', triggerLabel: '30 minutes after a missed or cancelled booking', channelLabel: 'WhatsApp', badge: 'Care', defaultPreview: 'Hi {{name}}, we noticed today\'s booking did not happen.\nIf you want to reschedule, just reply here or tap this link: {{booking_link}}' },
};

const parseSort = (sortBy = 'createdAt:desc') => {
    const [field, order] = String(sortBy).split(':');
    return { [field || 'createdAt']: order === 'asc' ? 1 : -1 };
};

const createCampaign = async (tenantId, payload, userId) => {
    const body = {
        tenantId,
        name: payload.name,
        type: payload.type || 'bulk',
        segment: payload.segment || 'all',
        message: payload.message || '',
        channel: payload.channel || 'whatsapp',
        status: 'completed',
        sentCount: 0,
        readCount: 0,
        targetCount: payload.targetCount || 0,
        sentAt: new Date(),
        createdBy: userId,
    };
    return campaignRepository.create(body);
};

const queryCampaigns = async (tenantId, filter, options) => {
    const opts = {
        page: options.page || 1,
        limit: options.limit || 50,
        sort: parseSort(options.sortBy),
    };
    return campaignRepository.find({ ...filter, tenantId }, opts);
};

const getSegments = async (tenantId) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const allClients = await Client.countDocuments({ tenantId });
    if (allClients === 0) {
        return [
            { id: 'all', label: 'All Customers', count: 0, color: 'text-slate-400' },
            { id: 'loyal', label: 'Loyal (5+ visits)', count: 0, color: 'text-primary' },
            { id: 'at_risk', label: 'At Risk (30d+ gap)', count: 0, color: 'text-amber-500' },
            { id: 'new_month', label: 'New This Month', count: 0, color: 'text-emerald-500' },
            { id: 'inactive_60', label: 'Inactive (60d+)', count: 0, color: 'text-rose-500' },
            { id: 'birthday', label: 'Birthday Today', count: 0, color: 'text-emerald-500' },
        ];
    }

    const tid = new mongoose.Types.ObjectId(tenantId);
    const visitCounts = await Invoice.aggregate([
        { $match: { tenantId: tid, paymentStatus: 'paid' } },
        { $group: { _id: '$clientId', count: { $sum: 1 }, total: { $sum: '$total' } } },
    ]);
    const visitMap = new Map(visitCounts.map((v) => [v._id?.toString(), { count: v.count, total: v.total || 0 }]));

    const lastVisitByClient = await Invoice.aggregate([
        { $match: { tenantId: tid, paymentStatus: 'paid' } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$clientId', lastVisit: { $first: '$createdAt' } } },
    ]);
    const lastVisitMap = new Map(lastVisitByClient.map((v) => [v._id?.toString(), v.lastVisit]));

    const clients = await Client.find({ tenantId }).select('_id createdAt birthday').lean();
    const totals = visitCounts.map((v) => v.total || 0).sort((a, b) => b - a);
    const top20Threshold = totals.length > 0 ? totals[Math.floor(totals.length * 0.2)] : 0;

    let loyal = 0;
    let atRisk = 0;
    let newMonth = 0;
    let inactive60 = 0;
    let birthdayToday = 0;
    let highSpenders = 0;

    for (const c of clients) {
        const cid = c._id.toString();
        const v = visitMap.get(cid) || { count: 0, total: 0 };
        const lastVisit = lastVisitMap.get(cid);

        if (v.count >= 5) loyal++;
        if (lastVisit && new Date(lastVisit) < thirtyDaysAgo) atRisk++;
        if (lastVisit && new Date(lastVisit) < sixtyDaysAgo) inactive60++;
        if (c.createdAt && new Date(c.createdAt) >= startOfMonth) newMonth++;
        if (v.total >= top20Threshold && top20Threshold > 0) highSpenders++;

        if (c.birthday) {
            const bd = new Date(c.birthday);
            if (bd.getMonth() === now.getMonth() && bd.getDate() === now.getDate()) birthdayToday++;
        }
    }

    return [
        { id: 'all', label: 'All Customers', count: allClients, color: 'text-slate-400' },
        { id: 'loyal', label: 'Loyal (5+ visits)', count: loyal, color: 'text-primary' },
        { id: 'at_risk', label: 'At Risk (30d+ gap)', count: atRisk, color: 'text-amber-500' },
        { id: 'new_month', label: 'New This Month', count: newMonth, color: 'text-emerald-500' },
        { id: 'inactive_60', label: 'Inactive (60d+)', count: inactive60, color: 'text-rose-500' },
        { id: 'high_spenders', label: 'High Spenders', count: highSpenders, color: 'text-primary' },
        { id: 'birthday', label: 'Birthday Today', count: birthdayToday, color: 'text-emerald-500' },
    ];
};

const getDashboardStats = async (tenantId) => {
    const campaigns = await campaignRepository.model
        .find({ tenantId })
        .select('sentCount readCount status createdAt channel')
        .lean();

    const totalReach = campaigns.reduce((s, c) => s + (c.sentCount || 0), 0);
    const totalRead = campaigns.reduce((s, c) => s + (c.readCount || 0), 0);
    const totalCompleted = campaigns.filter((c) => c.status === 'completed').length;
    const convRate = totalReach > 0 ? Math.round((totalRead / totalReach) * 1000) / 10 : 0;

    const last7Days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        const dayCampaigns = campaigns.filter(
            (c) => c.createdAt && c.createdAt >= dayStart && c.createdAt < dayEnd
        );
        const whatsapp = dayCampaigns
            .filter((c) => (c.channel || 'whatsapp') === 'whatsapp')
            .reduce((s, c) => s + (c.sentCount || 0), 0);
        const email = dayCampaigns
            .filter((c) => c.channel === 'email')
            .reduce((s, c) => s + (c.sentCount || 0), 0);
        last7Days.push({
            name: dayNames[d.getDay()],
            whatsapp,
            email,
            social: 0,
        });
    }

    return {
        campaignReach: totalReach,
        conversionRate: `${convRate}%`,
        totalSpent: totalCompleted * 0,
        totalCampaigns: campaigns.length,
        chartData: last7Days,
        stats: [
            { label: 'Campaign Reach', value: totalReach.toLocaleString(), trend: null },
            { label: 'Conv. Rate', value: `${convRate}%`, trend: null },
            { label: 'Total Spent', value: '₹0', trend: null },
            { label: 'Campaigns', value: campaigns.length.toString(), trend: null },
        ],
    };
};

const getSegmentCount = async (tenantId, segmentId) => {
    const segments = await getSegments(tenantId);
    const seg = segments.find((s) => s.id === segmentId);
    return seg ? seg.count : 0;
};

const getAutomations = async (tenantId) => {
    const stored = await AutomationFlow.find({ tenantId }).lean();
    const storedMap = new Map(stored.map((s) => [s.flowId, s]));
    return Object.keys(FLOW_DEFINITIONS).map((flowId) => {
        const def = FLOW_DEFINITIONS[flowId];
        const s = storedMap.get(flowId);
        return {
            id: flowId,
            name: def.name,
            short: def.short,
            triggerLabel: def.triggerLabel,
            channelLabel: def.channelLabel,
            badge: def.badge,
            preview: (s?.messageTemplate && s.messageTemplate.trim()) ? s.messageTemplate : def.defaultPreview,
            enabled: !!s?.enabled,
        };
    });
};

const updateAutomation = async (tenantId, flowId, payload) => {
    const { enabled, messageTemplate } = payload || {};
    if (!['birthday', 'after_visit', 'winback', 'no_show'].includes(flowId)) {
        throw new Error('Invalid flow ID');
    }
    let flow = await AutomationFlow.findOne({ tenantId, flowId });
    if (!flow) {
        flow = await AutomationFlow.create({ tenantId, flowId, enabled: false, messageTemplate: '' });
    }
    if (typeof enabled === 'boolean') flow.enabled = enabled;
    if (typeof messageTemplate === 'string') flow.messageTemplate = messageTemplate.trim();
    await flow.save();
    const def = FLOW_DEFINITIONS[flowId];
    return {
        id: flowId,
        name: def.name,
        short: def.short,
        triggerLabel: def.triggerLabel,
        channelLabel: def.channelLabel,
        badge: def.badge,
        preview: (flow.messageTemplate && flow.messageTemplate.trim()) ? flow.messageTemplate : def.defaultPreview,
        enabled: flow.enabled,
    };
};

export default {
    createCampaign,
    queryCampaigns,
    getSegments,
    getDashboardStats,
    getSegmentCount,
    getAutomations,
    updateAutomation,
};
