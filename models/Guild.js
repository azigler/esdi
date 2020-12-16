/**
 * Wrapper class for {@link external:Guild|discord.js Guild}
 *
 * @class
 */
class Guild {
  /**
   * Initializes a new Guild
   *
   * @param {external:Guild} guild discord.js Guild
   * @constructor
   */
  constructor (guild) {
    this.name = guild.name
    this.id = guild.id

    /**
     * @external Guild
     * @see https://discord.js.org/#/docs/main/stable/class/Guild
     */
    this.discordGuild = guild
  }

  /**
   * Hydrates this Guild from a database document
   *
   * @param {Esdi} server Esdi server instance
   * @memberof Guild
   */
  async hydrate (server) {
    // fetch this Guild's database document
    const doc = await server.controllers.get('DatabaseController').fetchDoc({
      db: 'guild',
      id: this.id
    })

    // initialize the document if it does not exist
    if (doc.status === 404) {
      this.server.controllers.get('DatabaseController').updateDoc({
        db: 'guild',
        id: this.id,
        payload: {
          name: this.name
        }
      })
    }

    // hydrate this Guild
    if (doc.prefix) {
      this.prefix = doc.prefix
    }
  }
}

module.exports = Guild
