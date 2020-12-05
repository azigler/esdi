/**
 * Hook (e.g., webhook)
 *
 * @class
 */
class Hook {
  /**
   * Initializes a new Hook
   *
   * @param {Object} config Hook configuration object
   * @param {String} config.name Hook name
   * @param {String} config.type Hook type
   * @param {String} [config.description = ''] Hook description
   * @param {Function} config.init function that initializes the Hook on the Esdi server
   * @param {Function} [config.enable = () => {}] function that enables the Hook for a discord.js Channel
   * @param {Function} [config.disable = () => {}] function that runs before disabling the Hook for a discord.js Channel
   * @param {String} sourcePath full path of Hook source file
   * @constructor
   */
  constructor ({ name, type = 'global', description = '', init, enable = () => {}, disable = () => {} }, sourcePath) {
    this.name = name
    this.type = type
    this.description = description
    this.init = init
    this.enable = enable
    this.disable = disable
    this.sourcePath = sourcePath
  }
}

module.exports = Hook
