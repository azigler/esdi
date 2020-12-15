A channel Hook is tied to a specific channel that the Esdi bot can see. For this example, we're going to look at a Hook that posts a message embed when a [Ko-fi](https://ko-fi.com/) donation webhook is received.

The {@link Hook.ko-fi|`ko-fi` Hook} is included in [`v1.2.0`](https://github.com/azigler/esdi/releases/tag/v1.2.0) and higher, and you can see the code for it [here](hooks_ko-fi.js.html). Please review to this code as we look at the different parts of the channel Hook.

A channel Hook is a little more complex than a global Hook. In addition to an `init()` function (which returns a [hapi route object](https://hapi.dev/tutorials/routing/)), it also has `enabled()` and `disabled()` functions that handle the toggling of the Hook for a specified channel. Since a channel Hook is tied to a specific channel, each channel can independently toggle the Hook on and off (as opposed to a global Hook, which can only be turned on for the whole server).

The same as global Hooks, the `init()` method can take any set of arguments needed to produce the desired result. Let's look at the arguments this particular `init()` method takes:

```js
init({ server }) { // ... }
```

Since this Hook only ever needs to interact with members of the Esdi server, only the server is passed to this function. And in return, like a global Hook, the `init()` method returns a [hapi route object](https://hapi.dev/tutorials/routing/). The object has three required properties: `method`, `path`, and `handler`. Let's look at this object's properties:

```js
{
  method: 'POST',
  path: '/hook/ko-fi/{channel}',
  handler: async (request, h) => { // ... }
}
```

The `method` property can be any valid HTTP method, or an array of methods. The `path` property is the relative URL endpoint for this Hook *for a corresponding channel*. This small detail is important and distinguises a channel Hook from a global Hook. Since a channel Hook is tied to a specific channel, any incoming webhook should make a corresponding request to the channel's endpoint on the Hook server. In this case, the `handler()` function is triggered by a `POST` request on the Hook server's `/hook/ko-fi/{channel}` path. The `{channel}` parameter is a [hapi path paremeter](https://hapi.dev/api/?v=20.0.3#path-parameters). In our example, `{channel}` becomes `request.params.channel` in the `handler()` function, allowing us to filter the request to the specified channel.

You can easily get any channel's ID by right clicking the channel name in Discord and selecting "Copy ID" in the context menu. If you don't see this in the menu, open User Settings, select Appearance, and enable Developer Mode. This will let you right click and obtain IDs from users, channels, and servers. Then you can obtain the ID like this:

![](https://user-images.githubusercontent.com/7295363/101292269-41fa3880-37c3-11eb-8bc4-0687b7ebfedc.png)

For example, if you had a channel with the ID `777755555555555555` then you should configure your [Ko-fi webhook](https://ko-fi.com/manage/webhooks) to send to `http://my-esdi-server.com:8587/hook/ko-fi/777755555555555555`. Here's an example configuration on Ko-fi:

![](https://user-images.githubusercontent.com/7295363/101292221-019aba80-37c3-11eb-956c-addb5c26f7ca.png)

Once your Ko-fi webhook is set up, you need to enable the channel Hook in a corresponding channel. That's why we have the {@link Command.hook|`hook`} command. This command lists all enabled Hooks for this channel (e.g., `esdi!hook`), toggles the one provided (e.g., `esdi!hook ko-fi`), or lists all Hooks that can be enabled (e.g., `esdi!hook list`). In this example, in the channel with the ID `777755555555555555`, you would use the `esdi!hook ko-fi` command to toggle on the {@link Hook.ko-fi|`ko-fi` Hook} for the channel like so:

![](https://user-images.githubusercontent.com/7295363/101294770-8a6b2380-37ce-11eb-90d8-f6e478eca80b.png)

Enabling the Hook will add a corresponding webhook on the Discord channel. But even if this webhook is deleted on Discord, if an incoming request is received then Esdi will automatically remake the webhook on demand while the Hook is enabled. When a Hook is enabled, its `enabled()` function is fired. **For a channel Hook, the `enabled()` function is required and must return a [discord.js Webhook](https://discord.js.org/#/docs/main/stable/class/Webhook).**

If you want to disable the channel Hook later on, you can simply use the `esdi!hook ko-fi` command again: 

![](https://user-images.githubusercontent.com/7295363/101294774-8c34e700-37ce-11eb-9bfb-d1a9c0fdf2a3.png)

The {@link Hook.ko-fi|`ko-fi` Hook} doesn't have a `disabled()` because there is no further clean-up to do in this case. **When a Hook is disabled, Esdi will automatically delete the corresponding [discord.js Webhook](https://discord.js.org/#/docs/main/stable/class/Webhook).**

**If the Hook isn't enabled, then any corresponding requests on that endpoint will be disregarded. Don't forget to enable your Hook!**

Continuing on to the substance of the channel Hook, the `handler()` function is where the incoming webhook is, well, handled. Let's look at the `handler()` function for {@link Hook.ko-fi|`ko-fi`}:

```js
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
```

This handler first uses the `{@link HookController#checkHookEnabledForChannel}` method to see if the channel has the Hook enabled. Then it uses the `{@link HookController#fetchWebhookForChannelHook}` method to get the [discord.js Webhook](https://discord.js.org/#/docs/main/stable/class/Webhook) for the Hook.

Then the handler uses [joi](https://www.npmjs.com/package/joi) to validate the incoming payload. This checks to make sure the incoming data is formatted correctly for the rest of the handler.

Ko-fi requires that donation webhooks with their `is_public` property set to `false` hide the included `message`, so this handler checks for that and removes it if the property is `false`.

Finally, the handler builds the [discord.js MessageEmbed](https://discord.js.org/#/docs/main/stable/class/MessageEmbed) for the [discord.js Webhook](https://discord.js.org/#/docs/main/stable/class/Webhook) we fetched above. Once created, it posts the embed on the channel. This one looks like this:

![](https://user-images.githubusercontent.com/7295363/101294768-863f0600-37ce-11eb-8ee2-1410531f6db7.png)

You can use this particular Hook to post a message embed when a [Ko-fi](https://ko-fi.com/) donation webhook is received. Otherwise, you can use this as a guide for your own channel Hook ideas!