import httpStatus from 'http-status-codes';
import userService from './user.service.js';

const createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser({
            ...req.body,
            tenantId: req.tenantId
        });
        res.status(httpStatus.CREATED).send(user);
    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await userService.queryUsers({ tenantId: req.tenantId });
        res.send(users);
    } catch (error) {
        next(error);
    }
};

const getUser = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.userId);
        if (!user || user.tenantId.toString() !== req.tenantId) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'User not found' });
        }
        res.send(user);
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const user = await userService.updateUserById(req.params.userId, req.body);
        res.send(user);
    } catch (error) {
        next(error);
    }
};

export default {
    createUser,
    getUsers,
    getUser,
    updateUser,
};
