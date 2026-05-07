const express = require('express');
const { getTickets, getTicket, createTicket, updateTicketStatus, deleteTicket, addResponse } = require('../Controllers/ticketController');
const { protect, authorize } = require('../Middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getTickets)
    .post(createTicket);

router.route('/:id')
    .get(getTicket)
    .patch(updateTicketStatus)
    .delete(authorize('superadmin'), deleteTicket);

router.route('/:id/responses')
    .post(addResponse);

module.exports = router;
