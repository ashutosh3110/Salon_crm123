import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import dashboardController from './dashboard.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router.get('/salon', authorize(['admin', 'manager']), dashboardController.getSalonDashboard);

router.get('/manager', authorize(['admin', 'manager']), dashboardController.getManagerDashboard);

router.get('/team', authorize(['admin', 'manager']), dashboardController.getManagerTeam);

router.get('/receptionist', authorize(['admin', 'manager', 'receptionist']), dashboardController.getReceptionistDashboard);

export default router;
