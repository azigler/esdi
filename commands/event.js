/**
 * Lists all {@link Event|Events} enabled here, toggles the Event provided, or lists all Events that can be enabled
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
  cooldown: 1,
  usage: '[<Event name>]/[list]',
  description: 'Lists all Events enabled here, toggles the Event provided, or lists all Events that can be enabled.',
  aliases: ['events'],
  async execute ({ message, args, server }) {
    const prefix = server.controllers.get('CommandController').determinePrefix(message)

    const EVENT_TOGGLE_TXT = `Use \`${prefix}event <Event name>\` to toggle an Event.`
    const EVENT_TXT = `Use \`${prefix}event\` to see all Events enabled here. ${EVENT_TOGGLE_TXT}`
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

    // if no arguments provided, list all Events enabled for this context
    if (args.length === 0) {
      const globalEmbedFieldValues = []
      const guildEmbedFieldValues = []
      const channelEmbedFieldValues = []

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

          // if found, remember that this Event is enabled globally
          if (e.context === 'global' && server.controllers.get('BotController').botOwner === message.author.id) {
            const timestamp = doc.contextTimestampPairs.filter(p => p[0] === c)[0][1]

            server.controllers.get('BotController').buildEmbedFieldValues(globalEmbedFieldValues, `\n\`${e.name}\` - ${e.description}\n*(handled: ${new Date(timestamp).toLocaleString() + ' PT'})*`)

            continue
          }

          // if found, remember that this Event is enabled for this Guild
          if (message.guild.id === c) {
            const timestamp = doc.contextTimestampPairs.filter(p => p[0] === c)[0][1]

            server.controllers.get('BotController').buildEmbedFieldValues(guildEmbedFieldValues, `\n\`${e.name}\` - ${e.description} \n*(handled: ${new Date(timestamp).toLocaleString() + ' PT'})*`)
          }

          // if found, remember that this Event is enabled for this channel
          if (message.channel.id === c) {
            const timestamp = doc.contextTimestampPairs.filter(p => p[0] === c)[0][1]

            server.controllers.get('BotController').buildEmbedFieldValues(channelEmbedFieldValues, `\n\`${e.name}\` - ${e.description} \n*(handled: ${new Date(timestamp).toLocaleString() + ' PT'})*`)
          }
        }
      }

      // if there are enabled Events, announce them
      if ([...globalEmbedFieldValues, ...guildEmbedFieldValues, ...channelEmbedFieldValues].length > 0) {
        const globalEmbedFields = server.controllers.get('BotController').buildEmbedFields('Enabled Global Events', globalEmbedFieldValues)

        const guildEmbedFields = server.controllers.get('BotController').buildEmbedFields('Enabled Server Events', guildEmbedFieldValues)

        const channelEmbedFields = server.controllers.get('BotController').buildEmbedFields('Enabled Channel Events', channelEmbedFieldValues)

        // build message embed
        const embed = server.controllers.get('BotController').buildEmbed({
          title: EVENT_LIST_TXT,
          footerTextName: 'Event',
          footerTextType: 'Command',
          fields: [...globalEmbedFields, ...guildEmbedFields, ...channelEmbedFields]
        })

        // send message embed
        return message.channel.send(embed)

      // otherwise, provide help about enabling Events
      } else {
        message.channel.send(`There are no Events enabled here. ${EVENT_LIST_TXT}`)
      }
    // if the argument provided is 'list', show a list of Events that can be enabled for this context
    } else if (args[0] === 'list') {
      const globalEmbedFieldValues = []
      const guildEmbedFieldValues = []
      const channelEmbedFieldValues = []

      // get all loaded Events and their database documents
      for (const e of server.events.values()) {
        // only consider interval Events
        if (e.type !== 'interval') continue

        // fetch this Event's database document
        let doc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: e.name })

        // if missing, initialize this Event's database document
        doc = await initializeIfMissing(e, doc)

        if (e.context === 'guild') {
          // determine if context is enabled
          const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({
            db: 'event',
            id: `${e.name}_${message.guild.id}`
          })
          if (contextDoc.enabled) continue

          // if the Guild Event is not already enabled, add it to the embed
          server.controllers.get('BotController').buildEmbedFieldValues(guildEmbedFieldValues, `\n\`${e.name}\` - ${e.description}`)
        }

        if (e.context === 'channel') {
          // determine if context is enabled
          const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({
            db: 'event',
            id: `${e.name}_${message.channel.id}`
          })
          if (contextDoc.enabled) continue

          // if the channel Event is not already enabled, add it to the embed
          server.controllers.get('BotController').buildEmbedFieldValues(channelEmbedFieldValues, `\n\`${e.name}\` - ${e.description}`)
        }

        if (e.context === 'global' && server.controllers.get('BotController').botOwner === message.author.id) {
          const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({
            db: 'event',
            id: `${e.name}_global`
          })
          if (contextDoc.enabled) continue

          // if the global Event is not already enabled, add it to the embed
          server.controllers.get('BotController').buildEmbedFieldValues(globalEmbedFieldValues, `\n\`${e.name}\` - ${e.description}`)
        }
      }

      // if there are Events that can be enabled, announce them
      if ([...globalEmbedFieldValues, ...guildEmbedFieldValues, ...channelEmbedFieldValues].length > 0) {
        const globalEmbedFields = server.controllers.get('BotController').buildEmbedFields('Available Global Events', globalEmbedFieldValues)

        const guildEmbedFields = server.controllers.get('BotController').buildEmbedFields('Available Server Events', guildEmbedFieldValues)

        const channelEmbedFields = server.controllers.get('BotController').buildEmbedFields('Available Channel Events', channelEmbedFieldValues)

        // build message embed
        const embed = server.controllers.get('BotController').buildEmbed({
          title: EVENT_TXT,
          footerTextName: 'Event',
          footerTextType: 'Command',
          fields: [...globalEmbedFields, ...guildEmbedFields, ...channelEmbedFields]
        })

        // send message embed
        return message.channel.send(embed)

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

      // stop if global interval Event is not being toggled by bot owner
      if (server.controllers.get('BotController').botOwner !== message.author.id && event.context === 'global') return message.reply('you cannot do that.')

      let msg

      try {
        // fetch this Event's database document
        let eventData = await server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: event.name })

        // if missing, initialize this Event's database document
        eventData = await initializeIfMissing(event, eventData)

        // determine this Event's context
        const fetchType = (event.context === 'guild' ? message.guild.id : message.channel.id)
        const context = {
          type: event.context,
          id: (event.context === 'global' ? 'global' : fetchType)
        }

        // if missing, initialize the context's database document for this Event
        const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'event', id: `${event.name}_${context.id}` })
        if (contextDoc.status === 404) {
          await server.controllers.get('DatabaseController').updateDoc({
            db: 'event',
            id: `${event.name}_${context.id}`
          })
        }

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
          } else if (context.type === 'global') {
            await event.disable({
              server,
              context: 'global',
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
          const contextNameFixed = (context.type === 'guild' ? 'server' : 'channel')
          msg = `The \`${event.name}\` Event is now **disabled** ${context.type === 'global' ? 'globally' : 'for this ' + contextNameFixed}.`
          message.channel.send(msg)
          msg = `${event.name} Event is now disabled ${context.type === 'global' ? 'globally' : `for ${context.type.charAt(0).toUpperCase() + context.type.slice(1)}<${context.id}>`}`
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
          } else if (context.type === 'global') {
            await event.disable({
              server,
              context: 'global',
              args: args.slice(1)
            })
          }

          // update locally to avoid database polling every loop
          const local = server.controllers.get('EventController').intervalEvents.get(event.name)
          server.controllers.get('EventController').intervalEvents.set(event.name, [...local.filter(c => c !== context.id), context.id])

          // if this context does not have a timestamp, create one and fire Event
          if (!eventData.contextTimestampPairs.find(p => p[0] === context.id)) {
            const payload = eventData.contextTimestampPairs

            server.controllers.get('DatabaseController').updateDoc({
              db: 'event',
              id: event.name,
              payload: {
                contextTimestampPairs: [...payload, [context.id, Date.now()]]
              }
            })

            event.handler({ server, context })
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
          const contextNameFixed = (context.type === 'guild' ? 'server' : 'channel')
          msg = `The \`${event.name}\` Event is now **enabled** ${context.type === 'global' ? 'globally' : 'for this ' + contextNameFixed}.`
          message.channel.send(msg)
          msg = `${event.name} Event is now enabled ${context.type === 'global' ? 'globally' : `for ${context.type.charAt(0).toUpperCase() + context.type.slice(1)}<${context.id}>`}`
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
