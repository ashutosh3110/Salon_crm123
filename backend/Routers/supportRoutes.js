const express = require('express');
const router = express.Router();
const { 
    getFaqs, createTicket, getMyTickets, addTicketResponse, 
    createFaq, updateFaq, deleteFaq,
    getAdminTickets, getSuperAdminTickets, updateTicketStatus, escalateTicket
} = require('../Controllers/SupportController');
const { protect, authorize } = require('../Middleware/auth');

// Public routes
router.get('/faqs', getFaqs);

// Protected routes
router.post('/tickets', protect, createTicket);
router.get('/my-tickets', protect, getMyTickets);
router.post('/tickets/:id/response', protect, addTicketResponse);

// Admin FAQ routes
router.post('/faqs', protect, authorize('superadmin'), createFaq);
router.patch('/faqs/:id', protect, authorize('superadmin'), updateFaq);
router.delete('/faqs/:id', protect, authorize('superadmin'), deleteFaq);

// Admin Ticket routes
router.get('/admin/tickets', protect, authorize('admin', 'manager'), getAdminTickets);
router.patch('/tickets/:id/status', protect, authorize('admin', 'manager', 'superadmin'), updateTicketStatus);
router.patch('/tickets/:id/escalate', protect, authorize('admin', 'manager'), escalateTicket);

// SuperAdmin Ticket routes
router.get('/superadmin/tickets', protect, authorize('superadmin'), getSuperAdminTickets);

module.exports = router;
