const Command = require('./../models/Command')

/**
 * Reloads a {@link Command} from its source file
 *
 * @type {Command}
 * @memberof Command
 * @name reload
 * @prop {Object} executeConfig `execution` function configuration object
 * @prop {external:Message} executeConfig.message discord.js Message
 * @prop {String[]} executeConfig.args Array of space-separated strings following the command
 * @prop {Esdi} executeConfig.server Esdi server instance
 * @static
 */
module.exports = {
  name: 'reload',
  description: 'Reloads a Command from its source file.',
  args: true,
  ownerOnly: true,
  usage: '<Command name>',
  execute ({ message, args, server }) {
    const commandName = args.shift().toLowerCase()

    const command = server.controllers.get('CommandController').findCommand(commandName)
    if (!command) return message.channel.send(`There is no Command with a name or alias matching \`${commandName}\`, ${message.author}.`)

    const sourcePath = command.sourcePath
    delete require.cache[require.resolve(sourcePath)]

    try {
      const newCommand = new Command(require(sourcePath), command.sourcePath)
      server.commands.set(newCommand.name, newCommand)
      message.channel.send(`The \`${command.name}\` Command was successfully reloaded, ${message.author}.`)
    } catch (error) {
      console.error(error)
      message.channel.send(`There was an error while reloading the \`${command.name}\` Command, ${message.author}.`)
    }
  }
}
