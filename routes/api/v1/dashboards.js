// Importing passport module to check authentication of API as middleware
const passport = require('passport');
// Import the express module
const express = require('express');
// Creating an instance of router to help separate the route & controller
const router = express.Router();

const productApi = require('../../../controllers/api/v1/dashboards_api');

// Route to get the list of all products
router.get('/sell-response',passport.authenticate('jwt', { session: false }), productApi.sellResponse);
// Route to get a specific product by its ID
router.get('/buy-request',passport.authenticate('jwt', { session: false }), productApi.buyRequest);

// Exporting router config to all files so that index.js (of v1) can use it
module.exports = router;
