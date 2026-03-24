import mongoose from 'mongoose';
import tenantRepository from './tenant.repository.js';
import Tenant from './tenant.model.js';
import User from '../user/user.model.js';
import userService from '../user/user.service.js';
import emailService from '../notification/email.service.js';

const PLAN_DEFAULTS = {
    free: {
        mrr: 0,
        trialDays: 14,
        features: { pos: true, appointments: true, inventory: false, marketing: false, payroll: false, crm: false, mobileApp: false, reports: false, whatsapp: false, loyalty: false, finance: false, feedback: false },
        limits: { staffLimit: 3, outletLimit: 1, smsCredits: 0, storageGB: 1 }
    },
    basic: {
        mrr: 1999,
        trialDays: 14,
        features: { pos: true, appointments: true, inventory: true, marketing: false, payroll: false, crm: true, mobileApp: false, reports: true, whatsapp: false, loyalty: false, finance: true, feedback: false },
        limits: { staffLimit: 10, outletLimit: 2, smsCredits: 200, storageGB: 5 }
    },
    pro: {
        mrr: 4999,
        trialDays: 7,
        features: { pos: true, appointments: true, inventory: true, marketing: true, payroll: true, crm: true, mobileApp: true, reports: true, whatsapp: false, loyalty: true, finance: true, feedback: true },
        limits: { staffLimit: 25, outletLimit: 5, smsCredits: 1000, storageGB: 20 }
    },
    enterprise: {
        mrr: 12999,
        trialDays: 0,
        features: { pos: true, appointments: true, inventory: true, marketing: true, payroll: true, crm: true, mobileApp: true, reports: true, whatsapp: true, loyalty: true, finance: true, feedback: true },
        limits: { staffLimit: 999, outletLimit: 999, smsCredits: 10000, storageGB: 100 }
    }
};

class TenantService {
    async createTenant(tenantData) {
        // Generate slug if not provided
        if (!tenantData.slug && tenantData.name) {
            tenantData.slug = tenantData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        }

        if (await tenantRepository.findBySlug(tenantData.slug)) {
            tenantData.slug = `${tenantData.slug}-${Math.floor(Math.random() * 1000)}`;
        }

        // Apply plan defaults if plan is provided
        const plan = tenantData.subscriptionPlan || 'free';
        if (PLAN_DEFAULTS[plan]) {
            tenantData.features = { ...PLAN_DEFAULTS[plan].features, ...(tenantData.features || {}) };
            tenantData.limits = { ...PLAN_DEFAULTS[plan].limits, ...(tenantData.limits || {}) };
            tenantData.mrr = PLAN_DEFAULTS[plan].mrr;
            tenantData.trialDays = PLAN_DEFAULTS[plan].trialDays;
        }

        // Check for duplicate email
        if (tenantData.email) {
            const existingEmail = await tenantRepository.findOne({ email: tenantData.email.toLowerCase() });
            if (existingEmail) throw new Error('Email already registered for another salon');
        }

        // Check for duplicate GST
        if (tenantData.gstNumber) {
            const existingGst = await tenantRepository.findOne({ gstNumber: tenantData.gstNumber });
            if (existingGst) throw new Error('GST Number already registered for another salon');
        }

        const tenant = await tenantRepository.create(tenantData);

        // Automate Owner Creation
        try {
            const ownerPassword = '123456';
            let owner = await User.findOne({ email: tenant.email.toLowerCase() });
            
            if (!owner) {
                // If user doesn't exist, create them
                owner = await userService.createUser({
                    name: tenant.ownerName,
                    email: tenant.email,
                    password: ownerPassword,
                    role: 'admin',
                    tenantId: tenant._id,
                });
            } else {
                // If user exists, just update their tenantId and role if it's not set
                // or if it matches the current registration
                console.log(`[TenantService] Reusing existing user for owner: ${owner.email}`);
                if (!owner.tenantId) {
                    owner.tenantId = tenant._id;
                    owner.role = 'admin';
                    owner.password = ownerPassword; // Reset to 123456 for convenience
                    await owner.save();
                } else if (String(owner.tenantId) !== String(tenant._id)) {
                    // Conflict if person is already an owner elsewhere
                    console.warn(`[TenantService] User ${owner.email} is already linked to another salon (${owner.tenantId})`);
                }
            }

            // Link owner to tenant
            if (owner && !tenant.owner) {
                tenant.owner = owner._id;
                await tenant.save();
            }

            // Send Welcome Email
            await emailService.sendWelcomeEmail(tenant.email, tenant.ownerName, tenant.name, ownerPassword);
        } catch (error) {
            console.error('[TenantService] ❌ Failed to automate owner/email (CRITICAL):', error.message);
        }

        return tenant;
    }

