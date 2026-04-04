import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { supplierValidation } from '../../validations/supplier.validation.js';
import supplierController from './supplier.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router.get('/', authorize(['admin', 'manager', 'superadmin', 'accountant']), supplierController.getSuppliers);

router.get(
    '/invoices',
    authorize(['admin', 'manager', 'superadmin', 'inventory_manager', 'accountant']),
    validate(supplierValidation.listInvoices),
    supplierController.getSupplierInvoices
);
router.post(
    '/invoices/payments',
    authorize(['admin', 'manager', 'superadmin', 'inventory_manager', 'accountant']),
    validate(supplierValidation.recordInvoicePayment),
    supplierController.recordSupplierInvoicePayment
);

router.get('/:supplierId/ledger', authorize(['admin', 'manager', 'superadmin', 'accountant']), supplierController.getSupplierLedger);

router.post(
    '/',
    authorize(['admin', 'manager', 'superadmin', 'accountant']),
    validate(supplierValidation.create),
    supplierController.createSupplier
);
router.patch(
    '/:supplierId',
    authorize(['admin', 'manager', 'superadmin', 'accountant']),
    validate(supplierValidation.update),
    supplierController.patchSupplier
);
router.delete(
    '/:supplierId',
    authorize(['admin', 'manager', 'superadmin', 'accountant']),
    supplierController.removeSupplier
);

export default router;
