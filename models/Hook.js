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
   * @param {Object} config.props object of keys for `config` for Hook `init` function
   * @param {Function} config.init function to configure the Hook
   * @param {String} sourcePath full path of Hook source file
   * @constructor
   */
  constructor ({ name, description = '', props, init }, sourcePath) {
    this.name = name
    this.description = description
    this.props = props
    this.init = init
    this.sourcePath = sourcePath
  }
}

module.exports = Hook
