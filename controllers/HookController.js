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
      this.hookServer.route(hook.init(this.server))
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
}

// factory
module.exports = new HookController()
