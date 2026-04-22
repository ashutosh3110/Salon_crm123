const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Enable CORS
app.use(cors({
    origin: '*',
    credentials: true
}));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const wallet = require('./Routers/walletRoutes');
const orders = require('./Routers/orderRoutes');
const dashboard = require('./Routers/dashboardRoutes');
const billing = require('./Routers/billingRoutes');
const clients = require('./Routers/clientRoutes');
const pos = require('./Routers/posRoutes');
const inventory = require('./Routers/inventoryRoutes');
const hr = require('./Routers/hrRoutes');
const finance = require('./Routers/financeRoutes');
const marketing = require('./Routers/marketingRoutes');
const initCronJobs = require('./Utils/cronJobs');

// Mount routers
app.use('/auth', customerAuth);
app.use('/auth', auth);
app.use('/salons', salons);
app.use('/outlets', outlets);
app.use('/roles', roles);
app.use('/clients', clients);
app.use('/inquiries', inquiries);
app.use('/plans', plans);
app.use('/settings', settings);
app.use('/payments', payments);
app.use('/tickets', tickets);
app.use('/blogs', blogs);
app.use('/cms', cms);
app.use('/users', users);
app.use('/services', services);
app.use('/categories', categories);
app.use('/bookings', bookings);
app.use('/product-categories', productCategories);
app.use('/products', products);
app.use('/feedbacks', feedbacks);
app.use('/loyalty', loyalty);
app.use('/promotions', promotions);
app.use('/cart', cart);
app.use('/wallet', wallet);
app.use('/orders', orders);
app.use('/dashboard', dashboard);
app.use('/billing', billing);
app.use('/pos', pos);
app.use('/inventory', inventory);
app.use('/hr', hr);
app.use('/finance', finance);
app.use('/marketing', marketing);


// Initialize Cron Jobs
initCronJobs();

// Root route
const uploads = require('./Routers/uploadRoutes');
app.use('/uploads', uploads);

module.exports = app;