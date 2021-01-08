const bot = require(__dirname+'/index.js');
const DRRLanguages = require(__dirname+'/../languages');
const Logger = require('drr-logger');
const fs = require('fs');

const manager = new Logger.Logger();
manager.addStream(process.stdout);

const logger = manager.getLogger('Bot Client');
const initlogger = manager.getLogger('Bot Tester');

bot({
    botToken: process.env.BOT_TOKEN,
    prefix: "!",
    autoCompletWithBot: true,
    language: "en-US"
}, {
    sessions: new Map(),
    language: new DRRLanguages(__dirname+'/../languages/en-US.json'),
    logger: logger,
    manager: manager
}, (error, client, disconnect) => {
    if (error) {
        initlogger.error(error);
        initlogger.mkCrash();
        process.exit(1);
    } else if (disconnect) {
        initlogger.warn("The bot has disconnected");
        process.exit(1);
    } else {
        initlogger.log("Bot logged as: "+client.user.tag);
    }
});