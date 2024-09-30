// Importing passport module to check authentication of API as middleware
const passport = require('passport');
// Import the express module
const express = require('express');
// Creating an instance of router to help separate the route & controller
const router = express.Router();

const productApi = require('../../../controllers/api/v1/products_api');

// Route to get the list of all products
router.get('/', productApi.getAllProducts);
// Route to get a specific product by its ID
router.get('/:id',passport.authenticate('jwt', { session: false }), productApi.getProduct);

// Product creation feature is only available when the user is signed in
router.post('/create', passport.authenticate('jwt', { session: false }), productApi.create);

// Route to update a product label
router.post('/sold', passport.authenticate('jwt', { session: false }), productApi.sold);

// Route to buy a product
router.post('/buy', passport.authenticate('jwt', { session: false }), productApi.buy);

// Exporting router config to all files so that index.js (of v1) can use it
module.exports = router;
