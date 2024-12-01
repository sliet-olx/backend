// Import necessary modules
const sendWhatsAppMessage = require('./utility/sendWhatsappMessage');
const Product = require('./models/product'); // Product schema
const User = require('./models/user'); // User schema
const Buyer = require('./models/buyer'); // Buyer schemaconst sendWhatsAppMessage = require('./utility/sendWhatsappMessage'); // Function to send WhatsApp message
const db=require('./config/mongoose');

// Function to send a WhatsApp message for a specific product by ID
async function sendProductMessageById(productId) {
    try {
        // Find the product by ID and populate necessary fields
        let product = await Product.findById(productId)
            .populate('product_seller', 'user_name user_mobile user_hostel')
            .populate({
                path: 'product_buyers',
                populate: {
                    path: 'buyer_user',
                    select: 'user_name user_hostel user_mobile'
                }
            });

        // If product is not found, log a message
        if (!product) {
            console.log('Product not found');
            return;
        }

        // Send a WhatsApp message with product details
        sendWhatsAppMessage(product);
        console.log('WhatsApp message sent successfully for product:', product.product_name);

    } catch (error) {
        // Handle any errors
        console.error('Error sending WhatsApp message:', error);
    }
}

// Example usage: Replace 'YOUR_PRODUCT_ID_HERE' with the actual product ID
const productId = '671b61db572a23cf73cfb999';
    setTimeout(() => {
        sendProductMessageById(productId);
    }, 30000);
/*
const productId1 = '66ff8f2a0716452238b55b67';
    setTimeout(() => {
        sendProductMessageById(productId1);
    }, 29000);
const productId2 = '670b7815943185388fc2bf9b';
    setTimeout(() => {
        sendProductMessageById(productId2);
    }, 20000);
const productId3 = '670be7a2943185388fc2bfef';
    setTimeout(() => {
        sendProductMessageById(productId3);
    }, 20000);
*/
