const jwt = require('jsonwebtoken');
const User = require('../Models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 1. Check SuperAdmin (User)
        let account = await User.findById(decoded.id);
        
        // 2. Check Staff (Salon Employees)
        if (!account) {
            const Staff = require('../Models/Staff');
            account = await Staff.findById(decoded.id);
        }

        // 3. Check Salon Owner
        if (!account) {
            const Salon = require('../Models/Salon');
            account = await Salon.findById(decoded.id);
        }

        // 4. Check Customer
        if (!account) {
            const Customer = require('../Models/Customer');
            account = await Customer.findById(decoded.id);
            if (account) {
                // If found in Customer collection, ensure they have the 'customer' role
                const custObj = account.toObject();
                custObj.role = 'customer';
                account = custObj;
            }
        }

        if (!account) {
            return res.status(401).json({ success: false, message: 'Account no longer exists' });
        }

        // Transform to plain object to allow adding virtual properties
        const userObj = account.toObject ? account.toObject() : account;

        // Add virtual role and salonId if it's a Salon document (owner)
        if (!userObj.role && userObj.ownerName) {
            userObj.role = 'admin';
            userObj.salonId = userObj._id;
        }

        // Standardize customer role
        if (!userObj.role && userObj.phone && !userObj.ownerName) {
            userObj.role = 'customer';
        }

        // Security check: Block if inactive or salon is suspended
        if (userObj.isActive === false) {
            return res.status(403).json({ success: false, message: 'Account is inactive' });
        }

        if (userObj.status === 'suspended') {
            return res.status(403).json({ success: false, message: 'Access is suspended' });
        }

        // If staff, check parent salon
        if (userObj.role && !['superadmin', 'admin', 'customer'].includes(userObj.role) && userObj.salonId) {
            const Salon = require('../Models/Salon');
            const parent = await Salon.findById(userObj.salonId);
            if (parent && (parent.status === 'suspended' || !parent.isActive)) {
                return res.status(403).json({ success: false, message: 'Salon access is paused' });
            }
        }

        // Standardize ID property
        userObj.id = userObj._id;

        req.user = userObj;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};

exports.authorize = (...requirements) => {
    return async (req, res, next) => {
        const user = req.user;
        
        // Always allow superadmin and salon owner (admin) to access their routes
        if (['superadmin', 'admin'].includes(user.role)) {
            return next();
        }

        // Check if any of the requirements are met
        let isAuthorized = false;

        for (const reqmt of requirements) {
            // Check for specific role name
            if (user.role === reqmt) {
                isAuthorized = true;
                break;
            }

            // Check for permission (prefixed with p:)
            if (reqmt.startsWith('p:')) {
                const permissionNeeded = reqmt.split(':')[1];
                
                // Fetch permissions if not already attached to req.user
                if (!user.permissions && user.roleId) {
                    try {
                        const Role = require('../Models/Role');
                        const roleDoc = await Role.findById(user.roleId);
                        if (roleDoc) {
                            user.permissions = roleDoc.permissions;
                        }
                    } catch (err) {
                        console.error('Error fetching role permissions in middleware:', err);
                    }
                }

                if (user.permissions && (user.permissions.includes(permissionNeeded) || user.permissions.includes('*'))) {
                    isAuthorized = true;
                    break;
                }
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: `User role ${user.role} is not authorized for this action`
            });
        }
        
        next();
    };
};
