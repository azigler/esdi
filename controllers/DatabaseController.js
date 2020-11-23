const PouchDB = require('pouchdb')
const fs = require('fs')

/**
 * Controller for {@link https://couchdb.apache.org/|CouchDB} (remote) and {@link https://pouchdb.com/|PouchDB} (local) databases
 *
 * @class
 * @extends Map
 */
class DatabaseController extends Map {
  /**
   * Initializes a new DatabaseController
   *
   * @param {Object} config configuration object
   * @param {Object} config.server Esdi server instance
   * @param {String} [config.dbAddress = 'local'] address of remote database, or `local` for local database
   * @param {String} [config.dbPort = 5984] port of remote database
   * @param {String} [config.dbNamespace = 'esdi_'] namespace prefix for database names
   * @memberof DatabaseController
   */
  init ({ server, dbAddress = 'local', dbPort = 5984, dbNamespace = 'esdi_' }) {
    this.server = server
    this.dbAddress = dbAddress
    this.dbPort = dbPort
    this.dbNamespace = dbNamespace

    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data')
    }
  }

  /**
   * Starts the DatabaseController
   *
   * @listens Esdi#start
   * @memberof DatabaseController
   */
  start () {
    console.log('[#] Starting DatabaseController...')

    this.server.models.forEach((model, name) => {
      const lowercaseName = name.toLowerCase()
      this.set(lowercaseName, this.loadDb(lowercaseName, this.dbAddress, this.dbPort))
    })
  }

  /**
   * Stops the DatabaseController
   *
   * @listens Esdi#stop
   * @memberof DatabaseController
   */
  stop () {
    console.log('[#] Stopping DatabaseController...')
    this.stopSyncing()
  }

  /**
   * Loads and syncs with a database
   *
   * @param {String} name database name
   * @param {String} [dbAddress='local'] remote database address, or `local` for local database
   * @param {Number} [port=5984] remote database port
   * @returns {Object}
   * @memberof DatabaseController
   */
  loadDb (name, dbAddress = 'local', port = 5984) {
    let DB
    if (dbAddress === 'local') {
      DB = new PouchDB(`data/${this.dbNamespace}${name}`)
      console.log(`=== Syncing local ${name} database...`)
    } else {
      DB = new PouchDB(`http://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${dbAddress}:${port}/${this.dbNamespace}${name}`)
      console.log(`=== Syncing remote ${name} database...`)
    }

    const changes = DB.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', function (change) {
      if (change.doc._rev.split('-')[0] === '1') return
      console.log(`[~] Updated "${change.id}" document in ${name} database:`)
      console.log(change.doc)
    }).on('complete', function (info) {
      console.log(`=/= No longer syncing ${name} database!`)
    }).on('error', function (err) {
      console.log(err)
    })
    return {
      DB,
      changes
    }
  }

  /**
   * Fetches a document from a database
   *
   * @param {Object} config configuration object
   * @param {String} config.db database name
   * @param {String} config.id document `_id`
   * @returns {Object|Error}
   * @memberof DatabaseController
   */
  fetchDoc ({ db, id }) {
    return this.get(db).DB
      .get(id)
      .then(data => { return data })
      .catch(er => { return er })
  }

  /**
   * Updates or creates a document in a database
   *
   * @param {Object} config configuration object
   * @param {String} config.db database name
   * @param {String} config.id document `_id`
   * @param {Object} config.payload payload for document
   * @memberof DatabaseController
   */
  updateDoc ({ db, id, payload }) {
    return this.fetchDoc({ db, id })
      .then(data => {
        if (data.status === 404 && data.reason === 'deleted') {
          return this.get(db).DB.put({
            _id: data.docId,
            ...payload
          })
        }
        if (data.status === 404 && data.reason === 'missing') {
          return this.get(db).DB.put({
            _id: id,
            ...payload
          })
        }
        return this.get(db).DB.put({
          _id: data._id,
          _rev: data._rev,
          ...payload
        })
      })
      .catch(er => { return er })
  }

  /**
   * Stops syncing all databases
   *
   * @memberof DatabaseController
   */
  stopSyncing () {
    this.forEach((db) => {
      db.changes.cancel()
    })
  }
}

// factory
module.exports = new DatabaseController()
