// const client = require('./../whatsapp');
const client = require('./../whatsappClient'); // Import the WhatsApp client
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
* Example: "8409986252" => "xxxxxxxx52"
* @param {String} mobile - The user's mobile number
* @returns {String} - Masked mobile number
*/
function maskMobile(mobile) {
  if (!mobile || mobile.length < 2) return 'xxxxxxxxxx'; // Adjust based on expected length
  const visibleDigits = mobile.slice(-2);
  const maskedPart = 'x'.repeat(Math.max(mobile.length - 2, 0));
  return maskedPart + visibleDigits;
}

const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID;

const sendWhatsappMessage= async (newProduct, res) => {
    try {
        const sellerName = newProduct.product_seller.user_name;
        const sellerMobile = newProduct.product_seller.user_mobile;
        const sellerHostel = newProduct.product_seller.user_hostel;

        const maskedName = maskName(sellerName);
        const maskedMobile = maskMobile(sellerMobile);

        const message = `🎉 *New Product Added!*\n\n🛍️ *Product Name:* ${newProduct.product_name}\n💰 *Price:* ₹${newProduct.product_price}\n\n👤 *Seller:* ${maskedName}\n📱 *Mobile:* ${maskedMobile}\n🏨 *Hostel:* ${sellerHostel}\n\n📝 *Description:* ${newProduct.product_description}`;

        const imageUrl = newProduct.product_picture || 'https://res.cloudinary.com/dea6nwzhg/image/upload/v1727717855/a2tcwm05mjrtk4rphipu.jpg';
        // Create a MessageMedia instance from the URL
        const media = await MessageMedia.fromUrl(imageUrl);

        const chat = await client.getChatById(GROUP_CHAT_ID);
        if (chat.isGroup) {
          console.log(`Sending message to group: ${chat.name}`);
        //   const sentMessage = await client.sendMessage(GROUP_CHAT_ID, message, { sendAudioAsVoice: true });
        const sentMessage = await client.sendMessage(GROUP_CHAT_ID, media, { caption: message });
          console.log('Message sent to WhatsApp group:', sentMessage.id._serialized);
        } else {
          console.error('The provided chat ID does not correspond to a group.');
        }
    } catch (error) {
    console.error('Failed to send message to WhatsApp group:', error);
    }
}

module.exports = sendWhatsappMessage;