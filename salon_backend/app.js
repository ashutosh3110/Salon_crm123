const express = require('express');
const cors = require('cors');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
const auth = require('./Routers/authRoutes');
const salons = require('./Routers/salonRoutes');
const inquiries = require('./Routers/inquiryRoutes');
const plans = require('./Routers/planRoutes');
const settings = require('./Routers/settingRoutes');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/salons', salons);
app.use('/api/inquiries', inquiries);
app.use('/api/plans', plans);
app.use('/api/settings', settings);

// Root route
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Salon CRM API v1' });
});

module.exports = app;
