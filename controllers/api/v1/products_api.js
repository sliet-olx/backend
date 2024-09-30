// Importing the Product schema module
const Product = require('../../../models/product');
const Buyer = require('../../../models/buyer');
const sendWhatsAppMessage = require('../../../utility/sendWhatsappMessage');

// Get all products
module.exports.getAllProducts = async function(req, res) {
    try {
        let products = await Product.find({})
            .populate('product_seller', 'user_name user_hostel');

        return res.status(200).json({
            message: "List of Products",
            products: products,
            nextAction: '/home'
        });
    } catch (err) {
        console.error("Error Occurred", err);
        return res.status(500).json({
            message: "Internal Server Error",
            nextAction: '/home'
        });
    }
};

// Get a product by ID
module.exports.getProduct = async function(req, res) {
    try {
        let product = await Product.findById(req.params.id)
            .populate('product_seller', 'user_name user_hostel')
            .populate({
                path: 'product_buyers',
                populate: {
                    path: 'buyer_user',
                    select: 'user_name user_hostel user_mobile'
                }
            });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                nextAction: '/home'
            });
        }

        res.status(200).json({
            message: "Product retrieved successfully",
            product: product,
            nextAction: `/products/${product._id}`
        });
    } catch (err) {
        console.error("Error Occurred", err);
        return res.status(500).json({
            message: "Internal Server Error",
            nextAction: '/home'
        });
    }
};

// Create a new product
module.exports.create = async function(req, res) {
    try {
        // Extract product details from the request body
        const { picture, name, price, description } = req.body;

        // Input Validation
        if (!picture || !name || !price || !description) {
            return res.status(400).json({
                message: "All product fields (picture URL, name, price, description) are required.",
                nextAction: '/sell-product' // Link to add product form/page
            });
        }

        // Additional validation (optional)
        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({
                message: "Product price must be a positive number.",
                nextAction: '/sell-product'
            });
        }

        // Ensure the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "Unauthorized. Please log in.",
                nextAction: '/login' // Link to login page
            });
        }

        // Get the seller's ID from the authenticated user
        const sellerId = req.user._id;

        // Create the new product with the provided details and set the seller
        const newProduct = await Product.create({
            product_name: name,
            product_picture: picture,
            product_price: price,
            product_description: description,
            product_seller: sellerId,
            // product_buyers: [], // Defaults to empty array
            // product_is_sold: false // Defaults to false
        });
        // populate the product_seller field with user_name user_mobile user_hostel
        await newProduct.populate('product_seller', 'user_name user_mobile user_hostel');
        // Optionally, send a WhatsApp message notifying about the new product
        sendWhatsAppMessage(newProduct, res);

        // Respond to the client with the created product details
        return res.status(201).json({
            message: "Product created successfully.",
            product: newProduct,
            nextAction: `/products/${newProduct._id}` // Link to the newly created product's detail page
        });

    } catch (error) {
        console.error("Error creating product:", error);
        // logger.error(`Error creating product: ${error.message}`);

        // Handle specific Mongoose errors (optional)
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Validation Error: " + error.message,
                nextAction: '/sell-product' // Link to add product form/page
            });
        }

        return res.status(500).json({
            message: "Internal Server Error.",
            nextAction: '/sell-product' // Link to add product form/page
        });
    }
};

// Mark a product as sold
module.exports.sold = async function(req, res) {
    try {
        // Extract product ID from the request body
        const { productId } = req.body;

        // Input Validation
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required.",
                nextAction: '/home' // Link to home or relevant page
            });
        }

        // Find the product by ID
        const product = await Product.findById(productId)
            .populate('product_seller', 'user_name user_email'); // Populate seller details

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                nextAction: '/home'
            });
        }

        // Check if the authenticated user is the seller
        if (product.product_seller._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to mark this product as sold.",
                nextAction: '/home' // Link to home or relevant page
            });
        }

        // Check if the product is already marked as sold
        if (product.product_is_sold) {
            return res.status(400).json({
                message: "Product is already marked as sold.",
                nextAction: `/products/${product._id}` // Link to product detail page
            });
        }

        // Update the product's sold status
        product.product_is_sold = true;
        await product.save();

        // Respond to the client
        return res.status(200).json({
            message: "Product marked as sold successfully.",
            product: product,
            nextAction: `/products/${product._id}` // Link to product detail page
        });

    } catch (error) {
        console.error("Error marking product as sold:", error);
        // logger.error(`Error marking product as sold: ${error.message}`);
        return res.status(500).json({
            message: "Internal Server Error.",
            nextAction: '/home' // Link to home or relevant page
        });
    }
};

// Buy a product (Bid)
module.exports.buy = async function(req, res) {
    try {
        // Extract product ID and bid details from the request body
        const { productId, buyer_min, buyer_max } = req.body;

        // Input Validation
        if (!productId || buyer_min === undefined || buyer_max === undefined) {
            return res.status(400).json({
                message: "Product ID, buyer_min, and buyer_max are required.",
                nextAction: '/back' // Link to home or relevant page
            });
        }

        // Validate that buyer_min and buyer_max are numbers
        if (typeof buyer_min !== 'number' || typeof buyer_max !== 'number') {
            return res.status(400).json({
                message: "buyer_min and buyer_max must be numbers.",
                nextAction: '/back'
            });
        }

        // Validate that buyer_max is greater than or equal to buyer_min
        if (buyer_max < buyer_min) {
            return res.status(400).json({
                message: "buyer_max must be greater than or equal to buyer_min.",
                nextAction: '/back'
            });
        }

        // Find the product by ID
        const product = await Product.findById(productId)
            .populate('product_seller', 'user_name user_email'); // Populate seller details

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                nextAction: '/home'
            });
        }

        // Check if the product is already sold
        if (product.product_is_sold) {
            return res.status(400).json({
                message: "Cannot bid on a sold product.",
                nextAction: `/products/${product._id}`
            });
        }

        // Prevent the seller from bidding on their own product
        if (product.product_seller._id.toString() === req.user._id.toString()) {
            return res.status(403).json({
                message: "You cannot bid on your own product.",
                nextAction: `/products/${product._id}`
            });
        }

        // Optional: Prevent users from bidding multiple times on the same product
        // const existingBid = await Buyer.findOne({
        //     buyer_user: req.user._id,
        //     product: product._id
        // });

        // if (existingBid) {
        //     return res.status(400).json({
        //         message: "You have already placed a bid on this product.",
        //         nextAction: `/products/${product._id}`
        //     });
        // }

        // Create a new Buyer document
        const newBuyer = await Buyer.create({
            buyer_user: req.user._id,
            buyer_min: buyer_min,
            buyer_max: buyer_max
        });

        // Add the Buyer reference to the product's product_buyers array
        product.product_buyers.push(newBuyer._id);
        await product.save();

        // Respond to the client
        return res.status(201).json({
            message: "Your bid has been placed successfully.",
            buyer: newBuyer,
            product: product,
            nextAction: `/products/${product._id}` // Link to the product's detail page
        });

    } catch (error) {
        console.error("Error placing bid:", error);
        // logger.error(`Error placing bid for product ${req.body.productId}: ${error.message}`);
        return res.status(500).json({
            message: "Internal Server Error.",
            nextAction: '/home' // Link to home or relevant page
        });
    }
};