// Import necessary modules
const sendWhatsAppMessage = require('./utility/sendWhatsappMessage');
const Product = require('./models/product'); // Product schema
const User = require('./models/user'); // User schema
const Buyer = require('./models/buyer'); // Buyer schema
const db = require('./config/mongoose');
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
            console.log(`Product not found for ID: ${productId}`);
            return;
        }

        // Send a WhatsApp message with product details
        await sendWhatsAppMessage(product);
        console.log('WhatsApp message sent successfully for product:', product.product_name);

    } catch (error) {
        // Handle any errors
        console.error(`Error sending WhatsApp message for product ID ${productId}:`, error);
    }
}

// Reversed list of product IDs
const reversedProductIds = process.env.REVERSED_PRODUCT_IDS.split(',');

// Function to send messages sequentially with delay
async function sendMessagesSequentiallyWithDelay(productIds, initialDelay) {
    if (productIds.length === 0) {
        console.log('No product IDs provided.');
        return;
    }

    console.log(`Sending first WhatsApp message after ${initialDelay / 1000} seconds...`);
    
    // Wait for the initial delay
    await new Promise(resolve => setTimeout(resolve, initialDelay));

    // Send messages one by one in sequence
    for (const productId of productIds) {
        console.log(`Sending message for product ID: ${productId}`);
        await sendProductMessageById(productId);
    }

    console.log('All messages have been sent.');
}

// Example usage: Send the first message after 30 seconds, then the rest sequentially
const initialDelayInMilliseconds = 30000; // 30,000 milliseconds = 30 seconds
sendMessagesSequentiallyWithDelay(reversedProductIds, initialDelayInMilliseconds);
