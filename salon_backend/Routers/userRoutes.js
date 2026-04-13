const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../Controllers/userController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);
// No global authorize to allow customer access to some routes

router
    .route('/')
    .get(authorize('admin', 'manager', 'customer'), getUsers)
    .post(authorize('admin', 'manager'), createUser);

router
    .route('/:id')
    .get(authorize('admin', 'manager'), getUser)
    .patch(authorize('admin', 'manager'), updateUser)
    .delete(authorize('admin', 'manager'), deleteUser);

module.exports = router;
