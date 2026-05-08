const express = require('express');
const router = express.Router();
const { 
    getFeedbacks, 
    createFeedback, 
    updateFeedbackStatus,
    getCustomerFeedbacks
} = require('../Controllers/feedbackController');

const { protect } = require('../Middleware/auth');

router.route('/')
    .get(getFeedbacks)
    .post(protect, createFeedback);

router.get('/customer/:customerId', getCustomerFeedbacks);

router.route('/:id')
    .patch(updateFeedbackStatus);

module.exports = router;
