const { MessageEmbed } = require('discord.js')
const joi = require('joi')

/**
 * Converts a {@link https://ko-fi.com/|Ko-fi} webhook into a {@link https://discord.js.org/#/docs/main/stable/class/MessageEmbed|discord.js MessageEmbed} and posts it in a channel
 *
 * `POST: /hook/ko-fi/{channel}`
 *
 * @type {Hook}
 * @memberof Hook
 * @name ko-fi
 * @prop {Object} initConfig `init` function configuration object
 * @prop {Esdi} initConfig.server Esdi server instance
 * @tutorial ko-fi-channel-hook-example
 * @static
 */
module.exports = {
  name: 'ko-fi',
  context: 'channel',
  description: 'Converts a Ko-fi webhook into a message embeds and posts it in a channel.',
  init ({ server }) {
    return {
      method: 'POST',
      path: '/hook/ko-fi/{channel}',
      handler: async (request, h) => {
        // check if channel exists and is enabled
        const checkChannel = await this.checkEnabledForContext({
          h,
          server,
          contextId: request.params.channel,
          contextType: 'channel'
        })
        if (!checkChannel.id) {
          return checkChannel
        }

        let msg

        console.log(this)

        // create a webhook
        const channelHook = await checkChannel.createWebhook(
          'Ko-fi',
          { avatar: 'https://user-images.githubusercontent.com/7295363/99930265-49bad700-2d05-11eb-9057-1a013c45ee2c.png' }
        )

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
              icon_url: 'https://user-images.githubusercontent.com/7295363/101524119-6169a080-393e-11eb-8006-6816e2c5f413.gif',
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
        channelHook.send({ embeds: [embed] }).then(() => {
          // deletes the webhook after use
          channelHook.delete()
        })

        // announce handling the request successfully
        console.log(msg)
        return h.response(msg).code(200)
      }
    }
  }
}

// helper function that returns the donation amount with a currency symbol
const donationAmount = (parsed) => {
  return `${parsed.currency ? parsed.currency : '$'}${parsed.amount}`
}
