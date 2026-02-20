import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import userController from './user.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router
    .route('/')
    .post(userController.createUser)
    .get(userController.getUsers);

router
    .route('/:userId')
    .get(userController.getUser)
    .patch(userController.updateUser);

export default router;
