//importing nodemailer module to send mail from server
const nodemailer=require('nodemailer');

require('dotenv').config();

//configuration from which sending mail
let transporter = nodemailer.createTransport({
    service: "gmail",
    host:'smtp.gmail.com',  //with Gmail SMTP server
    port: process.env.SMTP_PORT,  //default 25but for SSL/TLS working 587
    secure: false,  //two factor authentication
    auth: { //authentication object
        user: process.env.SMTP_USER,  //email id
        pass: process.env.SMTP_PASS  //password,
    }
});
// Verify connection configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('Error in SMTP configuration:', error);
    } else {
        console.log('SMTP configuration is correct:', success);
    }
});

//exporting this module for further use
module.exports = transporter;