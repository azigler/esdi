/**
 * Reports the memory and processor usage of the server's process along with its uptime and Discord stats
 *
 * @type {Event}
 * @memberof Event
 * @name monitor
 * @prop {Object} handlerConfig `handler` function configuration object
 * @prop {Esdi} handlerConfig.server Esdi server instance
 * @prop {external:Guild|external:Channel|String} handlerConfig.context Event context
 * @prop {Object} enableConfig `enable` function configuration object
 * @prop {Esdi} enableConfig.server Esdi server instance
 * @prop {external:Guild|external:Channel|String} enableConfig.context Event context
 * @prop {Object} disableConfig `disable` function configuration object
 * @prop {Esdi} disableConfig.server Esdi server instance
 * @prop {external:Guild|external:Channel|String} disableConfig.context Event context
 * @tutorial process-monitor-global-interval-event-example
 * @static
 */
module.exports = {
  name: 'process-monitor',
  type: 'interval',
  description: 'Reports the memory and processor usage of the server\'s process along with its uptime and Discord stats.',
  async handler ({ server, context }) {
    const bot = server.controllers.get('BotController').client
    const doc = await server.controllers.get('DatabaseController').fetchDoc({
      db: 'event',
      id: `${this.name}_${context}`
    })
    const channel = await bot.channels.fetch(doc.config.channel)

    const embed = bot.botController.buildStatusEmbed({ title: `\`process-monitor\` Event *(${doc.config.interval})*`, footerTextType: 'Event' })

    channel.send(embed)
  },
  async enable ({ server, context, args, message }) {
    // determine the Event's timing interval
    const { day, hr, min, sec } = server.utils.parseIntervalString(args[0])

    if ((day + hr + min + sec) === 0) {
      switch (args[0]) {
        case 'hourly':
        case 'hour':
        case '1h':
        case '1hr': {
          this.interval = '1h'
          break
        }
        case 'weekly':
        case 'week':
        case '1w':
        case '7d': {
          this.interval = '7d'
          break
        }
        case 'monthly':
        case 'month':
        case '30d': {
          this.interval = '30d'
          break
        }
        case 'daily':
        case 'day':
        case '1d':
        default: {
          this.interval = '1d'
          break
        }
      }
    } else {
      this.interval = args[0]
    }

    message.channel.send(`\`interval\` was set to: \`${this.interval}\``)

    await server.controllers.get('DatabaseController').updateDoc({
      db: 'event',
      id: `${this.name}_${context}`,
      payload: {
        config: {
          channel: message.channel.id,
          interval: this.interval
        }
      }
    })
  },
  async disable ({ server, context, args, message }) {
    await server.controllers.get('DatabaseController').updateDoc({
      db: 'event',
      id: `${this.name}_${context}`,
      payload: {
        config: undefined
      }
    })
  }
}