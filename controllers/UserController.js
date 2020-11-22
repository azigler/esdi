const User = require('./../models/User')

/**
 * Controller for {@link User|Users}
 *
 * @class
 * @extends Map
 */
class UserController extends Map {
  /**
   * Initializes a new UserController
   *
   * @param {Object} config configuration object
   * @param {Object} config.server Esdi server instance
   * @memberof UserController
   */
  init ({ server }) {
    this.server = server
  }

  /**
   * Starts the UserController
   *
   * @listens Esdi#start
   * @memberof UserController
   */
  start () {
    console.log('[#] Starting UserController...')
  }

  /**
   * Stops the GuildController
   *
   * @listens Esdi#stop
   * @memberof UserController
   */
  stop () {
    console.log('[#] Stopping UserController...')
    this.clear()
  }

  /**
   * Fetches an array of GuildMembers belonging to a Guild
   *
   * @param {external:Guild} guild discord.js Guild
   * @memberof UserController
   */
  fetchGuildMembers (guild) {
    guild.members.fetch()
      .then(members => members.map(member => {
        if (member.user.id === this.server.controllers.get('BotController').id) return
        if (!this.has(member.user.id)) {
          this.set(member.user.id, new User(this.server, member))
        } else {
          this.get(member.user.id).addGuild(guild)
        }
      }))
      .catch(console.error)
  }
}

// factory
module.exports = new UserController()
