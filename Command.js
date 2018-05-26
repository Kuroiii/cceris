
class Command {
  constructor (client, name, ...opts) {
    let opts = {}
    if (extra.length === 1) this.process = opts[1]
    if (extra.length === 2) this.process = opts[1], cfg = opts[0]

    this.name = name || cfg.name
    this.hidden = cfg.hidden || false
    this.patronOnly = !!opts.hidden
  }

  run (message, client, next) {
    const { command } = this
    command.proccess(next)
  }
}

module.exports = Command
