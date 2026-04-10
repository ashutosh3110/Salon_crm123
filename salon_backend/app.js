const express = require('express');
const cors = require('cors');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
const auth = require('./Routers/authRoutes');
const customerAuth = require('./Routers/customerAuthRoutes');
const salons = require('./Routers/salonRoutes');
const outlets = require('./Routers/outletRoutes');
const roles = require('./Routers/roleRoutes');
const inquiries = require('./Routers/inquiryRoutes');
const plans = require('./Routers/planRoutes');
const settings = require('./Routers/settingRoutes');
const payments = require('./Routers/paymentRoutes');
const tickets = require('./Routers/ticketRoutes');
const blogs = require('./Routers/blogRoutes');
const cms = require('./Routers/cmsRoutes');
const users = require('./Routers/userRoutes');
const services = require('./Routers/serviceRoutes');
const categories = require('./Routers/categoryRoutes');
const bookings = require('./Routers/bookingRoutes');
const initCronJobs = require('./Utils/cronJobs');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/auth', customerAuth);
app.use('/api/salons', salons);
app.use('/api/outlets', outlets);
app.use('/api/roles', roles);
app.use('/api/inquiries', inquiries);
app.use('/api/plans', plans);
app.use('/api/settings', settings);
app.use('/api/payments', payments);
app.use('/api/tickets', tickets);
app.use('/api/blogs', blogs);
app.use('/api/cms', cms);
app.use('/api/users', users);
app.use('/api/services', services);
app.use('/api/categories', categories);
app.use('/api/bookings', bookings);

// Initialize Cron Jobs
initCronJobs();

// Root route
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Salon CRM API v1' });
});

module.exports = app;
