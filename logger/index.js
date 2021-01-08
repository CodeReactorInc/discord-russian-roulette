const fs = require('fs');

class Logger {
    constructor() {
        this.streams = [];
        this.loggers = {};
    }

    addStream(stream) {
        this.streams.push(stream);
    }

    rmStream(index) {
        this.streams.splice(index);
    }

    mkLogger(name) {
        return (this.loggers[name] = new LoggerStream(name, this.streams));
    }

    getLogger(name) {
        if (!this.loggers[name]) {
            return this.mkLogger(name);
        } else return this.loggers[name];
    }

    rmLogger(name) {
        this.loggers[name] = undefined;
    }
}

class LoggerStream {
    constructor(name, streams) {
        this._streams = streams;
        this.name = name;
    }

    format(type, msg) {
        var now = new Date();
        return "["+(now.getHours().toLocaleString({ minimumIntegerDigits: 2 }))+":"+(now.getMinutes().toLocaleString({ minimumIntegerDigits: 2 }))+":"+(now.getSeconds().toLocaleString({ minimumIntegerDigits: 2 }))+"] ("+this.name+"/"+type+"): "+msg+"\n";
    }

    send(msg) {
        for(var i = 0;i < this._streams.length;i++) {
            this._streams[i].write(msg);
        }
    }

    error(e) {
        this.send(this.format("ERROR", e.name+" - "+e.message+"\n"+e.stack));
    }

    log(msg) {
        this.send(this.format("LOG", msg));
    }

    warn(msg) {
        this.send(this.format("WARN", msg));
    }

    mkCrash() {
        var memoryUsage = process.memoryUsage();
        var cpuUsage = process.cpuUsage();
        var data =
            "---Crash Report Info---\n"+
            "Title: "+process.title+"\n"+
            "System: "+process.platform+"\n"+
            "Arch: "+process.arch+"\n"+
            "Version: "+process.version+"\n"+
            "Args: "+JSON.stringify(process.argv)+"\n"+
            "Memory Usage: "+memoryUsage.heapUsed+"/"+memoryUsage.heapTotal+"\n"+
            "CPU Usage: "+cpuUsage.user+"/"+cpuUsage.system+"\n";
        this.send(data);
    }
}

function safeExec(func, logger, args, crash) {
    try {
        func(... args);
    } catch (e) {
        logger.error(e);
        if (crash) logger.crash();
    }
}

module.exports = {
    Logger: Logger,
    LoggerStream: LoggerStream,
    safeExec: safeExec
};