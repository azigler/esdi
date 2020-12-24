/**
 * Logs rate limiting from Discord to the console when it occurs
 *
 * @type {Event}
 * @listens external:Client#event:"Client#rateLimit"
 * @see external:Client
 * @memberof Event
 * @name rateLimit
 * @prop {Object} info discord.js rateLimitInfo object
 * @static
 */
module.exports = {
  name: 'rateLimit',
  async handler (info) {
    console.log('!!! RATE LIMITING IN EFFECT !!!\n', info)
  }
}
