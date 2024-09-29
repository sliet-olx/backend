const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Buyer Schema
const buyerSchema = new Schema({
    buyer_user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyer_min: {
        type: Number,
        required: true
    },
    buyer_max: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Buyer = mongoose.model('Buyer', buyerSchema);
module.exports = Buyer;
