const express = require('express');
const router = express.Router();
const { getServiceCategoriesByOutlet } = require('../Controllers/homePageController');

router.get('/:outletId', getServiceCategoriesByOutlet);

module.exports = router;
