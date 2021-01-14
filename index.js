const guiEnable = false;


if (guiEnable) {
    try {
        require('@nodegui/nodegui');
        startGui();
    } catch (e) {
        startCli();
    }
} else {
    startCli();
}

function startCli() {
    console.log("Loading...");

    const loggerModule = require(__dirname + "/logger/index.js");
    const fs = require('fs');

    try {
        let logfile = fs.createWriteStream(__dirname+'/latest.log');
        let loggerctl = new loggerModule.Logger();
        loggerctl.addStream(process.stdout);
        loggerctl.addStream(logfile);

        const mainlogger = loggerctl.getLogger("Init Script");

        mainlogger.log("Started logger!");
        mainlogger.log("Loading additional deps...");
        
        const CONFIG = require(__dirname+'/config.json');
        //const updater = require(__dirname+'/updater/index.js');
        const bot = require(__dirname+'/discord-bot/index.js');
        const DRRLanguages = require(__dirname+"/languages/index.js");

        mainlogger.log("Load completed!");
        mainlogger.log("Testing for a new version...");

        // new version test

        mainlogger.log("Loading language file...");

        const langfile = new DRRLanguages(__dirname+"/languages/"+CONFIG.language+".json");

        mainlogger.log("Load completed!");
        mainlogger.log("Creating a cache...");

        const CACHE = {
            sessions: new Map(),
            language: langfile,
            logger: loggerctl.getLogger("Discord Bot"),
            manager: loggerctl
        };

        bot(CONFIG, CACHE, (error, client, disconnect) => {
            if (error) {
                mainlogger.error(error);
                mainlogger.mkCrash();
                process.exit(1);
            } else if (disconnect) {
                mainlogger.warn("The bot has disconnected");
                process.exit(1);
            } else {
                mainlogger.log("Bot logged as: "+client.user.tag);
            }
        });
    } catch (e) {
        console.error("Can't start the bot due a error");
        console.error(e.name+' - '+e.message+'\n'+e.stack);
        process.exit(1);
    }
}

function startGui() {}