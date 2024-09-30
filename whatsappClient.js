// whatsappClient.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

// Customize the path where authentication data will be stored
const SESSION_PATH = path.join(__dirname, '.wwebjs_auth');

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: SESSION_PATH }),
  puppeteer: { headless: true } // Set to false if you want to see the browser
});

// Event listeners
client.on('qr', (qr) => {
  console.log('QR Code received. Please scan it in WhatsApp.');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('WhatsApp Client authenticated successfully!');
});

client.on('auth_failure', (msg) => {
  console.error('Authentication failed:', msg);
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
});

// Handle incoming messages (optional)
// client.on('message', (message) => {
//   console.log(`Received message: ${message.body}`);
// });

// Initialize the client
client.initialize();

module.exports = client;