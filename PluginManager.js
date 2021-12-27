import {join} from "path"
import {existsSync, readFileSync, writeFileSync} from "fs"
import {fileURLToPath} from "url"
import Manager from "./util/Manager"
import getCallerFile from "get-caller-file"
import deepExtend from "deep-extend"
import YAML from "yaml"

export default class PluginManager extends Manager {
	constructor(configDir, userdataDir) {
		super(configDir)
		if (!this.isManager) return
		this.configDir = fileURLToPath(join(getCallerFile(), "..", configDir))
		this.userdataDir = fileURLToPath(join(getCallerFile(), "..", userdataDir))
		if (!existsSync(this.configDir) || !existsSync(this.userdataDir)) {
			console.log(this.configDir, this.userdataDir)
			throw new Error("Config or userdata directory is not exists!")
		}
	}

	getConfig(plugin) {
		const file = `${plugin.package.name}@${plugin.package.author}.config.yaml`
		const configPath = join(this.configDir, file)
		if (!existsSync(configPath)) {
			writeFileSync(configPath, "")
			return {}
		}
		return YAML.parse(readFileSync(configPath).toString()) || {}
	}

	getUserdata(plugin) {
		const file = `${plugin.package.name}@${plugin.package.author}.userdata.yaml`
		const userdataPath = join(this.userdataDir, file)
		if (!existsSync(userdataPath)) {
			writeFileSync(userdataPath, "")
			return {}
		}
		return YAML.parse(readFileSync(userdataPath).toString()) || {}
	}

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
