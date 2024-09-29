// Importing necessary modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create an instance of express
const app = express();

// Enable CORS for a specific domain
app.use(cors({
    origin: 'http://sliet.shop:3000', // Allowing access from this domain
    credentials: true // Optional: to allow cookies and other credentials
}));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import the routes
app.use('/', require('./routes/index'));

// Start the server
app.listen(process.env.PORT || 5050, (err) => {
    if (err) {
        console.error(`Error in starting the server: ${process.env.PORT || 5050}`);
    }
    console.log(`Server is running on port: ${port}`);
});
