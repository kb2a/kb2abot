<h1 align="center">
	<a href="#"><img src="https://i.imgur.com/u6eJA84.png" alt="susbot"></a>
</h1>
<p align="center">
	<img alt="size" src="https://img.shields.io/github/repo-size/susbot/susbot.svg?style=flat-square&label=size">
	<img alt="code-version" src="https://img.shields.io/badge/dynamic/json?color=red&label=code%20version&prefix=v&query=%24.version&url=https://raw.githubusercontent.com/kb2ateam/kb2abot/main/package.json&style=flat-square">
	<a href="https://github.com/susbot/susbot/commits"><img alt="commits" src="https://img.shields.io/github/commit-activity/m/susbot/susbot.svg?label=commit&style=flat-square"></a>
	<a href="https://www.codefactor.io/repository/github/kb2ateam/kb2abot"><img src="https://www.codefactor.io/repository/github/kb2ateam/kb2abot/badge" alt="CodeFactor" /></a>
</p>

## About

kb2abot is a powerful [Node.js](https://nodejs.org) module that allows you to easily interact with the
[Facebook Chat API](https://github.com/Schmavery/facebook-chat-api) and more!

- Object-oriented
- Performant
- Easy to use

## Installation

**Node.js 16.6.0 or newer is required.**  
```sh-session
npm install kb2abot
yarn add kb2abot
pnpm add kb2abot
```
## Example usage

Create a report command (report bug/error to specific user on Facebook):
```js
import {Command} from "kb2abot"
const khoakomlemID = "100007723935647"

class Report extends Command {
	keywords = ["report", "bug"];
	description = "report bug/error to admin";
	guide = "<message>";
	permission = {
		"*": "*"
	};

	// Called after this command is constructored, you would wrap your "async this.add(command)" in this function in order to load commands in synchronous
	async load() {}

	// Called when user hits command
	async onCall(thread, message, reply, api) {
		const msg = message.args[0]
		if (msg.length > 0) {
			await api.sendMessage(`"${msg}"\n\n-ID: ${message.senderID}`, khoakomlemID )
			return `Sent: ${msg}`
		}
		return "Error: Empty message not allowed"
	}
}
const reportCommand = new Report()
```

Afterwards we add that **command** to a **plugin**:
```js
import {readFileSync} from "fs"
import {resolve} from "url"
import {Plugin} from "kb2abot"
import configTemplate from "./template/config"
import userdataTemplate from "./template/userdata"

class MyPlugin extends Plugin {
	package = JSON.parse(
		readFileSync(new URL(resolve(import.meta.url, "package.json")))
	);
	configTemplate = configTemplate;
	userdataTemplate = userdataTemplate;

	// Called after this plugin is constructored (you would wrap your "async this.commands.add(command)" in this function in order to load commands in synchronous)
	async load() {
		// Add report command to this plugin
		await this.commands.add(reportCommand)
	}

	// Called when this plugin is disabled
	async onDisable() {}

	// Called when this plugin is enabled
	async onEnable() {}
}
const myPlugin = new MyPlugin()
```
And we add that **plugin** to a **plugin manager**
```js
import {PluginManager} from "kb2abot"
const configDirectory = "./someconf" // Store the plugin's configs (use relative path to your current file, not process.cwd())
const userdataDirectory = "./somedata" // Store the plugin's userdata (use relative path to your current file, not process.cwd())
const pluginManager = new PluginManager(configDirectory, userdataDirectory)
await pluginManager.add(myPlugin)
```
Finally, now we going to add  **pluginManager** to hook function:
```js
import {Deploy} from "kb2abot"
const botOptions = JSON.parse(fs.readFileSync("./bots/bot.js"))
```
This is options of your bot (see example template at [example-bot.js](https://github.com/kb2ateam/kb2abot-bootloader/bots/example-bot.js))
```js
const client = await Deploy.facebook(botOptions.credential, {
	apiOptions: botOptions.fcaOptions,
	pluginManager: pluginManager
})
```
All done! Now, imagine a user sending a message with body: "/report Hello admin", the bot will reply "Sent: Hello admin". Now you can code what you want and create a wonderful bot 🌟
## Links

- [Documentation](https://kb2ateam.github.io/kb2abot-core/)
- [npm](https://www.npmjs.com/package/kb2abot)

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested
See [the contribution guide](https://github.com/kb2ateam/kb2abot/blob/main/.github/CONTRIBUTING.md) if you'd like to submit a PR.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please don't hesitate to join our community [KB2A Community](https://discord.gg/djs).