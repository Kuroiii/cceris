
class Command {
	constructor(client, name, ...extra) {
		let options = {};
		if(extra.length === 1) {
			this.process = extra[0];
		} else {
			this.process = extra[1];
			options = extra[0];
		}
		
		Object.entries(options).forEach(([key, value]) => this[key] = value);
		this.name          = name.toLowerCase();
		this.description   = options.description;
		this.aliases       = options.aliases || [];
		this.caseSensitive = options.caseSensitive || false; 
	}
	
	async run(message, client, userstate, channel, next) {
		const { command } = this;
		
		let opt = {
			message,
			userstate,
			channel,
			reply: (content) => {
				return client.say(channel, `${content}`)
			}
		}
		
		const result = await command.process(opt, next);
		opt.reply(result);
		
	}
}

module.exports = Command;