    async getTenantById(id) {
        const tenant = await tenantRepository.findOne({ _id: id });
        if (!tenant) throw new Error('Tenant not found');
        return tenant;
    }

    async getTenantBySlug(slug) {
        const tenant = await tenantRepository.findBySlug(slug);
        if (!tenant) throw new Error('Tenant not found');
        return tenant;
    }

    /** Resolve the salon (tenant) document for a logged-in staff/owner user. */
    async resolveTenantForUser(user) {
        if (!user) return null;
        let tenant = null;
        if (user.tenantId) {
            try {
                tenant = await this.getTenantById(user.tenantId);
            } catch {
                tenant = null;
            }
        }
        if (!tenant && user._id) {
            const result = await this.queryTenants({ owner: user._id }, { page: 1, limit: 1 });
            tenant = result?.results?.[0] || null;
        }
        if (!tenant && user.email) {
            const result = await this.queryTenants({ email: String(user.email).toLowerCase() }, { page: 1, limit: 1 });
            tenant = result?.results?.[0] || null;
        }
        return tenant;
    }

    async queryTenants(filter, options) {
        const finalFilter = { status: { $ne: 'deleted' }, ...filter };
        return tenantRepository.find(finalFilter, options);
    }

    /**
     * Haversine formula - distance in km between two lat/lng points
     */
    _haversineKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    async getNearbyTenants(lat, lng, radiusKm = 3) {
        const result = await tenantRepository.find(
            { status: 'active', latitude: { $exists: true, $ne: null }, longitude: { $exists: true, $ne: null } },
            { limit: 200 }
        );
        const withDistance = result.results
            .map(t => {
                const doc = t.toObject ? t.toObject() : t;
                const dist = this._haversineKm(lat, lng, doc.latitude, doc.longitude);
                return { ...doc, distanceKm: Math.round(dist * 100) / 100 };
            })
            .filter(t => t.distanceKm <= radiusKm)
            .sort((a, b) => a.distanceKm - b.distanceKm);
        if (withDistance.length === 0) {
            // Fallback: return all active tenants if none have location set
            const fallback = await tenantRepository.find({ status: 'active' }, { limit: 50 });
            return (fallback.results || []).map(t => {
                const doc = t.toObject ? t.toObject() : t;
                return { id: doc._id, _id: doc._id, name: doc.name, address: doc.address, city: doc.city, distanceKm: null };
            });
        }
        return withDistance.map(t => ({
            id: t._id,
            _id: t._id,
            name: t.name,
            address: t.address,
            city: t.city,
            distanceKm: t.distanceKm,
        }));
    }

    async updateTenantById(id, updateBody) {
        const tenant = await this.getTenantById(id);
        
        // Handle deep update for features and limits if they exist
        if (updateBody.features) {
            updateBody.features = { ...tenant.features.toObject(), ...updateBody.features };
        }
        if (updateBody.limits) {
            updateBody.limits = { ...tenant.limits.toObject(), ...updateBody.limits };
        }
        if (updateBody.settings) {
            const curSettings =
                tenant.settings && typeof tenant.settings.toObject === 'function'
                    ? tenant.settings.toObject()
                    : { ...(tenant.settings || {}) };
            const incoming = { ...updateBody.settings };
            if (incoming.notifications && curSettings.notifications) {
                const curN =
                    curSettings.notifications && typeof curSettings.notifications.toObject === 'function'
                        ? curSettings.notifications.toObject()
                        : { ...(curSettings.notifications || {}) };
                incoming.notifications = { ...curN, ...incoming.notifications };
            }
            updateBody.settings = { ...curSettings, ...incoming };
        }

        // Duplicate checks for update
        if (updateBody.email && updateBody.email.toLowerCase() !== tenant.email.toLowerCase()) {
            const existing = await tenantRepository.findOne({ email: updateBody.email.toLowerCase(), _id: { $ne: id } });
            if (existing) throw new Error('Email already taken by another salon');
        }

        if (updateBody.gstNumber && updateBody.gstNumber !== tenant.gstNumber) {
            const existing = await tenantRepository.findOne({ gstNumber: updateBody.gstNumber, _id: { $ne: id } });
            if (existing) throw new Error('GST Number already registered by another salon');
        }

        Object.assign(tenant, updateBody);
        await tenant.save();
        return tenant;
    }

