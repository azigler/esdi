/**
 * Event (e.g., {@link external:Client|Client} event)
 *
 * @class
 * @see external:Client
 */
class Event {
  /**
   * Initializes a new Event
   *
   * @param {Object} config Event configuration object
   * @param {String} config.name Event name
   * @param {Function} config.func Event function
   * @param {String} [config.type = 'discord'] Event type
   * @param {String} sourcePath full path of Event source file
   * @constructor
   */
  constructor ({ name, func, type = 'discord' }, sourcePath) {
    this.name = name
    this.func = func
    this.type = type
    this.sourcePath = sourcePath
  }
}

module.exports = Event
