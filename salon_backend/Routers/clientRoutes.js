const express = require('express');
const router = express.Router();
const {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient
} = require('../Controllers/clientController');
const { protect, authorize } = require('../Middleware/auth');

// All routes are protected
router.use(protect);

router
    .route('/')
    .get(authorize('admin', 'manager', 'receptionist'), getClients)
    .post(authorize('admin', 'manager', 'receptionist'), createClient);

router
    .route('/:id')
    .get(authorize('admin', 'manager', 'receptionist'), getClient)
    .patch(authorize('admin', 'manager', 'receptionist'), updateClient)
    .put(authorize('admin', 'manager', 'receptionist'), updateClient) // Support both PUT/PATCH
    .delete(authorize('admin', 'manager', 'receptionist'), deleteClient);

module.exports = router;