    async deleteTenantById(id) {
        const tenant = await this.getTenantById(id);
        if (!tenant) {
            const err = new Error('Salon not found');
            err.statusCode = 404;
            throw err;
        }

        // 1. Delete all related data in other collections
        // We iterate through all known models and delete records with this tenantId
        const models = mongoose.models;
        for (const modelName in models) {
            const Model = models[modelName];
            
            // Skip Tenant itself and User (we'll handle User specifically)
            if (modelName === 'Tenant' || modelName === 'User') continue;

            // Check if model has tenantId field
            if (Model.schema.path('tenantId')) {
                console.log(`[TenantService] Cleaning up ${modelName} for tenant ${id}`);
                await Model.deleteMany({ tenantId: id });
            }
        }

        // 2. Custom cleanup for Users: Delete all users linked to this tenant
        console.log(`[TenantService] Cleaning up all Users for tenant ${id}`);
        await User.deleteMany({ tenantId: id });

        // 3. Permanently delete the Tenant
        await tenant.deleteOne();

        console.log(`[TenantService] Salon ${tenant.name} (${id}) has been permanently deleted from the database.`);
        return { id, name: tenant.name, status: 'deleted_permanently' };
    }

    async getTenantStats() {
        // Aggregating for dashboard KPIs
        const stats = await Tenant.aggregate([
            { $match: { status: { $ne: 'deleted' } } },
            {
                $facet: {
                    statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
                    planCounts: [{ $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }],
                    revenueStats: [{ $group: { _id: null, totalMRR: { $sum: '$mrr' }, totalRevenue: { $sum: '$totalRevenue' } } }],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ]);

        const facet = stats[0];
        const byStatus = {};
        facet.statusCounts.forEach(s => { byStatus[s._id] = s.count; });

        const byPlan = {};
        facet.planCounts.forEach(p => { byPlan[p._id] = p.count; });

        const recentTenants = await Tenant.find({ status: { $ne: 'deleted' } })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name slug status subscriptionPlan createdAt ownerName email')
            .lean();

        return {
            totalSalons: facet.totalCount[0]?.count || 0,
            activeSalons: byStatus.active || 0,
            currentMonthlyRevenue: facet.revenueStats[0]?.totalMRR || 0,
            totalRevenue: facet.revenueStats[0]?.totalRevenue || 0,
            countsByStatus: facet.statusCounts,
            countsByPlan: facet.planCounts,
            recentTenants,
        };
    }

    async resendCredentials(tenantId) {
        const tenant = await this.getTenantById(tenantId);
        
        // Find owner user
        let owner = null;
        if (tenant.owner) {
            owner = await User.findById(tenant.owner);
        }
        
        if (!owner) {
            owner = await User.findOne({ email: tenant.email, tenantId: tenant._id });
        }

        if (!owner) throw new Error('Owner user not found for this salon.');

        // Update link if missing
        if (!tenant.owner) {
            tenant.owner = owner._id;
            await tenant.save();
        }

        const newPassword = '123456';
        owner.password = newPassword;
        await owner.save();

        await emailService.sendWelcomeEmail(tenant.email, tenant.ownerName, tenant.name, newPassword);
        return { success: true, email: tenant.email };
    }
}

export default new TenantService();
