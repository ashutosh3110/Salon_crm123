import httpStatus from 'http-status-codes';
import userService from './user.service.js';

async function createUser(req, res, next) {
    try {
        const user = await userService.createUser({
            ...req.body,
            tenantId: req.tenantId
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
        const users = await userService.queryUsers({ tenantId: req.tenantId });
        res.send(users);
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
        const userObj = req.user.toObject ? req.user.toObject() : req.user;
        delete userObj.password;
        res.send(userObj);
    } catch (error) {
        next(error);
    }
}

async function updateMe(req, res, next) {
    try {
        if (!req.user) {
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'User not found in request' });
        }
        const user = await userService.updateUserById(req.user.id || req.user._id, req.body);
        const userObj = user.toObject();
        delete userObj.password;
        res.send(userObj);
    } catch (error) {
        next(error);
    }
}

async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!(await req.user.isPasswordMatch(currentPassword))) {
            return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Incorrect current password' });
        }
        await userService.updateUserById(req.user.id || req.user._id, { password: newPassword });
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
};
