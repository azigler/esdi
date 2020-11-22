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
   * @param {Function} config.hook function that configures the Hook
   * @param {String} sourcePath full path of Hook source file
   * @constructor
   */
  constructor ({ name, type = 'global', description = '', hook }, sourcePath) {
    this.name = name
    this.type = type
    this.description = description
    this.hook = hook
    this.sourcePath = sourcePath
  }
}

module.exports = Hook
