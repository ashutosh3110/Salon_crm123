import express from 'express';
import blogController from './blog.controller.js';
import upload from '../../middlewares/upload.js';

const router = express.Router();

router.post('/upload-image', upload.single('image'), blogController.uploadImage);

router
    .route('/')
    .post(blogController.createBlog)
    .get(blogController.getBlogs);

router
    .route('/:slug')
    .get(blogController.getBlog);

router
    .route('/:id')
    .patch(blogController.updateBlog)
    .delete(blogController.deleteBlog);

export default router;
