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
}

module.exports = Guild
