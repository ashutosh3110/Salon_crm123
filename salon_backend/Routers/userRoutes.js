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
const checkImageLimit = require('../Middleware/imageLimit');

// router.use(protect); // Move to specific routes
// No global authorize to allow customer access to some routes

router
    .route('/')
    .get(getUsers) // Public, but filtered by salonId in controller
    .post(protect, authorize('admin', 'manager'), optimizedUpload.single('avatar'), checkImageLimit, processToWebP('staff'), createUser);

router
    .route('/:id')
    .get(protect, authorize('admin', 'manager'), getUser)
    .patch(protect, authorize('admin', 'manager'), optimizedUpload.single('avatar'), checkImageLimit, processToWebP('staff'), updateUser)
    .delete(protect, authorize('admin', 'manager'), deleteUser);

module.exports = router;
