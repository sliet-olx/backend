const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema({
    user_email: {
        type: String,
        required: true,
        unique: true
    },
    user_is_verified: { 
        type: Boolean, 
        default: false 
    },
    user_name: {
        type: String,
        required: true
    },
    user_mobile: {
        type: String,
        required: true
    },
    user_password: {
        type: String,
        required: true
    },
    user_hostel: {
        type: Number,
        required: true
    },
    user_sells: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    user_buys: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
