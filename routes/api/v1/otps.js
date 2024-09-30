// userRoutes.js

const express = require('express');
const router = express.Router();
const otpApi = require('../../../controllers/api/v1/otp_api'); // Adjust the path as necessary

// Route for verifying OTP
router.post('/verify-otp', otpApi.verifyOtp);

// Route for regenerating OTP
router.post('/regenerate-otp', otpApi.regenerateOtp);

module.exports = router;