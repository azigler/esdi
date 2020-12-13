/**
 * Lists all enabled {@link Event|Events} for this channel, toggles the Event provided, or lists all Events that can be enabled
 *
 * @type {Command}
 * @memberof Command
 * @name event
 * @prop {Object} executeConfig `execution` function configuration object
 * @prop {external:Message} executeConfig.message discord.js Message
 * @prop {String[]} executeConfig.args Array of space-separated strings following the command
 * @prop {Esdi} executeConfig.server Esdi server instance
 * @static
 */
module.exports = {
  name: 'event',
  ownerOnly: true,
  usage: '[<Event name>]/[list]',
  description: 'Lists all enabled Events for this channel, toggles the Event provided, or lists all Events that can be enabled.',
  aliases: ['events'],
  async execute ({ message, args, server }) {
    const prefix = server.controllers.get('BotController').prefix

    const EVENT_TOGGLE_TXT = `Use \`${prefix}event <Event name>\` to toggle an Event.`
    const EVENT_TXT = `Use \`${prefix}event\` to see all Events enabled for this channel. ${EVENT_TOGGLE_TXT}`
    const EVENT_LIST_TXT = `Use \`${prefix}event list\` to see the Events you can enable. ${EVENT_TOGGLE_TXT}`

    // helper function that initializes the database document if missing
    const initializeIfMissing = async (event, doc) => {
      if (doc.status === 404 || !doc.channelTimestampPairs) {
        return await server.controllers.get('DatabaseController').updateDoc({
          db: 'event',
          id: event.name,
          payload: {
            channelTimestampPairs: []
          }
        })
      } else {
        return doc
      }
    }

    // if no arguments provided, list all Events enabled for this channel
    if (args.length === 0) {
      const enabledEvents = []

      // get all loaded Events and their database documents
      for (const e of server.events.values()) {
        // only consider channel type Events
        if (e.type !== 'channel') continue

        // fetch this Event's database document
        let doc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: e.name })

        // if missing, initialize this Event's database document
        doc = await initializeIfMissing(e, doc)

        const channels = doc.channelTimestampPairs.map(p => p[0])

        // get all channels with this Event enabled
        for (const c of channels) {
          // if found, remember that this Event is enabled for this channel
          if (message.channel.id === c) {
            const timestamp = doc.channelTimestampPairs.filter(p => p[0] === c)[0][1]
            enabledEvents.push(`\`\`\`${e.name} - ${e.description}`)
            enabledEvents.push(`\n[LAST FIRED: ${new Date(timestamp).toLocaleString() + ' PT'}]\`\`\``)
          }
        }
      }

      // if there are Events enabled for this channel, announce them
      if (enabledEvents.length > 0) {
        enabledEvents.unshift('**Events enabled for this channel:**')
        enabledEvents.push(EVENT_LIST_TXT)
        message.channel.send(enabledEvents, { split: true })
      // otherwise, provide help about enabling Events
      } else {
        message.channel.send(`There are no Events enabled for this channel. ${EVENT_LIST_TXT}`)
      }
    // if the argument provided is 'list', show a list of Events that can be enabled for this channel
    } else if (args[0].toLowerCase() === 'list') {
      const availableEvents = []

      // get all loaded Events and their database documents
      for (const e of server.events.values()) {
        // only consider channel type Events
        if (e.type !== 'channel') continue

        // fetch this Event's database document
        let doc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: e.name })

        // if missing, initialize this Event's database document
        doc = await initializeIfMissing(e, doc)

        const channels = doc.channelTimestampPairs.map(p => p[0])

        let enabled = false
        // get all channels with this Event enabled
        for (const c of channels) {
          // if found, remember that this Event is enabled for this channel
          if (message.channel.id === c) {
            enabled = true
          }
        }

        // if the Event is not already enabled, add it to the array of available Events
        if (!enabled) {
          availableEvents.push(`\`\`\`${e.name} - ${e.description}\`\`\``)
        }
      }

      // if there are Events that can be enabled, announce them
      if (availableEvents.length > 0) {
        availableEvents.unshift('**Events available for this channel:**')
        availableEvents.push(EVENT_TXT)
        message.channel.send(availableEvents, { split: true })
      // otherwise, announce none available
      } else {
        message.channel.send(`There are no Events available for this channel. ${EVENT_TXT}`)
      }
    // otherwise, toggle the provided Event
    } else {
      const event = Array.from(server.events.values()).filter(e => e.name === args[0])[0]

      // stop if Event not found
      if (!event) return message.reply('that Event does not exist.')

      // stop if Event is not a channel type
      if (event.type !== 'channel') return message.reply('that Event cannot be enabled for a channel.')

      let msg

      try {
        // fetch this Event's database document
        let eventData = await server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: event.name })

        // if missing, initialize this Event's database document
        eventData = await initializeIfMissing(event, eventData)

        // get all channels with this Event enabled
        const channels = eventData.channelTimestampPairs.map(p => p[0])

        // if Event is enabled for this channel, disable it
        if (channels.find(c => c === message.channel.id)) {
          // do any Event-specific cleanup before disabling the Event for this channel
          await event.disable({ server, channel: message.channel })

          // update locally to avoid database polling every loop
          const local = server.controllers.get('EventController').channelEvents.get(event.name)
          server.controllers.get('EventController').channelEvents.set(event.name, local.filter(c => !message.channel.id))

          // make sure this channel is filtered out of the pair array
          const payload = eventData.channelTimestampPairs.filter(p => p[0] !== message.channel.id)

          // update the database document to remove the channel and timestamp pair
          server.controllers.get('DatabaseController').updateDoc({
            db: 'event',
            id: event.name,
            payload: {
              channelTimestampPairs: [...payload]
            }
          })

          // announce successfully disabling
          msg = `The \`${event.name}\` Event is now **disabled** for this channel.`
          message.channel.send(msg)
          msg = `${event.name} Event is now disabled for Channel<${message.channel.id}>`
          console.log(msg)

        // otherwise, enable the Event for this channel
        } else {
          // do any Event-specific setup before enabling the Event for this channel
          await event.enable({ server, channel: message.channel })

          // update locally to avoid database polling every loop
          const local = server.controllers.get('EventController').channelEvents.get(event.name)
          server.controllers.get('EventController').channelEvents.set(event.name, [...local, message.channel.id])

          // make sure this channel is filtered out of the pair array
          const payload = eventData.channelTimestampPairs.filter(p => p[0] !== message.channel.id)

          // update the database document to add the channel and timestamp pair
          server.controllers.get('DatabaseController').updateDoc({
            db: 'event',
            id: event.name,
            payload: {
              channelTimestampPairs: [...payload, [message.channel.id, Date.now()]]
            }
          })

          // handle the Event immediately
          event.handler({ server, channel: message.channel })

          // announce successfully enabling
          msg = `The \`${event.name}\` Event is now **enabled** for this channel.`
          message.channel.send(msg)
          msg = `${event.name} Event is now enabled for Channel<${message.channel.id}>`
          console.log(msg)
        }
      } catch (e) {
        msg = `An error occurred while toggling \`${event.name}\` Event for this channel.`
        message.channel.send(msg)
        msg = `An error occurred while toggling ${event.name} Event for Channel<${message.channel.id}>`
        console.log(msg, e)
      }
    }
  }
}
