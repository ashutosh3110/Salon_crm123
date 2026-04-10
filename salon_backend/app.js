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
const payments = require('./Routers/paymentRoutes');
const tickets = require('./Routers/ticketRoutes');
const blogs = require('./Routers/blogRoutes');
const cms = require('./Routers/cmsRoutes');
const initCronJobs = require('./Utils/cronJobs');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/salons', salons);
app.use('/api/inquiries', inquiries);
app.use('/api/plans', plans);
app.use('/api/settings', settings);
app.use('/api/payments', payments);
app.use('/api/tickets', tickets);
app.use('/api/blogs', blogs);
app.use('/api/cms', cms);

// Initialize Cron Jobs
initCronJobs();

// Root route
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Salon CRM API v1' });
});

module.exports = app;
