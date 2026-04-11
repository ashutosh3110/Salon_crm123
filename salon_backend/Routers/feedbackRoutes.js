const express = require('express');
const router = express.Router();
const { 
    getFeedbacks, 
    createFeedback, 
    updateFeedbackStatus 
} = require('../Controllers/feedbackController');

router.route('/')
    .get(getFeedbacks)
    .post(createFeedback);

router.route('/:id')
    .patch(updateFeedbackStatus);

module.exports = router;
