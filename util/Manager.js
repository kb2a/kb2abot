/**
 * class Manager to store items like Array but more convenient
 * @extends Array
 */
class Manager extends Array {
	#store = {};

	constructor(length) {
		if (Number.isInteger(length)) {
			// because of built-in .map invoke this constructor
			super(length)
			this.isManager = false
		} else {
			super()
			this.isManager = true
		}
	}

	/**
	 * Get first item of manager
	 * @return {object} First item
	 */
	first() {
		return this[0]
	}

	/**
	 * Get last item of manager
	 * @return {object} Last item
	 */
	last() {
		return this[this.length - 1]
	}

	/**
	 * Remove all items in manager
	 */
	clear() {
		this.splice(0, this.length)
		this.#store = {}
	}

	/**
	 * Get item by its ID
	 * @param  {string} id  ID of item
	 * @return {object} item
	 */
	get(id) {
		return this.#store[id]
	}

	/**
	 * Add an item to manager unique by ID
	 * @param  {...object} items  Item(s)
	 */
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

	/**
	 * Remove an item in manager
	 * @param  {string} id  Item's ID
	 */
	remove(id) {
		const itemIndex = this.findIndex(item => item.id == id)
		if (itemIndex != -1) {
			this.splice(itemIndex, 1)
			delete this.#store[id]
		}
	}
}

export default Manager
