import httpStatus from 'http-status-codes';

const validateTenant = (req, res, next) => {
    // Superadmins can bypass tenant validation or we might set a current tenant based on header
    if (req.user.role === 'superadmin') {
        // Optionally set req.tenantId if provided in header for superadmin to 'impersonate'
        const impersonateTenantId = req.headers['x-tenant-id'];
        if (impersonateTenantId) {
            req.tenantId = impersonateTenantId;
        }
        return next();
    }

    if (!req.user.tenantId) {
        console.log(`[Tenant] Forbidden: Tenant context missing for ${req.user.role} on ${req.originalUrl}`);
        return res.status(httpStatus.FORBIDDEN).send({ message: 'Tenant context missing' });
    }

    // Force req.tenantId from user record to ensure isolation
    // EXCEPTION: Customers can interact with multiple tenants (salons), so we allow them to specify context via header.
    const requestedTenantId = req.headers['x-tenant-id'];
    if (req.user.role === 'customer' && requestedTenantId) {
        req.tenantId = requestedTenantId.toString();
    } else {
        req.tenantId = req.user.tenantId.toString();
    }
    next();
};

export default validateTenant;
