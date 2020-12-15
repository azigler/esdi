/**
 * Controller for {@link Event|Events}
 *
 * @class
 */
class EventController {
  /**
   * Initializes a new EventController
   *
   * @param {Object} config configuration object
   * @param {Esdi} config.server Esdi server instance
   * @memberof EventController
   */
  init ({ server }) {
    this.server = server
    this.channelEvents = new Map()
  }

  /**
   * Starts the EventController
   *
   * @listens Esdi#start
   * @memberof EventController
   */
  async start () {
    console.log('[#] Starting EventController...')

    // get all loaded channel type Events and their database documents
    for (const e of this.server.events.values()) {
      // only consider channel type Events
      if (e.type !== 'channel') continue

      // fetch this Event's database document
      let doc = await this.server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: e.name })

      // if missing, initialize this Event's database document
      doc = await initializeIfMissing(e, doc)

      // fetch the array of channels with this Event enabled
      const channels = doc.channelTimestampPairs.map(p => p[0])

      // remember the channel type Event and its array of enabled Channels
      this.channelEvents.set(e.name, channels)
    }
  }

  /**
   * Stops the EventController
   *
   * @listens Esdi#stop
   * @memberof EventController
   */
  stop () {
    console.log('[#] Stopping EventController...')
    this.channelEvents.clear()
  }

  /**
   * Called every {@link Esdi} server loop
   *
   * @listens Esdi#loop
   * @memberof EventController
   */
  loop () {
    // saves updated Users to the database
    this.server.controllers.get('UserController').forEach(user => {
      if (user.__changed) {
        this.server.controllers.get('DatabaseController').updateDoc({
          db: 'user',
          id: user.id,
          payload: {
            guilds: user.guilds.map(g => { return g.id }),
            username: user.username,
            lastUpdated: Date.now()
          }
        })
        delete user.__changed
      }
    })

    // iterate over the loaded channel type Events and fire the handler for each enabled channel
    this.channelEvents.forEach(async (channels, eventName) => {
      const event = Array.from(this.server.events.values()).filter(e => e.name === eventName)[0]

      // fetch this Event's database document
      let doc = await this.server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: event.name })

      // if missing, initialize this Event's database document
      doc = await initializeIfMissing(event, doc)

      // determine the Event's timing interval
      const day = (event.interval.match(/(\d*)d/g) ? event.interval.match(/(\d*)d/g)[0].slice(0, -1) : 0)
      const hr = (event.interval.match(/(\d*)h/g) ? event.interval.match(/(\d*)h/g)[0].slice(0, -1) : 0)
      const min = (event.interval.match(/(\d*)m/g) ? event.interval.match(/(\d*)m/g)[0].slice(0, -1) : 0)
      const sec = (event.interval.match(/(\d*)s/g) ? event.interval.match(/(\d*)s/g)[0].slice(0, -1) : 0)
      const intervalAmount = (sec * 1000) + (min * 60000) + (hr * 3600000) + (day * 86400000)
      const now = Date.now()

      // iterate over each channel with this Event enabled
      for (const channel of channels) {
        const timestamp = doc.channelTimestampPairs.find(pair => pair[0] === channel)[1]
        const nextInterval = timestamp + intervalAmount

        // return if it's not time yet for this Event to fire for this channel
        if (now > nextInterval) {
          // update this channel's timestamp in the database document for this Event
          const payload = doc.channelTimestampPairs.filter(p => p[0] !== channel)
          this.server.controllers.get('DatabaseController').updateDoc({
            db: 'event',
            id: event.name,
            payload: {
              channelTimestampPairs: [...payload, [channel, now]]
            }
          })

          // fetch the discord.js Channel for this channel
          const ch = await this.server.controllers.get('BotController').client.channels.fetch(channel)

          // fire the handler for this Event for this channel
          event.handler({ server: this.server, channel: ch })

          // announce handling of Event
          console.log(`${event.name} Event was just handled for Channel<${channel}>`)
        }
      }
    })
  }

  /**
   * Registers Discord Events to the provided discord.js Client
   *
   * @param {external:Client} client discord.js Client
   * @memberof EventController
   */
  registerDiscordEvents (client) {
    this.server.events.forEach(event => {
      if (!event.discordEventName || !event.handler || event.type !== 'discord') return
      client.on(event.discordEventName, event.handler.bind(client.botController.server))
    })
  }
}

// factory
module.exports = new EventController()

// helper function that initializes the database document if missing
const initializeIfMissing = async (event, doc) => {
  if (doc.status === 404 || !doc.channelTimestampPairs) {
    return await this.server.controllers.get('DatabaseController').updateDoc({
      db: 'event',
      id: event.name,
      payload: {
        channelTimestampPairs: []
      }
    })
  } else {
    return doc
  }
}
