import httpStatus from 'http-status-codes';
import productService from './product.service.js';

const pickProductPayload = (body = {}) => {
    const extended =
        body.extended && typeof body.extended === 'object' && !Array.isArray(body.extended)
            ? body.extended
            : {};
    const price = Number(body.price);
    return {
        name: body.name,
        sku: body.sku,
        price: Number.isFinite(price) ? price : 0,
        category: body.category != null ? String(body.category) : '',
        status: body.status === 'inactive' ? 'inactive' : 'active',
        extended,
    };
};

const createProduct = async (req, res, next) => {
    try {
        const payload = pickProductPayload(req.body);
        const product = await productService.createProduct(req.tenantId, payload);
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
            forceRefresh: !!req.query._v,
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

const updateProduct = async (req, res, next) => {
    try {
        const body = req.body || {};
        const update = {};
        if (body.name != null) update.name = body.name;
        if (body.sku != null) update.sku = body.sku;
        if (body.price != null) update.price = body.price;
        if (body.category != null) update.category = String(body.category);
        if (body.status != null) update.status = body.status === 'inactive' ? 'inactive' : 'active';
        if (body.extended != null && typeof body.extended === 'object' && !Array.isArray(body.extended)) {
            update.extended = body.extended;
        }
        const product = await productService.updateProductById(req.tenantId, req.params.productId, update);
        res.send(product);
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProductById(req.tenantId, req.params.productId);
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

export default {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
};
