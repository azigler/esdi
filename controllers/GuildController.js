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
   * @param {Object} config.server Esdi server instance
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
  addGuild (guild) {
    console.log(`[+] Joined ${guild.name}`)

    this.set(guild.id, new Guild(guild))

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
   * Fetches the Guilds to which the bot is connected (and also fetches GuildMembers)
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
