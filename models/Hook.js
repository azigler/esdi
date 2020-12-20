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

  /**
  * Returns a context if this Hook is enabled for a provided context ID, or a hapi response object if not
  *
  * @param {Object} config configuration object
  * @param {Object} config.h hapi response toolkit
  * @param {Esdi} config.server Esdi server instance
  * @param {String} config.contextId discord.js Guild or Channel ID
  * @param {String} config.contextType context type
  * @returns {external:Guild|external:Channel|String|Object} hapi response object or Hook context
  * @memberof Hook
  */
  async checkEnabledForContext ({ h, server, contextId, contextType }) {
    const client = server.controllers.get('BotController').client

    let msg, c, contextName

    // fetch context
    if (contextType === 'guild') {
      c = await client.guilds.fetch(contextId)
      contextName = 'Guild'
    } else if (contextType === 'channel') {
      c = await client.channels.fetch(contextId)
      contextName = 'Channel'
    } else if (contextType === 'global') {
      // do nothing for now
    } else {
      msg = `Bot doesn't know about Context<${contextId}> for ${this.name} Hook`
      console.log(msg)
      return h.response(msg).code(400)
    }

    // check if Hook is enabled for context
    if (contextType !== 'global') {
      const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({
        db: 'hook',
        id: `${this.name}_${contextId}`
      })
      if (!contextDoc.enabled) {
        msg = `${this.name} Hook is not enabled for ${contextName}<${contextId}>`
        console.log(msg)
        return h.response(msg).code(400)
      }
    } else {
      const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({
        db: 'hook',
        id: `${this.name}_global`
      })
      if (!contextDoc.enabled) {
        msg = `${this.name} Hook is not enabled globally`
        console.log(msg)
        return h.response(msg).code(400)
      }
      c = 'global'
    }

    return c
  }
}

module.exports = Hook
