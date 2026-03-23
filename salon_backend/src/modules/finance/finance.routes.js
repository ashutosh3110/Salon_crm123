import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { financeValidation } from '../../validations/finance.validation.js';
import financeController from './finance.controller.js';
import pettyCashController from './pettyCash.controller.js';
import cashBankController from './cashBank.controller.js';
import gstTaxController from './gstTax.controller.js';
import eodController from './eod.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

const pettyRoles = ['admin', 'manager', 'accountant', 'receptionist', 'superadmin'];
const financeStaffRoles = ['admin', 'manager', 'accountant', 'superadmin'];

router.get(
    '/expenses',
    authorize(['admin', 'manager', 'accountant', 'superadmin', 'inventory_manager']),
    validate(financeValidation.listExpenses),
    financeController.listExpenses
);
router.post(
    '/expenses',
    authorize(['admin', 'manager', 'accountant', 'superadmin']),
    validate(financeValidation.createExpense),
    financeController.createExpense
);

router.get('/petty-cash/summary', authorize(pettyRoles), pettyCashController.summary);
router.get('/petty-cash/entries', authorize(pettyRoles), validate(financeValidation.pettyCashList), pettyCashController.listEntries);
router.get('/petty-cash/closings', authorize(pettyRoles), validate(financeValidation.pettyCashList), pettyCashController.listClosings);
router.post('/petty-cash/open-day', authorize(pettyRoles), validate(financeValidation.pettyCashOpenDay), pettyCashController.openDay);
router.post('/petty-cash/fund', authorize(pettyRoles), validate(financeValidation.pettyCashFund), pettyCashController.addFund);
router.post('/petty-cash/expense', authorize(pettyRoles), validate(financeValidation.pettyCashExpense), pettyCashController.addExpense);
router.post('/petty-cash/close', authorize(pettyRoles), validate(financeValidation.pettyCashClose), pettyCashController.closeDay);

router.get(
    '/cash-bank',
    authorize(financeStaffRoles),
    validate(financeValidation.cashBankSummary),
    cashBankController.getSummary
);
router.post(
    '/cash-bank/reconcile',
    authorize(financeStaffRoles),
    validate(financeValidation.cashBankSave),
    cashBankController.saveReconciliation
);

router.get(
    '/tax/gst-summary',
    authorize(financeStaffRoles),
    validate(financeValidation.gstTaxSummary),
    gstTaxController.getGstSummary
);

router.get(
    '/eod/summary',
    authorize(financeStaffRoles),
    validate(financeValidation.eodSummary),
    eodController.getSummary
);
router.post(
    '/eod/close',
    authorize(financeStaffRoles),
    validate(financeValidation.eodClose),
    eodController.closeDay
);
router.get(
    '/eod/history',
    authorize(financeStaffRoles),
    validate(financeValidation.eodHistory),
    eodController.listHistory
);

export default router;
