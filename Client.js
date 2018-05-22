const { CommandClient } = require('eris')
const fs = require('fs')
const path = require('path')
const term = require('terminal-kit').terminal
const chalk = require('chalk')
module.exports = class PokeBot extends CommandClient {
  constructor (token, CCoptions, botOptions) {
    super(botOptions)
    this.token = token
    this.botOptions = botOptions
    this.botOptions.CC = CCoptions
    this.events = []
    this.cmds = []
    if (this.botOptions.CC) this.loadCClientConfig(this.botOptions.CC)
    if (this.botOptions.listeners) this.loadEvents(this.botOptions.listeners)
    if (this.botOptions.commands) this.loadCommands(this.botOptions.commands)
  }
  login () {
    const token = this.token
    term.clear()
    if (!token) process.exit()
    return super.connect()
  }
  log (...args) {
    const d = new Date()
    const message = args[0]
    const tags = args.slice(1).map(t => `[${t}]`)
    const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
    console.log(chalk.yellow(time), chalk.cyan(...tags), message)
  }
  logError (err) {
    console.log(chalk.bgRed(err))
  }
  loadCClientConfig (opts) {
    Object.keys(opts).forEach((opt) => { this.commandOptions[opt] = opts[opt] })
  }
  loadCommands (dir) {
    if (!fs.existsSync(dir)) throw new Error(`Invalid path: ${dir}`)
    fs.readdir(dir, (err, files) => {
      if (err) throw new Error(err)
      files.forEach(file => {
        const cmd = require(`${path.resolve(dir, file)}`)
        let cmdname = file.split('.')[0]
        this.cmds.push(cmdname)
        this.log(`${cmdname} loaded`, `BOOTUP > COMMANDS > ${file.toUpperCase()}`)
        if (cmd.enabled) this.registerCommand(cmd.name || cmd.label || cmdname, cmd.run, cmd.options || {})
      })
    })
  }
  loadEvents (dir) {
    if (!fs.existsSync(dir)) throw new Error(`Invalid path: ${dir}`)
    fs.readdir(dir, (err, files) => {
      if (err) throw new Error(err)
      files.forEach(file => {
        const event = require(`${path.resolve(dir, file)}`)
        let eventName = file.split('.')[0]
        this.events.push(eventName)
        this.log(`${eventName} Event loaded`, `BOOTUP > EVENTS > ${file.toUpperCase()}`)
        this.on(eventName, event.bind(null, this))
      })
    })
  }
}
