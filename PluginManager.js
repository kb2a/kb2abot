import fs from "fs"
import path from "path"
import safeStringify from "fast-safe-stringify"
import Manager from "./util/Manager.js"
import {readJSON} from "./util/common.js"

/** Class representing a PluginManager - A Manager for plugins */
class PluginManager extends Manager {
	/**
	 * Constructor with init directories
	 * @param  {string}    configDir    The config directory* (*: if use relative path, it won't use process.cwd() to join, it use your current __dirname or import.meta.url)
	 * @param  {string}    userdataDir  The userdata directory*
	 */
	constructor(configDir, userdataDir) {
		super(configDir)
		/** Make sure this class is not created by js built-in function like .map, .filter, ...  */
		if (!this.isManager) return
		this.configDir = path.join(process.cwd(), configDir)
		this.userdataDir = path.join(process.cwd(), userdataDir)
		if (!fs.existsSync(this.configDir) || !fs.existsSync(this.userdataDir))
			throw new Error(
				`Config or userdata directory is not exists: (${this.configDir}, ${this.userdataDir})`
			)
	}

	datastoreInf(plugin) {
		const {name, author, version} = plugin.package
		const identify = `${name}@${author}@${version}`
		return {
			identify,
			config: path.join(this.configDir, `${identify}.config.json`),
			userdata: path.join(this.userdataDir, `${identify}.userdata.json`)
		}
	}

	/**
	 * Get plugin's configuration and userdata search in this.configDir and this.userdataDir
	 * @param  {Plugin}  plugin  Instance of class Plugin
	 * @return {object}  The plugin's config and userdata
	 */
	readDatastore(plugin) {
		const dinf = this.datastoreInf(plugin)
		return {
			config: fs.existsSync(dinf.config) ? readJSON(dinf.config) : {},
			userdata: fs.existsSync(dinf.userdata) ? readJSON(dinf.userdata) : {}
		}
	}

	/**
	 * Save plugin config to local file
	 */
	saveDatastore(plugin) {
		const dinf = this.datastoreInf(plugin)
		const {config, userdata} = plugin.preSaveDatastore(
			plugin.config,
			plugin.userdata
		)
		// Remove the circular structure
		const replacer = (key, value) =>
			value === "[Circular]" ? undefined : value
		fs.writeFileSync(dinf.config, safeStringify(config, replacer, "\t"))
		fs.writeFileSync(dinf.userdata, safeStringify(userdata, replacer, "\t"))
	}

	/**
	 * Add plugin(s) to this Manager
	 * @async
	 * @param  {Plugin} plugins  One or more plugins you want to add
	 * @return {Promise}
	 */
	async add(...plugins) {
		if (Array.isArray(plugins[0])) plugins = plugins[0]
		await Promise.all(
			plugins.map(plugin => {
				if (!plugin.package)
					throw new Error(
						`Missing field "package" for plugin with constructor name: "${plugin.constructor.name}", you need to add your parsed package.json`
					)
				plugin.id = this.datastoreInf(plugin).identify
				if (this.get(plugin.id))
					throw new Error(`Plugin "${plugin.id}" is already added`)
				return plugin.load()
			})
		)
		for (const plugin of plugins) {
			const {config: rawConfig, userdata: rawUserdata} = this.readDatastore(
				plugin
			)
			const {config, userdata} = plugin.handleDatastore(rawConfig, rawUserdata)
			plugin.config = config
			plugin.userdata = userdata
			this.saveDatastore(plugin)
		}
		this.push(...plugins)
	}
}

export default PluginManager
