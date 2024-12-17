// const client = require('./../whatsapp');
const client = require('./../whatsappClient'); // Import the WhatsApp client
const fetch = require('node-fetch-retry'); // Import node-fetch-retry
const { MessageMedia } = require('whatsapp-web.js');
require('dotenv').config();

/**
 * Helper function to mask the user's name.
 * Shows only the first two characters and replaces the rest with 'x'.
 * Example: "Adarsh" => "Adxxxx"
 * @param {String} name - The user's name
 * @returns {String} - Masked name
 */
function maskName(name) {
  if (!name || name.length < 2) return 'xx';
  const firstTwo = name.slice(0, 2);
  const maskedPart = 'x'.repeat(Math.max(name.length - 2, 0));
  return firstTwo + maskedPart;
}

/**
* Helper function to mask the user's mobile number.
* Hides the first 8 digits and shows only the last 2 digits.
* @param {String} mobile - The user's mobile number
* @returns {String} - Masked mobile number
*/
function maskMobile(mobile) {
  if (!mobile || mobile.length < 2) return 'xxxxxxxxxx'; // Adjust based on expected length
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
        retry: 3, // Number of retries (handled by node-fetch-retry)
        pause: 1000, // Pause in ms between retries
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
        
        // Manual retry mechanism to send the WhatsApp message
        let attempt = 0;
        while (attempt < retryCount) {
            try {
                console.log(`Attempt ${attempt + 1} to send message to WhatsApp group`);

                // Use fetchImageWithRetry to fetch the image with retries
                const response = await fetchImageWithRetry(imageUrl);
                const imageBuffer = await response.buffer();

                // Create MessageMedia instance from the fetched image buffer
                const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'));

                // Send the message to both groups
                const groupIds = [GROUP_CHAT_ID1, GROUP_CHAT_ID2];
                for (const groupId of groupIds) {
                    const chat = await client.getChatById(groupId);
                    if (chat.isGroup) {
                        console.log(`Sending message to group: ${chat.name}`);
                        const sentMessage = await client.sendMessage(groupId, media, { caption: message });
                        console.log('Message sent to WhatsApp group:', sentMessage.id._serialized);
                    } else {
                        console.error(`The provided chat ID ${groupId} does not correspond to a group.`);
                    }
                }
                break; // If successful, exit the loop
            } catch (err) {
                attempt++;
                console.error(`Error sending message (attempt ${attempt}):`, err);
                if (attempt < retryCount) {
                    console.log(`Retrying in ${attempt * 1000}ms...`);
                    await delay(attempt * 1000); // Delay with exponential backoff
                } else {
                    console.error('All retry attempts failed. Unable to send message.');
                    throw err; // Throw error if all retries fail
                }
            }
        }
    } catch (error) {
        console.error('Failed to send message to WhatsApp group:', error);
    }
}

module.exports = sendWhatsappMessage;