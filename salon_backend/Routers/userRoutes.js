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
const { optimizedUpload } = require('../Middleware/upload');
const { processToWebP } = require('../Middleware/imageProcessor');

router.use(protect);
// No global authorize to allow customer access to some routes

router
    .route('/')
    .get(authorize('admin', 'manager', 'customer'), getUsers)
    .post(authorize('admin', 'manager'), optimizedUpload.single('avatar'), processToWebP('staff'), createUser);

router
    .route('/:id')
    .get(authorize('admin', 'manager'), getUser)
    .patch(authorize('admin', 'manager'), optimizedUpload.single('avatar'), processToWebP('staff'), updateUser)
    .delete(authorize('admin', 'manager'), deleteUser);

module.exports = router;
