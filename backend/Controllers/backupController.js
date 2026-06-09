const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const BackupLog = require('../Models/BackupLog');

exports.generateBackup = async (req, res) => {
    try {
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.archive.gz`;
        const tempDir = path.join(__dirname, '../uploads/temp_backups');
        
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
