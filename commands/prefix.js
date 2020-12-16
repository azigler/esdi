/**
 * Shows or sets the custom {@link Command} prefix for this {@link Guild}
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
  usage: '[new prefix]',
  description: 'Shows or sets the custom Command prefix for this server.',
  async execute ({ message, args, server }) {
    let guild
    const msg = []

    server.controllers.get('GuildController').forEach(g => {
      if (g.id === message.guild.id) {
        guild = g
      }
    })

    const doc = await server.controllers.get('DatabaseController').fetchDoc({
      db: 'guild',
      id: guild.id
    })

    if (!args.length) {
      const guildPrefix = doc.prefix

      if (!guildPrefix) {
        msg.push(`My prefix is \`${server.controllers.get('CommandController').determinePrefix(message)}\``)
      } else {
        msg.push(`My prefix here is \`${doc.prefix}\``)
      }
    } else {
      const guildPrefix = args[0]

      if (guildPrefix === 'reset') {
        msg.push(`My prefix was reset back to \`${server.controllers.get('CommandController').determinePrefix(message)}\``)
        delete server.controllers.get('GuildController').get(message.guild.id).prefix
        // TODO: only announce below if 'esdi!' is not prefix above
        message.channel.send([msg.join(' '), '\nDon\'t forget: you can always use the `esdi!` prefix!'])
        return server.controllers.get('DatabaseController').updateDoc({
          db: 'guild',
          id: guild.id,
          payload: {
            prefix: undefined
          }
        })
      }

      server.controllers.get('GuildController').get(guild.id).prefix = guildPrefix
      msg.push(`My prefix here is now \`${guildPrefix}\``)

      server.controllers.get('DatabaseController').updateDoc({
        db: 'guild',
        id: guild.id,
        payload: {
          prefix: guildPrefix
        }
      })
    }

    message.channel.send([msg.join(' '), '\nDon\'t forget: you can always use the `esdi!` prefix!'])
  }
}
