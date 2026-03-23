import httpStatus from 'http-status-codes';
import clientService from './client.service.js';
import Invoice from '../invoice/invoice.model.js';
import mongoose from 'mongoose';

const INACTIVE_GAP_DAYS = 60;
const NEW_WINDOW_DAYS = 30;
const VIP_SPEND_THRESHOLD = 10000;

function toPlain(v) {
    if (!v) return v;
    // eslint-disable-next-line no-underscore-dangle
    return typeof v.toObject === 'function' ? v.toObject() : v;
}

async function enrichClients(tenantId, clients) {
    const plainClients = clients.map(toPlain);
    const clientIds = plainClients.map((c) => new mongoose.Types.ObjectId(String(c._id)));

    const tid = new mongoose.Types.ObjectId(tenantId);

    const agg = await Invoice.aggregate([
        { $match: { tenantId: tid, paymentStatus: 'paid', clientId: { $in: clientIds } } },
        {
            $group: {
                _id: '$clientId',
                count: { $sum: 1 },
                total: { $sum: '$total' },
                lastVisit: { $max: '$createdAt' },
            },
        },
    ]);

    const statsMap = new Map(agg.map((r) => [String(r._id), r]));
    const nowMs = Date.now();
    const newWindowStart = nowMs - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

    return plainClients.map((c) => {
        const cid = String(c._id);
        const s = statsMap.get(cid) || { count: 0, total: 0, lastVisit: null };

        const spend = Number(s.total || 0);
        const totalVisits = Number(s.count || 0);
        const lastVisit = s.lastVisit ? new Date(s.lastVisit).toISOString().split('T')[0] : null;

        const tags = [];
        if (spend > VIP_SPEND_THRESHOLD) tags.push('VIP');

        const createdAtMs = c.createdAt ? new Date(c.createdAt).getTime() : null;
        if (createdAtMs != null && createdAtMs >= newWindowStart) tags.push('New');

        // Customer status used by UI: 'Inactive' vs 'Active'
        let status = 'Active';
        if (s.lastVisit) {
            const gapDays = Math.floor((nowMs - new Date(s.lastVisit).getTime()) / (24 * 60 * 60 * 1000));
            if (gapDays >= INACTIVE_GAP_DAYS) status = 'Inactive';
        }

        return {
            ...c,
            spend,
            totalVisits,
            lastVisit,
            tags,
            status,
        };
    });
}

const createClient = async (req, res, next) => {
    try {
        const client = await clientService.createClient(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(client);
    } catch (error) {
        next(error);
    }
};

const getClients = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
        };
        const result = await clientService.queryClients(req.tenantId, filter, options);
        if (Array.isArray(result?.results) && result.results.length > 0) {
            const enriched = await enrichClients(req.tenantId, result.results);
            res.send({ ...result, results: enriched });
        } else {
            res.send(result);
        }
    } catch (error) {
        next(error);
    }
};

const getStylistRoster = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 30;
        const name = req.query.name;
        const result = await clientService.listStylistRoster(req.tenantId, req.user._id, { name, page, limit });
        if (Array.isArray(result?.results) && result.results.length > 0) {
            const enriched = await clientService.enrichStylistRoster(req.tenantId, req.user._id, result.results);
            res.send({ ...result, results: enriched });
        } else {
            res.send(result);
        }
    } catch (error) {
        next(error);
    }
};

const getStylistClientHistory = async (req, res, next) => {
    try {
        const history = await clientService.getStylistServiceHistory(
            req.tenantId,
            req.user._id,
            req.params.clientId
        );
        res.send({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};

const getClient = async (req, res, next) => {
    try {
        const client = await clientService.getClientById(req.tenantId, req.params.clientId);
        if (req.user.role === 'stylist') {
            const allowed = await clientService.stylistHasAccessToClient(req.tenantId, req.user._id, req.params.clientId);
            if (!allowed) {
                return res.status(httpStatus.NOT_FOUND).send({ message: 'Client not found' });
            }
            const enriched = await clientService.enrichStylistRoster(req.tenantId, req.user._id, [client]);
            return res.send(enriched[0]);
        }
        const enriched = await enrichClients(req.tenantId, [client]);
        res.send(enriched[0]);
    } catch (error) {
        next(error);
    }
};

const updateClient = async (req, res, next) => {
    try {
        // Customers can only update their own profile
        if (req.user.role === 'customer' && req.params.clientId !== req.user._id.toString()) {
            return res.status(httpStatus.FORBIDDEN).send({ message: 'You can only update your own profile' });
        }
        const client = await clientService.updateClientById(req.tenantId, req.params.clientId, req.body);
        res.send(client);
    } catch (error) {
        next(error);
    }
};

export default {
    createClient,
    getClients,
    getStylistRoster,
    getStylistClientHistory,
    getClient,
    updateClient,
};
