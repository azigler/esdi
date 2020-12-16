const Discord = require('discord.js')

/**
 * Controller for {@link https://discord.js.org/#/docs/main/stable/general/welcome|discord.js}
 *
 * @class
 * @extends Map
 */
class BotController extends Map {
  /**
   * Initializes a new BotController
   *
   * @param {Object} config configuration object
   * @param {Esdi} config.server Esdi server instance
   * @param {String} [config.discordToken = process.env.DISCORD_TOKEN] token for Discord bot
   * @memberof BotController
   */
  init ({ server, discordToken = process.env.DISCORD_TOKEN }) {
    this.server = server
    this.token = discordToken
  }

  /**
   * Starts the BotController
   *
   * @listens Esdi#start
   * @memberof BotController
   */
  start () {
    console.log('[#] Starting BotController...')

    /**
     * discord.js Client
     * @external Client
     * @see https://discord.js.org/#/docs/main/stable/class/Client
     */
    this.client = new Discord.Client()
    this.client.botController = this

    /**
     * discord.js Message
     * @external Message
     * @see https://discord.js.org/#/docs/main/stable/class/Message
     */
    this.client.on('message', message => {
      // determine command prefix
      const prefix = this.server.controllers.get('CommandController').determinePrefix(message)

      if (message.author.bot || !prefix) return

      const args = message.content.slice(prefix.length).trim().split(/ +/)
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
   * Logs in the {@link external:Client|Client} with a token
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
