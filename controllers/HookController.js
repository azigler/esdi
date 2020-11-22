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
   * @param {Object} config.server Esdi server instance
   * @memberof HookController
   */
  init ({ server }) {
    this.server = server
  }

  /**
   * Starts the HookController
   *
   * @listens Esdi#start
   * @memberof HookController
   */
  start () {
    console.log('[#] Starting HookController...')
  }

  /**
   * Stops the HookController
   *
   * @listens Esdi#stop
   * @memberof HookController
   */
  stop () {
    console.log('[#] Stopping HookController...')
  }

  /**
   * Wrapper method that configures {@link Hook.github-redeploy}
   *
   * @param {Object} initConfig `initConfig` for {@link Hook.github-redeploy} `init` function
   * @see Hook.github-redeploy
   * @memberof HookController
   */
  configureGitHubRedeploy (initConfig) {
    this.server.hooks.get('github-redeploy').init(initConfig)
  }
}

// factory
module.exports = new HookController()
