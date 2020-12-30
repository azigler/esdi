We can use interval Events when we want Esdi to handle regular routines and scheduled processes. 

Like Hooks, interval Events are tied to a specific context that the Esdi bot can see. For this example, we're going to look at an interval Event that posts a message embed to a channel at a regular interval. This embed has information about the server process, like it's processor and memory usage, uptime, and Esdi version.

The {@link Event.process-monitor|`process-monitor` Event} is included in [`v1.3.0`](https://github.com/azigler/esdi/releases/tag/v1.3.0) and higher and you can see the code for it [here](events_process-monitor.js.html). Please refer to this code as we look at the different parts of the global interval Event.

**By the way, if you just want to use the pre-existing {@link Event.process-monitor|`process-monitor` global interval Event}, use the `esdi!event process-monitor` Command to enable it in the channel where you want it to post.**

An interval Event has a `handler()` function that will fire every designated `interval`, and it can also have `enable()` and `disable()` functions that handle the toggling of the Event for the specified context. The `process-monitor` Event has a global context, since it outputs information related to the actual process on its host machine. But an interval Event can be contextually linked to guilds and channels, as well.

The `interval` is a string defined on the Event. If the `interval` is omitted, it defaults to 24 hours (`1d`). The interval string is parsed to determine the interval. For example, `30m` will fire every thirty minutes, `1h20m` will fire every hour and twenty minutes (the same as `80m`). And `1d2h3m4s` will fire every day, two hours, three minutes, and four seconds. So if it fires at 12:00:00pm then the next time it fires will be 2:03:04pm the following day. **With this flexibility, you can set virtually any interval.**

For the interval Event to fire, you need to enable it. That's why we have the {@link Command.event|`event`} command. This command lists all enabled Events for this context (e.g., `esdi!event`), toggles the one provided (e.g., `esdi!event process-monitor`), or lists all Events that can be enabled (e.g., `esdi!event list`).

When an interval Event is enabled, its `enable()` function is fired if it has one. Any provided arguments are also passed to this function.

If you want to disable the interval Event later on, you can simply use the `esdi!event process-monitor` command again. This also triggers the optional `disable()` function.

**If the interval Event isn't enabled, then the `handler()` function will not fire when the interval elapses. Don't forget to enable your Event!**

If an interval Event has *never* fired before for the context when it's enabled, it will fire on the next server loop. If an interval Event is enabled and its interval has passed since it last fired (even if it was disabled for some or all of that time), then it will fire on the next server loop. For example, if an interval Event has an interval of `1h` and it's turned off for two hours, when it's turned back on it will fire the next server loop.

You can see when an interval Event was last fired by checking the information provided by the `esdi!event` Command. This will tell you what arguments were provided when the interval Event was enabled and the last time it has fired.

For our example, the `process-monitor` interval Event can handle a custom interval provided as an argument, so you can set a custom interval for it to post its message embed:

![](https://user-images.githubusercontent.com/7295363/103381516-e27d0900-4aa0-11eb-8241-41c86e2aaff7.png)

And if you wanted to check the arguments you provided to enable the interval Event, you can review them with `esdi!event`:

![](https://user-images.githubusercontent.com/7295363/103381510-e0b34580-4aa0-11eb-88be-99f6d1b1d40f.png)

This particular interval Event posts a message embed that looks like this:

![](https://user-images.githubusercontent.com/7295363/103381834-c75ec900-4aa1-11eb-955d-cb7d0129ce18.png)

You can use this as a guide for your own interval Event ideas!