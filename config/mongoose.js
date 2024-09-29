// Import mongoose and dotenv
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Use the MONGO_URI environment variable from the .env file
const mongoDBUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sliet-olx';

// Connecting to MongoDB using the environment variable
mongoose.connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Acquiring the connection
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error connecting to MongoDB'));
db.once('open', function() {
    console.log('Connected to Database:: MongoDB');
});

module.exports = db;
