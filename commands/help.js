/**
 * Lists all {@link Command|Commands} or gets help for a specific Command
 *
 * @type {Command}
 * @memberof Command
 * @name help
 * @prop {Object} executeConfig `execution` function configuration object
 * @prop {external:Message} executeConfig.message discord.js Message
 * @prop {String[]} executeConfig.args Array of space-separated strings following the command
 * @prop {Esdi} executeConfig.server Esdi server instance
 * @static
 */
module.exports = {
  name: 'help',
  cooldown: 2,
  description: 'Lists all Commands or gets help for a specific Command.',
  aliases: ['commands'],
  usage: '[<Command name>]',
  execute ({ message, args, server }) {
    const prefix = server.controllers.get('CommandController').determinePrefix(message)

    // if no arguments provided, list all commands
    if (!args.length) {
      // prepare fields for message embed
      const embedFieldValues = []

      // split resulting field contents into chunks for embed
      server.commands.forEach(command => {
        server.controllers.get('BotController').buildEmbedFieldValues(embedFieldValues, `\n\`${command.name}\` - ${command.description}`)
      })

      const embedFields = server.controllers.get('BotController').buildEmbedFields('Commands', embedFieldValues)

      // build message embed
      const embed = server.controllers.get('BotController').buildEmbed({
        title: `Use \`${prefix}help [command]\` to get help on a Command.`,
        footerTextType: 'Command',
        fields: embedFields
      })

      return message.channel.send(embed)
    }

    const commandName = args.shift().toLowerCase()

    const command = server.controllers.get('CommandController').findCommand(commandName)
    if (!command) return message.channel.send(`There is no command with a name or alias matching \`${commandName}\`, ${message.author}.`)

    // prepare fields for message embed
    const embedFields = [
      {
        name: '**Cooldown:**',
        value: `\`${command.cooldown} seconds\``,
        inline: true
      }
    ]
    if (command.aliases.length) {
      embedFields.push({
        name: `**Alias${command.aliases.length > 1 ? 'es' : ''}:**`,
        value: '`' + command.aliases.join('`, `') + '`',
        inline: true
      })
    }
    if (command.usage.length) {
      embedFields.unshift({
        name: '**Syntax**',
        value: `\`${prefix}${command.name} ${command.usage}\``,
        inline: true
      })
    }

    // build message embed
    const embed = server.controllers.get('BotController').buildEmbed({
      title: `\`${command.name}\``,
      description: command.description,
      footerTextType: 'Command',
      fields: embedFields
    })

    // send embed
    message.channel.send(embed)
  }
}
