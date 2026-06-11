const express = require('express');
const router = express.Router();
const { generateBackup, getBackupHistory, exportBackupJSON, restoreBackupJSON } = require('../Controllers/backupController');
const { protect, authorize } = require('../Middleware/auth');

router.post('/backup', protect, authorize('superadmin'), generateBackup);
router.get('/backup/json', protect, authorize('superadmin'), exportBackupJSON);
router.post('/restore', protect, authorize('superadmin'), restoreBackupJSON);
router.get('/backup/history', protect, authorize('superadmin'), getBackupHistory);

module.exports = router;
