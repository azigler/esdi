const Hapi = require('@hapi/hapi')
const fs = require('fs')

/**
 * Controller for {@link Hook|Hooks} (e.g., webhooks)
 *
 * @class
 */
class HookController {
  /**
   * Initializes a new HookController
   *
   * @param {Object} config configuration object
   * @param {Esdi} config.server Esdi server instance
   * @param {Number} [config.hookServerPort = 8587] port for {@link Hook} server
   * @param {String} [config.hookServerHost = 'localhost'] hostname for {@link Hook} server
   * @param {Object|Boolean} [config.hookServerTls = false] `false` for HTTP, or object with paths to `key` and `cert` files for TLS
   * @memberof HookController
   */
  init ({ server, hookServerPort = 8587, hookServerHost = 'localhost', hookServerTls = false }) {
    this.server = server
    this.hookServerPort = hookServerPort
    this.hookServerHost = hookServerHost
    this.hookServerTls = hookServerTls

    this.hookServer = Hapi.server({
      port: hookServerPort,
      host: hookServerHost,
      tls: hookServerTls ? { key: fs.readFileSync(hookServerTls.key), cert: fs.readFileSync(hookServerTls.cert) } : false
    })
  }

  /**
   * Starts the HookController
   *
   * @listens Esdi#start
   * @memberof HookController
   */
  start () {
    console.log('[#] Starting HookController...')
    this.hookServer.start()
    this.server.hooks.forEach(hook => {
      if (hook.type === 'global') return
      this.hookServer.route(hook.init({ server: this.server }))
    })
  }

  /**
   * Stops the HookController
   *
   * @listens Esdi#stop
   * @memberof HookController
   */
  stop () {
    console.log('[#] Stopping HookController...')
    this.hookServer.stop()
  }

  /**
   * Wrapper method that configures {@link Hook.github-redeploy|github-redeploy}
   *
   * @param {Object} config `initConfig` for {@link Hook.github-redeploy|github-redeploy}
   * @see Hook.github-redeploy
   * @memberof HookController
   */
  configureGitHubRedeploy (config) {
    this.hookServer.route(this.server.hooks.get('github-redeploy').init(config))
    console.log(`[H] github-redeploy Hook configured -> (POST) http${this.hookServerTls ? 's' : ''}://${this.hookServerHost}:${this.hookServerPort}/hook/github-redeploy`)
  }

  /**
  * Returns an array of Hook properties if the Hook is enabled for the provided channel
  *
  * @param {Object} config configuration object
  * @param {Object} config.h hapi response toolkit
  * @param {Esdi} config.server Esdi server instance
  * @param {String} config.channelId discord.js Channel ID
  * @param {String} config.hookName {@link Hook} name
  * @returns {Object|Array} hapi response object or array of Hook properties
  * @memberof HookController
  */
  async checkHookEnabledForChannel ({ h, server, channelId, hookName }) {
    const client = server.controllers.get('BotController').client

    let msg,
      channel,
      hookData,
      channelWebhookId

    // check if bot can see channel
    try {
      channel = await client.channels.fetch(channelId)
    } catch (e) {
      msg = `Bot doesn't know about Channel<${channelId}> for ${hookName} Hook`
      console.log(msg, e)
      return h.response(msg).code(400)
    }

    // check if Hook is enabled for channel
    try {
      // fetch Hook data from database
      hookData = await server.controllers.get('DatabaseController').fetchDoc({ db: 'hook', id: hookName })

      // helper function that handles if Hook is not enabled for channel
      const rejectNotEnabled = (msg) => {
        msg = `${hookName} Hook is not enabled for Channel<${channelId}>`
        console.log(msg)
        return h.response(msg).code(400)
      }

      // check each registered webhook in the database to see if enabled for this channel
      if (hookData.channelHookPairs) {
        const channels = hookData.channelHookPairs.map(h => h[0])

        // if Hook is not enabled for this channel, reject request
        if (!channels.find(c => c === channel.id)) {
          // user helper function above
          return rejectNotEnabled()
          // otherwise, save webhook ID for use
        } else {
          [, channelWebhookId] = hookData.channelHookPairs.find(h => h[0] === channelId)
        }
        // otherwise, reject request
      } else {
        // use helper function above
        return rejectNotEnabled()
      }
    } catch (e) {
      msg = `An error occurred while fetching database document for ${hookName} Hook`
      console.log(msg, e)
      return h.response(msg).code(400)
    }

    return [msg,
      channel,
      hookData,
      channelWebhookId]
  }

  /**
  * Fetches a corresponding webhook for a channel's Hook
  *
  * @param {Object} config configuration object
  * @param {Object} config.h hapi response toolkit
  * @param {Object} config.request hapi request object
  * @param {Esdi} config.server Esdi server instance
  * @param {external:Channel} config.channel discord.js Channel
  * @param {String} config.channelWebhookId discord.js Webhook ID
  * @param {Object} config.hookData {@link Hook} database document
  * @param {Function} config.enable function that enables the Hook for a discord.js Channel
  * @returns {Object|Array} hapi response object or array containing corresponding discord.js Webhook
  * @memberof HookController
  */
  async fetchWebhookForChannelHook ({ h, request, server, channel, channelWebhookId, hookData, enable }) {
    let msg,
      channelHook

    // fetch channel webhooks
    try {
      channelHook = await channel.fetchWebhooks()
      channelHook = channelHook.find(hook => hook.id === channelWebhookId)
    } catch (e) {
      msg = `An error occurred while evaluating ${hookData._id} Hook and fetching webhooks for Channel<${request.params.channel}>`
      console.log(msg, e)
      return h.response(msg).code(400)
    }

    // if channel webhook is missing, initialize and use it
    if (!channelHook) {
      try {
        channelHook = await enable({ server, channel })

        // check if enabling returned a webhook before proceeding
        if (channelHook.constructor.name !== 'Webhook') {
          msg = `The result of enabling ${hookData._id} Hook for for Channel<${request.params.channel}> was not a valid webhook`
          console.log(msg)
          return h.response(msg).code(200)
        }

        // make sure this channel is filtered out of the pair array
        const pairs = hookData.channelHookPairs.filter(p => p[0] !== channel.id)

        // update database with new webhook ID
        server.controllers.get('DatabaseController').updateDoc({
          db: 'hook',
          id: hookData._id,
          payload: {
            ...hookData.payload,
            channelHookPairs: [...pairs, [request.params.channel, channelHook.id]]
          }
        })
      } catch (e) {
        msg = `An error occurred while fetching webhooks for Channel<${request.params.channel}>`
        console.log(msg, e)
        return h.response(msg).code(400)
      }
    }

    return [channelHook]
  }
}

// factory
module.exports = new HookController()
