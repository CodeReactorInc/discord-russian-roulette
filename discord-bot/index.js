const Discord = require('discord.js');

module.exports = (CONFIG, CACHE, callback) => {
    const client = new Discord.Client();

    client.on('message', (message) => {
        if (!message.content.startsWith(CONFIG.prefix)) return;

        var args = message.content.trim().slice(CONFIG.prefix.length).split(' ');
        var cmd = args.shift().toLowerCase();

        if (cmd === "new") {
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (session) {
                message.channel.send({embed: CACHE.language.generateEmbed("bot.command.new", "game.session.exists", 0xFF0000)});
                return;
            }

            CACHE.sessions.set(message.guild.id + message.channel.id, {
                canJoin: true,
                players: [],
                index: 0,
                joinedPlayers: [{
                    name: null,
                    user: message.author,
                    member: message.member,
                    isBot: false
                }],
                rng: -1
            });

            message.channel.send({embed: CACHE.language.replaceEmbed(CACHE.language.generateEmbed("bot.command.new", "bot.command.new.created", 0x00ff00), [CONFIG.prefix], [])});
        } else if (cmd === "join") {
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (!session) {
                message.channel.send({embed: CACHE.language.replaceEmbed(CACHE.language.generateEmbed("bot.command.join", "bot.generic.session.noexists", 0xff0000), [CONFIG.prefix], [])});
                return;
            }

            if (!session.canJoin) {
                message.channel.send("The game already started!");
                return;
            }

            if (session.joinedPlayers.length >= 6) {
                message.channel.send("You can't join, the game has full");
                return;
            }

            if (has(message.author.id, session.joinedPlayers)) {
                message.channel.send("You are in the game!");
                return;
            }

            session.joinedPlayers.push({
                name: null,
                user: message.author,
                member: message.member,
                isBot: false
            });

            CACHE.sessions.set(message.guild.id + message.channel.id, session);

            message.channel.send("You have joined to the game!");
        } else if (cmd === "exit") {
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (!session) {
                message.channel.send("A session aren't created, create one with '"+CONFIG.prefix+"new'");
                return;
            }

            if (!session.canJoin) {
                message.channel.send("The game already started!");
                return;
            }

            if (session.joinedPlayers[0].user.id === message.author.id) {
                message.channel.send("The owner can't leave from the game");
                return;
            }

            if (!has(message.author.id, session.joinedPlayers)) {
                message.channel.send("You aren't in the game!");
                return;
            }

            session.joinedPlayers = session.joinedPlayers.slice(session.joinedPlayers.indexOf({
                name: null,
                user: message.author,
                member: message.member,
                isBot: false
            }));

            CACHE.sessions.set(message.guild.id + message.channel.id, session);

            message.channel.send("You have exited from the game!");
        } else if (cmd === "start") {
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (!session) {
                message.channel.send("A session aren't created, create one with '"+CONFIG.prefix+"new'");
                return;
            }

            if (!session.canJoin) {
                message.channel.send("The game already started!");
                return;
            }

            
            if (session.joinedPlayers[0].user.id !== message.author.id) {
                message.channel.send("Only the owner of game can execute this command");
                return;
            }

            if (session.joinedPlayers.length < 6 && !CONFIG.autocompletwithbot) {
                message.channel.send("The game doesn't has the minimum of players, you need create another ("+session.joinedPlayers.length+"/6)");
                return;
            }

            var botID = 0;
            while (session.joinedPlayers.length < 6) {
                botID++;
                session.joinedPlayers.push({
                    name: "Bot "+botID,
                    user: null,
                    member: null,
                    isBot: true
                });
            }

            session.players = shuffle(session.joinedPlayers);
            session.canJoin = false;

            var msg = "Game started! Order:\n\n";
            for(var i = 0;i < session.players.length;i++) {
                if (session.players[i].isBot) {
                    msg += session.players[i].name+"\n";
                } else {
                    msg += session.players[i].user.tag+"\n";
                }
            }
            
            session.rng = Math.floor(Math.random() * (6.4 - 0.5) + 0.5);

            message.channel.send(msg+"See the next event with '"+CONFIG.prefix+"next'");

            CACHE.sessions.set(message.guild.id + message.channel.id, session);
        } else if (cmd === "next") {
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (!session) {
                message.channel.send("A session aren't created, create one with '"+CONFIG.prefix+"new'");
                return;
            }

            if (session.canJoin) {
                message.channel.send("The game aren't started!");
                return;
            }

            if (session.joinedPlayers[0].user.id !== message.author.id) {
                message.channel.send("Only the owner of game can execute this command");
                return;
            }

            if (session.index === 0) {
                if (session.rng === 1) {
                    if (session.players[0].isBot) {
                        message.channel.send(session.players[0].name + " has be killed");
                        message.channel.send("Game has ended");
                        CACHE.sessions.delete(message.guild.id + message.channel.id);
                    } else {
                        message.channel.send(session.players[0].user.tag + " has be killed");
                        message.channel.send("Game has ended");
                        CACHE.sessions.delete(message.guild.id + message.channel.id);
                    }
                } else {
                    if (session.players[0].isBot) {
                        message.channel.send(session.players[0].name + " hasn't be killed");
                    } else {
                        message.channel.send(session.players[0].user.tag + " hasn't be killed");
                    }
                    session.index++;
                }
            } else if (session.index === 1) {
                if (session.rng === 2) {
                    if (session.players[1].isBot) {
                        message.channel.send(session.players[1].name + " has be killed");
                        message.channel.send("Game has ended");
                        CACHE.sessions.delete(message.guild.id + message.channel.id);
                    } else {
                        message.channel.send(session.players[1].user.tag + " has be killed");
                        message.channel.send("Game has ended");
                        CACHE.sessions.delete(message.guild.id + message.channel.id);
                    }
                } else {
                    if (session.players[1].isBot) {
                        message.channel.send(session.players[1].name + " hasn't be killed");
                    } else {
                        message.channel.send(session.players[1].user.tag + " hasn't be killed");
                    }
                    session.index++;
                }
            } else if (session.index === 2) {
                if (session.rng === 3) {
                    if (session.players[2].isBot) {
                        message.channel.send(session.players[2].name + " has be killed");
                        message.channel.send("Game has ended");
                        CACHE.sessions.delete(message.guild.id + message.channel.id);
                    } else {
                        message.channel.send(session.players[2].user.tag + " has be killed");
                        message.channel.send("Game has ended");
                        CACHE.sessions.delete(message.guild.id + message.channel.id);
                    }
                } else {
                    if (session.players[2].isBot) {
                        message.channel.send(session.players[2].name + " hasn't be killed");
                    } else {
                        message.channel.send(session.players[2].user.tag + " hasn't be killed");
                    }
                    session.index++;
                }
            } else if (session.index === 3) {
                if (session.rng === 4) {
                    if (session.players[3].isBot) {
                        message.channel.send(session.players[3].name + " has be killed");
                        message.channel.send("Game has ended");
                        CACHE.sessions.delete(message.guild.id + message.channel.id);
                    } else {
                        message.channel.send(session.players[3].user.tag + " has be killed");
                        message.channel.send("Game has ended");
                        CACHE.sessions.delete(message.guild.id + message.channel.id);
                    }
                } else {
                    if (session.players[3].isBot) {
                        message.channel.send(session.players[3].name + " hasn't be killed");
                    } else {
                        message.channel.send(session.players[3].user.tag + " hasn't be killed");
                    }
                    session.index++;
                }
            } else if (session.index === 4) {
                if (session.rng === 5) {
                    if (session.players[4].isBot) {
                        message.channel.send(session.players[4].name + " has be killed");
                        message.channel.send("Game has ended");
                        CACHE.sessions.delete(message.guild.id + message.channel.id);
                    } else {
                        message.channel.send(session.players[4].user.tag + " has be killed");
                        message.channel.send("Game has ended");
                        CACHE.sessions.delete(message.guild.id + message.channel.id);
                    }
                } else {
                    if (session.players[4].isBot) {
                        message.channel.send(session.players[4].name + " hasn't be killed");
                    } else {
                        message.channel.send(session.players[4].user.tag + " hasn't be killed");
                    }
                    session.index++;
                }
            } else {
                if (session.players[5].isBot) {
                    message.channel.send(session.players[5].name + " has be killed");
                    message.channel.send("Game has ended");
                    CACHE.sessions.delete(message.guild.id + message.channel.id);
                } else {
                    message.channel.send(session.players[5].user.tag + " has be killed");
                    message.channel.send("Game has ended");
                    CACHE.sessions.delete(message.guild.id + message.channel.id);
                }
            }
        } else if (cmd === "cancel") {
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (!session) {
                message.channel.send("A session aren't created, create one with '"+CONFIG.prefix+"new'");
                return;
            }

            if (session.joinedPlayers[0].user.id !== message.author.id) {
                message.channel.send("Only the owner can cancel the game");
                return;
            }

            CACHE.sessions.delete(message.guild.id + message.channel.id);

            message.channel.send("The game has be cancelled");
        } else if (cmd === "help") {

        }
    });

    client.on('ready', () => {
        callback(null, client, null);
    });

    client.on('error', (error) => {
        callback(error, null, null);
    });

    client.on('disconnect', () => {
        callback(null, null, true);
    });

    client.login(CONFIG.token);
};

function shuffle(original) {
    var array = Array.from(original);
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function has(id, array) {
    for(var i = 0;i < array.length;i++) {
        if (array[i].user === null) continue;
        if (array[i].user.id === id) return true;
    }
    return false;
}