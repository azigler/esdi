/**
 * Controller for hooks (e.g., webhooks)
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
   * Sets up a Hook to redeploy the instance when a GitHub repository has a new commit
   *
   * @param {Object} config properties for the `github-redeploy` Hook
   * @memberof EventController
   */
  configureGitHubHook (config) {
    this.server.hooks.get('github-redeploy').init(config)
  }
}

// factory
module.exports = new HookController()
