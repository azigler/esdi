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
   * @param {Function} config.handler Event function
   * @param {String} [config.type = 'discord'] Event type
   * @param {String} [config.description = ''] Event description
   * @param {Number} [config.interval = 60] Event interval (in seconds)
   * @param {Function} [config.enable = () => {}] function that enables the Event for a discord.js Channel
   * @param {Function} [config.disable = () => {}] function that runs before disabling the Event for a discord.js Channel
   * @param {String} sourcePath full path of Event source file
   * @constructor
   */
  constructor ({ name, handler, type = 'discord', description = '', interval = 60, enable = () => {}, disable = () => {} }, sourcePath) {
    this.name = name
    this.handler = handler
    this.type = type
    this.description = description
    this.interval = interval
    this.enable = enable
    this.disable = disable
    this.sourcePath = sourcePath
  }
}

module.exports = Event
