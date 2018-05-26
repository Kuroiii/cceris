const { CommandClient } = require('eris')
const Command = require('./Command.js')
const fs = require('fs')
const path = require('path')
const term = require('terminal-kit').terminal
const chalk = require('chalk')

/**
 * Custom client
 * @constructor
 * @param {string} token - The bot's oauth token
 * @param {Object} [CCoptions] - The commandClient options
 * @param {Object} [botOptions] - The customClient options
 * @param {string} [botOptions.listeners] - The folder where all the event listeners are located
 * @param {string} [botOptions.commands] - The folder where all the commands are located
 */
module.exports = class PokeBot extends CommandClient {
  constructor (token, botOptions) {
    super(botOptions)
    this.token = token || ''
    this.botOptions = botOptions || {}
    this.events = []
    this.cmds = []

    if (this.botOptions.prefix) this.commandOptions['prefix'] = this.botOptions.prefix
    if (this.botOptions.listeners) this.loadEvents(this.botOptions.listeners)
    if (this.botOptions.commands) this.loadCommands(this.botOptions.commands)
    if (this.botOptions.lodash) this._ = require('lodash')
  }

  command (...params) {
    if (this.client === null) { process.nextTick(() => this.command(...params)); return }
    // name = name.toLowerCase();
    let command = new Command(this, ...params)
    this.cmds.push({ name: command.name, aliases: command.aliases || 'NONE', description: command.description || '' })

    this.on('messageCreate', (message) => {
      let opt = {
        send: (ctx) => {
          return message.channel.createMessage(ctx)
        }
      }

      this.botOptions.prefix.forEach((p) => { if (message.content.indexOf(p) !== 0) return })

      let args = message.content.slice(1).trim().split(/ +/g)
      let cmd = args.shift().toLowerCase()

      try {
        if (cmd.caseSensitive === true || this.caseSensitiveCommands === true) {
          if (cmd === command.name.toLowerCase()) command.process(opt)
        } else
        if (cmd === command.name) command.process(opt)
      } catch (err) {
        console.error(err)
      }
    })
  }

  /**
     * Establish the connection to discord's API
     * @return {Object} data - The bot's data
     */
  login () {
    const token = this.token
    term.clear()
    if (!token) throw new Error("You should supply the bot's token")
    return super.connect()
  }

  /**
     * Custom client logger
     * @param {string} message - The message to be sent
     * @param {string} [prefix] - The message's prefix
     * @return {string} message
     */
  log (...args) {
    const d = new Date()
    const message = args[0]
    const tags = args.slice(1).map(t => `[${t}]`)
    const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
    console.log(chalk.yellow(time), chalk.cyan(...tags), message)
  }

  /**
     * Custom client error logger
     * @param {string} message - The error message to be sent to the console
     * @return {string} error
     */
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
            	  // const r = cmd.run
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
