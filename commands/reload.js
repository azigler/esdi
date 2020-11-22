const Command = require('./../models/Command')

/**
 * Reloads a {@link Command} from its source file
 *
 * @type {Command}
 * @memberof Command
 * @name reload
 * @static
 */
module.exports = {
  name: 'reload',
  description: 'Reloads a command from its source file. Useful for rapid development without restarting the server.',
  args: true,
  ownerOnly: true,
  usage: '<command>',
  execute ({ message, args, server }) {
    const commandName = args.shift().toLowerCase()

    const command = server.controllers.get('CommandController').findCommand(commandName)
    if (!command) return message.channel.send(`There is no command with a name or alias matching \`${commandName}\`, ${message.author}.`)

    const sourcePath = command.sourcePath
    delete require.cache[require.resolve(sourcePath)]

    try {
      const newCommand = new Command(require(sourcePath), command.sourcePath)
      server.commands.set(newCommand.name, newCommand)
      message.channel.send(`Command \`${command.name}\` was successfully reloaded, ${message.author}.`)
    } catch (error) {
      console.error(error)
      message.channel.send(`There was an error while reloading the \`${command.name}\` command, ${message.author}.`)
    }
  }
}
