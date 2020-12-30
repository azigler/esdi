/**
 * Deletes the most recent messages in the current channel (10 by default, 100 maximum, supports `all` argument)
 *
 * @type {Command}
 * @memberof Command
 * @name clean
 * @prop {Object} executeConfig `execution` function configuration object
 * @prop {external:Message} executeConfig.message discord.js Message
 * @prop {String[]} executeConfig.args Array of space-separated strings following the command
 * @prop {Esdi} executeConfig.server Esdi server instance
 * @static
 */
module.exports = {
  name: 'clean',
  aliases: ['purge', 'delete'],
  guildOnly: false,
  ownerOnly: true,
  description: 'Deletes the messages in the current channel. Defaults to deleting the 10 most recent messages. The `all` argument deletes all messages in a channel.',
  usage: '[# of messages]/[all]',
  execute ({ message, args, server }) {
    if (args[0] && args[0].toLowerCase() === 'all') {
      // helper function that retrieves messages to delete
      const checkMessages = () => {
        const limit = 100
        message.channel.messages.fetch({ limit })
          .then(messages => {
            if (messages.array().length > 0) {
              let i = 0
              for (const msg of messages) {
                // can't delete the other person's messages in a DM
                if (msg[1].channel.type === 'dm' && (msg[1].author.id !== server.controllers.get('DiscordController').client.user.id)) {
                  continue
                }

                msg[1].delete({ timeout: 1200 * (i + 1) })

                i++
              }

              setTimeout(() => {
                checkMessages()
              }, 1200 * (limit + 1))
            }
          })
          .catch(console.error)
      }

      checkMessages()
    } else {
      let limit = parseInt(args[0])
      if (limit > 100) {
        limit = 100
      }
      if (!limit || isNaN(limit)) {
        limit = 10
      }

      message.channel.messages.fetch({ limit })
        .then(messages => {
          let i = 0
          for (const msg of messages) {
            // can't delete the other person's messages in a DM
            if (msg[1].channel.type === 'dm' && (msg[1].author.id !== server.controllers.get('DiscordController').client.user.id)) {
              continue
            }

            setTimeout(() => { msg[1].delete() }, 1200 * i)
            i++
          }
        })
        .catch(console.error)
    }
  }
}
