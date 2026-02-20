import Tenant from '../tenant/tenant.model.js';
import User from '../user/user.model.js';
import Outlet from '../outlet/outlet.model.js';
import httpStatus from 'http-status-codes';

class OnboardingService {
    async getStatus(tenantId, user) {
        const tenant = await Tenant.findById(tenantId);
        return {
            onboardingStatus: user.onboardingStatus,
            onboardingStep: tenant.onboardingStep,
            salonDetails: {
                name: tenant.name,
                phone: user.phone
            }
        };
    }

    async confirmSalonDetails(tenantId, salonData) {
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) throw new Error('Tenant not found');

        Object.assign(tenant, salonData);
        tenant.onboardingStep = 'SALON_CONFIRMED';
        tenant.onboardingStatus = 'IN_PROGRESS';
        await tenant.save();
        return tenant;
    }

    async createInitialOutlet(tenantId, outletData) {
        const outlet = await Outlet.create({
            ...outletData,
            tenantId,
            isMain: true,
        });

        await Tenant.findByIdAndUpdate(tenantId, {
            onboardingStep: 'OUTLET_CREATED',
        });

        return outlet;
    }

    async addInitialStaff(tenantId, staffData) {
        // Check if staff already exists
        const existingUser = await User.findOne({ email: staffData.email });
        if (existingUser) throw new Error('Email already registered');

        const staff = await User.create({
            ...staffData,
            tenantId,
            status: 'active',
        });

        await Tenant.findByIdAndUpdate(tenantId, {
            onboardingStep: 'STAFF_ADDED',
        });

        return staff;
    }

    async completeOnboarding(tenantId, userId) {
        const tenant = await Tenant.findById(tenantId);
        const outletCount = await Outlet.countDocuments({ tenantId });
        const staffCount = await User.countDocuments({ tenantId, role: { $ne: 'admin' } });

        if (tenant.onboardingStep !== 'STAFF_ADDED' || outletCount === 0 || staffCount === 0) {
            throw new Error('Please complete all previous steps before finalizing onboarding');
        }

        // Mark as completed in both Tenant and User
        await Tenant.findByIdAndUpdate(tenantId, {
            onboardingStatus: 'COMPLETED'
        });

        await User.findByIdAndUpdate(userId, {
            onboardingStatus: 'COMPLETED'
        });

        return { success: true, onboardingStatus: 'COMPLETED' };
    }
}

export default new OnboardingService();
