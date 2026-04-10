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
        
        let account = await User.findById(decoded.id);
        if (!account) {
            const Salon = require('../Models/Salon');
            account = await Salon.findById(decoded.id);
        }

        if (!account) {
            return res.status(401).json({ success: false, message: 'Account no longer exists' });
        }

        // Transform to plain object to allow adding virtual properties
        const userObj = account.toObject();

        // Add virtual role and salonId if it's a Salon document (owner)
        if (!userObj.role && userObj.ownerName) {
            userObj.role = 'admin';
            userObj.salonId = userObj._id;
        }

        // Security check: Block if inactive or salon is suspended
        if (userObj.isActive === false) {
            return res.status(403).json({ success: false, message: 'Account is inactive' });
        }

        if (userObj.status === 'suspended') {
            return res.status(403).json({ success: false, message: 'Salon is suspended' });
        }

        // If staff, check parent salon
        if (account.role && account.role !== 'superadmin' && account.role !== 'admin' && account.salonId) {
            const Salon = require('../Models/Salon');
            const parent = await Salon.findById(account.salonId);
            if (parent && (parent.status === 'suspended' || !parent.isActive)) {
                return res.status(403).json({ success: false, message: 'Salon access is paused' });
            }
        }

        req.user = userObj;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized`
            });
        }
        next();
    };
};
