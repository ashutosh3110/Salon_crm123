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
            return res.status(httpStatus.FORBIDDEN).send({ message: 'Forbidden: Insufficient role' });
        }

        next();
    };
};

export default authorize;
