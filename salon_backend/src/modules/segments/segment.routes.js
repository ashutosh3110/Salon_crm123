import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { segmentValidation } from '../../validations/segment.validation.js';
import segmentController from './segment.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router.get('/', authorize(['admin', 'manager']), segmentController.getSegments);
router.post('/', authorize(['admin', 'manager']), validate(segmentValidation.create), segmentController.createSegment);
router.get('/:segmentId/customers', authorize(['admin', 'manager']), segmentController.getSegmentCustomers);
router.delete('/:segmentId', authorize(['admin', 'manager']), segmentController.deleteSegment);

export default router;

