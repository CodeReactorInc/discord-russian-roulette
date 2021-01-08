const bot = require(__dirname+'/index.js');
const DRRLanguages = require(__dirname+'/../languages/index.js');

bot({
    token: process.env.BOT_TOKEN,
    prefix: "!",
    autocompletwithbot: true
}, {
    sessions: new Map(),
    language: new DRRLanguages(__dirname+'/../languages/en-US.json')
}, (error, client, disconnect) => {
    if (error) {
        console.error(error);
    } else if (disconnect) {
        console.error("The bot has disconnected");
    } else {
        console.log("Bot logged as: "+client.user.tag);
    }
});