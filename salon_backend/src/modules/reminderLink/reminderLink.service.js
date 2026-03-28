import ReminderLink from './reminderLink.model.js';
import Client from '../client/client.model.js';
import Invoice from '../invoice/invoice.model.js';
import Tenant from '../tenant/tenant.model.js';
import mongoose from 'mongoose';

const DEFAULT_RULES = [
    { id: 'rule-1', category: 'Hair Color', interval: 30, channel: 'WhatsApp', active: true, message: "Hi {name}, it's time for your Hair Color refresh! Book your slot now at {link}." },
    { id: 'rule-2', category: 'Facial', interval: 45, channel: 'Email', active: true, message: "Hello {name}, keep that glow! You are due for your next Facial. Book here: {link}." },
    { id: 'rule-3', category: 'Keratin', interval: 90, channel: 'WhatsApp', active: false, message: "Hey {name}, your Keratin treatment might need a touch-up soon. See our slots: {link}." },
];

const DEFAULT_SETTINGS = {
    salonSlug: 'premium-salon',
    welcomeMsg: 'Welcome to our premium salon. Book your next visit below.',
    showServices: true,
};

const normalizePhone = (p = '') => String(p).replace(/\D/g, '');
const toE164 = (p = '') => {
    const n = normalizePhone(p);
    if (!n) return '';
    if (n.startsWith('91') && n.length === 12) return n;
    if (n.length === 10) return `91${n}`;
    return n;
};
const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

class ReminderLinkService {
    _getPublicAppBaseUrl() {
        // Configure in env for production, e.g. https://yourdomain.com
        return process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    }

