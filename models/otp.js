const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new mongoose.Schema({
    otp_user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    otp_otpHashed: { 
        type: String, 
        required: true 
    },
    createdAt: Date,
    expiresAt: Date,
});
  
const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;