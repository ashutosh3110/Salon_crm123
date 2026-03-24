import express from 'express';
import supportController from './support.controller.js';
import passport from 'passport';

const router = express.Router();

/**
 * All routes require authentication
 */
router.use(passport.authenticate('jwt', { session: false }));

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
