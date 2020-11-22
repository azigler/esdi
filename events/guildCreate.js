/**
 * Emitted whenever the client joins a guild
 *
 * @see https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=guildCreate
 * @event external:Client#event:"Client#guildCreate"
 */

/**
 * Adds a {@link Guild}
 *
 * @type {Event}
 * @listens external:Client#event:"Client#guildCreate"
 * @see external:Client
 * @memberof Event
 * @name guildCreate
 * @static
 */
module.exports = {
  name: 'guildCreate',
  func (guild) {
    this.controllers.get('GuildController').addGuild(guild)
  }
}
