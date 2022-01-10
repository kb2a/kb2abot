/**
 * Màu mè, hoa lá cho terminal<br>
 * Hướng dẫn sử dụng:<br>
 * <code>import {Logger, initLogger} from "./console.util.js"</code>
 * @module CONSOLE
 */
import chalk from "chalk"

let prefixTag = []
const defaultFn = () => "null"

export class ChalkObject {
	constructor(message, chalkOptions) {
		this.message = message
		this.options = chalkOptions
	}

	get isObject() {
		return typeof this.message == "object"
	}

	get isError() {
		return this.message && this.message.stack && this.message.message
	}

	get chalkFunc() {
		return recursiveGet(chalk, this.options, defaultFn)
	}

	get chalkText() {
		if (this.message) {
			let message
			if (this.isError) message = this.message.stack
			else
				message = this.isObject
					? JSON.stringify(this.message, null, 2)
					: this.message

			return this.chalkFunc(message)
		}
		return ""
	}
}

export function setPrefix(prefix, opts = []) {
	return (prefixTag = [new ChalkObject(prefix, opts)])
}

function chalkLog(...objects) {
	// console.log(getCallerFile(3), 111)
	const prefixText = prefixTag.map(prefix => prefix.chalkText).join(" ")
	let logText = ""
	for (const chalkObject of objects) {
		if (chalkObject.isObject) {
			logText += chalkObject.chalkText + "\n\n"
		} else {
			logText += chalkObject.chalkText + " "
		}
	}
	console.log(prefixText, logText)
}

function recursiveGet(object, address) {
	if (address.length <= 1) {
		return object[address[0]]
	}
	return recursiveGet(object[address[0]], address.slice(1))
}

export function log(...messages) {
	chalkLog([
		messages.map(message => {
			return [message, ["white"]]
		})
	])
}

export function debug(...messages) {
	chalkLog(
		new ChalkObject("DEBUG", ["white", "bgCyan"]),
		...messages.map(message => new ChalkObject(message, ["cyan"]))
	)
}

export function error(...messages) {
	chalkLog(
		new ChalkObject("ERROR", ["white", "bgRed"]),
		...messages.map(message => new ChalkObject(message, ["red"]))
	)
}

export function done(...messages) {
	chalkLog(
		new ChalkObject("DONE", ["white", "bgGreen"]),
		...messages.map(message => new ChalkObject(message, ["green"]))
	)
}

export function success(...messages) {
	chalkLog(
		new ChalkObject("SUCCESS", ["white", "bgGreen"]),
		...messages.map(message => new ChalkObject(message, ["green"]))
	)
}

export function warn(...messages) {
	chalkLog(
		new ChalkObject("WARN", ["white", "bgYellow"]),
		...messages.map(message => new ChalkObject(message, ["yellow"]))
	)
}

export function setTerminalTitle(text) {
	process.stdout.write(
		`${String.fromCharCode(27)}]0${text}${String.fromCharCode(7)}`
	)
}
