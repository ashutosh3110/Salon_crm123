const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Middleware factory to process images to WebP format
 * Support for single (req.file) and multiple (req.files) uploads
 * @param {string} subfolder - The subfolder within uploads/ to save the file
 */
const processToWebP = (subfolder) => async (req, res, next) => {
    // Check both req.file and req.files
    const files = req.file ? [req.file] : (req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : []);
    
    if (files.length === 0) return next();

    try {
        const uploadPath = path.join('uploads', subfolder);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        for (const file of files) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = `${subfolder}-${uniqueSuffix}.webp`;
            const fullPath = path.join(uploadPath, filename);

            // Process image to WebP with Sharp
            await sharp(file.buffer)
                .webp({ quality: 80 })
                .toFile(fullPath);

            // Update file details
            file.filename = filename;
            file.path = `/uploads/${subfolder}/${filename}`; // standardized relative path
            file.mimetype = 'image/webp';
        }

        next();
    } catch (error) {
        console.error('Image processing failed:', error);
        next();
    }
};

module.exports = { processToWebP };
