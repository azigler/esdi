/**
 * Discord Guild
 *
 * @class
 */
class Guild {
  /**
   * Initializes a new Guild
   *
   * @param {Guild} guild Discord Guild object
   * @constructor
   */
  constructor (guild) {
    this.name = guild.name
    this.id = guild.id

    this.discordGuild = guild
  }
}

module.exports = Guild
