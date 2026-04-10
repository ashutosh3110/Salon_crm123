const express = require('express');
const cors = require('cors');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
const auth = require('./Routers/authRoutes');

// Mount routers
app.use('/api/auth', auth);

// Root route
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Salon CRM API v1' });
});

module.exports = app;
