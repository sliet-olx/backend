// Importing necessary modules
//importing the express module
const express=require('express');
//importing passport for the authentication use
const passport=require('passport');
//importing newly passport-jwt-startegy for the authentication use
const passportJWT=require('./config/passport-jwt-strategy');
//for Cross-origin resource sharing
const cors=require('cors');
//for environment variables
const dotenv = require('dotenv');
// Ensure WhatsApp client is initialized
// const client = require('./whatsapp');
const client = require('./whatsappClient');

// Load environment variables from .env file
dotenv.config();

// Create an instance of express
const app = express();

//cors for all
app.use(cors());
// Enable CORS for a specific domain
// app.use(cors({
//     origin: 'http://sliet.shop:3000', // Allowing access from this domain
//     credentials: true // Optional: to allow cookies and other credentials
// }));

// Middleware for parsing JSON and URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//importing the mongoDB settings
const db=require('./config/mongoose');

// Import the routes
app.use('/', require('./routes/index'));

// Start the server
app.listen(process.env.PORT || 5050, (err) => {
    if (err) {
        console.error(`Error in starting the server: ${process.env.PORT || 5050}`);
    }
    console.log(`Server is running on port: ${process.env.PORT || 5050}`);
});
