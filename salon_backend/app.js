const express = require('express');
const cors = require('cors');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


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
const productCategories = require('./Routers/productCategoryRoutes');
const products = require('./Routers/productRoutes');
const feedbacks = require('./Routers/feedbackRoutes');
const loyalty = require('./Routers/loyaltyRoutes');
const promotions = require('./Routers/promotionRoutes');
const cart = require('./Routers/cartRoutes');
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
app.use('/api/product-categories', productCategories);
app.use('/api/products', products);
app.use('/api/feedbacks', feedbacks);
app.use('/api/loyalty', loyalty);
app.use('/api/promotions', promotions);
app.use('/api/cart', cart);


// Initialize Cron Jobs
initCronJobs();

// Root route
const uploads = require('./Routers/uploadRoutes');
app.use('/api/uploads', uploads);

module.exports = app;
