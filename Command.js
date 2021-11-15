// import fs from "fs"
// import path from "path"
// const importJSON = pathToJson => {
// 	return JSON.parse(fs.readFileSync(pathToJson))
// }
// import getDirname from "es-dirname"
import NodeCache from "node-cache"
import translate from "./util/translate"
import CommandManager from "./CommandManager"

export default class Command {
	childs = new CommandManager(this)

	constructor(options = {}) {
		const { plugin, parentCmd } = options
		this.plugin = plugin
		this.parentCmd = parentCmd
		this.cache = new NodeCache({
			stdTTL: 600
		})
	}

	// Called after this command is inited (like an async constructor)
	async load() {
		// const Command = (await import("../..")).default
		// await this.childs.add(new Command())
	}

	// overide
	onCall(sender, args, sendMessage) {}

	getMetadata(locale = process.env.DEFAULT_LOCALE) {
		const metadata = this.cache.get("metadata")
		if (metadata)
			return metadata
		this.cache.set("metadata", {
			keywords: [],
			description: translate("description", locale),
			usage: translate("usage", locale)
		})
	}
}
