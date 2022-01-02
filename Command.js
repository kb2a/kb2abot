import NodeCache from "node-cache"
import Manager from "./util/Manager.js"

/**
 * Command options to use to pass through Command constructor
 * @typedef {object} CommandOptions
 * @property {Plugin} plugin Plugin instance
 * @property {string} [parentCmd=undefined] Internal variable to use to create recursive commands inside commands so you don't need to pass this
 * @property {boolean} [isPrimary=false] To distinguish, primary commands hold non-primary commands so each plugin should have only 1 primary command
 */

/** Class representing a Command */
class Command extends Manager {
	/**
	 * Create a Command
	 * @param  {CommandOptions}	[options={}]	The options to create Command
	 */
	constructor(options = {}) {
		super(options)
		/** Make sure this class is not created by js built-in function like .map, .filter, ...  */
		if (!this.isManager) return
		const {plugin, parentCmd, isPrimary = false} = options
		this.plugin = plugin
		this.parentCmd = parentCmd
		this.cache = new NodeCache({
			stdTTL: 600
		})
		this.isPrimary = isPrimary
	}

	/**
	 * Get the address array of this command
	 * @type {Array<string>}
	 */
	get address() {
		const addr = []
		let node = this
		do {
			addr.unshift(node.keywords[0])
			node = node.parentCmd
		} while (node && !node.isPrimary)
		return addr
	}

	/**
	 * Recursively get the sum length of all child commands in this command
	 * @readonly
	 * @type {number}
	 */
	get childLength() {
		let count = 0
		this.forEach(() => {
			++count
		})
		return count
	}

	/**
	 * Recursively find all child commands
	 * @param  {Array}       [address=[]]  The command address
	 * @param  {number}      [index=0]     Internal variable to use to do recursive stuff, don't need to understand
	 * @return {Command[]}      Array of commands found
	 */
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

	/**
	 * Provide .forEach js built-in function like (with recursive)
	 * @param  {function} callbackFn  Callback function with params(item, index, thisArray)
	 */
	forEach(callbackFn) {
		for (let i = 0; i < this.length; i++) {
			callbackFn(this[i], i, this)
			this[i].forEach(callbackFn)
		}
	}

	/**
	 * Add child commands to this command
	 * @async
	 * @param  {...Command} commands  One or more commands
	 * @return {Promise} Promise no return
	 */
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

	/**
	 * Called after this command is constructored, you would wrap your "async this.add(command)" in this function in order to load commands in synchronous
	 * @async
	 * @return {Promise}
	 */
	async load() {}

	/**
	 * Called when user hits command
	 * @async
	 * @abstract
	 * @param  {Thread} thread   Instance of Thread class
	 * @param  {Object} message 	 Message object, each messenger platform may be different
	 * @param  {function} reply    Pass "reply" function from "./deploy/facebook/hook.js"
	 * @param  {api} api      The API of messenger-platform you used
	 * @return {string} Message you want to reply, you can use the "reply" function to reply but return will do it faster and support most of messenger-platforms
	 */
	onCall(thread, message, reply, api) {}
}

export default Command
