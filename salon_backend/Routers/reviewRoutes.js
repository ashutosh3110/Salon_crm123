const express = require('express');
const router = express.Router();
const { getTrustedReviews } = require('../Controllers/homePageController');

router.get('/trusted/:outletId', getTrustedReviews);

module.exports = router;
