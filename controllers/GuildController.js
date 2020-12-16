const Guild = require('./../models/Guild')

/**
 * Controller for {@link Guild|Guilds}
 *
 * @class
 * @extends Map
 */
class GuildController extends Map {
  /**
   * Initializes a new GuildController
   *
   * @param {Object} config configuration object
   * @param {Esdi} config.server Esdi server instance
   * @memberof GuildController
   */
  init ({ server }) {
    this.server = server
  }

  /**
   * Starts the GuildController
   *
   * @listens Esdi#start
   * @memberof GuildController
   */
  start () {
    console.log('[#] Starting GuildController...')
  }

  /**
   * Stops the GuildController
   *
   * @listens Esdi#stop
   * @memberof GuildController
   */
  stop () {
    console.log('[#] Stopping GuildController...')
    this.clear()
  }

  /**
   * Adds a Guild to the GuildController
   *
   * @param {external:Guild} guild discord.js Guild
   * @memberof GuildController
   */
  async addGuild (guild) {
    console.log(`[+] Joined ${guild.name}`)

    // initialize this Guild
    const newGuild = new Guild(guild)
    newGuild.hydrate(this.server)
    this.set(guild.id, newGuild)

    // fetch the database document for this Guild
    await this.server.controllers.get('DatabaseController').fetchDoc({
      db: 'guild',
      id: guild.id
    })

    // fetch the Users in this Guild
    this.server.controllers.get('UserController').fetchGuildMembers(guild)
  }

  /**
   * Removes a Guild from the GuildController
   *
   * @param {external:Guild} guild discord.js Guild
   * @memberof GuildController
   */
  removeGuild (guild) {
    console.log(`[-] Left ${guild.name}`)

    this.delete(guild.id)

    this.server.controllers.get('UserController').forEach(user => {
      if (!user.isInGuild(guild)) return
      user.removeGuild(guild)
    })
  }

  /**
   * Fetches the Guilds to which the bot is connected
   *
   * @param {external:Client} client discord.js Client
   * @memberof GuildController
   */
  fetchInitialGuilds (client) {
    client.guilds.cache.map(guild => {
      this.addGuild(guild)
    })
  }
}

// factory
module.exports = new GuildController()
