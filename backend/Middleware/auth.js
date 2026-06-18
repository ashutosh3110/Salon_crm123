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

        // Security check: Block if inactive or salon is suspended (unless impersonated by SuperAdmin)
        const isImpersonated = !!decoded.impersonatedBy;
        if (isImpersonated) {
            userObj.impersonatedBy = decoded.impersonatedBy;
        }

        if (!isImpersonated) {
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
        }

        // Standardize ID property
        userObj.id = userObj._id;

        // Normalize 'manger' to 'manager'
        if (userObj.role === 'manger') {
            userObj.role = 'manager';
        }

        // Fetch Role Info (permissions, adminMenuAccess, etc) to attach to userObj
        if (userObj.role === 'superadmin' || userObj.role === 'admin') {
            userObj.permissions = ['*'];
            userObj.roleType = userObj.role;
            userObj.hiddenSidebarItems = [];
            userObj.adminMenuAccess = [];
        } else if (userObj.salonId && (userObj.roleId || userObj.role)) {
            let roleDoc = null;
            const Role = require('../Models/Role');
            if (userObj.roleId) {
                roleDoc = await Role.findById(userObj.roleId);
            }
            if (!roleDoc && userObj.role) {
                roleDoc = await Role.findOne({ 
                    salonId: userObj.salonId, 
                    name: { $regex: new RegExp(`^${userObj.role}$`, 'i') } 
                });
            }

            if (roleDoc) {
                userObj.permissions = roleDoc.permissions || [];
                userObj.roleType = roleDoc.roleType || 'custom';
                userObj.hiddenSidebarItems = roleDoc.hiddenSidebarItems || [];
                userObj.adminMenuAccess = roleDoc.adminMenuAccess || [];
            } else {
                const rName = (userObj.role || '').toLowerCase();
                if (rName.includes('stylist') || rName.includes('stylish')) userObj.roleType = 'stylist';
                else if (rName.includes('receptionist')) userObj.roleType = 'receptionist';
                else if (rName.includes('manager')) userObj.roleType = 'manager';
                else if (rName.includes('accountant')) userObj.roleType = 'accountant';
                else if (rName.includes('inventory')) userObj.roleType = 'inventory';
                else userObj.roleType = 'custom';
                userObj.permissions = [];
                userObj.hiddenSidebarItems = [];
                userObj.adminMenuAccess = [];
            }
        }

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

        // Fetch role info if not already attached to req.user
        if (user.roleId && !user.roleType) {
            try {
                const Role = require('../Models/Role');
                const roleDoc = await Role.findById(user.roleId);
                if (roleDoc) {
                    user.permissions = roleDoc.permissions || [];
                    user.roleType = roleDoc.roleType || 'custom';
                    user.hiddenSidebarItems = roleDoc.hiddenSidebarItems || [];
                    user.adminMenuAccess = roleDoc.adminMenuAccess || [];
                }
            } catch (err) {
                console.error('Error fetching role details in middleware:', err);
            }
        }

        // Auto-infer roleType if not found in db but roleName exists
        if (user.role && !user.roleType) {
            const rName = user.role.toLowerCase();
            if (rName.includes('stylist') || rName.includes('stylish')) user.roleType = 'stylist';
            else if (rName.includes('receptionist')) user.roleType = 'receptionist';
            else if (rName.includes('manager')) user.roleType = 'manager';
            else if (rName.includes('accountant')) user.roleType = 'accountant';
            else if (rName.includes('inventory')) user.roleType = 'inventory';
            else user.roleType = 'custom';
        }

        // Check if any of the requirements are met
        let isAuthorized = false;

        for (const reqmt of requirements) {
            // Check for specific role name or role type
            if (user.role === reqmt || user.roleType === reqmt) {
                isAuthorized = true;
                break;
            }

            // Check for permission (prefixed with p:)
            if (reqmt.startsWith('p:')) {
                const permissionNeeded = reqmt.split(':')[1];

                if (user.permissions && (
                    user.permissions.includes(permissionNeeded) ||
                    user.permissions.includes('*') ||
                    user.permissions.some(p => p.startsWith(permissionNeeded + '_'))
                )) {
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
