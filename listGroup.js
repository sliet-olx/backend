// listGroup.js

// const client = require('./whatsapp');

client.on('ready', async () => {
    console.log('WhatsApp Client is ready!');
    const chats = await client.getChats();
    const groups = chats.filter(chat => chat.isGroup);
    console.log(`Found ${groups.length} group(s):`);
    groups.forEach(group => {
        console.log(`Group Name: ${group.name}, Group ID: ${group.id._serialized}`);
    });
    process.exit(0); // Exit after listing groups
});
