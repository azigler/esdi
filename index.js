require('dotenv').config()
const path = require('path')
const fs = require('fs')
const discordJs = require('discord.js')
const ZigUtils = require('./lib/utils')

/**
 * ES6 Discord bot framework
 *
 * @class
 * @extends EventEmitter
 */
class Esdi extends require('events') {
  /**
   * Initializes a new Esdi server
   *
   * @param {Object} [config] configuration object
   * @param {Number} [config.loopInterval = 15] loop interval (in seconds)
   * @param {Boolean} [config.loadDefaultFiles = true] whether to load default files
   * @param {String} [config.dbAddress = 'local'] address of remote database, or `local` for local database
   * @param {String} [config.dbPort = 5984] port of remote database
   * @param {String} [config.dbNamespace = 'esdi_'] namespace prefix for database names
   * @param {String} [config.discordToken = process.env.DISCORD_TOKEN] token for Discord bot
   * @param {String} [config.botPrefix = 'esdi!'] prefix for {@link Command|Commands}
   * @param {Number} [config.hookServerPort = 8587] port for {@link Hook} server
   * @param {String} [config.hookServerHost = 'localhost'] hostname for {@link Hook} server
   * @param {Object|Boolean} [config.hookServerTls = false] `false` for HTTP, or object with paths to `key` and `cert` files for TLS
   * @param {String} [config.botOwner = '139293101767262208'] Discord ID of bot instance owner
   * @tutorial setting-up-an-esdi-instance
   * @constructor
   */
  constructor ({ loopInterval = 15, loadDefaultFiles = true, dbAddress = 'local', dbPort = 5984, dbNamespace = 'esdi_', discordToken = process.env.DISCORD_TOKEN, botPrefix = 'esdi!', hookServerPort = 8587, hookServerHost = 'localhost', hookServerTls = false, botOwner = '139293101767262208' } = {}) {
    super()

    /**
     * Starts the Esdi server
     *
     * @event Esdi#start
     * @memberof Esdi
     */
    this.on('start', () => {
      this.startTime = new Date()
      console.log(`[%] Starting Esdi @ ${this.startTime.toLocaleString()} PT`)
      this.serverLoop = setInterval(this.loop.bind(this), loopInterval * 1000)

      this.controllers.forEach(controller => {
        if (!controller.init) return
        controller.init({ server: this, loopInterval, loadDefaultFiles, dbAddress, dbPort, dbNamespace, discordToken, botPrefix, hookServerPort, hookServerHost, hookServerTls, botOwner })
      })
    })

    /**
     * Stops the Esdi server
     *
     * @event Esdi#stop
     * @memberof Esdi
     */
    this.on('stop', () => {
      this.stopTime = new Date()
      console.log(`[%] Stopping Esdi @ ${this.stopTime.toLocaleString()} PT`)
      clearTimeout(this.serverLoop)
      this.serverLoop = false
    })

    // initialize framework
    this.utils = ZigUtils
    this.controllers = new Map()
    this.commands = new discordJs.Collection()
    this.models = new Map()
    this.events = new Set()
    this.hooks = new Map()

    // if enabled, load default files
    if (!loadDefaultFiles) return
    this.load()
  }

  /**
   * Loads framework files into the Esdi server
   *
   * @param {String} [dir = __dirname] directory from which to load files
   * @param {String} [type = null] framework file type to load, or `null` for all types
   * @memberof Esdi
   */
  load (dir = __dirname, type = null) {
    // if no type provided, load all types
    if (type === null) {
      this._loadType('models', dir)
      this._loadType('controllers', dir)
      this._loadType('commands', dir)
      this._loadType('events', dir)
      this._loadType('hooks', dir)
    // otherwise, load specified type
    } else {
      this._loadType(type, dir)
    }
  }

  /**
   * Called every Esdi server loop
   *
   * @event Esdi#loop
   * @memberof Esdi
   */
  loop () {
    this.emit('loop')
  }

  /**
   * Wrapper method that starts the Esdi server
   *
   * @fires Esdi#start
   * @memberof Esdi
   */
  start () {
    this.emit('start')
  }

