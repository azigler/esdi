const User = require('./../models/User')

/**
 * Emitted whenever a user joins a guild
 *
 * @see https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=guildMemberAdd
 * @event external:Client#event:"Client#guildMemberAdd"
 */

/**
 * Adds a {@link User} to a {@link Guild}
 *
 * @type {Event}
 * @listens external:Client#event:"Client#guildMemberAdd"
 * @see external:Client
 * @memberof Event
 * @name guildMemberAdd
 * @prop {external:GuildMember} member discord.js GuildMember
 * @static
 */
module.exports = {
  name: 'guildMemberAdd',
  func (member) {
    if (!this.controllers.get('UserController').get(member.id)) {
      this.controllers.get('UserController').set(member.user.id, new User(this, member))
    } else {
      this.controllers.get('UserController').get(member.user.id).addGuild(member.guild)
    }
  }
}
