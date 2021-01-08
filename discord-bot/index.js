const Discord = require('discord.js');

module.exports = (CONFIG, CACHE, callback) => {
    CACHE.logger.log("Creating a Discord client...");
    const client = new Discord.Client();

    CACHE.logger.log("Registering message event...");
    client.on('message', (message) => {
        CACHE.logger.log("Checking prefix...");
        if (!message.content.startsWith(CONFIG.prefix)) return;

        CACHE.logger.log("Parsing args and extracting command...");
        var args = message.content.trim().slice(CONFIG.prefix.length).split(' ');
        var cmd = args.shift().toLowerCase();

        CACHE.logger.log("Executing command: "+cmd);
        if (cmd === "new") {
            CACHE.logger.log("Checking for a possible session...");
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (session) {
                CACHE.logger.warn("Session already exists");
                message.channel.send({embed: CACHE.language.generateEmbed("bot.command.new", "game.session.exists", 0xFF0000)});
                return;
            }

            CACHE.logger.log("Creating a new session...");
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

            CACHE.logger.log("Sending a message...");
            message.channel.send({embed: CACHE.language.replaceEmbed(CACHE.language.generateEmbed("bot.command.new", "bot.command.new.created", 0x00ff00), [CONFIG.prefix], [])});
        } else if (cmd === "join") {
            CACHE.logger.log("Checking for a possible session...");
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (!session) {
                CACHE.logger.warn("Session doesn't exists");
                message.channel.send({embed: CACHE.language.replaceEmbed(CACHE.language.generateEmbed("bot.command.join", "bot.generic.session.noexists", 0xff0000), [CONFIG.prefix], [])});
                return;
            }

            CACHE.logger.log("Checking if session join is enabled...");
            if (!session.canJoin) {
                CACHE.logger.warn("Session join are disabled");
                message.channel.send("The game already started!");
                return;
            }

            CACHE.logger.log("Checking for the amount of players...");
            if (session.joinedPlayers.length >= 6) {
                CACHE.logger.warn("Session are full ("+session.joinedPlayers.length+"/6)");
                message.channel.send("You can't join, the game has full");
                return;
            }

            CACHE.logger.log("Checking if author are in session ("+message.author.id+")");
            if (has(message.author.id, session.joinedPlayers)) {
                CACHE.logger.warn("Author already are in session");
                message.channel.send("You are in the game!");
                return;
            }

            CACHE.logger.log("Author are added in joined players list...");
            session.joinedPlayers.push({
                name: null,
                user: message.author,
                member: message.member,
                isBot: false
            });

            CACHE.logger.log("Adding the edited session to cache...");
            CACHE.sessions.set(message.guild.id + message.channel.id, session);

            message.channel.send("You have joined to the game!");
        } else if (cmd === "exit") {
            CACHE.logger.log("Checking for a possible session...");
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (!session) {
                CACHE.logger.warn("Session doesn't exists");
                message.channel.send("A session aren't created, create one with '"+CONFIG.prefix+"new'");
                return;
            }

            CACHE.logger.log("Checking if session join is enabled...");
            if (!session.canJoin) {
                CACHE.logger.warn("Session join are disabled");
                message.channel.send("The game already started!");
                return;
            }

            CACHE.logger.log("Checking if the owner are trying exit...");
            if (session.joinedPlayers[0].user.id === message.author.id) {
                CACHE.logger.warn("The owner are trying exit");
                message.channel.send("The owner can't leave from the game");
                return;
            }

            CACHE.logger.log("Checking if author are in session ("+message.author.id+")");
            if (!has(message.author.id, session.joinedPlayers)) {
                CACHE.logger.warn("Author aren't in the session");
                message.channel.send("You aren't in the game!");
                return;
            }

            CACHE.logger.log("Removing author from session...");
            session.joinedPlayers = session.joinedPlayers.slice(session.joinedPlayers.findIndex(element => element.user.id === message.author.id));

            CACHE.logger.log("Adding the edited session to cache...");
            CACHE.sessions.set(message.guild.id + message.channel.id, session);

            message.channel.send("You have exited from the game!");
        } else if (cmd === "start") {
            CACHE.logger.log("Checking for a possible session...");
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (!session) {
                CACHE.logger.warn("Session doesn't exists");
                message.channel.send("A session aren't created, create one with '"+CONFIG.prefix+"new'");
                return;
            }

            CACHE.logger.log("Checking if session join is enabled...");
            if (!session.canJoin) {
                CACHE.logger.warn("Session join are disabled");
                message.channel.send("The game already started!");
                return;
            }

            CACHE.logger.log("Checking if the author is the owner...");
            if (session.joinedPlayers[0].user.id !== message.author.id) {
                CACHE.logger.warn("The author aren't the owner of session");
                message.channel.send("Only the owner of game can execute this command");
                return;
            }

            CACHE.logger.log("Checking if has enough players or bot completion...");
            if (session.joinedPlayers.length < 6 && !CONFIG.autoCompletWithBot) {
                CACHE.logger.warn("Auto complet with bot are disabled and doesn't has enough players ("+session.joinedPlayers.length+"/6)");
                message.channel.send("The game doesn't has the minimum of players, you need create another ("+session.joinedPlayers.length+"/6)");
                return;
            }

            CACHE.logger.log("Generating bots even auto complet with bots are disabled...");
            var botID = 0;
            while (session.joinedPlayers.length < 6) {
                botID++;
                CACHE.logger.log("Creating bot number: "+botID);
                session.joinedPlayers.push({
                    name: "Bot "+botID,
                    user: null,
                    member: null,
                    isBot: true
                });
            }

            CACHE.logger.log("Creating a random order player list...");
            session.players = shuffle(session.joinedPlayers);
            CACHE.logger.log("Disabling session join...");
            session.canJoin = false;

            CACHE.logger.log("Creating a message with new order...");
            var msg = "Game started! Order:\n\n";
            for(var i = 0;i < session.players.length;i++) {
                if (session.players[i].isBot) {
                    msg += session.players[i].name+"\n";
                } else {
                    msg += session.players[i].user.tag+"\n";
                }
            }
            
            CACHE.logger.log("Generating a random number...");
            session.rng = Math.round(Math.random() * (6.4 - 0.5) + 0.5);
            CACHE.logger.log("Random number generated: "+session.rng);

            message.channel.send(msg+"See the next event with '"+CONFIG.prefix+"next'");

            CACHE.logger.log("Adding the edited session to cache...");
            CACHE.sessions.set(message.guild.id + message.channel.id, session);
        } else if (cmd === "next") {
            CACHE.logger.log("Checking for a possible session...");
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (!session) {
                CACHE.logger.warn("Session doesn't exists");
                message.channel.send("A session aren't created, create one with '"+CONFIG.prefix+"new'");
                return;
            }

            CACHE.logger.log("Checking if session join is disabled...");
            if (session.canJoin) {
                CACHE.logger.warn("Session join are enabled");
                message.channel.send("The game aren't started!");
                return;
            }

            CACHE.logger.log("Checking if the author is the owner...");
            if (session.joinedPlayers[0].user.id !== message.author.id) {
                CACHE.logger.warn("The author aren't the owner of session");
                message.channel.send("Only the owner of game can execute this command");
                return;
            }

            CACHE.logger.log("Session processing index: "+session.index);
            CACHE.logger.log("Session random number: "+session.rng);
            CACHE.logger.log("Is user a bot? "+((session.players[session.index].isBot) ? "yes" : "no"));
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
            CACHE.logger.log("Checking for a possible session...");
            var session = CACHE.sessions.get(message.guild.id + message.channel.id);

            if (!session) {
                CACHE.logger.warn("Session doesn't exists");
                message.channel.send("A session aren't created, create one with '"+CONFIG.prefix+"new'");
                return;
            }

            CACHE.logger.log("Checking if the author is the owner...");
            if (session.joinedPlayers[0].user.id !== message.author.id) {
                CACHE.logger.warn("The author aren't the owner of session");
                message.channel.send("Only the owner can cancel the game");
                return;
            }

            CACHE.logger.log("Deleting session from cache...");
            CACHE.sessions.delete(message.guild.id + message.channel.id);

            message.channel.send("The game has be cancelled");
        } else if (cmd === "help") {

        }
    });

    CACHE.logger.log("Registering ready event...");
    client.on('ready', () => {
        CACHE.logger.log("Client ready! Notifying using callback...");
        callback(null, client, null);
        CACHE.logger.log("Callback executed!");
    });

    CACHE.logger.log("Registering error event...");
    client.on('error', (error) => {
        CACHE.logger.warn("Error detected! Printing and notifying using callback...");
        CACHE.logger.error(e);
        callback(error, null, null);
        CACHE.logger.log("Callback executed!");
    }); 

    CACHE.logger.log("Registering disconnect event...");
    client.on('disconnect', () => {
        CACHE.logger.warn("Client disconnected! Notifying using callback...");
        callback(null, null, true);
        CACHE.logger.log("Callback executed!");
    });

    CACHE.logger.log("Logging in client...");
    client.login(CONFIG.botToken);
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