1. In your project folder, make a new folder called `commands/`.
2. In the `commands/` folder, create a `hello.js` file with the following contents:

```js
module.exports = {
  name: 'hello',
  aliases: ['greet'],
  description: 'Greets the command user.',
  execute ({ message, args, server }) {
    message.channel.send(`Hello, ${message.author}!`)
  }
}

```

Let's break down each property of the command configuration object:

```js
name: 'hello'
```

The `name` property is the name of the command, which must be unique. You can overwrite default commands by simply reusing the command name in your own local command file. The bot will listen for this string in order to execute the command.

```js
aliases: ['greet']
```

The `aliases` property is optional and allows you to designate any strings that will serve as an alias for the command `name`. In this case, the user can also fire this command with the `greet` alias. Currently, aliases do not have to be unique and using an alias will fire the first matching record in the [`Esdi` instance]{@link Esdi}. If an alias is the same as another command's `name`, the command using it as a `name` will take priority.

```js
description: 'Greets the command user.'
```

The `description` property is also optional and allows you to describe the command. This is used by the `help` command.

```js
execute ({ message, args, server }) {
  message.reply(', hello!')
}
```

The `execute` function is the substance of your command. This function fires when the command is invoked. You can use the properties (`message`, `args`, and `server`) that are passed in an object to this function. `message` refers to the [discord.js Message object](https://discord.js.org/#/docs/main/stable/class/Message), `args` refers to the array of space-separated argument strings following the command, and `server` refers to the [`Esdi` instance]{@link Esdi}. You can use `this` to refer to the [`Command` object]{@link Command} representing this loaded command.

To learn more about the command configuration options, check out the [`Command` documentation]{@link Command}.

3. Restart your Esdi server.
4. In your server, fire the command. Use the bot prefix (e.g., `esdi!`) together with the `hello` command or `greeting` alias to see your new custom command in action:

![](https://cdn.discordapp.com/attachments/777738026901045288/792447287968268358/hello-command.png)

5. Continue developing your command, or make a brand new one! You can use anything from the [discord.js Message object](https://discord.js.org/#/docs/main/stable/class/Message) (which has access to everything about your [discord.js Client](https://discord.js.org/#/docs/main/stable/class/Client)) and the [`Esdi` instance]{@link Esdi}. You can also implement functionality from own your applications or third-party APIs. You don't even have to restart your server while building. Use the `reload` command (e.g., `esdi!reload <command>`) to reload your command file on the fly once it's initially loaded. Your creativity is the limit!

Next, let's [enable the `github-redeploy` global Hook]{@tutorial github-redeploy-global-hook-example} for our Esdi server.