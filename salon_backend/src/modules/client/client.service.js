import mongoose from 'mongoose';
import clientRepository from './client.repository.js';
import Invoice from '../invoice/invoice.model.js';
import Booking from '../booking/booking.model.js';

function toPlain(v) {
    if (!v) return v;
    return typeof v.toObject === 'function' ? v.toObject() : v;
}

function summarizeInvoiceServicesForStylist(inv, stylistOid) {
    if (!inv || !inv.items?.length) return '';
    const sid = String(stylistOid);
    const staffMatch = inv.staffId && String(inv.staffId) === sid;
    const serviceItems = inv.items.filter((it) => it.type === 'service' && it.name);
    const picked = staffMatch
        ? serviceItems
        : serviceItems.filter((it) => it.stylistId && String(it.stylistId) === sid);
    const use = picked.length ? picked : serviceItems;
    return use.map((it) => it.name).join(' + ') || '';
}

class ClientService {
    async createClient(tenantId, clientData) {
        if (await clientRepository.findByPhone(tenantId, clientData.phone)) {
            throw new Error('Client with this phone number already exists in this salon');
        }
        return clientRepository.create({ ...clientData, tenantId });
    }

    async queryClients(tenantId, filter, options) {
        return clientRepository.find({ ...filter, tenantId }, options);
    }

    async getClientById(tenantId, clientId) {
        const client = await clientRepository.findOne({ _id: clientId, tenantId });
        if (!client) throw new Error('Client not found');
        return client;
    }

    async updateClientById(tenantId, clientId, updateBody) {
        const client = await clientRepository.updateOne({ _id: clientId, tenantId }, updateBody);
        if (!client) throw new Error('Client not found');
        return client;
    }

    /**
     * Client IDs this stylist has served (paid invoices) or has bookings with.
     */
    async collectStylistClientIds(tenantId, stylistUserId) {
        const tid = new mongoose.Types.ObjectId(tenantId);
        const sid = new mongoose.Types.ObjectId(stylistUserId);

        const fromInvoices = await Invoice.distinct('clientId', {
            tenantId: tid,
            paymentStatus: 'paid',
            $or: [{ staffId: sid }, { 'items.stylistId': sid }],
        });

        const fromBookings = await Booking.distinct('clientId', {
            tenantId: tid,
            staffId: sid,
            status: { $ne: 'cancelled' },
        });

        const set = new Set([...fromInvoices.map(String), ...fromBookings.map(String)]);
        return [...set].map((id) => new mongoose.Types.ObjectId(id));
    }

    async stylistHasAccessToClient(tenantId, stylistUserId, clientId) {
        const tid = new mongoose.Types.ObjectId(tenantId);
        const sid = new mongoose.Types.ObjectId(stylistUserId);
        const cid = new mongoose.Types.ObjectId(clientId);

        const inv = await Invoice.exists({
            tenantId: tid,
            clientId: cid,
            paymentStatus: 'paid',
            $or: [{ staffId: sid }, { 'items.stylistId': sid }],
        });
        if (inv) return true;

        const book = await Booking.exists({
            tenantId: tid,
            clientId: cid,
            staffId: sid,
            status: { $ne: 'cancelled' },
        });
        return !!book;
    }

    async listStylistRoster(tenantId, stylistUserId, { name, page = 1, limit = 30 }) {
        const ids = await this.collectStylistClientIds(tenantId, stylistUserId);
        if (ids.length === 0) {
            return { results: [], page, limit, totalPages: 0, totalResults: 0 };
        }
        const filter = { tenantId, _id: { $in: ids } };
        if (name) filter.name = { $regex: String(name).trim(), $options: 'i' };
        return clientRepository.find(filter, { page, limit, sort: { name: 1 } });
    }