  /**
   * Wrapper method that stops the Esdi server
   *
   * @fires Esdi#stop
   * @memberof Esdi
   */
  stop () {
    this.emit('stop')
  }

  /**
   * Returns formatted uptime of process
   *
   * @returns {String} formatted timestamp
   * @memberof Esdi
   */
  determineUptime () {
    const formatUptime = (sec) => {
      const pad = (s) => {
        return (s < 10 ? '0' : '') + s
      }

      const days = Math.floor(sec / (60 * 60 * 24))
      const hours = Math.floor(sec / (60 * 60))
      const minutes = Math.floor(sec % (60 * 60) / 60)
      const seconds = Math.floor(sec % 60)

      return `${days ? days + 'd ' : ''}${pad(hours % ((days || 1) * 24))}:${pad(minutes)}:${pad(seconds)}s`
    }

    return formatUptime(process.uptime())
  }

  /**
   * Returns formatted memory usage of process
   *
   * @returns {String} formatted memory usage (in megabytes)
   * @memberof Esdi
   */
  determineMemory () {
    const formatMemory = (data) => `${(data / 1024 / 1024).toFixed(2)} MB`

    const memoryData = process.memoryUsage()
    return formatMemory(memoryData.rss)
  }

  /**
   * Returns formatted processor usage of process
   *
   * @returns {String} formatted processor use percentage
   * @memberof Esdi
   */
  determineProcessor () {
    const determineProcessor = () => {
      const usage = Object.assign({}, process.cpuUsage())
      usage.time = process.uptime() * 1000 // seconds to milliseconds
      usage.percent = (usage.system + usage.user) / (usage.time * 10) // microseconds to milliseconds
      return usage
    }

    return determineProcessor().percent.toFixed(2) + '%'
  }

  /**
   * Helper method that loads framework files into the Esdi server
   *
   * @param {String} type framework file type to load
   * @param {String} dir directory to load files from
   * @memberof Esdi
   * @private
   */
  _loadType (type, dir) {
    if (fs.existsSync(path.resolve(dir, type))) {
      const files = fs.readdirSync(
        path.resolve(dir, type), (e) => {
          if (e) throw e
        }
      )

      if (files.length > 0) {
        for (const file of files) {
          if (file.endsWith('.js')) {
            const filename = file.split('.')[0]

            if (type === 'commands') {
              const Command = this.models.get('Command')
              console.log(`[+] Loaded ${filename} <command> from ${path.resolve(dir, 'commands')}`)
              const sourcePath = path.resolve(dir, 'commands', file)

              this.commands.set(filename, new Command(require(sourcePath), sourcePath))
              continue
            }

            if (type === 'events') {
              const Event = this.models.get('Event')
              console.log(`[+] Loaded ${filename} <event> from ${path.resolve(dir, 'events')}`)
              const sourcePath = path.resolve(dir, 'events', file)

              this.events.add(new Event(require(sourcePath), sourcePath))
              continue
            }

            if (type === 'hooks') {
              const Hook = this.models.get('Hook')
              console.log(`[+] Loaded ${filename} <hook> from ${path.resolve(dir, 'hooks')}`)
              const sourcePath = path.resolve(dir, 'hooks', file)

              this.hooks.set(filename, new Hook(require(sourcePath), sourcePath))
              continue
            }

            this[type].set(filename, require(
              path.resolve(dir, type, file)
            ))

            if (type === 'controllers') {
              if (this.controllers.get(filename).init) {
                this.on('start', this.controllers.get(filename).start.bind(this.controllers.get(filename)))
                this.on('stop', this.controllers.get(filename).stop.bind(this.controllers.get(filename)))
              }

              if (this.controllers.get(filename).loop) {
                this.on('loop', this.controllers.get(filename).loop.bind(this.controllers.get(filename)))
              }
            }

            console.log(`[+] Loaded ${filename} <${type.substr(0, type.length - 1)}> from ${path.resolve(dir, type)}`)
          }
        }
      }
    } else {
      console.log(`[?] No ${type} found in ${dir}/${type}`)
    }
  }
}

module.exports = Esdi
