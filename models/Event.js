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
   * @param {String} [config.discordEventName = ''] Name of discord.js event that triggers this Event
   * @param {Function} config.handler Event function
   * @param {String} [config.type = 'discord'] Event type
   * @param {String} [config.description = ''] Event description
   * @param {String} [config.context = 'global'] Event context
   * @param {String} [config.interval = '1d'] Event interval
   * @param {Function} [config.enable = () => {}] function that runs before enabling the Event for a discord.js Channel
   * @param {Function} [config.disable = () => {}] function that runs before disabling the Event for a discord.js Channel
   * @param {String} sourcePath full path of Event source file
   * @constructor
   */
  constructor ({ name, discordEventName = '', handler, type = 'discord', description = '', context = 'global', interval = '1d', enable = () => {}, disable = () => {} }, sourcePath) {
    this.name = name
    this.discordEventName = (discordEventName.length > 0 ? discordEventName : name)
    this.handler = handler
    this.type = type
    this.description = description
    this.context = context
    this.interval = interval
    this.enable = enable
    this.disable = disable
    this.sourcePath = sourcePath
  }
}

module.exports = Event
