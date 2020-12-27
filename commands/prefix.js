/**
 * Shows, sets, or resets the custom {@link Command} prefix for this {@link Guild}
 *
 * @type {Command}
 * @memberof Command
 * @name prefix
 * @prop {Object} executeConfig `execution` function configuration object
 * @prop {external:Message} executeConfig.message discord.js Message
 * @prop {String[]} executeConfig.args Array of space-separated strings following the command
 * @prop {Esdi} executeConfig.server Esdi server instance
 * @static
 */
module.exports = {
  name: 'prefix',
  ownerOnly: true,
  usage: '[new prefix]/[reset]',
  description: 'Shows, sets, or resets the custom Command prefix for this server.',
  async execute ({ message, args, server }) {
    // check this Guild's database document for a prefix
    const { prefix } = await server.controllers.get('DatabaseController').fetchDoc({
      db: 'guild',
      id: message.guild.id
    })

    const ESDI_PREFIX_REMINDER = 'Don\'t forget: you can always use the `esdi!` prefix!'

    // if no arguments provided, announce the current prefix
    if (!args.length) {
      if (!prefix) {
        return message.channel.send(`\`${server.controllers.get('CommandController').determinePrefix(message)}\` is my command prefix.`)
      } else {
        return message.channel.send(`\`${prefix}\` is my command prefix for this server. ${ESDI_PREFIX_REMINDER}`)
      }
    // otherwise, handle setting or resetting the Guild's prefix
    } else {
      // if argument is 'reset' or 'esdi!', reset the Guild's prefix
      if (args[0] === 'reset' || args[0] === 'esdi!') {
        delete server.controllers.get('GuildController').get(message.guild.id).prefix

        // determine reset prefix (either the instance prefix or the primary prefix)
        const prefixObj = {
          content: server.controllers.get('CommandController').prefix
        }
        const pre = server.controllers.get('CommandController').determinePrefix(prefixObj)

        message.channel.send(`My command prefix was reset back to \`${pre}\` for this server.`)

        return server.controllers.get('DatabaseController').updateDoc({
          db: 'guild',
          id: message.guild.id,
          payload: {
            prefix: undefined
          }
        })
      }

      // determine the new prefix to set
      const guildPrefix = args[0]

      // set the new prefix
      server.controllers.get('GuildController').get(message.guild.id).prefix = guildPrefix
      message.channel.send(`\`${guildPrefix}\` is now my command prefix for this server. ${ESDI_PREFIX_REMINDER}`)

      server.controllers.get('DatabaseController').updateDoc({
        db: 'guild',
        id: message.guild.id,
        payload: {
          prefix: guildPrefix
        }
      })
    }
  }
}
