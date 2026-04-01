import express from 'express';
import supportController from './support.controller.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

/**
 * All routes require authentication
 */
router.use(auth);

/**
 * Ticket Management
 */
router.route('/tickets')
    .post(supportController.createTicket)
    .get(supportController.getTickets);

router.route('/tickets/:id')
    .get(supportController.getTicket)
    .patch(supportController.updateTicket);

router.route('/tickets/:id/responses')
    .post(supportController.addResponse);

export default router;
