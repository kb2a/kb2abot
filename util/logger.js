/**
 * Màu mè, hoa lá cho terminal<br>
 * Hướng dẫn sử dụng:<br>
 * <code>import {Logger, initLogger} from "./console.util.js"</code>
 * @module CONSOLE
 */
import {Chalk} from "chalk"
import supportsColor from "supports-color"

let chalk = new Chalk({level: 0})

if (supportsColor.stderr.has16m) chalk = new Chalk({level: 3})
else if (supportsColor.stdout.has256) chalk = new Chalk({level: 2})
else if (supportsColor.stdout) chalk = new Chalk({level: 1})

let prefixTag = []

export class Label {
	constructor(message, chalkOptions) {
		this.message = message
		this.options = chalkOptions
	}

	get chalkFunc() {
		return recursiveRef(chalk, this.options)
	}

	get text() {
		if (this.message) {
			let message
			if (isError(this.message)) message = this.message.stack
			else
				message =
					typeof this.message == "object"
						? JSON.stringify(this.message, null, 2)
						: this.message

			return this.chalkFunc(message)
		}
		return ""
	}
}

function chalkLog(...objects) {
	console.log(
		[]
			.concat(prefixTag, objects)
			.map(label => label.text)
			.join(" ")
	)
}

export function setPrefix(prefix, opts = []) {
	return (prefixTag = [new Label(prefix, opts)])
}

export function log(...messages) {
	chalkLog(
		...messages.map(message =>
			message instanceof Label ? message : new Label(message, ["white"])
		)
	)
}

export function debug(...messages) {
	chalkLog(
		new Label("DEBUG", ["white", "bgCyan"]),
		...messages.map(message =>
			message instanceof Label ? message : new Label(message, ["cyan"])
		)
	)
}

export function error(...messages) {
	chalkLog(
		new Label("ERROR", ["white", "bgRed"]),
		...messages.map(message =>
			message instanceof Label ? message : new Label(message, ["red"])
		)
	)
}

export function done(...messages) {
	chalkLog(
		new Label("DONE", ["white", "bgGreen"]),
		...messages.map(message =>
			message instanceof Label ? message : new Label(message, ["green"])
		)
	)
}

export function success(...messages) {
	chalkLog(
		new Label("SUCCESS", ["white", "bgGreen"]),
		...messages.map(message =>
			message instanceof Label ? message : new Label(message, ["green"])
		)
	)
}

export function warn(...messages) {
	chalkLog(
		new Label("WARN", ["white", "bgYellow"]),
		...messages.map(message =>
			message instanceof Label ? message : new Label(message, ["yellow"])
		)
	)
}

export function setTerminalTitle(text) {
	process.stdout.write(
		`${String.fromCharCode(27)}]0${text}${String.fromCharCode(7)}`
	)
}

export function isError(errObj) {
	return Boolean(errObj.message && errObj.stack && errObj.message)
}

function recursiveRef(object, address) {
	if (address.length <= 1) return object[address[0]]
	return recursiveRef(object[address[0]], address.slice(1))
}
