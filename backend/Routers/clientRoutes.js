const express = require('express');
const router = express.Router();
const {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    bulkImport,
    getPaymentDueClients,
    incrementReminderCount,
    sendManualPaymentReminder,
    registerCelebrationWish
} = require('../Controllers/clientController');
const { protect, authorize } = require('../Middleware/auth');

// All routes are protected
router.use(protect);

router.post('/bulk', authorize('admin', 'manager', 'receptionist'), bulkImport);

router.get('/payment-due', authorize('admin', 'manager', 'receptionist', 'p:marketing'), getPaymentDueClients);
router.patch('/:id/increment-reminder', authorize('admin', 'manager', 'receptionist'), incrementReminderCount);
router.patch('/:id/celebration-wish', authorize('admin', 'manager', 'receptionist'), registerCelebrationWish);
router.post('/:id/send-payment-reminder', authorize('admin', 'manager', 'receptionist'), sendManualPaymentReminder);

router
    .route('/')
    .get(authorize('admin', 'manager', 'receptionist', 'p:marketing'), getClients)
    .post(authorize('admin', 'manager', 'receptionist'), createClient);

router
    .route('/:id')
    .get(authorize('admin', 'manager', 'receptionist', 'p:marketing'), getClient)
    .patch(authorize('admin', 'manager', 'receptionist'), updateClient)
    .put(authorize('admin', 'manager', 'receptionist'), updateClient) // Support both PUT/PATCH
    .delete(authorize('admin', 'manager', 'receptionist'), deleteClient);

module.exports = router;
