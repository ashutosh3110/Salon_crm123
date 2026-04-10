const Blog = require('../Models/Blog');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json(blog);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private/SuperAdmin
exports.createBlog = async (req, res) => {
    try {
        const blog = await Blog.create(req.body);
        res.status(201).json(blog);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update blog
// @route   PATCH /api/blogs/:id
// @access  Private/SuperAdmin
exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!blog) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json(blog);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/SuperAdmin
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Not found' });
        await blog.deleteOne();
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Upload blog image
// @route   POST /api/blogs/upload-image
// @access  Private/SuperAdmin
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }
        res.status(200).json({ success: true, url: req.file.path });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
