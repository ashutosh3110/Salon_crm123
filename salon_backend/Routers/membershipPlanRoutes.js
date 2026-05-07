const express = require('express');
const router = express.Router();
const { getMembershipPlans } = require('../Controllers/homePageController');

router.get('/:outletId', getMembershipPlans);

module.exports = router;
