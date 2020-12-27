Getting started with your own Esdi bot is very simple. Let's assume you're starting with nothing and setting up a project from scratch. Complete the following steps:

1. Make a folder for your new project (e.g., `your-project-folder/`).
2. In your project folder, run `npm init` to set up your application.
3. Install the `esdi` package with `npm install --save esdi`.
4. Create an `index.js` file with the following contents:

```js
// import Esdi package
const Esdi = require('esdi')

// initialize Esdi
const server = new Esdi({
  discordToken: 'YOUR-DISCORD-BOT-TOKEN'
})

// load local Commands, Controllers, Events, Hooks, and Models
server.load(__dirname)

// start Esdi
server.start()
```

5. Replace `YOUR-DISCORD-BOT-TOKEN` with your [Discord application bot user](https://discord.com/developers/applications) token. If you do not yet have an application, check out [this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html). You can also add a `.env` file to the root of your project with a `DISCORD_TOKEN` property (e.g., `DISCORD_TOKEN='YOUR-DISCORD-BOT-TOKEN'`). **You should not reveal your bot token to anyone!**
6. Retrieve your [Discord application client ID](https://discord.com/developers/applications) and use it to create an invite link to add your bot to your Discord server. For convenience, you can use this link (with your application client ID) to add your bot with **Administrator** permissions: [https://discord.com/oauth2/authorize?client_id=YOUR-APPLICATION-CLIENT-ID&scope=bot&permissions=8](https://discord.com/oauth2/authorize?client_id=YOUR-APPLICATION-CLIENT-ID&scope=bot+applications.commands&permissions=8)

7. In your project folder, run `node .` to start the application. The bot will join your Discord server.

Since an Esdi bot is a standalone package, you can seamlessly integrate it into other Node applications or use it on its own. If you have plans to customize your bot, you can use the folder structure below in the root of your project folder to add custom extension files:

```
your-project-folder/
    ├── commands/
    │   └── ... add your custom commands here
    ├── controllers/
    │   └── ... add your custom controllers here
    ├── events/
    │   └── ... add your custom events here
    └── models/
        └── ... add your custom models here
```

Sometimes you'll need to provide Esdi with IDs from Discord. To do this, open User Settings, select Appearance, and enable Developer Mode. This will let you right click and obtain IDs from users, channels, and servers.

Next, let's [add a custom command]{@tutorial adding-a-custom-command} to our new Esdi bot.