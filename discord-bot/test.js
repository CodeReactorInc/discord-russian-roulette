const bot = require(__dirname+'/index.js');
const DRRLanguages = require(__dirname+'/../languages');
const Logger = require('drr-logger');
const fs = require('fs');

const manager = new Logger.Logger();
manager.addStream(process.stdout);

const logger = manager.getLogger('Bot Client');

bot({
    botToken: process.env.BOT_TOKEN,
    prefix: "!",
    autoCompletWithBot: true
}, {
    sessions: new Map(),
    language: new DRRLanguages(__dirname+'/../languages/en-US.json'),
    logger: logger,
    manager: manager
}, (error, client, disconnect) => {
    if (error) {
        console.error(error);
    } else if (disconnect) {
        console.error("The bot has disconnected");
    } else {
        console.log("Bot logged as: "+client.user.tag);
    }
});