/**
 * Màu mè, hoa lá cho terminal<br>
 * Hướng dẫn sử dụng:<br>
 * <code>import {Logger, initLogger} from "./console.util.js"</code>
 * @module CONSOLE
 */
import chalk from "chalk"
import objectPath from "object-path"

let prefixTag = []

export function setPrefix(prefix, opts = []) {
	return prefixTag = [
		prefix,
		opts
	]
}

export function log(messageOpts, tags = []) {
	const defaultFn = () => "null"
	if (prefixTag.length > 0)
		tags = [].concat(prefixTag, tags)
	const prefix = tags.map(tag => objectPath.get(chalk, tag[1].join("."), defaultFn)(tag[0])).join(" ")
	const message = objectPath.get(chalk, messageOpts[1].join("."), defaultFn)(messageOpts[0])
	console.log(prefix + " " + message)
}

export function debug(message, tags = []) {
	log([
		message,
		["cyan"]
	], [].concat([
		"DEBUG",
		["white", "bgCyan"]
	], tags))
}

export function error(message, tags = []) {
	log([
		message,
		["white"]
	], [].concat([
		"ERROR",
		["white", "bgRed"]
	], tags))
}

export function done(message, tags) {
	log([
		message,
		["green"]
	], [].concat([
		"DONE",
		["white", "bgGreen"]
	], tags))
}

export function success(message, tags) {
	log([
		message,
		["green"]
	], [].concat([
		"DONE",
		["white", "bgGreen"]
	], tags))
}

export function warn(message, tags) {
	log([
		message,
		["yellow"]
	], [].concat([
		"DONE",
		["white", "bgYellow"]
	], tags))
}

export const setTerminalTitle = text => {
	process.stdout.write(
		`${String.fromCharCode(27)}]0${text}${String.fromCharCode(7)}`
	)
}
