A global Hook is tied to the Esdi server itself, not any particular channel. **All global Hooks are disabled by default and must fire their `init()` function to become enabled.** For this example, we're going to look at a Hook that redeploys the Esdi instance after receiving a GitHub webhook.

The {@link Hook.github-redeploy|`github-redeploy` Hook} is included in [`v1.1.0`](https://github.com/azigler/esdi/releases/tag/v1.1.0) and higher, and you can see the code for it [here](hooks_github-redeploy.js.html). Please refer to this code as we look at the different parts of the global Hook.

**By the way, if you just want to use the pre-existing {@link Hook.github-redeploy|`github-redeploy` Hook}, implement the `{@link HookController#configureGitHubRedeploy}` method to fire after starting the server.** The following is an example:

```js
// ... setup

server.start()

server.controllers.get('HookController').configureGitHubRedeploy({
  repo: 'your-url-to-github-repo',
  command: 'pm2 restart esdi-dev',
  path: '~/esdi-dev',
  secret: 'your-github-webhook-secret'
})
```

The `{@link HookController#configureGitHubRedeploy}` method is just a wrapper around `init()` for {@link Hook.github-redeploy|`github-redeploy`}.

Now, on to examining {@link Hook.github-redeploy|`github-redeploy`}. The Hook has a function called `init()` that will return a [hapi route object](https://hapi.dev/tutorials/routing/) to configure the Hook for the server. 

The `init()` method can take any set of arguments that the developer (that's you) might need to have the desired result. Long story short: pass in what you need. If you need nothing, pass in nothing (e.g., `init()`). Let's look at the arguments this particular `init()` method takes:

```js
init({ repo, secret, command, path, reset, link }) { // ... }
```

The `repo` argument is the GitHub repository URL. If your repository is private, then you will need to include authentication in the URL (e.g., if your username is `andrew`, your password is `sunflower`, and your private repository is `my-esdi` then `repo` should be `https://andrew:sunflower@github.com/andrew/my-esdi`). If you need to escape any special characters in your password (e.g., `!`) then be sure to escape them with a slash (e.g., `\!`).

Next, if you have a secret for your GitHub webhook (recommended), include it as `secret` *(optional)*.

The `command` argument is the terminal command you want to fire to redeploy your server (e.g., `pm2 restart esdi`).

The project directory is `path`.

The `reset` argument *(optional)* decides whether or not to invoke `git reset --hard` for a force update. This is a personal preference. If you are actively developing on your live server directory files, then you should keep `reset` as `false`, which it is by default. Setting it to `true` means the repository files will reset to match the most updated version of the repository, which will overwrite any local pending changings.

The `link` argument *(optional)* decides whether or not to link a local copy of Esdi to this repository. This is useful if you have a custom fork of the Esdi framework locally that you would like to use instead of the [`esdi` package](https://www.npmjs.com/package/esdi).

These corresponding arguments demonstrate how the `{@link HookController#configureGitHubRedeploy}` method is just a wrapper around `init()` for {@link Hook.github-redeploy|`github-redeploy`}, as mentioned above.

As described previously, the `init()` method returns the [hapi route object](https://hapi.dev/tutorials/routing/). This object has three required properties: `method`, `path`, and `handler()`. Let's look at this object's properties:

```js
{
  method: 'POST',
  path: '/hook/github-redeploy',
  handler: (request, h) => { // ... }
}
```

The `method` property can be any valid HTTP method, or an array of methods. The `path` property is the relative URL endpoint for this Hook. This would be the relative Hook server path to which any corresponding third-party webhook should send its request. In this case, the `handler()` function is triggered by a `POST` request on the Hook server's `/hook/github-redeploy` path.

The `handler()` function is where the magic happens. This is the function that fires when the `path` receives the specified `method`. Let's look at the `handler()` function for {@link Hook.github-redeploy|`github-redeploy`}:

```js
handler: (request, h) => {
  // helper function that executes the redeploy
  function _exec () {
    const proc = exec(`cd ${path} git fetch ${repo} && ${reset ? 'git reset --hard' : 'git pull'} && npm install${link ? ' && npm link esdi' : ''} && ${command}`)
    proc.stdout.on('data', function (data) {
      console.log(data)
    })
    proc.stderr.on('data', function (error) {
      console.log(error)
    })
    return `Redeployed from repository @ ${new Date()}`
  }
  // helper function that rejects unauthorized requests
  function _unauthorized () {
    return h.response('Unauthorized').code(401)
  }
  if (secret) {
    if (!request.headers['x-hub-signature']) {
      return _unauthorized()
    }
    const sig = `sha1=${crypto.createHmac('sha1', secret).update(JSON.stringify(request.payload)).digest('hex')}`
    if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(request.headers['x-hub-signature']))) {
      return _exec()
    } else {
      return _unauthorized()
    }
  } else {
    return _exec()
  }
}
```

This `handler()` function first checks to see if the incoming payload has encryption and attempts to decrypt it, if so. If the payload is valid, it updates the local repository (`git fetch`), reinstalls packages (`npm install`) and executes a command (or a series of commands) to redeploy the server (`${command}`).

In order for this to work, you need to set up a corresponding [webhook on GitHub](https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/about-webhooks). On your repository, go to "Settings" then go to "Webhooks". Click the "Add webhook" button and set up a new webhook that points to your public Esdi server and its port, at the corresponding `path` from above (e.g., `
http://my-esdi-server.com:8587/hook/github-redeploy`).

Change the "Application type" to `application/json`. If you're using a `secret` in your configuration (recommended), then add it here. If your Hook server is using TLS then make sure to direct the traffic to `https` and enable SSL verification on the webhook. For most use cases, you want to set "Which events would you like to trigger this webhook?" to "Just the `push` event." Here's an example configuration:

![](https://user-images.githubusercontent.com/7295363/101291333-e927a180-37bc-11eb-839f-490da4f2df91.png)

You can use this particular Hook to automatically redeploy your server while developing your own Esdi bot. Depending on your setup, this can be useful for automatically keeping your live bot in sync with your codebase. Otherwise, you can use this as a guide for your own global Hook ideas!

Next, let's [enable the `ko-fi` channel Hook]{@tutorial ko-fi-channel-hook-example} for one of our channels.