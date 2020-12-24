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
    this.intervalEvents = new Map()
  }

  /**
   * Starts the EventController
   *
   * @listens Esdi#start
   * @memberof EventController
   */
  async start () {
    console.log('[#] Starting EventController...')

    // get all loaded interval Events and their database documents
    for (const e of this.server.events.values()) {
      // only consider interval Events
      if (e.type !== 'interval') continue

      // fetch this Event's database document
      let doc = await this.server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: e.name })

      // if missing, initialize this Event's database document
      doc = await this.initializeIfMissing(this.server, e, doc)

      // fetch the array of contexts with this Event enabled
      const allContexts = doc.contextTimestampPairs.map(p => p[0])

      // keep only enabled contexts
      const enabledContexts = []
      for (const c of allContexts) {
        const contextDoc = await this.server.controllers.get('DatabaseController').fetchDoc({
          db: 'event',
          id: `${e.name}_${c}`
        })
        if (contextDoc.enabled) enabledContexts.push(c)
      }

      // remember the interval Event and its array of enabled contexts
      this.intervalEvents.set(e.name, enabledContexts)
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
    this.intervalEvents.clear()
  }

  /**
   * Called every {@link Esdi} server loop
   *
   * @listens Esdi#loop
   * @memberof EventController
   */
  loop () {
    // iterate over the loaded interval Events and fire the handler for each enabled context
    this.intervalEvents.forEach(async (contexts, eventName) => {
      const event = Array.from(this.server.events.values()).filter(e => e.name === eventName)[0]

      // fetch this Event's database document
      let doc = await this.server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: event.name })

      // if missing, initialize this Event's database document
      doc = await this.initializeIfMissing(this.server, event, doc)

      // iterate over each context
      for (const context of contexts) {
        const timestamp = doc.contextTimestampPairs.find(pair => pair[0] === context)[1]

        // fetch database document for each context to check if enabled
        const { enabled, config } = await this.server.controllers.get('DatabaseController').fetchDoc({
          db: 'event',
          id: `${event.name}_${context}`
        })
        // apply custom config for this context
        const interval = (config && config.interval ? config.interval : event.interval)

        // determine the Event's timing interval
        const { day, hr, min, sec } = this.server.utils.parseIntervalString(interval)

        const intervalAmount = (sec * 1000) + (min * 60000) + (hr * 3600000) + (day * 86400000)

        const now = Date.now()
        const nextInterval = timestamp + intervalAmount

        // if it's time for this Event to fire for this context and it is enabled
        if (now > nextInterval && enabled) {
          // determine the capitalized name of this context
          const contextName = (event.context === 'guild' ? 'Server' : 'Channel')

          // check if bot can see context
          let con
          try {
            // determine this Event's context
            let fetchedContext

            if (context !== 'global') {
              if (event.context === 'guild') {
                fetchedContext = await this.server.controllers.get('BotController').client.guilds.fetch(context)
              } else if (event.context === 'channel') {
                fetchedContext = await this.server.controllers.get('BotController').client.channels.fetch(context)
              }
            }

            con = {
              type: event.context,
              ctx: (event.context === 'global' ? 'global' : fetchedContext)
            }
          } catch (e) {
            // update locally to avoid handling every loop
            const local = this.server.controllers.get('EventController').intervalEvents.get(event.name)
            this.server.controllers.get('EventController').intervalEvents.set(event.name, [...local.filter(c => c !== context)])

            // save the Event as disabled in the context's database document
            await this.server.controllers.get('DatabaseController').updateDoc({
              db: 'event',
              id: `${event.name}_${context}`,
              payload: {
                enabled: false
              }
            })

            return console.log(`Bot doesn't know about ${contextName}<${context}> for ${event.name} Event:`, e)
          }

          // update this context's timestamp in the database document for this Event
          const payload = doc.contextTimestampPairs.filter(p => p[0] !== context)
          await this.server.controllers.get('DatabaseController').updateDoc({
            db: 'event',
            id: event.name,
            payload: {
              contextTimestampPairs: [...payload, [context, now]]
            }
          })

          // update the timestamp in this context's database document for this Event
          await this.server.controllers.get('DatabaseController').updateDoc({
            db: 'event',
            id: `${event.name}_${context}`,
            payload: {
              lastHandled: now
            }
          })

          // fire the handler for this Event for this context
          event.handler({ server: this.server, context: con.ctx })

          // announce handling of Event
          console.log(`${event.name} Event was just handled ${con.type === 'global' ? 'globally' : `for ${this.server.utils.capitalize(con.type)} <${con.ctx.id}>`}`)
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

  /**
   * Helper method that initializes the database document if missing
   *
   * @param {String} type framework file type to load
   * @param {String} dir directory to load files from
   * @memberof Esdi
   * @private
   */
  async initializeIfMissing (server, event, doc) {
    if (doc.status === 404 || !doc.contextTimestampPairs) {
      return await server.controllers.get('DatabaseController').updateDoc({
        db: 'event',
        id: event.name,
        payload: {
          contextTimestampPairs: []
        }
      })
    } else {
      return doc
    }
  }
}

// factory
module.exports = new EventController()
