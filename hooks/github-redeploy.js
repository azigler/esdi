require('dotenv').config()
const exec = require('child_process').exec
const crypto = require('crypto')

/**
 * Redeploys the {@link Esdi} instance after receiving a {@link https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/about-webhooks|GitHub webhook}
 *
 * `POST: /hook/github-redeploy`
 *
 * @type {Hook}
 * @memberof Hook
 * @name github-redeploy
 * @prop {Object} initConfig `init` function configuration object
 * @prop {Esdi} initConfig.server Esdi server instance
 * @tutorial github-redeploy-global-hook-example
 * @static
 */
module.exports = {
  name: 'github-redeploy',
  description: 'Redeploys the Esdi instance after receiving a GitHub webhook.',
  init (server) {
    return {
      method: 'POST',
      path: '/hook/github-redeploy',
      handler: async (request, h) => {
        // check if Hook is enabled globally
        const checkGlobal = await this.checkEnabledForContext({
          h,
          server,
          contextType: 'global'
        })
        if (checkGlobal !== 'global') {
          return checkGlobal
        }

        const path = process.env.GITHUB_PATH
        const repo = process.env.GITHUB_REPO
        const command = process.env.GITHUB_COMMAND
        const reset = (process.env.GITHUB_RESET === 'true')
        const link = (process.env.GITHUB_LINK === 'true')
        const secret = process.env.GITHUB_SECRET

        // helper function that executes the redeploy
        function _exec () {
          const proc = exec(`cd ${path} && git fetch ${repo} && ${reset ? 'git reset --hard' : 'git pull'} && npm install${link ? ' && npm link esdi' : ''} && ${command}`)

          proc.stdout.on('data', function (data) {
            console.log(data)
          })

          proc.stderr.on('data', function (error) {
            console.log(error)
          })

          return `Redeployed from repository @ ${new Date().toLocaleString()} PT`
        }

        // helper function that rejects unauthorized requests
        function _unauthorized () {
          return h.response('Unauthorized').code(401)
        }

        if (secret) {
          if (!request.headers['x-hub-signature']) {
            return _unauthorized()
          }
          const sig = `sha1=${crypto.createHmac('sha1', secret).update(JSON.stringify(request.payload)).digest('hex')}`
          if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(request.headers['x-hub-signature']))) {
            return _exec()
          } else {
            return _unauthorized()
          }
        } else {
          return _exec()
        }
      }
    }
  }
}
