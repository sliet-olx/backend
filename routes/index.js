// Import the express module
const express = require('express');

// Creating a router instance
const router = express.Router();

// API routes
router.use('/api', require('./api'));

// Export the router configuration
module.exports = router;
