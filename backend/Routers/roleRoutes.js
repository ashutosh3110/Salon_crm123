const express = require('express');
const router = express.Router();
const {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getDefaults
} = require('../Controllers/roleController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);
router.use(authorize('admin', 'p:manage_roles')); // Salon owners and roles manager can manage roles

router.get('/defaults/:roleType', getDefaults);

router.route('/')
    .get(getRoles)
    .post(createRole);

router.route('/:id')
    .put(updateRole)
    .delete(deleteRole);

module.exports = router;
