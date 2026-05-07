// @desc    Upload an image to Cloudinary and return URL
// @route   POST /api/upload
// @access  Private
const Setting = require('../Models/Setting');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

exports.uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const originalPath = req.file.path;
    const targetDir = path.dirname(originalPath);
    const filenameWithoutExt = path.parse(req.file.filename).name;
    const webpFilename = `${filenameWithoutExt}.webp`;
    const webpPath = path.join(targetDir, webpFilename);

    try {
        const settings = await Setting.findOne();
        const maxSize = settings?.maxImageSize || 5;
        const unit = settings?.maxImageSizeUnit || 'MB';
        
        let maxSizeBytes = maxSize * 1024 * 1024; // Default to MB
        if (unit === 'KB') {
            maxSizeBytes = maxSize * 1024;
        }

        if (req.file.size > maxSizeBytes) {
            if (fs.existsSync(originalPath)) {
                fs.unlinkSync(originalPath);
            }
            return res.status(400).json({ 
                success: false, 
                message: `Image too large. Maximum allowed size is ${maxSize}${unit}.` 
                });
        }

        // Convert to WebP using sharp
        await sharp(originalPath)
            .webp({ quality: 80 })
            .toFile(webpPath);

        // Delete the original file
        if (fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
        }

        const protocol = req.protocol;
        const host = req.get('host');
        // Determine the relative path for the URL (assuming uploads/general is the structure)
        const relativeDir = originalPath.includes('general') ? 'general' : '';
        const displayUrl = `${protocol}://${host}/uploads/${relativeDir}/${webpFilename}`;
        
        console.log('File converted to WebP:', webpPath);
        console.log('Returning URL:', displayUrl);

        res.status(200).json({
            success: true,
            url: displayUrl,
            public_id: webpFilename
        });

    } catch (err) {
        console.error('Image processing error:', err);
        // Cleanup original if something failed
        if (fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
        }
        res.status(500).json({ success: false, message: 'Error processing image' });
    }
};
