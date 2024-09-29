// Importing the necessary modules
const jwt = require('jsonwebtoken');
const User = require('../../../models/user');

// Create a session (Login)
module.exports.createSession = async function(req, res) {
    try {
        let user = await User.findOne({ email: req.body.email });

        if (!user || user.password !== req.body.password) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }
        let foundUser = user.toObject();
        delete foundUser.password;  // Don't return the password in the response
        const token = jwt.sign(user.toJSON(), env.jwt_secret_key, { expiresIn: '86400000' });

        return res.status(200).json({
            message: 'Sign-in successful, JWT token generated',
            foundUser: foundUser,
            encodedToken: token
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Create a new user (Signup)
module.exports.create = function(req, res) {
    if (req.body.confirmPassword !== req.body.password) {
        return res.status(303).json({
            message: "Confirm Password didn't match",
        });
    }

    // Check if the email already exists
    User.findOne({ email: req.body.email })
        .then((oldUser) => {
            if (!oldUser) {
                // Create the new user
                User.create(req.body)
                    .then((newUser) => {
                        const token = jwt.sign(newUser.toJSON(), env.jwt_secret_key, { expiresIn: '100000' });
                        return res.status(201).json({
                            message: "User created successfully",
                            createdUser: newUser,
                            encodedToken: token
                        });
                    })
                    .catch((err) => {
                        console.error("Error in creating the new User:", err);
                        return res.status(500).json({
                            error: "Error in creating the new User",
                        });
                    });
            } else {
                return res.status(422).json({
                    errors: ["Unprocessable Entity. Username Already Exists."],
                });
            }
        })
        .catch((err) => {
            console.error("Error in fetching the existing email:", err);
            return res.status(500).json({
                error: "Internal Server Error",
            });
        });
};

// Get all users
module.exports.getAllUsers = async function(req, res) {
    try {
        const users = await User.find({}).select('name email avatar');
        return res.status(200).json({ users: users });
    } catch (err) {
        console.error("Error in fetching all users:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
