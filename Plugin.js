import fs from "fs"
import path from "path"
const importJSON = pathToJson => {
	return JSON.parse(fs.readFileSync(pathToJson))
}
import getDirname from "es-dirname"

export default class Plugin {
	constructor(options) {
		this.config = null
		this.cache = {}
	}

	// Gets a userdata for this plugin, read through "userdata.json"
	getUserdata() {
		if (!this.cache.userdata)
			this.cache.userdata = importJSON(
				path.join(this.getDataFolder(), "userdata.json")
			)
		return this.cache.userdata
	}

	// Gets a description for this plugin, read through "package.json"
	getDescription() {
		if (!this.cache.description)
			this.cache.description = importJSON(
				path.join(this.getDataFolder(), "package.json")
			)
		return this.cache.description
	}

	// Returns the folder that the plugin data's files are located in.
	getDataFolder() {
		if (!this.cache.dataFolder) this.cache.dataFolder = getDirname()
		return this.cache.dataFolder
	}

	// Returns a value indicating whether or not this plugin is currently enabled
	isEnabled() {}

	// Called when this plugin is disabled
	onDisable() {}

	// Called when this plugin is enabled
	onEnable() {}

	// Called after a plugin is loaded but before it has been enabled.
	onLoad() {}

	// Sets the enabled state of this plugin
	setEnable() {}
}
