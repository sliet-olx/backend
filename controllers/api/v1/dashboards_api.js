// Importing the necessary modules
const User = require('../../../models/user');
const Product = require('../../../models/product');

// Controller to get the list of products the user is selling
module.exports.sellResponse = async function(req, res) {
    try {
        // Ensure the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "Unauthorized. Please log in.",
                nextAction: '/login' // Link to login page
            });
        }

        // Find the user and populate the user_sells field with product details
        const user = await User.findById(req.user._id)
            .populate({
                path: 'user_sells',
                populate: {
                    path: 'product_buyers',
                    model: 'Buyer',
                    select: 'buyer_user buyer_min buyer_max',
                    populate: {
                        path: 'buyer_user',
                        model: 'User',
                        select: 'user_name user_hostel user_mobile'
                    }
                }
            })
            .exec();

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                nextAction: '/signup' // Link to signup page
            });
        }

        // Check if user has any products for sale
        if (!user.user_sells || user.user_sells.length === 0) {
            return res.status(200).json({
                message: "You have no products for sale.",
                products: [],
                nextAction: '/sell-product' // Link to add product form/page
            });
        }

        // Respond with the list of products the user is selling
        return res.status(200).json({
            message: "List of your products for sale.",
            products: user.user_sells,
            nextAction: '/dashboard/sell-response' // Link to dashboard or relevant page
        });

    } catch (error) {
        console.error("Error fetching sell response:", error);
        return res.status(500).json({
            message: "Internal Server Error.",
            nextAction: '/home'
        });
    }
};

// Controller to get the list of products the user is buying or has bid for
module.exports.buyRequest = async function(req, res) {
    try {
        // Ensure the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "Unauthorized. Please log in.",
                nextAction: '/login' // Link to login page
            });
        }

        // Find the user and populate the user_buys field with product details
        const user = await User.findById(req.user._id)
            .populate({
                path: 'user_buys',
                populate: {
                    path: 'product_buyers',
                    model: 'Buyer',
                    select: 'buyer_user buyer_min buyer_max',
                    populate: {
                        path: 'buyer_user',
                        model: 'User',
                        select: 'user_name user_hostel user_mobile'
                    }
                }
            })
            .exec();

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                nextAction: '/signup' // Link to signup page
            });
        }

        // Check if user has any buy requests
        if (!user.user_buys || user.user_buys.length === 0) {
            return res.status(200).json({
                message: "You have no buy requests.",
                products: [],
                nextAction: '/buy-product' // Link to buy product form/page
            });
        }

        // Respond with the list of products the user is buying or has bid for
        return res.status(200).json({
            message: "List of your buy requests.",
            products: user.user_buys,
            nextAction: '/dashboard' // Link to dashboard or relevant page
        });

    } catch (error) {
        console.error("Error fetching buy request:", error);

        return res.status(500).json({
            message: "Internal Server Error.",
            nextAction: '/dashboard' // Link to dashboard or relevant page
        });
    }
};