    async enrichStylistRoster(tenantId, stylistUserId, clients) {
        const VIP_SPEND_THRESHOLD = 10000;
        const INACTIVE_GAP_DAYS = 60;
        const NEW_WINDOW_DAYS = 30;

        const plain = clients.map(toPlain);
        if (!plain.length) return [];

        const ids = plain.map((c) => new mongoose.Types.ObjectId(String(c._id)));
        const tid = new mongoose.Types.ObjectId(tenantId);
        const sid = new mongoose.Types.ObjectId(stylistUserId);

        const agg = await Invoice.aggregate([
            {
                $match: {
                    tenantId: tid,
                    paymentStatus: 'paid',
                    clientId: { $in: ids },
                    $or: [{ staffId: sid }, { 'items.stylistId': sid }],
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$clientId',
                    visitCount: { $sum: 1 },
                    totalSpend: { $sum: '$total' },
                    lastInvoice: {
                        $first: {
                            createdAt: '$createdAt',
                            items: '$items',
                            staffId: '$staffId',
                            total: '$total',
                            invoiceNumber: '$invoiceNumber',
                        },
                    },
                },
            },
        ]);

        const statsMap = new Map(agg.map((a) => [String(a._id), a]));

        const bookings = await Booking.find({
            tenantId: tid,
            staffId: sid,
            clientId: { $in: ids },
            appointmentDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            status: { $in: ['pending', 'confirmed'] },
        })
            .sort({ appointmentDate: 1 })
            .populate('serviceId', 'name')
            .lean();

        const nextByClient = new Map();
        for (const b of bookings) {
            const cid = String(b.clientId);
            if (!nextByClient.has(cid)) nextByClient.set(cid, b);
        }

        const nowMs = Date.now();
        const newWindowStart = nowMs - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

        return plain.map((c) => {
            const cid = String(c._id);
            const row = statsMap.get(cid);
            const visits = row?.visitCount ?? 0;
            const spend = Number(row?.totalSpend || 0);
            const lastVisit = row?.lastInvoice?.createdAt
                ? new Date(row.lastInvoice.createdAt).toISOString().split('T')[0]
                : null;
            const lastServiceSummary = summarizeInvoiceServicesForStylist(row?.lastInvoice, sid) || '';

            const tags = [];
            if (spend > VIP_SPEND_THRESHOLD) tags.push('VIP');
            const createdAtMs = c.createdAt ? new Date(c.createdAt).getTime() : null;
            if (createdAtMs != null && createdAtMs >= newWindowStart) tags.push('New');

            let status = 'Active';
            if (row?.lastInvoice?.createdAt) {
                const gapDays = Math.floor(
                    (nowMs - new Date(row.lastInvoice.createdAt).getTime()) / (24 * 60 * 60 * 1000)
                );
                if (gapDays >= INACTIVE_GAP_DAYS) status = 'Inactive';
            }

            const nextBook = nextByClient.get(cid);
            let upcomingBooking = null;
            if (nextBook) {
                const d = new Date(nextBook.appointmentDate);
                upcomingBooking = `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · ${
                    nextBook.serviceId?.name || 'Booking'
                }`;
            }

            return {
                ...c,
                spend,
                totalVisits: visits,
                lastVisit,
                lastServiceSummary,
                tags,
                status,
                upcomingBooking,
            };
        });
    }

    async getStylistServiceHistory(tenantId, stylistUserId, clientId) {
        const ok = await this.stylistHasAccessToClient(tenantId, stylistUserId, clientId);
        if (!ok) {
            const err = new Error('Client not in your roster');
            err.statusCode = 404;
            throw err;
        }

        const tid = new mongoose.Types.ObjectId(tenantId);
        const sid = new mongoose.Types.ObjectId(stylistUserId);
        const cid = new mongoose.Types.ObjectId(clientId);

        const invoices = await Invoice.find({
            tenantId: tid,
            clientId: cid,
            paymentStatus: 'paid',
            $or: [{ staffId: sid }, { 'items.stylistId': sid }],
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return invoices.map((inv) => {
            const svc = summarizeInvoiceServicesForStylist(inv, sid);
            const label = svc || `Invoice ${inv.invoiceNumber || ''}`.trim();
            const d = new Date(inv.createdAt);
            return {
                id: String(inv._id),
                date: d
                    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    .toUpperCase()
                    .replace(/\s/g, '_'),
                service: label,
                cost: `₹${Number(inv.total || 0).toLocaleString('en-IN')}`,
                invoiceNumber: inv.invoiceNumber,
            };
        });
    }
}

export default new ClientService();
