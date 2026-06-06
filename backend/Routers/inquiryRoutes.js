const express = require('express');
const router = express.Router();
const { 
    getInquiries, 
    createInquiry, 
    updateInquiryStatus, 
    deleteInquiry 
} = require('../Controllers/inquiryController');
const { protect } = require('../Middleware/auth');

router.route('/')
    .get(protect, getInquiries)
    .post(createInquiry);

router.route('/:id')
    .patch(protect, updateInquiryStatus)
    .delete(protect, deleteInquiry);

module.exports = router;
