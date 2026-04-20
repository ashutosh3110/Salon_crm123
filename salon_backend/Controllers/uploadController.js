// @desc    Upload an image to Cloudinary and return URL
// @route   POST /api/upload
// @access  Private
const Setting = require('../Models/Setting');
const fs = require('fs');

exports.uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
        const settings = await Setting.findOne();
        const maxSizeMB = settings?.maxImageSize || 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (req.file.size > maxSizeBytes) {
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ 
                success: false, 
                message: `Image too large. Maximum allowed size is ${maxSizeMB}MB.` 
            });
        }
    } catch (err) {
        console.error('File size validation error:', err);
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
