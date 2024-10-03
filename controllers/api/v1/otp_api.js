
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user');
const OTP = require('../../../models/otp');
const sendVerificationEmail = require('../../../utility/sendVerificationEmail');

module.exports.verifyOtp = async (req, res) => {
    try {
        // from the request
        const { email, otp } = req.body;

        // Input Validation
        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required.',
                nextAction: '/regenerate-otp'
            });
        }

        // Find the user by email
        const user = await User.findOne({ user_email: email });
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                nextAction: '/signup'
            });
        }

        // Check if user is already verified
        if (user.user_is_verified) {
            return res.status(400).json({
                message: 'User is already verified.',
                nextAction: '/login'
            });
        }

        // Find the OTP record for the user
        const otpRecord = await OTP.findOne({ otp_user: user._id }).sort({ createdAt: -1 });
        if (!otpRecord) {
            return res.status(400).json({
                message: 'OTP not found. Please request a new one.',
                nextAction: '/regenerate-otp'
            });
        }

        // Check if OTP is expired
        if (Date.now() > otpRecord.expiresAt) {
            return res.status(400).json({
                message: 'OTP has expired. Please request a new one.',
                nextAction: '/regenerate-otp'
            });
        }

        // Compare the submitted OTP with the hashed OTP in the database
        const isMatch = await bcrypt.compare(otp, otpRecord.otp_otpHashed);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid OTP. Please try again.',
                nextAction: '/verify-otp'
            });
        }

        // OTP is valid; mark the user as verified
        user.user_is_verified = true;
        await user.save();

        // Optionally, delete the OTP record to prevent reuse
        await OTP.deleteMany({ otp_user: user._id });

        // Respond to the client
        return res.status(200).json({
            message: 'Email verified successfully.',
            nextAction: '/login'
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        logger.error(`Error verifying OTP for email ${req.body.email}: ${error.message}`);
        return res.status(500).json({
            message: 'Internal Server Error.',
            nextAction: '/regenerate-otp'
        });
    }
};

// Controller to regenerate OTP
module.exports.regenerateOtp = async function(req, res) {
    try {
        const { email } = req.body;

        // Input Validation
        if (!email) {
            return res.status(400).json({
                message: 'Email is required.',
                nextAction: '/regenerate-otp'
            });
        }

        // Validate email domain
        if (!email.endsWith('@sliet.ac.in')) {
            return res.status(400).json({
                message: 'Invalid Email. Please use your SLIET Email ID.',
                nextAction: '/regenerate-otp'
            });
        }

        // Find the user by email
        const user = await User.findOne({ user_email: email });
        if (!user) {
            return res.status(404).json({
                message: 'User not found. Please sign up.',
                nextAction: '/signup'
            });
        }

        // Check if user is already verified
        if (user.user_is_verified) {
            return res.status(400).json({
                message: 'User is already verified. Please log in.',
                nextAction: '/login'
            });
        }

        // Generate a new OTP
        const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP

        // Hash the OTP
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp.toString(), saltRounds);

        // Delete any existing OTPs for this user to prevent multiple valid OTPs
        await OTP.deleteMany({ otp_user: user._id });

        // Create and save the new OTP record
        await OTP.create({
            otp_user: user._id,
            otp_otpHashed: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000 // OTP valid for 10 minutes
        });

        // Send the OTP via Email
        sendVerificationEmail(user, otp);

        // Optionally, send the OTP via WhatsApp
        // await sendWhatsAppMessage(user, otp);

        // Respond to the client
        return res.status(200).json({
            status: 'PENDING',
            message: 'A new verification OTP has been sent to your email.',
            nextAction: '/verify-otp'
        });

    } catch (error) {
        console.error('Error regenerating OTP:', error);
        return res.status(500).json({
            status: 'FAILED',
            message: 'Internal Server Error. Please try again later.',
            nextAction: '/regenerate-otp'
        });
    }
};

// Controller to send OTP for password reset
module.exports.sendPasswordResetOtp = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Input Validation
      if (!email) {
        return res.status(400).json({
          message: 'Email is required.',
        });
      }
  
      // Validate email domain
      if (!email.endsWith('@sliet.ac.in')) {
        return res.status(400).json({
          message: 'Invalid Email. Please use your SLIET Email ID.',
        });
      }
  
      // Find the user by email
      const user = await User.findOne({ user_email: email });
      if (!user) {
        return res.status(404).json({
          message: 'User not found. Please sign up.',
        });
      }
  
      // Generate a new OTP
      const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  
      // Hash the OTP
      const saltRounds = 10;
      const hashedOTP = await bcrypt.hash(otp.toString(), saltRounds);
  
      // Delete any existing OTPs for this user
      await OTP.deleteMany({ otp_user: user._id });
  
      // Create and save the new OTP record
      const otpRecord = new OTP({
        otp_user: user._id,
        otp_otpHashed: hashedOTP,
        expiresAt: Date.now() + 600000, // OTP valid for 10 minutes
      });
      await otpRecord.save();
  
      // Send the OTP via Email
      sendVerificationEmail(user, res);
  
      // Respond to the client
      return res.status(200).json({
        message: 'An OTP has been sent to your email.',
      });
    } catch (error) {
      console.error('Error sending password reset OTP:', error);
      // logger.error(`Error sending password reset OTP for email ${req.body.email}: ${error.message}`);
      return res.status(500).json({
        message: 'Internal Server Error. Please try again later.',
      });
    }
};

// controllers/authController.js

// Controller to verify OTP for password reset
module.exports.verifyPasswordResetOtp = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      // Input Validation
      if (!email || !otp) {
        return res.status(400).json({
          message: 'Email and OTP are required.',
        });
      }
  
      // Find the user by email
      const user = await User.findOne({ user_email: email });
      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
        });
      }
  
      // Find the latest OTP record for the user
      const otpRecord = await OTP.findOne({ otp_user: user._id }).sort({ createdAt: -1 });
      if (!otpRecord) {
        return res.status(400).json({
          message: 'OTP not found. Please request a new one.',
        });
      }
  
      // Check if OTP is expired
      if (Date.now() > otpRecord.expiresAt) {
        return res.status(400).json({
          message: 'OTP has expired. Please request a new one.',
        });
      }
  
      // Compare the submitted OTP with the hashed OTP in the database
      const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otp_otpHashed);
      if (!isMatch) {
        return res.status(400).json({
          message: 'Invalid OTP. Please try again.',
        });
      }
  
      // OTP is valid; set a flag or token to allow password reset
      // You can set a temporary token or flag in the user's record
  
      // For simplicity, we'll set a `resetPasswordAllowed` flag in the OTP record
      otpRecord.otp_resetPasswordAllowed = true;
      await otpRecord.save();
  
      // Respond to the client
      return res.status(200).json({
        message: 'OTP verified successfully. You can now reset your password.',
      });
    } catch (error) {
      console.error('Error verifying password reset OTP:', error);
      // logger.error(`Error verifying password reset OTP for email ${req.body.email}: ${error.message}`);
      return res.status(500).json({
        message: 'Internal Server Error. Please try again later.',
      });
    }
  };
  