const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory, bulkImportCategories } = require('../Controllers/categoryController');
const { optimizedUpload } = require('../Middleware/upload');
const { processToWebP } = require('../Middleware/imageProcessor');
const { protect, authorize } = require('../Middleware/auth');
const checkImageLimit = require('../Middleware/imageLimit');

router.post('/bulk-import', protect, authorize('admin', 'manager', 'p:setup'), optimizedUpload.single('file'), bulkImportCategories);

router
    .route('/')
    .get(protect, getCategories)
    .post(protect, authorize('admin', 'manager', 'p:setup'), optimizedUpload.single('image'), checkImageLimit, processToWebP('categories'), createCategory);

router
    .route('/:id')
    .put(protect, authorize('admin', 'manager', 'p:setup'), optimizedUpload.single('image'), checkImageLimit, processToWebP('categories'), updateCategory)
    .delete(protect, authorize('admin', 'manager', 'p:setup'), deleteCategory);

module.exports = router;
