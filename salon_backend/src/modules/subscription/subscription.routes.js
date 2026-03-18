import express from 'express';
import auth from '../../middlewares/auth.js';
import role from '../../middlewares/role.js';
import subscriptionController from './subscription.controller.js';

const router = express.Router();

router
    .route('/')
    .post(auth, role(['superadmin']), subscriptionController.createSubscription)
    .get(subscriptionController.getSubscriptions);

router
    .route('/stats')
    .get(auth, role(['superadmin']), subscriptionController.getStats);

router
    .route('/:id')
    .get(subscriptionController.getSubscription)
    .patch(auth, role(['superadmin']), subscriptionController.updateSubscription)
    .delete(auth, role(['superadmin']), subscriptionController.deleteSubscription);

export default router;
