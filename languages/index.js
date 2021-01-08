const Discord = require('discord.js');

class DRRLanguages {
    constructor(path) {
        this.lang = require(path);
    }

    generateEmbed(title, desc, color, thumb, fields) {
        var embed = new Discord.MessageEmbed();
        embed.setFooter("© 2021 Code Reactor.  All rights reserved.", "https://cdn.codereactor.tk/codereactor/circle.png");
        embed.setColor(color);
        embed.setDescription(this.getFromCode(desc));
        embed.setTitle(this.getFromCode(title));
        if (thumb) embed.setThumbnail(thumb);
        if (fields) embed.addFields(fields);
        return embed;
    }

    getFromCode(code) {
        if (!this.lang[code]) {
            return code;
        } else {
            return this.lang[code];
        }
    }

    replaceEmbed(data, allVarsDesc, allVarsTitle) {
        if (typeof data === "string") {
            return this.replace(data, allVarsDesc);
        } else {
            data.setTitle(this.replace(data.title, allVarsTitle));
            data.setDescription(this.replace(data.description, allVarsDesc));
            return data;
        }
    }

    replace(data, allVars) {
        for(var i = 0;i < allVars.length;i++) {
            data = data.replace("$"+i, this.getFromCode(allVars[i]));
        }
        return data;
    }
}

module.exports = DRRLanguages;