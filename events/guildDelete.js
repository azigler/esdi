/**
 * Emitted whenever a guild kicks the client or the guild is deleted/left
 *
 * @see https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=guildDelete
 * @event external:Client#event:"Client#guildDelete"
 */

/**
 * Removes a {@link Guild}
 *
 * @type {Event}
 * @listens external:Client#event:"Client#guildDelete"
 * @see external:Client
 * @memberof Event
 * @name guildDelete
 * @prop {external:Guild} guild discord.js Guild
 * @static
 */
module.exports = {
  name: 'guildDelete',
  func (guild) {
    this.controllers.get('GuildController').removeGuild(guild)
  }
}
