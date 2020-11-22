/**
 * Lists all {@link Command|Commands} or gets help for a specific {@link Command}
 *
 * @type {Command}
 * @memberof Command
 * @name help
 * @static
 */
module.exports = {
  name: 'help',
  description: 'Lists all bot commands or gets help for a specific command.',
  aliases: ['commands'],
  usage: '[command]',
  execute ({ message, args, server }) {
    const prefix = server.controllers.get('BotController').prefix
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
