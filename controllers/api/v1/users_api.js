// user_api.js (controller)

// Importing the necessary modules
const jwt = require('jsonwebtoken');
const User = require('../../../models/user');
const OTP = require('../../../models/otp');
// hashing the password
const bcrypt = require('bcrypt');
// importing dotenv to use environment variables
require('dotenv').config();

const sendVerificationEmail = require('../../../utility/sendVerificationEmail');

// Create a new user (Signup)
module.exports.create = function(req, res) {
    // console.log(req.body);
    // 2nd layer email of '@sliet.ac.in'
    if (!req.body.email.endsWith('@sliet.ac.in')) {
        return res.status(400).json({
            message: "Invalid Email. Please use your SLIET Email ID",
            nextAction: '/signup' // Link to signup page
        });
    }
    // 2nd layer
    if (req.body.confirmPassword !== req.body.password) {
        return res.status(303).json({
            message: "Confirm Password didn't match",
            nextAction: '/signup' // Link to signup page to retry
        });
    }

    // Check if the email already exists
    User.findOne({ user_email: req.body.email })
        .then((oldUser) => {
            if (!oldUser) {
                // Hash the password before storing
                const saltRounds = 10;
                bcrypt
                    .hash(req.body.password, saltRounds)
                    .then((hashedPassword) => {
                        // Create the new user with hashed password
                        User.create({
                            user_email: req.body.email,
                            // user_is_verified: false,
                            user_name: req.body.name,
                            user_mobile: req.body.mobile,
                            user_password: hashedPassword,
                            user_hostel: req.body.hostel,
                            // user_sells: [],
                            // user_buys: []
                        })
                        .then((newUser) => {
                            // Sending the email verification
                            // console.log("NEW USER CREATED");
                            sendVerificationEmail(newUser, res);
                            // Sending the WhatsApp message
                            // sendWhatsAppMessage(newUser, res);
                            
                            // Responding to client
                            return res.status(200).json({
                                status: "PENDING",
                                message: "Verification OTP sent successfully",
                                email: newUser.user_email,
                                nextAction: '/verify-otp' // Link to OTP verification page
                            });
                            
                        })
                        .catch((err) => {
                            console.error("Error in creating the new User:", err);
                            logger.error(`Error in creating the new User: ${err.message}`);
                            return res.status(500).json({
                                error: "Error in creating the new User",
                                nextAction: '/signup' // Link to signup page to retry
                            });
                        });
                    })
                    .catch((err)=>{
                        console.error("Error hashing password:", err);
                        logger.error(`Error hashing password: ${err.message}`);
                        return res.status(500).json({
                            error: "Error hashing password",
                            nextAction: '/signup' // Link to signup page to retry
                        });
                    });
            } else {
                // sendVerificationEmail(oldUser, res);
                return res.status(422).json({
                    message: "Email Already Exists. Please Login/Verify",
                    nextAction: '/login' // Link to login or verify OTP
                });
            }
        })
    .catch((err) => {
        // console.error("Error in fetching the existing email:", err);
        console.error("Error in fetching the existing email:", err);
        logger.error(`Error fetching existing email: ${err.message}`);
        return res.status(500).json({
            error: "Internal Server Error",
            nextAction: '/signup' // Link to signup page
        });
    });
};

// Create a session (Login)
module.exports.createSession = async function(req, res) {
    try {
        const { email, password } = req.body;

        // Input Validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required.",
                nextAction: '/login' // Link back to login page
            });
        }

        // Find the user by email
        const user = await User.findOne({ user_email: email });
        if (!user) {
            return res.status(401).json({
                message: "Email not registered.",
                nextAction: '/signup' // Link back to login page
            });
        }

        // Check if user is verified
        if (!user.user_is_verified) {
            return res.status(403).json({
                message: "Email not verified. Please verify your email.",
                nextAction: '/verify-otp' // Link to OTP verification page
            });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.user_password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password.",
                nextAction: '/login' // Link back to login page
            });
        }

        // User is authenticated; generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.user_email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '30d' } // Token valid for 30 days
        );

        // Prepare user data to send back (excluding sensitive information)
        const foundUser = {
            user_email: user.user_email,
            user_name: user.user_name,
            user_mobile: user.user_mobile,
            user_hostel: user.user_hostel,
            // Add other fields as necessary, excluding password and sensitive data
        };

        // Respond to the client with the token and user info
        return res.status(200).json({
            message: 'Sign-in successful, JWT token generated',
            foundUser: foundUser,
            encodedToken: token,
            nextAction: '/home' // Link to user dashboard or home page
        });
    } catch (err) {
        console.error("Error during user login:", err);
        logger.error(`Error during user login for email ${req.body.email}: ${err.message}`);
        return res.status(500).json({
            message: "Internal Server Error",
            nextAction: '/login' // Link back to login page
        });
    }
};


// controllers/authController.js

// Controller to reset password
module.exports.resetPassword = async (req, res) => {
    try {
      const { email, otp, password } = req.body;
  
      // Input Validation
      if (!email || !otp || !password) {
        return res.status(400).json({
          message: 'Email, OTP, and new password are required.',
        });
      }
  
      // Validate password strength (e.g., minimum length)
      if (password.length < 6) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters long.',
        });
      }
  
      // Find the user by email
      const user = await User.findOne({ user_email: email });
      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
        });
      }
  
      // Find the OTP record for the user
      const otpRecord = await OTP.findOne({ otp_user: user._id }).sort({ createdAt: -1 });
      if (!otpRecord || !otpRecord.otp_resetPasswordAllowed) {
        return res.status(400).json({
          message: 'OTP verification required before resetting password.',
        });
      }
  
      // Verify the OTP again to ensure security
      const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otp_otpHashed);
      if (!isMatch) {
        return res.status(400).json({
          message: 'Invalid OTP. Please try again.',
        });
      }
  
      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Update the user's password
      user.user_password = hashedPassword;
      await user.save();
  
      // Delete the OTP record to prevent reuse
      await OTP.deleteMany({ otp_user: user._id });
  
      // Respond to the client
      return res.status(200).json({
        message: 'Password reset successful. You can now log in with your new password.',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      // logger.error(`Error resetting password for email ${req.body.email}: ${error.message}`);
      return res.status(500).json({
        message: 'Internal Server Error. Please try again later.',
      });
    }
};
  