import httpStatus from 'http-status-codes';
import productService from './product.service.js';

const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(product);
    } catch (error) {
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
        };
        const result = await productService.queryProducts(req.tenantId, filter, options);
        res.send(result);
    } catch (error) {
        next(error);
    }
};

const getProduct = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.tenantId, req.params.productId);
        res.send(product);
    } catch (error) {
        next(error);
    }
};

export default {
    createProduct,
    getProducts,
    getProduct,
};
