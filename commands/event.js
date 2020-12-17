/**
 * Lists all enabled {@link Event|Events} for this {@link Guild} and channel, toggles the Event provided, or lists all Events that can be enabled
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
  description: 'Lists all enabled Events for this server and channel, toggles the Event provided, or lists all Events that can be enabled.',
  aliases: ['events'],
  async execute ({ message, args, server }) {
    const prefix = server.controllers.get('CommandController').determinePrefix(message)

    const EVENT_TOGGLE_TXT = `Use \`${prefix}event <Event name>\` to toggle an Event here.`
    const EVENT_TXT = `Use \`${prefix}event\` to see all Events for this server and channel. ${EVENT_TOGGLE_TXT}`
    const EVENT_LIST_TXT = `Use \`${prefix}event list\` to see the Events you can enable here. ${EVENT_TOGGLE_TXT}`

    // helper function that initializes the database document if missing
    const initializeIfMissing = async (event, doc) => {
      if (doc.status === 404 || !doc.contextTimestampPairs) {
        return await server.controllers.get('DatabaseController').updateDoc({
          db: 'event',
          id: event.name,
          payload: {
            contextTimestampPairs: []
          }
        })
      } else {
        return doc
      }
    }

    // if no arguments provided, list all Events enabled for this Guild and channel
    if (args.length === 0) {
      const enabledEvents = []

      // get all loaded Events and their database documents
      for (const e of server.events.values()) {
        // only consider interval Events
        if (e.type !== 'interval') continue

        // fetch this Event's database document
        let doc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: e.name })

        // if missing, initialize this Event's database document
        doc = await initializeIfMissing(e, doc)

        const contexts = doc.contextTimestampPairs.map(p => p[0])

        // get all contexts with this Event enabled
        for (const c of contexts) {
          // keep only enabled contexts
          const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({
            db: 'event',
            id: `${e.name}_${c}`
          })
          if (!contextDoc.enabled) continue

          // if found, remember that this Event is enabled for this channel
          if (message.channel.id === c) {
            const timestamp = doc.contextTimestampPairs.filter(p => p[0] === c)[0][1]
            enabledEvents.push(`\`\`\`${e.name} - ${e.description}`)
            enabledEvents.push('\n[CHANNEL INTERVAL EVENT]')
            enabledEvents.push(`\n[TIMESTAMP: ${new Date(timestamp).toLocaleString() + ' PT'}]\`\`\``)
          }
          // if found, remember that this Event is enabled for this Guild
          if (message.guild.id === c) {
            const timestamp = doc.contextTimestampPairs.filter(p => p[0] === c)[0][1]
            enabledEvents.push(`\`\`\`${e.name} - ${e.description}`)
            enabledEvents.push('\n[SERVER INTERVAL EVENT]')
            enabledEvents.push(`\n[TIMESTAMP: ${new Date(timestamp).toLocaleString() + ' PT'}]\`\`\``)
          }
        }
      }

      // if there are enabled Events, announce them
      if (enabledEvents.length > 0) {
        enabledEvents.unshift('**Enabled Events:**')
        enabledEvents.push(EVENT_LIST_TXT)
        message.channel.send(enabledEvents, { split: true })
      // otherwise, provide help about enabling Events
      } else {
        message.channel.send(`There are no Events enabled here. ${EVENT_LIST_TXT}`)
      }
    // if the argument provided is 'list', show a list of Events that can be enabled for this context
    } else if (args[0].toLowerCase() === 'list') {
      const availableEvents = []

      // get all loaded Events and their database documents
      for (const e of server.events.values()) {
        // only consider interval Events
        if (e.type !== 'interval') continue

        // fetch this Event's database document
        let doc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: e.name })

        // if missing, initialize this Event's database document
        doc = await initializeIfMissing(e, doc)

        const contexts = doc.contextTimestampPairs.map(p => p[0])

        let enabled = false
        // get all contexts with this Event enabled
        for (const c of contexts) {
          // if found, remember that this Event is enabled for this channel
          if (message.channel.id === c) {
            enabled = true
          }
          // if found, remember that this Event is enabled for this Guild
          if (message.guild.id === c) {
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
        availableEvents.unshift('**Available Events:**')
        availableEvents.push(EVENT_TXT)
        message.channel.send(availableEvents, { split: true })
      // otherwise, announce none available
      } else {
        message.channel.send(`There are no Events that can be enabled here. ${EVENT_TXT}`)
      }
    // otherwise, toggle the provided Event
    } else {
      const event = Array.from(server.events.values()).filter(e => e.name === args[0])[0]

      // stop if Event not found
      if (!event) return message.reply('that Event does not exist.')

      // stop if Event is not an interval type
      if (event.type !== 'interval') return message.reply('that Event cannot be enabled.')

      let msg

      try {
        // fetch this Event's database document
        let eventData = await server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: event.name })

        // if missing, initialize this Event's database document
        eventData = await initializeIfMissing(event, eventData)

        // determine this Event's context
        const context = {
          type: event.context,
          id: (event.context === 'guild' ? message.guild.id : message.channel.id)
        }

        // if missing, initialize the context's database document for this event
        const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: `${event.name}_${context.id}` })
        if (contextDoc.status === 404) {
          await server.controllers.get('DatabaseController').updateDoc({
            db: 'event',
            id: `${event.name}_${context.id}`
          })
        }

        // determine the capitalized name of this context ('Guild' or 'Channel')
        const contextName = context.type.charAt(0).toUpperCase() + context.type.slice(1)

        // if Event is enabled for this context, disable it
        if (contextDoc.enabled) {
          // do any Event-specific cleanup before disabling the Event for this context
          if (context.type === 'guild') {
            await event.disable({
              server,
              context: await server.controllers.get('BotController').client.guilds.fetch(context.id),
              args: args.slice(1)
            })
          } else if (context.type === 'channel') {
            await event.disable({
              server,
              context: await server.controllers.get('BotController').client.channels.fetch(context.id),
              args: args.slice(1)
            })
          }

          // update locally to avoid database polling every loop
          const local = server.controllers.get('EventController').intervalEvents.get(event.name)
          server.controllers.get('EventController').intervalEvents.set(event.name, local.filter(c => !context.id))

          // save the Event as disabled in the context's database document
          await server.controllers.get('DatabaseController').updateDoc({
            db: 'event',
            id: `${event.name}_${context.id}`,
            payload: {
              enabled: false
            }
          })

          // announce successfully disabling
          msg = `The \`${event.name}\` Event is now **disabled** for this ${context.type}.`
          message.channel.send(msg)
          msg = `${event.name} Event is now disabled for ${contextName}<${message.channel.id}>`
          console.log(msg)

        // otherwise, enable the Event for this context
        } else {
          // do any Event-specific setup before enabling the Event for this context
          if (context.type === 'guild') {
            await event.enable({
              server,
              context: await server.controllers.get('BotController').client.guilds.fetch(context.id),
              args: args.slice(1)
            })
          } else if (context.type === 'channel') {
            await event.enable({
              server,
              context: await server.controllers.get('BotController').client.channels.fetch(context.id),
              args: args.slice(1)
            })
          }

          // update locally to avoid database polling every loop
          const local = server.controllers.get('EventController').intervalEvents.get(event.name)
          server.controllers.get('EventController').intervalEvents.set(event.name, [...local.filter(c => c !== context.id), context.id])

          // if this context does not have a timestamp, create one
          if (!eventData.contextTimestampPairs.find(p => p[0] === context.id)) {
            const payload = eventData.contextTimestampPairs

            server.controllers.get('DatabaseController').updateDoc({
              db: 'event',
              id: event.name,
              payload: {
                contextTimestampPairs: [...payload, [context.id, Date.now()]]
              }
            })
          }

          // save the Event as enabled in the context's database document
          await server.controllers.get('DatabaseController').updateDoc({
            db: 'event',
            id: `${event.name}_${context.id}`,
            payload: {
              enabled: true
            }
          })

          // announce successfully enabling
          msg = `The \`${event.name}\` Event is now **enabled** for this ${context.type}.`
          message.channel.send(msg)
          msg = `${event.name} Event is now enabled for ${contextName}<${message.channel.id}>`
          console.log(msg)
        }
      } catch (e) {
        msg = `An error occurred while toggling \`${event.name}\` Event.`
        message.channel.send(msg)
        msg = `An error occurred in Channel<${message.channel.id}> while toggling ${event.name}`
        console.log(msg, e)
      }
    }
  }
}
