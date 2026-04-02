import httpStatus from 'http-status-codes';

const validateTenant = (req, res, next) => {
    if (!req.user) {
        return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authentication required' });
    }

    // Superadmins can bypass tenant validation or we might set a current tenant based on header
    if (req.user.role === 'superadmin') {
        const impersonateTenantId = req.headers['x-tenant-id'];
        if (impersonateTenantId) {
            req.tenantId = impersonateTenantId;
        }
        return next();
    }

    if (!req.user.tenantId) {
        console.warn(`[Tenant] Missing tenantId for user ${req.user._id} (${req.user.role})`);
        return res.status(httpStatus.FORBIDDEN).send({ message: 'Tenant context missing' });
    }

    // Force req.tenantId from user record to ensure isolation
    const requestedTenantId = req.headers['x-tenant-id'];
    if (req.user.role === 'customer') {
        if (!requestedTenantId) {
            console.warn('[Tenant] Customer request missing x-tenant-id header');
            return res.status(httpStatus.BAD_REQUEST).send({ message: 'Tenant ID is required for booking' });
        }
        req.tenantId = requestedTenantId.toString();
    } else {
        if (!req.user.tenantId) {
            console.warn(`[Tenant] User ${req.user._id} (${req.user.role}) has no assigned tenantId`);
            return res.status(httpStatus.FORBIDDEN).send({ message: 'User not assigned to any tenant' });
        }
        req.tenantId = req.user.tenantId.toString();
    }
    next();
};

export const publicTenant = (req, res, next) => {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
        return res.status(httpStatus.BAD_REQUEST).send({ message: 'X-Tenant-Id header is required' });
    }
    req.tenantId = tenantId.toString();
    next();
};

export default validateTenant;
