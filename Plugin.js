import NodeCache from "node-cache"
import Command from "./Command"

export default class Plugin {
	commands = new Command({
		plugin: this,
		isPrimary: true
	});

	package = {}; // Add your parsed package.json to this field. Ex: JSON.parse(readFileSync("package.json"))
	config = {}; // Gets a configuration for this plugin, read through "config.json" (PluginManager auto provide)
	userdata = {}; // Gets a userdata for this plugin, read through "userdata.json"  (PluginManager auto provide)

	configTemplate = {};
	userdataTemplate = {};

	constructor(options = {}) {
		this.cache = new NodeCache({
			stdTTL: 600
		})
	}

	// Returns a value indicating whether or not this plugin is currently enabled
	get isEnabled() {
		return this.enable
	}

	get isInternal() {
		return this.package && this.package.name == "kb2abot-plugin-internal"
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
