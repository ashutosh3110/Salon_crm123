const express = require('express');
const router = express.Router();
const { 
    getInquiries, 
    createInquiry, 
    updateInquiryStatus, 
    deleteInquiry 
} = require('../Controllers/inquiryController');

router.route('/')
    .get(getInquiries)
    .post(createInquiry);

router.route('/:id')
    .patch(updateInquiryStatus)
    .delete(deleteInquiry);

module.exports = router;
