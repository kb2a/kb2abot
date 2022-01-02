import {join} from "path"
import {fileURLToPath} from "url"
import {existsSync, readFileSync, writeFileSync} from "fs"
import YAML from "yaml"
import deepExtend from "deep-extend"
import getCallerFile from "get-caller-file"
import Manager from "./util/Manager.js"

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
		this.configDir = fileURLToPath(join(getCallerFile(), "..", configDir))
		this.userdataDir = fileURLToPath(join(getCallerFile(), "..", userdataDir))
		if (!existsSync(this.configDir) || !existsSync(this.userdataDir)) {
			console.log(this.configDir, this.userdataDir)
			throw new Error("Config or userdata directory is not exists!")
		}
	}

	/**
	 * Get plugin's configuration search in this.configDir
	 * @param  {Plugin}  plugin  Instance of class Plugin
	 * @return {object}  The plugin's config
	 */
	getConfig(plugin) {
		const file = `${plugin.package.name}@${plugin.package.author}.config.yaml`
		const configPath = join(this.configDir, file)
		if (!existsSync(configPath)) {
			writeFileSync(configPath, "")
			return {}
		}
		return YAML.parse(readFileSync(configPath).toString()) || {}
	}

	/**
	 * Get plugin's userdata search in this.userdataDir, userdata is more like datastore for plugin
	 * @param  {Plugin}    plugin  [description]
	 * @return {object}    Userdata
	 */
	getUserdata(plugin) {
		const file = `${plugin.package.name}@${plugin.package.author}.userdata.yaml`
		const userdataPath = join(this.userdataDir, file)
		if (!existsSync(userdataPath)) {
			writeFileSync(userdataPath, "")
			return {}
		}
		return YAML.parse(readFileSync(userdataPath).toString()) || {}
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
				plugin.id = `${plugin.package.name}@${plugin.package.author}`
				if (this.get(plugin.id))
					throw new Error(`Plugin "${plugin.id}" is already added`)
				return plugin.load()
			})
		)
		for (const plugin of plugins) {
			plugin.config = deepExtend(plugin.configTemplate, this.getConfig(plugin))
			plugin.userdata = deepExtend(
				plugin.userdataTemplate,
				this.getUserdata(plugin)
			)
		}
		this.push(...plugins)
	}
}

export default PluginManager
