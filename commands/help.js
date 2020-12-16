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
  description: 'Lists all Commands or gets help for a specific Command.',
  aliases: ['commands'],
  usage: '[<Command name>]',
  execute ({ message, args, server }) {
    const prefix = server.controllers.get('CommandController').determinePrefix(message)
    const data = []

    // if no arguments provided, list all commands
    if (!args.length) {
      data.push('__**COMMANDS**__')
      data.push(server.commands.map(command => `\`${command.name}\``).join(', '))
      data.push(`\nUse \`${prefix}help [command]\` to get help on a specific command.`)

      return message.channel.send(data, { split: true })
    }

    const commandName = args.shift().toLowerCase()

    const command = server.controllers.get('CommandController').findCommand(commandName)
    if (!command) return message.channel.send(`There is no command with a name or alias matching \`${commandName}\`, ${message.author}.`)

    // compile help for command
    data.push(`**Name:** \`${command.name}\``)
    if (command.aliases.length) data.push(`**Alias${command.aliases.length > 1 ? 'es' : ''}:** \`${command.aliases.join('`, `')}\``)
    if (command.usage) data.push(`**Usage:** \`${prefix}${command.name} ${command.usage}\``)
    data.push(`**Cooldown:** \`${command.cooldown} seconds\``)
    if (command.description.length) data.push(`**Description:** \`\`\`${command.description}\`\`\``)

    message.channel.send(data, { split: true })
  }
}
