const User = require('./../models/User')

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
