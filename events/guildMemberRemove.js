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
 * @prop {external:GuildMember} member discord.js GuildMember
 * @static
 */
module.exports = {
  name: 'guildMemberRemove',
  func (member) {
    const m = this.controllers.get('UserController').get(member.user.id)

    // return if User was already deleted
    if (!m || !m.removeGuild) {
      return
    }

    m.removeGuild(member.guild)
  }
}
