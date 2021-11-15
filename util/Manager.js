export default class Manager extends Array {
	#store = {}
	
	constructor(items = []) {
		super()
		for (let i = 0; i < items.length; i++)
			this.push(items[i])
	}

	first() {
		return this[0]
	}

	last() {
		return this[this.length - 1]
	}

	clear() {
		this.splice(0, this.length)
		this.#store = {}
	}

	get(id) {
		return this.#store[id]
	}

	push(...items) {
		for (let i = 0; i < items.length; i++) {
			const item = items[i]
			if (item.id == undefined) {
				console.log(item)
				throw new Error("This item should have \"id\" key")
			}
			if (!this.#store[item.id]) {
				super.push(item)
				this.#store[item.id] = item
			} else {
				throw new Error("This ID is already added: " + item.id)
			}
		}
	}

	remove(id) {
		const itemIndex = this.findIndex(item => item.id == id)
		if (itemIndex != -1) {
			this.splice(itemIndex, 1)
			delete this.#store[id]
		}
	}
}