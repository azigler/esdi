const Hapi = require('@hapi/hapi')
const exec = require('child_process').exec
const crypto = require('crypto')
const fs = require('fs')

/**
 * Redeploys the {@link Esdi} server when a GitHub repository has a new commit
 *
 * @type {Hook}
 * @memberof Hook
 * @name github-redeploy
 * @prop {Object} initConfig configuration object for Hook `init` function
 * @prop {Number} initConfig.port webhook port
 * @prop {String} initConfig.host webhood hostname
 * @prop {Object|Boolean} [initConfig.tls=false] false for HTTP, or object with paths to `key` and `cert` files for TLS
 * @prop {String} initConfig.repo GitHub repository URL
 * @prop {String|Boolean} [initConfig.secret=false] false for no secret (unrecommended), or string for GitHub webhook secret
 * @prop {String} initConfig.command command to invoke after rebuild (e.g., `pm2 restart esdi`)
 * @prop {String} initConfig.path project directory
 * @static
 */
module.exports = {
  name: 'github-redeploy',
  description: 'Redeploys the server when a GitHub repository has a new commit.',
  async init ({ port, host, tls = false, repo, secret = false, command, path } = {}) {
    console.log(`[H] Listening for GitHub webhooks on port: ${port}...`)
    const hook = Hapi.server({
      port: port,
      host: host,
      tls: tls ? { key: fs.readFileSync(tls.key), cert: fs.readFileSync(tls.cert) } : false
    })

    hook.route({
      method: 'POST',
      path: '/github-redeploy',
      handler: (request, h) => {
        function _exec () {
          exec(`cd ${path} git pull ${repo} && npm install && ${command}`)
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
    })

    await hook.start()
  }
}
