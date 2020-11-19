module.exports = {
  name: 'guildCreate',
  func (guild) {
    this.controllers.get('GuildController').addGuild(guild)
  }
}
