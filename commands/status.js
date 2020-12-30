/**
 * Reports the memory and processor usage of the server's process along with its uptime and Discord stats
 *
 * @type {Command}
 * @memberof Command
 * @name status
 * @prop {Object} executeConfig `execution` function configuration object
 * @prop {external:Message} executeConfig.message discord.js Message
 * @prop {String[]} executeConfig.args Array of space-separated strings following the command
 * @prop {Esdi} executeConfig.server Esdi server instance
 * @static
 */
module.exports = {
  name: 'status',
  aliases: ['stat', 'stats', 'statistics', 'metrics', 'metric', 'process', 'processes'],
  ownerOnly: true,
  description: 'Reports the memory and processor usage of the server\'s process along with its uptime and Discord stats.',
  execute ({ message, args, server }) {
    message.channel.send(
      server.controllers.get('DiscordController').buildStatusEmbed({ footerTextType: 'Command' })
    )
  }
}
