import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import userController from './user.controller.js';

const router = express.Router();

router.use(auth);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.post('/change-password', userController.changePassword);

router.use(validateTenant);

router.post('/', userController.createUser);
router.get('/', userController.getUsers);

router.get('/:userId', userController.getUser);
router.patch('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);

export default router;
