import User from '../modules/user/user.model.js';
import Product from '../modules/product/product.model.js';
import Service from '../modules/service/service.model.js';
import Tenant from '../modules/tenant/tenant.model.js';

/**
 * Service to fetch current usage counts for various features
 */
export const getCurrentUsage = async (tenantId, feature) => {
    switch (feature) {
        case 'staff':
            return await User.countDocuments({ tenantId, role: { $ne: 'admin' } }); // Admin is usually owner
        case 'products':
            return await Product.countDocuments({ tenantId });
        case 'services':
            return await Service.countDocuments({ tenantId });
        case 'outlets':
            // Placeholder for future multi-outlet logic
            return 1;
        default:
            return 0;
    }
};

/**
 * Fetch tenant plan info
 */
export const getTenantPlan = async (tenantId) => {
    const tenant = await Tenant.findById(tenantId);
    return tenant?.subscriptionPlan || 'FREE';
};
