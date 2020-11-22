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
   * @param {Function} config.init function to configure the Hook
   * @param {String} sourcePath full path of Hook source file
   * @constructor
   */
  constructor ({ name, description = '', init }, sourcePath) {
    this.name = name
    this.description = description
    this.init = init
    this.sourcePath = sourcePath
  }
}

module.exports = Hook
