//const client = require('./whatsappClient');

client.on('ready', async () => {
    console.log('WhatsApp Client is ready!');
    try {
        const chats = await client.getChats();
        console.log(`Total chats fetched: ${chats.length}`);

        chats.forEach(chat => {
            console.log(`Chat Name: ${chat.name}, ID: ${chat.id._serialized}, Is Group: ${chat.isGroup}`);
        });

        const groups = chats.filter(chat => chat.isGroup);
        console.log(`Found ${groups.length} group(s):`);
        groups.forEach(group => {
            console.log(`Group Name: ${group.name}, Group ID: ${group.id._serialized}`);
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
    }
    process.exit(0);
});
