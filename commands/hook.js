/**
 * Lists all {@link Hook|Hooks} enabeld here, toggles the Hook provided, or lists all Hooks that can be enabled
 *
 * @type {Command}
 * @memberof Command
 * @name hook
 * @static
 */
module.exports = {
  name: 'hook',
  ownerOnly: true,
  cooldown: 1,
  usage: '[<Hook name>]/[list]',
  aliases: ['hooks'],
  description: 'Lists all Hooks enabled here, toggles the Hook provided, or lists all Hooks that can be enabled.',
  async execute ({ args, server, message }) {
    const prefix = server.controllers.get('CommandController').determinePrefix(message)

    const HOOK_TOGGLE_TXT = `Use \`${prefix}hook <Hook name>\` to toggle a Hook.`
    const HOOK_TXT = `Use \`${prefix}hook\` to see all Hooks enabled here. ${HOOK_TOGGLE_TXT}`
    const HOOK_LIST_TXT = `Use \`${prefix}hook list\` to see the Hooks you can enable here. ${HOOK_TOGGLE_TXT}`

    // helper function that initializes the database document if missing
    const initializeIfMissing = async (hook, doc) => {
      if (doc.status === 404 || !doc.contexts) {
        return await server.controllers.get('DatabaseController').updateDoc({
          db: 'hook',
          id: hook.name,
          payload: {
            contexts: []
          }
        })
      } else {
        return doc
      }
    }

    // if no arguments provided, list all Hooks enabled for this context
    if (args.length === 0) {
      const globalEmbedFieldValues = []
      const guildEmbedFieldValues = []
      const channelEmbedFieldValues = []

      // get all loaded Hooks and their database documents
      for (const h of server.hooks.values()) {
        // fetch this Hook's database document
        let doc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'hook', id: h.name })

        // if missing, initialize this Hook's database document
        doc = await initializeIfMissing(h, doc)

        const contexts = doc.contexts

        // get all contexts with this Hook enabled
        for (const c of contexts) {
          // keep only enabled contexts
          const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({
            db: 'hook',
            id: `${h.name}_${c}`
          })
          if (!contextDoc.enabled) continue

          const args = (contextDoc.args && contextDoc.args.length) ? `- *argument${contextDoc.args.length > 1 ? 's' : ''}:* \`${contextDoc.args.join(' ')}\`` : ''

          // if found, remember that this Hook is enabled globally
          if (h.context === 'global' && server.controllers.get('BotController').botOwner === message.author.id) {
            server.controllers.get('BotController').buildEmbedFieldValues(globalEmbedFieldValues, `\n\`${h.name}\` - ${h.description}\n${args}`)

            continue
          }

          // if found, remember that this Hook is enabled for this Guild
          if (message.guild.id === c) {
            server.controllers.get('BotController').buildEmbedFieldValues(guildEmbedFieldValues, `\n\`${h.name}\` - ${h.description}\n${args}`)
          }

          // if found, remember that this Hook is enabled for this channel
          if (message.channel.id === c) {
            server.controllers.get('BotController').buildEmbedFieldValues(channelEmbedFieldValues, `\n\`${h.name}\` - ${h.description}\n${args}`)
          }
        }
      }

      // if there are enabled Hooks, announce them
      if ([...globalEmbedFieldValues, ...guildEmbedFieldValues, ...channelEmbedFieldValues].length > 0) {
        const globalEmbedFields = server.controllers.get('BotController').buildEmbedFields('Enabled Global Hooks', globalEmbedFieldValues)

        const guildEmbedFields = server.controllers.get('BotController').buildEmbedFields('Enabled Server Hooks', guildEmbedFieldValues)

        const channelEmbedFields = server.controllers.get('BotController').buildEmbedFields('Enabled Channel Hooks', channelEmbedFieldValues)

        // build message embed
        const embed = server.controllers.get('BotController').buildEmbed({
          title: HOOK_LIST_TXT,
          footerTextType: 'Command',
          fields: [...globalEmbedFields, ...guildEmbedFields, ...channelEmbedFields]
        })

        // send message embed
        return message.channel.send(embed)

      // otherwise, provide help about enabling Hooks
      } else {
        message.channel.send(`There are no Hooks enabled here. ${HOOK_LIST_TXT}`)
      }
    // if the argument provided is 'list', show a list of Hooks that can be enabled for this context
    } else if (args[0].toLowerCase() === 'list') {
      const globalEmbedFieldValues = []
      const guildEmbedFieldValues = []
      const channelEmbedFieldValues = []

      // get all loaded Hooks and their database documents
      for (const h of server.hooks.values()) {
        // fetch this Hook's database document
        let doc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'hook', id: h.name })

        // if missing, initialize this Hook's database document
        doc = await initializeIfMissing(h, doc)

        if (h.context === 'guild') {
          // determine if context is enabled
          const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({
            db: 'hook',
            id: `${h.name}_${message.guild.id}`
          })
          if (contextDoc.enabled) continue

          // if the Guild Hook is not already enabled, add it to the embed
          server.controllers.get('BotController').buildEmbedFieldValues(guildEmbedFieldValues, `\n\`${h.name}\` - ${h.description}`)
        }

        if (h.context === 'channel') {
          // determine if context is enabled
          const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({
            db: 'hook',
            id: `${h.name}_${message.channel.id}`
          })
          if (contextDoc.enabled) continue

          // if the channel Hook is not already enabled, add it to the embed
          server.controllers.get('BotController').buildEmbedFieldValues(channelEmbedFieldValues, `\n\`${h.name}\` - ${h.description}`)
        }

        if (h.context === 'global' && server.controllers.get('BotController').botOwner === message.author.id) {
          const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({
            db: 'hook',
            id: `${h.name}_global`
          })
          if (contextDoc.enabled) continue

          // if the global Hook is not already enabled, add it to the embed
          server.controllers.get('BotController').buildEmbedFieldValues(globalEmbedFieldValues, `\n\`${h.name}\` - ${h.description}`)
        }
      }

      // if there are Hooks that can be enabled, announce them
      if ([...globalEmbedFieldValues, ...guildEmbedFieldValues, ...channelEmbedFieldValues].length > 0) {
        const globalEmbedFields = server.controllers.get('BotController').buildEmbedFields('Available Global Hooks', globalEmbedFieldValues)

        const guildEmbedFields = server.controllers.get('BotController').buildEmbedFields('Available Server Hooks', guildEmbedFieldValues)

        const channelEmbedFields = server.controllers.get('BotController').buildEmbedFields('Available Channel Hooks', channelEmbedFieldValues)

        // build message embed
        const embed = server.controllers.get('BotController').buildEmbed({
          title: HOOK_TXT,
          footerTextType: 'Command',
          fields: [...globalEmbedFields, ...guildEmbedFields, ...channelEmbedFields]
        })

        // send message embed
        return message.channel.send(embed)

      // otherwise, announce none available
      } else {
        message.channel.send(`There are no Hooks that can be enabled here. ${HOOK_TXT}`)
      }
    // otherwise, toggle the provided Hook
    } else {
      const hook = server.hooks.get(args[0])

      // stop if Hook not found
      if (!hook) return message.reply('that Hook does not exist.')

      // stop if global Hook is not being toggled by bot owner
      if (server.controllers.get('BotController').botOwner !== message.author.id && hook.context === 'global') return message.reply('you cannot do that.')

      let msg

      try {
        // fetch this Hook's database document
        let hookData = await server.controllers.get('DatabaseController').fetchDoc({ db: 'hook', id: hook.name })

        // if missing, initialize this Hook's database document
        hookData = await initializeIfMissing(hook, hookData)

        // determine this Hook's context
        const fetchType = (hook.context === 'guild' ? message.guild.id : message.channel.id)
        const context = {
          type: hook.context,
          id: (hook.context === 'global' ? 'global' : fetchType)
        }

        // if missing, initialize the context's database document for this Hook
        const contextDoc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'hook', id: `${hook.name}_${context.id}` })
        if (contextDoc.status === 404) {
          await server.controllers.get('DatabaseController').updateDoc({
            db: 'hook',
            id: `${hook.name}_${context.id}`
          })
        }

        // if Hook is enabled for this context, disable it
        if (contextDoc.enabled) {
          // do any Hook-specific cleanup before disabling the Hook for this context
          if (context.type === 'guild') {
            await hook.disable({
              server,
              context: await server.controllers.get('BotController').client.guilds.fetch(context.id),
              args: args.slice(1)
            })
          } else if (context.type === 'channel') {
            await hook.disable({
              server,
              context: await server.controllers.get('BotController').client.channels.fetch(context.id),
              args: args.slice(1)
            })
          } else if (context.type === 'global') {
            await hook.disable({
              server,
              context: 'global',
              args: args.slice(1)
            })
          }

          // save the Hook as disabled in the context's database document
          await server.controllers.get('DatabaseController').updateDoc({
            db: 'hook',
            id: `${hook.name}_${context.id}`,
            payload: {
              enabled: false,
              args: undefined
            }
          })

          // remove the context from the Hook's database document
          if (hookData.contexts.find(p => context.id)) {
            const payload = hookData.contexts

            server.controllers.get('DatabaseController').updateDoc({
              db: 'hook',
              id: hook.name,
              payload: {
                contexts: payload.filter(p => !context.id)
              }
            })
          }

          // announce successfully disabling
          const contextNameFixed = (context.type === 'guild' ? 'server' : 'channel')
          msg = `The \`${hook.name}\` Hook is now **disabled** ${context.type === 'global' ? 'globally' : 'for this ' + contextNameFixed}.`
          message.channel.send(msg)
          msg = `${hook.name} Hook is now disabled ${context.type === 'global' ? 'globally' : `for ${server.utils.capitalize(context.type)}<${context.id}>`} @ ${new Date().toLocaleString()} PT`
          console.log(msg)

        // otherwise, enable the Hook for this channel
        } else {
          // do any Hook-specific setup before enabling the Hook for this context
          if (context.type === 'guild') {
            await hook.enable({
              server,
              context: await server.controllers.get('BotController').client.guilds.fetch(context.id),
              args: args.slice(1)
            })
          } else if (context.type === 'channel') {
            await hook.enable({
              server,
              context: await server.controllers.get('BotController').client.channels.fetch(context.id),
              args: args.slice(1)
            })
          } else if (context.type === 'global') {
            await hook.disable({
              server,
              context: 'global',
              args: args.slice(1)
            })
          }

          // add the context to the Hook's database document
          if (!hookData.contexts.find(p => context.id)) {
            const payload = hookData.contexts

            server.controllers.get('DatabaseController').updateDoc({
              db: 'hook',
              id: hook.name,
              payload: {
                contexts: [...payload, context.id]
              }
            })
          }

          // save the Hook as enabled in the context's database document
          await server.controllers.get('DatabaseController').updateDoc({
            db: 'hook',
            id: `${hook.name}_${context.id}`,
            payload: {
              enabled: true,
              args: args.slice(1)
            }
          })

          // announce successfully enabling
          const contextNameFixed = (context.type === 'guild' ? 'server' : 'channel')
          msg = `The \`${hook.name}\` Hook is now **enabled** ${context.type === 'global' ? 'globally' : 'for this ' + contextNameFixed}.`
          message.channel.send(msg)
          msg = `${hook.name} Hook is now enabled ${context.type === 'global' ? 'globally' : `for ${server.utils.capitalize(context.type)}<${context.id}>`} @ ${new Date().toLocaleString()} PT`
          console.log(msg)
        }
      } catch (e) {
        msg = `An error occurred while toggling \`${hook.name}\` Hook.`
        message.channel.send(msg)
        msg = `An error occurred in Channel<${message.channel.id}> while toggling ${hook.name} @ ${new Date().toLocaleString()} PT`
        console.log(msg, e)
      }
    }
  }
}
