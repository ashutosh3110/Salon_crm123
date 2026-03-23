import express from 'express';
import cmsController from './cms.controller.js';
import appCmsController from './appCms.controller.js';
import auth from '../../middlewares/auth.js';
import role from '../../middlewares/role.js';

const router = express.Router();

// Customer app & public preview: read CMS by salon tenant (no auth)
router.get('/app/tenant/:tenantId', appCmsController.getAppCMSByTenant);

const appAuth = [auth, role(['admin', 'owner', 'manager', 'superadmin'])];
router.get('/app', ...appAuth, appCmsController.getAppCMS);
router.patch('/app/:section', ...appAuth, appCmsController.updateAppCMSSection);

router.get('/', cmsController.getCMSData);
router.patch('/:section', cmsController.updateCMSSection);

export default router;
