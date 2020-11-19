module.exports = {
  name: 'guildDelete',
  func (guild) {
    this.controllers.get('GuildController').removeGuild(guild)
  }
}
