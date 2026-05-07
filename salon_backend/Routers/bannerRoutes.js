const express = require('express');
const router = express.Router();
const { getBanners } = require('../Controllers/homePageController');

router.get('/', getBanners);

module.exports = router;
