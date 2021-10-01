import fs from "fs"
import path from "path"
const importJSON = pathToJson => {
	return JSON.parse(fs.readFileSync(pathToJson))
}
import getDirname from "es-dirname"
import translate from "util/translate.js"

export default class Command {
	constructor(options) {
		const { plugin } = options
		this.plugin = plugin
		this.cache = {}
	}

	// overide
	onCall(sender, args, sendMessage) {}

	getMetadata(locale = process.env.DEFAULT_LOCALE) {
		if (this.cache.metadata)
			return this.cache.metadata
		this.cache.metadata = {
			keywords: [],
			description: translate("description", locale),
			usage: translate("usage", locale)
		}
	}
}
