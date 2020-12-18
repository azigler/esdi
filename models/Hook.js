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
   * @param {String} [config.description = ''] Hook description
   * @param {String} [config.context = 'global'] Hook context
   * @param {Function} config.init function that initializes the Hook on the Esdi server
   * @param {Function} [config.enable = () => {}] function that runs before enabling the Hook for a context
   * @param {Function} [config.disable = () => {}] function that runs before disabling the Hook for a context
   * @param {String} sourcePath full path of Hook source file
   * @constructor
   */
  constructor ({ name, description = '', context = 'global', init, enable = () => {}, disable = () => {} }, sourcePath) {
    this.name = name
    this.description = description
    this.context = context
    this.init = init
    this.enable = enable
    this.disable = disable
    this.sourcePath = sourcePath
  }
}

module.exports = Hook
