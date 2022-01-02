/**
 * Common ultility functions<br>
 * @module Common
 */

import fs from "fs"
import fetch from "node-fetch"

/**
 * 
 * Pause the program with promise wrapped
 * @async
 * @param  {Number} time Time to pause (milis)
 * @example
 * console.log("We will log "amogus" after 5s")
 * await asyncWait(5000)
 * console.log("amogus")
 */
export async function asyncWait(milis) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve()
		}, milis)
	})
}

/**
 * Constrain a value in [left; right]
 * @param  {Number} value The value
 * @param  {Number} left  Smallest value
 * @param  {Number} right Biggest value
 * @return {Number} New value in [left; right]
 * @example
 * constrain(5, 1, 10) // => 5
 * constrain(-1, 1, 10) // => -1
 */
export function constrain(value, left, right) {
	return value >= left ? (value <= right ? value : right) : left
}

/**
 * Round the digit to a certain decimal place
 * @param  {Number} number The digit
 * @param  {Number} amount Decimal place
 * @return {Number}        Rounded digit
 * @example
 * round(Math.PI, 2); // => 3.14
 */
export function round(number, amount) {
	return parseFloat(Number(number).toFixed(amount))
}

/**
 * Deep extend
 * @param  {Object} object Parent object
 * @param  {Object} deep Inherit object
 * @return {Object}        Inherited object
 * @example
 * const obj1 = {
 *  a: {
 *    b: true
 *  }
 * };
 * const obj2 = {
 *  a: {
 *    c: "kb2abot"
 *  }
 * }
 * extend(a, b);
 * // { a: { b: "kb2abot", c: true } }
 */
export function extend(obj, deep) {
	let argsStart, deepClone

	if (typeof deep === "boolean") {
		argsStart = 2
		deepClone = deep
	} else {
		argsStart = 1
		deepClone = true
	}

	for (let i = argsStart; i < arguments.length; i++) {
		const source = arguments[i]

		if (source) {
			for (let prop in source) {
				if (deepClone && source[prop] && source[prop].constructor === Object) {
					if (!obj[prop] || obj[prop].constructor === Object) {
						obj[prop] = obj[prop] || {}
						extend(obj[prop], deepClone, source[prop])
					} else {
						obj[prop] = source[prop]
					}
				} else {
					obj[prop] = source[prop]
				}
			}
		}
	}

	return obj
}

/**
 * Calculate the size of the file (in MB)
 * @param  {String} path The path to the file
 * @return {Number}      File size (MB)
 * @example
 * // Example with 1024KB test.txt file
 * getFileSize(__dirname + "/test.txt") // => 1
 */
export function getFileSize(path) {
	let fileSizeInBytes = fs.statSync(path)["size"]
	//Convert the file size to megabytes (optional)
	let fileSizeInMegabytes = fileSizeInBytes / 1000000.0
	return Math.round(fileSizeInMegabytes)
}

/**
 * Convert a number to a special code (according to the English alphabet)
 * @param  {Number} number Number you want to transfer
 * @return {String}        Special code 1 = "o", 2 = "t",...
 * @example
 * numbersToWords(123) // => "oth"
 * numbersToWords(18102004) // => "ogoztzzf"
 */
export function numberToPassword(number) {
	const numbers = ["z", "o", "t", "h", "f", "i", "s", "e", "g", "n"]
	let str = number.toString()
	for (let i = 0; i < 10; i++) {
		str = str.replace(new RegExp(i, "g"), numbers[i])
	}
	return str
}

/**
 *
 * @param  {String|Number} number Format 1 string, number as VNĐ currency
 * @return {String}               VNĐ Currency
 * @example
 * currencyFormat(1234567) // => "1,234,567"
 */
export function currencyFormat(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/**
 * Remove strange characters in text
 * @param  {String} text Some text
 * @return {String}      Clean text
 */
export function removeSpecialChar(str) {
	if (str === null || str === "") return false
	else str = str.toString()

	return str.replace(/[^\x20-\x7E]/g, "")
	// return str;
}

/**
 * Get random value from [start; end]
 * @example
 * import { random } from "kb2abot/util/common.js";
 *
 * random(1, 10) // maybe 3.141592658...
 * // returns a random value from 1 to 10
 *
 * // note: Since this random is not rounded so you should use random with round
 * @example
 * import { random, round } from "kb2abot/util/common.js";
 *
 * round(random(1, 10), 2) // => maybe 3.14
 * // Returns a random value from 1 to 10 and is rounded to the second decimal
 *
 */
export function random(start, end) {
	return Math.floor(Math.random() * (end - start + 1) + start)
}

/**
 * Shuffle the array
 * @param  {Array} arr Array to be shuffled
 * @return {Array}     Shuffled array
 * @example
 * const arr = [1, 2, 3, 4]
 * shuffle(arr) // => [2, 3, 1, 4]
 * console.log(arr) => [2, 3, 1, 4]
 */
export function shuffle(arr) {
	// thuật toán bogo-sort
	let count = arr.length,
		temp,
		index

	while (count > 0) {
		index = Math.floor(Math.random() * count)
		count--
		temp = arr[count]
		arr[count] = arr[index]
		arr[index] = temp
	}

	return arr //Bogosort with no điều kiện dừng
}

/**
 * Verify a https url is valid or not
 * @param  {string} url Https url
 * @return {boolean}    Valid or not
 * @example
 * validURL("https://www.facebook.com/") // => true
 */
export function validURL(str) {
	var pattern = new RegExp(
		"^(https?:\\/\\/)?" + // protocol
		"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
		"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
		"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
		"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
			"(\\#[-a-z\\d_]*)?$",
		"i"
	) // fragment locator
	return !!pattern.test(str)
}

/**
 * Download a file to a path
 * @async
 * @param  {string} url  URL download
 * @param  {string} path Path file
 */
export async function downloadFile(url, path) {
	const res = await fetch(url)
	const fileStream = fs.createWriteStream(path)
	await new Promise((resolve, reject) => {
		res.body.pipe(fileStream)
		res.body.on("error", reject)
		fileStream.on("finish", resolve)
	})
}

/**
 * Convert milis to time string
 * @param  {Number} time milis
 * @return {string} timestring
 * @example
 * convert_to_string_time(123456) // => "2m 4s"
 */
export function convert_to_string_time(time = 0) {
	if (time < 0) time = 0
	const hh = Math.floor(time / 1000 / 60 / 60)
	const mm = Math.floor((time - hh * 60 * 60 * 1000) / 1000 / 60)
	const ss = Math.ceil((time - hh * 60 * 60 * 1000 - mm * 60 * 1000) / 1000)
	let text = `${ss}s`
	if (mm > 0) text = `${mm}m ${text}`
	if (hh > 0) text = `${hh}h ${text}`
	return text
}

/**
 * Compare two object in recursive
 * @param  {object} x First object
 * @param  {object} y Second object
 * @return {boolean}   Is equal or not
 * @example
 * const a = {level1: {hello: "world"}}
 * const b = {level1: {hello: "world"}}
 * deepEqual(a, b) // => true
 */
export function deepEqual(x, y) {
	if (x === y) {
		return true
	} else if (
		typeof x == "object" &&
		x != null &&
		typeof y == "object" &&
		y != null
	) {
		if (Object.keys(x).length != Object.keys(y).length) return false

		for (var prop in x) {
			if (y.hasOwnProperty(prop)) {
				if (!deepEqual(x[prop], y[prop])) return false
			} else return false
		}

		return true
	} else return false
}
