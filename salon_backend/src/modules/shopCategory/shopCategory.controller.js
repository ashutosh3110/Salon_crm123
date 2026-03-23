import httpStatus from 'http-status-codes';
import mongoose from 'mongoose';
import shopCategoryService from './shopCategory.service.js';

const list = async (req, res, next) => {
    try {
        const result = await shopCategoryService.list(req.tenantId, { page: 1, limit: 200 });
        res.send(result);
    } catch (error) {
        next(error);
    }
};

/** Customer app / preview: categories for a salon without admin session */
const listByTenantPublic = async (req, res, next) => {
    try {
        const { tenantId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(tenantId)) {
            return res.status(httpStatus.BAD_REQUEST).send({
                success: false,
                message: 'Invalid tenant id',
                data: [],
            });
        }
        const result = await shopCategoryService.list(tenantId, { page: 1, limit: 200 });
        const rows = result?.results || [];
        res.send({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const doc = await shopCategoryService.create(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(doc);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const doc = await shopCategoryService.updateById(req.tenantId, req.params.shopCategoryId, req.body);
        if (!doc) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'Shop category not found' });
        }
        res.send(doc);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const doc = await shopCategoryService.deleteById(req.tenantId, req.params.shopCategoryId);
        if (!doc) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'Shop category not found' });
        }
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

export default {
    list,
    listByTenantPublic,
    create,
    update,
    remove,
};
