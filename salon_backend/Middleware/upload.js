const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfs',
    api_key: process.env.CLOUDINARY_API_KEY || '123',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
});

// Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'salon_blogs',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});

// Generic local storage with subfolder support
const createDiskStorage = (subfolder) => multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join('uploads', subfolder);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, subfolder + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const categoryUpload = multer({ storage: createDiskStorage('categories') });
const serviceUpload = multer({ storage: createDiskStorage('services') });
const memoryStorage = multer.memoryStorage();
const optimizedUpload = multer({ storage: memoryStorage });

module.exports = { cloudinary, upload, categoryUpload, serviceUpload, optimizedUpload };
