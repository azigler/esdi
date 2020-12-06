const { MessageEmbed } = require('discord.js')
const joi = require('joi')

/**
 * Converts a {@link https://ko-fi.com/|Ko-fi} webhook into a {@link https://discord.js.org/#/docs/main/stable/class/MessageEmbed|discord.js MessageEmbed} and posts it in a {@link https://discord.js.org/#/docs/main/stable/class/Channel|discord.js Channel}
 *
 * `POST: /hook/ko-fi/{channel}`
 *
 * @type {Hook}
 * @memberof Hook
 * @name ko-fi
 * @prop {Object} initConfig `init` function configuration object
 * @prop {Esdi} initConfig.server Esdi server instance
 * @prop {Object} enableConfig `enable` function configuration object
 * @prop {Esdi} enableConfig.server Esdi server instance
 * @prop {external:Channel} enableConfig.channel discord.js Channel
 * @static
 */
module.exports = {
  name: 'ko-fi',
  type: 'channel',
  description: 'Converts a Ko-fi webhook into a message embeds and posts it in a channel.',
  init ({ server }) {
    return {
      method: 'POST',
      path: '/hook/ko-fi/{channel}',
      handler: async (request, h) => {
        // check if channel exists and is enabled
        const checkChannel = await server.controllers.get('HookController').checkHookEnabledForChannel({
          h,
          server,
          channelId: request.params.channel,
          hookName: 'ko-fi'
        })

        // fetch information for channel
        let msg,
          channel,
          hookData,
          channelWebhookId
        if (Array.isArray(checkChannel)) {
          [msg,
            channel,
            hookData,
            channelWebhookId] = checkChannel
        } else {
          return checkChannel
        }

        // fetch channel's webhook for Ko-fi Hook or make a new one
        let channelHook = await server.controllers.get('HookController').fetchWebhookForChannelHook({
          h,
          request,
          server,
          channel,
          channelWebhookId,
          hookData,
          enable: this.enable
        })
        if (Array.isArray(channelHook)) {
          channelHook = channelHook[0]
        } else {
          return channelHook
        }

        // validate payload
        const kofiSchema = joi.object({
          message_id: joi.string()
            .length(36),
          timestamp: joi.date(),
          type: joi.string()
            .pattern(/(Donation|Commission|Shop Order)/),
          is_public: joi.boolean(),
          from_name: joi.string(),
          message: joi.string()
            .allow(''),
          amount: joi.string(),
          url: joi.string()
            .uri(),
          email: joi.string()
            .allow(null),
          currency: joi.string()
            .allow(null),
          is_subscription_payment: joi.boolean(),
          is_first_subscription_payment: joi.boolean(),
          kofi_transaction_id: joi.string()
        })
        if (!request.payload ||
              !request.payload.data ||
              kofiSchema.validate(JSON.parse(request.payload.data)).error) {
          msg = `Ko-fi Hook for Channel<${request.params.channel}> was rejected due to invalid payload`
          console.log(msg, kofiSchema.validate(JSON.parse(request.payload.data)))
          return h.response(msg).code(400)
        }

        // parse payload
        const parsed = JSON.parse(request.payload.data)

        // check if payload is private
        let isPrivate
        if (parsed.is_public === false) {
          parsed.from_name = 'Anonymous'
          parsed.message = ''

          msg = `Private ko-fi Hook for Channel<${request.params.channel}> was handled`
          isPrivate = true
        }

        // prepare fields for message embed
        const embedFields = [
          {
            name: '**Name**',
            value: parsed.from_name,
            inline: true
          },
          {
            name: '**Amount**',
            value: donationAmount(parsed),
            inline: true
          }
        ]
        if (parsed.message.length > 0) {
          embedFields.push({
            name: '**Message**',
            value: parsed.message
          })
        }

        // build message embed
        const embed = new MessageEmbed(
          {
            title: '☕ New Ko-fi contribution',
            description: `${donationAmount(parsed)} from ${parsed.from_name}`,
            url: parsed.url,
            color: 2730976,
            timestamp: parsed.timestamp,
            thumbnail: {
              url: 'https://user-images.githubusercontent.com/7295363/99930265-49bad700-2d05-11eb-9057-1a013c45ee2c.png'
            },
            footer: {
              icon_url: 'https://user-images.githubusercontent.com/7295363/97830418-bf410380-1c81-11eb-95cc-1b7b15d8d7eb.jpg',
              text: 'Ko-fi Hook by Esdi 🤍'
            },
            fields: embedFields
          }
        )

        // if webhook is public, set result message
        if (!isPrivate) {
          msg = `Ko-fi Hook for Channel<${request.params.channel}> was handled`
        }

        // send the message embed
        channelHook.send({ embeds: [embed] })

        // announce handling the request successfully
        console.log(msg)
        return h.response(msg).code(200)
      }
    }
  },
  enable ({ server, channel }) {
    return channel.createWebhook('Ko-fi', {
      avatar: 'https://user-images.githubusercontent.com/7295363/99930265-49bad700-2d05-11eb-9057-1a013c45ee2c.png'
    })
  }
}

// helper function that returns the donation amount with a currency symbol
const donationAmount = (parsed) => {
  return `${parsed.currency ? parsed.currency : '$'}${parsed.amount}`
}
