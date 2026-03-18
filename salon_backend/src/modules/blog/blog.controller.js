import httpStatus from 'http-status-codes';
import fs from 'fs';
import blogService from './blog.service.js';
import { uploadToCloudinary } from '../../utils/cloudinary.js';

const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(httpStatus.BAD_REQUEST).send({ message: 'No image file provided' });
        }

        let result;
        try {
            result = await uploadToCloudinary(req.file.path);
            // Remove file from local temp storage after Cloudinary upload
            fs.unlinkSync(req.file.path);
            res.send({
                url: result.secure_url || result.url,
                public_id: result.public_id,
                storage: 'cloudinary'
            });
        } catch (cloudinaryError) {
            console.error('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
            // Move file to a more permanent local storage or just keep it in uploads/tmp for now but rename if needed
            // For now, let's just return the local path
            const localhost = req.get('host');
            const protocol = req.protocol;
            const localUrl = `${protocol}://${localhost}/${req.file.path.replace(/\\/g, '/')}`;
            
            res.send({
                url: localUrl,
                public_id: req.file.filename,
                storage: 'local'
            });
        }
    } catch (error) {
        next(error);
    }
};

const createBlog = async (req, res, next) => {
    try {
        console.log('Creating blog with body:', req.body);
        const blog = await blogService.createBlog(req.body);
        res.status(httpStatus.CREATED).send(blog);
    } catch (error) {
        console.error('CRITICAL: createBlog failed:', error);
        next(error);
    }
};

const getBlogs = async (req, res, next) => {
    try {
        const blogs = await blogService.getBlogs(req.query);
        res.send(blogs);
    } catch (error) {
        next(error);
    }
};

const getBlog = async (req, res, next) => {
    try {
        const blog = await blogService.getBlogBySlug(req.params.slug);
        if (!blog) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'Blog not found' });
        }
        res.send(blog);
    } catch (error) {
        next(error);
    }
};

const updateBlog = async (req, res, next) => {
    try {
        const blog = await blogService.updateBlogById(req.params.id, req.body);
        res.send(blog);
    } catch (error) {
        next(error);
    }
};

const deleteBlog = async (req, res, next) => {
    try {
        await blogService.deleteBlogById(req.params.id);
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

export default {
    uploadImage,
    createBlog,
    getBlogs,
    getBlog,
    updateBlog,
    deleteBlog,
};
