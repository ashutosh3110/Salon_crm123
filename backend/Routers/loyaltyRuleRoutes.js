const express = require('express');
const router = express.Router();
const { getLoyaltyRules } = require('../Controllers/homePageController');

router.get('/', getLoyaltyRules);

module.exports = router;
