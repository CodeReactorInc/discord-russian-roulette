const args = process.argv.slice(2);
const guiEnable = false;

if (args[0] === "cli") {
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
        const updater = require(__dirname+'/updater/index.js');
        const bot = require(__dirname+'/discord-bot/index.js');

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

} else if (args[0] === "gui") {

} else {
    if (guiEnable) {
        console.log("Loading...");
        const child = require('child_process');

        try {
            require('@nodegui/nodegui');
            child.spawn('powershell', ['-Command', __dirname+'/runtime/node.exe index.js gui'], {
                detached: true,
                stdio: [ 'ignore', 'ignore', 'ignore' ],
                cwd: __dirname
            }).unref();
            process.exit(0);
        } catch (e) {
            child.spawn('powershell', ['-Command', __dirname+'/runtime/node.exe index.js cli'], {
                detached: true,
                stdio: [ 'ignore', 'ignore', 'ignore' ],
                cwd: __dirname
            }).unref();
            process.exit(0);
        }
    } else {
        console.log("Loading...");
        const child = require('child_process');

        child.spawn('powershell', ['-Command', __dirname+'/runtime/node.exe index.js cli'], {
            detached: true,
            stdio: [ 'ignore', 'ignore', 'ignore' ],
            cwd: __dirname
        }).unref();
        process.exit(0);
    }
}