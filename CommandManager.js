import Manager from "./utils/Manager"

export default class CommandManager extends Manager {
	constructor(master) {
		super()
		this.master = master
	}

	get address() {
		const addr = []
		let node = this.master
		do {
			addr.unshift(node.keywords[0])
			node = node.parentCmd
		} while (node)
		return addr
	}

	recursiveFind(address = [], index = 0) {
		if (this.length == 0 || address.length == 0) return []
		const node = address[index]
		const founds = []
		for (let i = 0; i < this.length; i++) {
			const command = this[i]
			if (command.keywords.includes(node)) {
				if (index == address.length - 1) {
					founds.push(command, ...command.childs.recursiveFind(address, 0))
				}
				founds.push(...command.childs.recursiveFind(address, index + 1))
			} else {
				founds.push(...command.childs.recursiveFind(address, index))
			}
		}
		return founds
	}

	forEach(callbackFn) {
		for (let i = 0; i < this.length; i++) {
			callbackFn(this[i], i, this)
			this[i].childs.forEach(callbackFn)
		}
	}

	async add(command) {
		command.id = command.keywords[0]
		if (this.get(command.id))
			throw new Error(`Keyword "${command.id}" is used by other commands, please use another name`)
		command.parentCmd = this.master
		await command.load()
		super.push(command)
	}
}
