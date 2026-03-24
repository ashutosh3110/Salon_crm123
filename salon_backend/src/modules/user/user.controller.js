import httpStatus from 'http-status-codes';
import userService from './user.service.js';
import Tenant from '../tenant/tenant.model.js';

async function createUser(req, res, next) {
    try {
        if (req.body?.role === 'superadmin') {
            return res.status(httpStatus.FORBIDDEN).send({ message: 'Cannot create superadmin' });
        }
        if (req.user.role === 'manager' && req.body?.role === 'admin') {
            return res.status(httpStatus.FORBIDDEN).send({ message: 'Not allowed' });
        }
        const user = await userService.createUser({
            ...req.body,
            tenantId: req.tenantId,
        });
        const userObj = user.toObject();
        delete userObj.password;
        res.status(httpStatus.CREATED).send(userObj);
    } catch (error) {
        next(error);
    }
}

async function getUsers(req, res, next) {
    try {
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100));
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        
        const filter = { tenantId: req.tenantId };
        if (req.query.role) filter.role = req.query.role;
        if (req.query.outletId) filter.outletId = req.query.outletId;

        // Exclude current user from their own staff list
        const myId = req.user?._id || req.user?.id;
        if (myId) {
            filter._id = { $ne: myId };
        }

        // Enforcement for receptionists
        if (req.user?.role === 'receptionist' && req.user.outletId) {
            filter.outletId = req.user.outletId;
        }

        console.log('[DEBUG] getUsers Filter:', JSON.stringify(filter));

        const data = await userService.queryUsers(
            filter,
            { limit, page, populate: { path: 'outletId', select: 'name' } }
        );
        const results = (data.results || []).map((u) => {
            const o = u.toObject ? u.toObject() : u;
            delete o.password;
            return o;
        });
        res.send({ ...data, results });
    } catch (error) {
        next(error);
    }
}

async function getUser(req, res, next) {
    const { userId } = req.params;
    
    if (userId === 'me') {
        return getMe(req, res, next);
    }

    try {
        const user = await userService.getUserById(userId);
        if (!user || (user.tenantId && user.tenantId.toString() !== req.tenantId && req.user.role !== 'superadmin')) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'User not found' });
        }
        const userObj = user.toObject();
        delete userObj.password;
        res.send(userObj);
    } catch (error) {
        next(error);
    }
}

async function updateUser(req, res, next) {
    const { userId } = req.params;

    if (userId === 'me') {
        return updateMe(req, res, next);
    }

    try {
        const existing = await userService.getUserById(userId);
        if (!existing) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'User not found' });
        }
        if (
            req.user.role !== 'superadmin' &&
            existing.tenantId?.toString() !== req.tenantId
        ) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'User not found' });
        }
        if (req.user.role === 'manager') {
            if (['admin', 'superadmin'].includes(existing.role)) {
                return res.status(httpStatus.FORBIDDEN).send({ message: 'Not allowed' });
            }
            if (req.body?.role === 'admin' || req.body?.role === 'superadmin') {
                return res.status(httpStatus.FORBIDDEN).send({ message: 'Not allowed' });
            }
        }
        const user = await userService.updateUserById(userId, req.body);
        const userObj = user.toObject();
        delete userObj.password;
        res.send(userObj);
    } catch (error) {
        next(error);
    }
}

async function getMe(req, res, next) {
    try {
        if (!req.user) {
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'User not found in request' });
        }
        const id = req.user._id || req.user.id;
        const fresh = await userService.getUserById(id);
        if (!fresh) {
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'User not found' });
        }
        await fresh.populate({ path: 'outletId', select: 'name address' });
        const userObj = fresh.toObject();
        delete userObj.password;

        // Merge Tenant Subscription Info
        if (fresh.tenantId) {
            const tenant = await Tenant.findById(fresh.tenantId).select('subscriptionPlan status');
            if (tenant) {
                userObj.subscriptionPlan = tenant.subscriptionPlan;
                userObj.subscriptionStatus = tenant.status;
            }
        }

        res.send(userObj);
    } catch (error) {
        next(error);
    }
}

const ALLOWED_PROFILE_FIELDS = [
    'name',
    'email',
    'phone',
    'specialist',
    'dob',
    'address',
    'pan',
    'bankName',
    'bankAccountNo',
    'ifsc',
];

const STYLIST_SELF_FIELDS = [
    'avatar',
    'stylistBio',
    'stylistExperience',
    'stylistClientsLabel',
    'stylistSpecializations',
    'stylistSkills',
    'stylistWeeklyAvailability',
];

async function updateMe(req, res, next) {
    try {
        if (!req.user) {
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'User not found in request' });
        }
        const patch = {};
        for (const key of ALLOWED_PROFILE_FIELDS) {
            if (req.body[key] !== undefined) {
                patch[key] = req.body[key];
            }
        }
        if (req.user.role === 'stylist') {
            for (const key of STYLIST_SELF_FIELDS) {
                if (req.body[key] !== undefined) {
                    patch[key] = req.body[key];
                }
            }
            if (req.body.outletId !== undefined) {
                patch.outletId = req.body.outletId;
            }
        }
        const user = await userService.updateUserById(req.user.id || req.user._id, patch);
        await user.populate({ path: 'outletId', select: 'name address' });
        const userObj = user.toObject();
        delete userObj.password;
        res.send({ success: true, data: userObj });
    } catch (error) {
        next(error);
    }
}

async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || String(newPassword).length < 8) {
            return res.status(httpStatus.BAD_REQUEST).send({ message: 'New password must be at least 8 characters' });
        }
        const fresh = await userService.getUserById(req.user.id || req.user._id);
        if (!fresh) {
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'User not found' });
        }
        if (!(await fresh.isPasswordMatch(currentPassword))) {
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Incorrect current password' });
        }
        await userService.updateUserById(fresh._id, { password: newPassword });
        res.status(httpStatus.OK).send({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
}

async function deleteUser(req, res, next) {
    const { userId } = req.params;
    try {
        const myId = req.user?._id?.toString?.() || req.user?.id?.toString?.();
        if (userId === myId) {
            return res.status(httpStatus.BAD_REQUEST).send({ message: 'Cannot delete your own account' });
        }
        const user = await userService.getUserById(userId);
        if (!user || user.tenantId?.toString() !== req.tenantId) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'User not found' });
        }
        if (req.user.role === 'manager' && ['admin', 'superadmin'].includes(user.role)) {
            return res.status(httpStatus.FORBIDDEN).send({ message: 'Not allowed' });
        }
        await userService.deleteUserById(userId);
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
}

export default {
    createUser,
    getUsers,
    getUser,
    updateUser,
    getMe,
    updateMe,
    changePassword,
    deleteUser,
};
