// const client = require('./../whatsapp');
const client = require('./../whatsappClient'); // Import the WhatsApp client
const fetch = require('node-fetch-retry'); // Import node-fetch-retry
const { MessageMedia } = require('whatsapp-web.js');
require('dotenv').config();

/**
 * Helper function to mask the user's name.
 */
function maskName(name) {
  if (!name || name.length < 2) return 'xx';
  const firstTwo = name.slice(0, 2);
  const maskedPart = 'x'.repeat(Math.max(name.length - 2, 0));
  return firstTwo + maskedPart;
}

/**
* Helper function to mask the user's mobile number.
*/
function maskMobile(mobile) {
  if (!mobile || mobile.length < 2) return 'xxxxxxxxxx';
  const visibleDigits = mobile.slice(-2);
  const maskedPart = 'x'.repeat(Math.max(mobile.length - 2, 0));
  return maskedPart + visibleDigits;
}

const GROUP_CHAT_ID1 = process.env.GROUP_CHAT_ID1;
const GROUP_CHAT_ID2 = process.env.GROUP_CHAT_ID2;

// Delay function for manual retry
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to fetch the image with retries using node-fetch-retry
const fetchImageWithRetry = async (url) => {
    const response = await fetch(url, {
        method: 'GET',
        retry: 3,
        pause: 1000,
        callback: (retry, error) => {
            console.log(`Retrying fetch (${retry}) for URL ${url} due to error:`, error.message);
        }
    });

    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    return response;
};

const sendWhatsappMessage = async (newProduct, res, retryCount = 3) => {
    try {
        const sellerName = newProduct.product_seller.user_name;
        const sellerMobile = newProduct.product_seller.user_mobile;
        const sellerHostel = newProduct.product_seller.user_hostel;

        const maskedName = maskName(sellerName);
        const maskedMobile = maskMobile(sellerMobile);

        const message = `🎉 *New Product Added!*\n\nhttps://sliet.shop/products/${newProduct._id}\n\n🛍️ *Product Name:* ${newProduct.product_name}\n💰 *Price:* ₹${newProduct.product_price}\n\n👤 *Seller:* ${maskedName}\n📱 *Mobile:* ${maskedMobile}\n🏨 *Hostel:* ${sellerHostel}\n\n📝 *Description:* ${newProduct.product_description}`;

        const imageUrl = newProduct.product_picture || 'https://res.cloudinary.com/dea6nwzhg/image/upload/v1727717855/a2tcwm05mjrtk4rphipu.jpg';
        
        let attempt = 0;
        while (attempt < retryCount) {
            try {
                console.log(`Attempt ${attempt + 1} to send message to WhatsApp groups`);

                // Fetch image
                const response = await fetchImageWithRetry(imageUrl);
                const imageBuffer = await response.buffer();

                // Create MessageMedia instance
                const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'));

                // Directly send to both group IDs without checking
                console.log(`Sending message to GROUP_CHAT_ID1: ${GROUP_CHAT_ID1}`);
                const sentMessage1 = await client.sendMessage(GROUP_CHAT_ID1, media, { caption: message });
                console.log('Message sent to WhatsApp group:', sentMessage1.id._serialized);

                console.log(`Sending message to GROUP_CHAT_ID2: ${GROUP_CHAT_ID2}`);
                const sentMessage2 = await client.sendMessage(GROUP_CHAT_ID2, media, { caption: message });
                console.log('Message sent to WhatsApp group:', sentMessage2.id._serialized);

                break; // Exit the loop if successful
            } catch (err) {
                attempt++;
                console.error(`Error sending message (attempt ${attempt}):`, err.message);
                if (attempt < retryCount) {
                    console.log(`Retrying in ${attempt * 1000}ms...`);
                    await delay(attempt * 1000);
                } else {
                    console.error('All retry attempts failed. Unable to send message.');
                    throw err;
                }
            }
        }
    } catch (error) {
        console.error('Failed to send message to WhatsApp group:', error);
    }
}

module.exports = sendWhatsappMessage;
