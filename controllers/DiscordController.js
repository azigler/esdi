const Discord = require('discord.js')

/**
 * Controller for {@link https://discord.js.org/#/docs/main/stable/general/welcome|discord.js}
 *
 * @class
 * @extends Map
 */
class DiscordController extends Map {
  /**
   * Initializes a new DiscordController
   *
   * @param {Object} config configuration object
   * @param {Esdi} config.server Esdi server instance
   * @param {String} [config.discordToken = process.env.DISCORD_TOKEN] token for Discord bot
   * @param {String} [config.botOwner = '139293101767262208'] Discord ID of bot instance owner
   * @memberof DiscordController
   */
  init ({ server, discordToken = process.env.DISCORD_TOKEN, botOwner = '139293101767262208' }) {
    this.server = server
    this.token = discordToken
    this.botOwner = botOwner
    this.discordJs = Discord
  }

  /**
   * Starts the DiscordController
   *
   * @listens Esdi#start
   * @memberof DiscordController
   */
  start () {
    console.log('[#] Starting DiscordController...')

    /**
     * discord.js Client
     * @external Client
     * @see https://discord.js.org/#/docs/main/stable/class/Client
     */
    this.client = new Discord.Client()
    this.client.discordController = this

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
   * Stops the DiscordController
   *
   * @listens Esdi#stop
   * @memberof DiscordController
   */
  stop () {
    console.log('[#] Stopping DiscordController...')

    delete this.id
    this.client.destroy()
  }

  /**
   * Logs in the {@link external:Client|Client} with a token
   *
   * @memberof DiscordController
   */
  login () {
    this.client.login(this.token)
      .then(() => console.log('[D] Successfully logged bot in to Discord'))
      .catch(e => { throw e.message })
  }

  /**
   * Returns an array of {@link https://discord.js.org/#/docs/main/stable/typedef/EmbedField|EmbedField} values from a string for a {@link https://discord.js.org/#/docs/main/stable/class/MessageEmbed|discord.js MessageEmbed}
   *
   * @param {String[]} embedFieldValues array of values for EmbedFields
   * @param {String} content content for EmbedFields
   * @memberof DiscordController
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
   * Returns {@link https://discord.js.org/#/docs/main/stable/typedef/EmbedField|EmbedFields} for a {@link https://discord.js.org/#/docs/main/stable/class/MessageEmbed|discord.js MessageEmbed}
   *
   * @param {String} embedFieldName name of EmbedField
   * @param {String[]} embedFieldValues array of values for EmbedFields
   * @returns {external:EmbedField[]} array of discord.js EmbedFields
   * @memberof DiscordController
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
   * Returns a {@link https://discord.js.org/#/docs/main/stable/class/MessageEmbed|discord.js MessageEmbed}
   *
   * @param {Object} embedConfig configuration object
   * @param {String} embedConfig.title MessageEmbed title
   * @param {String} embedConfig.description MessageEmbed description
   * @param {String} [embedConfig.hexColor = '#2f9d8c'] hex color code for MessageEmbed accent
   * @param {String} embedConfig.footerTextType type of Esdi component posting the MessageEmbed (e.g., Command, Hook, Event)
   * @param {external:EmbedField[]} [embedConfig.fields = []] array of discord.js EmbedFields for MessageEmbed
   * @param {external:MessageEmbedThumbnail} embedConfig.thumbnail MessageEmbedThumbnail object for MessageEmbed
   * @param {Date} embedConfig.timestamp timestamp for for MessageEmbed
   * @param {external:MessageEmbedAuthor} embedConfig.author MessageEmbedAuthor for MessageEmbed
   * @returns {external:MessageEmbed} discord.js MessageEmbed
   * @memberof DiscordController
   */
  buildEmbed ({ title, description, url, hexColor = '#2f9d8c', footerTextType, fields = [], thumbnail, timestamp, author }) {
    // only allow up to 25 fields
    const validatedFields = fields.slice(0, 25)

    return new Discord.MessageEmbed({
      author,
      title,
      description,
      url,
      color: Discord.Util.resolveColor(hexColor),
      timestamp: timestamp || Date.now(),
      footer: {
        icon_url: 'https://user-images.githubusercontent.com/7295363/101524119-6169a080-393e-11eb-8006-6816e2c5f413.gif',
        text: `${footerTextType} by Esdi 🤍`
      },
      fields: validatedFields,
      thumbnail
    })
  }

  /**
   * Returns a {@link https://discord.js.org/#/docs/main/stable/class/MessageEmbed|discord.js MessageEmbed} that reports the memory and processor usage of the server's process along with its uptime and Discord stats
   *
   * @param {Object} statusEmbedConfig configuration object
   * @param {String} statusEmbedConfig.title MessageEmbed title
   * @param {String} statusEmbedConfig.footerTextType type of Esdi component calling this method (e.g., Command, Event)
   * @returns {external:MessageEmbed} discord.js MessageEmbed
   * @memberof DiscordController
   */
  buildStatusEmbed ({ title, footerTextType }) {
    const fields = []

    const uptime = this.server.determineUptime()
    fields.push({
      name: '__Uptime__',
      value: `\`${uptime}\``,
      inline: true
    })

    const rss = this.server.determineMemory()
    fields.push({
      name: '__Memory__',
      value: `\`${rss}\``,
      inline: true
    })

    const processor = this.server.determineProcessor()
    fields.push({
      name: '__Processor__',
      value: `\`${processor}\``,
      inline: true
    })

    fields.push({
      name: '__Servers__',
      value: `\`${this.server.controllers.get('GuildController').size}\``,
      inline: true
    })

    fields.push({
      name: '__Users__',
      value: `\`${this.server.controllers.get('UserController').size}\``,
      inline: true
    })

    fields.push({
      name: '__Version__',
      value: '`' + require('./../package').version + '`',
      inline: true
    })

    const colors = ['blue', 'gray', 'green', 'pink', 'brown', 'yellow']

    const hexColors = {
      blue: '#788eb7',
      gray: '#808080',
      green: '#77bb74',
      pink: '#c78c9f',
      brown: '#aa8a85',
      yellow: '#bd9e73'
    }

    const images = {
      blue: 'https://user-images.githubusercontent.com/7295363/103381612-22dc8700-4aa1-11eb-940e-ef27d9cc9ea2.gif',
      gray: 'https://user-images.githubusercontent.com/7295363/103381613-23751d80-4aa1-11eb-818d-6696a6f67b4f.gif',
      green: 'https://user-images.githubusercontent.com/7295363/103381614-240db400-4aa1-11eb-8435-1976ec95dd9a.gif',
      pink: 'https://user-images.githubusercontent.com/7295363/103381617-240db400-4aa1-11eb-9579-6fd6f5ace65e.gif',
      brown: 'https://user-images.githubusercontent.com/7295363/103381618-24a64a80-4aa1-11eb-9206-8916473d9a5f.gif',
      yellow: 'https://user-images.githubusercontent.com/7295363/103381620-24a64a80-4aa1-11eb-99e6-db45b15a1c40.gif'
    }

    const random = Math.floor(Math.random() * colors.length)
    const color = colors[random]

    // build message embed
    return this.buildEmbed({
      title,
      footerTextType,
      fields,
      hexColor: hexColors[color],
      thumbnail: {
        url: images[color]
      }
    })
  }
}

// factory
module.exports = new DiscordController()
