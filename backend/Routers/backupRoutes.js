const express = require('express');
const router = express.Router();
const { generateBackup, getBackupHistory } = require('../Controllers/backupController');
const { protect, authorize } = require('../Middleware/auth');

router.post('/backup', protect, authorize('superadmin'), generateBackup);
router.get('/backup/history', protect, authorize('superadmin'), getBackupHistory);

module.exports = router;
