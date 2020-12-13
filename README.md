![](https://pbs.twimg.com/profile_banners/68520657/1524094166/1500x500)

# Esdi ![](https://user-images.githubusercontent.com/7295363/101524119-6169a080-393e-11eb-8006-6816e2c5f413.gif)

> ES6 Discord bot framework

[![Discord](https://img.shields.io/discord/777680308598341704?label=discord&logo=discord&style=social)](https://discord.gg/HTSYNQrXam)
[![Twitter](https://img.shields.io/twitter/follow/andrewzigler.svg?label=@andrewzigler&style=social)](https://twitter.com/andrewzigler)

[![GitHub](https://img.shields.io/github/stars/azigler/esdi?style=social)](https://www.github.com/azigler/esdi)
[![npm](https://img.shields.io/npm/v/esdi?logo=npm&style=social)](https://www.npmjs.org/package/esdi)

[![License](https://img.shields.io/badge/license-MIT-EEE.svg?style=popout-square)](./LICENSE.md)
[![Documentation](https://img.shields.io/badge/everything-documented-EEE.svg?style=popout-square)](https://azigler.github.io/esdi/)
[![ES6 Powered](https://img.shields.io/badge/ES6-powered-EEE.svg?style=popout-square)](http://es6-features.org/)

[![Contributing Guide](https://img.shields.io/badge/contributing-guide-EEE.svg?style=popout-square)](./.github/CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/contributor-covenant-EEE.svg?style=popout-square)](./.github/CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security-policy-EEE.svg?style=popout-square)](./.github/SECURITY.md)

[![Ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/O5O2VZWL)

## Table of Contents :book: 

- [Introduction](#introduction-rocket)
- [Setup](#setup-nut_and_bolt)
- [Documentation](#documentation-bookmark_tabs)
- [Features](#features-round_pushpin)
- [Current Roadmap](#current-roadmap-chart_with_upwards_trend)
- [Credits](#credits-horse_racing)
- [Contributing](#contributing-inbox_tray)

## Introduction :rocket:

**[JOIN THE ESDI COMMUNITY (AND MEET THE OFFICIAL BOT) ON DISCORD!](https://discord.gg/HTSYNQrXam)**

Esdi is a "plug and play" framework for building extensible Discord bots in ES6. Esdi can be added as an npm dependency to your Node.js project and implemented with just a few lines of code. The example below will load up any local extension files for Esdi available in your project, uses a local PouchDB database for all data storage, and connects to your [Discord application bot user](https://discord.com/developers/applications) via the provided token.

```js
// import Esdi package
const Esdi = require('esdi')

// initialize Esdi bot
const server = new Esdi({
  discordToken: 'YOUR-DISCORD-BOT-TOKEN'
})

// load local commands, controllers, events, hooks, and models
server.load(__dirname)

// start Esdi bot
server.start()
```

Since an Esdi bot is a standalone package, you can seamlessly integrate it into other Node applications or use it on its own. If you have plans to customize your bot, you can use the folder structure below in the root of your project folder to add custom extension files:

```
your-project-folder/
    ├── commands/
    │   └── ... add your custom commands here
    ├── controllers/
    │   └── ... add your custom controllers here
    ├── events/
    │   └── ... add your custom events here
    ├── hooks/
    │   └── ... add your custom hooks here
    └── models/
        └── ... add your custom models here
```

## Setup :nut_and_bolt:

To get started with your own Esdi bot instance, please read our [setup guide](https://azigler.github.io/esdi/tutorial-setting-up-an-esdi-instance.html).

If you would like to add the official Esdi bot to a server instead of hosting your own instance, you will need **Manage Server** permissions on the server before visiting [this link](https://discord.com/oauth2/authorize?client_id=777680423068106754&scope=bot&permissions=8).

## Documentation :bookmark_tabs:

You can read the latest Esdi documentation [here](https://azigler.github.io/esdi/).

There are also tutorials available. For example, you can learn how to [add a custom commands](https://azigler.github.io/esdi/tutorial-adding-a-custom-command.html). There are also resources for handling webhooks from third-party services like [GitHub](https://azigler.github.io/esdi/tutorial-github-redeploy-global-hook-example.html) and [Ko-fi](https://azigler.github.io/esdi/tutorial-ko-fi-channel-hook-example.html).

If you have further questions, [join the Esdi Community on Discord](https://discord.gg/HTSYNQrXam)!

## Features :round_pushpin:

- Obeys a multitude of commands
- Listens to common Discord events (e.g., someone joining a server)
- Supports local (PouchDB) and remote (CouchDB) databases
- Serves as middleware for webhooks
- Stands alone or integrates with pre-existing applications
- Usable for any purpose: server management, games, third-party API integration, or something totally unique!
- Extensible with custom commands, controllers, events, hooks, and models

## Current Roadmap :chart_with_upwards_trend:

- [x] Release [`v1.0.0`](https://github.com/azigler/esdi/releases/tag/v1.0.0)
- [x] Publish npm package
- [x] Enhance GitHub repository
- [x] Set up JSDoc on GitHub Pages
- [x] Configure community Discord server
- [x] Implement global Hooks
- [x] Add `github-redeploy` global Hook
- [x] Release [`v1.1.0`](https://github.com/azigler/esdi/releases/tag/v1.1.0)
- [x] Implement channel Hooks and `hook` Command
- [x] Add `ko-fi` channel Hook 
- [x] Write Hook tutorials
- [x] Release [`v1.2.0`](https://github.com/azigler/esdi/releases/tag/v1.2.0)
- [x] Implement channel Events and `event` Command
- [ ] Add `victory-garden` channel Event and `vg` Command
- [ ] Write Event tutorials
- [ ] Require Command aliases to be unique
- [ ] Expand Command cooldowns
- [ ] Expand channel Event intervals
- [ ] Expand Command permissions
- [ ] Improve prefix customization
- [ ] Add `kudos` and `me` Commands
- [ ] Add more server management functionality

## Credits :horse_racing:

Esdi is created and maintained by [Andrew Zigler](https://ko-fi.com/andrewzigler), who can be reached on [Twitter](https://twitter.com/andrewzigler) and [Discord](https://discord.gg/HTSYNQrXam).

Esdi is made possible by [discord.js](https://discord.js.org/) and [project supporters](https://ko-fi.com/andrewzigler).

## Contributing :inbox_tray:

Feedback and contributions are encouraged! After reading our [Code of Conduct](./.github/CODE_OF_CONDUCT.md), use the [Bug Report](https://github.com/azigler/esdi/issues/new?assignees=&labels=bug&template=bug-report.md&title=) and [Feature Request](https://github.com/azigler/esdi/issues/new?assignees=&labels=enhancement&template=feature-request.md&title=) issue templates to discuss any bugs or contributions to Esdi. For more information, please read our [Contributing Guide](./.github/CONTRIBUTING.md).