import express from 'express';
import marketingController from './marketing.controller.js';
import auth from '../../middlewares/auth.js';
import role from '../../middlewares/role.js';

const router = express.Router();
const marketingAuth = [auth, role(['admin', 'owner', 'manager', 'superadmin'])];

router.get('/dashboard', ...marketingAuth, marketingController.getDashboard);
router.get('/segments', ...marketingAuth, marketingController.getSegments);
router.get('/campaigns', ...marketingAuth, marketingController.getCampaigns);
router.post('/campaigns', ...marketingAuth, marketingController.createCampaign);
router.get('/automations', ...marketingAuth, marketingController.getAutomations);
router.patch('/automations/:flowId', ...marketingAuth, marketingController.updateAutomation);

export default router;
