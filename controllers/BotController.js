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
   * @param {String} [config.botOwner = '139293101767262208'] Discord ID of bot instance owner
   * @memberof BotController
   */
  init ({ server, discordToken = process.env.DISCORD_TOKEN, botOwner = '139293101767262208' }) {
    this.server = server
    this.token = discordToken
    this.botOwner = botOwner
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

      const args = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/)
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

  /**
   * Builds an array of EmbedField values from a string for a discord.js MessageEmbed
   *
   * @param {String[]} embedFieldValues array of values for EmbedFields
   * @param {String} content content for EmbedFields
   * @memberof BotController
   */
  buildEmbedFieldValues (embedFieldValues, content) {
    if (!embedFieldValues[0]) embedFieldValues[0] = ''

    const i = embedFieldValues.length - 1

    if (embedFieldValues[i].length + content.length <= 1024) {
      embedFieldValues[i] += content
    } else {
      if (!embedFieldValues[i + 1]) embedFieldValues[i + 1] = ''
      embedFieldValues[i + 1] += content
    }
  }

  /**
   * Builds EmbedFields for a discord.js MessageEmbed
   *
   * @param {String} embedFieldName name of EmbedField
   * @param {String[]} embedFieldValues array of values for EmbedFields
   * @returns {external:EmbedField[]} array of discord.js EmbedFields
   * @memberof BotController
   */
  buildEmbedFields (embedFieldName, embedFieldValues) {
    const embedFields = []
    for (let i = 0; i <= embedFieldValues.length - 1; i++) {
      embedFields.push({
        name: `${embedFieldName}${i !== 0 ? ' (cont.)' : ''}`,
        value: embedFieldValues[i]
      })
    }
    return embedFields
  }

  /**
   * Builds a discord.js MessageEmbed
   *
   * @param {Object} embedConfig configuration object
   * @param {String} embedConfig.title MessageEmbed title
   * @param {String} embedConfig.description MessageEmbed description
   * @param {String} [embedConfig.hexColor = '#2f9d8c'] hex color code for MessageEmbed accent
   * @param {String} embedConfig.footerTextName name of Esdi component posting the Message Embed (e.g., Help, Ko-fi)
   * @param {String} embedConfig.footerTextType type of Esdi component posting the MessageEmbed (e.g., Command, Hook, Event)
   * @param {external:EmbedField[]} embedConfig.fields array of discord.js EmbedFields for MessageEmbed
   * @returns {external:MessageEmbed} discord.js MessageEmbed
   * @memberof BotController
   */
  buildEmbed ({ title, description, hexColor = '#2f9d8c', footerTextName, footerTextType, fields }) {
    // only allow up to 25 fields
    const validatedFields = fields.slice(0, 25)

    return new Discord.MessageEmbed({
      title,
      description,
      color: Discord.Util.resolveColor(hexColor),
      timestamp: Date.now(),
      footer: {
        icon_url: 'https://user-images.githubusercontent.com/7295363/101524119-6169a080-393e-11eb-8006-6816e2c5f413.gif',
        text: `${footerTextName} ${footerTextType} by Esdi 🤍`
      },
      fields: validatedFields
    })
  }
}

// factory
module.exports = new BotController()
