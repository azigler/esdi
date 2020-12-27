A channel Hook is tied to a specific channel that the Esdi bot can see. For this example, we're going to look at a Hook that posts a message embed when a [Ko-fi](https://ko-fi.com/) donation webhook is received.

The {@link Hook.ko-fi|`ko-fi` Hook} is included in [`v1.2.0`](https://github.com/azigler/esdi/releases/tag/v1.2.0) and higher and you can see the code for it [here](hooks_ko-fi.js.html). Please refer to this code as we look at the different parts of the channel Hook.

**By the way, if you just want to use the pre-existing {@link Hook.ko-fi|`ko-fi` channel Hook}, use the `esdi!hook ko-fi` Command to enable it in the desired channel.**

A Hook with channel context is more specific than a global Hook, but is largely the same. It also has an `init()` function which returns a [hapi route object](https://hapi.dev/tutorials/routing/), and it can also have `enable()` and `disable()` functions that handle the toggling of the Hook for the specified context. This particular Hook does not, however. Since a channel Hook is tied to a specific channel, each channel can independently toggle the Hook (as opposed to a global Hook, which can only be toggled for the whole instance, or a guild Hook, which can only be toggled for a server).

The `init()` method takes the Esdi server instance as an argument:

```js
init(server) { // ... }
```

Like a global Hook, the `init()` method returns a [hapi route object](https://hapi.dev/tutorials/routing/). The object has three required properties: `method`, `path`, and `handler`. Let's look at this object's properties:

```js
{
  method: 'POST',
  path: '/hook/ko-fi/{channel}',
  handler: async (request, h) => { // ... }
}
```

The `method` property can be any valid HTTP method, or an array of methods. The `path` property is the relative URL endpoint for this Hook *for a corresponding channel*. This small detail is important and distinguishes a channel Hook from a global Hook. Since a channel Hook is tied to a specific channel, any incoming webhook should make a corresponding request to the channel's endpoint on the Hook server. This is the channel's ID. If this were a Guild Hook, this would correspond to a server's ID. In this case, the `handler()` function is triggered by a `POST` request on the Hook server's `/hook/ko-fi/{channel}` path. The `{channel}` parameter is a [hapi path parameter](https://hapi.dev/api/?v=20.0.3#path-parameters). In our example, `{channel}` becomes `request.params.channel` in the `handler()` function, allowing us to filter the request to the specified channel for which this Hook is enabled.

By the way, you can easily get any channel's ID by right clicking the channel name in Discord and selecting "Copy ID" in the context menu. If you don't see this in the menu, open User Settings, select Appearance, and enable Developer Mode. This will let you right click and obtain IDs from users, channels, and servers.

For example, if you had a channel with the ID `777755555555555555` then you should configure [your Ko-fi webhook](https://ko-fi.com/manage/webhooks) to send to `http://my-esdi-server.com:8587/hook/ko-fi/777755555555555555`. Here's an example configuration on Ko-fi:

![](https://user-images.githubusercontent.com/7295363/101292221-019aba80-37c3-11eb-956c-addb5c26f7ca.png)

Once your Ko-fi webhook is set up, you need to enable the channel Hook in a corresponding channel. That's why we have the {@link Command.hook|`hook`} command. This command lists all enabled Hooks for this context (e.g., `esdi!hook`), toggles the one provided (e.g., `esdi!hook ko-fi`), or lists all Hooks that can be enabled (e.g., `esdi!hook list`). For this example, in the channel with the ID `777755555555555555`, you would use the `esdi!hook ko-fi` command to toggle on the {@link Hook.ko-fi|`ko-fi` Hook} for the channel like so:

![](https://cdn.discordapp.com/attachments/777738026901045288/792539229703766076/ko-fi-enabled.png)

When a Hook is enabled, its `enable()` function is fired, if it has one. Any provided arguments are also passed to this function. If you want to disable the channel Hook later on, you can simply use the `esdi!hook ko-fi` command again: 

![](https://cdn.discordapp.com/attachments/777738026901045288/792539227485241344/ko-fi-disabled.png)

The {@link Hook.ko-fi|`ko-fi` Hook} also doesn't have a `disable()` because there is no further clean-up to do in this case, but Hooks may also have a `disable()` function that would fire in this case.

**If the Hook isn't enabled, then any corresponding requests on that endpoint will be disregarded. Don't forget to enable your Hook!**

Continuing on to the substance of the channel Hook, the `handler()` function is where the incoming webhook is processed. This handler first uses the `{@link Hook#checkEnabledForContext}` method to see if the Hook is enabled for the channel. Then it creates a temporary [discord.js Webhook](https://discord.js.org/#/docs/main/stable/class/Webhook) for the Hook to use.

Then the handler uses [joi](https://www.npmjs.com/package/joi) to validate the incoming payload. This checks to make sure the incoming data is formatted correctly for the rest of the handler.

Ko-fi requires that donation webhooks with their `is_public` property set to `false` hide the included `message`, so this handler checks for that and removes it if the property is `false`.

Finally, the handler builds the [discord.js MessageEmbed](https://discord.js.org/#/docs/main/stable/class/MessageEmbed) for the [discord.js Webhook](https://discord.js.org/#/docs/main/stable/class/Webhook) we created above. Once created, it posts the embed on the channel and deletes the leftover webhook. This one looks like this:

![](https://cdn.discordapp.com/attachments/777738026901045288/792539519462670346/ko-fi-embed.png)

You can use this particular Hook to post a message embed when a [Ko-fi](https://ko-fi.com/) donation webhook is received. Otherwise, you can use this as a guide for your own channel Hook ideas!

Next, let's [enable the `process-monitor` global interval Event]{@tutorial process-monitor-global-interval-event-example} for our Esdi bot.