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
    getInactiveClients,
    incrementReminderCount,
    sendManualPaymentReminder,
    registerCelebrationWish,
    sendManualCelebrationWish,
    getStylistRoster,
    getStylistClientHistory
} = require('../Controllers/clientController');
const { protect, authorize } = require('../Middleware/auth');

// All routes are protected
router.use(protect);

router.post('/bulk', authorize('admin', 'manager', 'receptionist'), bulkImport);

router.get('/payment-due', authorize('admin', 'manager', 'receptionist', 'p:marketing'), getPaymentDueClients);
router.get('/inactive', authorize('admin', 'manager', 'receptionist', 'p:crm_reengage'), getInactiveClients);
router.patch('/:id/increment-reminder', authorize('admin', 'manager', 'receptionist'), incrementReminderCount);
router.patch('/:id/celebration-wish', authorize('admin', 'manager', 'receptionist'), registerCelebrationWish);
router.post('/:id/send-payment-reminder', authorize('admin', 'manager', 'receptionist'), sendManualPaymentReminder);
router.post('/:id/send-celebration-wish', authorize('admin', 'manager', 'receptionist'), sendManualCelebrationWish);

router.get('/stylist-roster', authorize('admin', 'manager', 'receptionist', 'stylist', 'stylish'), getStylistRoster);
router.get('/:id/stylist-history', authorize('admin', 'manager', 'receptionist', 'stylist', 'stylish'), getStylistClientHistory);

router
    .route('/')
    .get(authorize('admin', 'manager', 'receptionist', 'p:marketing'), getClients)
    .post(authorize('admin', 'manager', 'receptionist', 'stylist', 'stylish'), createClient);

router
    .route('/:id')
    .get(authorize('admin', 'manager', 'receptionist', 'p:marketing'), getClient)
    .patch(authorize('admin', 'manager', 'receptionist'), updateClient)
    .put(authorize('admin', 'manager', 'receptionist'), updateClient) // Support both PUT/PATCH
    .delete(authorize('admin', 'manager', 'receptionist'), deleteClient);

module.exports = router;
