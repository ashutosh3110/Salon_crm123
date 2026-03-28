import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure temp upload directory exists
const uploadDir = 'uploads/tmp';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|xlsx|xls|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // Mime types for Excel/CSV:
    // .xlsx: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    // .xls: application/vnd.ms-excel
    // .csv: text/csv, application/csv
    const isExcelOrCsv = /spreadsheetml|excel|csv/.test(file.mimetype);
    const mimetype = isExcelOrCsv || /image/.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp) and data files (xlsx, xls, csv) are allowed!'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter,
});

export default upload;
