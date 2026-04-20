// @desc    Upload an image to Cloudinary and return URL
// @route   POST /api/upload
// @access  Private
exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Construct full absolute URL for local environment
    const filename = req.file.filename;
    const protocol = req.protocol;
    const host = req.get('host');
    const displayUrl = `${protocol}://${host}/uploads/general/${filename}`;
    
    console.log('File uploaded local path:', req.file.path);
    console.log('Returning URL:', displayUrl);

    res.status(200).json({
        success: true,
        url: displayUrl,
        public_id: filename
    });
};
