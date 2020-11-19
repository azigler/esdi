const Esdi = require('./../index.js')

// initialize Esdi bot
const server = new Esdi()

// load local commands, controllers, events, and models
server.load(__dirname)

// start Esdi bot
server.start()
