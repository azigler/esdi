/**
 * Returns the latency (in milliseconds) between when the {@link Command} was sent and when the {@link Command} was executed
 *
 * @type {Command}
 * @memberof Command
 * @name ping
 * @static
 */
module.exports = {
  name: 'ping',
  aliases: ['latency'],
  description: 'Returns the latency (in milliseconds) between when the user\'s command was sent and when the command was executed.',
  execute ({ message, server }) {
    message.channel.send(`**Latency:** \`${new Date().getTime() - message.createdAt.getTime()}ms\``)
  }
}
