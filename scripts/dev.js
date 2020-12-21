const Esdi = require('./../index.js')

// initialize Esdi
const server = new Esdi()

// load local Commands, Controllers, Events, Hooks, and Models
server.load(__dirname)

// start Esdi
server.start()
