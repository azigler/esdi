/**
 * Emitted when the client becomes ready to start working
 *
 * @see https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=ready
 * @event external:Client#event:"Client#ready"
 */

/**
 * Sets the `id` for {@link DiscordController} and initializes the {@link Guild|Guilds} to which the bot is currently connected
 *
 * @type {Event}
 * @listens external:Client#event:"Client#ready"
 * @see external:Client
 * @memberof Event
 * @name ready
 * @static
 */
module.exports = {
  name: 'ready',
  handler () {
    this.controllers.get('DiscordController').id = this.controllers.get('DiscordController').client.user.id
    this.controllers.get('GuildController').fetchInitialGuilds(this.controllers.get('DiscordController').client)
  }
}
