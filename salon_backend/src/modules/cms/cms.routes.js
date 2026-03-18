import express from 'express';
import cmsController from './cms.controller.js';

const router = express.Router();

router.get('/', cmsController.getCMSData);
router.patch('/:section', cmsController.updateCMSSection);

export default router;
