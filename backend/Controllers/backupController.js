const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const mongoose = require('mongoose');
const BackupLog = require('../Models/BackupLog');

// Import all models dynamically to ensure they are registered with Mongoose
const modelsDir = path.join(__dirname, '../Models');
fs.readdirSync(modelsDir).forEach(file => {
    if (file.endsWith('.js')) {
        try {
            require(path.join(modelsDir, file));
        } catch (e) {
            console.error(`Error loading model ${file}:`, e);
        }
    }
});

exports.generateBackup = async (req, res) => {
    try {
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.archive.gz`;
        const tempDir = path.join(os.tmpdir(), 'salon_crm_backups');
        
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const backupPath = path.join(tempDir, filename);
        
        // Execute mongodump command
        const dbUri = process.env.MONGODB_URI;
        
        exec(`mongodump --uri="${dbUri}" --archive="${backupPath}" --gzip`, async (error, stdout, stderr) => {
            if (error) {
                console.error('Database backup failed:', error);
                console.error('Stderr:', stderr);
                
                // Log failure to db
                await BackupLog.create({
                    filename,
                    size: 0,
                    status: 'failed',
                    performedBy: req.user._id,
                    ipAddress,
                    errorMessage: error.message || stderr
                });
                
                return res.status(500).json({
                    success: false,
                    message: 'Backup generation failed. Please ensure mongodump is installed and try again.'
                });
            }
            
            // Get file size
            let stats = { size: 0 };
            try {
                stats = fs.statSync(backupPath);
            } catch (statErr) {
                console.error('Error stating backup file:', statErr);
            }
            
            // Log success to db
            await BackupLog.create({
                filename,
                size: stats.size,
                status: 'success',
                performedBy: req.user._id,
                ipAddress
            });
            
            // Send file for download
            res.download(backupPath, filename, (downloadErr) => {
                // Delete temporary backup file after download
                try {
                    if (fs.existsSync(backupPath)) {
                        fs.unlinkSync(backupPath);
                    }
                } catch (unlinkErr) {
                    console.error('Error deleting temp backup file:', unlinkErr);
                }
            });
        });
        
    } catch (err) {
        console.error('Backup error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getBackupHistory = async (req, res) => {
    try {
        const history = await BackupLog.find()
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 });
            
        res.json({
            success: true,
            data: history
        });
    } catch (err) {
        console.error('Error fetching backup history:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.exportBackupJSON = async (req, res) => {
    try {
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const dbBackup = {};
        const modelNames = Object.keys(mongoose.models);
        
        for (const modelName of modelNames) {
            const Model = mongoose.models[modelName];
            const data = await Model.find({}).lean();
            dbBackup[modelName] = data;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.json`;
        
        // Log snapshot creation to database
        const tempDir = path.join(os.tmpdir(), 'salon_crm_backups');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempFilePath = path.join(tempDir, filename);
        fs.writeFileSync(tempFilePath, JSON.stringify(dbBackup, null, 2));

        await BackupLog.create({
            filename,
            size: fs.statSync(tempFilePath).size,
            status: 'success',
            performedBy: req.user ? req.user._id : null,
            ipAddress,
            errorMessage: 'JSON Backup Generated'
        });

        // Cleanup temp file
        fs.unlinkSync(tempFilePath);

        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-type', 'application/json');
        res.send(JSON.stringify(dbBackup, null, 2));
    } catch (err) {
        console.error('JSON Backup failed:', err);
        res.status(500).json({ success: false, message: 'Server Error during JSON Backup' });
    }
};

exports.restoreBackupJSON = async (req, res) => {
    try {
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        
        // 1. Safety Backup of Current DB
        const currentBackup = {};
        const modelNames = Object.keys(mongoose.models);
        for (const modelName of modelNames) {
            currentBackup[modelName] = await mongoose.models[modelName].find({}).lean();
        }
        const tempDir = path.join(os.tmpdir(), 'salon_crm_backups');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const safetyFilename = `pre-restore-safety-backup-${Date.now()}.json`;
        const tempFilePath = path.join(tempDir, safetyFilename);
        fs.writeFileSync(tempFilePath, JSON.stringify(currentBackup, null, 2));

        // Create safety backup log
        await BackupLog.create({
            filename: safetyFilename,
            size: fs.statSync(tempFilePath).size,
            status: 'success',
            performedBy: req.user ? req.user._id : null,
            ipAddress,
            errorMessage: 'Auto Safety Backup Before Restore'
        });

        // 2. Read and Validate Uploaded Data
        const backupData = req.body;
        if (!backupData || typeof backupData !== 'object') {
            return res.status(400).json({ success: false, message: 'Invalid backup format' });
        }

        // 3. Delete Old Data & Insert New Data
        for (const modelName of Object.keys(backupData)) {
            const Model = mongoose.models[modelName];
            if (Model) {
                await Model.deleteMany({});
                if (Array.isArray(backupData[modelName]) && backupData[modelName].length > 0) {
                    // Filter out invalid items and insert
                    await Model.insertMany(backupData[modelName]);
                }
            }
        }

        res.json({
            success: true,
            message: 'Database restored successfully'
        });
    } catch (err) {
        console.error('Database restore failed:', err);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
};
