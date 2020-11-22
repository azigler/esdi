const exec = require('child_process').exec
const crypto = require('crypto')

/**
 * Redeploys the {@link Esdi} instance after receiving a {@link https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/about-webhooks|GitHub webhook}
 *
 * @type {Hook}
 * @memberof Hook
 * @name github-redeploy
 * @prop {Object} config Hook configuration object
 * @prop {String} config.repo GitHub repository URL
 * @prop {String|Boolean} [config.secret = false] `false` for no secret (unrecommended), or string for GitHub webhook secret
 * @prop {String} config.command command to invoke after rebuild (e.g., `pm2 restart esdi`)
 * @prop {String} config.path project directory
 * @prop {Boolean} [config.reset = false] invoke `git reset --hard` to force update
 * @static
 */
module.exports = {
  name: 'github-redeploy',
  description: 'Redeploys the Esdi instance after receiving a GitHub webhook.',
  hook ({ repo, secret = false, command, path, reset = false } = {}) {
    return {
      method: 'POST',
      path: '/github-redeploy',
      handler: (request, h) => {
        function _exec () {
          exec(`cd ${path} git fetch ${repo} && ${reset ? 'git reset --hard && ' : ''}npm install && ${command}`)
            .stdout.on('data', function (data) {
              console.log(data)
            })
          return `Redeployed from repository @ ${new Date()}`
        }
        if (secret) {
          if (!request.headers['x-hub-signature']) {
            return h.response('Unauthorized').code(401)
          }
          const sig = `sha1=${crypto.createHmac('sha1', secret).update(JSON.stringify(request.payload)).digest('hex')}`
          if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(request.headers['x-hub-signature']))) {
            return _exec()
          } else {
            return h.response('Unauthorized').code(401)
          }
        } else {
          return _exec()
        }
      }
    }
  }
}
