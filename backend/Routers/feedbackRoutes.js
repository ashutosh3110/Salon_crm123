const express = require('express');
const router = express.Router();
const { 
    getFeedbacks, 
    createFeedback, 
    updateFeedbackStatus 
} = require('../Controllers/feedbackController');

const { protect } = require('../Middleware/auth');

router.route('/')
    .get(getFeedbacks)
    .post(protect, createFeedback);

router.route('/:id')
    .patch(updateFeedbackStatus);

module.exports = router;