    async _sendWhatsAppCloudMessage(to, text, imageUrl = null) {
        const token = process.env.WHATSAPP_CLOUD_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
        if (!token || !phoneNumberId) {
            throw new Error('WhatsApp Cloud API is not configured');
        }

        const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
        const payload = imageUrl
            ? {
                messaging_product: 'whatsapp',
                to,
                type: 'image',
                image: {
                    link: imageUrl,
                    caption: text,
                },
            }
            : {
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: { body: text },
            };

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.error?.message || 'WhatsApp send failed');
        }
        return data;
    }

    async _getOrCreate(tenantId) {
        let doc = await ReminderLink.findOne({ tenantId });
        if (!doc) {
            doc = await ReminderLink.create({
                tenantId,
                bridalBookings: [],
                reminderRules: DEFAULT_RULES,
                bookingSettings: DEFAULT_SETTINGS,
                serviceReminderStates: [],
            });
        }
        return doc;
    }

    _buildBookingUrl(salonSlug = 'premium-salon') {
        const base = this._getPublicAppBaseUrl().replace(/\/+$/, '');
        return `${base}/app/book?salon=${encodeURIComponent(salonSlug)}`;
    }

    async getState(tenantId) {
        const doc = await this._getOrCreate(tenantId);
        return {
            bridalBookings: doc.bridalBookings || [],
            reminderRules: doc.reminderRules || [],
            bookingSettings: doc.bookingSettings || DEFAULT_SETTINGS,
            bookingPath: this._buildBookingUrl(doc.bookingSettings?.salonSlug),
        };
    }

    async addBridalBooking(tenantId, payload) {
        const doc = await this._getOrCreate(tenantId);
        const booking = {
            id: makeId('br'),
            clientName: payload.clientName,
            clientPhone: payload.clientPhone,
            eventName: payload.eventName,
            eventDate: new Date(payload.eventDate),
            service: payload.service || '',
            reminders: (payload.reminders && payload.reminders.length ? payload.reminders : [
                { id: makeId('rem30'), label: '30 Days Before', daysBefore: 30, active: true, sentAt: null },
                { id: makeId('rem7'), label: '7 Days Before', daysBefore: 7, active: true, sentAt: null },
                { id: makeId('rem1'), label: '1 Day Before', daysBefore: 1, active: true, sentAt: null },
            ]),
        };
        doc.bridalBookings.unshift(booking);
        await doc.save();
        return booking;
    }

    async updateBridalBooking(tenantId, bookingId, payload) {
        const doc = await this._getOrCreate(tenantId);
        const idx = (doc.bridalBookings || []).findIndex((b) => b.id === bookingId);
        if (idx < 0) return null;
        const curr = doc.bridalBookings[idx];
        doc.bridalBookings[idx] = {
            ...curr.toObject?.() || curr,
            ...payload,
            eventDate: payload.eventDate ? new Date(payload.eventDate) : curr.eventDate,
        };
        await doc.save();
        return doc.bridalBookings[idx];
    }

    async toggleBridalReminder(tenantId, bookingId, reminderId) {
        const doc = await this._getOrCreate(tenantId);
        const booking = (doc.bridalBookings || []).find((b) => b.id === bookingId);
        if (!booking) return null;
        const reminder = (booking.reminders || []).find((r) => r.id === reminderId);
        if (!reminder) return null;
        reminder.active = !reminder.active;
        await doc.save();
        return reminder;
    }

    async deleteBridalBooking(tenantId, bookingId) {
        const doc = await this._getOrCreate(tenantId);
        const before = doc.bridalBookings.length;
        doc.bridalBookings = doc.bridalBookings.filter((b) => b.id !== bookingId);
        if (doc.bridalBookings.length === before) return false;
        await doc.save();
        return true;
    }

    async addRule(tenantId, payload) {
        const doc = await this._getOrCreate(tenantId);
        const rule = {
            id: makeId('rule'),
            category: payload.category,
            interval: payload.interval,
            channel: payload.channel || 'WhatsApp',
            message: payload.message,
            active: payload.active ?? true,
        };
        doc.reminderRules.push(rule);
        await doc.save();
        return rule;
    }

    async updateRule(tenantId, ruleId, payload) {
        const doc = await this._getOrCreate(tenantId);
        const idx = doc.reminderRules.findIndex((r) => r.id === ruleId);
        if (idx < 0) return null;
        doc.reminderRules[idx] = { ...doc.reminderRules[idx].toObject?.() || doc.reminderRules[idx], ...payload };
        await doc.save();
        return doc.reminderRules[idx];
    }

    async deleteRule(tenantId, ruleId) {
        const doc = await this._getOrCreate(tenantId);
        const before = doc.reminderRules.length;
        doc.reminderRules = doc.reminderRules.filter((r) => r.id !== ruleId);
        if (doc.reminderRules.length === before) return false;
        await doc.save();
        return true;
    }

    async updateSettings(tenantId, payload) {
        const doc = await this._getOrCreate(tenantId);
        doc.bookingSettings = { ...(doc.bookingSettings?.toObject?.() || doc.bookingSettings || {}), ...payload };
        await doc.save();
        return doc.bookingSettings;
    }

    async processDueEventReminders(tenantId) {
        const doc = await this._getOrCreate(tenantId);
        const now = new Date();
        const due = [];
        for (const booking of doc.bridalBookings) {
            for (const rem of booking.reminders) {
                if (!rem.active) continue;
                const target = new Date(booking.eventDate);
                target.setDate(target.getDate() - Number(rem.daysBefore || 0));
                const alreadySent = rem.sentAt && new Date(rem.sentAt) >= target;
                if (!alreadySent && now >= target && now <= booking.eventDate) {
                    due.push({
                        bookingId: booking.id,
                        reminderId: rem.id,
                        clientName: booking.clientName,
                        clientPhone: booking.clientPhone,
                        eventName: booking.eventName,
                        label: rem.label,
                        waLink: `https://wa.me/${normalizePhone(booking.clientPhone)}?text=${encodeURIComponent(`Hi ${booking.clientName}, reminder for ${booking.eventName} (${rem.label}).`)}`,
                    });
                    rem.sentAt = now;
                }
            }
        }
        if (due.length) await doc.save();
        return { count: due.length, reminders: due };
    }

    async getPendingServiceSignals(tenantId) {
        const doc = await this._getOrCreate(tenantId);
        const activeRules = (doc.reminderRules || []).filter((r) => r.active);
        if (!activeRules.length) return [];

        const states = doc.serviceReminderStates || [];
        const now = new Date();
        const pending = [];

        for (const rule of activeRules) {
            const regex = new RegExp(String(rule.category || '').trim(), 'i');
            const rows = await Invoice.aggregate([
                { $match: { tenantId: new mongoose.Types.ObjectId(tenantId), paymentStatus: 'paid' } },
                { $unwind: '$items' },
                { $match: { 'items.type': 'service', 'items.name': { $regex: regex } } },
                { $sort: { createdAt: -1 } },
                {
                    $group: {
                        _id: '$clientId',
                        lastVisit: { $first: '$createdAt' },
                        service: { $first: '$items.name' },
                    },
                },
            ]);

            for (const row of rows) {
                const client = await Client.findOne({ _id: row._id, tenantId }).select('name phone').lean();
                if (!client) continue;

                const daysSince = Math.floor((now - new Date(row.lastVisit)) / (24 * 60 * 60 * 1000));
                const dueIn = Number(rule.interval || 0) - daysSince;
                const state = states.find((s) => String(s.clientId) === String(client._id) && s.ruleId === rule.id);
                if (state?.ignoredUntil && new Date(state.ignoredUntil) > now) continue;

                pending.push({
                    id: `${rule.id}:${client._id}`,
                    clientId: client._id,
                    name: client.name,
                    phone: client.phone,
                    lastVisit: row.lastVisit,
                    service: row.service || rule.category,
                    dueIn,
                    ruleId: rule.id,
                });
            }
        }

        return pending.sort((a, b) => a.dueIn - b.dueIn);
    }

    async markServiceSignalReplied(tenantId, clientId, ruleId) {
        const doc = await this._getOrCreate(tenantId);
        const rule = (doc.reminderRules || []).find((r) => r.id === ruleId);
        const now = new Date();
        const ignoreDays = Number(rule?.interval || 30);
        const ignoredUntil = new Date(now.getTime() + ignoreDays * 24 * 60 * 60 * 1000);
        const idx = doc.serviceReminderStates.findIndex(
            (s) => String(s.clientId) === String(clientId) && s.ruleId === ruleId
        );
        if (idx >= 0) {
            doc.serviceReminderStates[idx].repliedAt = now;
            doc.serviceReminderStates[idx].ignoredUntil = ignoredUntil;
        } else {
            doc.serviceReminderStates.push({ clientId, ruleId, repliedAt: now, ignoredUntil });
        }
        await doc.save();
        return { clientId, ruleId, repliedAt: now, ignoredUntil };
    }

    async sendServiceReminderWhatsApp(tenantId, clientId, ruleId) {
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) throw new Error('Tenant not found');

        const whatsappLimit = tenant.limits?.whatsappLimit || 0;
        const whatsappUsed = tenant.whatsappUsed || 0;

        if (whatsappUsed + 1 > whatsappLimit) {
            throw new Error(`WhatsApp quota exceeded. You have ${whatsappLimit - whatsappUsed} messages remaining.`);
        }

        const doc = await this._getOrCreate(tenantId);
        const client = await Client.findOne({ _id: clientId, tenantId }).select('name phone').lean();
        if (!client) return null;
        const rule = (doc.reminderRules || []).find((r) => r.id === ruleId);
        if (!rule) return null;
        const bookingPath = this._buildBookingUrl(doc.bookingSettings?.salonSlug);
        const text = String(rule.message || `Hi {name}, book here: {link}`)
            .replace('{name}', client.name || 'Customer')
            .replace('{category}', rule.category || 'service')
            .replace('{link}', bookingPath);
        const phone = normalizePhone(client.phone);
        const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

        const now = new Date();
        const idx = doc.serviceReminderStates.findIndex(
            (s) => String(s.clientId) === String(clientId) && s.ruleId === ruleId
        );
        if (idx >= 0) {
            doc.serviceReminderStates[idx].lastSentAt = now;
        } else {
            doc.serviceReminderStates.push({ clientId, ruleId, lastSentAt: now });
        }
        await doc.save();

        // Increment usage
        tenant.whatsappUsed = (tenant.whatsappUsed || 0) + 1;
        await tenant.save();

        return { clientId, ruleId, name: client.name, phone, waLink };
    }

    async broadcastBookingLinkWhatsApp(tenantId, message) {
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) throw new Error('Tenant not found');

        const doc = await this._getOrCreate(tenantId);
        const clients = await Client.find({ tenantId }).select('name phone').lean();
        const bookingPath = this._buildBookingUrl(doc.bookingSettings?.salonSlug);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingPath)}`;
        const autoMode = !!(process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID);
        const links = clients
            .map((c) => {
                const phone = toE164(c.phone);
                if (!phone) return null;
                const text = String(message || `Hi ${c.name || 'there'}, book your next appointment here: {link}\nQR: {qr}`)
                    .replace('{name}', c.name || 'Customer')
                    .replace('{link}', bookingPath)
                    .replace('{qr}', qrUrl);
                return {
                    clientId: c._id,
                    name: c.name,
                    phone,
                    bookingPath,
                    qrUrl,
                    waLink: `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
                };
            })
            .filter(Boolean);

        const targetCount = links.length;
        const whatsappLimit = tenant.limits?.whatsappLimit || 0;
        const whatsappUsed = tenant.whatsappUsed || 0;

        if (whatsappUsed + targetCount > whatsappLimit) {
            throw new Error(`WhatsApp quota exceeded. You have ${whatsappLimit - whatsappUsed} messages remaining but you are trying to send ${targetCount}.`);
        }

        if (!autoMode) {
            return { mode: 'manual_links', totalCustomers: clients.length, totalLinks: links.length, bookingPath, qrUrl, links };
        }

        let sentCount = 0;
        let failedCount = 0;
        const failures = [];
        for (const item of links) {
            try {
                const plainText = decodeURIComponent(item.waLink.split('text=')[1] || '');
                await this._sendWhatsAppCloudMessage(item.phone, plainText, item.qrUrl);
                sentCount += 1;
            } catch (e) {
                failedCount += 1;
                failures.push({ phone: item.phone, reason: e.message });
            }
        }
        // Increment usage
        tenant.whatsappUsed = (tenant.whatsappUsed || 0) + targetCount;
        await tenant.save();

        return {
            mode: 'auto_send',
            totalCustomers: clients.length,
            totalLinks: links.length,
            sentCount,
            failedCount,
            failures,
            bookingPath,
            qrUrl,
            links,
        };
    }
}

export default new ReminderLinkService();
