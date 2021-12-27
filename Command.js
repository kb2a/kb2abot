import NodeCache from "node-cache"
import Manager from "./util/Manager"

export default class Command extends Manager {
	constructor(options = {}) {
		super(options)
		if (!this.isManager) return
		const {plugin, parentCmd, isPrimary} = options
		this.plugin = plugin
		this.parentCmd = parentCmd
		this.cache = new NodeCache({
			stdTTL: 600
		})
		this.isPrimary = isPrimary
	}

	get address() {
		const addr = []
		let node = this
		do {
			addr.unshift(node.keywords[0])
			node = node.parentCmd
		} while (node && !node.isPrimary)
		return addr
	}

	get childLength() {
		let count = 0
		this.forEach(() => {
			++count
		})
		return count
	}

	recursiveFind(address = [], index = 0) {
		if (this.length == 0 || address.length == 0) return []
		const node = address[index]
		const founds = []
		for (let i = 0; i < this.length; i++) {
			const command = this[i]
			if (command.keywords.includes(node)) {
				if (index == address.length - 1) {
					founds.push(command, ...command.recursiveFind(address, 0))
				}
				founds.push(...command.recursiveFind(address, index + 1))
			} else {
				founds.push(...command.recursiveFind(address, index))
			}
		}
		return founds
	}

	forEach(callbackFn) {
		for (let i = 0; i < this.length; i++) {
			callbackFn(this[i], i, this)
			this[i].forEach(callbackFn)
		}
	}

	async add(...commands) {
		await Promise.all(
			commands.map(command => {
				command.id = command.keywords[0]
				if (this.get(command.id))
					throw new Error(
						`Keyword "${command.id}" is used by other commands, please use another name`
					)
				command.plugin = this.plugin
				command.parentCmd = this
				command.isPrimary = false
				return command.load()
			})
		)
		this.push(...commands)
	}

	// Called after this command is inited (like an async constructor)
	async load() {}

	// overide
	onCall(sender, args, sendMessage) {}
}
