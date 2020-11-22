/**
 * Emitted whenever a member leaves a guild, or is kicked
 *
 * @see https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=guildMemberRemove
 * @event external:Client#event:"Client#guildMemberRemove"
 */

/**
 * Removes a {@link User} from a {@link Guild}
 *
 * @type {Event}
 * @listens external:Client#event:"Client#guildMemberRemove"
 * @see external:Client
 * @memberof Event
 * @name guildMemberRemove
 * @static
 */
module.exports = {
  name: 'guildMemberRemove',
  func (member) {
    this.controllers.get('UserController').get(member.user.id).removeGuild(member.guild)
  }
}
