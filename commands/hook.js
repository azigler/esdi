/**
 * Lists all enabled {@link Hook|Hooks} for this channel, toggles the one provided, or lists all Hooks that can be enabled
 *
 * @type {Command}
 * @memberof Command
 * @name hook
 * @static
 */
module.exports = {
  name: 'hook',
  ownerOnly: true,
  usage: '[<Hook name>]/[list]',
  aliases: ['hooks'],
  description: 'Lists all enabled Hooks for this channel, toggles the one provided, or lists all Hooks that can be enabled.',
  async execute ({ args, server, message }) {
    const prefix = server.controllers.get('BotController').prefix

    const HOOK_TOGGLE_TXT = `Use \`${prefix}hook <Hook name>\` to toggle a Hook.`
    const HOOK_TXT = `Use \`${prefix}hook\` to see all Hooks enabled for this channel. ${HOOK_TOGGLE_TXT}`
    const HOOK_LIST_TXT = `Use \`${prefix}hook list\` to see the Hooks you can enable. ${HOOK_TOGGLE_TXT}`

    // if no arguments provided, list all Hooks enabled for this channel
    if (args.length === 0) {
      const enabledHooks = []

      // get all loaded Hooks and their database documents
      for (const h of server.hooks.values()) {
        // only consider channel type Hooks
        if (h.type !== 'channel') continue

        // fetch this Hook's database document
        const doc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'hook', id: h.name })
        const channels = doc.channelHookPairs.map(h => h[0])

        // get all channels with this Hook enabled
        for (const c of channels) {
          // if found, know that this Hook is enabled for this channel
          if (message.channel.id === c) {
            enabledHooks.push(`\`\`\`${h.name} - ${h.description}\`\`\``)
          }
        }
      }

      // if there are Hooks enabled for this channel, announce them
      if (enabledHooks.length > 0) {
        enabledHooks.unshift('**Hooks enabled for this channel:**')
        enabledHooks.push(HOOK_LIST_TXT)
        message.channel.send(enabledHooks, { split: true })
      // otherwise, provide help about enabling Hooks
      } else {
        message.channel.send(`There are no Hooks enabled for this channel. ${HOOK_LIST_TXT}`)
      }
    // if the argument provided is 'list', show a list of Hooks that can be enabled for this channel
    } else if (args[0].toLowerCase() === 'list') {
      const availableHooks = []

      // get all loaded Hooks and their database documents
      for (const h of server.hooks.values()) {
        // only consider channel type Hooks
        if (h.type !== 'channel') continue

        // fetch this Hook's database document
        const doc = await server.controllers.get('DatabaseController').fetchDoc({ db: 'hook', id: h.name })
        const channels = doc.channelHookPairs.map(h => h[0])

        let enabled = false
        // get all channels with this Hook enabled
        for (const c of channels) {
          // if found, know that this Hook is enabled for this channel
          if (message.channel.id === c) {
            enabled = true
          }
        }

        // if the Hook is not already enabled, add it to the array of available Hooks
        if (!enabled) {
          availableHooks.push(`\`\`\`${h.name} - ${h.description}\`\`\``)
        }
      }

      // if there are Hooks that can be enabled, announce them
      if (availableHooks.length > 0) {
        availableHooks.unshift('**Hooks available for this channel:**')
        availableHooks.push(HOOK_TXT)
        message.channel.send(availableHooks, { split: true })
      // otherwise, announce none available
      } else {
        message.channel.send(`There are no Hooks available for this channel. ${HOOK_TXT}`)
      }
    // otherwise, toggle the provided Hook
    } else {
      const hook = server.hooks.get(args[0])

      // stop if Hook not found
      if (!hook) return message.reply('that Hook does not exist.')

      // stop if Hook is not a channel type
      if (hook.type !== 'channel') return message.reply('that Hook cannot be enabled for a channel.')

      let msg

      try {
        let hookData,
          channelHook,
          channelWebhookId

        // fetch this Hook's database document
        hookData = await server.controllers.get('DatabaseController').fetchDoc({ db: 'hook', id: hook.name })

        // if the document is deleted or missing, initialize it
        if (hookData.status === 404 || !hookData.channelHookPairs) {
          hookData = await server.controllers.get('DatabaseController').updateDoc({
            db: 'hook',
            id: hook.name,
            payload: {
              ...hookData.payload,
              channelHookPairs: []
            }
          })
        }

        // get all channels with this Hook enabled
        const channels = hookData.channelHookPairs.map(h => h[0])

        // if Hook is enabled for this channel, disable it
        if (channels.find(c => c === message.channel.id)) {
          // do any Hook-specific cleanup before disabling the Hook for this channel
          await hook.disable({ server, channel: message.channel })

          // get the Hook's webhook ID from the document
          channelWebhookId = hookData.channelHookPairs.find(p => p[0] === message.channel.id)[1]

          // fetch this channel's webhooks and delete the one with the above ID
          channelHook = await message.channel.fetchWebhooks()
          channelHook = channelHook.find(hook => hook.id === channelWebhookId)
          if (channelHook) {
            channelHook.delete()
          }

          // update the database document to remove the channel and webhook ID pair
          const payload = hookData.channelHookPairs.filter(p => p[1] !== channelWebhookId)
          server.controllers.get('DatabaseController').updateDoc({
            db: 'hook',
            id: hook.name,
            payload: {
              channelHookPairs: [...(payload)]
            }
          })

          // announce successfully disabling
          msg = `The \`${hook.name}\` Hook is now **disabled** for this channel.`
          message.channel.send(msg)
          msg = `${hook.name} Hook is now disabled for Channel<${message.channel.id}>`
          console.log(msg)

        // otherwise, enable the Hook for this channel
        } else {
          // enable the Hook for this channel
          const newlyEnabledHook = await hook.enable({ server, channel: message.channel })

          // check if enabling returned a webhook before proceeding
          if (newlyEnabledHook.constructor.name !== 'Webhook') {
            msg = `The result of enabling ${hookData._id} Hook for for Channel<${message.channel.id}> was not a valid webhook`

            message.channel.send(msg)
            msg = `${hook.name} Hook is now enabled for Channel<${message.channel.id}>`
            return console.log(msg)
          }

          // update the database document to add this channel and webhook ID pair
          const payload = hookData.channelHookPairs.filter(p => p[0] !== message.channel.id)
          server.controllers.get('DatabaseController').updateDoc({
            db: 'hook',
            id: hook.name,
            payload: {
              channelHookPairs: [...(payload), [message.channel.id, newlyEnabledHook.id]]
            }
          })

          // announce successfully enabling
          msg = `The \`${hook.name}\` Hook is now **enabled** for this channel.`
          message.channel.send(msg)
          msg = `${hook.name} Hook is now enabled for Channel<${message.channel.id}>`
          console.log(msg)
        }
      } catch (e) {
        msg = `An error occurred while toggling \`${hook.name}\` Hook for this channel.`
        message.channel.send(msg)
        msg = `An error occurred while toggling ${hook.name} Hook for Channel<${message.channel.id}>`
        console.log(msg, e)
      }
    }
  }
}
