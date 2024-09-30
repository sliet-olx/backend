const transporter = require("../config/nodemailer");
const bcrypt = require("bcrypt");
const OTP = require("../models/otp");
// const client = require('./../whatsapp');
require('dotenv').config();


const sendVerificationEmail= async (newUser, res) => {
    try{
        const otp = Math.floor(1000 + Math.random() * 9000);
        // console.log(`OTP random: ${otp}`);
        //mail options
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: newUser.user_email,
            subject: 'SLIET Email Verification',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
              <table width="100%" style="border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <h1 style="color: #3977fe;">Verify Your Email</h1>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="font-size: 18px;">Hello ${newUser.user_name},</p>
                    <p style="font-size: 16px;">Thank you for signing up. Please use the following One-Time Password (OTP) to verify your college email address:</p>
                    <p style="font-size: 24px; font-weight: bold; text-align: center; color: #3977fe; margin: 20px 0;">${otp}</p>
                    <p style="font-size: 16px;">This OTP is valid for <strong>10 minutes</strong>.</p>
                    <p style="font-size: 16px;">If you did not request this, please ignore this email.</p>
                    <p style="font-size: 16px;">Best regards,<br>SLIET SuperDev Team</p>
                  </td>
                </tr>
              </table>
            </div>
          `
        };
        //hash the otp
        const saltRounds=10;
        // console.log("Hashing the OTP");
        const hashedOTP= await bcrypt.hash(otp.toString(),saltRounds);
        // console.log("OTP hashed successfully");
        // Create and save the new OTP document using Mongoose
        await OTP.create({
            otp_user: newUser._id,
            otp_otpHashed: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000
        });

        //send mail
        await transporter.sendMail(mailOptions);
        // console.log("Verification OTP sent successfully");
      
    }catch(error){
        return res.status(500).json({
            status: "FAILED",
            message: "Error in sending the OTP",
            // error: error
        });
    }
}

module.exports = sendVerificationEmail;