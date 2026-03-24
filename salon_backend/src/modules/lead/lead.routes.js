import express from 'express';
import auth from '../../middlewares/auth.js';
import authorize from '../../middlewares/role.js';
import leadController from './lead.controller.js';

const router = express.Router();

// Public route for lead submission
router.post('/', leadController.createLead);

// Superadmin routes for managing leads
router.get('/', auth, authorize(['superadmin']), leadController.getLeads);
router.patch('/:leadId', auth, authorize(['superadmin']), leadController.updateLead);
router.delete('/:leadId', auth, authorize(['superadmin']), leadController.deleteLead);

export default router;
