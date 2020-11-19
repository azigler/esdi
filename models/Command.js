/**
 * Command for Discord bot
 *
 * @class
 */
class Command {
  /**
   * Initializes a new Command
   *
   * @param {Object} config Command configuration object
   * @param {String} config.name Command name
   * @param {String} [config.description = ''] Command description
   * @param {String[]} [config.aliases = []] array of alias strings for Command
   * @param {String} [config.usage = ''] example syntax for using the Command
   * @param {Boolean} [config.args = false] whether this Command requires arguments
   * @param {Boolean} [config.guildOnly = true] whether this Command only works on servers (`false` allows command in DM)
   * @param {Boolean} [config.ownerOnly = false] whether this Command only works for the server owner (`false` allows anyone to use Command)
   * @param {Number} [config.cooldown = 5] cooldown time (in seconds) until this Command can be reused by the same User
   * @param {Function} config.execute function that executes when the Command is fired
   * @param {String} sourcePath full path of Command source file
   * @tutorial adding-a-custom-command
   * @constructor
   */
  constructor ({ name, description = '', aliases = [], usage = '', args = false, guildOnly = true, ownerOnly = false, cooldown = 5, execute }, sourcePath) {
    this.name = name
    this.description = description
    this.aliases = aliases
    this.usage = usage
    this.args = args
    this.guildOnly = guildOnly
    this.ownerOnly = ownerOnly
    this.cooldown = cooldown
    this.execute = execute
    this.sourcePath = sourcePath
  }
}

module.exports = Command
