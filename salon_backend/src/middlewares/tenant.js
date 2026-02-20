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
        return res.status(httpStatus.FORBIDDEN).send({ message: 'Tenant context missing' });
    }

    // Force req.tenantId from user record to ensure isolation
    req.tenantId = req.user.tenantId.toString();
    next();
};

export default validateTenant;
