module.exports = {
  name: 'clean',
  aliases: ['purge', 'delete'],
  guildOnly: false,
  ownerOnly: true,
  description: 'Deletes the most recent messages in the current channel. Defaults to deleting the 10 most recent messages.',
  usage: '[# of messages]',
  execute ({ message, args, server }) {
    let limit = parseInt(args[0])
    if (limit > 100) {
      limit = 100
    }
    if (!limit || isNaN(limit)) {
      limit = 10
    }
    message.channel.messages.fetch({ limit })
      .then(messages => {
        for (const msg of messages) {
          // can't delete the other person's messages in a DM
          if (msg[1].channel.type === 'dm' && (msg[1].author.id !== server.controllers.get('BotController').client.user.id)) {
            continue
          }
          msg[1].delete()
        }
      })
      .catch(console.error)
  }
}