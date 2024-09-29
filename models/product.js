const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Product Schema
const productSchema = new Schema({
    product_name: {
        type: String,
        required: true
    },
    product_picture: {
        type: String,
        required: true
    },
    product_price: {
        type: Number,
        required: true
    },
    product_description: {
        type: String,
        required: true
    },
    product_seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product_buyers: [{
        type: Schema.Types.ObjectId,
        ref: 'Buyer'
    }],
    product_is_sold: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
