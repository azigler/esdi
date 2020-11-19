const Discord = require('discord.js')

/**
 * Controller for Discord bot
 *
 * @class
 * @extends Map
 */
class BotController extends Map {
  /**
   * Initializes a new BotController
   *
   * @param {Object} config configuration object
   * @param {Object} config.server Esdi server instance
   * @param {String} [config.discordToken = process.env.DISCORD_TOKEN] token for Discord bot
   * @param {String} [config.botPrefix = '!'] prefix for Discord bot commands
   * @memberof BotController
   */
  init ({ server, discordToken = process.env.DISCORD_TOKEN, botPrefix = '!' }) {
    this.server = server
    this.token = discordToken
    this.prefix = botPrefix
  }

  /**
   * Starts the BotController
   *
   * @listens Esdi#start
   * @memberof BotController
   */
  start () {
    console.log('[#] Starting BotController...')

    this.client = new Discord.Client()
    this.client.botController = this

    this.client.on('message', message => {
      if (!message.content.startsWith(this.prefix) || message.author.bot) return

      const args = message.content.slice(this.prefix.length).trim().split(/ +/)
      const commandName = args.shift().toLowerCase()

      const command = this.server.controllers.get('CommandController').findCommand(commandName)
      if (!command) return

      this.server.controllers.get('CommandController').executeCommand({ command, args, message })
    })

    // register Events to the bot
    this.server.controllers.get('EventController').registerDiscordEvents(this.client)

    this.login()
  }

  /**
   * Stops the BotController
   *
   * @listens Esdi#stop
   * @memberof BotController
   */
  stop () {
    console.log('[#] Stopping BotController...')

    delete this.id
    this.client.destroy()
  }

  /**
   * Logs in the Discord bot with its token
   *
   * @memberof BotController
   */
  login () {
    this.client.login(this.token)
      .then(() => console.log('[D] Successfully logged bot in to Discord'))
      .catch(e => { throw e.message })
  }
}

// factory
module.exports = new BotController()
