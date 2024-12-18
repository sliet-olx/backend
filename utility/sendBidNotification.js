const transporter = require("../config/nodemailer");
//const sendWhatsAppMessage = require("./sendWhatsAppMessage"); // Optional if WhatsApp notification is needed
require("dotenv").config();

const sendBidNotification = async (product, buyer, buyerBid) => {
    try {
        // Notification Email to the Product Seller
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: product.product_seller.user_email,
            subject: `New Bid Placed on Your Product - ${product.product_name}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
                <h2 style="color: #3977fe; text-align: center;">New Bid Notification</h2>
                <p style="font-size: 16px;">Hello ${product.product_seller.user_name},</p>
                <p>A new bid has been placed on your product <strong>${product.product_name}</strong>:</p>
                <ul style="font-size: 16px;">
                    <li><strong>Buyer Name:</strong> ${buyer.user_name}</li>
                    <li><strong>Minimum Bid:</strong> ₹${buyerBid.buyer_min}</li>
                    <li><strong>Maximum Bid:</strong> ₹${buyerBid.buyer_max}</li>
                    <li><strong>Contact:</strong> ${buyer.user_mobile}</li>
                </ul>
                <p style="font-size: 16px;">Please visit your dashboard to review the bid details.</p>
                <p style="font-size: 16px;">Best regards,<br>SLIET SuperDev Team</p>
            </div>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Bid notification email sent to seller successfully!");

        // Optional: Send a WhatsApp message to the seller
        const message = `📢 *New Bid Alert*\n\nYour product *${product.product_name}* has received a new bid:\n👤 Buyer: ${buyer.user_name}\n📱 Contact: ${buyer.user_mobile}\n💰 Bid Range: ₹${buyerBid.buyer_min} - ₹${buyerBid.buyer_max}`;
        await sendWhatsAppMessage({ 
            product_seller: product.product_seller, 
            product_name: product.product_name, 
            buyer_name: buyer.user_name,
            buyer_mobile: buyer.user_mobile,
            buyer_min: buyerBid.buyer_min,
            buyer_max: buyerBid.buyer_max,
            message
        });

        console.log("WhatsApp notification sent to seller successfully!");
    } catch (error) {
        console.error("Error sending bid notification:", error);
    }
};

module.exports = sendBidNotification;
