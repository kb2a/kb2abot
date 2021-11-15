import fs from "fs"
import path from "path"
import NodeCache from "node-cache"
import CommandManager from "./CommandManager"
const importJSON = pathToJson => {
	return JSON.parse(fs.readFileSync(pathToJson))
}
import getDirname from "es-dirname"

export default class Plugin {
	commands = new CommandManager()
	userdata = null // Gets a userdata for this plugin, read through "userdata.json"  (PluginManager auto provide)
	package = null // Gets a description for this plugin, read through "package.json" (PluginManager auto provide)
	config = null // Gets a configuration for this plugin, read through "config.json" (PluginManager auto provide)

	constructor(options = {}) {
		this.cache = new NodeCache({
			stdTTL: 600
		})
	}

	// async loadCommands() {
	// 	if (!this.dataFolder)
	// 		throw new Error("Please use .add method of [class]CommandManager (this.dataFolder is undefined)")
	// 	const commands = this.commands
	// 	this.commands = new CommandManager()
	// 	for (let i = 0; i < commands.length; i++) {
	// 		const Command = await import(path.join(this.dataFolder, commands[i]))
	// 		this.commands.add(new Command())
	// 	}
	// }

	// Returns a value indicating whether or not this plugin is currently enabled
	get isEnabled() {
		return this.enable
	}

	// Called after this plugin is inited but before it has been enabled (like an async constructor)
	async load() {
		// const Command = await import("./...").default
		// await this.commands.add(new Command())
		// const Commands = (await Promise.all([
		// 	import("../.."),
		// 	import("../..")
		// ])).map(mod => mod.default)
	}

	// Called when this plugin is disabled
	onDisable() {}

	// Called when this plugin is enabled
	onEnable() {}

	// Sets the enabled state of this plugin
	setEnable() {}
}
