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
 * @prop {String} initConfig.repo GitHub repository URL
 * @prop {String|Boolean} [initConfig.secret = false] `false` for no secret (unrecommended), or string for GitHub webhook secret
 * @prop {String} initConfig.command command to invoke after rebuild (e.g., `pm2 restart esdi`)
 * @prop {String} initConfig.path project directory
 * @prop {Boolean} [initConfig.reset = false] invoke `git reset --hard` to force update
 * @static
 */
module.exports = {
  name: 'github-redeploy',
  description: 'Redeploys the Esdi instance after receiving a GitHub webhook.',
  init ({ repo, secret = false, command, path, reset = false } = {}) {
    return {
      method: 'POST',
      path: '/hook/github-redeploy',
      handler: (request, h) => {
        // helper function that executes the redeploy
        function _exec () {
          const proc = exec(`cd ${path} git fetch ${repo} && ${reset ? 'git reset --hard' : 'git pull'} && npm install && ${command}`)

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
