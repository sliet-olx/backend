// Importing passport module to check authentication of API as middleware
const passport = require('passport');
// Import the express module
const express = require('express');
// Creating an instance of router to help separate the route & controller
const router = express.Router();

const productApi = require('../../../controllers/api/v1/products_api');

// Route to get a specific product by its ID
router.get('/:id', productApi.getProduct);

// Product creation feature is only available when the user is signed in
router.post('/create', passport.authenticate('jwt', { session: false }), productApi.create);

// Route to delete a product, only accessible when authenticated
router.delete('/destroy/:id', passport.authenticate('jwt', { session: false }), productApi.destroy); // prevent session cookie from being generated

// Route to get the list of all products
router.get('/', productApi.index);

// Exporting router config to all files so that index.js (of v1) can use it
module.exports = router;
