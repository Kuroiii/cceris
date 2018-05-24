let tmi     = require("tmi.js");
let path    = require("path");
let fs      = require("fs");
let Command = require("./Command.js");

function formatDate(date) {
    var hours = date.getHours();
    var mins = date.getMinutes();

    hours = (hours < 10 ? "0" : "") + hours;
    mins = (mins < 10 ? "0" : "") + mins;

    return `${hours}:${mins}`;
}

class Twitch {
    constructor(options) {
        this.client     = null;
        this.options    = options;
        this.commands   = [];
        this.categories = new Map();
        this.admins     = [];

        if(options) this.set(options);

    }

    set(options) {
        if(typeof options === "object") {
            this.options.connection = options.connection || { reconnect: true, secure: true };
            this.options.options    = options.options || { debug: false };
            this.options.identity   = options.identity || null;
            this.options.channels   = options.channels || [];
            this.options.prefix     = options.prefix || null;

            if(options.identity === null) throw new Error("Please, define username and password(OAUTH).");
            if(options.prefix   === null) throw new Error("Please, define the prefix.");
            this.client = new tmi.client(options);
        }
    }

    announce(message) {
        this.options.channels.forEach(channel => {
            let now = new Date();
            if(this.options.options.debug === true) console.log(`[${formatDate(now)}] Twitcher :: Sent "${message}" to every channel listed on the array.`);
            this.client.action(channel, message);
        })
        return this;
    }

    command(...params) {
        if(this.client === null) { process.nextTick(() => this.command(...params)); return; }
        //name = name.toLowerCase();
        let command = new Command(this, ...params);
        this.commands.push({ name: command.name, aliases: command.aliases || "NONE", description: command.description || "" })

        this.client.on("message", function (channel, userstate, message, self) {
            let msg     = {};
            msg.content = message;
            msg.channel = channel;
            msg.author  = userstate;
            if(self) return;

            let opt = {
                msg,
                message: msg,
                sender: msg.author,
                author: msg.author,
                reply: (content) => {
                    return this.say(channel, `${content}`)
                },
                whisper: (content) => {
                    return this.whisper(opt.sender.username, `${content}`)
                }
            }

            // Handle different message types..
            switch(userstate["message-type"]) {
            case "chat":
                if(message.indexOf(this.opts.prefix) !== 0) return;
                
                let args = message.slice(1).trim().split(/ +/g);
                msg.args    = args;
                let cmd = args.shift().toLowerCase();
                
                try {
					
                    if(cmd.caseSensitive === true || this.caseSensitiveCommands === true) {
                        if(cmd === command.name.toLowerCase()) command.process(opt);
                    } else
                    if(cmd === command.name) command.process(opt);
                    
                } catch(err) {
                    console.error(err);
                }
                break;
            default:
                break;
            }
        });


    }

    connect() {
        this.client.connect();
        if(this.client.readyState() !== "CLOSED") {
            this.client.startedAt = new Date().getTime();
        }

        return this;
    }

}

Twitch.prototype.awaitMessages = require("./awaitmessage.js");
module.exports = Twitch;
