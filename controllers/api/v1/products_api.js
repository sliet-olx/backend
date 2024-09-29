// Importing the Product schema module
const Product = require('../../../models/product');

// Get a product by ID
module.exports.getProduct = async function(req, res) {
    try {
        let product = await Product.findById(req.params.id)
            .populate('user', '-password');

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product retrieved successfully",
            product: product
        });
    } catch (err) {
        console.error("Error Occurred", err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get a list of products
module.exports.index = async function(req, res) {
    try {
        let products = await Product.find({})
            .sort('-createdAt') // Descending order of creation
            .populate('user', '-password');

        res.status(200).json({
            message: "List of Products",
            products: products
        });
    } catch (err) {
        console.error("Error Occurred", err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Delete a product
module.exports.destroy = async function(req, res) {
    try {
        let product = await Product.findById(req.params.id.trim());

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Only delete if the user who created the product is the one trying to delete it
        if (product.user.toString() === req.user.id) {
            await product.deleteOne();
            return res.status(200).json({
                message: "Product Deleted",
                data: { product_id: req.params.id.trim() }
            });
        } else {
            return res.status(401).json({
                message: "Unauthorized to delete this product"
            });
        }
    } catch (err) {
        console.error("Error Occurred", err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Create a new product
module.exports.create = async function(req, res) {
    try {
        let product = await Product.create({
            name: req.body.name,
            price: req.body.price,
            user: req.body.user
        });

        await product.populate('user', 'name email avatar'); // Populate user details
        return res.status(200).json({
            product: product,
            message: "Product Created"
        });
    } catch (err) {
        console.error("Error in creating the product", err);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};
