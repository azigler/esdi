module.exports = {
  name: 'ready',
  func () {
    this.controllers.get('BotController').id = this.controllers.get('BotController').client.user.id
    this.controllers.get('GuildController').fetchInitialGuilds(this.controllers.get('BotController').client)
  }
}
