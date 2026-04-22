const Setting = require('../Models/Setting');
const fs = require('fs');

/**
 * Middleware to enforce dynamic image size limits set by Super Admin.
 * This should be placed AFTER multer middleware so req.file is available.
 */
const checkImageLimit = async (req, res, next) => {
    try {
        const settings = await Setting.findOne();
        const maxSize = settings?.maxImageSize || 5;
        const unit = settings?.maxImageSizeUnit || 'MB';
        
        let maxSizeBytes = maxSize * 1024 * 1024;
        if (unit === 'KB') {
            maxSizeBytes = maxSize * 1024;
        }

        const files = req.file ? [req.file] : (req.files || []);
        
        for (const file of files) {
            if (file.size > maxSizeBytes) {
                // Delete ALL temporary files if even one is too large
                for (const f of files) {
                    if (f.path && fs.existsSync(f.path)) {
                        fs.unlinkSync(f.path);
                    }
                }
                return res.status(400).json({ 
                    success: false, 
                    message: `Image too large. Maximum allowed size is ${maxSize}${unit}.` 
                });
            }
        }
        
        next();
    } catch (err) {
        console.error('[ImageLimit] Error:', err);
        next(); // Proceed anyway if settings can't be fetched
    }
};

module.exports = checkImageLimit;
