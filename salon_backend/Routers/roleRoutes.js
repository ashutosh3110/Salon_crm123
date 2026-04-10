const express = require('express');
const router = express.Router();
const {
    getRoles,
    createRole,
    updateRole,
    deleteRole
} = require('../Controllers/roleController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);
router.use(authorize('admin')); // Only salon owners can manage roles

router.route('/')
    .get(getRoles)
    .post(createRole);

router.route('/:id')
    .put(updateRole)
    .delete(deleteRole);

module.exports = router;
