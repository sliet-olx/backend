// Import necessary modules
const sendWhatsAppMessage = require('./utility/sendWhatsappMessage');
const Product = require('./models/product'); // Product schema
const User = require('./models/user'); // User schema
const Buyer = require('./models/buyer'); // Buyer schemaconst sendWhatsAppMessage = require('./utility/sendWhatsappMessage'); // Function to send WhatsApp message
const db=require('./config/mongoose');
require('dotenv').config();

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
// Reversed list of product IDs
const reversedProductIds = process.env.REVERSED_PRODUCT_IDS.split(',');

// Function to send the first message after a delay and the rest immediately
function sendMessagesWithInitialDelay(productIds, initialDelay) {
    if (productIds.length === 0) {
        console.log('No product IDs provided.');
        return;
    }

    // Extract the first product ID
    const [firstProductId, ...remainingProductIds] = productIds;

    // Send the first message after the specified initial delay
    setTimeout(() => {
        console.log(`Sending first WhatsApp message after ${initialDelay / 1000} seconds...`);
        sendProductMessageById(firstProductId);

        // Send the remaining messages immediately
        remainingProductIds.forEach(productId => {
            sendProductMessageById(productId);
        });
    }, initialDelay);
}

// Example usage: Send the first message after 30 seconds, then the rest immediately
const initialDelayInMilliseconds = 30000; // 30,000 milliseconds = 30 seconds
sendMessagesWithInitialDelay(reversedProductIds, initialDelayInMilliseconds);