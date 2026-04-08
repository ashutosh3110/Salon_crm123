import httpStatus from 'http-status-codes';

/**
 * RBAC middleware
 * @param {string[]} requiredRoles 
 */
const authorize = (requiredRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Unauthorized' });
        }

        // superadmin can access everything
        if (req.user.role === 'superadmin') {
            return next();
        }

        if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
            const msg = `Forbidden: Insufficient role. User role is '${req.user.role}', but required is one of [${requiredRoles.join(', ')}]`;
            console.log(`[Role] ${msg} for ${req.originalUrl}`);
            return res.status(httpStatus.FORBIDDEN).send({ message: msg });
        }

        next();
    };
};

export default authorize;
