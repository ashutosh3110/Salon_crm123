const express = require('express');
const router = express.Router();
const {
    createConsultation,
    getConsultations,
    getConsultationDetails,
    updateConsultation,
    deleteConsultation,
    getCustomerConsultations
} = require('../Controllers/consultationController');
const { protect, authorize } = require('../Middleware/auth');

// All routes require authentication
router.use(protect);

// Customer specific consultations (Must be listed BEFORE the /:id parameters)
router.get('/customer/me', getCustomerConsultations);

// Admin / Staff CRUD Operations
router
    .route('/')
    .post(authorize('admin', 'manager', 'stylist', 'receptionist'), createConsultation)
    .get(authorize('admin', 'manager', 'stylist', 'receptionist', 'p:crm'), getConsultations);

router
    .route('/:id')
    .get(authorize('admin', 'manager', 'stylist', 'receptionist', 'p:crm'), getConsultationDetails)
    .patch(authorize('admin', 'manager', 'stylist', 'receptionist'), updateConsultation)
    .delete(authorize('admin', 'manager'), deleteConsultation);

module.exports = router;
