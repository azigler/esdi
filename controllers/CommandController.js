const discordJs = require('discord.js')

/**
 * Controller for Discord bot {@link Command|Commands}
 *
 * @class
 */
class CommandController {
  /**
   * Initializes a new CommandController
   *
   * @param {Object} config configuration object
   * @param {Esdi} config.server Esdi server instance
   * @param {String} [config.botPrefix = 'esdi!'] prefix for {@link Command|Commands}
   * @memberof CommandController
   */
  init ({ server, botPrefix = 'esdi!' }) {
    this.server = server
    this.prefix = botPrefix
  }

  /**
   * Starts the CommandController
   *
   * @listens Esdi#start
   * @memberof CommandController
   */
  start () {
    console.log('[#] Starting CommandController...')

    this.cooldowns = new Map()
  }

  /**
   * Stops the CommandController
   *
   * @listens Esdi#stop
   * @memberof CommandController
   */
  stop () {
    console.log('[#] Stopping CommandController...')

    delete this.cooldowns
  }

  /**
   * Finds a matching Command
   *
   * @param {String} commandName name or alias of command
   * @returns {Command}
   * @memberof CommandController
   */
  findCommand (commandName) {
    return this.server.commands.get(commandName) || this.server.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
  }

  /**
   * Determines the command prefix for a provided message
   *
   * @param {external:Message} message discord.js Message
   * @returns {String|Boolean} prefix string or false
   * @memberof CommandController
   */
  determinePrefix (message) {
    let prefix = false
    // first, check if using the primary prefix
    if (message.content.startsWith('esdi!')) {
      // if so, use the primary prefix
      prefix = 'esdi!'
      // then, check if this Guild has a custom prefix
    } else if (
      this.server.controllers.get('GuildController').get(message.guild.id).prefix &&
      message.content.startsWith(this.server.controllers.get('GuildController').get(message.guild.id).prefix)) {
      // if so, use the Guild's custom prefix
      prefix = this.server.controllers.get('GuildController').get(message.guild.id).prefix
      // finally, check the instance prefix
    } else if (
      message.content.startsWith(this.prefix)) {
      prefix = this.prefix
    }

    return prefix
  }

  /**
   * Executes a Command
   *
   * @param {Object} config configuration object
   * @param {Command} config.command Discord bot Command
   * @param {String[]} config.args array of argument strings
   * @param {Message} config.message Discord Message
   * @returns {Message}
   * @memberof CommandController
   */
  executeCommand ({ command, args, message }) {
    if (command.ownerOnly && (message.author.id !== message.guild.ownerID)) {
      return message.reply(`only the server owner can use the \`${command.name}\` command.`)
    }

    if (command.guildOnly && message.channel.type === 'dm') {
      return message.reply(`the \`${command.name}\` command does not work in a direct message.`)
    }

    if (command.args && !args.length) {
      let reply = `Invalid use of the \`${command.name}\` command, ${message.author}.`

      if (command.usage) {
        reply += `\n**Syntax:** \`${this.determinePrefix(message)}${command.name} ${command.usage}\``
      }

      return message.channel.send(reply)
    }

    if (!this.cooldowns.has(command.name)) {
      this.cooldowns.set(command.name, new discordJs.Collection())
    }

    const now = Date.now()
    const timestamps = this.cooldowns.get(command.name)
    const cooldownAmount = (command.cooldown) * 1000

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000
        return message.reply(`you must wait \`${Math.ceil(timeLeft)} second${Math.ceil(timeLeft) !== 1 ? 's' : ''}\` before reusing the \`${command.name}\` command.`)
      }
    }

    timestamps.set(message.author.id, now)
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

    try {
      command.execute({ message, args, server: this.server })
    } catch (error) {
      console.error(error)
      message.reply(`an error occurred while attempting to execute the \`${command.name}\` command.`)
    }
  }
}

// factory
module.exports = new CommandController()
