// @desc    Upload an image to Cloudinary and return URL
// @route   POST /api/upload
// @access  Private
exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Multer-storage-cloudinary automatically uploads the file to Cloudinary
    // and adds the Cloudinary response to req.file
    res.status(200).json({
        success: true,
        url: req.file.path || req.file.secure_url,
        public_id: req.file.filename
    });
};
