// Import the express module
const express = require('express');

// Creating a router instance
const router = express.Router();

// Routes for /api/users and /api/products requests
router.use('/users', require('./users'));
router.use('/products', require('./products'));
router.use('/otps', require('./otps'));
router.use('/dashboards', require('./dashboards'));

// Exporting router configuration for use in index.js
module.exports = router;
