let EventEmitter = require("events").EventEmitter;

class MessageCollector extends EventEmitter {
	constructor(client, channel, filter, options = {}) {
		super();
		this.filter = filter;
		this.channel = channel;
		this.options = options;
		this.ended = false;
		this.collected = [];
		this.bot = client;

		this.listener = (channel, userstate, message, self) => this.verify({channel, userstate, message, self});
		this.bot.on("message", this.listener);
		if(options.timeout) setTimeout(() => this.stop("time"), options.timeout);
	}

	verify(vldtr) {
		if(this.channel !== vldtr.channel || vldtr.self) return false;
		vldtr = {author: vldtr.userstate, message: {content: vldtr.message, channel: vldtr.channel, author: vldtr.userstate}};
		if(this.filter( vldtr )) {
			let col =  vldtr // > > > {content: vldtr.message, author: vldtr.author};
			this.collected.push(col);

			this.emit("message", vldtr.message.content);
			if(this.collected.length >= this.options.maxMatches) this.stop("maxMatches");
			return true;
		}
		return false;
	}

	stop(reason) {
		if(this.ended) return;
		this.ended = true;
		this.bot.removeListener("message", this.listener);

		this.emit("end", this.collected, reason);
	}
}

module.exports = (client, channel, filter, options) => {
		let collector = new MessageCollector(client, channel, filter, options);
		return new Promise(resolve => collector.on("end", resolve));
	};
