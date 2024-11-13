const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');
const axios = require('axios');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Discord token: ', (token) => {
    startBot(token);
    rl.close();
});

function startBot(token) {
    const client = new Client();

    client.on('ready', async () => {
        console.log(`Bot is now active as ${client.user.tag}`);
        await processAllGroupDMs();
        console.log("All group DMs have been processed successfully.");
    });

    async function processAllGroupDMs() {
        const groupDMs = client.channels.cache.filter(channel => channel.type === 'GROUP_DM');
        const iconUrl = 'https://pbs.twimg.com/media/DWKKiieVAAEvXO4.png';
        for (const [id, channel] of groupDMs) {
            try {
                const response = await axios.get(iconUrl, { responseType: 'arraybuffer' });
                const iconBuffer = Buffer.from(response.data, 'binary');

                await channel.setIcon(iconBuffer);
                console.log(`Group "${channel.name}" icon has been updated.`);
                await pause(20);
                await channel.setName('FuckinRetardedGroup');
                console.log(`Group "${channel.name}" has been renamed to "FuckinRetardedGroup"`);
                await pause(20);
                await channel.delete();
                console.log(`Successfully exited group: "${channel.name}".`);
                await pause(20);
            } catch (error) {
                console.error(`An error occurred while processing group "${channel.name}": ${error.message}`);
            }
        }
    }

    function pause(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    client.login(token).catch((error) => {
        console.error('Login failed', error);
    });
}
