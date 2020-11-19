module.exports = {
  name: 'guildMemberRemove',
  func (member) {
    this.controllers.get('UserController').get(member.user.id).removeGuild(member.guild)
  }
}
