const express = require('express');
const router = express.Router();
const {
    getMyGallery,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem
} = require('../Controllers/galleryController');
const { protect } = require('../Middleware/auth');

router.use(protect);

router.get('/me', getMyGallery);
router.post('/', addGalleryItem);
router.put('/:id', updateGalleryItem);
router.delete('/:id', deleteGalleryItem);

module.exports = router;
