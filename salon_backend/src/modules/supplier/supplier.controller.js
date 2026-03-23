import httpStatus from 'http-status-codes';
import supplierService from './supplier.service.js';

const getSuppliers = async (req, res, next) => {
    try {
        const data = await supplierService.listSuppliers(req.tenantId);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const createSupplier = async (req, res, next) => {
    try {
        const created = await supplierService.createSupplier(req.tenantId, req.body || {});
        res.status(httpStatus.CREATED).send({ success: true, data: created });
    } catch (error) {
        next(error);
    }
};

const patchSupplier = async (req, res, next) => {
    try {
        const { supplierId } = req.params;
        const updated = await supplierService.updateSupplier(req.tenantId, supplierId, req.body || {});
        if (!updated) {
            return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'Supplier not found' });
        }
        res.status(httpStatus.OK).send({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

const removeSupplier = async (req, res, next) => {
    try {
        const { supplierId } = req.params;
        await supplierService.deleteSupplier(req.tenantId, supplierId);
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

const getSupplierInvoices = async (req, res, next) => {
    try {
        const data = await supplierService.listSupplierInvoices(req.tenantId);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const recordSupplierInvoicePayment = async (req, res, next) => {
    try {
        const result = await supplierService.recordSupplierInvoicePayment(
            req.tenantId,
            req.user?._id,
            req.body || {}
        );
        res.status(httpStatus.CREATED).send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export default {
    getSuppliers,
    createSupplier,
    patchSupplier,
    removeSupplier,
    getSupplierInvoices,
    recordSupplierInvoicePayment,
};
