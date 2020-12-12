/**
 * Returns the latency (in milliseconds) between when the {@link Command} was sent and when the {@link Command} was executed
 *
 * @type {Command}
 * @memberof Command
 * @name ping
 * @prop {Object} executeConfig `execution` function configuration object
 * @prop {external:Message} executeConfig.message discord.js Message
 * @prop {String[]} executeConfig.args Array of space-separated strings following the command
 * @prop {Esdi} executeConfig.server Esdi server instance
 * @static
 */
module.exports = {
  name: 'ping',
  aliases: ['latency'],
  description: 'Returns the latency (in milliseconds) between when the user\'s command was sent and when the command was executed.',
  execute ({ message, args, server }) {
    message.channel.send(`**Latency:** \`${Date.now() - message.createdAt.getTime()}ms\``)
  }
}
