/**
 * Controller for Events
 *
 * @class
 */
class EventController {
  /**
   * Initializes a new EventController
   *
   * @param {Object} config configuration object
   * @param {Object} config.server Esdi server instance
   * @memberof EventController
   */
  init ({ server }) {
    this.server = server
  }

  /**
   * Starts the EventController
   *
   * @listens Esdi#start
   * @memberof EventController
   */
  start () {
    console.log('[#] Starting EventController...')
  }

  /**
   * Stops the EventController
   *
   * @listens Esdi#stop
   * @memberof EventController
   */
  stop () {
    console.log('[#] Stopping EventController...')
  }

  /**
   * Called every Esdi server loop
   *
   * @listens Esdi#loop
   * @memberof EventController
   */
  loop () {
    // saves updated users to the database
    this.server.controllers.get('UserController').forEach(user => {
      if (user.__changed) {
        this.server.controllers.get('DatabaseController').updateDoc({
          db: 'user',
          id: user.id,
          payload: {
            guilds: user.guilds.map(g => { return g.id }),
            username: user.username,
            timestamp: new Date()
          }
        })
        delete user.__changed
      }
    })
  }

  /**
   * Registers Events to the provided Discord Client
   *
   * @param {Client} client Discord Client object
   * @memberof EventController
   */
  registerDiscordEvents (client) {
    // TODO: expand type options
    this.server.events.forEach(event => {
      if (!event.name || !event.func || event.type !== 'discord') return
      client.on(event.name, event.func.bind(client.botController.server))
    })
  }
}

// factory
module.exports = new EventController()
